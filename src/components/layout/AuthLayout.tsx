"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { CyberBackground } from "@/components/shared/CyberBackground";
import { Logo } from "@/components/shared/Logo";
import { navigate, hrefFor, goBack } from "@/hooks/use-router";
import { ROUTES } from "@/lib/routes";
import { ShieldCheck, ScanLine, Eye, Cpu, ArrowLeft } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 relative">
      <CyberBackground variant="all" />

      {/* Left side — form */}
      <div className="flex items-center justify-center p-6 sm:p-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <Logo href={hrefFor("/")} size="lg" />
          </div>

          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          </div>

          <div className="glass-card rounded-2xl p-6 sm:p-8">{children}</div>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            <button
              onClick={() => goBack(ROUTES.home)}
              className="hover:text-[#00d4ff] transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft size={12} /> Back to home
            </button>
          </div>
        </motion.div>
      </div>

      {/* Right side — feature panel */}
      <div className="hidden lg:flex items-center justify-center p-10 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative max-w-md"
        >
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[#00d4ff]/10 blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-[#a855f7]/10 blur-3xl" />
          </div>

          <div className="space-y-6">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#00d4ff] bg-[#00d4ff]/10 px-3 py-1 rounded-full border border-[#00d4ff]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-pulse" />
                Multimodal AI Security
              </span>
              <h2 className="mt-4 text-3xl font-bold leading-tight">
                See It. <span className="gradient-text">Hear It.</span> Verify It.
              </h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Your AI Security Analyst for every digital threat — emails, URLs,
                screenshots, QR codes, documents, audio, and videos.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { icon: ScanLine, label: "8 specialized scanners", desc: "URL, email, image, document, audio, video, QR & universal AI" },
                { icon: Cpu, label: "Powered by Gemma AI", desc: "Multimodal reasoning with 96%+ deepfake detection accuracy" },
                { icon: Eye, label: "Threat intelligence", desc: "Cross-references 12M+ IOCs updated every 5 minutes" },
                { icon: ShieldCheck, label: "Enterprise-grade", desc: "SOC 2 Type II, GDPR/CCPA compliant, end-to-end encrypted" },
              ].map((feat, i) => (
                <motion.div
                  key={feat.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex gap-3 glass rounded-xl p-3.5"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center shrink-0">
                    <feat.icon size={16} className="text-[#00d4ff]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{feat.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{feat.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
