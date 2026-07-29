"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, Send, AlertTriangle, Megaphone, Wrench, Users,
  ShieldAlert, Check, Eye, Mail,
} from "lucide-react";
import { AdminHeader } from "@/components/shared/AdminHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { CyberButton } from "@/components/shared/CyberButton";
import { useToast } from "@/hooks/use-toast";
import { ADMIN_NOTIFICATIONS_HISTORY } from "@/lib/mock-data/admin";
import { cn } from "@/lib/utils";

type NotifType = "announcement" | "security" | "maintenance";
type Audience = "all" | "admins" | "enterprise" | "selected";

const TYPE_CONFIG: Record<NotifType, { label: string; icon: any; color: string; desc: string }> = {
  announcement: { label: "Announcement", icon: Megaphone, color: "#00d4ff", desc: "General update or feature news" },
  security: { label: "Security Alert", icon: ShieldAlert, color: "#ef4444", desc: "Active threat or vulnerability notice" },
  maintenance: { label: "Maintenance Notice", icon: Wrench, color: "#f59e0b", desc: "Scheduled downtime or system update" },
};

const AUDIENCE_OPTIONS: { id: Audience; label: string; desc: string; count: string }[] = [
  { id: "all", label: "All Users", desc: "Send to every registered user", count: "12,483" },
  { id: "admins", label: "Admins Only", desc: "Super Admins, Admins, Moderators", count: "34" },
  { id: "enterprise", label: "Enterprise", desc: "Enterprise plan subscribers", count: "1,247" },
  { id: "selected", label: "Selected Users", desc: "Choose specific recipients", count: "—" },
];

const CHANNELS = [
  { id: "inapp", label: "In-App", icon: Bell, enabled: true },
  { id: "email", label: "Email", icon: Mail, enabled: true },
  { id: "push", label: "Push", icon: Send, enabled: false },
];

export function AdminNotificationsPage() {
  const { toast } = useToast();
  const [type, setType] = useState<NotifType>("announcement");
  const [audience, setAudience] = useState<Audience>("all");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [channels, setChannels] = useState<Record<string, boolean>>({ inapp: true, email: true, push: false });
  const [preview, setPreview] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast({ title: "Missing fields", description: "Title and message are required.", variant: "destructive" });
      return;
    }
    const cfg = TYPE_CONFIG[type];
    const aud = AUDIENCE_OPTIONS.find((a) => a.id === audience)!;
    toast({
      title: `${cfg.label} sent!`,
      description: `Delivered to ${aud.count} ${aud.label.toLowerCase()} via ${Object.entries(channels).filter(([, v]) => v).map(([k]) => k).join(", ")}.`,
    });
    setTitle("");
    setMessage("");
  };

  return (
    <div>
      <AdminHeader
        title="Notifications"
        description="Send platform-wide announcements, security alerts, and maintenance notices."
        breadcrumbs={[{ label: "Notifications" }]}
        icon={<Bell size={20} className="text-[#a855f7]" />}
        showBack
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Compose form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Type selector */}
          <GlassCard className="p-5">
            <h3 className="font-semibold mb-3">Notification Type</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(Object.keys(TYPE_CONFIG) as NotifType[]).map((t) => {
                const cfg = TYPE_CONFIG[t];
                return (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={cn(
                      "p-4 rounded-xl border-2 text-left transition-all",
                      type === t ? "scale-[1.02]" : "border-white/10 bg-white/[0.02] hover:border-white/20"
                    )}
                    style={type === t ? { borderColor: `${cfg.color}80`, background: `${cfg.color}10` } : undefined}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center mb-2"
                      style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}
                    >
                      <cfg.icon size={18} style={{ color: cfg.color }} strokeWidth={2.2} />
                    </div>
                    <p className="text-sm font-semibold">{cfg.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{cfg.desc}</p>
                  </button>
                );
              })}
            </div>
          </GlassCard>

          {/* Compose form */}
          <form onSubmit={handleSubmit}>
            <GlassCard className="p-5 space-y-4">
              <h3 className="font-semibold">Compose Message</h3>

              <div>
                <label className="text-xs font-medium mb-1.5 block">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. New phishing campaign targeting financial sector"
                  maxLength={120}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm outline-none focus:border-[#a855f7]/50 transition-all"
                />
                <p className="text-[10px] text-muted-foreground mt-1">{title.length}/120 characters</p>
              </div>

              <div>
                <label className="text-xs font-medium mb-1.5 block">Message</label>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your notification message here..."
                  maxLength={500}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm outline-none focus:border-[#a855f7]/50 transition-all resize-none"
                />
                <p className="text-[10px] text-muted-foreground mt-1">{message.length}/500 characters</p>
              </div>

              {/* Audience */}
              <div>
                <label className="text-xs font-medium mb-2 block">Audience</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {AUDIENCE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAudience(opt.id)}
                      className={cn(
                        "p-3 rounded-xl border text-left transition-all flex items-start gap-2",
                        audience === opt.id ? "border-[#a855f7]/50 bg-[#a855f7]/5" : "border-white/10 bg-white/[0.02] hover:border-white/20"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center",
                        audience === opt.id ? "border-[#a855f7]" : "border-white/30"
                      )}>
                        {audience === opt.id && <span className="w-2 h-2 rounded-full bg-[#a855f7]" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold">{opt.label}</p>
                        <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
                        <p className="text-[10px] font-mono mt-0.5" style={{ color: "#a855f7" }}>{opt.count} recipients</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Channels */}
              <div>
                <label className="text-xs font-medium mb-2 block">Delivery Channels</label>
                <div className="flex flex-wrap gap-2">
                  {CHANNELS.map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setChannels((prev) => ({ ...prev, [ch.id]: !prev[ch.id] }))}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all",
                        channels[ch.id] ? "border-[#a855f7]/50 bg-[#a855f7]/10 text-[#a855f7]" : "border-white/10 bg-white/[0.02] text-muted-foreground"
                      )}
                    >
                      <ch.icon size={13} />
                      {ch.label}
                      {channels[ch.id] && <Check size={12} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setPreview(true)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <Eye size={12} /> Preview
                </button>
                <CyberButton type="submit" icon={<Send size={14} />}>
                  Send notification
                </CyberButton>
              </div>
            </GlassCard>
          </form>
        </div>

        {/* Sidebar — history */}
        <div>
          <GlassCard className="p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Recent Notifications</h3>
              <span className="text-[10px] text-muted-foreground">{ADMIN_NOTIFICATIONS_HISTORY.length} sent</span>
            </div>
            <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-thin pr-1">
              {ADMIN_NOTIFICATIONS_HISTORY.map((n, i) => {
                const cfg = TYPE_CONFIG[n.type as NotifType];
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/5"
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}
                      >
                        <cfg.icon size={13} style={{ color: cfg.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{n.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{n.audience}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                          <span>{new Date(n.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                          <span>{((n.opened / n.sent) * 100).toFixed(0)}% open rate</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Preview modal */}
      <AnimatePresence>
        {preview && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              onClick={() => setPreview(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md"
            >
              <GlassCard variant="strong" className="p-5">
                <h3 className="font-semibold mb-3">Preview</h3>
                <div
                  className="rounded-xl p-4 border"
                  style={{
                    background: `${TYPE_CONFIG[type].color}10`,
                    borderColor: `${TYPE_CONFIG[type].color}30`,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${TYPE_CONFIG[type].color}20`, border: `1px solid ${TYPE_CONFIG[type].color}40` }}
                    >
                      <PreviewIcon type={type} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{title || "Your notification title"}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{message || "Your notification message will appear here..."}</p>
                      <p className="text-[10px] text-muted-foreground mt-2">
                        Audience: {AUDIENCE_OPTIONS.find((a) => a.id === audience)?.label}
                      </p>
                    </div>
                  </div>
                </div>
                <CyberButton variant="secondary" fullWidth className="mt-4" onClick={() => setPreview(false)}>
                  Close preview
                </CyberButton>
              </GlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function PreviewIcon({ type }: { type: NotifType }) {
  const Icon = TYPE_CONFIG[type].icon;
  const color = TYPE_CONFIG[type].color;
  return <Icon size={16} style={{ color }} />;
}
