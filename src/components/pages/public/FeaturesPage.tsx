"use client";

import { motion } from "framer-motion";
import {
  Brain, Zap, ShieldCheck, Eye, Cpu, TrendingUp, Lock, Globe,
  Sparkles, Link2, Mail, Image, FileText, AudioLines, Video, QrCode,
  Check, Server, Code, Users,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { CyberButton } from "@/components/shared/CyberButton";
import { ROUTES } from "@/lib/routes";

const SCANNER_FEATURES = [
  { icon: Link2, title: "URL Scanner", desc: "Phishing, malware, and reputation checks for any URL or QR-encoded link.", color: "#00d4ff", features: ["Real-time threat intel lookup", "SSL certificate analysis", "Form-jacking detection", "Redirect chain mapping"] },
  { icon: Mail, title: "Email Scanner", desc: "Detect phishing, BEC, and malicious attachments in any email.", color: "#10b981", features: ["SPF/DKIM/DMARC validation", "Header anomaly detection", "Attachment sandboxing", "Brand impersonation analysis"] },
  { icon: Image, title: "Image Scanner", desc: "OCR, deepfake detection, and visual threat analysis.", color: "#a855f7", features: ["Text extraction (OCR)", "Steganography detection", "Deepfake detection", "Phishing screenshot analysis"] },
  { icon: FileText, title: "Document Scanner", desc: "Detect macro malware, embedded payloads, and social engineering.", color: "#f59e0b", features: ["Macro analysis", "Embedded object extraction", "Metadata forensics", "Social engineering patterns"] },
  { icon: AudioLines, title: "Audio Scanner", desc: "Voice clone detection and vishing analysis.", color: "#ec4899", features: ["Synthetic voice detection", "Speaker verification", "Emotional manipulation analysis", "Vishing pattern recognition"] },
  { icon: Video, title: "Video Scanner", desc: "Deepfake detection and manipulated media analysis.", color: "#ef4444", features: ["Lip-sync drift analysis", "Blink frequency monitoring", "GAN fingerprint detection", "Frame-level forensics"] },
  { icon: QrCode, title: "QR Scanner", desc: "Analyze QR codes for malicious redirects and payloads.", color: "#06b6d4", features: ["URL preview & validation", "Redirect chain analysis", "Tracking pixel detection", "Live camera scanning"] },
  { icon: Sparkles, title: "AI Universal Scanner", desc: "Multimodal analysis across all input types with one upload.", color: "#8b5cf6", features: ["Auto-format detection", "Cross-modal reasoning", "Unified threat scoring", "Conversational follow-up"] },
];

const PLATFORM_FEATURES = [
  { icon: Brain, title: "Gemma-Powered AI", desc: "Multimodal reasoning across text, images, audio, and video — catching threats single-mode scanners miss.", color: "#a855f7" },
  { icon: Zap, title: "Real-Time Threat Intel", desc: "5M+ indicators of compromise, refreshed every 5 minutes from global feeds.", color: "#00d4ff" },
  { icon: ShieldCheck, title: "Enterprise Security", desc: "SOC 2 Type II, GDPR/CCPA compliant. End-to-end encrypted. Zero data retention by default.", color: "#10b981" },
  { icon: Eye, title: "Deepfake Detection", desc: "96%+ accuracy on GAN-generated content. Lip-sync, blink frequency, and fingerprint analysis.", color: "#ef4444" },
  { icon: Cpu, title: "Behavioral Analysis", desc: "Sandboxed execution reveals what files and URLs actually do — exposing hidden payloads.", color: "#f59e0b" },
  { icon: TrendingUp, title: "Cyber Academy", desc: "80+ lessons across 8 tracks. Train your team while CyberShield protects them.", color: "#06b6d4" },
  { icon: Lock, title: "Zero-Trust Architecture", desc: "Every request authenticated, every response verified. No implicit trust anywhere.", color: "#ec4899" },
  { icon: Globe, title: "Global Infrastructure", desc: "Multi-region deployment with sub-100ms latency in 30+ countries.", color: "#8b5cf6" },
];

const INTEGRATIONS = [
  { icon: Server, name: "Slack", desc: "Get threat alerts in your team channel" },
  { icon: Server, name: "Microsoft Teams", desc: "Native Teams integration with cards" },
  { icon: Server, name: "Jira", desc: "Auto-create tickets for critical threats" },
  { icon: Server, name: "Splunk", desc: "Stream scan events to your SIEM" },
  { icon: Server, name: "Webhook", desc: "Real-time callbacks to any endpoint" },
  { icon: Code, name: "REST API", desc: "Full programmatic access to all scanners" },
  { icon: Users, name: "SSO / SAML", desc: "Okta, Azure AD, Google Workspace" },
  { icon: Lock, name: "Audit Logs", desc: "Tamper-evident logs for compliance" },
];

export function FeaturesPage() {
  return (
    <div>
      {/* Hero */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#00d4ff]">
              Features
            </span>
            <h1 className="mt-3 text-4xl sm:text-6xl font-bold tracking-tight">
              One platform. <span className="gradient-text">Every threat surface.</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed">
              CyberShield AI unifies 8 specialized scanners, real-time threat
              intelligence, and Gemma-powered multimodal reasoning into a single
              platform. Built for security teams who refuse to juggle tools.
            </p>
          </div>
        </div>
      </section>

      {/* Scanner grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-2">8 Specialized Scanners</h2>
          <p className="text-sm text-muted-foreground mb-8">Each scanner is purpose-built for its threat surface — and they all share a unified report format.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {SCANNER_FEATURES.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <GlassCard variant="hover" className="p-5 h-full">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: `${s.color}15`, border: `1px solid ${s.color}30` }}
                  >
                    <s.icon size={20} style={{ color: s.color }} strokeWidth={2.2} />
                  </div>
                  <h3 className="font-semibold mb-1">{s.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{s.desc}</p>
                  <ul className="space-y-1.5">
                    {s.features.map((f) => (
                      <li key={f} className="flex items-start gap-1.5 text-xs">
                        <Check size={13} className="text-emerald-400 mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform features */}
      <section className="py-20 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Built on a <span className="gradient-text">security-first foundation</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {PLATFORM_FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <GlassCard variant="hover" className="p-5 h-full">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                    style={{ background: `${f.color}15`, border: `1px solid ${f.color}30` }}
                  >
                    <f.icon size={18} style={{ color: f.color }} strokeWidth={2.2} />
                  </div>
                  <h3 className="font-semibold text-sm mb-1.5">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#a855f7]">
              Integrations
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
              Plugs into your <span className="gradient-text">existing stack</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {INTEGRATIONS.map((int, i) => (
              <motion.div
                key={int.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <GlassCard variant="hover" className="p-4 h-full">
                  <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-2.5">
                    <int.icon size={16} className="text-[#00d4ff]" />
                  </div>
                  <p className="text-sm font-semibold">{int.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{int.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <GlassCard variant="strong" borderGlow className="p-10 sm:p-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Ready to explore all features?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Start with 25 free scans — no credit card required.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <CyberButton size="lg" to={ROUTES.register} icon={<Sparkles size={18} />}>
                Get started free
              </CyberButton>
              <CyberButton size="lg" variant="outline" to={ROUTES.contact}>
                Contact sales
              </CyberButton>
            </div>
          </GlassCard>
        </div>
      </section>
    </div>
  );
}
