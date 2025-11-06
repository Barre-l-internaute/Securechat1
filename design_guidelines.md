# Design Guidelines: Secure Messaging Application

## Design Approach
**Reference-Based Approach** - Drawing inspiration from Signal and Olvid's privacy-focused, minimalist aesthetics while creating a distinct identity that emphasizes security, simplicity, and trust.

### Core Design Principles
1. **Clarity Through Minimalism** - Remove visual noise to focus on conversations and security features
2. **Trust Through Transparency** - Design elements that communicate security without complexity
3. **Effortless Privacy** - Make security features feel natural, not intimidating
4. **Dark-First Interface** - Reduce eye strain for extended messaging sessions while emphasizing discretion

---

## Typography System

**Primary Font**: Inter (Google Fonts)
- **Headlines/App Title**: 600 weight, 24-32px
- **Section Headers**: 500 weight, 18-20px  
- **Message Text**: 400 weight, 15-16px
- **Metadata/Timestamps**: 400 weight, 13-14px, reduced opacity
- **Button Text**: 500 weight, 14-16px

**Secondary Font**: SF Mono or JetBrains Mono (for verification codes, encryption keys)
- **Verification Codes**: 500 weight, 18-20px, letter-spacing: 0.05em
- **Technical Details**: 400 weight, 13px

---

## Layout System

**Spacing Scale**: Use Tailwind units of **2, 3, 4, 6, 8, 12, 16** for consistent rhythm
- Component padding: p-4, p-6
- Section spacing: space-y-4, space-y-6
- Card/Container gaps: gap-3, gap-4
- Message bubbles: p-3, rounded-2xl

**Grid Structure**:
- **Desktop**: Two-column layout (sidebar: 320px fixed, chat area: flex-1)
- **Tablet**: Single column with slide-out sidebar (280px)
- **Mobile**: Full-width single view with navigation drawer

**Max Widths**:
- Message container: max-w-2xl mx-auto
- Settings panels: max-w-3xl
- Authentication forms: max-w-md

---

## Component Library

### Navigation & Layout
**App Shell**:
- Fixed left sidebar (320px) containing: app logo, conversation list, settings icon
- Main chat area with header (contact name, status, security indicator)
- Message input area pinned to bottom
- Sidebar uses border-r divider, no background differentiation

**Conversation List Item**:
- Avatar (40px circle) + Name + Last message preview + Timestamp
- Unread indicator: Small badge (8px circle) top-right of avatar
- Active state: Subtle left border accent (3px)
- Height: 72px, p-3

### Messaging Components
**Message Bubbles**:
- Sent messages: Align right, rounded-2xl with sharp bottom-right corner
- Received messages: Align left, rounded-2xl with sharp bottom-left corner  
- Max width: 65% of container
- Padding: px-4 py-3
- Timestamp: text-xs, mt-1, opacity-60

**Message Input**:
- Textarea with rounded-full container (min-h-12)
- Attachment icon (left), Send button (right) - both icon-only
- Grows vertically up to 120px max-height
- Focus state: Subtle border glow

**Attachment Preview**:
- Rounded-lg thumbnails (80px × 80px)
- Remove button (X) overlay on hover, top-right
- File type icon for non-image attachments

### Authentication Flows
**Email Verification**:
- Centered card (max-w-md)
- Large input for verification code (6 digits, monospace font)
- "Resend code" link below, text-sm
- Primary CTA button: w-full, h-12

**Profile Setup**:
- Avatar upload: 120px circle with camera icon overlay
- Username input with availability check indicator
- Optional status message field
- Skip/Continue CTAs at bottom

### Security Elements
**Encryption Indicator**:
- Lock icon + "Encrypted" text in chat header
- Small, subtle, always visible
- On tap: Show encryption details modal

**QR Code Contact Addition**:
- Full-screen camera view for scanning
- "Share your code" tab shows generated QR (240px)
- Manual invitation link below QR with copy button

**Message Deletion**:
- Swipe left on message reveals delete icon
- Confirmation modal: "Delete for me" vs "Delete for everyone"
- Subtle fade-out animation (300ms)

### Settings & Modals
**Settings Panel**:
- List items with icon (24px) + label + chevron
- Sections: Account, Privacy, Security, Notifications, About
- Toggle switches for binary options (h-6)

**Modal Overlays**:
- Backdrop: backdrop-blur-sm with reduced opacity
- Modal card: rounded-xl, max-w-lg, p-6
- Close button: top-right, icon-only

---

## Interaction Patterns

**Micro-interactions** (minimal, purposeful):
- Message send: Subtle scale + fade out from input (200ms)
- Typing indicator: Three dots pulse animation
- New message: Gentle slide-in from bottom (300ms ease-out)
- Pull-to-refresh: Spinner in conversation list

**Transitions**:
- Screen navigation: Slide left/right (250ms)
- Modal appearance: Fade + scale-up (200ms)
- No gratuitous animations - prioritize speed and clarity

---

## Icons
**Library**: Heroicons (Outline for primary actions, Solid for filled states)
- Lock, Shield, QR code, Camera, Paperclip, Microphone, Phone, Video, Settings, User, Trash

---

## Images
**Avatar Placeholders**: Gradient circles with user initials (when no photo uploaded)
**Empty States**: Simple line illustrations (320px) for:
- No conversations yet
- No search results
- Connection error

**No large hero images** - This is a utility app focused on messaging, not marketing content.

---

## Accessibility
- All icons paired with aria-labels
- Minimum touch targets: 44px × 44px
- Focus indicators: 2px outline with offset
- Screen reader announcements for new messages
- High contrast mode support: Ensure 4.5:1 minimum ratio