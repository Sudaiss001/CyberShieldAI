"use client";

import { motion } from "framer-motion";
import {
  Users, UserCheck, UserX, ScanLine, ShieldAlert, Cpu, HardDrive,
  Activity, TrendingUp, TrendingDown, Server, ArrowRight,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
} from "recharts";
import { AdminHeader } from "@/components/shared/AdminHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { CyberButton } from "@/components/shared/CyberButton";
import { navigate } from "@/hooks/use-router";
import { ROUTES } from "@/lib/routes";
import { ADMIN_DASHBOARD_STATS, STORAGE_BREAKDOWN, ADMIN_SCANS } from "@/lib/mock-data/admin";
import { LayoutDashboard } from "lucide-react";

export function AdminDashboardPage() {
  const stats = [
    { title: "Total Users", value: ADMIN_DASHBOARD_STATS.totalUsers, icon: Users, color: "#00d4ff", trend: { value: 5.6, positive: true }, path: ROUTES.adminUsers },
    { title: "Active Users", value: ADMIN_DASHBOARD_STATS.activeUsers, icon: UserCheck, color: "#10b981", trend: { value: 3.2, positive: true }, path: ROUTES.adminUsers },
    { title: "Suspended Users", value: ADMIN_DASHBOARD_STATS.suspendedUsers, icon: UserX, color: "#ef4444", trend: { value: 1.1, positive: false }, path: ROUTES.adminUsers },
    { title: "Total Scans", value: ADMIN_DASHBOARD_STATS.totalScans, icon: ScanLine, color: "#a855f7", trend: { value: 12.4, positive: true }, path: ROUTES.adminScans },
    { title: "High-Risk Threats", value: ADMIN_DASHBOARD_STATS.highRiskThreats, icon: ShieldAlert, color: "#ec4899", trend: { value: 8.2, positive: false }, path: ROUTES.adminReports },
    { title: "AI Requests Today", value: ADMIN_DASHBOARD_STATS.aiRequestsToday, icon: Cpu, color: "#f59e0b", trend: { value: 14.8, positive: true }, path: ROUTES.adminAiUsage },
    { title: "Storage Used", value: ADMIN_DASHBOARD_STATS.storageUsed, icon: HardDrive, color: "#06b6d4", suffix: " GB", trend: { value: 2.3, positive: false }, path: ROUTES.adminSettings },
    { title: "System Health", value: ADMIN_DASHBOARD_STATS.systemHealth, icon: Activity, color: "#10b981", suffix: "%", trend: { value: 0.1, positive: true }, path: ROUTES.adminSettings },
  ];

  return (
    <div>
      <AdminHeader
        title="Admin Dashboard"
        description="Real-time overview of CyberShield AI platform health and key metrics."
        breadcrumbs={[{ label: "Dashboard" }]}
        icon={<LayoutDashboard size={20} className="text-[#a855f7]" />}
        actions={
          <>
            <CyberButton variant="secondary" size="sm" to={ROUTES.adminAnalytics}>
              View analytics
            </CyberButton>
            <CyberButton size="sm" to={ROUTES.adminNotifications}>
              Send alert
            </CyberButton>
          </>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <motion.button
            key={stat.title}
            onClick={() => navigate(stat.path)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            whileHover={{ y: -2 }}
            className="text-left"
          >
            <GlassCard variant="hover" className="p-5 relative overflow-hidden h-full">
              <div
                className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20 blur-2xl"
                style={{ background: stat.color }}
              />
              <div className="flex items-start justify-between gap-3 relative">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium truncate">
                    {stat.title}
                  </p>
                  <div className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight">
                    <AnimatedCounter
                      value={stat.value}
                      suffix={stat.suffix}
                      className="text-glow-blue"
                    />
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-[10px]">
                    <span
                      className="font-semibold px-1.5 py-0.5 rounded-md flex items-center gap-0.5"
                      style={{
                        color: stat.trend.positive ? "#34d399" : "#f87171",
                        background: stat.trend.positive ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                      }}
                    >
                      {stat.trend.positive ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                      {Math.abs(stat.trend.value)}%
                    </span>
                    <span className="text-muted-foreground">7d</span>
                  </div>
                </div>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${stat.color}1a`, border: `1px solid ${stat.color}40` }}
                >
                  <stat.icon size={18} style={{ color: stat.color }} strokeWidth={2.2} />
                </div>
              </div>
            </GlassCard>
          </motion.button>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
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
                <p className="text-xs text-muted-foreground mt-0.5">Active users & scans over the past 7 days</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00d4ff]" /> Users
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#a855f7]" /> Scans
                </span>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ADMIN_DASHBOARD_STATS.weeklyUserGrowth}>
                  <defs>
                    <linearGradient id="aUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#00d4ff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="aScans" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15,20,40,0.95)",
                      border: "1px solid rgba(168,85,247,0.3)",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                  <Area type="monotone" dataKey="users" stroke="#00d4ff" strokeWidth={2} fill="url(#aUsers)" />
                  <Area type="monotone" dataKey="scans" stroke="#a855f7" strokeWidth={2} fill="url(#aScans)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <GlassCard className="p-5 h-full">
            <h3 className="font-semibold mb-1">Storage Usage</h3>
            <p className="text-xs text-muted-foreground mb-4">{ADMIN_DASHBOARD_STATS.storageUsed} / 1024 GB</p>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={STORAGE_BREAKDOWN} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={3}>
                    {STORAGE_BREAKDOWN.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15,20,40,0.95)",
                      border: "1px solid rgba(168,85,247,0.3)",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 space-y-1.5">
              {STORAGE_BREAKDOWN.map((s) => (
                <div key={s.name} className="flex items-center gap-2 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                  <span className="text-muted-foreground flex-1">{s.name}</span>
                  <span className="font-mono font-medium">{s.value} GB</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <GlassCard className="p-5 h-full">
            <h3 className="font-semibold mb-1">Threat Categories</h3>
            <p className="text-xs text-muted-foreground mb-4">Distribution (last 30 days)</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ADMIN_DASHBOARD_STATS.threatCategories} layout="vertical">
                  <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} width={70} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15,20,40,0.95)",
                      border: "1px solid rgba(168,85,247,0.3)",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                    cursor={{ fill: "rgba(168,85,247,0.05)" }}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {ADMIN_DASHBOARD_STATS.threatCategories.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="lg:col-span-2"
        >
          <GlassCard className="p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">AI Request Trend</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Daily Gemma API requests vs failures</p>
              </div>
              <CyberButton variant="ghost" size="sm" to={ROUTES.adminAiUsage} iconRight={<ArrowRight size={13} />}>
                Details
              </CyberButton>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ADMIN_DASHBOARD_STATS.aiUsageTrend}>
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15,20,40,0.95)",
                      border: "1px solid rgba(168,85,247,0.3)",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                  <Line type="monotone" dataKey="requests" stroke="#00d4ff" strokeWidth={2} dot={{ fill: "#00d4ff", r: 3 }} />
                  <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Recent scans table preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Recent Scans</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Latest activity across the platform</p>
            </div>
            <CyberButton variant="ghost" size="sm" to={ROUTES.adminScans} iconRight={<ArrowRight size={13} />}>
              View all
            </CyberButton>
          </div>
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground border-b border-white/5">
                  <th className="py-2 pr-3 font-semibold">User</th>
                  <th className="py-2 pr-3 font-semibold">Type</th>
                  <th className="py-2 pr-3 font-semibold">Target</th>
                  <th className="py-2 pr-3 font-semibold">Risk</th>
                  <th className="py-2 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {ADMIN_SCANS.slice(0, 5).map((scan) => (
                  <tr key={scan.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#00d4ff] to-[#a855f7] flex items-center justify-center text-[10px] font-bold text-[#0a0e1a]">
                          {scan.target.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-medium">User #{scan.id.slice(-3)}</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-3 text-xs uppercase font-medium">{scan.type}</td>
                    <td className="py-2.5 pr-3 text-xs text-muted-foreground max-w-[200px] truncate">{scan.target}</td>
                    <td className="py-2.5 pr-3">
                      <span
                        className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md"
                        style={{
                          color:
                            scan.threatLevel === "critical" || scan.threatLevel === "high"
                              ? "#ef4444"
                              : scan.threatLevel === "medium"
                              ? "#f59e0b"
                              : "#10b981",
                          background:
                            scan.threatLevel === "critical" || scan.threatLevel === "high"
                              ? "rgba(239,68,68,0.1)"
                              : scan.threatLevel === "medium"
                              ? "rgba(245,158,11,0.1)"
                              : "rgba(16,185,129,0.1)",
                        }}
                      >
                        {scan.riskScore}/100
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <span className="text-xs text-emerald-400">✓ {scan.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>

      {/* System components status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="mt-4"
      >
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Server size={16} className="text-[#a855f7]" />
            <h3 className="font-semibold">System Components</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { name: "Web App", status: "operational", latency: "82ms" },
              { name: "API Gateway", status: "operational", latency: "142ms" },
              { name: "Database", status: "operational", latency: "38ms" },
              { name: "Gemma AI", status: "operational", latency: "1.84s" },
              { name: "Object Storage", status: "operational", latency: "88ms" },
              { name: "Threat Intel", status: "operational", latency: "12ms" },
            ].map((comp) => (
              <div key={comp.name} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium truncate">{comp.name}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                </div>
                <p className="text-[10px] text-emerald-400">Operational</p>
                <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{comp.latency}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
