# Cyber Guardian AI — Frontend

**"See It. Hear It. Verify It."**

A production-quality cybersecurity SaaS frontend built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Framer Motion, and Lucide icons. Includes a full user dashboard, a **separately-authenticated admin panel**, 8 specialized scanners, an AI chat interface, a Cyber Academy learning platform, and complete public/auth pages — all using mock data (no backend).

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript 5
- **Styling:** Tailwind CSS 4 with custom cyber theme (dark mode, glassmorphism, neon palette)
- **UI Library:** shadcn/ui (New York style) + Lucide React icons
- **Animations:** Framer Motion
- **Charts:** Recharts
- **State:** React hooks + hash-based SPA router (no backend dependency)
- **Auth:** Mock frontend-only auth using `useSyncExternalStore` + localStorage (ready for Laravel RBAC)

## Quick Start

```bash
# 1. Install dependencies
bun install
# or: npm install / pnpm install

# 2. Run the development server
bun run dev
# or: npm run dev

# 3. Open http://localhost:3000
```

The app uses hash-based routing (`/#/dashboard`, `/#/admin/login`, etc.) so all pages are served from the single Next.js `/` route.

## Build

```bash
bun run build
bun run start
```

## Lint

```bash
bun run lint
```

## 🔐 Authentication & Access Separation

The User Interface and Admin Interface are **completely separated**. There is no direct navigation path between them.

### User Area
- **Login:** `/#/login` (any email/password works — mock)
- **After login:** Redirects to `/#/dashboard`
- **Logout:** Redirects to `/#/login`
- **Sidebar contains:** Dashboard, 8 Scanners, Reports, AI Chat, Cyber Academy, Notifications, Profile, Settings, Help Center, Logout
- **No admin links** — users can never reach `/admin/*` from the user dashboard

### Admin Area
- **Login:** `/#/admin/login` (the ONLY entry point to the admin area)
- **Mock credentials:**
  - Email: `admin@cyberguardian.ai`
  - Password: `Admin123!`
- **After login:** Redirects to `/#/admin/dashboard`
- **Logout:** Clears admin session, redirects to `/#/admin/login`
- **Route protection:** All `/admin/*` routes (except `/admin/login`) are wrapped in `<AdminGuard>` — unauthenticated users are automatically redirected to `/admin/login`
- **No "Back to App" link** — admin and user areas are fully isolated

### RBAC Roles (Future Backend)
The frontend is structured to support these roles when Laravel RBAC is implemented:
- **Super Admin** — full access to every admin module
- **Admin** — administrative access to most modules
- **Moderator** — can moderate content, users, scans
- **User** — standard user (no admin access)

Role types are defined in `src/lib/routes.ts` (`UserRole` type + `USER_ROLES` array). The mock auth currently always authenticates as "Super Admin" for demo purposes. The `useAdminAuth` hook (`src/hooks/use-admin-auth.ts`) is designed to stay stable when replaced with real API calls.

## Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # Root layout (dark mode, fonts, toasters)
│   ├── page.tsx              # Entry point → renders <Router />
│   └── globals.css           # Cyber theme (glassmorphism, neon, animations)
├── components/
│   ├── Router.tsx            # Hash router (public/auth/user-dashboard/admin with guard)
│   ├── layout/               # PublicLayout, AuthLayout, DashboardLayout, AdminLayout + sidebars/topbars
│   ├── shared/               # Reusable: GlassCard, CyberButton, UploadArea, StatCard, BackButton, AdminGuard, etc.
│   └── pages/
│       ├── public/           # 9 public pages
│       ├── auth/             # 5 user auth pages
│       ├── dashboard/        # 10 user dashboard pages
│       ├── scanners/         # 8 scanner pages + ProcessingScreen
│       └── admin/            # 12 admin pages + AdminLoginPage
├── hooks/
│   ├── use-router.ts         # Hash router with back/forward history support
│   ├── use-admin-auth.ts     # Mock admin auth (useSyncExternalStore + localStorage)
│   ├── use-toast.ts          # Toast notifications
│   └── use-mobile.ts         # Mobile detection
├── lib/
│   ├── routes.ts             # Central route registry + sidebar nav + RBAC role types
│   ├── mock-data/
│   │   ├── index.ts          # User-facing mock data
│   │   └── admin.ts          # Admin mock data
│   ├── utils.ts              # cn() helper
│   └── db.ts                 # Prisma client (unused — frontend-only)
├── types/
│   └── index.ts              # TypeScript interfaces
└── styles/
```

## Pages Overview

### Public (9 pages)
- Landing, Features, About, Cyber Academy (overview), Contact, FAQ, Privacy Policy, Terms of Service, 404

### User Auth (5 pages, UI only)
- Login, Register, Forgot Password, Reset Password, Verify Email

### User Dashboard (10 pages)
- Dashboard (stats, charts, recent scans, security score)
- 8 Scanners: AI Universal, URL, Email, Image, Document, Audio, Video, QR
- Reports (filter/search/paginate) + Report Details (full threat report)
- AI Chat (ChatGPT-style with mock responses)
- Cyber Academy (8 tracks) + Learning Module (with quiz)
- Notifications, Profile, Settings, Help Center
- Processing Screen (animated 9-step scan pipeline)

### Admin Panel (12 pages + login, at `/admin/*`)
- **Admin Login** (`/admin/login`) — separate from user login, mock credentials
- Admin Dashboard (8 stat cards, 4 charts, system components)
- User Management (table with action menus + confirmation dialogs)
- Scan Management (filterable by 7 scanner types)
- Reports (sortable table + slide-out details drawer)
- Analytics (8 charts + geographic distribution)
- AI Usage (Gemma stats, token usage, system components)
- Cyber Academy Management (lessons/categories/quizzes CRUD UI)
- Notifications (compose announcements with audience/channel selection)
- Roles & Permissions (interactive permission matrix)
- Audit Logs (filterable table)
- System Settings (7 tabs: General, Security, Appearance, Notifications, AI Config, Backup, Maintenance Mode)
- Admin Profile (with activity timeline + privileges)

## Navigation

- **Hash-based router** — all navigation uses `#/path` URLs
- **Universal Back button** — every sub-page has a Back button that uses browser history (with fallback)
- **Browser back/forward** — works naturally via `hashchange` events
- **Sidebar navigation** — user and admin sidebars are completely separate
- **Breadcrumbs** — on all dashboard and admin pages, clickable with proper navigation
- **Mobile responsive** — sidebars collapse to drawers on mobile

## Design System

- **Theme:** Dark mode by default with cyber grid background
- **Colors:** Neon blue (#00d4ff) for user app, purple (#a855f7) for admin — same palette family
- **Glassmorphism:** `glass`, `glass-strong`, `glass-card`, `glass-hover` utility classes
- **Components:** GlassCard, CyberButton, StatCard, ThreatBadge, AnimatedCounter, UploadArea, BackButton, AdminGuard, DynamicIcon, PageTransition, DashboardHeader, AdminHeader
- **Animations:** Framer Motion throughout (page transitions, hover effects, floating icons, loading skeletons, typing dots, scan lines, pulse glows)

## Mock Data

All data is mock — no backend, database, or API calls. The app is structured so a Laravel REST API + MySQL database + Google Gemma AI can be integrated later by replacing the mock-data imports with real API calls. TypeScript interfaces in `src/types/index.ts` define the data contracts.

## Notes

- The `prisma/` schema and `src/lib/db.ts` are included but unused (frontend-only build)
- The `Caddyfile` is for the sandbox gateway — not needed for local development
- `.env*` files are excluded from the ZIP — create a `.env` with `DATABASE_URL="file:./db/custom.db"` if you want to use Prisma
