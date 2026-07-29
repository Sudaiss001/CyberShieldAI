"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
  href?: string;
}

export function Logo({ size = "md", showText = true, className, href }: LogoProps) {
  const sizes = {
    sm: { icon: 16, text: "text-base", gap: "gap-1.5", padding: "p-1" },
    md: { icon: 22, text: "text-lg", gap: "gap-2", padding: "p-1.5" },
    lg: { icon: 30, text: "text-2xl", gap: "gap-2.5", padding: "p-2" },
  }[size];

  const content = (
    <div className={cn("flex items-center", sizes.gap, className)}>
      <motion.div
        initial={{ rotate: -10, scale: 0.9 }}
        animate={{ rotate: 0, scale: 1 }}
        whileHover={{ rotate: 5, scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className={cn(
          "relative rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#a855f7] flex items-center justify-center",
          sizes.padding,
          "shadow-[0_0_20px_rgba(0,212,255,0.5)]"
        )}
      >
        <Shield
          size={sizes.icon}
          className="text-white fill-white/20"
          strokeWidth={2.5}
        />
      </motion.div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={cn("font-bold tracking-tight", sizes.text)}>
            CyberShield
            <span className="gradient-text"> AI</span>
          </span>
          {size === "lg" && (
            <span className="text-[10px] text-muted-foreground tracking-widest uppercase mt-0.5">
              See It. Hear It. Verify It.
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <a href={href} className="inline-block">
        {content}
      </a>
    );
  }
  return content;
}
