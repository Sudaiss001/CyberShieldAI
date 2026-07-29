"use client";

import * as Icons from "lucide-react";
import { type LucideIcon } from "lucide-react";

/**
 * Wraps a dynamic lucide icon lookup so it can be safely rendered without
 * triggering the react-hooks/static-components lint rule.
 *
 * Usage: <DynamicIcon name="Shield" size={20} className="text-emerald-400" />
 */
export function DynamicIcon({
  name,
  fallback = "Sparkles",
  ...props
}: {
  name: string;
  fallback?: string;
} & React.ComponentProps<LucideIcon>) {
  const Icon =
    (Icons as unknown as Record<string, LucideIcon>)[name] ??
    (Icons as unknown as Record<string, LucideIcon>)[fallback] ??
    Icons.Circle;
  return <Icon {...props} />;
}

export function getIcon(name: string, fallback = "Sparkles"): LucideIcon {
  return (
    (Icons as unknown as Record<string, LucideIcon>)[name] ??
    (Icons as unknown as Record<string, LucideIcon>)[fallback] ??
    Icons.Circle
  );
}
