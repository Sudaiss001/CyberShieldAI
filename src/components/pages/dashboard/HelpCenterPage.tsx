"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  LifeBuoy, Search, Mail, MessageSquare, Phone, Book, Video,
  FileText, ChevronDown, ArrowRight, Sparkles, ExternalLink,
} from "lucide-react";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { CyberButton } from "@/components/shared/CyberButton";
import { ROUTES } from "@/lib/routes";
import { useToast } from "@/hooks/use-toast";
import { navigate } from "@/hooks/use-router";
import { FAQ_ITEMS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const QUICK_LINKS = [
  { icon: Book, title: "Getting Started", desc: "New user onboarding guide", color: "#00d4ff", path: ROUTES.academyDashboard },
  { icon: Video, title: "Video Tutorials", desc: "Watch step-by-step walkthroughs", color: "#a855f7", path: ROUTES.academyDashboard },
  { icon: FileText, title: "Documentation", desc: "Read the full API & user docs", color: "#10b981", path: ROUTES.faq },
  { icon: Sparkles, title: "AI Chat", desc: "Ask our AI assistant anything", color: "#f59e0b", path: ROUTES.aiChat },
];

const CONTACT_OPTIONS = [
  { icon: MessageSquare, title: "Live chat", desc: "Avg response: 2 min", action: "Start chat", color: "#00d4ff" },
  { icon: Mail, title: "Email support", desc: "support@cybershield.ai", action: "Send email", color: "#10b981" },
  { icon: Phone, title: "Phone (Enterprise)", desc: "+1 (415) 555-CYBR", action: "Call now", color: "#a855f7" },
];

export function HelpCenterPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>("0-0");

  const allQuestions = FAQ_ITEMS.flatMap((cat, ci) =>
    cat.questions.map((q, qi) => ({ ...q, category: cat.category, id: `${ci}-${qi}` }))
  );

  const filtered = search
    ? allQuestions.filter(
        (q) =>
          q.q.toLowerCase().includes(search.toLowerCase()) ||
          q.a.toLowerCase().includes(search.toLowerCase())
      )
    : allQuestions.slice(0, 8);

  return (
    <div>
      <DashboardHeader
        title="Help Center"
        description="Find answers, learn the platform, and reach our support team."
        breadcrumbs={[{ label: "Help Center" }]}
        icon={<LifeBuoy size={20} className="text-[#00d4ff]" />}
        showBack
      />

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <GlassCard variant="strong" className="p-6 relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-1/3 w-48 h-48 rounded-full bg-[#00d4ff]/15 blur-3xl" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">How can we help?</h2>
          <p className="text-sm text-muted-foreground mb-4">Search our knowledge base or browse popular topics below.</p>
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for help articles..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-sm outline-none focus:border-[#00d4ff]/50 focus:bg-[#00d4ff]/5 transition-all"
            />
          </div>
        </GlassCard>
      </motion.div>

      {/* Quick links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {QUICK_LINKS.map((link, i) => (
          <motion.button
            key={link.title}
            onClick={() => navigate(link.path)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4 }}
            className="text-left"
          >
            <GlassCard variant="hover" className="p-4 h-full">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${link.color}15`, border: `1px solid ${link.color}30` }}
              >
                <link.icon size={18} style={{ color: link.color }} strokeWidth={2.2} />
              </div>
              <p className="text-sm font-semibold mb-1">{link.title}</p>
              <p className="text-xs text-muted-foreground">{link.desc}</p>
            </GlassCard>
          </motion.button>
        ))}
      </div>

      {/* FAQ accordion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <GlassCard className="p-5">
            <h3 className="font-semibold mb-1">Popular questions</h3>
            <p className="text-xs text-muted-foreground mb-4">Top asked questions in our help center.</p>
            <div className="space-y-2">
              {filtered.map((q) => (
                <div key={q.id} className="rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden">
                  <button
                    onClick={() => setOpenId(openId === q.id ? null : q.id)}
                    className="w-full flex items-center justify-between gap-3 p-3.5 text-left hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="text-sm font-medium">{q.q}</span>
                    <ChevronDown
                      size={15}
                      className={cn("text-muted-foreground shrink-0 transition-transform", openId === q.id && "rotate-180 text-[#00d4ff]")}
                    />
                  </button>
                  <motion.div
                    initial={false}
                    animate={{
                      height: openId === q.id ? "auto" : 0,
                      opacity: openId === q.id ? 1 : 0,
                    }}
                    className="overflow-hidden"
                  >
                    <p className="px-3.5 pb-3.5 text-xs text-muted-foreground leading-relaxed">{q.a}</p>
                  </motion.div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No articles match "{search}"</p>
                </div>
              )}
            </div>
            <CyberButton variant="outline" size="sm" to={ROUTES.faq} className="mt-4">
              Browse all FAQs <ArrowRight size={13} />
            </CyberButton>
          </GlassCard>
        </div>

        {/* Contact options */}
        <div className="space-y-3">
          <GlassCard variant="strong" className="p-5">
            <h3 className="font-semibold mb-1">Talk to us</h3>
            <p className="text-xs text-muted-foreground mb-4">Our support team is here to help.</p>
            <div className="space-y-2.5">
              {CONTACT_OPTIONS.map((opt) => (
                <button
                  key={opt.title}
                  onClick={() => toast({ title: opt.action, description: opt.desc })}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all text-left group"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${opt.color}15`, border: `1px solid ${opt.color}30` }}
                  >
                    <opt.icon size={15} style={{ color: opt.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{opt.title}</p>
                    <p className="text-[11px] text-muted-foreground">{opt.desc}</p>
                  </div>
                  <ArrowRight size={13} className="text-muted-foreground group-hover:text-[#00d4ff] transition-colors shrink-0" />
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <h3 className="font-semibold mb-1">System status</h3>
            <p className="text-xs text-muted-foreground mb-3">All systems operational.</p>
            <div className="space-y-2 text-xs">
              {[
                { name: "Web App", status: "Operational" },
                { name: "API", status: "Operational" },
                { name: "AI Processing", status: "Operational" },
                { name: "Threat Intel", status: "Operational" },
              ].map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{s.name}</span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-400">{s.status}</span>
                  </span>
                </div>
              ))}
            </div>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="mt-3 text-xs text-[#00d4ff] hover:underline flex items-center gap-1"
            >
              View status page <ExternalLink size={11} />
            </a>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
