"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon, Palette, Globe, Accessibility, Bell,
  Lock, User, Eye, Moon, Sun, Monitor, Type, Volume2, Mail,
  MessageSquare, Smartphone, Shield, Download, Trash2, AlertTriangle,
  Check,
} from "lucide-react";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { CyberButton } from "@/components/shared/CyberButton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";

const TABS = [
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "language", label: "Language", icon: Globe },
  { id: "accessibility", label: "Accessibility", icon: Accessibility },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy", icon: Lock },
  { id: "account", label: "Account", icon: User },
  { id: "danger", label: "Danger Zone", icon: AlertTriangle },
];

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn(
        "relative w-11 h-6 rounded-full transition-colors",
        enabled ? "bg-[#00d4ff]" : "bg-white/10"
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

export function SettingsPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState("appearance");
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    notif_email: true,
    notif_push: true,
    notif_sms: false,
    notif_threats: true,
    notif_scans: true,
    notif_learning: false,
    notif_marketing: false,
    a11y_highContrast: false,
    a11y_reduceMotion: false,
    a11y_largeText: false,
    a11y_screenReader: false,
    privacy_analytics: true,
    privacy_threatIntel: true,
    privacy_saveReports: true,
  });

  const setToggle = (key: string) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
    toast({ title: "Setting updated" });
  };

  return (
    <div>
      <DashboardHeader
        title="Settings"
        description="Customize CyberShield AI to your preferences."
        breadcrumbs={[{ label: "Settings" }]}
        icon={<SettingsIcon size={20} className="text-[#00d4ff]" />}
        showBack
      />

      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-4">
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
                    ? t.id === "danger"
                      ? "bg-red-500/10 text-red-400"
                      : "bg-[#00d4ff]/10 text-[#00d4ff]"
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
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {tab === "appearance" && (
            <GlassCard>
              <div className="p-5 border-b border-white/5">
                <h3 className="font-semibold">Appearance</h3>
                <p className="text-xs text-muted-foreground mt-1">Customize how CyberShield AI looks.</p>
              </div>

              <div className="p-5 border-b border-white/5">
                <p className="text-sm font-medium mb-3">Theme</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "dark" as const, label: "Dark", icon: Moon },
                    { value: "light" as const, label: "Light", icon: Sun },
                    { value: "system" as const, label: "System", icon: Monitor },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setTheme(opt.value);
                        toast({ title: `Theme set to ${opt.label}` });
                      }}
                      className={cn(
                        "relative p-4 rounded-xl border-2 transition-all",
                        theme === opt.value
                          ? "border-[#00d4ff] bg-[#00d4ff]/5"
                          : "border-white/10 bg-white/[0.02] hover:border-white/20"
                      )}
                    >
                      <opt.icon size={20} className={cn("mx-auto mb-2", theme === opt.value ? "text-[#00d4ff]" : "text-muted-foreground")} />
                      <p className="text-xs font-medium">{opt.label}</p>
                      {theme === opt.value && (
                        <Check size={14} className="absolute top-2 right-2 text-[#00d4ff]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <SettingRow icon={Eye} title="Accent color" desc="Choose your neon highlight">
                <div className="flex gap-1.5">
                  {["#00d4ff", "#a855f7", "#10b981", "#ef4444", "#f59e0b"].map((c, i) => (
                    <button
                      key={c}
                      className={cn("w-6 h-6 rounded-full transition-transform hover:scale-110", i === 0 && "ring-2 ring-offset-2 ring-offset-background ring-white")}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </SettingRow>

              <SettingRow icon={Type} title="Density" desc="Compact or comfortable spacing">
                <select className="bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#00d4ff]/50">
                  <option>Comfortable</option>
                  <option>Compact</option>
                </select>
              </SettingRow>
            </GlassCard>
          )}

          {tab === "language" && (
            <GlassCard>
              <div className="p-5 border-b border-white/5">
                <h3 className="font-semibold">Language & Region</h3>
                <p className="text-xs text-muted-foreground mt-1">Set your preferred language and timezone.</p>
              </div>
              <SettingRow icon={Globe} title="Language" desc="Interface language">
                <select className="bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#00d4ff]/50">
                  <option>English (US)</option>
                  <option>English (UK)</option>
                  <option>Français</option>
                  <option>Deutsch</option>
                  <option>日本語</option>
                  <option>中文</option>
                  <option>Español</option>
                  <option>Português</option>
                </select>
              </SettingRow>
              <SettingRow icon={Globe} title="Timezone" desc="Display times in your local zone">
                <select className="bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#00d4ff]/50">
                  <option>Africa/Lagos (UTC+1)</option>
                  <option>America/New_York (UTC-5)</option>
                  <option>Europe/London (UTC+0)</option>
                  <option>Asia/Tokyo (UTC+9)</option>
                </select>
              </SettingRow>
              <SettingRow icon={Type} title="Date format" desc="How dates are displayed">
                <select className="bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#00d4ff]/50">
                  <option>MMM D, YYYY</option>
                  <option>DD/MM/YYYY</option>
                  <option>MM/DD/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </SettingRow>
            </GlassCard>
          )}

          {tab === "accessibility" && (
            <GlassCard>
              <div className="p-5 border-b border-white/5">
                <h3 className="font-semibold">Accessibility</h3>
                <p className="text-xs text-muted-foreground mt-1">Make CyberShield AI work better for you.</p>
              </div>
              <SettingRow icon={Eye} title="High contrast" desc="Increase visual contrast for better readability">
                <Toggle enabled={toggles.a11y_highContrast} onChange={() => setToggle("a11y_highContrast")} />
              </SettingRow>
              <SettingRow icon={Monitor} title="Reduce motion" desc="Minimize animations and transitions">
                <Toggle enabled={toggles.a11y_reduceMotion} onChange={() => setToggle("a11y_reduceMotion")} />
              </SettingRow>
              <SettingRow icon={Type} title="Large text" desc="Increase base font size">
                <Toggle enabled={toggles.a11y_largeText} onChange={() => setToggle("a11y_largeText")} />
              </SettingRow>
              <SettingRow icon={Volume2} title="Screen reader hints" desc="Add extra ARIA labels for screen readers">
                <Toggle enabled={toggles.a11y_screenReader} onChange={() => setToggle("a11y_screenReader")} />
              </SettingRow>
              <SettingRow icon={Accessibility} title="Keyboard navigation" desc="Show keyboard shortcut hints">
                <Toggle enabled={true} onChange={() => toast({ title: "Setting updated" })} />
              </SettingRow>
            </GlassCard>
          )}

          {tab === "notifications" && (
            <GlassCard>
              <div className="p-5 border-b border-white/5">
                <h3 className="font-semibold">Notifications</h3>
                <p className="text-xs text-muted-foreground mt-1">Choose what we notify you about and how.</p>
              </div>
              <div className="p-5 border-b border-white/5">
                <p className="text-sm font-medium mb-3">Channels</p>
                <SettingRow icon={Mail} title="Email" desc="Get notifications via email">
                  <Toggle enabled={toggles.notif_email} onChange={() => setToggle("notif_email")} />
                </SettingRow>
                <SettingRow icon={MessageSquare} title="Push" desc="Browser & mobile push notifications">
                  <Toggle enabled={toggles.notif_push} onChange={() => setToggle("notif_push")} />
                </SettingRow>
                <SettingRow icon={Smartphone} title="SMS" desc="Critical alerts via SMS (carrier charges apply)">
                  <Toggle enabled={toggles.notif_sms} onChange={() => setToggle("notif_sms")} />
                </SettingRow>
              </div>
              <div className="p-5">
                <p className="text-sm font-medium mb-3">Categories</p>
                <SettingRow icon={Shield} title="Threat alerts" desc="When a critical threat is detected">
                  <Toggle enabled={toggles.notif_threats} onChange={() => setToggle("notif_threats")} />
                </SettingRow>
                <SettingRow icon={Check} title="Scan completed" desc="When a scan finishes">
                  <Toggle enabled={toggles.notif_scans} onChange={() => setToggle("notif_scans")} />
                </SettingRow>
                <SettingRow icon={Bell} title="Learning reminders" desc="Daily reminders to continue learning">
                  <Toggle enabled={toggles.notif_learning} onChange={() => setToggle("notif_learning")} />
                </SettingRow>
                <SettingRow icon={Mail} title="Marketing" desc="Product updates, tips, and offers">
                  <Toggle enabled={toggles.notif_marketing} onChange={() => setToggle("notif_marketing")} />
                </SettingRow>
              </div>
            </GlassCard>
          )}

          {tab === "privacy" && (
            <GlassCard>
              <div className="p-5 border-b border-white/5">
                <h3 className="font-semibold">Privacy</h3>
                <p className="text-xs text-muted-foreground mt-1">Control how your data is used.</p>
              </div>
              <SettingRow icon={Eye} title="Anonymous analytics" desc="Help us improve by sharing usage patterns">
                <Toggle enabled={toggles.privacy_analytics} onChange={() => setToggle("privacy_analytics")} />
              </SettingRow>
              <SettingRow icon={Shield} title="Threat intelligence sharing" desc="Contribute anonymized threat data">
                <Toggle enabled={toggles.privacy_threatIntel} onChange={() => setToggle("privacy_privacy_threatIntel")} />
              </SettingRow>
              <SettingRow icon={Download} title="Auto-save reports" desc="Save all reports for 30 days">
                <Toggle enabled={toggles.privacy_saveReports} onChange={() => setToggle("privacy_saveReports")} />
              </SettingRow>
              <div className="p-5 border-t border-white/5 space-y-2">
                <CyberButton variant="outline" size="sm" fullWidth icon={<Download size={14} />}>
                  Download my data
                </CyberButton>
                <CyberButton variant="secondary" size="sm" fullWidth onClick={() => toast({ title: "Data export started", description: "We'll email you when it's ready." })}>
                  Request data portability
                </CyberButton>
              </div>
            </GlassCard>
          )}

          {tab === "account" && (
            <GlassCard>
              <div className="p-5 border-b border-white/5">
                <h3 className="font-semibold">Account</h3>
                <p className="text-xs text-muted-foreground mt-1">Manage your account details.</p>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium mb-1.5 block">Full name</label>
                    <input
                      type="text"
                      defaultValue="Alex Morgan"
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-sm outline-none focus:border-[#00d4ff]/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block">Email</label>
                    <input
                      type="email"
                      defaultValue="alex.morgan@cybershield.ai"
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-sm outline-none focus:border-[#00d4ff]/50"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5">
                  <div className="flex items-center gap-2">
                    <Shield size={16} className="text-emerald-400" />
                    <div>
                      <p className="text-sm font-medium">Two-factor authentication</p>
                      <p className="text-xs text-muted-foreground">Enabled via authenticator app</p>
                    </div>
                  </div>
                  <CyberButton variant="outline" size="sm">Manage</CyberButton>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-[#00d4ff]" />
                    <div>
                      <p className="text-sm font-medium">Plan: Enterprise</p>
                      <p className="text-xs text-muted-foreground">Renews Aug 14, 2026</p>
                    </div>
                  </div>
                  <CyberButton variant="outline" size="sm" to={ROUTES.contact}>Upgrade</CyberButton>
                </div>
                <div className="pt-2">
                  <CyberButton icon={<Check size={14} />} onClick={() => toast({ title: "Changes saved" })}>
                    Save changes
                  </CyberButton>
                </div>
              </div>
            </GlassCard>
          )}

          {tab === "danger" && (
            <GlassCard className="border-red-500/30">
              <div className="p-5 border-b border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={18} className="text-red-400" />
                  <h3 className="font-semibold text-red-400">Danger Zone</h3>
                </div>
                <p className="text-xs text-muted-foreground">Irreversible actions. Proceed with caution.</p>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <div>
                    <p className="text-sm font-medium">Export all data</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Download all your scans, reports, and account data.</p>
                  </div>
                  <CyberButton variant="secondary" size="sm" icon={<Download size={14} />} onClick={() => toast({ title: "Export started" })}>
                    Export
                  </CyberButton>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                  <div>
                    <p className="text-sm font-medium text-red-400">Delete account</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Permanently delete your account and all data. This cannot be undone.</p>
                  </div>
                  <CyberButton variant="danger" size="sm" icon={<Trash2 size={14} />} onClick={() => toast({ title: "Account deletion requested", description: "Check your email to confirm.", variant: "destructive" })}>
                    Delete
                  </CyberButton>
                </div>
              </div>
            </GlassCard>
          )}
        </motion.div>
      </div>
    </div>
  );
}
