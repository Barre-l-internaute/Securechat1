// Referenced from javascript_database blueprint - adapted for messaging app
import {
  users,
  verificationCodes,
  contacts,
  messages,
  type User,
  type InsertUser,
  type VerificationCode,
  type InsertVerificationCode,
  type Contact,
  type InsertContact,
  type Message,
  type InsertMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByInvitationCode(code: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;

  // Verification code operations
  createVerificationCode(code: InsertVerificationCode): Promise<VerificationCode>;
  getVerificationCode(email: string, code: string): Promise<VerificationCode | undefined>;
  markCodeAsUsed(id: string): Promise<void>;

  // Contact operations
  getContacts(userId: string): Promise<Contact[]>;
  getContactWithUser(userId: string): Promise<any[]>;
  createContact(contact: InsertContact): Promise<Contact>;
  checkContactExists(userId: string, contactId: string): Promise<boolean>;

  // Message operations
  getMessages(userId: string, contactId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  deleteMessage(messageId: string, userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByInvitationCode(code: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.invitationCode, code));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Verification code operations
  async createVerificationCode(insertCode: InsertVerificationCode): Promise<VerificationCode> {
    const [code] = await db
      .insert(verificationCodes)
      .values(insertCode)
      .returning();
    return code;
  }

  async getVerificationCode(email: string, code: string): Promise<VerificationCode | undefined> {
    const [result] = await db
      .select()
      .from(verificationCodes)
      .where(
        and(
          eq(verificationCodes.email, email),
          eq(verificationCodes.code, code),
          eq(verificationCodes.used, false)
        )
      );
    return result || undefined;
  }

  async markCodeAsUsed(id: string): Promise<void> {
    await db
      .update(verificationCodes)
      .set({ used: true })
      .where(eq(verificationCodes.id, id));
  }

  // Contact operations
  async getContacts(userId: string): Promise<Contact[]> {
    return await db
      .select()
      .from(contacts)
      .where(eq(contacts.userId, userId));
  }

  async getContactWithUser(userId: string): Promise<any[]> {
    const results = await db
      .select({
        id: contacts.id,
        userId: contacts.userId,
        contactId: contacts.contactId,
        createdAt: contacts.createdAt,
        contact: users,
      })
      .from(contacts)
      .innerJoin(users, eq(contacts.contactId, users.id))
      .where(eq(contacts.userId, userId));
    return results;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db
      .insert(contacts)
      .values(insertContact)
      .returning();
    return contact;
  }

  async checkContactExists(userId: string, contactId: string): Promise<boolean> {
    const [result] = await db
      .select()
      .from(contacts)
      .where(
        and(
          eq(contacts.userId, userId),
          eq(contacts.contactId, contactId)
        )
      );
    return !!result;
  }

  // Message operations
  async getMessages(userId: string, contactId: string): Promise<Message[]> {
    const msgs = await db
      .select()
      .from(messages)
      .where(
        and(
          or(
            and(
              eq(messages.senderId, userId),
              eq(messages.receiverId, contactId),
              eq(messages.deletedForSender, false)
            ),
            and(
              eq(messages.senderId, contactId),
              eq(messages.receiverId, userId),
              eq(messages.deletedForReceiver, false)
            )
          )
        )
      )
      .orderBy(messages.sentAt);
    return msgs;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const [message] = await db
      .select()
      .from(messages)
      .where(eq(messages.id, messageId));

    if (!message) {
      throw new Error("Message not found");
    }

    if (message.senderId === userId) {
      await db
        .update(messages)
        .set({ deletedForSender: true })
        .where(eq(messages.id, messageId));
    } else if (message.receiverId === userId) {
      await db
        .update(messages)
        .set({ deletedForReceiver: true })
        .where(eq(messages.id, messageId));
    } else {
      throw new Error("Unauthorized");
    }
  }
}

export const storage = new DatabaseStorage();
