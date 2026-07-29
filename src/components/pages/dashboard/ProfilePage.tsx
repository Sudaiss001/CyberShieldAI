"use client";

import { motion } from "framer-motion";
import {
  User, Shield, Award, Activity, Settings, Mail, Calendar, MapPin,
  Briefcase, CheckCircle2, TrendingUp, Zap, Lock,
} from "lucide-react";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { CyberButton } from "@/components/shared/CyberButton";
import { ROUTES } from "@/lib/routes";
import {
  MOCK_USER, USER_BADGES, USER_ACTIVITY, DASHBOARD_STATS,
} from "@/lib/mock-data";

const ICON_MAP: Record<string, any> = {
  Swords: Shield, Eye: User, GraduationCap: Award, Flame: Zap,
  Clapperboard: Activity, Shield: Shield, Award: Award, Download: Activity,
  Mail: Mail, Files: Activity,
};

export function ProfilePage() {
  return (
    <div>
      <DashboardHeader
        title="Profile"
        description="Your personal information, achievements, and activity."
        breadcrumbs={[{ label: "Profile" }]}
        icon={<User size={20} className="text-[#00d4ff]" />}
        showBack
        actions={
          <CyberButton variant="secondary" size="sm" to={ROUTES.settings} icon={<Settings size={14} />}>
            Edit settings
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
            <div className="absolute top-0 right-1/4 w-64 h-64 rounded-full bg-[#00d4ff]/15 blur-3xl" />
            <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full bg-[#a855f7]/15 blur-3xl" />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#00d4ff] to-[#a855f7] flex items-center justify-center text-3xl font-bold text-[#0a0e1a]">
                {MOCK_USER.avatar}
              </div>
              <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border-4 border-background flex items-center justify-center" title="Online">
                <CheckCircle2 size={12} className="text-white" />
              </span>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold">{MOCK_USER.name}</h2>
                <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md bg-gradient-to-r from-[#a855f7] to-[#8b5cf6] text-white">
                  {MOCK_USER.plan}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{MOCK_USER.role}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Mail size={12} /> {MOCK_USER.email}</span>
                <span className="flex items-center gap-1.5"><Calendar size={12} /> Joined {new Date(MOCK_USER.joinedAt).toLocaleDateString()}</span>
                <span className="flex items-center gap-1.5"><MapPin size={12} /> Lagos, NG</span>
                <span className="flex items-center gap-1.5"><Briefcase size={12} /> Security Team</span>
              </div>
            </div>

            <div className="hidden sm:flex flex-col items-center gap-1 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              <span className="text-3xl font-bold gradient-text-emerald">{MOCK_USER.securityScore}</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Security Score</span>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Scans", value: DASHBOARD_STATS.totalScans, icon: Activity, color: "#00d4ff" },
          { label: "Threats Caught", value: DASHBOARD_STATS.threatsDetected, icon: Shield, color: "#ef4444" },
          { label: "Badges Earned", value: USER_BADGES.length, icon: Award, color: "#a855f7" },
          { label: "Lessons Done", value: 32, icon: TrendingUp, color: "#10b981" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
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
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Personal Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <GlassCard className="p-5">
            <h3 className="font-semibold mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Full name", value: MOCK_USER.name },
                { label: "Email", value: MOCK_USER.email },
                { label: "Role", value: MOCK_USER.role },
                { label: "Plan", value: MOCK_USER.plan, badge: true },
                { label: "Member since", value: new Date(MOCK_USER.joinedAt).toLocaleDateString() },
                { label: "Location", value: "Lagos, Nigeria" },
                { label: "Timezone", value: "Africa/Lagos (UTC+1)" },
                { label: "Language", value: "English" },
              ].map((field) => (
                <div key={field.label}>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">{field.label}</p>
                  {field.badge ? (
                    <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-md bg-gradient-to-r from-[#a855f7] to-[#8b5cf6] text-white uppercase">
                      {field.value as string}
                    </span>
                  ) : (
                    <p className="text-sm font-medium">{field.value as string}</p>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Achievements / Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <GlassCard className="p-5 h-full">
            <h3 className="font-semibold mb-1">Achievements</h3>
            <p className="text-xs text-muted-foreground mb-4">{USER_BADGES.length} badges earned</p>
            <div className="grid grid-cols-3 gap-3">
              {USER_BADGES.map((badge, i) => {
                const Icon = ICON_MAP[badge.icon] ?? Award;
                return (
                  <motion.div
                    key={badge.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
                    className="flex flex-col items-center text-center group cursor-help"
                    title={`${badge.name} — ${badge.description}`}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform"
                      style={{ background: `${badge.color}15`, border: `1px solid ${badge.color}40` }}
                    >
                      <Icon size={20} style={{ color: badge.color }} strokeWidth={2.2} />
                    </div>
                    <p className="text-[10px] font-medium leading-tight">{badge.name}</p>
                  </motion.div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Recent activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="mt-4"
      >
        <GlassCard className="p-5">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <div className="relative pl-6 space-y-4">
            <div className="absolute left-2.5 top-2 bottom-2 w-px bg-gradient-to-b from-[#00d4ff]/50 to-transparent" />
            {USER_ACTIVITY.map((act, i) => {
              const Icon = ICON_MAP[act.icon] ?? Activity;
              return (
                <motion.div
                  key={act.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.08 }}
                  className="relative"
                >
                  <div className="absolute -left-[18px] top-0.5 w-3 h-3 rounded-full bg-[#00d4ff] ring-4 ring-[#00d4ff]/15" />
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <Icon size={14} className="text-[#00d4ff]" />
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

      {/* Security & Preferences quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <GlassCard variant="hover" className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <Lock size={18} className="text-emerald-400" />
            </div>
            <h3 className="font-semibold">Security</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">2FA enabled, password last changed 32 days ago.</p>
          <CyberButton variant="outline" size="sm" to={ROUTES.settings} fullWidth>
            Manage security
          </CyberButton>
        </GlassCard>

        <GlassCard variant="hover" className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#00d4ff]/15 border border-[#00d4ff]/30 flex items-center justify-center">
              <Settings size={18} className="text-[#00d4ff]" />
            </div>
            <h3 className="font-semibold">Preferences</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Theme, language, notifications, and accessibility.</p>
          <CyberButton variant="outline" size="sm" to={ROUTES.settings} fullWidth>
            Open settings
          </CyberButton>
        </GlassCard>
      </div>
    </div>
  );
}
