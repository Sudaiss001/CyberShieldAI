"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";
import { ChevronRight, Home } from "lucide-react";
import { navigate, hrefFor } from "@/hooks/use-router";
import { ROUTES } from "@/lib/routes";
import { BackButton } from "./BackButton";

interface DashboardHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; path?: string }[];
  actions?: ReactNode;
  icon?: ReactNode;
  /**
   * Show a Back button above the title. Pass `true` to use the default
   * fallback (dashboard home), or pass a specific path string.
   */
  showBack?: boolean | string;
}

export function DashboardHeader({
  title,
  description,
  breadcrumbs = [],
  actions,
  icon,
  showBack = false,
}: DashboardHeaderProps) {
  const fallback = typeof showBack === "string" ? showBack : ROUTES.dashboard;

  return (
    <div className="mb-6">
      {/* Back button row */}
      {showBack && (
        <div className="mb-3">
          <BackButton fallback={fallback} />
        </div>
      )}

      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3" aria-label="Breadcrumb">
          <button
            onClick={() => navigate(ROUTES.dashboard)}
            className="hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Home size={12} />
            Home
          </button>
          {breadcrumbs.map((bc, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <ChevronRight size={12} className="text-muted-foreground/50" />
              {bc.path ? (
                <a
                  href={hrefFor(bc.path)}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(bc.path!);
                  }}
                  className="hover:text-foreground transition-colors"
                >
                  {bc.label}
                </a>
              ) : (
                <span className="text-foreground" aria-current="page">{bc.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          {icon && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-11 h-11 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center shrink-0"
            >
              {icon}
            </motion.div>
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground max-w-2xl">{description}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
      </div>
    </div>
  );
}
