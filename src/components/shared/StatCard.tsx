"use client";

import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { AnimatedCounter } from "./AnimatedCounter";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  accentColor: string;
  trend?: { value: number; positive?: boolean };
  suffix?: string;
  prefix?: string;
  className?: string;
  delay?: number;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  accentColor,
  trend,
  suffix = "",
  prefix = "",
  className,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <GlassCard
        variant="hover"
        className={cn("p-5 relative overflow-hidden group", className)}
      >
        <div
          className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20 blur-2xl group-hover:opacity-40 transition-opacity"
          style={{ background: accentColor }}
        />
        <div className="flex items-start justify-between gap-3 relative">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              {title}
            </p>
            <div className="mt-2 text-3xl font-bold tracking-tight">
              <AnimatedCounter
                value={value}
                prefix={prefix}
                suffix={suffix}
                className="text-glow-blue"
              />
            </div>
            {trend && (
              <div className="mt-2 flex items-center gap-1 text-xs">
                <span
                  className={cn(
                    "font-semibold px-1.5 py-0.5 rounded-md",
                    trend.positive
                      ? "text-emerald-400 bg-emerald-500/10"
                      : "text-red-400 bg-red-500/10"
                  )}
                >
                  {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}%
                </span>
                <span className="text-muted-foreground">vs last week</span>
              </div>
            )}
          </div>
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: `${accentColor}1a`,
              border: `1px solid ${accentColor}40`,
            }}
          >
            <Icon size={20} style={{ color: accentColor }} strokeWidth={2.2} />
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
