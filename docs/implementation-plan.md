# AdiPay — Implementation Plan

> **Goal:** Build a premium, Google Pay-inspired digital payment Android app using **React + Vite + Capacitor.js** with an **Express.js** backend and **PostgreSQL (Neon.tech)** database.

---

## 1. High-Level Architecture

```mermaid
graph TB
    subgraph "Android Device"
        A["Capacitor Shell - Android APK"] --> B["React SPA - Vite Build"]
        B --> C["Capacitor Plugins"]
    end

    subgraph "Cloud"
        D["Express.js API Server"]
        E["PostgreSQL - Neon.tech"]
        D --> E
    end

    B -- "HTTPS REST API" --> D
```

### Three-Tier Architecture

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Presentation** | React 19 + Vite 8 + Capacitor 7 | Native Android shell wrapping a blazing-fast SPA |
| **Application** | Express.js + Node.js | RESTful API, JWT auth, business logic |
| **Data** | PostgreSQL 16 (Neon.tech) | Serverless Postgres, ACID-compliant transactions |

---

## 2. Tech Stack — Final Decisions

### 2.1 Frontend (Client)

| Category | Choice | Rationale |
|----------|--------|-----------|
| **Framework** | React 19 | Component-based, massive ecosystem, ideal for SPA |
| **Build Tool** | Vite 8 | Already scaffolded, lightning-fast HMR |
| **Language** | TypeScript | Already configured, type safety |
| **Styling** | Tailwind CSS v4 | Already installed, utility-first, rapid prototyping |
| **Routing** | React Router v7 | Client-side routing for SPA navigation |
| **State Management** | Zustand | Lightweight, no boilerplate, perfect for auth/wallet state |
| **HTTP Client** | Axios | Interceptors for JWT, cleaner API than fetch |
| **Mobile Runtime** | Capacitor 7 | Native Android APK, access to native APIs |
| **Animations** | Framer Motion | Buttery-smooth page transitions and micro-animations |
| **Icons** | Lucide React | Clean, consistent icon set |
| **Fonts** | Google Fonts — Inter + DM Sans | Modern, clean, premium typography |

### 2.2 Backend (Server)

| Category | Choice | Rationale |
|----------|--------|-----------|
| **Runtime** | Node.js 22 LTS | Same language as frontend, async-friendly |
| **Framework** | Express.js | Lightweight, well-known, easy to scaffold |
| **Database** | PostgreSQL 16 via Neon.tech | Serverless, free tier, connection pooling |
| **ORM / Query** | Raw SQL with `pg` driver | Full control, matches SRS SQL schema, course requirement |
| **Auth** | JWT (jsonwebtoken) + bcryptjs | Stateless auth, password hashing per SRS |
| **Validation** | Zod | Runtime schema validation, TypeScript-first |
| **Security** | Helmet, CORS, rate-limiter | HTTP hardening |

### 2.3 Capacitor Plugins

| Plugin | Purpose |
|--------|---------|
| `@capacitor/status-bar` | Immersive status bar theming |
| `@capacitor/keyboard` | Handle soft keyboard events |
| `@capacitor/haptics` | Tactile feedback on transactions |
| `@capacitor/splash-screen` | Branded launch screen |
| `@capacitor/preferences` | Secure local storage for JWT |
| `@capacitor/toast` | Native toast notifications |

---

## 3. Project Structure

```
AdiPay/
├── client/                          # Frontend (React + Vite + Capacitor)
│   ├── android/                     # Capacitor Android project (auto-generated)
│   ├── public/
│   │   ├── favicon.svg
│   │   └── splash.png
│   ├── src/
│   │   ├── main.tsx                 # React entry point
│   │   ├── App.tsx                  # Root component with Router
│   │   ├── index.css                # Tailwind + global styles + design tokens
│   │   │
│   │   ├── components/              # Reusable UI components
│   │   │   ├── ui/                  # Primitives (Button, Input, Card, Avatar, etc.)
│   │   │   ├── layout/             # AppShell, BottomNav, Header, SafeArea
│   │   │   └── shared/             # TransactionCard, BalanceCard, UserAvatar
│   │   │
│   │   ├── pages/                   # Route-level page components
│   │   │   ├── SplashPage.tsx
│   │   │   ├── OnboardingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── SignupPage.tsx
│   │   │   ├── HomePage.tsx         # Main dashboard
│   │   │   ├── SendMoneyPage.tsx
│   │   │   ├── AddMoneyPage.tsx
│   │   │   ├── TransactionHistoryPage.tsx
│   │   │   ├── TransactionDetailPage.tsx
│   │   │   └── ProfilePage.tsx
│   │   │
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useBalance.ts
│   │   │   └── useTransactions.ts
│   │   │
│   │   ├── store/                   # Zustand stores
│   │   │   ├── authStore.ts
│   │   │   └── walletStore.ts
│   │   │
│   │   ├── services/                # API service layer
│   │   │   ├── api.ts               # Axios instance with interceptors
│   │   │   ├── authService.ts
│   │   │   ├── walletService.ts
│   │   │   └── transactionService.ts
│   │   │
│   │   ├── utils/                   # Helper functions
│   │   │   ├── formatCurrency.ts
│   │   │   ├── formatDate.ts
│   │   │   └── validators.ts
│   │   │
│   │   └── types/                   # TypeScript interfaces
│   │       ├── user.ts
│   │       ├── transaction.ts
│   │       └── api.ts
│   │
│   ├── capacitor.config.ts
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                          # Backend (Express.js)
│   ├── src/
│   │   ├── index.ts                 # Server entry point
│   │   ├── config/
│   │   │   ├── database.ts          # Neon.tech connection pool
│   │   │   └── env.ts               # Environment variables
│   │   ├── middleware/
│   │   │   ├── auth.ts              # JWT verification middleware
│   │   │   ├── validate.ts          # Zod validation middleware
│   │   │   └── errorHandler.ts      # Global error handler
│   │   ├── routes/
│   │   │   ├── auth.routes.ts       # /api/auth/*
│   │   │   ├── wallet.routes.ts     # /api/wallet/*
│   │   │   └── transaction.routes.ts # /api/transactions/*
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── wallet.controller.ts
│   │   │   └── transaction.controller.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── wallet.service.ts
│   │   │   └── transaction.service.ts
│   │   ├── db/
│   │   │   ├── migrations/          # SQL migration files
│   │   │   │   └── 001_initial_schema.sql
│   │   │   └── queries/             # Parameterized SQL queries
│   │   │       ├── users.ts
│   │   │       ├── accounts.ts
│   │   │       └── transactions.ts
│   │   ├── validators/              # Zod schemas
│   │   │   ├── auth.schema.ts
│   │   │   └── transaction.schema.ts
│   │   └── utils/
│   │       ├── jwt.ts
│   │       └── reference.ts         # Generate unique reference numbers
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── docs/
│   ├── srs.txt
│   └── implementation-plan.md       # This document
│
└── README.md
```

---

## 4. UI/UX Design — Google Pay-Inspired Premium Design

### 4.1 Design System and Tokens

```
Color Palette (Dark Mode Primary):
───────────────────────────────────────
Background Primary:     #0a0a0f    (Near-black with blue undertone)
Background Secondary:   #12121a    (Card surfaces)
Background Tertiary:    #1a1a28    (Elevated elements)

Accent Primary:         #4285F4    (Google Blue — actions, CTAs)
Accent Gradient:        #4285F4 to #34A853  (Blue to Green — success states)
Accent Send:            #EA4335    (Red — money sent)
Accent Receive:         #34A853    (Green — money received)
Accent Warning:         #FBBC04    (Yellow — warnings)

Text Primary:           #FFFFFF
Text Secondary:         #8B8FA3
Text Tertiary:          #5A5E72

Border:                 rgba(255, 255, 255, 0.06)
Glass:                  rgba(255, 255, 255, 0.04) with backdrop-blur

Typography:
───────────────────────────────────────
Headings:     DM Sans (700, 600)
Body:         Inter (400, 500, 600)
Mono/Amount:  DM Mono or tabular-nums
```

### 4.2 Screen-by-Screen Breakdown

---

#### Screen 1: Splash Screen
**Route:** `/splash` (auto-redirect after 2s)

```
┌─────────────────────────────┐
│                             │
│                             │
│                             │
│         [AdiPay Logo]       │
│      Animated gradient      │
│        pulse effect         │
│                             │
│        ● ● ● loading        │
│                             │
│                             │
└─────────────────────────────┘
```

- **Design:** Full-screen dark gradient (#0a0a0f to #12121a) with centered animated logo
- **Animation:** Logo scales up from 0.8 to 1.0 with fade-in, loading dots animate sequentially
- **Behavior:** Check for stored JWT — valid? Go to Home. No token? Go to Onboarding.

---

#### Screen 2: Onboarding (First-time users)
**Route:** `/onboarding`

```
┌─────────────────────────────┐
│                             │
│     [Illustration 1/3]      │
│     Full-width, 60% height  │
│                             │
│───────────────────────────  │
│   "Send money instantly"    │
│   Secure. Fast. Simple.     │
│                             │
│       ● ○ ○  (dots)         │
│                             │
│   [ Get Started — Blue ]    │
│   [ I have an account ]     │
└─────────────────────────────┘
```

- **Design:** 3-slide swipeable carousel with gesture navigation
- **Illustrations:** Abstract fintech-style gradients (generated)
- **Animations:** Parallax slide transitions, button entrance animations

---

#### Screen 3: Login Page
**Route:** `/login`

```
┌─────────────────────────────┐
│  ←                          │
│                             │
│   Welcome back              │
│   Sign in to continue       │
│                             │
│   ┌─────────────────────┐   │
│   │ Email or Phone      │   │
│   └─────────────────────┘   │
│   ┌─────────────────────┐   │
│   │ Password          👁 │   │
│   └─────────────────────┘   │
│                             │
│   [ Forgot Password? ]      │
│                             │
│   ┌─────────────────────┐   │
│   │    Sign In  →       │   │   ← Gradient blue button
│   └─────────────────────┘   │
│                             │
│   Don't have an account?    │
│   [ Sign Up ]               │
└─────────────────────────────┘
```

- **Inputs:** Glassmorphism card style, animated focus ring, floating labels
- **Button:** Full-width gradient (#4285F4 to #5B9EF7), haptic feedback on press
- **Validation:** Real-time inline validation with shake animation on error

---

#### Screen 4: Signup Page
**Route:** `/signup`

```
┌─────────────────────────────┐
│  ←                          │
│                             │
│   Create Account            │
│   Start sending money today │
│                             │
│   ┌─────────────────────┐   │
│   │ Full Name           │   │
│   └─────────────────────┘   │
│   ┌─────────────────────┐   │
│   │ Email               │   │
│   └─────────────────────┘   │
│   ┌─────────────────────┐   │
│   │ Phone Number        │   │
│   └─────────────────────┘   │
│   ┌─────────────────────┐   │
│   │ Password          👁 │   │
│   └─────────────────────┘   │
│   ┌─────────────────────┐   │
│   │ Confirm Pass      👁 │   │
│   └─────────────────────┘   │
│                             │
│   ┌─────────────────────┐   │
│   │   Create Account →  │   │
│   └─────────────────────┘   │
│                             │
│   Already have an account?  │
│   [ Sign In ]               │
└─────────────────────────────┘
```

- **Password strength:** Animated strength meter bar (red to yellow to green)
- **Phone:** Country code prefix auto-detected (+91 for India)
- **Success:** Confetti/particle animation on successful creation, auto-login

---

#### Screen 5: Home / Dashboard (Main Screen)
**Route:** `/home`

```
┌─────────────────────────────┐
│  Hi, Aditya       [Avatar]  │   ← Header with greeting
│─────────────────────────────│
│ ┌─────────────────────────┐ │
│ │  ₹12,450.00             │ │   ← Glassmorphic balance card
│ │  Available Balance      │ │      with gradient border
│ │                         │ │
│ │  [+ Add]    [↗ Send]    │ │   ← Quick action pills
│ └─────────────────────────┘ │
│                             │
│  ┌──────┐ ┌──────┐ ┌─────┐ │
│  │  📤  │ │  📥  │ │ 📊  │ │   ← Action grid (GPay style)
│  │ Send │ │ Req  │ │ Hist│ │
│  └──────┘ └──────┘ └─────┘ │
│                             │
│  Recent Transactions        │
│  ────────────────────────── │
│  ┌─────────────────────────┐│
│  │ 🔴 Sent to Parth       ││
│  │ ₹500.00    2 min ago   ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ 🟢 Received from Rohan ││
│  │ ₹1,200.00  1 hr ago    ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ 🔵 Added to wallet     ││
│  │ ₹5,000.00  Yesterday   ││
│  └─────────────────────────┘│
│                             │
│─────────────────────────────│
│  🏠    📤    📊    👤      │   ← Bottom navigation bar
│  Home  Send  History Profile│
└─────────────────────────────┘
```

- **Balance Card:** Glassmorphism with animated gradient border, number counter animation on load
- **Action Grid:** Circular icon buttons with ripple effect, Google Pay-inspired layout
- **Transactions:** Swipeable cards, pull-to-refresh, infinite scroll
- **Bottom Nav:** Frosted glass effect, animated active indicator dot

---

#### Screen 6: Send Money
**Route:** `/send`

```
┌─────────────────────────────┐
│  ←  Send Money              │
│─────────────────────────────│
│                             │
│  ┌─────────────────────────┐│
│  │ 🔍 Search by phone/email││  ← Search with debounced API
│  └─────────────────────────┘│
│                             │
│  Recent contacts:           │
│  [👤 Parth] [👤 Rohan] ... │  ← Horizontal scroll avatars
│                             │
│══════════════════════════════│
│  Sending to:                │
│  ┌─────────────────────────┐│
│  │ 👤  Parth Kondhawale    ││  ← Selected user card
│  │     +91 98765 43210     ││
│  └─────────────────────────┘│
│                             │
│        ₹ |                  │  ← Large centered amount input
│     ─────────────           │
│  [₹100] [₹500] [₹1000]    │  ← Quick amount chips
│                             │
│  ┌─────────────────────────┐│
│  │ Add a note (optional)   ││
│  └─────────────────────────┘│
│                             │
│  ┌─────────────────────────┐│
│  │    Send  ₹500  →        ││  ← Slide-to-send or tap
│  └─────────────────────────┘│
└─────────────────────────────┘
```

- **User Search:** Debounced search (300ms), skeleton loading, user not found state
- **Amount Input:** Large font (48px), auto-format with commas, max validation against balance
- **Quick Chips:** Animated selection, haptic feedback
- **Send Button:** Slide-to-confirm gesture OR double-tap confirmation
- **Success Screen:** Full-screen checkmark animation with confetti, transaction reference number

---

#### Screen 7: Add Money
**Route:** `/add-money`

```
┌─────────────────────────────┐
│  ←  Add Money               │
│─────────────────────────────│
│                             │
│  Current Balance            │
│  ₹12,450.00                │
│                             │
│        ₹ |                  │
│     ─────────────           │
│  [₹500] [₹1000] [₹5000]   │
│                             │
│  ┌─────────────────────────┐│
│  │   Add to Wallet  →     ││
│  └─────────────────────────┘│
│                             │
│  Note: This is a demo app. │
│  No real money is involved. │
└─────────────────────────────┘
```

- Since this is an academic project, "Add Money" simply credits the wallet balance
- Same premium input style as Send Money

---

#### Screen 8: Transaction History
**Route:** `/history`

```
┌─────────────────────────────┐
│  Transaction History        │
│─────────────────────────────│
│  [All] [Sent] [Received]   │  ← Filter tabs
│                             │
│  Today                      │
│  ┌─────────────────────────┐│
│  │ ↗ Parth     -₹500.00   ││
│  │   "Lunch"    2:30 PM    ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ ↙ Rohan    +₹1,200.00  ││
│  │   "Books"   11:00 AM    ││
│  └─────────────────────────┘│
│                             │
│  Yesterday                  │
│  ┌─────────────────────────┐│
│  │ + Wallet   +₹5,000.00  ││
│  │   "Added"   9:00 PM     ││
│  └─────────────────────────┘│
│                             │
│  March 28                   │
│  ┌─────────────────────────┐│
│  │ ↗ Amit      -₹200.00   ││
│  │   "Snacks"   4:15 PM    ││
│  └─────────────────────────┘│
│─────────────────────────────│
│  🏠    📤    📊    👤      │
└─────────────────────────────┘
```

- **Grouping:** Transactions grouped by date with sticky headers
- **Filters:** Animated tab switcher (All / Sent / Received / Added)
- **Color coding:** Red for debits, green for credits, blue for wallet adds
- **Tap to expand:** Opens TransactionDetailPage
- **Empty state:** Illustrated empty state with CTA

---

#### Screen 9: Transaction Detail
**Route:** `/transaction/:id`

```
┌─────────────────────────────┐
│  ←  Transaction Details     │
│─────────────────────────────│
│                             │
│       ┌─────────┐          │
│       │    ✓    │          │   ← Animated status icon
│       └─────────┘          │
│      Transaction            │
│      Successful             │
│                             │
│      ₹500.00               │   ← Large amount
│                             │
│  ────────────────────────── │
│  To          Parth K.       │
│  Date        30 Mar 2026    │
│  Time        2:30 PM        │
│  Ref No.     ADP-2026XXXX  │
│  Note        Lunch          │
│  Status      Completed      │
│  ────────────────────────── │
│                             │
│  ┌─────────────────────────┐│
│  │  Share Receipt          ││
│  └─────────────────────────┘│
└─────────────────────────────┘
```

---

#### Screen 10: Profile Page
**Route:** `/profile`

```
┌─────────────────────────────┐
│  Profile                    │
│─────────────────────────────│
│                             │
│       ┌─────────┐          │
│       │  Avatar │          │   ← Initials-based colored avatar
│       │   AJ    │          │
│       └─────────┘          │
│    Aditya Jamge             │
│    aditya@email.com         │
│    +91 98765 43210          │
│                             │
│  ────────────────────────── │
│  ┌─────────────────────────┐│
│  │ Edit Profile         →  ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ Change Password      →  ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ Dark Mode           [●] ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ About AdiPay         →  ││
│  └─────────────────────────┘│
│                             │
│  ┌─────────────────────────┐│
│  │ Sign Out                ││   ← Red text
│  └─────────────────────────┘│
│─────────────────────────────│
│  🏠    📤    📊    👤      │
└─────────────────────────────┘
```

---

### 4.3 Animations and Micro-Interactions

| Interaction | Animation | Library |
|-------------|-----------|---------|
| Page transitions | Slide left/right with fade | Framer Motion AnimatePresence |
| Balance display | Number counter roll-up | Custom + Framer Motion |
| Pull to refresh | Elastic spring pull indicator | Custom CSS |
| Button press | Scale 0.97 + haptic feedback | Framer Motion + Capacitor Haptics |
| Transaction cards | Staggered fade-in from bottom | Framer Motion staggerChildren |
| Send success | Full-screen checkmark + confetti | Framer Motion + Canvas confetti |
| Tab switching | Animated underline slider | Framer Motion layoutId |
| Bottom nav | Spring-animated active dot | Framer Motion |
| Error states | Shake animation on inputs | Framer Motion |
| Loading states | Skeleton shimmer cards | Tailwind CSS animation |

---

## 5. Backend API Design

### 5.1 Base URL

```
Production:  https://adipay-api.onrender.com/api  (or similar hosting)
Development: http://localhost:3000/api
```

### 5.2 Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/signup` | Register new user + create account | No |
| `POST` | `/api/auth/login` | Authenticate, return JWT | No |
| `GET`  | `/api/auth/me` | Get current user profile | Yes |
| `PUT`  | `/api/auth/profile` | Update user profile | Yes |
| `PUT`  | `/api/auth/password` | Change password | Yes |

#### Signup Request/Response

```json
// POST /api/auth/signup
// Request
{
  "full_name": "Aditya Jamge",
  "email": "aditya@example.com",
  "phone": "9876543210",
  "password": "SecurePass123!"
}

// Response (201)
{
  "success": true,
  "data": {
    "user": {
      "user_id": 1,
      "full_name": "Aditya Jamge",
      "email": "aditya@example.com",
      "phone": "9876543210"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Login Request/Response

```json
// POST /api/auth/login
// Request
{
  "identifier": "aditya@example.com",
  "password": "SecurePass123!"
}

// Response (200)
{
  "success": true,
  "data": {
    "user": { "..." : "..." },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 5.3 Wallet Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET`  | `/api/wallet/balance` | Get current balance | Yes |
| `POST` | `/api/wallet/add` | Add money to wallet | Yes |

#### Add Money

```json
// POST /api/wallet/add
// Request
{
  "amount": 5000.00
}

// Response (200)
{
  "success": true,
  "data": {
    "new_balance": 17450.00,
    "transaction": {
      "reference_no": "ADP-20260330-XXXX",
      "amount": 5000.00,
      "type": "CREDIT",
      "description": "Added to wallet"
    }
  }
}
```

### 5.4 Transaction Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/transactions/send` | Send money to user | Yes |
| `GET`  | `/api/transactions/history` | Get transaction history | Yes |
| `GET`  | `/api/transactions/:id` | Get transaction detail | Yes |
| `GET`  | `/api/transactions/recent-contacts` | Get recent recipients | Yes |

#### Send Money

```json
// POST /api/transactions/send
// Request
{
  "recipient_identifier": "9876543210",
  "amount": 500.00,
  "description": "Lunch money"
}

// Response (200)
{
  "success": true,
  "data": {
    "transaction": {
      "transaction_id": 42,
      "reference_no": "ADP-20260330-A7K3",
      "amount": 500.00,
      "transaction_type": "TRANSFER",
      "description": "Lunch money",
      "recipient": {
        "full_name": "Parth Kondhawale",
        "phone": "9876543210"
      },
      "created_at": "2026-03-30T14:30:00Z"
    },
    "new_balance": 11950.00
  }
}
```

#### Transaction History

```json
// GET /api/transactions/history?page=1&limit=20&filter=all
// Response (200)
{
  "success": true,
  "data": {
    "transactions": [
      {
        "transaction_id": 42,
        "reference_no": "ADP-20260330-A7K3",
        "amount": 500.00,
        "transaction_type": "TRANSFER",
        "direction": "SENT",
        "description": "Lunch money",
        "counterparty": {
          "full_name": "Parth Kondhawale",
          "phone": "9876543210"
        },
        "created_at": "2026-03-30T14:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "has_more": true
    }
  }
}
```

### 5.5 User Search Endpoint

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET`  | `/api/users/search?q=parth` | Search users by name/phone/email | Yes |

---

## 6. Database Design (Enhanced from SRS)

### 6.1 Enhanced Schema

```sql
-- ====================================
-- AdiPay Database Schema (Neon.tech)
-- ====================================

-- Users Table (from SRS + enhancements)
CREATE TABLE users (
    user_id     SERIAL PRIMARY KEY,
    full_name   VARCHAR(100) NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    phone       VARCHAR(15) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_color VARCHAR(7) DEFAULT '#4285F4',   -- For initials-based avatar
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Accounts Table (from SRS)
CREATE TABLE accounts (
    account_id  SERIAL PRIMARY KEY,
    user_id     INTEGER UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    balance     DECIMAL(15,2) DEFAULT 0.00 CHECK (balance >= 0),
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions Table (from SRS + enhancements)
CREATE TABLE transactions (
    transaction_id   SERIAL PRIMARY KEY,
    reference_no     VARCHAR(50) UNIQUE NOT NULL,
    sender_id        INTEGER REFERENCES accounts(account_id),
    receiver_id      INTEGER REFERENCES accounts(account_id),
    amount           DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    transaction_type VARCHAR(20) NOT NULL CHECK (
        transaction_type IN ('TRANSFER', 'CREDIT', 'DEBIT')
    ),
    status           VARCHAR(20) DEFAULT 'COMPLETED' CHECK (
        status IN ('COMPLETED', 'FAILED', 'PENDING')
    ),
    description      TEXT,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_transactions_sender ON transactions(sender_id);
CREATE INDEX idx_transactions_receiver ON transactions(receiver_id);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER accounts_updated_at
    BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 6.2 Transaction Processing (ACID Compliance)

```sql
-- Send Money Transaction (uses PostgreSQL transaction block)
BEGIN;
    -- 1. Lock sender row to prevent race conditions
    SELECT balance FROM accounts WHERE account_id = $sender_id FOR UPDATE;

    -- 2. Verify sufficient funds (application layer validates balance >= amount)

    -- 3. Debit sender
    UPDATE accounts SET balance = balance - $amount WHERE account_id = $sender_id;

    -- 4. Credit receiver
    UPDATE accounts SET balance = balance + $amount WHERE account_id = $receiver_id;

    -- 5. Log transaction
    INSERT INTO transactions (reference_no, sender_id, receiver_id, amount, transaction_type, description)
    VALUES ($reference_no, $sender_id, $receiver_id, $amount, 'TRANSFER', $description);
COMMIT;
-- On any failure: automatic ROLLBACK
```

> **Important:** The `FOR UPDATE` row lock on the sender's account prevents race conditions in concurrent transactions — this ensures ACID compliance as required by the SRS (Section 4.3).

---

## 7. Authentication Flow

```mermaid
sequenceDiagram
    participant App as AdiPay App
    participant Cap as Capacitor Preferences
    participant API as Express.js API
    participant DB as PostgreSQL

    Note over App: App Launch
    App->>Cap: Read stored JWT
    alt JWT exists
        App->>API: GET /api/auth/me (Bearer token)
        API->>DB: Validate user
        alt Token valid
            API-->>App: 200 User data
            App->>App: Navigate to Home
        else Token expired
            API-->>App: 401 Unauthorized
            App->>Cap: Clear JWT
            App->>App: Navigate to Login
        end
    else No JWT
        App->>App: Navigate to Onboarding
    end

    Note over App: Login Flow
    App->>API: POST /api/auth/login
    API->>DB: Verify credentials with bcrypt
    API-->>App: 200 + JWT token
    App->>Cap: Store JWT securely
    App->>App: Navigate to Home
```

### JWT Configuration

```
Algorithm:   HS256
Expiration:  7 days (mobile app)
Payload:     { user_id, email, iat, exp }
Storage:     Capacitor Preferences (encrypted on device)
```

---

## 8. Security Measures

| Threat | Mitigation |
|--------|-----------|
| SQL Injection | Parameterized queries with pg driver ($1, $2 placeholders) |
| Password theft | bcryptjs with 12 salt rounds |
| XSS | React auto-escapes, no dangerouslySetInnerHTML |
| CSRF | JWT in Authorization header (not cookies) |
| Brute force | Rate limiting (100 req/15min per IP on auth routes) |
| Man-in-middle | HTTPS only, HSTS headers via Helmet |
| Data exposure | Minimal API responses, no password_hash in responses |
| Token theft | Short-lived JWT, secure Capacitor Preferences storage |

---

## 9. Development Phases and Roadmap

### Phase 1: Project Setup and Foundation (Day 1-2)

- [ ] Initialize React in existing Vite project (add React + react-dom)
- [ ] Configure Tailwind CSS v4 design tokens (colors, typography, spacing)
- [ ] Install and configure React Router v7
- [ ] Install Zustand, Axios, Framer Motion, Lucide React
- [ ] Create base UI components (Button, Input, Card, Avatar)
- [ ] Build AppShell layout with BottomNav
- [ ] Set up Capacitor in the client project
- [ ] Initialize Express.js server project with TypeScript
- [ ] Configure Neon.tech PostgreSQL connection
- [ ] Run database migration (create tables)
- [ ] Set up environment variables (.env)

### Phase 2: Authentication (Day 3-4)

- [ ] **Backend:** Signup endpoint with bcrypt hashing + account auto-creation
- [ ] **Backend:** Login endpoint with JWT generation
- [ ] **Backend:** Auth middleware for protected routes
- [ ] **Backend:** GET /me endpoint
- [ ] **Frontend:** Splash screen with JWT check
- [ ] **Frontend:** Onboarding carousel (3 slides)
- [ ] **Frontend:** Login page with validation
- [ ] **Frontend:** Signup page with password strength meter
- [ ] **Frontend:** Auth store (Zustand) + Capacitor Preferences storage
- [ ] **Frontend:** Axios interceptor for automatic JWT attachment
- [ ] **Frontend:** Protected route wrapper component

### Phase 3: Core Features — Wallet and Transactions (Day 5-7)

- [ ] **Backend:** GET balance endpoint
- [ ] **Backend:** Add money endpoint with transaction logging
- [ ] **Backend:** Send money endpoint with ACID transaction
- [ ] **Backend:** User search endpoint (for recipient lookup)
- [ ] **Backend:** Transaction history endpoint with pagination and filters
- [ ] **Backend:** Transaction detail endpoint
- [ ] **Backend:** Recent contacts endpoint
- [ ] **Frontend:** Home dashboard with balance card + recent transactions
- [ ] **Frontend:** Send Money flow (search, amount, confirm, success)
- [ ] **Frontend:** Add Money page
- [ ] **Frontend:** Transaction History with grouped dates and filters
- [ ] **Frontend:** Transaction Detail page

### Phase 4: Profile and Polish (Day 8-9)

- [ ] **Frontend:** Profile page with user info
- [ ] **Backend:** Update profile endpoint
- [ ] **Backend:** Change password endpoint
- [ ] **Frontend:** Edit profile modal
- [ ] **Frontend:** Change password modal
- [ ] **Frontend:** Sign out flow (clear JWT, redirect)
- [ ] **Frontend:** Error boundaries and offline state
- [ ] **Frontend:** Empty states with illustrations
- [ ] **Frontend:** Pull-to-refresh on all data pages
- [ ] **Frontend:** Loading skeletons everywhere

### Phase 5: Animations and Premium Polish (Day 10-11)

- [ ] Add Framer Motion page transitions (slide + fade)
- [ ] Balance counter animation (roll-up numbers)
- [ ] Transaction card staggered entrance
- [ ] Send money success celebration screen (confetti)
- [ ] Button press micro-animations + haptic feedback
- [ ] Bottom nav animated indicator
- [ ] Skeleton shimmer loading states
- [ ] Pull-to-refresh spring animation
- [ ] Splash screen animated logo
- [ ] Tab switch animated underline

### Phase 6: Capacitor Build and Deployment (Day 12-13)

- [ ] Configure capacitor.config.ts (app ID, server URL, plugins)
- [ ] Configure Android project (splash screen, icon, status bar color)
- [ ] Generate app icons (all sizes) and splash screen
- [ ] Build production Vite bundle
- [ ] Sync Capacitor: npx cap sync android
- [ ] Test on Android emulator
- [ ] Test on physical Android device
- [ ] Generate signed APK / AAB
- [ ] Deploy backend to cloud (Render / Railway)
- [ ] Final end-to-end testing

---

## 10. Environment Variables

### Server .env

```env
# Server
PORT=3000
NODE_ENV=development

# Database (Neon.tech)
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/adipay?sslmode=require

# JWT
JWT_SECRET=your-strong-secret-key-here
JWT_EXPIRY=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Client (Vite env)

```env
# API Base URL
VITE_API_URL=http://localhost:3000/api
```

---

## 11. Key Design Decisions and Rationale

| Decision | Why |
|----------|-----|
| **React over vanilla TS** | SRS mentions Next.js (React-based); React gives us component model, state management, and routing — critical for a multi-page app with shared state |
| **Vite SPA (not Next.js)** | App runs inside Capacitor — no server-side rendering needed. Vite SPA is faster, simpler, and better suited for Capacitor packaging |
| **Separate Express backend** | Cleaner separation of concerns; can be deployed independently; no Next.js API routes overhead in mobile context |
| **Raw SQL over ORM** | Course requirement is DBMS — showing raw SQL demonstrates understanding. Also simpler for 3 tables |
| **Dark mode first** | Google Pay uses dark mode, premium feel, easier on eyes for mobile, modern trend |
| **Tailwind v4** | Already installed in the project, utility-first approach enables rapid premium UI development |
| **Capacitor over React Native** | SRS specifies Capacitor.js; web-first approach with full access to native APIs |

---

> **Note:** This is an academic project with no real banking integration. The "Add Money" feature simulates adding funds to a demo wallet. All transactions are between registered platform users only.
