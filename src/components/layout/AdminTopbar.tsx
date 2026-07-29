"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Bell, Menu, Moon, Sun, ChevronDown, User, Settings as SettingsIcon,
  LogOut, Check, ShieldAlert,
} from "lucide-react";
import { navigate, hrefFor, useHashRoute } from "@/hooks/use-router";
import { ROUTES } from "@/lib/routes";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useToast } from "@/hooks/use-toast";
import { ADMIN_USER } from "@/lib/mock-data/admin";
import { Logo } from "@/components/shared/Logo";
import { cn } from "@/lib/utils";

const ADMIN_NOTIFS = [
  { id: "an1", title: "Suspicious login blocked", message: "5 failed attempts from IP 45.227.255.206", time: "5m ago", severity: "critical" },
  { id: "an2", title: "Storage 67% full", message: "684 GB / 1024 GB used", time: "1h ago", severity: "high" },
  { id: "an3", title: "New user pending approval", message: "maria.santos@retail.mx awaiting verification", time: "2h ago", severity: "info" },
  { id: "an4", title: "Database backup completed", message: "Automated backup — 684 GB", time: "5h ago", severity: "info" },
];

export function AdminTopbar({ onMobileMenu }: { onMobileMenu?: () => void }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const { logout } = useAdminAuth();
  const { toast } = useToast();
  const [searchFocused, setSearchFocused] = useState(false);
  const [path] = useHashRoute();

  const pageTitle = (() => {
    if (path === ROUTES.adminDashboard || path === ROUTES.admin) return "Dashboard";
    if (path === ROUTES.adminUsers) return "User Management";
    if (path === ROUTES.adminScans) return "Scan Management";
    if (path === ROUTES.adminReports) return "Reports";
    if (path === ROUTES.adminAnalytics) return "Analytics";
    if (path === ROUTES.adminAiUsage) return "AI Usage";
    if (path === ROUTES.adminAcademy) return "Cyber Academy";
    if (path === ROUTES.adminNotifications) return "Notifications";
    if (path === ROUTES.adminRoles) return "Roles & Permissions";
    if (path === ROUTES.adminAuditLogs) return "Audit Logs";
    if (path === ROUTES.adminSettings) return "System Settings";
    if (path === ROUTES.adminProfile) return "Admin Profile";
    return "Admin";
  })();

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (next === "light") {
        root.classList.remove("dark");
        root.classList.add("light");
      } else {
        root.classList.remove("light");
        root.classList.add("dark");
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-white/5 glass-strong">
      <div className="h-full flex items-center gap-3 px-4 sm:px-6">
        <button
          onClick={onMobileMenu}
          className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div className="lg:hidden">
          <Logo size="sm" showText={false} />
        </div>

        <div className="hidden lg:flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-red-500/20 text-red-400 border border-red-500/30">
            Admin
          </span>
          <h1 className="text-sm font-semibold">{pageTitle}</h1>
        </div>

        <div className="flex-1 max-w-md ml-auto">
          <div
            className={cn(
              "relative flex items-center gap-2 px-3 py-2 rounded-xl border transition-all",
              searchFocused
                ? "border-[#a855f7]/50 bg-[#a855f7]/5 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                : "border-white/10 bg-white/[0.03] hover:border-white/20"
            )}
          >
            <Search size={15} className="text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search users, scans, logs..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono text-muted-foreground bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
              ⌘K
            </kbd>
          </div>
        </div>

        <div className="flex items-center gap-1.5 ml-auto lg:ml-0">
          {/* System status pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-medium text-emerald-400">All systems operational</span>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait">
              {theme === "dark" ? (
                <motion.span
                  key="moon"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon size={18} />
                </motion.span>
              ) : (
                <motion.span
                  key="sun"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun size={18} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setNotifOpen((v) => !v);
                setUserOpen(false);
              }}
              className="relative p-2 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            </button>

            <AnimatePresence>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 mt-2 w-80 sm:w-96 glass-strong rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-3 border-b border-white/5 flex items-center justify-between">
                      <p className="text-sm font-semibold">Admin Notifications</p>
                      <button
                        onClick={() => {
                          navigate(ROUTES.adminNotifications);
                          setNotifOpen(false);
                        }}
                        className="text-xs text-[#a855f7] hover:underline"
                      >
                        Send alert
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto scrollbar-thin">
                      {ADMIN_NOTIFS.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => {
                            navigate(ROUTES.adminAuditLogs);
                            setNotifOpen(false);
                          }}
                          className="w-full text-left p-3 border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-start gap-2.5">
                            <span
                              className={cn(
                                "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                                n.severity === "critical" && "bg-red-500",
                                n.severity === "high" && "bg-orange-500",
                                n.severity === "info" && "bg-blue-500"
                              )}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold truncate">{n.title}</p>
                              <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                                {n.message}
                              </p>
                              <p className="text-[10px] text-muted-foreground/70 mt-1">{n.time}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => {
                setUserOpen((v) => !v);
                setNotifOpen(false);
              }}
              className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#a855f7] to-[#ec4899] flex items-center justify-center text-xs font-bold text-white">
                {ADMIN_USER.avatar}
              </div>
              <ChevronDown
                size={14}
                className={cn("text-muted-foreground transition-transform", userOpen && "rotate-180")}
              />
            </button>

            <AnimatePresence>
              {userOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 mt-2 w-56 glass-strong rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-3 border-b border-white/5">
                      <p className="text-sm font-semibold truncate">{ADMIN_USER.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{ADMIN_USER.email}</p>
                      <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                        {ADMIN_USER.role}
                      </span>
                    </div>
                    <div className="p-1.5">
                      {[
                        { icon: User, label: "Admin Profile", path: ROUTES.adminProfile },
                        { icon: SettingsIcon, label: "System Settings", path: ROUTES.adminSettings },
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={() => {
                            navigate(item.path);
                            setUserOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm hover:bg-white/5 transition-colors"
                        >
                          <item.icon size={15} className="text-muted-foreground" />
                          {item.label}
                        </button>
                      ))}
                    </div>
                    <div className="p-1.5 border-t border-white/5">
                      <button
                        onClick={() => {
                          // Clear mock admin session and return to admin login.
                          // Admin and user areas are fully separated — logout
                          // never returns to the user dashboard.
                          logout();
                          toast({
                            title: "Signed out",
                            description: "You have been logged out of the admin console.",
                          });
                          navigate(ROUTES.adminLogin);
                          setUserOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut size={15} />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
