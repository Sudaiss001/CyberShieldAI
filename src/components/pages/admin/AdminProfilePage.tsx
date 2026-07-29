"use client";

import { motion } from "framer-motion";
import {
  User, Shield, Lock, Key, Smartphone, Activity, Award,
  Mail, Calendar, MapPin, Briefcase, CheckCircle2, Eye,
  Cpu, GraduationCap, Bell, DatabaseBackup, ShieldCheck, Zap,
} from "lucide-react";
import { AdminHeader } from "@/components/shared/AdminHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { CyberButton } from "@/components/shared/CyberButton";
import { useToast } from "@/hooks/use-toast";
import { ADMIN_USER, ADMIN_ACTIVITY } from "@/lib/mock-data/admin";
import { ROUTES } from "@/lib/routes";

const ICON_MAP: Record<string, any> = {
  UserX: User, Eye: Eye, GraduationCap: Award, Flame: Zap,
  Clapperboard: Activity, Shield: ShieldCheck, Award: Award,
  Download: Activity, Mail: Mail, Files: Activity, Bell: Bell,
  Cpu: Cpu, DatabaseBackup: DatabaseBackup,
};

export function AdminProfilePage() {
  const { toast } = useToast();

  return (
    <div>
      <AdminHeader
        title="Admin Profile"
        description="Your administrator profile, activity, and security settings."
        breadcrumbs={[{ label: "Profile" }]}
        icon={<User size={20} className="text-[#a855f7]" />}
        showBack
        actions={
          <CyberButton variant="secondary" size="sm" to={ROUTES.adminSettings} icon={<Shield size={14} />}>
            Security settings
          </CyberButton>
        }
      />

      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <GlassCard variant="strong" className="p-6 sm:p-8 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-1/4 w-64 h-64 rounded-full bg-[#a855f7]/15 blur-3xl" />
            <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full bg-[#ec4899]/15 blur-3xl" />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#a855f7] to-[#ec4899] flex items-center justify-center text-3xl font-bold text-white">
                {ADMIN_USER.avatar}
              </div>
              <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border-4 border-background flex items-center justify-center" title="Online">
                <CheckCircle2 size={12} className="text-white" />
              </span>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold">{ADMIN_USER.name}</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 border border-red-500/30">
                  {ADMIN_USER.role}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Platform Administrator</p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Mail size={12} /> {ADMIN_USER.email}</span>
                <span className="flex items-center gap-1.5"><Calendar size={12} /> Joined {new Date(ADMIN_USER.joinedAt).toLocaleDateString()}</span>
                <span className="flex items-center gap-1.5"><MapPin size={12} /> Lagos, NG</span>
                <span className="flex items-center gap-1.5"><Briefcase size={12} /> Engineering Team</span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active now
                </span>
              </div>
            </div>

            <div className="hidden sm:flex flex-col items-center gap-1 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              <span className="text-3xl font-bold gradient-text">98</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Security Score</span>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Actions Logged", value: 1247, icon: Activity, color: "#00d4ff" },
          { label: "Users Managed", value: 184, icon: User, color: "#a855f7" },
          { label: "Reports Sent", value: 42, icon: Bell, color: "#10b981" },
          { label: "Days Active", value: 689, icon: Calendar, color: "#f59e0b" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard variant="hover" className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}30` }}
                >
                  <stat.icon size={18} style={{ color: stat.color }} strokeWidth={2.2} />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    <AnimatedCounter value={stat.value} />
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Personal info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <GlassCard className="p-5 h-full">
            <h3 className="font-semibold mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Full name", value: ADMIN_USER.name },
                { label: "Email", value: ADMIN_USER.email },
                { label: "Role", value: ADMIN_USER.role, badge: true },
                { label: "Team", value: "Platform Engineering" },
                { label: "Member since", value: new Date(ADMIN_USER.joinedAt).toLocaleDateString() },
                { label: "Location", value: "Lagos, Nigeria" },
                { label: "Timezone", value: "Africa/Lagos (UTC+1)" },
                { label: "Last active", value: "Just now" },
              ].map((field) => (
                <div key={field.label}>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">{field.label}</p>
                  {field.badge ? (
                    <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 border border-red-500/30 uppercase">
                      {field.value as string}
                    </span>
                  ) : (
                    <p className="text-sm font-medium">{field.value as string}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-white/5">
              <CyberButton size="sm" variant="outline" icon={<User size={14} />} onClick={() => toast({ title: "Edit profile", description: "Opening edit form" })}>
                Edit profile
              </CyberButton>
            </div>
          </GlassCard>
        </motion.div>

        {/* Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard variant="strong" className="p-5 h-full">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Shield size={16} className="text-[#a855f7]" /> Security
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Lock size={15} className="text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold">2FA Enabled</p>
                  <p className="text-[10px] text-muted-foreground">FIDO2 hardware key</p>
                </div>
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Key size={15} className="text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold">Password</p>
                  <p className="text-[10px] text-muted-foreground">Last changed 12 days ago</p>
                </div>
                <CyberButton variant="ghost" size="sm" onClick={() => toast({ title: "Password reset sent" })}>
                  Change
                </CyberButton>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Smartphone size={15} className="text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold">Active Sessions</p>
                  <p className="text-[10px] text-muted-foreground">3 devices · 2 cities</p>
                </div>
                <CyberButton variant="ghost" size="sm" onClick={() => toast({ title: "Manage sessions" })}>
                  Manage
                </CyberButton>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Activity timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-4"
      >
        <GlassCard className="p-5">
          <h3 className="font-semibold mb-4">Activity Timeline</h3>
          <div className="relative pl-6 space-y-4">
            <div className="absolute left-2.5 top-2 bottom-2 w-px bg-gradient-to-b from-[#a855f7]/50 to-transparent" />
            {ADMIN_ACTIVITY.map((act, i) => {
              const Icon = ICON_MAP[act.icon] ?? Activity;
              return (
                <motion.div
                  key={act.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.08 }}
                  className="relative"
                >
                  <div className="absolute -left-[18px] top-0.5 w-3 h-3 rounded-full ring-4 ring-[#a855f7]/15" style={{ background: act.color }} />
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <Icon size={14} style={{ color: act.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{act.title}</p>
                      <p className="text-xs text-muted-foreground">{act.description}</p>
                      <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                        {new Date(act.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </GlassCard>
      </motion.div>

      {/* Admin privileges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-4"
      >
        <GlassCard variant="strong" className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={18} className="text-[#a855f7]" />
            <h3 className="font-semibold">Admin Privileges</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { label: "User Management", desc: "Create, suspend, delete users" },
              { label: "System Configuration", desc: "Modify platform settings" },
              { label: "AI Configuration", desc: "Manage Gemma model parameters" },
              { label: "Role Management", desc: "Create and assign custom roles" },
              { label: "Audit Access", desc: "View all platform activity logs" },
              { label: "Maintenance Mode", desc: "Toggle platform-wide maintenance" },
            ].map((priv) => (
              <div key={priv.label} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold">{priv.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{priv.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
