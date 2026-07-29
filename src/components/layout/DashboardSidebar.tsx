"use client";

import { motion } from "framer-motion";
import { Logo } from "@/components/shared/Logo";
import { DynamicIcon } from "@/components/shared/DynamicIcon";
import { navigate, hrefFor, useHashRoute } from "@/hooks/use-router";
import { SIDEBAR_NAV, SIDEBAR_FOOTER_NAV, ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { MOCK_USER } from "@/lib/mock-data";

export function DashboardSidebar({ onItemClick }: { onItemClick?: () => void }) {
  const [path] = useHashRoute();

  const sections = [
    { key: "main", label: "" },
    { key: "scanners", label: "Scanners" },
    { key: "account", label: "Account" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="h-16 flex items-center px-5 border-b border-white/5 shrink-0">
        <Logo href={hrefFor(ROUTES.home)} size="md" showText />
      </div>

      <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-4 space-y-5">
        {sections.map((section) => (
          <div key={section.key}>
            {section.label && (
              <p className="px-3 mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {SIDEBAR_NAV.filter((n) => n.section === section.key).map((item) => {
                const active = path === item.path || path.startsWith(item.path + "/");
                return (
                  <a
                    key={item.path}
                    href={hrefFor(item.path)}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(item.path);
                      onItemClick?.();
                    }}
                    className={cn(
                      "group relative flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all",
                      active
                        ? "text-[#00d4ff] bg-[#00d4ff]/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="sidebar-active"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-[#00d4ff] shadow-[0_0_10px_#00d4ff]"
                      />
                    )}
                    <DynamicIcon
                      name={item.icon}
                      size={17}
                      strokeWidth={2.2}
                      className={cn("shrink-0", active && "drop-shadow-[0_0_4px_rgba(0,212,255,0.6)]")}
                    />
                    <span className="flex-1 truncate">{item.label}</span>
                    {"badge" in item && item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-red-500/20 text-red-400 border border-red-500/30">
                        {item.badge}
                      </span>
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-white/5 space-y-0.5 shrink-0">
        {SIDEBAR_FOOTER_NAV.map((item) => {
          const isLogout = item.label === "Logout";
          return (
            <a
              key={item.label}
              href={hrefFor(item.path)}
              onClick={(e) => {
                e.preventDefault();
                // User logout navigates to /login (set in routes.ts).
                // Admin access has been fully removed from the user sidebar.
                navigate(item.path);
                onItemClick?.();
              }}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all",
                isLogout
                  ? "text-muted-foreground hover:text-red-400 hover:bg-red-500/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              <DynamicIcon name={item.icon} size={17} strokeWidth={2.2} className="shrink-0" />
              <span>{item.label}</span>
            </a>
          );
        })}

        <div className="mt-2 p-2.5 flex items-center gap-2.5 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#a855f7] flex items-center justify-center text-xs font-bold text-[#0a0e1a] shrink-0">
            {MOCK_USER.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">{MOCK_USER.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">{MOCK_USER.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
