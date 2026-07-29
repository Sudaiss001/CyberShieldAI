"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileBarChart, Search, Filter, Download, SortAsc, SortDesc,
  Eye, X, Calendar, User, Tag, FileText,
} from "lucide-react";
import { AdminHeader } from "@/components/shared/AdminHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { ThreatBadge } from "@/components/shared/ThreatBadge";
import { CyberButton } from "@/components/shared/CyberButton";
import { useToast } from "@/hooks/use-toast";
import { ADMIN_REPORTS, type AdminReport } from "@/lib/mock-data/admin";
import { cn } from "@/lib/utils";
import type { ThreatLevel } from "@/types";

type SortKey = "date" | "riskScore" | "user" | "target";
type SortDir = "asc" | "desc";

const THREAT_FILTERS: { label: string; value: ThreatLevel | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Critical", value: "critical" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Safe", value: "safe" },
];

export function AdminReportsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [threatFilter, setThreatFilter] = useState<ThreatLevel | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [drawer, setDrawer] = useState<AdminReport | null>(null);

  const filtered = useMemo(() => {
    const result = ADMIN_REPORTS.filter((r) => {
      if (threatFilter !== "all" && r.threatLevel !== threatFilter) return false;
      if (search && !r.user.toLowerCase().includes(search.toLowerCase()) && !r.target.toLowerCase().includes(search.toLowerCase()) && !r.category.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    return result.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "date") cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      else if (sortKey === "riskScore") cmp = a.riskScore - b.riskScore;
      else if (sortKey === "user") cmp = a.user.localeCompare(b.user);
      else cmp = a.target.localeCompare(b.target);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [search, threatFilter, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return (
    <div>
      <AdminHeader
        title="Reports"
        description={`${ADMIN_REPORTS.length} total reports — searchable, filterable, sortable.`}
        breadcrumbs={[{ label: "Reports" }]}
        icon={<FileBarChart size={20} className="text-[#a855f7]" />}
        showBack
        actions={
          <CyberButton
            variant="secondary"
            size="sm"
            icon={<Download size={14} />}
            onClick={() => toast({ title: "Export started", description: "Reports PDF bundle will be ready shortly." })}
          >
            Export
          </CyberButton>
        }
      />

      {/* Filters */}
      <GlassCard className="p-4 mb-5">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user, target, or category..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-sm outline-none focus:border-[#a855f7]/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <Filter size={14} className="text-muted-foreground shrink-0 mr-1" />
            {THREAT_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setThreatFilter(f.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                  threatFilter === f.value
                    ? "bg-[#a855f7] text-white"
                    : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[920px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground border-b border-white/5">
                <th className="py-3 px-4 font-semibold">
                  <button onClick={() => toggleSort("target")} className="flex items-center gap-1 hover:text-foreground">
                    Report {sortKey === "target" && (sortDir === "asc" ? <SortAsc size={11} /> : <SortDesc size={11} />)}
                  </button>
                </th>
                <th className="py-3 px-4 font-semibold">
                  <button onClick={() => toggleSort("user")} className="flex items-center gap-1 hover:text-foreground">
                    User {sortKey === "user" && (sortDir === "asc" ? <SortAsc size={11} /> : <SortDesc size={11} />)}
                  </button>
                </th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Threat</th>
                <th className="py-3 px-4 font-semibold">
                  <button onClick={() => toggleSort("riskScore")} className="flex items-center gap-1 hover:text-foreground">
                    Risk {sortKey === "riskScore" && (sortDir === "asc" ? <SortAsc size={11} /> : <SortDesc size={11} />)}
                  </button>
                </th>
                <th className="py-3 px-4 font-semibold">
                  <button onClick={() => toggleSort("date")} className="flex items-center gap-1 hover:text-foreground">
                    Date {sortKey === "date" && (sortDir === "asc" ? <SortAsc size={11} /> : <SortDesc size={11} />)}
                  </button>
                </th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((report) => (
                <motion.tr
                  key={report.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer"
                  onClick={() => setDrawer(report)}
                >
                  <td className="py-3 px-4">
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate max-w-[220px]" title={report.target}>{report.target}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{report.id}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                        style={{ background: `linear-gradient(135deg, ${report.color}, ${report.color}99)` }}
                      >
                        {report.avatar}
                      </div>
                      <span className="text-xs">{report.user}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs uppercase font-medium">{report.type}</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{report.category}</td>
                  <td className="py-3 px-4"><ThreatBadge level={report.threatLevel} size="sm" /></td>
                  <td className="py-3 px-4">
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md"
                      style={{
                        color: report.riskScore >= 80 ? "#ef4444" : report.riskScore >= 50 ? "#f59e0b" : "#10b981",
                        background: report.riskScore >= 80 ? "rgba(239,68,68,0.1)" : report.riskScore >= 50 ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)",
                      }}
                    >
                      {report.riskScore}/100
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">
                    {new Date(report.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); setDrawer(report); }}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <Eye size={15} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <FileBarChart size={40} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium">No reports match your filters</p>
          </div>
        )}
      </GlassCard>

      {/* Drawer */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              onClick={() => setDrawer(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md glass-strong border-l border-white/10 overflow-y-auto scrollbar-thin"
            >
              <div className="sticky top-0 z-10 glass-strong border-b border-white/5 p-5 flex items-center justify-between">
                <h3 className="font-semibold">Report Details</h3>
                <button
                  onClick={() => setDrawer(null)}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-5 space-y-5">
                {/* Threat banner */}
                <div
                  className="rounded-2xl p-5 relative overflow-hidden"
                  style={{
                    background: drawer.threatLevel === "critical" || drawer.threatLevel === "high"
                      ? "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))"
                      : drawer.threatLevel === "medium"
                      ? "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))"
                      : "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))",
                    border: `1px solid ${drawer.threatLevel === "critical" || drawer.threatLevel === "high" ? "rgba(239,68,68,0.3)" : drawer.threatLevel === "medium" ? "rgba(245,158,11,0.3)" : "rgba(16,185,129,0.3)"}`,
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <ThreatBadge level={drawer.threatLevel} size="md" />
                      <h4 className="mt-2 text-base font-bold truncate" title={drawer.target}>{drawer.target}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{drawer.category}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-3xl font-bold">{drawer.riskScore}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Risk Score</p>
                    </div>
                  </div>
                </div>

                {/* Meta */}
                <div className="glass rounded-xl p-4 space-y-2.5 text-xs">
                  <MetaRow icon={Tag} label="Report ID" value={drawer.id} mono />
                  <MetaRow icon={FileText} label="Type" value={drawer.type.toUpperCase()} />
                  <MetaRow icon={User} label="User" value={`${drawer.avatar} ${drawer.user}`} />
                  <MetaRow icon={Calendar} label="Date" value={new Date(drawer.date).toLocaleString()} />
                  <MetaRow icon={Tag} label="Status" value={drawer.status.charAt(0).toUpperCase() + drawer.status.slice(1)} />
                </div>

                {/* Summary */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Executive Summary</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{drawer.summary}</p>
                </div>

                {/* Threat indicators */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Indicators</h4>
                  <div className="space-y-1.5">
                    {[
                      { label: "Risk Score", value: `${drawer.riskScore}/100`, severity: drawer.riskScore >= 80 ? "critical" : "medium" },
                      { label: "Threat Level", value: drawer.threatLevel, severity: drawer.threatLevel },
                      { label: "Category", value: drawer.category, severity: "info" },
                      { label: "Confidence", value: "94%", severity: "low" },
                    ].map((ind) => (
                      <div key={ind.label} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5">
                        <span className="text-xs text-muted-foreground">{ind.label}</span>
                        <span className="text-xs font-mono font-medium capitalize">{ind.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2">
                  <CyberButton fullWidth size="sm" icon={<Download size={14} />} onClick={() => toast({ title: "Report downloaded" })}>
                    Download PDF
                  </CyberButton>
                  <CyberButton fullWidth size="sm" variant="secondary" icon={<Eye size={14} />} onClick={() => toast({ title: "Full view", description: "Opening detailed report view" })}>
                    View Full Report
                  </CyberButton>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function MetaRow({ icon: Icon, label, value, mono }: { icon: any; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <Icon size={12} /> {label}
      </span>
      <span className={cn("font-medium text-foreground text-right", mono && "font-mono text-[11px]")}>{value}</span>
    </div>
  );
}
