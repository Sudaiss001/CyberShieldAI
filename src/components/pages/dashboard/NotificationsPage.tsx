"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, ShieldAlert, CheckCircle2, RefreshCw, GraduationCap, Settings,
  Check, Trash2, Filter,
} from "lucide-react";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { CyberButton } from "@/components/shared/CyberButton";
import { NOTIFICATIONS } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { NotificationItem } from "@/types";

const ICON_MAP = {
  threat: { icon: ShieldAlert, color: "#ef4444" },
  scan: { icon: CheckCircle2, color: "#10b981" },
  update: { icon: RefreshCw, color: "#00d4ff" },
  learning: { icon: GraduationCap, color: "#a855f7" },
  system: { icon: Settings, color: "#64748b" },
} as const;

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Threats", value: "threat" },
  { label: "Scans", value: "scan" },
  { label: "System", value: "system" },
] as const;

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationsPage() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<NotificationItem[]>(NOTIFICATIONS);
  const [filter, setFilter] = useState<string>("all");

  const filtered = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    return n.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast({ title: "All marked as read" });
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const remove = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast({ title: "Notification deleted" });
  };

  return (
    <div>
      <DashboardHeader
        title="Notifications"
        description={`${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`}
        breadcrumbs={[{ label: "Notifications" }]}
        icon={<Bell size={20} className="text-[#00d4ff]" />}
        showBack
        actions={
          <CyberButton variant="secondary" size="sm" onClick={markAllRead} icon={<Check size={14} />}>
            Mark all read
          </CyberButton>
        }
      />

      {/* Filters */}
      <GlassCard className="p-3 mb-5">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <Filter size={14} className="text-muted-foreground shrink-0 ml-1 mr-1" />
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                filter === f.value
                  ? "bg-[#00d4ff] text-[#0a0e1a]"
                  : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Notifications list */}
      {filtered.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Bell size={40} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-sm font-medium">No notifications</p>
          <p className="text-xs text-muted-foreground mt-1">You're all caught up!</p>
        </GlassCard>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((n, i) => {
              const cfg = ICON_MAP[n.type];
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25, delay: i * 0.03 }}
                >
                  <GlassCard
                    variant={n.read ? "default" : "strong"}
                    className={cn(
                      "p-4 flex items-start gap-3 hover:bg-white/[0.04] transition-colors cursor-pointer",
                      !n.read && "border-l-2"
                    )}
                    style={!n.read ? { borderLeftColor: cfg.color } : undefined}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}
                    >
                      <Icon size={18} style={{ color: cfg.color }} strokeWidth={2.2} />
                    </div>
                    <div className="flex-1 min-w-0" onClick={() => toggleRead(n.id)}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold flex items-center gap-2">
                            {n.title}
                            {!n.read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-pulse" />
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                          <p className="text-[10px] text-muted-foreground/70 mt-1.5">{timeAgo(n.timestamp)}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRead(n.id);
                            }}
                            className="p-1.5 rounded-md hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                            title={n.read ? "Mark unread" : "Mark read"}
                          >
                            <Check size={13} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              remove(n.id);
                            }}
                            className="p-1.5 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
