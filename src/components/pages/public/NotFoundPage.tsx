"use client";

import { motion } from "framer-motion";
import { Home, Search, Shield, AlertTriangle } from "lucide-react";
import { CyberButton } from "@/components/shared/CyberButton";
import { GlassCard } from "@/components/shared/GlassCard";
import { ROUTES } from "@/lib/routes";

export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full text-center"
      >
        <div className="relative mb-8">
          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex w-24 h-24 rounded-3xl bg-gradient-to-br from-[#ef4444]/20 to-[#a855f7]/20 border border-[#ef4444]/30 items-center justify-center mb-6"
          >
            <AlertTriangle size={48} className="text-[#ef4444]" />
          </motion.div>
          <div className="absolute inset-0 -z-10 blur-3xl">
            <div className="w-32 h-32 mx-auto rounded-full bg-[#ef4444]/20" />
          </div>
        </div>

        <h1 className="text-7xl sm:text-8xl font-bold gradient-text mb-2">404</h1>
        <h2 className="text-xl font-semibold mb-2">Threat detected: Missing page</h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved. Our AI
          security analyst recommends verifying the URL.
        </p>

        <GlassCard className="p-4 mb-6 inline-flex items-center gap-2 text-xs text-muted-foreground">
          <Shield size={14} className="text-[#00d4ff]" />
          <span>Error code: <span className="font-mono text-[#00d4ff]">CSAI-404-NOT-FOUND</span></span>
        </GlassCard>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <CyberButton to={ROUTES.home} icon={<Home size={16} />}>
            Back to home
          </CyberButton>
          <CyberButton variant="outline" to={ROUTES.help} icon={<Search size={16} />}>
            Search help center
          </CyberButton>
        </div>
      </motion.div>
    </div>
  );
}
