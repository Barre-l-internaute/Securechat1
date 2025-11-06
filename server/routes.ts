// Referenced from javascript_websocket blueprint for WebSocket setup
import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import session from "express-session";

const SESSION_SECRET = process.env.SESSION_SECRET || "dev-secret-change-in-production";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    email?: string;
  }
}

// Helper to generate 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper to generate unique invitation code
function generateInvitationCode(): string {
  return randomBytes(8).toString("hex");
}

// Mock email sending (in production, use a real email service)
async function sendEmail(to: string, subject: string, body: string) {
  console.log(`📧 Email to ${to}:`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);
  console.log("---");
}

// Middleware to check authentication
function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(
    session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      },
    })
  );

  // Auth endpoints
  app.post("/api/auth/send-code", async (req: Request, res: Response) => {
    try {
      const { email } = z.object({ email: z.string().email() }).parse(req.body);

      const existingUser = await storage.getUserByEmail(email);

      const code = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await storage.createVerificationCode({
        email,
        code,
        expiresAt,
        used: false,
      });

      await sendEmail(
        email,
        "SecureChat Verification Code",
        `Your verification code is: ${code}\n\nThis code will expire in 10 minutes.`
      );

      if (existingUser) {
        return res.json({ message: "User already registered. Please verify to login." });
      }

      res.json({ message: "Verification code sent" });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to send code" });
    }
  });

  app.post("/api/auth/verify-code", async (req: Request, res: Response) => {
    try {
      const { email, code } = z
        .object({ email: z.string().email(), code: z.string().length(6) })
        .parse(req.body);

      const verificationCode = await storage.getVerificationCode(email, code);

      if (!verificationCode) {
        return res.status(400).json({ error: "Invalid or expired verification code" });
      }

      if (new Date() > verificationCode.expiresAt) {
        return res.status(400).json({ error: "Verification code expired" });
      }

      await storage.markCodeAsUsed(verificationCode.id);

      const existingUser = await storage.getUserByEmail(email);

      if (existingUser) {
        req.session.userId = existingUser.id;
        req.session.email = email;
        return res.json({ needsProfile: false, user: existingUser });
      }

      req.session.email = email;
      res.json({ needsProfile: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Verification failed" });
    }
  });

  app.post("/api/auth/complete-registration", async (req: Request, res: Response) => {
    try {
      const { email, username, password, status } = z
        .object({
          email: z.string().email(),
          username: z.string().min(3).max(20),
          password: z.string().min(8),
          status: z.string().max(100).optional(),
        })
        .parse(req.body);

      if (!req.session.email || req.session.email !== email) {
        return res.status(401).json({ error: "Email not verified" });
      }

      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ error: "Username already taken" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const invitationCode = generateInvitationCode();

      const user = await storage.createUser({
        email,
        username,
        password: hashedPassword,
        status: status || null,
        avatarUrl: null,
        invitationCode,
      });

      req.session.userId = user.id;
      res.json({ user });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Registration failed" });
    }
  });

  app.get("/api/auth/me", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  // Contact endpoints
  app.get("/api/contacts", requireAuth, async (req: Request, res: Response) => {
    try {
      const contacts = await storage.getContactWithUser(req.session.userId!);
      res.json(contacts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/contacts", requireAuth, async (req: Request, res: Response) => {
    try {
      const { invitationCode } = z
        .object({ invitationCode: z.string() })
        .parse(req.body);

      const contactUser = await storage.getUserByInvitationCode(invitationCode);

      if (!contactUser) {
        return res.status(404).json({ error: "Invalid invitation code" });
      }

      if (contactUser.id === req.session.userId) {
        return res.status(400).json({ error: "Cannot add yourself as a contact" });
      }

      const exists = await storage.checkContactExists(req.session.userId!, contactUser.id);
      if (exists) {
        return res.status(400).json({ error: "Contact already exists" });
      }

      const contact = await storage.createContact({
        userId: req.session.userId!,
        contactId: contactUser.id,
      });

      // Create reverse contact
      const reverseExists = await storage.checkContactExists(contactUser.id, req.session.userId!);
      if (!reverseExists) {
        await storage.createContact({
          userId: contactUser.id,
          contactId: req.session.userId!,
        });
      }

      res.json(contact);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to add contact" });
    }
  });

  // Message endpoints
  app.get("/api/messages/:contactId", requireAuth, async (req: Request, res: Response) => {
    try {
      const { contactId } = req.params;

      const isContact = await storage.checkContactExists(req.session.userId!, contactId);
      if (!isContact) {
        return res.status(403).json({ error: "Not a contact" });
      }

      const messages = await storage.getMessages(req.session.userId!, contactId);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/messages", requireAuth, async (req: Request, res: Response) => {
    try {
      const { receiverId, content } = z
        .object({
          receiverId: z.string(),
          content: z.string().min(1),
        })
        .parse(req.body);

      const isContact = await storage.checkContactExists(req.session.userId!, receiverId);
      if (!isContact) {
        return res.status(403).json({ error: "Not a contact" });
      }

      const message = await storage.createMessage({
        senderId: req.session.userId!,
        receiverId,
        content,
      });

      // Notify via WebSocket
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: "message",
              message,
            })
          );
        }
      });

      res.json(message);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to send message" });
    }
  });

  app.delete("/api/messages/:messageId", requireAuth, async (req: Request, res: Response) => {
    try {
      const { messageId } = req.params;

      await storage.deleteMessage(messageId, req.session.userId!);

      res.json({ message: "Message deleted" });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to delete message" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server setup - referenced from javascript_websocket blueprint
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on("connection", (ws: WebSocket) => {
    console.log("WebSocket client connected");

    ws.on("message", (message: string) => {
      console.log("Received:", message);
    });

    ws.on("close", () => {
      console.log("WebSocket client disconnected");
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  return httpServer;
}
