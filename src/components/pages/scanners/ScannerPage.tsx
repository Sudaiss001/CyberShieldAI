"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "lucide-react";
import { type LucideIcon } from "lucide-react";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { UploadArea } from "@/components/shared/UploadArea";
import { CyberButton } from "@/components/shared/CyberButton";
import { DynamicIcon } from "@/components/shared/DynamicIcon";
import { navigate } from "@/hooks/use-router";
import { ROUTES } from "@/lib/routes";
import { SCANNER_META, type ScannerMetaKey } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

interface ScannerPageProps {
  scannerKey:
    | typeof ROUTES.aiScanner
    | typeof ROUTES.urlScanner
    | typeof ROUTES.emailScanner
    | typeof ROUTES.imageScanner
    | typeof ROUTES.documentScanner
    | typeof ROUTES.audioScanner
    | typeof ROUTES.videoScanner
    | typeof ROUTES.qrScanner;
}

const SCANNER_MAP: Record<string, ScannerMetaKey> = {
  [ROUTES.aiScanner]: "ai",
  [ROUTES.urlScanner]: "url",
  [ROUTES.emailScanner]: "email",
  [ROUTES.imageScanner]: "image",
  [ROUTES.documentScanner]: "document",
  [ROUTES.audioScanner]: "audio",
  [ROUTES.videoScanner]: "video",
  [ROUTES.qrScanner]: "qr",
};

const TABS_BY_SCANNER: Record<ScannerMetaKey, { id: string; label: string; icon: LucideIcon }[]> = {
  ai: [
    { id: "auto", label: "Auto-detect", icon: Icons.Sparkles },
    { id: "text", label: "Paste Text", icon: Icons.Type },
    { id: "url", label: "Paste URL", icon: Icons.Link2 },
    { id: "file", label: "Upload File", icon: Icons.Upload },
  ],
  url: [
    { id: "url", label: "Paste URL", icon: Icons.Link2 },
    { id: "qr", label: "Upload QR Image", icon: Icons.QrCode },
  ],
  email: [
    { id: "paste", label: "Paste Email", icon: Icons.Clipboard },
    { id: "file", label: "Upload .eml", icon: Icons.Upload },
  ],
  image: [
    { id: "upload", label: "Upload Image", icon: Icons.Upload },
    { id: "screenshot", label: "Take Screenshot", icon: Icons.Camera },
  ],
  document: [
    { id: "upload", label: "Upload Document", icon: Icons.Upload },
  ],
  audio: [
    { id: "upload", label: "Upload Audio", icon: Icons.Upload },
    { id: "record", label: "Record Live", icon: Icons.Mic },
  ],
  video: [
    { id: "upload", label: "Upload Video", icon: Icons.Upload },
  ],
  qr: [
    { id: "upload", label: "Upload QR Image", icon: Icons.Upload },
    { id: "camera", label: "Live Camera", icon: Icons.Camera },
  ],
};

export function ScannerPage({ scannerKey }: ScannerPageProps) {
  const { toast } = useToast();
  const metaKey = SCANNER_MAP[scannerKey];
  const meta = SCANNER_META[metaKey];
  const iconName = meta.icon;
  const tabs = TABS_BY_SCANNER[metaKey];
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const handleScan = () => {
    toast({
      title: "Scan started",
      description: `Analyzing your ${meta.title.toLowerCase()} input...`,
    });
    setTimeout(() => navigate(ROUTES.processing), 600);
  };

  return (
    <div>
      <DashboardHeader
        title={meta.title}
        description={meta.subtitle}
        breadcrumbs={[{ label: "Scanners" }, { label: meta.title }]}
        icon={<DynamicIcon name={iconName} size={20} style={{ color: meta.accent }} />}
        showBack
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main scan panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs */}
          <GlassCard className="p-2">
            <div className="flex gap-1 overflow-x-auto no-scrollbar">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
                  style={
                    activeTab === t.id
                      ? { background: `${meta.accent}15`, color: meta.accent }
                      : { color: "var(--muted-foreground)" }
                  }
                >
                  <t.icon size={14} />
                  {t.label}
                  {activeTab === t.id && (
                    <motion.span
                      layoutId="scanner-tab-active"
                      className="absolute -bottom-2 left-3 right-3 h-0.5 rounded-full"
                      style={{ background: meta.accent }}
                    />
                  )}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Main input area */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {(activeTab === "upload" || activeTab === "file" || activeTab === "qr") && (
                <UploadArea
                  title={`Drop your ${meta.title.toLowerCase()} input here`}
                  subtitle={meta.accept}
                  formats={meta.formats as unknown as string[]}
                  iconName={iconName}
                  accentColor={meta.accent}
                  onFileSelected={() => toast({ title: "File added", description: "Ready to scan." })}
                />
              )}

              {(activeTab === "url" || activeTab === "text" || activeTab === "paste" || activeTab === "auto") && (
                <GlassCard className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <DynamicIcon name={iconName} size={18} style={{ color: meta.accent }} />
                    <h3 className="font-semibold">
                      {activeTab === "url" && "Paste a URL to analyze"}
                      {activeTab === "text" && "Paste text to analyze"}
                      {activeTab === "paste" && "Paste raw email content"}
                      {activeTab === "auto" && "Submit any input — AI will detect the type"}
                    </h3>
                  </div>
                  <textarea
                    rows={6}
                    placeholder={
                      activeTab === "url"
                        ? "https://suspicious-site.com/login"
                        : activeTab === "paste"
                        ? "From: sender@example.com\nSubject: Urgent action required\n\nPaste the full email content here..."
                        : "Paste any text, URL, email content, or suspicious message here..."
                    }
                    className="w-full px-3.5 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-sm outline-none focus:border-[#00d4ff]/50 focus:bg-[#00d4ff]/5 transition-all resize-none font-mono"
                  />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                      💡 Tip: The more context you provide, the more accurate the analysis.
                    </p>
                    <CyberButton size="sm" onClick={handleScan} icon={<DynamicIcon name={iconName} size={14} />}>
                      Analyze
                    </CyberButton>
                  </div>
                </GlassCard>
              )}

              {activeTab === "record" && (
                <GlassCard className="p-6 text-center">
                  <div className="mx-auto w-24 h-24 rounded-full bg-[#ec4899]/10 border-2 border-[#ec4899]/30 flex items-center justify-center mb-4 relative">
                    <Icons.Mic size={36} className="text-[#ec4899]" />
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-[#ec4899]"
                      animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </div>
                  <h3 className="font-semibold mb-1">Record audio</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click below to start recording from your microphone.
                  </p>
                  <CyberButton size="md" variant="danger" icon={<Icons.Mic size={15} />} onClick={handleScan}>
                    Start recording
                  </CyberButton>
                  <p className="mt-3 text-xs text-muted-foreground">
                    🎙 Max recording: 5 minutes • Processed locally then analyzed
                  </p>
                </GlassCard>
              )}

              {activeTab === "camera" && (
                <GlassCard className="p-6 text-center">
                  <div className="mx-auto w-48 h-48 rounded-2xl bg-[#06b6d4]/10 border-2 border-dashed border-[#06b6d4]/30 flex items-center justify-center mb-4">
                    <Icons.Camera size={48} className="text-[#06b6d4]" />
                  </div>
                  <h3 className="font-semibold mb-1">Scan with camera</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Point your camera at a QR code to scan it instantly.
                  </p>
                  <CyberButton size="md" icon={<Icons.Camera size={15} />} onClick={handleScan}>
                    Open camera
                  </CyberButton>
                  <p className="mt-3 text-xs text-muted-foreground">
                    📷 Camera access required • Video stays on your device
                  </p>
                </GlassCard>
              )}

              {activeTab === "screenshot" && (
                <GlassCard className="p-6 text-center">
                  <div className="mx-auto w-48 h-32 rounded-2xl bg-[#a855f7]/10 border-2 border-dashed border-[#a855f7]/30 flex items-center justify-center mb-4">
                    <Icons.Camera size={36} className="text-[#a855f7]" />
                  </div>
                  <h3 className="font-semibold mb-1">Capture screenshot</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Take a screenshot of any suspicious window or message.
                  </p>
                  <CyberButton size="md" icon={<Icons.Camera size={15} />} onClick={handleScan}>
                    Capture screen
                  </CyberButton>
                </GlassCard>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Action bar */}
          <GlassCard variant="strong" className="p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Icons.ShieldCheck size={14} className="text-emerald-400" />
              All processing is encrypted. Your data is never stored unless you save a report.
            </div>
            <CyberButton onClick={handleScan} icon={<DynamicIcon name={iconName} size={16} />} glow>
              Start AI Scan
            </CyberButton>
          </GlassCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Scanner info */}
          <GlassCard className="p-5">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
              style={{ background: `${meta.accent}15`, border: `1px solid ${meta.accent}30` }}
            >
              <DynamicIcon name={iconName} size={22} style={{ color: meta.accent }} />
            </div>
            <h3 className="font-semibold mb-1">{meta.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">{meta.subtitle}</p>

            <div className="space-y-2 pt-3 border-t border-white/5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Supported formats</p>
              <div className="flex flex-wrap gap-1.5">
                {meta.formats.map((f) => (
                  <span
                    key={f}
                    className="text-[10px] px-2 py-0.5 rounded-md font-medium"
                    style={{
                      color: meta.accent,
                      background: `${meta.accent}10`,
                      border: `1px solid ${meta.accent}20`,
                    }}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* What we detect */}
          <GlassCard className="p-5">
            <h3 className="font-semibold mb-3">What we detect</h3>
            <ul className="space-y-2">
              {DETECTION_FEATURES[metaKey].map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs">
                  <Icons.CheckCircle2 size={13} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>
          </GlassCard>

          {/* Recent scans of this type */}
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Recent {meta.title} scans</h3>
              <button
                onClick={() => navigate(ROUTES.reports)}
                className="text-xs text-[#00d4ff] hover:underline"
              >
                View all
              </button>
            </div>
            <div className="space-y-2">
              {SAMPLE_RECENT[metaKey].map((s, i) => (
                <button
                  key={i}
                  onClick={() => navigate(`${ROUTES.reportDetails}sample-${i}`)}
                  className="w-full text-left p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <p className="text-xs font-medium truncate">{s.target}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{s.time}</p>
                </button>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

const DETECTION_FEATURES: Record<ScannerMetaKey, string[]> = {
  ai: ["Phishing & social engineering", "Malware signatures", "Deepfake media", "Brand impersonation", "Suspicious redirects", "Threat intelligence cross-ref"],
  url: ["Phishing patterns", "Form-jacking scripts", "Malware redirects", "Domain reputation", "SSL certificate validity", "Redirect chain analysis"],
  email: ["Sender authentication (SPF/DKIM/DMARC)", "Brand impersonation", "Homoglyph domains", "Urgency & manipulation cues", "Attachment malware", "BEC patterns"],
  image: ["OCR text extraction", "Phishing screenshot detection", "Deepfake image artifacts", "Steganography", "Brand impersonation", "QR code extraction"],
  document: ["Macro malware", "Embedded payloads", "Metadata forensics", "Form-jacking scripts", "Social engineering text", "External resource loading"],
  audio: ["Voice clone detection", "Speaker verification", "Emotional manipulation", "Vishing patterns", "Background noise analysis", "Synthetic artifacts"],
  video: ["Lip-sync drift analysis", "Blink frequency", "GAN fingerprint", "Frame-level forensics", "Audio-video alignment", "Metadata forensics"],
  qr: ["URL preview & validation", "Redirect chain mapping", "Tracking pixel detection", "Malicious payload scan", "Domain reputation", "Encoding analysis"],
};

const SAMPLE_RECENT: Record<ScannerMetaKey, { target: string; time: string }[]> = {
  ai: [
    { target: "Email + URL bundle analysis", time: "2 hours ago" },
    { target: "Suspicious PDF + screenshot", time: "5 hours ago" },
    { target: "Voice message + transcript", time: "1 day ago" },
  ],
  url: [
    { target: "https://paypaal-verify.com/login", time: "4 hours ago" },
    { target: "https://bit.ly/3xY8zKp", time: "1 day ago" },
    { target: "https://arnazon-secure.com", time: "2 days ago" },
  ],
  email: [
    { target: "support@arnazon-secure.com", time: "1 hour ago" },
    { target: "hr@company-team.net", time: "6 hours ago" },
    { target: "noreply@paypaal-billing.com", time: "1 day ago" },
  ],
  image: [
    { target: "invoice_screenshot.png", time: "3 hours ago" },
    { target: "login_page_capture.jpg", time: "8 hours ago" },
    { target: "suspicious_diagram.png", time: "1 day ago" },
  ],
  document: [
    { target: "contract_final.pdf", time: "5 hours ago" },
    { target: "invoice_2026_07.docx", time: "12 hours ago" },
    { target: "w2_request.xlsx", time: "1 day ago" },
  ],
  audio: [
    { target: "voicemail_message.mp3", time: "2 hours ago" },
    { target: "ceo_call_recording.wav", time: "1 day ago" },
    { target: "support_call.m4a", time: "2 days ago" },
  ],
  video: [
    { target: "ceo_announcement.mp4", time: "4 hours ago" },
    { target: "interview_clip.mov", time: "1 day ago" },
    { target: "promo_video.mp4", time: "3 days ago" },
  ],
  qr: [
    { target: "Restaurant menu QR", time: "6 hours ago" },
    { target: "Parking payment QR", time: "1 day ago" },
    { target: "Event ticket QR", time: "2 days ago" },
  ],
};
