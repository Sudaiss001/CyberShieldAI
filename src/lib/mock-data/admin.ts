import type { ThreatLevel, ScannerType } from "@/types";

// ============================================
// Admin user (current admin)
// ============================================
export const ADMIN_USER = {
  id: "adm_001",
  name: "Sarah Mitchell",
  email: "sarah.mitchell@cybershield.ai",
  avatar: "SM",
  role: "Super Admin",
  joinedAt: "2024-08-12",
  lastActive: "2026-07-29T07:42:00Z",
};

// ============================================
// Admin dashboard statistics
// ============================================
export const ADMIN_DASHBOARD_STATS = {
  totalUsers: 12483,
  activeUsers: 8942,
  suspendedUsers: 47,
  totalScans: 184592,
  highRiskThreats: 1247,
  aiRequestsToday: 8421,
  storageUsed: 684, // GB
  storageTotal: 1024, // GB
  systemHealth: 99.97,
  weeklyUserGrowth: [
    { day: "Mon", users: 8420, scans: 4120 },
    { day: "Tue", users: 8580, scans: 4580 },
    { day: "Wed", users: 8710, scans: 5120 },
    { day: "Thu", users: 8820, scans: 4890 },
    { day: "Fri", users: 8942, scans: 5640 },
    { day: "Sat", users: 8780, scans: 3210 },
    { day: "Sun", users: 8650, scans: 2980 },
  ],
  userGrowthMonthly: [
    { month: "Jan", total: 8420, new: 412 },
    { month: "Feb", total: 9120, new: 700 },
    { month: "Mar", total: 9840, new: 720 },
    { month: "Apr", total: 10580, new: 740 },
    { month: "May", total: 11200, new: 620 },
    { month: "Jun", total: 11820, new: 620 },
    { month: "Jul", total: 12483, new: 663 },
  ],
  threatCategories: [
    { name: "Phishing", value: 642, color: "#ef4444" },
    { name: "Malware", value: 318, color: "#a855f7" },
    { name: "Social Eng.", value: 154, color: "#f59e0b" },
    { name: "Ransomware", value: 78, color: "#ec4899" },
    { name: "Deepfake", value: 35, color: "#06b6d4" },
    { name: "Other", value: 20, color: "#64748b" },
  ],
  aiUsageTrend: [
    { day: "Mon", requests: 7200, success: 7120, failed: 80 },
    { day: "Tue", requests: 7450, success: 7398, failed: 52 },
    { day: "Wed", requests: 7820, success: 7750, failed: 70 },
    { day: "Thu", requests: 7980, success: 7920, failed: 60 },
    { day: "Fri", requests: 8421, success: 8360, failed: 61 },
    { day: "Sat", requests: 6840, success: 6800, failed: 40 },
    { day: "Sun", requests: 6520, success: 6480, failed: 40 },
  ],
};

// ============================================
// Users
// ============================================
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "Super Admin" | "Admin" | "Moderator" | "User";
  status: "active" | "suspended" | "pending";
  totalScans: number;
  joinedDate: string;
  lastActive: string;
  plan: "free" | "pro" | "enterprise";
  color: string;
}

export const ADMIN_USERS: AdminUser[] = [
  { id: "usr_001", name: "Alex Morgan", email: "alex.morgan@acme.io", avatar: "AM", role: "User", status: "active", totalScans: 1284, joinedDate: "2025-03-14", lastActive: "2026-07-29T08:23:00Z", plan: "enterprise", color: "#00d4ff" },
  { id: "usr_002", name: "Priya Nair", email: "priya.nair@fintechco.com", avatar: "PN", role: "User", status: "active", totalScans: 892, joinedDate: "2025-04-22", lastActive: "2026-07-29T07:50:00Z", plan: "pro", color: "#a855f7" },
  { id: "usr_003", name: "Marcus Webb", email: "marcus.webb@healthtech.io", avatar: "MW", role: "Moderator", status: "active", totalScans: 2104, joinedDate: "2025-02-18", lastActive: "2026-07-29T06:12:00Z", plan: "enterprise", color: "#10b981" },
  { id: "usr_004", name: "Elena Vasquez", email: "elena.v@eduorg.org", avatar: "EV", role: "User", status: "active", totalScans: 458, joinedDate: "2025-05-30", lastActive: "2026-07-28T22:11:00Z", plan: "pro", color: "#f59e0b" },
  { id: "usr_005", name: "James O'Brien", email: "james.obrien@logistics.co", avatar: "JO", role: "User", status: "suspended", totalScans: 312, joinedDate: "2025-06-14", lastActive: "2026-07-20T14:30:00Z", plan: "free", color: "#ec4899" },
  { id: "usr_006", name: "Aiko Tanaka", email: "aiko.tanaka@designfirm.jp", avatar: "AT", role: "User", status: "active", totalScans: 678, joinedDate: "2025-04-08", lastActive: "2026-07-29T05:45:00Z", plan: "pro", color: "#06b6d4" },
  { id: "usr_007", name: "David Okonkwo", email: "david.okonkwo@startup.ng", avatar: "DO", role: "User", status: "active", totalScans: 1024, joinedDate: "2025-01-25", lastActive: "2026-07-29T03:20:00Z", plan: "enterprise", color: "#8b5cf6" },
  { id: "usr_008", name: "Maria Santos", email: "maria.santos@retail.mx", avatar: "MS", role: "User", status: "pending", totalScans: 0, joinedDate: "2026-07-28", lastActive: "2026-07-28T10:00:00Z", plan: "free", color: "#ef4444" },
  { id: "usr_009", name: "Chen Wei", email: "chen.wei@manufacturing.cn", avatar: "CW", role: "User", status: "active", totalScans: 1567, joinedDate: "2024-12-10", lastActive: "2026-07-29T08:15:00Z", plan: "enterprise", color: "#00d4ff" },
  { id: "usr_010", name: "Olivia Brown", email: "olivia.brown@consulting.uk", avatar: "OB", role: "User", status: "active", totalScans: 743, joinedDate: "2025-03-30", lastActive: "2026-07-28T19:42:00Z", plan: "pro", color: "#a855f7" },
  { id: "usr_011", name: "Rajesh Kumar", email: "rajesh.k@techcorp.in", avatar: "RK", role: "User", status: "suspended", totalScans: 89, joinedDate: "2025-08-15", lastActive: "2026-07-15T11:30:00Z", plan: "free", color: "#10b981" },
  { id: "usr_012", name: "Sarah Chen", email: "sarah.chen@finbank.com", avatar: "SC", role: "Admin", status: "active", totalScans: 3421, joinedDate: "2024-09-05", lastActive: "2026-07-29T08:30:00Z", plan: "enterprise", color: "#f59e0b" },
  { id: "usr_013", name: "Tobias Lindqvist", email: "tobias.l@nordictech.se", avatar: "TL", role: "User", status: "active", totalScans: 521, joinedDate: "2025-07-12", lastActive: "2026-07-29T04:15:00Z", plan: "pro", color: "#ec4899" },
  { id: "usr_014", name: "Fatima Al-Rashid", email: "fatima.r@oilco.ae", avatar: "FR", role: "User", status: "active", totalScans: 1102, joinedDate: "2025-02-28", lastActive: "2026-07-28T16:50:00Z", plan: "enterprise", color: "#06b6d4" },
  { id: "usr_015", name: "Liam Murphy", email: "liam.murphy@pubgov.ie", avatar: "LM", role: "Moderator", status: "active", totalScans: 845, joinedDate: "2025-05-04", lastActive: "2026-07-29T02:30:00Z", plan: "pro", color: "#8b5cf6" },
];

// ============================================
// Scans (admin view)
// ============================================
export interface AdminScan {
  id: string;
  user: string;
  userId: string;
  avatar: string;
  color: string;
  type: ScannerType;
  target: string;
  threatLevel: ThreatLevel;
  riskScore: number;
  date: string;
  status: "completed" | "processing" | "queued" | "failed";
}

export const ADMIN_SCANS: AdminScan[] = [
  { id: "scn_001", user: "Alex Morgan", userId: "usr_001", avatar: "AM", color: "#00d4ff", type: "email", target: "support@arnazon-secure.com", threatLevel: "critical", riskScore: 94, date: "2026-07-29T08:23:00Z", status: "completed" },
  { id: "scn_002", user: "Priya Nair", userId: "usr_002", avatar: "PN", color: "#a855f7", type: "url", target: "https://paypaal-verify.com/login", threatLevel: "high", riskScore: 81, date: "2026-07-29T07:42:00Z", status: "completed" },
  { id: "scn_003", user: "Marcus Webb", userId: "usr_003", avatar: "MW", color: "#10b981", type: "qr", target: "QR Code (menu)", threatLevel: "medium", riskScore: 42, date: "2026-07-28T22:11:00Z", status: "completed" },
  { id: "scn_004", user: "Elena Vasquez", userId: "usr_004", avatar: "EV", color: "#f59e0b", type: "image", target: "invoice_screenshot.png", threatLevel: "safe", riskScore: 6, date: "2026-07-28T19:05:00Z", status: "completed" },
  { id: "scn_005", user: "David Okonkwo", userId: "usr_007", avatar: "DO", color: "#8b5cf6", type: "document", target: "contract_final.pdf", threatLevel: "high", riskScore: 76, date: "2026-07-28T16:38:00Z", status: "completed" },
  { id: "scn_006", user: "Aiko Tanaka", userId: "usr_006", avatar: "AT", color: "#06b6d4", type: "audio", target: "voicemail_message.mp3", threatLevel: "medium", riskScore: 48, date: "2026-07-28T14:12:00Z", status: "completed" },
  { id: "scn_007", user: "Chen Wei", userId: "usr_009", avatar: "CW", color: "#00d4ff", type: "video", target: "ceo_announcement.mp4", threatLevel: "critical", riskScore: 91, date: "2026-07-28T11:55:00Z", status: "completed" },
  { id: "scn_008", user: "Sarah Chen", userId: "usr_012", avatar: "SC", color: "#f59e0b", type: "email", target: "hr@company-team.net", threatLevel: "high", riskScore: 79, date: "2026-07-28T09:20:00Z", status: "completed" },
  { id: "scn_009", user: "Olivia Brown", userId: "usr_010", avatar: "OB", color: "#a855f7", type: "url", target: "https://bit.ly/3xY8zKp", threatLevel: "high", riskScore: 73, date: "2026-07-28T08:45:00Z", status: "completed" },
  { id: "scn_010", user: "Tobias Lindqvist", userId: "usr_013", avatar: "TL", color: "#ec4899", type: "image", target: "login_page_capture.jpg", threatLevel: "medium", riskScore: 51, date: "2026-07-28T07:30:00Z", status: "completed" },
  { id: "scn_011", user: "Fatima Al-Rashid", userId: "usr_014", avatar: "FR", color: "#06b6d4", type: "document", target: "w2_request.xlsx", threatLevel: "critical", riskScore: 88, date: "2026-07-28T06:15:00Z", status: "completed" },
  { id: "scn_012", user: "Liam Murphy", userId: "usr_015", avatar: "LM", color: "#8b5cf6", type: "qr", target: "Event ticket QR", threatLevel: "low", riskScore: 18, date: "2026-07-28T05:00:00Z", status: "completed" },
  { id: "scn_013", user: "Alex Morgan", userId: "usr_001", avatar: "AM", color: "#00d4ff", type: "url", target: "https://suspicious-link.io", threatLevel: "high", riskScore: 67, date: "2026-07-29T08:55:00Z", status: "processing" },
  { id: "scn_014", user: "Priya Nair", userId: "usr_002", avatar: "PN", color: "#a855f7", type: "ai", target: "Multimodal bundle", threatLevel: "medium", riskScore: 0, date: "2026-07-29T09:10:00Z", status: "queued" },
  { id: "scn_015", user: "Marcus Webb", userId: "usr_003", avatar: "MW", color: "#10b981", type: "video", target: "training_clip.mp4", threatLevel: "safe", riskScore: 0, date: "2026-07-29T09:20:00Z", status: "failed" },
];

// ============================================
// Admin reports
// ============================================
export interface AdminReport {
  id: string;
  user: string;
  avatar: string;
  color: string;
  type: ScannerType;
  target: string;
  threatLevel: ThreatLevel;
  riskScore: number;
  category: string;
  status: "published" | "draft" | "archived";
  date: string;
  summary: string;
}

export const ADMIN_REPORTS: AdminReport[] = ADMIN_SCANS.map((scan, i) => ({
  id: `rpt_${String(i + 1).padStart(3, "0")}`,
  user: scan.user,
  avatar: scan.avatar,
  color: scan.color,
  type: scan.type,
  target: scan.target,
  threatLevel: scan.threatLevel,
  riskScore: scan.riskScore,
  category: i % 3 === 0 ? "Phishing" : i % 3 === 1 ? "Malware" : "Deepfake",
  status: scan.status === "completed" ? "published" : scan.status === "processing" ? "draft" : "archived",
  date: scan.date,
  summary: scan.threatLevel === "critical"
    ? `Critical threat detected in ${scan.type} scan. Immediate action required.`
    : scan.threatLevel === "safe"
    ? "No malicious content detected. Safe to proceed."
    : `${scan.threatLevel.charAt(0).toUpperCase() + scan.threatLevel.slice(1)} risk indicators identified.`,
}));

// ============================================
// AI Usage statistics
// ============================================
export const AI_USAGE_STATS = {
  totalRequests: 2489175,
  successfulRequests: 2473842,
  failedRequests: 15333,
  avgResponseTime: 1.84, // seconds
  tokensToday: 8420000,
  tokensTotal: 2480000000,
  successRate: 99.38,
  failureRate: 0.62,
  modelVersion: "Gemma 3 Multimodal 27B",
  status: "operational",
  requestsByHour: [
    { hour: "00", requests: 1240 },
    { hour: "02", requests: 980 },
    { hour: "04", requests: 760 },
    { hour: "06", requests: 1180 },
    { hour: "08", requests: 2840 },
    { hour: "10", requests: 4120 },
    { hour: "12", requests: 5240 },
    { hour: "14", requests: 5680 },
    { hour: "16", requests: 5320 },
    { hour: "18", requests: 4180 },
    { hour: "20", requests: 3240 },
    { hour: "22", requests: 1980 },
  ],
  topEndpoints: [
    { endpoint: "/v1/scans/email", calls: 842000, percentage: 33.8 },
    { endpoint: "/v1/scans/url", calls: 624000, percentage: 25.1 },
    { endpoint: "/v1/scans/image", calls: 348000, percentage: 14.0 },
    { endpoint: "/v1/scans/document", calls: 268000, percentage: 10.8 },
    { endpoint: "/v1/scans/qr", calls: 184000, percentage: 7.4 },
    { endpoint: "/v1/scans/audio", calls: 122000, percentage: 4.9 },
    { endpoint: "/v1/scans/video", calls: 101000, percentage: 4.0 },
  ],
  systemComponents: [
    { name: "Gemma API Gateway", status: "operational", latency: 142, color: "#10b981" },
    { name: "Multimodal Inference", status: "operational", latency: 1840, color: "#10b981" },
    { name: "Threat Intel DB", status: "operational", latency: 38, color: "#10b981" },
    { name: "OCR Service", status: "degraded", latency: 412, color: "#f59e0b" },
    { name: "Deepfake Detection", status: "operational", latency: 2210, color: "#10b981" },
    { name: "Object Storage", status: "operational", latency: 88, color: "#10b981" },
  ],
};

// ============================================
// Cyber Academy management (admin view)
// ============================================
export interface AdminLesson {
  id: string;
  title: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: string;
  published: boolean;
  enrolled: number;
  completed: number;
  rating: number;
  updatedAt: string;
}

export const ADMIN_LESSONS: AdminLesson[] = [
  { id: "les_001", title: "Anatomy of a Phishing Email", category: "Phishing Defense", difficulty: "beginner", duration: "12 min", published: true, enrolled: 4280, completed: 3120, rating: 4.8, updatedAt: "2026-07-22" },
  { id: "les_002", title: "Homoglyph & Lookalike Domains", category: "Phishing Defense", difficulty: "intermediate", duration: "15 min", published: true, enrolled: 3840, completed: 2680, rating: 4.7, updatedAt: "2026-07-20" },
  { id: "les_003", title: "Spear Phishing & BEC", category: "Phishing Defense", difficulty: "advanced", duration: "18 min", published: true, enrolled: 2940, completed: 1820, rating: 4.9, updatedAt: "2026-07-18" },
  { id: "les_004", title: "Vishing & Smishing", category: "Phishing Defense", difficulty: "intermediate", duration: "14 min", published: false, enrolled: 0, completed: 0, rating: 0, updatedAt: "2026-07-26" },
  { id: "les_005", title: "Malware Types & Behaviors", category: "Malware Awareness", difficulty: "intermediate", duration: "22 min", published: true, enrolled: 3120, completed: 1840, rating: 4.6, updatedAt: "2026-07-15" },
  { id: "les_006", title: "Ransomware Recovery Playbook", category: "Ransomware Resilience", difficulty: "advanced", duration: "28 min", published: true, enrolled: 1240, completed: 680, rating: 4.9, updatedAt: "2026-07-12" },
  { id: "les_007", title: "Deepfake Detection Fundamentals", category: "Deepfake Detection", difficulty: "advanced", duration: "20 min", published: true, enrolled: 2180, completed: 1240, rating: 4.7, updatedAt: "2026-07-10" },
  { id: "les_008", title: "Building a Password Strategy", category: "Password Security", difficulty: "beginner", duration: "10 min", published: true, enrolled: 5240, completed: 4680, rating: 4.8, updatedAt: "2026-07-08" },
];

export const ADMIN_CATEGORIES = [
  { id: "cat_001", name: "Phishing Defense", lessons: 12, color: "#ef4444", icon: "Fish" },
  { id: "cat_002", name: "Malware Awareness", lessons: 14, color: "#a855f7", icon: "Bug" },
  { id: "cat_003", name: "Social Engineering", lessons: 10, color: "#f59e0b", icon: "Users" },
  { id: "cat_004", name: "Ransomware Resilience", lessons: 9, color: "#ec4899", icon: "Lock" },
  { id: "cat_005", name: "Password Security", lessons: 8, color: "#10b981", icon: "KeyRound" },
  { id: "cat_006", name: "Deepfake Detection", lessons: 11, color: "#06b6d4", icon: "Clapperboard" },
  { id: "cat_007", name: "QR Code Safety", lessons: 6, color: "#00d4ff", icon: "QrCode" },
  { id: "cat_008", name: "Email Security", lessons: 13, color: "#8b5cf6", icon: "Mail" },
];

// ============================================
// Roles & Permissions
// ============================================
export interface Role {
  id: string;
  name: string;
  description: string;
  users: number;
  color: string;
}

export const ADMIN_ROLES: Role[] = [
  { id: "r1", name: "Super Admin", description: "Full system access with no restrictions", users: 2, color: "#ef4444" },
  { id: "r2", name: "Admin", description: "Administrative access to most modules", users: 8, color: "#a855f7" },
  { id: "r3", name: "Moderator", description: "Can moderate content, users, and scans", users: 24, color: "#f59e0b" },
  { id: "r4", name: "User", description: "Standard user access to scanners and reports", users: 12449, color: "#00d4ff" },
];

export const PERMISSION_MODULES = [
  "Dashboard",
  "Users",
  "Scans",
  "Reports",
  "Analytics",
  "AI Usage",
  "Cyber Academy",
  "Notifications",
  "Roles",
  "Audit Logs",
  "Settings",
  "Profile",
] as const;

export type PermissionLevel = "full" | "read" | "none";

export const PERMISSION_MATRIX: Record<
  string,
  Record<(typeof PERMISSION_MODULES)[number], PermissionLevel>
> = {
  "Super Admin": Object.fromEntries(PERMISSION_MODULES.map((m) => [m, "full"])) as Record<
    (typeof PERMISSION_MODULES)[number],
    PermissionLevel
  >,
  Admin: {
    Dashboard: "full", Users: "full", Scans: "full", Reports: "full", Analytics: "full",
    "AI Usage": "read", "Cyber Academy": "full", Notifications: "full",
    Roles: "read", "Audit Logs": "read", Settings: "read", Profile: "full",
  },
  Moderator: {
    Dashboard: "read", Users: "read", Scans: "full", Reports: "full", Analytics: "read",
    "AI Usage": "none", "Cyber Academy": "full", Notifications: "read",
    Roles: "none", "Audit Logs": "none", Settings: "none", Profile: "full",
  },
  User: {
    Dashboard: "none", Users: "none", Scans: "none", Reports: "none", Analytics: "none",
    "AI Usage": "none", "Cyber Academy": "read", Notifications: "none",
    Roles: "none", "Audit Logs": "none", Settings: "none", Profile: "full",
  },
};

// ============================================
// Audit Logs
// ============================================
export interface AuditLog {
  id: string;
  user: string;
  avatar: string;
  action: string;
  module: string;
  ipAddress: string;
  time: string;
  status: "success" | "warning" | "error";
}

export const AUDIT_LOGS: AuditLog[] = [
  { id: "log_001", user: "Sarah Mitchell", avatar: "SM", action: "Suspended user james.obrien@logistics.co", module: "Users", ipAddress: "102.89.23.14", time: "2026-07-29T08:32:00Z", status: "warning" },
  { id: "log_002", user: "Sarah Chen", avatar: "SC", action: "Approved 3 new user registrations", module: "Users", ipAddress: "198.51.100.42", time: "2026-07-29T08:15:00Z", status: "success" },
  { id: "log_003", user: "Alex Morgan", avatar: "AM", action: "Ran email scan on support@arnazon-secure.com", module: "Scans", ipAddress: "203.0.113.88", time: "2026-07-29T08:23:00Z", status: "success" },
  { id: "log_004", user: "Sarah Mitchell", avatar: "SM", action: "Published lesson: Vishing & Smishing", module: "Cyber Academy", ipAddress: "102.89.23.14", time: "2026-07-29T07:50:00Z", status: "success" },
  { id: "log_005", user: "Marcus Webb", avatar: "MW", action: "Failed login attempt (3rd time)", module: "Auth", ipAddress: "45.227.255.206", time: "2026-07-29T07:42:00Z", status: "error" },
  { id: "log_006", user: "Sarah Chen", avatar: "SC", action: "Sent security alert to 1,240 enterprise users", module: "Notifications", ipAddress: "198.51.100.42", time: "2026-07-29T07:30:00Z", status: "success" },
  { id: "log_007", user: "Sarah Mitchell", avatar: "SM", action: "Updated AI configuration (max_tokens: 8192)", module: "Settings", ipAddress: "102.89.23.14", time: "2026-07-29T06:45:00Z", status: "success" },
  { id: "log_008", user: "Liam Murphy", avatar: "LM", action: "Modified role: Moderator (added Scans full access)", module: "Roles", ipAddress: "192.0.2.155", time: "2026-07-29T06:20:00Z", status: "success" },
  { id: "log_009", user: "David Okonkwo", avatar: "DO", action: "Downloaded batch report (12 files)", module: "Reports", ipAddress: "203.0.113.99", time: "2026-07-29T05:55:00Z", status: "success" },
  { id: "log_010", user: "Sarah Mitchell", avatar: "SM", action: "Database backup completed (684 GB)", module: "Backup", ipAddress: "102.89.23.14", time: "2026-07-29T04:00:00Z", status: "success" },
  { id: "log_011", user: "Priya Nair", avatar: "PN", action: "Exported user list (CSV, 12,483 rows)", module: "Users", ipAddress: "203.0.113.77", time: "2026-07-29T03:45:00Z", status: "success" },
  { id: "log_012", user: "Sarah Chen", avatar: "SC", action: "Failed to delete archived report (permission denied)", module: "Reports", ipAddress: "198.51.100.42", time: "2026-07-29T03:20:00Z", status: "error" },
  { id: "log_013", user: "Marcus Webb", avatar: "MW", action: "Updated profile security (enabled FIDO2 key)", module: "Profile", ipAddress: "45.227.255.206", time: "2026-07-29T02:55:00Z", status: "success" },
  { id: "log_014", user: "Sarah Mitchell", avatar: "SM", action: "Created new role: Threat Analyst (custom)", module: "Roles", ipAddress: "102.89.23.14", time: "2026-07-29T02:30:00Z", status: "warning" },
  { id: "log_015", user: "Sarah Chen", avatar: "SC", action: "Maintenance mode scheduled for Sunday 02:00 UTC", module: "Settings", ipAddress: "198.51.100.42", time: "2026-07-29T01:15:00Z", status: "success" },
];

// ============================================
// Admin notifications sent history
// ============================================
export const ADMIN_NOTIFICATIONS_HISTORY = [
  { id: "anot_001", type: "security", title: "Critical threat detected", audience: "All Users", sent: 12483, opened: 8942, date: "2026-07-29T07:30:00Z", status: "sent" },
  { id: "anot_002", type: "announcement", title: "New Cyber Academy tracks available", audience: "All Users", sent: 12483, opened: 6210, date: "2026-07-27T14:00:00Z", status: "sent" },
  { id: "anot_003", type: "maintenance", title: "Scheduled maintenance Sunday 02:00-04:00 UTC", audience: "Enterprise", sent: 1247, opened: 1120, date: "2026-07-26T09:00:00Z", status: "sent" },
  { id: "anot_004", type: "announcement", title: "AI Usage dashboard launched", audience: "Admins", sent: 34, opened: 28, date: "2026-07-25T16:30:00Z", status: "sent" },
  { id: "anot_005", type: "security", title: "Phishing campaign targeting financial sector", audience: "Selected Users", sent: 412, opened: 380, date: "2026-07-24T11:15:00Z", status: "sent" },
];

// ============================================
// Admin activity timeline
// ============================================
export const ADMIN_ACTIVITY = [
  { id: "act_001", title: "Suspended user", description: "james.obrien@logistics.co — Terms violation", timestamp: "2026-07-29T08:32:00Z", icon: "UserX", color: "#ef4444" },
  { id: "act_002", title: "Published lesson", description: "Vishing & Smishing — Phishing Defense track", timestamp: "2026-07-29T07:50:00Z", icon: "GraduationCap", color: "#a855f7" },
  { id: "act_003", title: "Sent security alert", description: "1,240 enterprise users notified of new phishing campaign", timestamp: "2026-07-29T07:30:00Z", icon: "Bell", color: "#ef4444" },
  { id: "act_004", title: "Updated AI config", description: "Gemma max_tokens raised from 4096 to 8192", timestamp: "2026-07-29T06:45:00Z", icon: "Cpu", color: "#00d4ff" },
  { id: "act_005", title: "Database backup", description: "Automated backup completed — 684 GB", timestamp: "2026-07-29T04:00:00Z", icon: "DatabaseBackup", color: "#10b981" },
  { id: "act_006", title: "Created custom role", description: "Threat Analyst — limited read access to analytics", timestamp: "2026-07-29T02:30:00Z", icon: "ShieldCheck", color: "#f59e0b" },
];

// ============================================
// Storage usage breakdown
// ============================================
export const STORAGE_BREAKDOWN = [
  { name: "Scans", value: 312, color: "#00d4ff" },
  { name: "Reports", value: 184, color: "#10b981" },
  { name: "User uploads", value: 142, color: "#a855f7" },
  { name: "Academy assets", value: 38, color: "#f59e0b" },
  { name: "Logs", value: 8, color: "#64748b" },
];

// ============================================
// Scanner type filter options
// ============================================
export const SCAN_TYPE_FILTERS = [
  { label: "All", value: "all" },
  { label: "Email", value: "email" },
  { label: "URL", value: "url" },
  { label: "Image", value: "image" },
  { label: "Audio", value: "audio" },
  { label: "Video", value: "video" },
  { label: "Document", value: "document" },
  { label: "QR Code", value: "qr" },
] as const;
