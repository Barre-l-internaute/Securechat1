# SecureChat - Ultra-Secure Anonymous Messaging Application

## Overview

SecureChat is a privacy-focused, end-to-end encrypted messaging application inspired by Signal and Olvid. The application prioritizes security, anonymity, and user privacy while maintaining a clean, minimalist interface. Users authenticate exclusively via email (no phone number required), add contacts through invitation codes or QR codes, and communicate through encrypted messages with support for ephemeral content.

**Core Features:**
- Email-only authentication with verification codes
- Contact management via invitation codes (no public directory)
- Real-time encrypted messaging with WebSocket support
- Ephemeral messages with auto-deletion capabilities
- Dark-first, minimalist UI design
- Session-based authentication
- No user tracking or metadata logging

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React with TypeScript
- Vite as build tool and development server
- Wouter for client-side routing
- TanStack Query (React Query) for server state management
- Shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for styling with custom dark-first design system

**Design System:**
- Custom Tailwind configuration with HSL color variables for theme flexibility
- Dark mode as default with comprehensive color palette
- Inter font family for UI text, JetBrains Mono for technical elements
- Responsive layout system supporting desktop (two-column), tablet (slide-out sidebar), and mobile (full-width) views
- Component spacing based on consistent scale (2, 3, 4, 6, 8, 12, 16 units)

**State Management Approach:**
- Server state managed through React Query with custom query client
- Session-based authentication state
- Real-time message updates via WebSocket integration
- Optimistic UI updates for message sending

**Key UI Components:**
- Authentication flow: EmailAuthForm → VerifyCodeForm → ProfileSetupForm
- Chat interface: AppSidebar, ChatHeader, MessageBubble, MessageInput
- Contact management: AddContactModal with invitation code sharing
- Comprehensive Radix UI component library for accessibility

### Backend Architecture

**Technology Stack:**
- Node.js with Express framework
- TypeScript for type safety
- Express-session for session management
- WebSocket (ws) for real-time messaging
- Bcrypt for password hashing

**API Design:**
- RESTful endpoints for CRUD operations
- Session-based authentication (no JWT tokens)
- WebSocket server for real-time message delivery
- Middleware pattern for authentication checks

**Core API Endpoints:**
- `/api/auth/*` - Authentication flow (send-code, verify-code, register, login, logout)
- `/api/contacts/*` - Contact management (list, add by invitation code)
- `/api/messages/*` - Message operations (fetch, send, delete)
- `/api/auth/me` - Current user session information

**Security Measures:**
- Password hashing with bcryptjs
- Session secrets for cookie signing
- Email verification codes (6-digit, time-limited)
- Unique invitation codes for contact discovery
- No public user search or directory

**WebSocket Implementation:**
- Real-time bidirectional communication for instant message delivery
- User presence tracking
- Message delivery confirmation
- Connection management with user session mapping

### Data Storage

**Database Technology:**
- PostgreSQL via Neon serverless
- Drizzle ORM for type-safe database queries
- Connection pooling for performance

**Schema Design:**

**Users Table:**
- Email-based authentication (unique constraint)
- Username (unique, display name)
- Hashed password
- Optional avatar URL and status message
- Unique invitation code for contact discovery
- UUID primary keys

**Verification Codes Table:**
- Email and 6-digit code pairs
- Expiration timestamps
- Used flag to prevent reuse
- Automatic cleanup for expired codes

**Contacts Table:**
- Bidirectional relationship between users (userId ↔ contactId)
- Cascade deletion when users are removed
- Represents approved connections

**Messages Table:**
- Sender and receiver foreign keys
- Encrypted content (stored as text)
- Soft deletion flags (deletedForSender, deletedForReceiver)
- Timestamp for message ordering

**Data Access Pattern:**
- Repository pattern via IStorage interface
- Separation of concerns between routes and database logic
- Type-safe queries using Drizzle's query builder
- Efficient filtering for message retrieval (messages visible to both parties)

### Authentication & Authorization

**Email-Based Authentication Flow:**
1. User provides email address
2. System generates 6-digit verification code
3. Code sent via email (currently console-logged for development)
4. User verifies code within expiration window
5. New users complete profile setup (username, password)
6. Returning users authenticate with email + code
7. Session cookie established upon successful authentication

**Session Management:**
- Express-session with secure cookie configuration
- Session data includes userId and email
- Server-side session storage (can be configured for PostgreSQL via connect-pg-simple)
- Session secret from environment variables

**Authorization Pattern:**
- Middleware function `requireAuth` checks session presence
- Applied to protected routes (contacts, messages, user info)
- 401 Unauthorized response for unauthenticated requests

### Real-Time Communication

**WebSocket Architecture:**
- Dedicated WebSocket server running alongside Express HTTP server
- User-to-WebSocket connection mapping for message routing
- Automatic connection cleanup on disconnect
- Message broadcasting to online recipients

**Message Flow:**
1. User sends message via REST API
2. Message persisted to database
3. Server checks if recipient is online via WebSocket map
4. If online, message pushed immediately via WebSocket
5. If offline, message queued for retrieval on next fetch

## External Dependencies

### Core Framework Dependencies

**Frontend:**
- `react` & `react-dom` - UI framework
- `@tanstack/react-query` - Server state management and caching
- `wouter` - Lightweight routing library
- `vite` - Build tool and dev server
- `tailwindcss` - Utility-first CSS framework

**Backend:**
- `express` - Web application framework
- `ws` - WebSocket server implementation
- `express-session` - Session middleware
- `bcryptjs` - Password hashing

### Database & ORM

- `@neondatabase/serverless` - Serverless PostgreSQL client for Neon
- `drizzle-orm` - TypeScript ORM for type-safe queries
- `drizzle-kit` - Migration and schema management tools
- `connect-pg-simple` - PostgreSQL session store for express-session

### UI Component Libraries

- `@radix-ui/*` - Headless accessible component primitives (25+ components including Dialog, Dropdown, Tabs, Toast, etc.)
- `cmdk` - Command menu component
- `lucide-react` - Icon library
- `class-variance-authority` - Variant-based component styling
- `tailwind-merge` & `clsx` - Tailwind class merging utilities

### Form Handling & Validation

- `react-hook-form` - Form state management
- `@hookform/resolvers` - Validation resolver for Zod
- `zod` - Schema validation library
- `drizzle-zod` - Generate Zod schemas from Drizzle tables

### Development Tools

- `typescript` - Type safety
- `tsx` - TypeScript execution for Node.js
- `esbuild` - Bundling for production server
- `@replit/vite-plugin-*` - Replit-specific development plugins

### Third-Party Services

**Email Service (Production):**
- Currently mocked with console logging
- Intended integration: SendGrid, AWS SES, or similar transactional email service
- Required for verification code delivery

**Hosting Environment:**
- Designed for Replit deployment
- Compatible with Vercel, Railway, or similar Node.js platforms
- Requires PostgreSQL database provisioning (Neon recommended)

### Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (required)
- `SESSION_SECRET` - Secret for session cookie signing (defaults to dev value)
- `NODE_ENV` - Environment mode (development/production)