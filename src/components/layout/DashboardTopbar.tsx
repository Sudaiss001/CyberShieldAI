"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  Menu,
  Upload,
  Moon,
  Sun,
  ChevronDown,
  User,
  Settings as SettingsIcon,
  LogOut,
  Check,
} from "lucide-react";
import { navigate, hrefFor, useHashRoute } from "@/hooks/use-router";
import { ROUTES } from "@/lib/routes";
import { MOCK_USER, NOTIFICATIONS } from "@/lib/mock-data";
import { Logo } from "@/components/shared/Logo";
import { DashboardSidebar } from "./DashboardSidebar";
import { cn } from "@/lib/utils";

export function DashboardTopbar({ onMobileMenu }: { onMobileMenu?: () => void }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const unreadCount = NOTIFICATIONS.filter((n) => !n.read).length;

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
        {/* Mobile menu button */}
        <button
          onClick={onMobileMenu}
          className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Mobile logo */}
        <div className="lg:hidden">
          <Logo size="sm" showText={false} />
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md">
          <div
            className={cn(
              "relative flex items-center gap-2 px-3 py-2 rounded-xl border transition-all",
              searchFocused
                ? "border-[#00d4ff]/50 bg-[#00d4ff]/5 shadow-[0_0_20px_rgba(0,212,255,0.15)]"
                : "border-white/10 bg-white/[0.03] hover:border-white/20"
            )}
          >
            <Search size={15} className="text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search scans, reports, threats..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono text-muted-foreground bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
              ⌘K
            </kbd>
          </div>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          {/* Upload button */}
          <button
            onClick={() => navigate(ROUTES.aiScanner)}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#00d4ff] to-[#0099cc] text-[#0a0e1a] hover:shadow-[0_4px_20px_rgba(0,212,255,0.4)] transition-all"
          >
            <Upload size={15} strokeWidth={2.4} />
            <span className="hidden md:inline">New Scan</span>
          </button>

          {/* Theme toggle */}
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
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
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
                      <p className="text-sm font-semibold">Notifications</p>
                      <button
                        onClick={() => {
                          navigate(ROUTES.notifications);
                          setNotifOpen(false);
                        }}
                        className="text-xs text-[#00d4ff] hover:underline"
                      >
                        View all
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto scrollbar-thin">
                      {NOTIFICATIONS.slice(0, 4).map((n) => (
                        <button
                          key={n.id}
                          onClick={() => {
                            navigate(ROUTES.notifications);
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
                                n.severity === "medium" && "bg-amber-500",
                                n.severity === "low" && "bg-cyan-500",
                                n.severity === "info" && "bg-blue-500"
                              )}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold truncate">{n.title}</p>
                              <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                                {n.message}
                              </p>
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
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#a855f7] flex items-center justify-center text-xs font-bold text-[#0a0e1a]">
                {MOCK_USER.avatar}
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
                      <p className="text-sm font-semibold truncate">{MOCK_USER.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{MOCK_USER.email}</p>
                    </div>
                    <div className="p-1.5">
                      {[
                        { icon: User, label: "Profile", path: ROUTES.profile },
                        { icon: SettingsIcon, label: "Settings", path: ROUTES.settings },
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
                          navigate(ROUTES.home);
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
