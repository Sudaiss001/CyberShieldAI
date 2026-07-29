"use client";

import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "strong" | "hover";
  glow?: "none" | "blue" | "emerald" | "red" | "purple";
  borderGlow?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", glow = "none", borderGlow = false, children, ...props }, ref) => {
    const baseClass =
      variant === "strong"
        ? "glass-strong"
        : variant === "hover"
        ? "glass glass-hover"
        : "glass";

    const glowClass =
      glow === "blue"
        ? "glow-blue"
        : glow === "emerald"
        ? "glow-emerald"
        : glow === "red"
        ? "glow-red"
        : glow === "purple"
        ? "glow-purple"
        : "";

    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-2xl",
          baseClass,
          glowClass,
          borderGlow && "border-glow",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
GlassCard.displayName = "GlassCard";
