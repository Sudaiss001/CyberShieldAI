"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { navigate, hrefFor } from "@/hooks/use-router";
import { ROUTES } from "@/lib/routes";
import { BackButton } from "./BackButton";

interface AdminHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; path?: string }[];
  actions?: ReactNode;
  icon?: ReactNode;
  /**
   * Show a Back button above the title. Pass `true` to use the default
   * fallback (admin dashboard), or pass a specific path string.
   */
  showBack?: boolean | string;
}

export function AdminHeader({
  title,
  description,
  breadcrumbs = [],
  actions,
  icon,
  showBack = false,
}: AdminHeaderProps) {
  const fallback = typeof showBack === "string" ? showBack : ROUTES.adminDashboard;

  return (
    <div className="mb-6">
      {/* Back button row */}
      {showBack && (
        <div className="mb-3">
          <BackButton fallback={fallback} />
        </div>
      )}

      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3" aria-label="Breadcrumb">
          <button
            onClick={() => navigate(ROUTES.adminDashboard)}
            className="hover:text-foreground transition-colors flex items-center gap-1"
          >
            <ShieldCheck size={12} className="text-[#a855f7]" />
            Admin
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
              className="w-11 h-11 rounded-xl bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center shrink-0"
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
