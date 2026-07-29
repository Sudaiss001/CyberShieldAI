"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ScrollText, Search, Filter, Download, ChevronLeft, ChevronRight,
  CheckCircle2, AlertTriangle, XCircle, Globe,
} from "lucide-react";
import { AdminHeader } from "@/components/shared/AdminHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { CyberButton } from "@/components/shared/CyberButton";
import { useToast } from "@/hooks/use-toast";
import { AUDIT_LOGS } from "@/lib/mock-data/admin";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  success: { label: "Success", color: "#10b981", bg: "rgba(16,185,129,0.1)", icon: CheckCircle2 },
  warning: { label: "Warning", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: AlertTriangle },
  error: { label: "Error", color: "#ef4444", bg: "rgba(239,68,68,0.1)", icon: XCircle },
} as const;

const MODULES = ["All", "Users", "Scans", "Reports", "Auth", "Cyber Academy", "Notifications", "Settings", "Roles", "Backup", "Profile"];

const PAGE_SIZE = 10;

export function AdminAuditLogsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return AUDIT_LOGS.filter((log) => {
      if (moduleFilter !== "All" && log.module !== moduleFilter) return false;
      if (statusFilter !== "all" && log.status !== statusFilter) return false;
      if (search && !log.user.toLowerCase().includes(search.toLowerCase()) && !log.action.toLowerCase().includes(search.toLowerCase()) && !log.ipAddress.includes(search)) return false;
      return true;
    });
  }, [search, moduleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageItems = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <div>
      <AdminHeader
        title="Audit Logs"
        description={`${AUDIT_LOGS.length} logged events. Complete activity trail for compliance and security.`}
        breadcrumbs={[{ label: "Audit Logs" }]}
        icon={<ScrollText size={20} className="text-[#a855f7]" />}
        showBack
        actions={
          <CyberButton
            variant="secondary"
            size="sm"
            icon={<Download size={14} />}
            onClick={() => toast({ title: "Export started", description: "Audit logs CSV will be ready shortly." })}
          >
            Export
          </CyberButton>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {(["success", "warning", "error"] as const).map((status) => {
          const cfg = STATUS_CONFIG[status];
          const count = AUDIT_LOGS.filter((l) => l.status === status).length;
          return (
            <GlassCard key={status} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: cfg.bg, border: `1px solid ${cfg.color}30` }}
                  >
                    <cfg.icon size={16} style={{ color: cfg.color }} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{cfg.label}</p>
                    <p className="text-xl font-bold" style={{ color: cfg.color }}>{count}</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Filters */}
      <GlassCard className="p-4 mb-5">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by user, action, or IP..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-sm outline-none focus:border-[#a855f7]/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className="text-muted-foreground shrink-0" />
            <select
              value={moduleFilter}
              onChange={(e) => { setModuleFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs outline-none focus:border-[#a855f7]/50"
            >
              {MODULES.map((m) => (
                <option key={m} value={m}>{m === "All" ? "All Modules" : m}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs outline-none focus:border-[#a855f7]/50"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[960px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground border-b border-white/5">
                <th className="py-3 px-4 font-semibold">User</th>
                <th className="py-3 px-4 font-semibold">Action</th>
                <th className="py-3 px-4 font-semibold">Module</th>
                <th className="py-3 px-4 font-semibold">IP Address</th>
                <th className="py-3 px-4 font-semibold">Time</th>
                <th className="py-3 px-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((log, i) => {
                const cfg = STATUS_CONFIG[log.status];
                return (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#a855f7] to-[#ec4899] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                          {log.avatar}
                        </div>
                        <span className="text-xs font-medium">{log.user}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-xs text-foreground max-w-[280px] truncate" title={log.action}>{log.action}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/5 text-muted-foreground">
                        {log.module}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                        <Globe size={11} /> {log.ipAddress}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {new Date(log.time).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md"
                        style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}30` }}
                      >
                        <cfg.icon size={10} strokeWidth={3} />
                        {cfg.label}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {pageItems.length === 0 && (
          <div className="p-12 text-center">
            <ScrollText size={40} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium">No logs match your filters</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/5">
            <p className="text-xs text-muted-foreground">
              Showing {(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, filtered.length)} of {filtered.length} logs
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, current - 1))}
                disabled={current === 1}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={cn(
                    "w-8 h-8 rounded-lg text-xs font-medium transition-colors",
                    current === i + 1 ? "bg-[#a855f7] text-white" : "bg-white/5 hover:bg-white/10"
                  )}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(Math.min(totalPages, current + 1))}
                disabled={current === totalPages}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
