"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck, ShieldAlert, FileCheck, Activity, TrendingUp,
  Sparkles, ArrowRight, Eye, Bug, Fish, Lock, Clapperboard,
  Lightbulb, ChevronRight, Mail, Link2, Image, FileText,
  AudioLines, Video, QrCode,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { StatCard } from "@/components/shared/StatCard";
import { ThreatBadge } from "@/components/shared/ThreatBadge";
import { CyberButton } from "@/components/shared/CyberButton";
import { navigate } from "@/hooks/use-router";
import { ROUTES } from "@/lib/routes";
import {
  DASHBOARD_STATS, RECENT_SCANS, SECURITY_TIPS, MOCK_USER,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const SCANNER_TYPE_ICON = {
  url: Link2, email: Mail, image: Image, document: FileText,
  audio: AudioLines, video: Video, qr: QrCode, ai: Sparkles,
} as const;

export function DashboardHome() {
  const tips = SECURITY_TIPS[0];

  return (
    <div>
      <DashboardHeader
        title={`Welcome back, ${MOCK_USER.name.split(" ")[0]}`}
        description="Here's your security posture at a glance. Last updated 2 minutes ago."
        actions={
          <CyberButton to={ROUTES.aiScanner} icon={<Sparkles size={16} />} glow>
            New Scan
          </CyberButton>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Scans"
          value={DASHBOARD_STATS.totalScans}
          icon={Activity}
          accentColor="#00d4ff"
          trend={{ value: 12, positive: true }}
          delay={0}
        />
        <StatCard
          title="Threats Detected"
          value={DASHBOARD_STATS.threatsDetected}
          icon={ShieldAlert}
          accentColor="#ef4444"
          trend={{ value: 8, positive: false }}
          delay={0.1}
        />
        <StatCard
          title="Safe Files"
          value={DASHBOARD_STATS.safeFiles}
          icon={FileCheck}
          accentColor="#10b981"
          trend={{ value: 15, positive: true }}
          delay={0.2}
        />
        <StatCard
          title="Avg Risk Score"
          value={DASHBOARD_STATS.avgRiskScore}
          icon={TrendingUp}
          accentColor="#a855f7"
          trend={{ value: 4, positive: false }}
          delay={0.3}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Weekly activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <GlassCard className="p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Weekly Activity</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Scans vs threats detected over the past 7 days</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00d4ff]" /> Scans
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ef4444]" /> Threats
                </span>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DASHBOARD_STATS.weeklyActivity}>
                  <defs>
                    <linearGradient id="gradScans" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#00d4ff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradThreats" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="day"
                    stroke="rgba(255,255,255,0.3)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15,20,40,0.95)",
                      border: "1px solid rgba(0,212,255,0.3)",
                      borderRadius: "12px",
                      fontSize: "12px",
                      backdropFilter: "blur(12px)",
                    }}
                    cursor={{ stroke: "rgba(0,212,255,0.3)", strokeWidth: 1 }}
                  />
                  <Area type="monotone" dataKey="scans" stroke="#00d4ff" strokeWidth={2} fill="url(#gradScans)" />
                  <Area type="monotone" dataKey="threats" stroke="#ef4444" strokeWidth={2} fill="url(#gradThreats)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* Threat categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <GlassCard className="p-5 h-full">
            <h3 className="font-semibold mb-1">Threat Categories</h3>
            <p className="text-xs text-muted-foreground mb-4">Distribution by type</p>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={DASHBOARD_STATS.threatCategories}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {DASHBOARD_STATS.threatCategories.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15,20,40,0.95)",
                      border: "1px solid rgba(0,212,255,0.3)",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              {DASHBOARD_STATS.threatCategories.map((cat) => (
                <div key={cat.name} className="flex items-center gap-1.5 text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: cat.color }} />
                  <span className="text-muted-foreground truncate">{cat.name}</span>
                  <span className="ml-auto font-mono">{cat.value}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Recent scans + security score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Recent scans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="lg:col-span-2"
        >
          <GlassCard className="p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Recent Scans</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Latest 5 scans across all scanner types</p>
              </div>
              <button
                onClick={() => navigate(ROUTES.reports)}
                className="text-xs text-[#00d4ff] hover:underline flex items-center gap-1"
              >
                View all <ArrowRight size={12} />
              </button>
            </div>
            <div className="space-y-2">
              {RECENT_SCANS.slice(0, 5).map((scan) => {
                const Icon = SCANNER_TYPE_ICON[scan.type];
                return (
                  <motion.button
                    key={scan.id}
                    onClick={() => navigate(`${ROUTES.reportDetails}${scan.id}`)}
                    whileHover={{ x: 4 }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-all text-left"
                  >
                    <div
                      className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      )}
                      style={{
                        background:
                          scan.threatLevel === "critical" || scan.threatLevel === "high"
                            ? "rgba(239,68,68,0.1)"
                            : scan.threatLevel === "medium"
                            ? "rgba(245,158,11,0.1)"
                            : "rgba(16,185,129,0.1)",
                      }}
                    >
                      <Icon size={15} className="text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{scan.target}</p>
                      <p className="text-xs text-muted-foreground truncate">{scan.category}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-mono text-muted-foreground hidden sm:block">
                        {scan.riskScore}/100
                      </span>
                      <ThreatBadge level={scan.threatLevel} size="sm" />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>

        {/* Security score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <GlassCard variant="strong" className="p-5 h-full flex flex-col">
            <h3 className="font-semibold mb-1">Security Score</h3>
            <p className="text-xs text-muted-foreground mb-4">Your overall posture</p>

            <div className="relative flex-1 flex items-center justify-center">
              <svg className="w-40 h-40 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="url(#scoreGrad)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 42}
                  initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - MOCK_USER.securityScore / 100) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#00d4ff" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold gradient-text-emerald">{MOCK_USER.securityScore}</span>
                <span className="text-xs text-muted-foreground">/ 100</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck size={12} /> Strong
                </span>
                <span className="text-muted-foreground">+5 this week</span>
              </div>
              <CyberButton variant="outline" size="sm" fullWidth to={ROUTES.profile}>
                Improve score
              </CyberButton>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Scanner usage + tips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="lg:col-span-2"
        >
          <GlassCard className="p-5 h-full">
            <h3 className="font-semibold mb-1">Scanner Usage</h3>
            <p className="text-xs text-muted-foreground mb-4">Scans by scanner type (last 30 days)</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DASHBOARD_STATS.scannerUsage} layout="vertical">
                  <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} width={50} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15,20,40,0.95)",
                      border: "1px solid rgba(0,212,255,0.3)",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                    cursor={{ fill: "rgba(0,212,255,0.05)" }}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {DASHBOARD_STATS.scannerUsage.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* Security tip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <GlassCard variant="strong" className="p-5 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                <Lightbulb size={16} className="text-amber-400" />
              </div>
              <h3 className="font-semibold">Security Tip</h3>
            </div>
            <h4 className="text-sm font-semibold mb-1.5" style={{ color: tips.color }}>
              {tips.title}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed flex-1">
              {tips.body}
            </p>
            <CyberButton variant="ghost" size="sm" fullWidth to={ROUTES.academyDashboard} className="mt-3">
              <span className="flex items-center gap-1 justify-center">
                Learn more <ChevronRight size={13} />
              </span>
            </CyberButton>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
