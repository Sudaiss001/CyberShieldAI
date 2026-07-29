"use client";

import { cn } from "@/lib/utils";

interface CyberBackgroundProps {
  variant?: "grid" | "radial" | "mesh" | "all";
  className?: string;
  showFloatingIcons?: boolean;
}

/**
 * Animated cyber grid background with optional floating security icons.
 * Use behind full-page sections to give that premium cybersecurity feel.
 */
export function CyberBackground({
  variant = "all",
  className,
  showFloatingIcons = false,
}: CyberBackgroundProps) {
  return (
    <div className={cn("absolute inset-0 -z-10 overflow-hidden pointer-events-none", className)}>
      {variant === "grid" && <div className="absolute inset-0 cyber-grid" />}
      {variant === "radial" && <div className="absolute inset-0 cyber-radial" />}
      {variant === "mesh" && <div className="absolute inset-0 bg-mesh" />}
      {variant === "all" && (
        <>
          <div className="absolute inset-0 bg-mesh" />
          <div className="absolute inset-0 cyber-grid-fade opacity-60" />
          <div className="absolute inset-0 cyber-radial" />
        </>
      )}
      {showFloatingIcons && <FloatingIcons />}
    </div>
  );
}

function FloatingIcons() {
  const icons = [
    { emoji: "🛡", top: "12%", left: "8%", delay: 0, size: 28 },
    { emoji: "🔒", top: "20%", left: "85%", delay: 0.5, size: 24 },
    { emoji: "🚨", top: "65%", left: "12%", delay: 1, size: 22 },
    { emoji: "🔍", top: "75%", left: "80%", delay: 1.5, size: 26 },
    { emoji: "⚡", top: "40%", left: "92%", delay: 2, size: 22 },
    { emoji: "🛡", top: "85%", left: "50%", delay: 2.5, size: 20 },
  ];
  return (
    <>
      {icons.map((ic, i) => (
        <div
          key={i}
          className="absolute animate-float opacity-20"
          style={{
            top: ic.top,
            left: ic.left,
            animationDelay: `${ic.delay}s`,
            fontSize: ic.size,
          }}
        >
          {ic.emoji}
        </div>
      ))}
    </>
  );
}
