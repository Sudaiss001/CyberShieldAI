"use client";

import { motion } from "framer-motion";
import {
  Cpu, CheckCircle2, XCircle, Clock, Zap, Server,
  Activity, TrendingUp, AlertTriangle,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, LineChart, Line,
} from "recharts";
import { AdminHeader } from "@/components/shared/AdminHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { CyberButton } from "@/components/shared/CyberButton";
import { useToast } from "@/hooks/use-toast";
import { AI_USAGE_STATS, ADMIN_DASHBOARD_STATS } from "@/lib/mock-data/admin";
import { cn } from "@/lib/utils";

export function AdminAiUsagePage() {
  const { toast } = useToast();

  const topStats = [
    { title: "Total Gemma Requests", value: AI_USAGE_STATS.totalRequests, icon: Cpu, color: "#a855f7", suffix: "" },
    { title: "Successful Requests", value: AI_USAGE_STATS.successfulRequests, icon: CheckCircle2, color: "#10b981", suffix: "" },
    { title: "Failed Requests", value: AI_USAGE_STATS.failedRequests, icon: XCircle, color: "#ef4444", suffix: "" },
    { title: "Avg Response Time", value: AI_USAGE_STATS.avgResponseTime, icon: Clock, color: "#00d4ff", suffix: "s" },
  ];

  return (
    <div>
      <AdminHeader
        title="AI Usage"
        description="Real-time monitoring of Gemma AI model usage, performance, and system health."
        breadcrumbs={[{ label: "AI Usage" }]}
        icon={<Cpu size={20} className="text-[#a855f7]" />}
        showBack
        actions={
          <>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-medium text-emerald-400">{AI_USAGE_STATS.status}</span>
            </span>
            <CyberButton variant="secondary" size="sm" onClick={() => toast({ title: "Report exported", description: "AI usage report downloaded" })}>
              Export
            </CyberButton>
          </>
        }
      />

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {topStats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard variant="hover" className="p-5 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-15 blur-2xl" style={{ background: stat.color }} />
              <div className="flex items-start justify-between mb-3 relative">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}30` }}
                >
                  <stat.icon size={18} style={{ color: stat.color }} strokeWidth={2.2} />
                </div>
              </div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{stat.title}</p>
              <p className="text-2xl font-bold mt-1">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Token usage + Success rate */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <GlassCard variant="strong" className="p-5 h-full">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} className="text-[#f59e0b]" />
              <h3 className="font-semibold">Token Usage Today</h3>
            </div>
            <p className="text-4xl font-bold gradient-text">
              {(AI_USAGE_STATS.tokensToday / 1_000_000).toFixed(2)}M
            </p>
            <p className="text-xs text-muted-foreground mt-1">tokens processed</p>
            <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Total tokens (all-time)</span>
                <span className="font-mono font-semibold">{(AI_USAGE_STATS.tokensTotal / 1_000_000_000).toFixed(2)}B</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Avg tokens / request</span>
                <span className="font-mono font-semibold">~242</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Estimated cost today</span>
                <span className="font-mono font-semibold text-[#f59e0b]">$42.18</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <GlassCard variant="strong" className="p-5 h-full">
            <div className="flex items-center gap-2 mb-3">
              <Activity size={16} className="text-emerald-400" />
              <h3 className="font-semibold">Success Rate</h3>
            </div>
            <div className="relative w-32 h-32 mx-auto mt-2">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
                <motion.circle
                  cx="50" cy="50" r="42"
                  stroke="#10b981"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 42}
                  initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - AI_USAGE_STATS.successRate / 100) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-emerald-400">{AI_USAGE_STATS.successRate}%</span>
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground">success</span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Success
              </span>
              <span className="flex items-center gap-1.5 text-red-400">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Failed ({AI_USAGE_STATS.failureRate}%)
              </span>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <GlassCard variant="strong" className="p-5 h-full">
            <div className="flex items-center gap-2 mb-3">
              <Server size={16} className="text-[#00d4ff]" />
              <h3 className="font-semibold">Model Info</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Active Model</p>
                <p className="text-sm font-semibold mt-0.5">{AI_USAGE_STATS.modelVersion}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Status</p>
                <p className="text-sm font-semibold mt-0.5 text-emerald-400 capitalize">{AI_USAGE_STATS.status}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Region</p>
                <p className="text-sm font-semibold mt-0.5">us-central1 (multi-zone)</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Max Tokens / Request</p>
                <p className="text-sm font-semibold mt-0.5 font-mono">8,192</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Request trend */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mb-4">
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Weekly AI Request Trend</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Daily requests, successes, and failures</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#00d4ff]" /> Total</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#10b981]" /> Success</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#ef4444]" /> Failed</span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ADMIN_DASHBOARD_STATS.aiUsageTrend}>
                <defs>
                  <linearGradient id="aiTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#00d4ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "rgba(15,20,40,0.95)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "12px", fontSize: "12px" }} />
                <Area type="monotone" dataKey="requests" stroke="#00d4ff" strokeWidth={2} fill="url(#aiTotal)" />
                <Line type="monotone" dataKey="success" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 3 }} />
                <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444", r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </motion.div>

      {/* Top endpoints + System components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <GlassCard className="p-5 h-full">
            <h3 className="font-semibold mb-1">Top Endpoints</h3>
            <p className="text-xs text-muted-foreground mb-4">Most called AI endpoints</p>
            <div className="space-y-2.5">
              {AI_USAGE_STATS.topEndpoints.map((ep, i) => (
                <motion.div
                  key={ep.endpoint}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + i * 0.05 }}
                  className="space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono">{ep.endpoint}</span>
                    <span className="text-muted-foreground">{ep.calls.toLocaleString()} ({ep.percentage}%)</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${ep.percentage * 2.5}%` }}
                      transition={{ duration: 1, delay: 1 + i * 0.05 }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, #a855f7, #00d4ff)` }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
          <GlassCard className="p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">System Components</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 font-medium">
                1 degraded
              </span>
            </div>
            <div className="space-y-2">
              {AI_USAGE_STATS.systemComponents.map((comp, i) => (
                <motion.div
                  key={comp.name}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + i * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full",
                        comp.status === "operational" ? "bg-emerald-400 animate-pulse" : "bg-amber-400 animate-pulse"
                      )}
                    />
                    <div>
                      <p className="text-xs font-medium">{comp.name}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">{comp.status}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono font-semibold">{comp.latency}ms</p>
                    <p className="text-[10px] text-muted-foreground">latency</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-3 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 flex items-start gap-2">
              <AlertTriangle size={14} className="text-amber-400 mt-0.5 shrink-0" />
              <p className="text-[10px] text-muted-foreground">
                OCR Service is experiencing degraded performance. Engineering team is investigating.
              </p>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
