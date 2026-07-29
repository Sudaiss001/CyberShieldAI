// ============================================
// Core domain types for CyberShield AI
// ============================================

export type ThreatLevel = "critical" | "high" | "medium" | "low" | "safe";
export type ScanStatus = "completed" | "processing" | "queued" | "failed";
export type ScannerType =
  | "url"
  | "email"
  | "image"
  | "document"
  | "audio"
  | "video"
  | "qr"
  | "ai";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  joinedAt: string;
  securityScore: number;
  plan: "free" | "pro" | "enterprise";
}

export interface ScanRecord {
  id: string;
  type: ScannerType;
  target: string;
  status: ScanStatus;
  threatLevel: ThreatLevel;
  riskScore: number;
  confidence: number;
  createdAt: string;
  category: string;
  summary: string;
}

export interface ThreatIndicator {
  label: string;
  value: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
}

export interface ReportEvidence {
  title: string;
  description: string;
  snippet?: string;
  severity: ThreatLevel;
}

export interface ScanReport {
  id: string;
  scanId: string;
  type: ScannerType;
  target: string;
  threatLevel: ThreatLevel;
  riskScore: number;
  confidence: number;
  category: string;
  createdAt: string;
  executiveSummary: string;
  indicators: ThreatIndicator[];
  evidence: ReportEvidence[];
  recommendations: string[];
  preventionTips: string[];
  tags: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: string;
  unread?: boolean;
}

export interface AcademyCategory {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  lessonsCount: number;
  completedLessons: number;
  difficulty: "beginner" | "intermediate" | "advanced";
}

export interface AcademyLesson {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  duration: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  completed: boolean;
  progress: number;
  points: number;
  modules: { title: string; duration: string; type: "video" | "reading" | "quiz" }[];
}

export interface NotificationItem {
  id: string;
  type: "threat" | "scan" | "update" | "learning" | "system";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  severity: "critical" | "high" | "medium" | "low" | "info";
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  color: string;
}

export interface ActivityItem {
  id: string;
  type: "scan" | "report" | "learning" | "achievement";
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}

// ============================================
// Navigation types
// ============================================
export interface NavItem {
  label: string;
  path: string;
  icon?: string;
  badge?: string | number;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
}
