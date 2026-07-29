"use client";

import { motion } from "framer-motion";
import { Logo } from "@/components/shared/Logo";
import { DynamicIcon } from "@/components/shared/DynamicIcon";
import { navigate, hrefFor, useHashRoute } from "@/hooks/use-router";
import { ADMIN_SIDEBAR_NAV, ADMIN_SIDEBAR_FOOTER_NAV, ROUTES } from "@/lib/routes";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ADMIN_USER } from "@/lib/mock-data/admin";

export function AdminSidebar({ onItemClick }: { onItemClick?: () => void }) {
  const [path] = useHashRoute();
  const { logout } = useAdminAuth();
  const { toast } = useToast();

  const sections = [
    { key: "main", label: "" },
    { key: "manage", label: "Management" },
    { key: "system", label: "System" },
    { key: "account", label: "Account" },
  ];

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    // Clear the mock admin session
    logout();
    toast({
      title: "Signed out",
      description: "You have been logged out of the admin console.",
    });
    // Redirect to admin login (NOT the user dashboard — areas are fully separated)
    navigate(ROUTES.adminLogin);
    onItemClick?.();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="h-16 flex items-center px-5 border-b border-white/5 shrink-0">
        {/* Admin logo is non-clickable — there is no path back to the user area. */}
        <Logo size="md" showText />
        <span className="ml-2 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-red-500/20 text-red-400 border border-red-500/30">
          Admin
        </span>
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
              {ADMIN_SIDEBAR_NAV.filter((n) => n.section === section.key).map((item) => {
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
                        ? "text-[#a855f7] bg-[#a855f7]/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="admin-sidebar-active"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-[#a855f7] shadow-[0_0_10px_#a855f7]"
                      />
                    )}
                    <DynamicIcon
                      name={item.icon}
                      size={17}
                      strokeWidth={2.2}
                      className={cn("shrink-0", active && "drop-shadow-[0_0_4px_rgba(168,85,247,0.6)]")}
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
        {ADMIN_SIDEBAR_FOOTER_NAV.map((item) => {
          const isLogout = item.label === "Logout";
          return (
            <a
              key={item.label}
              href={hrefFor(item.path)}
              onClick={isLogout ? handleLogout : (e) => {
                e.preventDefault();
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
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#a855f7] to-[#ec4899] flex items-center justify-center text-xs font-bold text-white shrink-0">
            {ADMIN_USER.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">{ADMIN_USER.name}</p>
            <p className="text-[10px] text-red-400 truncate">{ADMIN_USER.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
