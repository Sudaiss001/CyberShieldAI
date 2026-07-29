"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { goBack, navigate } from "@/hooks/use-router";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  /**
   * Fallback route if there's no browser history to go back to.
   * If not provided, falls back to "/".
   */
  fallback?: string;
  /**
   * Explicit label for the back button. Defaults to "Back".
   */
  label?: string;
  /**
   * Visual variant.
   * - "ghost": minimal text button (default, for placement in headers)
   * - "outline": bordered button (for standalone placement)
   * - "icon": icon-only square button (for compact spaces)
   */
  variant?: "ghost" | "outline" | "icon";
  /**
   * Size for the icon variant.
   */
  size?: "sm" | "md";
  /**
   * Optional className override.
   */
  className?: string;
}

/**
 * Universal back button used across all dashboard and admin pages.
 *
 * Uses browser history (window.history.back()) when available so the
 * browser Back/Forward buttons stay in sync. Falls back to the provided
 * `fallback` route (or home) if there's no history.
 */
export function BackButton({
  fallback,
  label = "Back",
  variant = "ghost",
  size = "md",
  className,
}: BackButtonProps) {
  const handleClick = () => {
    goBack(fallback);
  };

  if (variant === "icon") {
    const dim = size === "sm" ? "w-8 h-8" : "w-9 h-9";
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className={cn(
          "inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors",
          dim,
          className
        )}
        aria-label="Go back"
        title="Go back"
      >
        <ArrowLeft size={16} strokeWidth={2.4} />
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={{ x: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-1.5 font-medium transition-colors",
        variant === "ghost"
          ? "text-muted-foreground hover:text-foreground text-xs"
          : "px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-sm text-muted-foreground hover:text-foreground hover:bg-white/5",
        className
      )}
      aria-label={`Go back to ${fallback ?? "previous page"}`}
    >
      <ArrowLeft size={variant === "ghost" ? 13 : 15} strokeWidth={2.4} />
      {label}
    </motion.button>
  );
}
