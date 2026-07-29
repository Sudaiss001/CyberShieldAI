"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft, Download, Share2, Sparkles, RefreshCw, ShieldX, ShieldAlert,
  ShieldMinus, ShieldCheck, AlertTriangle, Lightbulb, CheckCircle2,
  Mail, Link2, Image, FileText, AudioLines, Video, QrCode, FileBarChart,
  ChevronRight,
} from "lucide-react";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { ThreatBadge } from "@/components/shared/ThreatBadge";
import { CyberButton } from "@/components/shared/CyberButton";
import { navigate, useHashRoute } from "@/hooks/use-router";
import { ROUTES } from "@/lib/routes";
import { SAMPLE_REPORTS, RECENT_SCANS } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { ScannerType, ThreatLevel } from "@/types";

const SCANNER_ICON: Record<ScannerType, any> = {
  url: Link2, email: Mail, image: Image, document: FileText,
  audio: AudioLines, video: Video, qr: QrCode, ai: Sparkles,
};

const SEVERITY_COLOR: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#f59e0b",
  low: "#06b6d4",
  info: "#3b82f6",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api-client";

export function ReportDetailsPage() {
  const [path] = useHashRoute();
  const { toast } = useToast();
  const [apiScan, setApiScan] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Extract scan ID from path: /reports/{id}
  const scanId = path.replace(ROUTES.reportDetails, "");

  useEffect(() => {
    async function loadScan() {
      if (!scanId || scanId.startsWith("sample-")) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await apiRequest<{ scan: any }>(`/scans/${scanId}`);
        if (res.success && res.data?.scan) {
          setApiScan(res.data.scan);
        }
      } catch {
        // Fallback to sample report
      } finally {
        setLoading(false);
      }
    }
    loadScan();
  }, [scanId]);

  const fallbackReport =
    SAMPLE_REPORTS.find((r) => r.scanId === scanId || r.id === scanId) ??
    SAMPLE_REPORTS[0];
  const fallbackScan = RECENT_SCANS.find((s) => s.id === fallbackReport.scanId) ?? RECENT_SCANS[0];

  const report = apiScan?.report
    ? {
        id: `REP-${apiScan.report.id}`,
        scanId: String(apiScan.id),
        threatLevel: (apiScan.risk_level || apiScan.report.risk_level || "safe").toLowerCase() as ThreatLevel,
        riskScore: apiScan.report.risk_score ?? 0,
        confidence: 95,
        target: apiScan.target,
        type: (apiScan.scan_type || "url") as ScannerType,
        category: `${apiScan.scan_type?.toUpperCase() || "URL"} Threat Assessment`,
        executiveSummary: apiScan.report.summary || "Scan completed.",
        createdAt: apiScan.created_at || new Date().toISOString(),
        indicators: (apiScan.report.indicators || []).map((i: any) => ({
          label: i.label || "Indicator",
          value: i.value || "Normal",
          severity: i.severity || "info",
        })),
        evidence: (apiScan.report.evidence || []).map((e: any) => ({
          title: e.title || "Finding",
          description: e.description || "",
          snippet: e.snippet || "",
          severity: (e.severity || "safe").toLowerCase() as ThreatLevel,
        })),
        recommendations: (apiScan.report.recommendations || []).map((r: any) => r.recommendation || r),
        preventionTips: [
          "Enable multi-factor authentication (MFA) across all critical accounts.",
          "Inspect domain names carefully for typosquatting before entering credentials.",
          "Keep security certificates and web browsers updated to the latest versions.",
        ],
        tags: (apiScan.report.tags || []).map((t: any) => t.tag || t),
      }
    : fallbackReport;

  const scan = apiScan
    ? { id: String(apiScan.id), target: apiScan.target, type: apiScan.scan_type, threatLevel: (apiScan.risk_level || "safe").toLowerCase() as ThreatLevel }
    : fallbackScan;

  const Icon = SCANNER_ICON[report.type] || Link2;

  const threatConfig: Record<ThreatLevel, { color: string; icon: any; label: string }> = {
    critical: { color: "#ef4444", icon: ShieldX, label: "Critical Threat" },
    high: { color: "#f97316", icon: ShieldAlert, label: "High Risk" },
    medium: { color: "#f59e0b", icon: ShieldAlert, label: "Medium Risk" },
    low: { color: "#06b6d4", icon: ShieldMinus, label: "Low Risk" },
    safe: { color: "#10b981", icon: ShieldCheck, label: "Safe" },
  };
  const tc = threatConfig[report.threatLevel];
  const ThreatIcon = tc.icon;

  const handleShare = () => {
    toast({ title: "Share link copied!", description: "Anyone with the link can view this report." });
  };
  const handleDownload = () => {
    toast({ title: "Report downloaded", description: `${report.id}.pdf saved to your downloads.` });
  };

  return (
    <div>
      <DashboardHeader
        title="Report Details"
        breadcrumbs={[
          { label: "Reports", path: ROUTES.reports },
          { label: report.id },
        ]}
        icon={<FileBarChart size={20} className="text-[#00d4ff]" />}
        showBack={ROUTES.reports}
        actions={
          <>
            <button
              onClick={() => navigate(ROUTES.reports)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={14} /> Back
            </button>
            <CyberButton variant="secondary" size="sm" onClick={handleDownload} icon={<Download size={14} />}>
              PDF
            </CyberButton>
            <CyberButton variant="secondary" size="sm" onClick={handleShare} icon={<Share2 size={14} />}>
              Share
            </CyberButton>
            <CyberButton size="sm" to={ROUTES.aiChat} icon={<Sparkles size={14} />}>
              Ask AI
            </CyberButton>
            <CyberButton variant="outline" size="sm" to={ROUTES.aiScanner} icon={<RefreshCw size={14} />}>
              Scan Again
            </CyberButton>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Threat banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <GlassCard
              variant="strong"
              className="p-6 relative overflow-hidden"
              glow={report.threatLevel === "critical" ? "red" : report.threatLevel === "high" ? "red" : "none"}
            >
              <div
                className="absolute inset-0 -z-10 opacity-20"
                style={{
                  background: `radial-gradient(circle at 20% 30%, ${tc.color}, transparent 60%)`,
                }}
              />
              <div className="flex items-start gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: `${tc.color}20`, border: `1px solid ${tc.color}40` }}
                >
                  <ThreatIcon size={30} style={{ color: tc.color }} strokeWidth={2.2} />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <ThreatBadge level={report.threatLevel} size="md" />
                    <span className="text-xs text-muted-foreground">{report.category}</span>
                  </div>
                  <h2 className="text-lg font-bold truncate">{report.target}</h2>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(report.createdAt)}</p>
                </div>
              </div>

              {/* Score gauges */}
              <div className="grid grid-cols-2 gap-3 mt-5">
                <ScoreGauge label="Risk Score" value={report.riskScore} color={tc.color} />
                <ScoreGauge label="Confidence" value={report.confidence} color="#00d4ff" />
              </div>
            </GlassCard>
          </motion.div>

          {/* Executive Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <GlassCard className="p-5">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FileText size={16} className="text-[#00d4ff]" />
                Executive Summary
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {report.executiveSummary}
              </p>
            </GlassCard>
          </motion.div>

          {/* Threat Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <GlassCard className="p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-400" />
                Threat Indicators
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {report.indicators.map((ind, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/5"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{ind.label}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{ind.value}</p>
                    </div>
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: SEVERITY_COLOR[ind.severity] }}
                      title={ind.severity}
                    />
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Evidence */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <GlassCard className="p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles size={16} className="text-[#a855f7]" />
                Evidence
              </h3>
              <div className="space-y-3">
                {report.evidence.map((ev, i) => (
                  <div key={i} className="rounded-xl bg-white/[0.02] border border-white/5 p-3.5">
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <p className="text-sm font-semibold">{ev.title}</p>
                      <ThreatBadge level={ev.severity} size="sm" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{ev.description}</p>
                    {ev.snippet && (
                      <pre className="text-[11px] font-mono text-[#00d4ff] bg-[#0a0e1a] rounded-lg p-2.5 overflow-x-auto">
                        {ev.snippet}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <GlassCard className="p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                Recommendations
              </h3>
              <ul className="space-y-2.5">
                {report.recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-2.5 text-sm">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-muted-foreground">{rec}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </motion.div>

          {/* Prevention Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <GlassCard variant="strong" className="p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Lightbulb size={16} className="text-amber-400" />
                Prevention Tips
              </h3>
              <ul className="space-y-2.5">
                {report.preventionTips.map((tip, i) => (
                  <li key={i} className="flex gap-2.5 text-sm">
                    <ChevronRight size={14} className="text-[#00d4ff] shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{tip}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Scan metadata */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <GlassCard className="p-5">
              <h3 className="font-semibold text-sm mb-3">Scan Metadata</h3>
              <div className="space-y-2.5 text-xs">
                <MetaRow label="Scan ID" value={scan.id} mono />
                <MetaRow label="Report ID" value={report.id} mono />
                <MetaRow label="Type" value={<span className="flex items-center gap-1.5"><Icon size={12} /> {scan.type}</span>} />
                <MetaRow label="Created" value={formatDate(report.createdAt)} />
                <MetaRow label="Status" value={<ThreatBadge level={scan.threatLevel} size="sm" />} />
              </div>
              <div className="mt-4 pt-3 border-t border-white/5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {report.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Quick actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <GlassCard variant="strong" className="p-5">
              <h3 className="font-semibold text-sm mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <CyberButton fullWidth size="sm" to={ROUTES.aiChat} icon={<Sparkles size={14} />}>
                  Ask AI about this
                </CyberButton>
                <CyberButton variant="secondary" fullWidth size="sm" onClick={handleDownload} icon={<Download size={14} />}>
                  Download PDF
                </CyberButton>
                <CyberButton variant="outline" fullWidth size="sm" to={ROUTES.aiScanner} icon={<RefreshCw size={14} />}>
                  Run another scan
                </CyberButton>
              </div>
            </GlassCard>
          </motion.div>

          {/* Related */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <GlassCard className="p-5">
              <h3 className="font-semibold text-sm mb-3">Related Reports</h3>
              <div className="space-y-2">
                {RECENT_SCANS.filter((s) => s.id !== scan.id).slice(0, 3).map((s) => {
                  const RIcon = SCANNER_ICON[s.type];
                  return (
                    <button
                      key={s.id}
                      onClick={() => navigate(`${ROUTES.reportDetails}${s.id}`)}
                      className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/5 transition-colors text-left"
                    >
                      <div className="w-7 h-7 rounded-md bg-white/5 flex items-center justify-center shrink-0">
                        <RIcon size={13} className="text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{s.target}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{s.category}</p>
                      </div>
                      <ChevronRight size={12} className="text-muted-foreground shrink-0" />
                    </button>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function ScoreGauge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3.5">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">{label}</p>
      <div className="flex items-end gap-2">
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold tabular-nums"
          style={{ color }}
        >
          {value}
        </motion.span>
        <span className="text-xs text-muted-foreground mb-1">/ 100</span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        />
      </div>
    </div>
  );
}

function MetaRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-medium text-foreground text-right", mono && "font-mono text-[11px]")}>{value}</span>
    </div>
  );
}
