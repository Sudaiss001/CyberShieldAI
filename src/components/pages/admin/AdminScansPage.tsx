"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ScanLine, Search, Filter, Mail, Link2, Image, AudioLines,
  Video, FileText, QrCode, ChevronLeft, ChevronRight,
} from "lucide-react";
import { AdminHeader } from "@/components/shared/AdminHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { ThreatBadge } from "@/components/shared/ThreatBadge";
import { CyberButton } from "@/components/shared/CyberButton";
import { useToast } from "@/hooks/use-toast";
import { ADMIN_SCANS, SCAN_TYPE_FILTERS } from "@/lib/mock-data/admin";
import { cn } from "@/lib/utils";
import type { ScannerType } from "@/types";

const SCANNER_ICON: Record<ScannerType, any> = {
  url: Link2, email: Mail, image: Image, document: FileText,
  audio: AudioLines, video: Video, qr: QrCode, ai: ScanLine,
};

const STATUS_STYLES: Record<string, { color: string; bg: string; label: string }> = {
  completed: { color: "#10b981", bg: "rgba(16,185,129,0.1)", label: "Completed" },
  processing: { color: "#00d4ff", bg: "rgba(0,212,255,0.1)", label: "Processing" },
  queued: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", label: "Queued" },
  failed: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", label: "Failed" },
};

const PAGE_SIZE = 10;

export function AdminScansPage() {
  const { toast } = useToast();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return ADMIN_SCANS.filter((s) => {
      if (typeFilter !== "all" && s.type !== typeFilter) return false;
      if (search && !s.user.toLowerCase().includes(search.toLowerCase()) && !s.target.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [typeFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageItems = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <div>
      <AdminHeader
        title="Scan Management"
        description={`${ADMIN_SCANS.length} total scans across all scanner types.`}
        breadcrumbs={[{ label: "Scans" }]}
        icon={<ScanLine size={20} className="text-[#a855f7]" />}
        showBack
        actions={
          <CyberButton
            variant="secondary"
            size="sm"
            onClick={() => toast({ title: "Export started", description: "Scan data will be ready shortly." })}
          >
            Export CSV
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
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by user or target..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-sm outline-none focus:border-[#a855f7]/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <Filter size={14} className="text-muted-foreground shrink-0 mr-1" />
            {SCAN_TYPE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => { setTypeFilter(f.value); setPage(1); }}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                  typeFilter === f.value
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

      {/* Stats summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total", value: ADMIN_SCANS.length, color: "#00d4ff" },
          { label: "Critical Threats", value: ADMIN_SCANS.filter((s) => s.threatLevel === "critical").length, color: "#ef4444" },
          { label: "Completed", value: ADMIN_SCANS.filter((s) => s.status === "completed").length, color: "#10b981" },
          { label: "Processing", value: ADMIN_SCANS.filter((s) => s.status === "processing" || s.status === "queued").length, color: "#f59e0b" },
        ].map((stat) => (
          <GlassCard key={stat.label} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <span className="w-2 h-2 rounded-full" style={{ background: stat.color }} />
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[920px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground border-b border-white/5">
                <th className="py-3 px-4 font-semibold">User</th>
                <th className="py-3 px-4 font-semibold">Scan Type</th>
                <th className="py-3 px-4 font-semibold">Target</th>
                <th className="py-3 px-4 font-semibold">Threat Level</th>
                <th className="py-3 px-4 font-semibold">Risk Score</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((scan) => {
                const Icon = SCANNER_ICON[scan.type];
                const status = STATUS_STYLES[scan.status];
                return (
                  <motion.tr
                    key={scan.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer"
                    onClick={() => toast({ title: "View scan details", description: scan.target })}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                          style={{ background: `linear-gradient(135deg, ${scan.color}, ${scan.color}99)` }}
                        >
                          {scan.avatar}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{scan.user}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{scan.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Icon size={14} className="text-muted-foreground" />
                        <span className="text-xs font-medium uppercase">{scan.type}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground max-w-[240px] truncate" title={scan.target}>
                      {scan.target}
                    </td>
                    <td className="py-3 px-4">
                      <ThreatBadge level={scan.threatLevel} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${scan.riskScore}%`,
                              background: scan.riskScore >= 80 ? "#ef4444" : scan.riskScore >= 50 ? "#f59e0b" : "#10b981",
                            }}
                          />
                        </div>
                        <span className="text-xs font-mono font-semibold">{scan.riskScore}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {new Date(scan.date).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md"
                        style={{ color: status.color, background: status.bg }}
                      >
                        {status.label}
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
            <ScanLine size={40} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium">No scans match your filters</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/5">
            <p className="text-xs text-muted-foreground">
              Showing {(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, filtered.length)} of {filtered.length} scans
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
