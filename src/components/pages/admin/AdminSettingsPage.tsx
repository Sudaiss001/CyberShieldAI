"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon, Globe, Shield, Palette, Bell,
  Cpu, DatabaseBackup, Wrench, Moon, Sun, Server, Key,
  Lock, Eye, Type, Mail, MessageSquare, Smartphone,
  Download, Trash2, AlertTriangle, Check, Power,
} from "lucide-react";
import { AdminHeader } from "@/components/shared/AdminHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { CyberButton } from "@/components/shared/CyberButton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "general", label: "General", icon: Globe },
  { id: "security", label: "Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "ai", label: "AI Configuration", icon: Cpu },
  { id: "backup", label: "Backup", icon: DatabaseBackup },
  { id: "maintenance", label: "Maintenance Mode", icon: Wrench },
];

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn(
        "relative w-11 h-6 rounded-full transition-colors",
        enabled ? "bg-[#a855f7]" : "bg-white/10"
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={cn(
          "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md",
          enabled ? "right-0.5" : "left-0.5"
        )}
      />
    </button>
  );
}

function SettingRow({
  icon: Icon, title, desc, children,
}: {
  icon: any; title: string; desc: string; children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 border-b border-white/5 last:border-0">
      <div className="flex items-start gap-3 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
          <Icon size={15} className="text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function AdminSettingsPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState("general");
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    sec_2fa: true,
    sec_captcha: true,
    sec_ipWhitelist: false,
    sec_sessionTimeout: true,
    sec_passwordPolicy: true,
    notif_email: true,
    notif_push: true,
    notif_sms: false,
    notif_criticalOnly: false,
    ai_streaming: true,
    ai_cache: true,
    ai_fallback: true,
    ai_logRequests: true,
    backup_auto: true,
    backup_encrypt: true,
    backup_compress: true,
    maintenance_mode: false,
    maintenance_allowAdmin: true,
  });

  const setToggle = (key: string) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
    toast({ title: "Setting updated" });
  };

  return (
    <div>
      <AdminHeader
        title="System Settings"
        description="Configure platform-wide settings, security, AI, backups, and maintenance."
        breadcrumbs={[{ label: "Settings" }]}
        icon={<SettingsIcon size={20} className="text-[#a855f7]" />}
        showBack
      />

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
        {/* Sidebar */}
        <GlassCard className="p-2 lg:sticky lg:top-20 h-fit">
          <div className="flex lg:flex-col gap-1 overflow-x-auto no-scrollbar">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all w-full",
                  tab === t.id
                    ? t.id === "maintenance" && toggles.maintenance_mode
                      ? "bg-red-500/10 text-red-400"
                      : "bg-[#a855f7]/10 text-[#a855f7]"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                <t.icon size={15} />
                <span className="truncate">{t.label}</span>
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Content */}
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          {tab === "general" && (
            <GlassCard>
              <div className="p-5 border-b border-white/5">
                <h3 className="font-semibold">General Settings</h3>
                <p className="text-xs text-muted-foreground mt-1">Platform-wide configuration.</p>
              </div>
              <SettingRow icon={Type} title="Platform Name" desc="Displayed throughout the app">
                <input
                  type="text"
                  defaultValue="CyberShield AI"
                  className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-sm outline-none focus:border-[#a855f7]/50 w-48"
                />
              </SettingRow>
              <SettingRow icon={Globe} title="Default Language" desc="Interface language for new users">
                <select className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-sm outline-none focus:border-[#a855f7]/50">
                  <option>English (US)</option>
                  <option>English (UK)</option>
                  <option>Français</option>
                  <option>Deutsch</option>
                  <option>日本語</option>
                  <option>中文</option>
                </select>
              </SettingRow>
              <SettingRow icon={Globe} title="Timezone" desc="Default timezone for displayed times">
                <select className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-sm outline-none focus:border-[#a855f7]/50">
                  <option>UTC</option>
                  <option>Africa/Lagos</option>
                  <option>America/New_York</option>
                  <option>Europe/London</option>
                  <option>Asia/Tokyo</option>
                </select>
              </SettingRow>
              <SettingRow icon={Server} title="Support Email" desc="Where users contact support">
                <input
                  type="email"
                  defaultValue="support@cybershield.ai"
                  className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-sm outline-none focus:border-[#a855f7]/50 w-56"
                />
              </SettingRow>
              <div className="p-5 flex justify-end">
                <CyberButton icon={<Check size={14} />} onClick={() => toast({ title: "Settings saved" })}>Save changes</CyberButton>
              </div>
            </GlassCard>
          )}

          {tab === "security" && (
            <GlassCard>
              <div className="p-5 border-b border-white/5">
                <h3 className="font-semibold">Security Settings</h3>
                <p className="text-xs text-muted-foreground mt-1">Control authentication, access, and protection policies.</p>
              </div>
              <SettingRow icon={Lock} title="Force 2FA for all users" desc="Require two-factor authentication platform-wide">
                <Toggle enabled={toggles.sec_2fa} onChange={() => setToggle("sec_2fa")} />
              </SettingRow>
              <SettingRow icon={Key} title="CAPTCHA on login" desc="Protect against brute-force attacks">
                <Toggle enabled={toggles.sec_captcha} onChange={() => setToggle("sec_captcha")} />
              </SettingRow>
              <SettingRow icon={Shield} title="IP Whitelist" desc="Only allow access from whitelisted IPs">
                <Toggle enabled={toggles.sec_ipWhitelist} onChange={() => setToggle("sec_ipWhitelist")} />
              </SettingRow>
              <SettingRow icon={Eye} title="Session timeout" desc="Auto-logout after 30 minutes of inactivity">
                <Toggle enabled={toggles.sec_sessionTimeout} onChange={() => setToggle("sec_sessionTimeout")} />
              </SettingRow>
              <SettingRow icon={Key} title="Strict password policy" desc="16+ chars, mixed case, number, symbol">
                <Toggle enabled={toggles.sec_passwordPolicy} onChange={() => setToggle("sec_passwordPolicy")} />
              </SettingRow>
              <div className="p-4 bg-red-500/5 border-t border-red-500/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-400">Danger Zone</p>
                    <p className="text-xs text-muted-foreground mt-1">Force-logout all active sessions platform-wide. Use with caution.</p>
                  </div>
                  <CyberButton variant="danger" size="sm" onClick={() => toast({ title: "Force logout initiated", description: "All sessions will be terminated in 60 seconds.", variant: "destructive" })}>
                    Force logout all
                  </CyberButton>
                </div>
              </div>
            </GlassCard>
          )}

          {tab === "appearance" && (
            <GlassCard>
              <div className="p-5 border-b border-white/5">
                <h3 className="font-semibold">Appearance</h3>
                <p className="text-xs text-muted-foreground mt-1">Default theme and branding for the platform.</p>
              </div>
              <div className="p-5 border-b border-white/5">
                <p className="text-sm font-medium mb-3">Default Theme</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "dark", label: "Dark", icon: Moon, color: "#a855f7" },
                    { value: "light", label: "Light", icon: Sun, color: "#00d4ff" },
                    { value: "system", label: "System", icon: Server, color: "#10b981" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => toast({ title: `Default theme: ${opt.label}` })}
                      className="relative p-4 rounded-xl border-2 border-white/10 bg-white/[0.02] hover:border-white/20 transition-all"
                    >
                      <opt.icon size={20} className="mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs font-medium">{opt.label}</p>
                      {opt.value === "dark" && <Check size={14} className="absolute top-2 right-2 text-[#a855f7]" />}
                    </button>
                  ))}
                </div>
              </div>
              <SettingRow icon={Palette} title="Accent Color" desc="Primary highlight color">
                <div className="flex gap-1.5">
                  {["#a855f7", "#00d4ff", "#10b981", "#ef4444", "#f59e0b"].map((c, i) => (
                    <button
                      key={c}
                      className={cn("w-6 h-6 rounded-full transition-transform hover:scale-110", i === 0 && "ring-2 ring-offset-2 ring-offset-background ring-white")}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </SettingRow>
              <SettingRow icon={Type} title="Default Font Size" desc="Base font size for the interface">
                <select className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-sm outline-none focus:border-[#a855f7]/50">
                  <option>Small (14px)</option>
                  <option>Medium (16px) — default</option>
                  <option>Large (18px)</option>
                </select>
              </SettingRow>
            </GlassCard>
          )}

          {tab === "notifications" && (
            <GlassCard>
              <div className="p-5 border-b border-white/5">
                <h3 className="font-semibold">Notification Settings</h3>
                <p className="text-xs text-muted-foreground mt-1">Default channels and triggers for system notifications.</p>
              </div>
              <SettingRow icon={Mail} title="Email notifications" desc="Send system alerts via email">
                <Toggle enabled={toggles.notif_email} onChange={() => setToggle("notif_email")} />
              </SettingRow>
              <SettingRow icon={MessageSquare} title="Push notifications" desc="Browser & mobile push">
                <Toggle enabled={toggles.notif_push} onChange={() => setToggle("notif_push")} />
              </SettingRow>
              <SettingRow icon={Smartphone} title="SMS for critical only" desc="Limit SMS to critical alerts only">
                <Toggle enabled={toggles.notif_sms} onChange={() => setToggle("notif_sms")} />
              </SettingRow>
              <SettingRow icon={Bell} title="Critical-only mode" desc="Suppress all non-critical notifications">
                <Toggle enabled={toggles.notif_criticalOnly} onChange={() => setToggle("notif_criticalOnly")} />
              </SettingRow>
            </GlassCard>
          )}

          {tab === "ai" && (
            <GlassCard>
              <div className="p-5 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">AI Configuration</h3>
                    <p className="text-xs text-muted-foreground mt-1">Gemma model parameters and behavior.</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-medium text-emerald-400">Connected</span>
                  </span>
                </div>
              </div>
              <SettingRow icon={Cpu} title="Model Version" desc="Active Gemma model">
                <select className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-sm outline-none focus:border-[#a855f7]/50">
                  <option>Gemma 3 Multimodal 27B</option>
                  <option>Gemma 3 Multimodal 12B</option>
                  <option>Gemma 3 Multimodal 4B</option>
                </select>
              </SettingRow>
              <SettingRow icon={Type} title="Max Tokens / Request" desc="Maximum output length per request">
                <select className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-sm outline-none focus:border-[#a855f7]/50">
                  <option>4,096</option>
                  <option>8,192 — default</option>
                  <option>16,384</option>
                </select>
              </SettingRow>
              <SettingRow icon={Eye} title="Temperature" desc="Creativity vs determinism (0.0 - 1.0)">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  defaultValue="0.3"
                  className="w-32 accent-[#a855f7]"
                />
              </SettingRow>
              <SettingRow icon={Cpu} title="Streaming responses" desc="Stream tokens as they generate">
                <Toggle enabled={toggles.ai_streaming} onChange={() => setToggle("ai_streaming")} />
              </SettingRow>
              <SettingRow icon={DatabaseBackup} title="Response caching" desc="Cache identical requests (24h TTL)">
                <Toggle enabled={toggles.ai_cache} onChange={() => setToggle("ai_cache")} />
              </SettingRow>
              <SettingRow icon={Shield} title="Fallback model" desc="Use smaller model if primary is unavailable">
                <Toggle enabled={toggles.ai_fallback} onChange={() => setToggle("ai_fallback")} />
              </SettingRow>
              <SettingRow icon={Eye} title="Log all requests" desc="Store request/response for debugging">
                <Toggle enabled={toggles.ai_logRequests} onChange={() => setToggle("ai_logRequests")} />
              </SettingRow>
              <div className="p-4 bg-[#a855f7]/5 border-t border-[#a855f7]/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#a855f7]">Test AI Connection</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Send a test request to verify the Gemma API is reachable.</p>
                  </div>
                  <CyberButton variant="outline" size="sm" onClick={() => toast({ title: "Test successful", description: "Gemma API responded in 1.84s" })}>
                    Run test
                  </CyberButton>
                </div>
              </div>
            </GlassCard>
          )}

          {tab === "backup" && (
            <GlassCard>
              <div className="p-5 border-b border-white/5">
                <h3 className="font-semibold">Backup & Recovery</h3>
                <p className="text-xs text-muted-foreground mt-1">Automated backups and disaster recovery.</p>
              </div>
              <SettingRow icon={DatabaseBackup} title="Automatic backups" desc="Daily automated backup at 04:00 UTC">
                <Toggle enabled={toggles.backup_auto} onChange={() => setToggle("backup_auto")} />
              </SettingRow>
              <SettingRow icon={Lock} title="Encrypt backups" desc="AES-256 encryption for backup files">
                <Toggle enabled={toggles.backup_encrypt} onChange={() => setToggle("backup_encrypt")} />
              </SettingRow>
              <SettingRow icon={DatabaseBackup} title="Compress backups" desc="Gzip compression to save storage">
                <Toggle enabled={toggles.backup_compress} onChange={() => setToggle("backup_compress")} />
              </SettingRow>
              <SettingRow icon={DatabaseBackup} title="Retention period" desc="How long to keep backups">
                <select className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-sm outline-none focus:border-[#a855f7]/50">
                  <option>7 days</option>
                  <option>30 days</option>
                  <option>90 days — default</option>
                  <option>1 year</option>
                </select>
              </SettingRow>
              <div className="p-5 border-t border-white/5">
                <p className="text-sm font-medium mb-3">Backup History</p>
                <div className="space-y-2">
                  {[
                    { date: "Jul 29, 2026 04:00", size: "684 GB", status: "success" },
                    { date: "Jul 28, 2026 04:00", size: "681 GB", status: "success" },
                    { date: "Jul 27, 2026 04:00", size: "679 GB", status: "success" },
                  ].map((b, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <div>
                          <p className="text-xs font-medium">{b.date}</p>
                          <p className="text-[10px] text-muted-foreground">{b.size}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toast({ title: "Download started", description: `Backup from ${b.date}` })}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <Download size={14} className="text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
                <CyberButton variant="secondary" fullWidth className="mt-4" icon={<DatabaseBackup size={14} />} onClick={() => toast({ title: "Manual backup started", description: "Will complete in ~12 minutes." })}>
                  Run backup now
                </CyberButton>
              </div>
            </GlassCard>
          )}

          {tab === "maintenance" && (
            <GlassCard className={cn(toggles.maintenance_mode && "border-red-500/30")}>
              <div className="p-5 border-b border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <Power size={18} className={toggles.maintenance_mode ? "text-red-400" : "text-[#a855f7]"} />
                  <h3 className="font-semibold">Maintenance Mode</h3>
                </div>
                <p className="text-xs text-muted-foreground">Take the platform offline for scheduled maintenance.</p>
              </div>

              <div className={cn(
                "p-5 border-b border-white/5",
                toggles.maintenance_mode ? "bg-red-500/5" : "bg-white/[0.02]"
              )}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={cn("text-sm font-medium", toggles.maintenance_mode && "text-red-400")}>
                      {toggles.maintenance_mode ? "Maintenance mode is ACTIVE" : "Maintenance mode is OFF"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {toggles.maintenance_mode
                        ? "Non-admin users see a maintenance page. Only admins can access the platform."
                        : "Platform is fully operational for all users."}
                    </p>
                  </div>
                  <Toggle enabled={toggles.maintenance_mode} onChange={() => setToggle("maintenance_mode")} />
                </div>
              </div>

              <SettingRow icon={Shield} title="Allow admin access" desc="Let admins bypass maintenance mode">
                <Toggle enabled={toggles.maintenance_allowAdmin} onChange={() => setToggle("maintenance_allowAdmin")} />
              </SettingRow>
              <SettingRow icon={Type} title="Maintenance message" desc="Displayed to non-admin users">
                <input
                  type="text"
                  defaultValue="We're performing scheduled maintenance. We'll be back shortly."
                  className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs outline-none focus:border-[#a855f7]/50 w-64"
                />
              </SettingRow>
              <SettingRow icon={Type} title="Scheduled start" desc="When maintenance will begin">
                <input
                  type="datetime-local"
                  defaultValue="2026-08-02T02:00"
                  className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs outline-none focus:border-[#a855f7]/50"
                />
              </SettingRow>
              <SettingRow icon={Type} title="Estimated duration" desc="How long maintenance will take">
                <select className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-sm outline-none focus:border-[#a855f7]/50">
                  <option>30 minutes</option>
                  <option>1 hour</option>
                  <option>2 hours — default</option>
                  <option>4 hours</option>
                </select>
              </SettingRow>
              <div className="p-5 flex justify-end gap-2">
                <CyberButton variant="secondary" onClick={() => toast({ title: "Notification sent", description: "All enterprise users notified of maintenance window." })}>
                  Notify users
                </CyberButton>
                <CyberButton onClick={() => toast({ title: "Maintenance scheduled", description: "Window saved. Auto-activates at scheduled time." })}>
                  Schedule maintenance
                </CyberButton>
              </div>
            </GlassCard>
          )}
        </motion.div>
      </div>
    </div>
  );
}
