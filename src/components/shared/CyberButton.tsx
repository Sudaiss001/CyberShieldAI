"use client";

import { forwardRef, type ReactNode, type MouseEvent } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { navigate, hrefFor } from "@/hooks/use-router";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "success";
type Size = "sm" | "md" | "lg" | "icon";

interface CyberButtonProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  to?: string; // internal hash route
  href?: string; // external URL
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  icon?: ReactNode;
  iconRight?: ReactNode;
  glow?: boolean;
  fullWidth?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-[#00d4ff] to-[#0099cc] text-[#0a0e1a] hover:from-[#00d4ff] hover:to-[#00b8e6] shadow-[0_4px_20px_rgba(0,212,255,0.4)]",
  secondary:
    "bg-white/5 text-foreground border border-white/10 hover:bg-white/10 backdrop-blur",
  ghost: "text-foreground hover:bg-white/5",
  outline:
    "border border-[#00d4ff]/40 text-[#00d4ff] hover:bg-[#00d4ff]/10 hover:border-[#00d4ff]/70",
  danger:
    "bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white hover:from-[#f87171] hover:to-[#ef4444] shadow-[0_4px_20px_rgba(239,68,68,0.3)]",
  success:
    "bg-gradient-to-r from-[#10b981] to-[#059669] text-white hover:from-[#34d399] hover:to-[#10b981] shadow-[0_4px_20px_rgba(16,185,129,0.3)]",
};

const SIZES: Record<Size, string> = {
  sm: "text-xs px-3 py-1.5 gap-1.5 rounded-lg",
  md: "text-sm px-4 py-2.5 gap-2 rounded-xl",
  lg: "text-base px-6 py-3 gap-2 rounded-xl",
  icon: "p-2 rounded-lg",
};

export const CyberButton = forwardRef<HTMLButtonElement, CyberButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      to,
      href,
      onClick,
      className,
      disabled,
      type = "button",
      icon,
      iconRight,
      glow = false,
      fullWidth = false,
    },
    ref
  ) => {
    const baseClass = cn(
      "inline-flex items-center justify-center font-semibold transition-all",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d4ff] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:opacity-50 disabled:pointer-events-none",
      VARIANTS[variant],
      SIZES[size],
      glow && "animate-pulse-glow",
      fullWidth && "w-full",
      className
    );

    const content = (
      <>
        {icon && <span className="shrink-0">{icon}</span>}
        {children}
        {iconRight && <span className="shrink-0">{iconRight}</span>}
      </>
    );

    const handleClick = (e: MouseEvent) => {
      if (disabled) {
        e.preventDefault();
        return;
      }
      if (to) {
        e.preventDefault();
        navigate(to);
      } else if (href) {
        window.open(href, "_blank", "noopener,noreferrer");
      } else if (onClick) {
        onClick();
      }
    };

    // If `to` or `href` is provided, render an anchor for accessibility
    if (to || href) {
      const linkHref = to ? hrefFor(to) : href;
      return (
        <motion.a
          href={linkHref}
          onClick={handleClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className={baseClass}
          aria-disabled={disabled}
        >
          {content}
        </motion.a>
      );
    }

    return (
      <motion.button
        ref={ref}
        type={type}
        onClick={handleClick}
        disabled={disabled}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className={baseClass}
      >
        {content}
      </motion.button>
    );
  }
);
CyberButton.displayName = "CyberButton";
