"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Link2,
  Mail,
  Image as ImageIcon,
  FileText,
  AudioLines,
  Video,
  QrCode,
  ShieldCheck,
  Zap,
  Globe,
  Cpu,
  ArrowRight,
  Play,
  Star,
  TrendingUp,
  Lock,
  Eye,
  Brain,
} from "lucide-react";
import { CyberButton } from "@/components/shared/CyberButton";
import { GlassCard } from "@/components/shared/GlassCard";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { navigate } from "@/hooks/use-router";
import { ROUTES } from "@/lib/routes";

const SCANNERS = [
  { icon: Link2, label: "URL", color: "#00d4ff", desc: "Phishing & malware URLs" },
  { icon: Mail, label: "Email", color: "#10b981", desc: "Phishing & BEC attempts" },
  { icon: ImageIcon, label: "Image", color: "#a855f7", desc: "OCR & visual threats" },
  { icon: FileText, label: "Document", color: "#f59e0b", desc: "Macro malware detection" },
  { icon: AudioLines, label: "Audio", color: "#ec4899", desc: "Voice clone detection" },
  { icon: Video, label: "Video", color: "#ef4444", desc: "Deepfake analysis" },
  { icon: QrCode, label: "QR Code", color: "#06b6d4", desc: "Malicious redirect scan" },
  { icon: Sparkles, label: "AI Universal", color: "#8b5cf6", desc: "Multimodal analysis" },
];

const STATS = [
  { value: 1284, suffix: "+", label: "Threats Analyzed", icon: ShieldCheck },
  { value: 96, suffix: "%", label: "Detection Accuracy", icon: Target },
  { value: 8, suffix: "", label: "Specialized Scanners", icon: Cpu },
  { value: 5, suffix: "M+", label: "Threat Intel IOCs", icon: Globe },
];

function Target(props: any) {
  return <Eye {...props} />;
}

const FEATURES = [
  {
    icon: Brain,
    title: "Multimodal AI Reasoning",
    description: "Powered by Google Gemma, our AI analyzes text, images, audio, and video together — catching threats that single-mode scanners miss.",
    color: "#a855f7",
  },
  {
    icon: Zap,
    title: "Real-Time Threat Intel",
    description: "Cross-references against 5M+ indicators of compromise, updated every 5 minutes from global threat intelligence feeds.",
    color: "#00d4ff",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise-Grade Security",
    description: "SOC 2 Type II certified, GDPR/CCPA compliant, with end-to-end encryption and zero data retention by default.",
    color: "#10b981",
  },
  {
    icon: Eye,
    title: "Deepfake Detection",
    description: "96%+ accuracy on GAN-generated content. Lip-sync analysis, blink-frequency monitoring, and GAN-fingerprint detection.",
    color: "#ef4444",
  },
  {
    icon: Cpu,
    title: "Behavioral Analysis",
    description: "Sandboxed execution reveals what a file or URL actually does — exposing hidden payloads and C2 callbacks.",
    color: "#f59e0b",
  },
  {
    icon: TrendingUp,
    title: "Learning Platform",
    description: "Cyber Academy offers 80+ lessons across 8 tracks. Train your team while CyberShield protects them.",
    color: "#06b6d4",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Submit Content",
    description: "Drag & drop files, paste URLs/emails, scan QR codes, or record audio. CyberShield accepts 8 input types.",
  },
  {
    number: "02",
    title: "AI Analyzes",
    description: "Our Gemma-powered pipeline runs OCR, deepfake detection, threat-intel lookups, and behavioral analysis in parallel.",
  },
  {
    number: "03",
    title: "Receive Report",
    description: "Get a detailed report with risk score, threat indicators, evidence, recommendations, and prevention tips in seconds.",
  },
];

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "CISO, FintechCo",
    avatar: "SC",
    text: "CyberShield caught a deepfake CEO fraud attempt that our existing stack completely missed. The multimodal AI is genuinely game-changing.",
    rating: 5,
  },
  {
    name: "Marcus Webb",
    role: "Security Lead, HealthTech",
    avatar: "MW",
    text: "We replaced three separate tools with CyberShield. The unified scanner UI saved my team 12 hours per week. Worth every penny.",
    rating: 5,
  },
  {
    name: "Priya Nair",
    role: "IT Director, EduOrg",
    avatar: "PN",
    text: "The Cyber Academy alone is worth the subscription. Phishing click-through rates dropped 78% after our staff completed the training.",
    rating: 5,
  },
];

export function LandingPage() {
  return (
    <div className="overflow-hidden">
      {/* ============================================ */}
      {/* HERO */}
      {/* ============================================ */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-[#00d4ff]/20 text-xs font-medium text-[#00d4ff] mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-pulse" />
              Powered by Google Gemma AI
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">SOC 2 Type II</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.05]"
            >
              Your AI Security Analyst
              <br />
              for <span className="gradient-text">Every Digital Threat</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              Analyze emails, URLs, screenshots, QR codes, documents, audio, and
              videos using multimodal AI.{" "}
              <span className="text-foreground font-medium">
                See it. Hear it. Verify it.
              </span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <CyberButton
                size="lg"
                to={ROUTES.register}
                icon={<Sparkles size={18} />}
                glow
              >
                Start Scanning
              </CyberButton>
              <CyberButton
                size="lg"
                variant="secondary"
                to={ROUTES.features}
                icon={<Play size={16} />}
              >
                Watch Demo
              </CyberButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground"
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-emerald-400" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <Zap size={13} className="text-amber-400" />
                25 free scans / month
              </span>
              <span className="flex items-center gap-1.5">
                <Lock size={13} className="text-[#00d4ff]" />
                Cancel anytime
              </span>
            </motion.div>
          </div>

          {/* Floating scanner grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 max-w-5xl mx-auto"
          >
            {SCANNERS.map((s, i) => (
              <motion.button
                key={s.label}
                onClick={() => {
                  const pathMap: Record<string, string> = {
                    URL: ROUTES.urlScanner,
                    Email: ROUTES.emailScanner,
                    Image: ROUTES.imageScanner,
                    Document: ROUTES.documentScanner,
                    Audio: ROUTES.audioScanner,
                    Video: ROUTES.videoScanner,
                    "QR Code": ROUTES.qrScanner,
                    "AI Universal": ROUTES.aiScanner,
                  };
                  navigate(pathMap[s.label] ?? ROUTES.aiScanner);
                }}
                whileHover={{ y: -4, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.05 }}
                className="group flex flex-col items-center gap-2 p-4 rounded-2xl glass glass-hover"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ background: `${s.color}15`, border: `1px solid ${s.color}30` }}
                >
                  <s.icon size={20} style={{ color: s.color }} strokeWidth={2.2} />
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold">{s.label}</p>
                  <p className="text-[10px] text-muted-foreground hidden sm:block mt-0.5">
                    {s.desc}
                  </p>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================ */}
      {/* STATS */}
      {/* ============================================ */}
      <section className="py-12 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl glass mb-3">
                  <stat.icon size={20} className="text-[#00d4ff]" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold gradient-text">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FEATURES */}
      {/* ============================================ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#00d4ff]">
              Why CyberShield
            </span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight">
              Defense in depth, powered by{" "}
              <span className="gradient-text">multimodal AI</span>
            </h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              Most security tools scan one signal at a time. CyberShield fuses
              text, image, audio, and video analysis into a single threat picture —
              the way a human analyst would, but at machine speed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <GlassCard variant="hover" className="p-6 h-full">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{
                      background: `${feat.color}15`,
                      border: `1px solid ${feat.color}30`,
                    }}
                  >
                    <feat.icon size={22} style={{ color: feat.color }} strokeWidth={2.2} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feat.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* HOW IT WORKS */}
      {/* ============================================ */}
      <section className="py-20 sm:py-28 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#a855f7]">
              How it works
            </span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight">
              From upload to insight in{" "}
              <span className="gradient-text-emerald">under 30 seconds</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative"
              >
                <GlassCard className="p-6 h-full">
                  <div className="text-5xl font-bold gradient-text mb-3">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </GlassCard>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                    <ArrowRight className="text-[#00d4ff]/50" size={20} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <CyberButton size="lg" to={ROUTES.register} icon={<Sparkles size={18} />}>
              Try it now — free
            </CyberButton>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* TESTIMONIALS */}
      {/* ============================================ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#10b981]">
              Loved by security teams
            </span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight">
              Trusted by{" "}
              <span className="gradient-text">12,000+ organizations</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <GlassCard className="p-6 h-full flex flex-col">
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: t.rating }).map((_, idx) => (
                      <Star key={idx} size={14} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed flex-1">"{t.text}"</p>
                  <div className="mt-4 flex items-center gap-3 pt-4 border-t border-white/5">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#a855f7] flex items-center justify-center text-xs font-bold text-[#0a0e1a]">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* CTA */}
      {/* ============================================ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <GlassCard variant="strong" borderGlow className="relative p-8 sm:p-14 text-center overflow-hidden">
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-[#00d4ff]/20 blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-[#a855f7]/20 blur-3xl" />
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
              Ready to <span className="gradient-text">verify everything?</span>
            </h2>
            <p className="mt-4 text-base text-muted-foreground max-w-xl mx-auto">
              Join 12,000+ teams using CyberShield AI to defend against phishing,
              deepfakes, and digital fraud. Start with 25 free scans — no card required.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <CyberButton size="lg" to={ROUTES.register} icon={<Sparkles size={18} />} glow>
                Create free account
              </CyberButton>
              <CyberButton size="lg" variant="outline" to={ROUTES.contact}>
                Talk to sales
              </CyberButton>
            </div>
          </GlassCard>
        </div>
      </section>
    </div>
  );
}
