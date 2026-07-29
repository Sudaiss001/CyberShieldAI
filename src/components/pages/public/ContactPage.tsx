"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MessageSquare, Phone, MapPin, Send, Building, LifeBuoy } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { CyberButton } from "@/components/shared/CyberButton";
import { useToast } from "@/hooks/use-toast";

const CONTACT_METHODS = [
  { icon: Mail, label: "Email", value: "hello@cybershield.ai", desc: "General inquiries — we reply within 24 hours.", color: "#00d4ff" },
  { icon: LifeBuoy, label: "Support", value: "support@cybershield.ai", desc: "Technical issues & account help.", color: "#10b981" },
  { icon: Phone, label: "Sales", value: "+1 (415) 555-CYBR", desc: "Mon-Fri 9am-6pm PT for enterprise deals.", color: "#a855f7" },
  { icon: MapPin, label: "Office", value: "Lagos · San Francisco · London", desc: "Hybrid-first, global team.", color: "#f59e0b" },
];

export function ContactPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    subject: "general",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message sent!",
      description: "We'll get back to you within 24 hours.",
    });
    setForm({ name: "", email: "", company: "", subject: "general", message: "" });
  };

  return (
    <div>
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#00d4ff]">
              Contact Us
            </span>
            <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight">
              Let's <span className="gradient-text">talk security</span>
            </h1>
            <p className="mt-4 text-muted-foreground">
              Questions about CyberShield AI? Need a demo? Want to report a vulnerability?
              We'd love to hear from you.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact methods */}
            <div className="space-y-4">
              {CONTACT_METHODS.map((m, i) => (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <GlassCard variant="hover" className="p-5 flex items-start gap-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${m.color}15`, border: `1px solid ${m.color}30` }}
                    >
                      <m.icon size={20} style={{ color: m.color }} strokeWidth={2.2} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{m.label}</p>
                      <p className="text-sm font-medium mt-0.5">{m.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{m.desc}</p>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>

            {/* Contact form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <GlassCard variant="strong" className="p-6 sm:p-8">
                <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
                  <MessageSquare size={18} className="text-[#00d4ff]" />
                  Send us a message
                </h2>
                <p className="text-sm text-muted-foreground mb-6">We'll get back to you within 24 hours.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1.5 block">Name</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Jane Doe"
                        className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm outline-none focus:border-[#00d4ff]/50 focus:bg-[#00d4ff]/5 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1.5 block">Email</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="jane@company.com"
                        className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm outline-none focus:border-[#00d4ff]/50 focus:bg-[#00d4ff]/5 transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1.5 block">Company (optional)</label>
                      <input
                        type="text"
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        placeholder="Acme Inc."
                        className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm outline-none focus:border-[#00d4ff]/50 focus:bg-[#00d4ff]/5 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1.5 block">Subject</label>
                      <select
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm outline-none focus:border-[#00d4ff]/50 transition-all"
                      >
                        <option value="general">General inquiry</option>
                        <option value="sales">Sales / Enterprise</option>
                        <option value="support">Technical support</option>
                        <option value="security">Security report</option>
                        <option value="partnership">Partnership</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1.5 block">Message</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us how we can help..."
                      className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm outline-none focus:border-[#00d4ff]/50 focus:bg-[#00d4ff]/5 transition-all resize-none"
                    />
                  </div>
                  <CyberButton type="submit" fullWidth size="lg" icon={<Send size={16} />}>
                    Send message
                  </CyberButton>
                </form>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
