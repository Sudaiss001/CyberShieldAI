"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileBarChart, Search, Filter, Download, Eye, Calendar,
  Mail, Link2, Image, FileText, AudioLines, Video, QrCode, Sparkles,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { ThreatBadge } from "@/components/shared/ThreatBadge";
import { navigate } from "@/hooks/use-router";
import { ROUTES } from "@/lib/routes";
import { RECENT_SCANS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { ThreatLevel, ScannerType } from "@/types";

const SCANNER_ICON: Record<ScannerType, any> = {
  url: Link2, email: Mail, image: Image, document: FileText,
  audio: AudioLines, video: Video, qr: QrCode, ai: Sparkles,
};

const FILTERS: { label: string; value: ThreatLevel | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Critical", value: "critical" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Safe", value: "safe" },
];

const PAGE_SIZE = 6;

// Pad the report list with extra entries so pagination is visible
const ALL_REPORTS = [
  ...RECENT_SCANS,
  ...RECENT_SCANS.map((r, i) => ({ ...r, id: `${r.id}-dup-${i}`, createdAt: "2026-07-25T10:00:00Z" })),
  ...RECENT_SCANS.slice(0, 4).map((r, i) => ({ ...r, id: `${r.id}-dup2-${i}`, createdAt: "2026-07-20T10:00:00Z" })),
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ReportsPage() {
  const [filter, setFilter] = useState<ThreatLevel | "all">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return ALL_REPORTS.filter((r) => {
      if (filter !== "all" && r.threatLevel !== filter) return false;
      if (search && !r.target.toLowerCase().includes(search.toLowerCase()) && !r.category.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [filter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageItems = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <div>
      <DashboardHeader
        title="Reports"
        description="All scan reports across every scanner type. Filter, search, and download."
        breadcrumbs={[{ label: "Reports" }]}
        icon={<FileBarChart size={20} className="text-[#00d4ff]" />}
        showBack
        actions={
          <button
            onClick={() => navigate(ROUTES.aiScanner)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#00d4ff] to-[#0099cc] text-[#0a0e1a] hover:shadow-[0_4px_20px_rgba(0,212,255,0.4)] transition-all"
          >
            <Sparkles size={15} /> New Scan
          </button>
        }
      />

      {/* Filters & search */}
      <GlassCard className="p-4 mb-5">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by target or category..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-sm outline-none focus:border-[#00d4ff]/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <Filter size={14} className="text-muted-foreground shrink-0 mr-1" />
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => { setFilter(f.value); setPage(1); }}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                  filter === f.value
                    ? "bg-[#00d4ff] text-[#0a0e1a]"
                    : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Reports grid */}
      {pageItems.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <FileBarChart size={40} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-sm font-medium">No reports match your filters</p>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filter.</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {pageItems.map((report, i) => {
              const Icon = SCANNER_ICON[report.type];
              return (
                <motion.div
                  key={report.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <GlassCard variant="hover" className="p-5 h-full flex flex-col">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                        <Icon size={18} className="text-[#00d4ff]" />
                      </div>
                      <ThreatBadge level={report.threatLevel} size="sm" />
                    </div>
                    <h3 className="text-sm font-semibold truncate mb-1" title={report.target}>
                      {report.target}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
                      {report.summary}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} /> {formatDate(report.createdAt)}
                      </span>
                      <span className="font-mono">Risk: {report.riskScore}/100</span>
                    </div>
                    <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                      <button
                        onClick={() => navigate(`${ROUTES.reportDetails}${report.id}`)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[#00d4ff]/10 text-[#00d4ff] hover:bg-[#00d4ff]/20 text-xs font-medium transition-colors"
                      >
                        <Eye size={13} /> View
                      </button>
                      <button className="inline-flex items-center justify-center w-8 h-7 rounded-lg bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors">
                        <Download size={13} />
                      </button>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, filtered.length)} of {filtered.length} reports
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
                  current === i + 1 ? "bg-[#00d4ff] text-[#0a0e1a]" : "bg-white/5 hover:bg-white/10"
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
    </div>
  );
}
