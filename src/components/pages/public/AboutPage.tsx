"use client";

import { motion } from "framer-motion";
import { Target, Eye, Shield, Zap, Users, Heart, Globe, Award } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { CyberButton } from "@/components/shared/CyberButton";
import { ROUTES } from "@/lib/routes";

const VALUES = [
  { icon: Shield, title: "Security First", desc: "Every decision starts with: 'Does this make our users safer?' If the answer is no, we don't ship it.", color: "#10b981" },
  { icon: Eye, title: "Radical Transparency", desc: "We publish our detection methodologies, false-positive rates, and incident reports. Trust is earned through visibility.", color: "#00d4ff" },
  { icon: Zap, title: "Speed Without Compromise", desc: "Threats move fast. So do we. But never at the cost of accuracy — a wrong answer is worse than a slow one.", color: "#f59e0b" },
  { icon: Heart, title: "Humans at the Center", desc: "AI is a tool, not a replacement. Our product augments analysts — it doesn't replace their judgment.", color: "#ec4899" },
];

const TEAM = [
  { name: "Dr. Elena Vasquez", role: "CEO & Co-founder", bio: "Former CISO at major fintech. PhD in adversarial ML.", avatar: "EV", color: "#00d4ff" },
  { name: "Marcus Kim", role: "CTO & Co-founder", bio: "Built threat intel systems at Google & CrowdStrike.", avatar: "MK", color: "#a855f7" },
  { name: "Priya Sharma", role: "Head of AI Research", bio: "Led deepfake detection at a top-3 cloud provider.", avatar: "PS", color: "#10b981" },
  { name: "James O'Brien", role: "VP of Engineering", bio: "Scaled security platforms to 50M+ users.", avatar: "JO", color: "#f59e0b" },
  { name: "Aiko Tanaka", role: "Head of Threat Intel", bio: "12 years at Mandiant tracking APT groups.", avatar: "AT", color: "#ec4899" },
  { name: "David Okonkwo", role: "Head of Design", bio: "Designed enterprise tools used by Fortune 100.", avatar: "DO", color: "#06b6d4" },
];

const MILESTONES = [
  { year: "2024", title: "CyberShield AI Founded", desc: "Started in a Lagos apartment with 3 engineers and a mission." },
  { year: "2025 Q1", title: "First Scanner Shipped", desc: "URL Scanner launched with 1,200 early-access users." },
  { year: "2025 Q3", title: "Multimodal AI Integration", desc: "Gemma AI integration brought 8 scanners under one roof." },
  { year: "2026 Q1", title: "10,000 Organizations", desc: "Crossed 10k teams. Opened Series A led by top-tier VCs." },
  { year: "2026 Q3", title: "Cyber Academy Launch", desc: "80+ lessons across 8 tracks, free for all users." },
];

export function AboutPage() {
  return (
    <div>
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#00d4ff]">
              About CyberShield AI
            </span>
            <h1 className="mt-3 text-4xl sm:text-6xl font-bold tracking-tight leading-tight">
              We believe every person deserves{" "}
              <span className="gradient-text">verifiable digital trust</span>.
            </h1>
            <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
              CyberShield AI was founded in 2024 by a team of security researchers
              who were tired of watching organizations get breached by threats
              that existing tools should have caught. Phishing emails that sailed
              past email gateways. Deepfakes that fooled finance teams. QR codes
              that redirected to credential-harvesting pages.
            </p>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              The problem wasn't the technology — it was the fragmentation.
              Different tools for different threat surfaces, none of them talking
              to each other, none of them reasoning across modalities the way a
              human analyst would. We set out to fix that. The result is
              CyberShield AI: one platform, eight scanners, multimodal AI reasoning,
              and a single source of truth for every digital threat.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-12 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Target size={40} className="mx-auto text-[#00d4ff] mb-4" />
          <p className="text-2xl sm:text-3xl font-medium leading-relaxed">
            "To make <span className="gradient-text">verifiable trust</span> accessible
            to every person and organization on earth — regardless of size,
            budget, or technical expertise."
          </p>
          <p className="mt-4 text-sm text-muted-foreground">— CyberShield AI Mission Statement</p>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Our Values</h2>
            <p className="mt-3 text-muted-foreground">The principles behind every product decision.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <GlassCard variant="hover" className="p-6 h-full">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${v.color}15`, border: `1px solid ${v.color}30` }}
                  >
                    <v.icon size={22} style={{ color: v.color }} strokeWidth={2.2} />
                  </div>
                  <h3 className="font-semibold mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Our Journey</h2>
          </div>
          <div className="relative">
            <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#00d4ff] via-[#a855f7] to-transparent" />
            <div className="space-y-8">
              {MILESTONES.map((m, i) => (
                <motion.div
                  key={m.year}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className={`relative flex items-start gap-6 ${i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"}`}
                >
                  <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#00d4ff] ring-4 ring-[#00d4ff]/20 z-10 mt-1.5" />
                  <div className="pl-12 sm:pl-0 sm:w-1/2 sm:px-8">
                    <GlassCard className="p-5">
                      <span className="text-xs font-mono text-[#00d4ff]">{m.year}</span>
                      <h3 className="font-semibold mt-1">{m.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{m.desc}</p>
                    </GlassCard>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              The team behind <span className="gradient-text">CyberShield</span>
            </h2>
            <p className="mt-3 text-muted-foreground">
              47 people across 11 countries, united by one mission.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {TEAM.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <GlassCard variant="hover" className="p-5 text-center h-full">
                  <div
                    className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center text-lg font-bold text-[#0a0e1a] mb-3"
                    style={{ background: `linear-gradient(135deg, ${member.color}, ${member.color}99)` }}
                  >
                    {member.avatar}
                  </div>
                  <p className="text-sm font-semibold">{member.name}</p>
                  <p className="text-xs text-[#00d4ff] mt-0.5">{member.role}</p>
                  <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">{member.bio}</p>
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
            <Users size={32} className="mx-auto text-[#00d4ff] mb-4" />
            <h2 className="text-3xl font-bold tracking-tight">Join our mission</h2>
            <p className="mt-3 text-muted-foreground">
              Whether you want to use CyberShield or join our team, we'd love to hear from you.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <CyberButton size="lg" to={ROUTES.register}>Get started free</CyberButton>
              <CyberButton size="lg" variant="outline" to={ROUTES.contact}>Contact us</CyberButton>
            </div>
          </GlassCard>
        </div>
      </section>
    </div>
  );
}
