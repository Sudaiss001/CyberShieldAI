"use client";

import { motion } from "framer-motion";
import {
  GraduationCap, Fish, Bug, Users, Lock, KeyRound, Clapperboard,
  QrCode, Mail, ChevronRight, Award, BookOpen, Clock,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { CyberButton } from "@/components/shared/CyberButton";
import { ROUTES } from "@/lib/routes";
import { ACADEMY_CATEGORIES } from "@/lib/mock-data";

const ICON_MAP: Record<string, any> = {
  Fish, Bug, Users, Lock, KeyRound, Clapperboard, QrCode, Mail,
};

export function AcademyPublicPage() {
  return (
    <div>
      {/* Hero */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#a855f7]">
              Cyber Academy
            </span>
            <h1 className="mt-3 text-4xl sm:text-6xl font-bold tracking-tight leading-tight">
              Learn to spot threats{" "}
              <span className="gradient-text">before they spot you</span>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
              Cyber Academy is our free learning platform with 80+ lessons across
              8 cybersecurity tracks. From phishing defense to deepfake detection,
              our courses combine practical scenarios with real-world case studies.
              Sign up to track progress, earn certificates, and unlock achievements.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <CyberButton size="lg" to={ROUTES.register} icon={<GraduationCap size={18} />}>
                Start learning free
              </CyberButton>
              <CyberButton size="lg" variant="outline" to={ROUTES.features}>
                Browse curriculum
              </CyberButton>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, value: "80+", label: "Lessons" },
              { icon: Award, value: "8", label: "Tracks" },
              { icon: Clock, value: "12 hrs", label: "Total content" },
              { icon: GraduationCap, value: "50k+", label: "Learners" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon size={24} className="mx-auto text-[#00d4ff] mb-2" />
                <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            8 tracks. All free.
          </h2>
          <p className="text-muted-foreground mb-10">
            Pick a track or work through them all. Each lesson includes video,
            reading, and a hands-on quiz.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ACADEMY_CATEGORIES.map((cat, i) => {
              const Icon = ICON_MAP[cat.icon] ?? GraduationCap;
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <GlassCard variant="hover" className="p-5 h-full flex flex-col">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: `${cat.color}15`, border: `1px solid ${cat.color}30` }}
                    >
                      <Icon size={22} style={{ color: cat.color }} strokeWidth={2.2} />
                    </div>
                    <h3 className="font-semibold mb-1">{cat.title}</h3>
                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed flex-1">{cat.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{cat.lessonsCount} lessons</span>
                      <span
                        className="px-1.5 py-0.5 rounded-md font-medium"
                        style={{ background: `${cat.color}15`, color: cat.color }}
                      >
                        {cat.difficulty}
                      </span>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <GlassCard variant="strong" borderGlow className="p-10 sm:p-14 text-center">
            <Award size={32} className="mx-auto text-[#a855f7] mb-4" />
            <h2 className="text-3xl font-bold tracking-tight">
              Earn certificates. Build your reputation.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Complete any track to earn a verifiable certificate. Share it on LinkedIn
              or add it to your security portfolio.
            </p>
            <div className="mt-6">
              <CyberButton size="lg" to={ROUTES.register} icon={<ChevronRight size={18} />}>
                Create your free account
              </CyberButton>
            </div>
          </GlassCard>
        </div>
      </section>
    </div>
  );
}
