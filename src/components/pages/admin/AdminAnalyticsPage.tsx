"use client";

import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, Users, ScanLine, Cpu, FileBarChart,
  ArrowRight, Download,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, RadialBarChart, RadialBar, Legend,
} from "recharts";
import { AdminHeader } from "@/components/shared/AdminHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { CyberButton } from "@/components/shared/CyberButton";
import { useToast } from "@/hooks/use-toast";
import { ADMIN_DASHBOARD_STATS, AI_USAGE_STATS } from "@/lib/mock-data/admin";

const dailyScans = [
  { day: "Jul 23", scans: 4120, threats: 412 },
  { day: "Jul 24", scans: 4580, threats: 458 },
  { day: "Jul 25", scans: 5120, threats: 489 },
  { day: "Jul 26", scans: 4890, threats: 612 },
  { day: "Jul 27", scans: 5640, threats: 718 },
  { day: "Jul 28", scans: 3210, threats: 298 },
  { day: "Jul 29", scans: 2980, threats: 284 },
];

const monthlyReports = [
  { month: "Jan", reports: 8420 },
  { month: "Feb", reports: 9120 },
  { month: "Mar", reports: 9840 },
  { month: "Apr", reports: 10580 },
  { month: "May", reports: 11200 },
  { month: "Jun", reports: 11820 },
  { month: "Jul", reports: 12483 },
];

const scannerDistribution = [
  { name: "URL", value: 412, color: "#00d4ff" },
  { name: "Email", value: 358, color: "#10b981" },
  { name: "Image", value: 184, color: "#a855f7" },
  { name: "Document", value: 142, color: "#f59e0b" },
  { name: "QR", value: 96, color: "#06b6d4" },
  { name: "Audio", value: 52, color: "#ec4899" },
  { name: "Video", value: 40, color: "#ef4444" },
];

const geographicData = [
  { country: "United States", users: 4280, percentage: 34.3 },
  { country: "United Kingdom", users: 1840, percentage: 14.7 },
  { country: "Germany", users: 1240, percentage: 9.9 },
  { country: "Nigeria", users: 980, percentage: 7.9 },
  { country: "India", users: 820, percentage: 6.6 },
  { country: "Japan", users: 680, percentage: 5.4 },
  { country: "Other", users: 2643, percentage: 21.2 },
];

export function AdminAnalyticsPage() {
  const { toast } = useToast();

  return (
    <div>
      <AdminHeader
        title="Analytics"
        description="Deep dive into platform metrics, user growth, and threat trends."
        breadcrumbs={[{ label: "Analytics" }]}
        icon={<BarChart3 size={20} className="text-[#a855f7]" />}
        showBack
        actions={
          <CyberButton
            variant="secondary"
            size="sm"
            icon={<Download size={14} />}
            onClick={() => toast({ title: "Report exported", description: "Analytics dashboard exported as PDF" })}
          >
            Export report
          </CyberButton>
        }
      />

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Scans (30d)", value: 35240, icon: ScanLine, color: "#a855f7", trend: "+12.4%" },
          { label: "New Users (30d)", value: 663, icon: Users, color: "#00d4ff", trend: "+5.6%" },
          { label: "AI Requests (30d)", value: 52271, icon: Cpu, color: "#f59e0b", trend: "+18.2%" },
          { label: "Threats Detected", value: 1247, icon: FileBarChart, color: "#ef4444", trend: "+8.1%" },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard variant="hover" className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${kpi.color}15`, border: `1px solid ${kpi.color}30` }}
                >
                  <kpi.icon size={18} style={{ color: kpi.color }} strokeWidth={2.2} />
                </div>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center gap-0.5">
                  <TrendingUp size={9} /> {kpi.trend}
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
              <p className="text-2xl font-bold mt-1">
                <AnimatedCounter value={kpi.value} />
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Charts row 1 — Daily scans + User growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard className="p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Daily Scans</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Last 7 days — scans vs threats</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#a855f7]" /> Scans</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#ef4444]" /> Threats</span>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyScans}>
                  <defs>
                    <linearGradient id="aScans2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "rgba(15,20,40,0.95)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "12px", fontSize: "12px" }} />
                  <Area type="monotone" dataKey="scans" stroke="#a855f7" strokeWidth={2} fill="url(#aScans2)" />
                  <Line type="monotone" dataKey="threats" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444", r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <GlassCard className="p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">User Growth</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Total users & new signups (monthly)</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#00d4ff]" /> Total</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#10b981]" /> New</span>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ADMIN_DASHBOARD_STATS.userGrowthMonthly}>
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "rgba(15,20,40,0.95)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "12px", fontSize: "12px" }} cursor={{ fill: "rgba(168,85,247,0.05)" }} />
                  <Bar dataKey="total" fill="#00d4ff" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="new" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Charts row 2 — Threats + AI usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <GlassCard className="p-5 h-full">
            <h3 className="font-semibold mb-1">Threat Categories</h3>
            <p className="text-xs text-muted-foreground mb-4">Distribution across all threat types</p>
            <div className="grid grid-cols-2 gap-4 items-center">
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={ADMIN_DASHBOARD_STATS.threatCategories} dataKey="value" nameKey="name" innerRadius={35} outerRadius={60} paddingAngle={3}>
                      {ADMIN_DASHBOARD_STATS.threatCategories.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "rgba(15,20,40,0.95)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "12px", fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5">
                {ADMIN_DASHBOARD_STATS.threatCategories.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-2 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: cat.color }} />
                    <span className="text-muted-foreground flex-1">{cat.name}</span>
                    <span className="font-mono font-medium">{cat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <GlassCard className="p-5 h-full">
            <h3 className="font-semibold mb-1">AI Usage (Hourly)</h3>
            <p className="text-xs text-muted-foreground mb-4">Gemma API requests in the last 24h</p>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={AI_USAGE_STATS.requestsByHour}>
                  <XAxis dataKey="hour" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "rgba(15,20,40,0.95)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "12px", fontSize: "12px" }} cursor={{ fill: "rgba(168,85,247,0.05)" }} />
                  <Bar dataKey="requests" radius={[4, 4, 0, 0]}>
                    {AI_USAGE_STATS.requestsByHour.map((_, i) => (
                      <Cell key={i} fill={i >= 8 && i <= 16 ? "#a855f7" : "#a855f766"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Charts row 3 — Scanner distribution + Weekly activity + Geography */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <GlassCard className="p-5 h-full">
            <h3 className="font-semibold mb-1">Scanner Usage</h3>
            <p className="text-xs text-muted-foreground mb-4">By scanner type (30d)</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={scannerDistribution} dataKey="value" nameKey="name" outerRadius={70} paddingAngle={2}>
                    {scannerDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "rgba(15,20,40,0.95)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "12px", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <GlassCard className="p-5 h-full">
            <h3 className="font-semibold mb-1">Weekly Activity</h3>
            <p className="text-xs text-muted-foreground mb-4">Active users & scans</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ADMIN_DASHBOARD_STATS.weeklyUserGrowth}>
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "rgba(15,20,40,0.95)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "12px", fontSize: "12px" }} />
                  <Line type="monotone" dataKey="users" stroke="#00d4ff" strokeWidth={2} dot={{ fill: "#00d4ff", r: 3 }} />
                  <Line type="monotone" dataKey="scans" stroke="#a855f7" strokeWidth={2} dot={{ fill: "#a855f7", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
          <GlassCard className="p-5 h-full">
            <h3 className="font-semibold mb-1">Monthly Reports</h3>
            <p className="text-xs text-muted-foreground mb-4">Total reports generated</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyReports}>
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "rgba(15,20,40,0.95)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "12px", fontSize: "12px" }} cursor={{ fill: "rgba(168,85,247,0.05)" }} />
                  <Bar dataKey="reports" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Geography */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Geographic Distribution</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Top user locations worldwide</p>
            </div>
            <CyberButton variant="ghost" size="sm" iconRight={<ArrowRight size={13} />} onClick={() => toast({ title: "Detailed view", description: "Opening geographic analytics" })}>
              Details
            </CyberButton>
          </div>
          <div className="space-y-3">
            {geographicData.map((geo, i) => (
              <motion.div
                key={geo.country}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 + i * 0.05 }}
                className="flex items-center gap-3"
              >
                <span className="text-xs font-medium w-32 sm:w-40 truncate">{geo.country}</span>
                <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${geo.percentage}%` }}
                    transition={{ duration: 1, delay: 1.2 + i * 0.05 }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, #00d4ff, #a855f7)` }}
                  />
                </div>
                <span className="text-xs font-mono text-muted-foreground w-20 text-right">{geo.users.toLocaleString()}</span>
                <span className="text-xs font-mono font-semibold w-12 text-right">{geo.percentage}%</span>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
