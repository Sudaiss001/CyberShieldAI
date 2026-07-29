"use client";

import { cn } from "@/lib/utils";
import { ShieldCheck, ShieldAlert, ShieldX, Shield, ShieldMinus } from "lucide-react";
import type { ThreatLevel } from "@/types";

interface ThreatBadgeProps {
  level: ThreatLevel;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

const CONFIG: Record<
  ThreatLevel,
  { label: string; color: string; bg: string; icon: typeof Shield }
> = {
  critical: {
    label: "Critical",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
    icon: ShieldX,
  },
  high: {
    label: "High",
    color: "#f97316",
    bg: "rgba(249,115,22,0.12)",
    icon: ShieldAlert,
  },
  medium: {
    label: "Medium",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    icon: ShieldAlert,
  },
  low: {
    label: "Low",
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.12)",
    icon: ShieldMinus,
  },
  safe: {
    label: "Safe",
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
    icon: ShieldCheck,
  },
};

export function ThreatBadge({ level, size = "md", showIcon = true, className }: ThreatBadgeProps) {
  const c = CONFIG[level];
  const sizes = {
    sm: "text-[10px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-2",
  }[size];

  const iconSize = size === "sm" ? 11 : size === "md" ? 13 : 16;

  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold rounded-full border",
        sizes
      )}
      style={{
        color: c.color,
        background: c.bg,
        borderColor: `${c.color}40`,
      }}
    >
      {showIcon && <c.icon size={iconSize} strokeWidth={2.5} />}
      {c.label}
    </span>
  );
}
