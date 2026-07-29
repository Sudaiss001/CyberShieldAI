// ============================================
// Central route registry for CyberShield AI
// All "pages" are hash routes (e.g. #/dashboard)
// ============================================

export const ROUTES = {
  // Public
  home: "/",
  features: "/features",
  about: "/about",
  academy: "/academy",
  contact: "/contact",
  faq: "/faq",
  privacy: "/privacy",
  terms: "/terms",
  notFound: "/404",

  // Auth (user)
  login: "/login",
  register: "/register",
  forgot: "/forgot-password",
  reset: "/reset-password",
  verifyEmail: "/verify-email",

  // User Dashboard
  dashboard: "/dashboard",
  aiScanner: "/scanners/ai",
  urlScanner: "/scanners/url",
  emailScanner: "/scanners/email",
  imageScanner: "/scanners/image",
  documentScanner: "/scanners/document",
  audioScanner: "/scanners/audio",
  videoScanner: "/scanners/video",
  qrScanner: "/scanners/qr",
  reports: "/reports",
  reportDetails: "/reports/",
  aiChat: "/chat",
  academyDashboard: "/learn",
  learningModule: "/learn/module",
  notifications: "/notifications",
  profile: "/profile",
  settings: "/settings",
  help: "/help",
  processing: "/processing",

  // Admin (separate auth & layout)
  admin: "/admin",
  adminLogin: "/admin/login",
  adminDashboard: "/admin/dashboard",
  adminUsers: "/admin/users",
  adminScans: "/admin/scans",
  adminReports: "/admin/reports",
  adminAnalytics: "/admin/analytics",
  adminAiUsage: "/admin/ai-usage",
  adminAcademy: "/admin/academy",
  adminNotifications: "/admin/notifications",
  adminRoles: "/admin/roles",
  adminAuditLogs: "/admin/audit-logs",
  adminSettings: "/admin/settings",
  adminProfile: "/admin/profile",
} as const;

export type RouteKey = keyof typeof ROUTES;

// ============================================
// RBAC Role Types (for future Laravel backend integration)
// The frontend is structured to support these roles. Backend RBAC
// logic is NOT implemented — this is just UI/routing preparation.
// ============================================
export type UserRole = "Super Admin" | "Admin" | "Moderator" | "User";

export const USER_ROLES: { value: UserRole; label: string; description: string; color: string }[] = [
  { value: "Super Admin", label: "Super Admin", description: "Full system access with no restrictions", color: "#ef4444" },
  { value: "Admin", label: "Admin", description: "Administrative access to most modules", color: "#a855f7" },
  { value: "Moderator", label: "Moderator", description: "Can moderate content, users, and scans", color: "#f59e0b" },
  { value: "User", label: "User", description: "Standard user access to scanners and reports", color: "#00d4ff" },
];

// Public navigation (header)
export const PUBLIC_NAV = [
  { label: "Home", path: ROUTES.home },
  { label: "Features", path: ROUTES.features },
  { label: "Solutions", path: ROUTES.features },
  { label: "Cyber Academy", path: ROUTES.academy },
  { label: "About", path: ROUTES.about },
  { label: "Contact", path: ROUTES.contact },
];

// ============================================
// USER sidebar navigation
// Contains NO admin links. Users can never reach /admin/* from here.
// ============================================
export const SIDEBAR_NAV = [
  { label: "Dashboard", path: ROUTES.dashboard, icon: "LayoutDashboard", section: "main" },
  { label: "AI Scanner", path: ROUTES.aiScanner, icon: "Sparkles", section: "scanners" },
  { label: "URL Scanner", path: ROUTES.urlScanner, icon: "Link2", section: "scanners" },
  { label: "Email Scanner", path: ROUTES.emailScanner, icon: "Mail", section: "scanners" },
  { label: "Image Scanner", path: ROUTES.imageScanner, icon: "Image", section: "scanners" },
  { label: "Document Scanner", path: ROUTES.documentScanner, icon: "FileText", section: "scanners" },
  { label: "Audio Scanner", path: ROUTES.audioScanner, icon: "AudioLines", section: "scanners" },
  { label: "Video Scanner", path: ROUTES.videoScanner, icon: "Video", section: "scanners" },
  { label: "QR Scanner", path: ROUTES.qrScanner, icon: "QrCode", section: "scanners" },
  { label: "Reports", path: ROUTES.reports, icon: "FileBarChart", section: "main" },
  { label: "AI Chat", path: ROUTES.aiChat, icon: "MessageSquare", section: "main" },
  { label: "Cyber Academy", path: ROUTES.academyDashboard, icon: "GraduationCap", section: "main" },
  { label: "Notifications", path: ROUTES.notifications, icon: "Bell", section: "account", badge: 5 },
  { label: "Profile", path: ROUTES.profile, icon: "User", section: "account" },
  { label: "Settings", path: ROUTES.settings, icon: "Settings", section: "account" },
] as const;

// User sidebar footer — Help Center + Logout (redirects to /login)
// NOTE: No "Admin Panel" link. Users have no path to /admin/*.
export const SIDEBAR_FOOTER_NAV = [
  { label: "Help Center", path: ROUTES.help, icon: "LifeBuoy" },
  { label: "Logout", path: ROUTES.login, icon: "LogOut" },
] as const;

// ============================================
// ADMIN sidebar navigation
// Completely separate from user sidebar. No "Back to App" link —
// the only way to reach the admin area is through /admin/login.
// ============================================
export const ADMIN_SIDEBAR_NAV = [
  { label: "Dashboard", path: ROUTES.adminDashboard, icon: "LayoutDashboard", section: "main" },
  { label: "User Management", path: ROUTES.adminUsers, icon: "Users", section: "manage" },
  { label: "Scan Management", path: ROUTES.adminScans, icon: "ScanLine", section: "manage" },
  { label: "Reports", path: ROUTES.adminReports, icon: "FileBarChart", section: "manage" },
  { label: "Analytics", path: ROUTES.adminAnalytics, icon: "BarChart3", section: "manage" },
  { label: "AI Usage", path: ROUTES.adminAiUsage, icon: "Cpu", section: "manage" },
  { label: "Cyber Academy Management", path: ROUTES.adminAcademy, icon: "GraduationCap", section: "manage" },
  { label: "Notifications", path: ROUTES.adminNotifications, icon: "Bell", section: "system", badge: 3 },
  { label: "Roles & Permissions", path: ROUTES.adminRoles, icon: "ShieldCheck", section: "system" },
  { label: "Audit Logs", path: ROUTES.adminAuditLogs, icon: "ScrollText", section: "system" },
  { label: "System Settings", path: ROUTES.adminSettings, icon: "Settings", section: "system" },
  { label: "Profile", path: ROUTES.adminProfile, icon: "User", section: "account" },
] as const;

// Admin sidebar footer — Logout only (redirects to /admin/login)
// NOTE: No "Back to App" link. Admin and User areas are fully separated.
export const ADMIN_SIDEBAR_FOOTER_NAV = [
  { label: "Logout", path: ROUTES.adminLogin, icon: "LogOut" },
] as const;
