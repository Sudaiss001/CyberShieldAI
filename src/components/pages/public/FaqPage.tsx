"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, HelpCircle } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { CyberButton } from "@/components/shared/CyberButton";
import { FAQ_ITEMS } from "@/lib/mock-data";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function FaqPage() {
  const [activeCategory, setActiveCategory] = useState(FAQ_ITEMS[0].category);
  const [openIndex, setOpenIndex] = useState<string | null>("0-0");
  const [search, setSearch] = useState("");

  const filteredItems = FAQ_ITEMS.filter((cat) => {
    if (search) {
      const matches = cat.questions.filter(
        (q) =>
          q.q.toLowerCase().includes(search.toLowerCase()) ||
          q.a.toLowerCase().includes(search.toLowerCase())
      );
      return matches.length > 0;
    }
    return cat.category === activeCategory;
  });

  return (
    <div>
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#00d4ff]">
              FAQ
            </span>
            <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight">
              Questions? <span className="gradient-text">We've got answers.</span>
            </h1>
            <p className="mt-4 text-muted-foreground">
              Everything you need to know about CyberShield AI. Can't find what
              you're looking for? <a className="text-[#00d4ff] hover:underline" href={`#${ROUTES.contact}`}>Contact us</a>.
            </p>
          </div>

          <div className="mt-8 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-sm outline-none focus:border-[#00d4ff]/50 focus:bg-[#00d4ff]/5 transition-all"
            />
          </div>

          {!search && (
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {FAQ_ITEMS.map((cat) => (
                <button
                  key={cat.category}
                  onClick={() => setActiveCategory(cat.category)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                    activeCategory === cat.category
                      ? "bg-[#00d4ff] text-[#0a0e1a]"
                      : "glass text-muted-foreground hover:text-foreground"
                  )}
                >
                  {cat.category}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          {filteredItems.map((cat, catIdx) =>
            cat.questions
              .filter(
                (q) =>
                  !search ||
                  q.q.toLowerCase().includes(search.toLowerCase()) ||
                  q.a.toLowerCase().includes(search.toLowerCase())
              )
              .map((item, qIdx) => {
                const id = `${catIdx}-${qIdx}`;
                const isOpen = openIndex === id;
                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: qIdx * 0.05 }}
                  >
                    <GlassCard className="overflow-hidden">
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : id)}
                        className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-white/[0.02] transition-colors"
                      >
                        <span className="font-medium text-sm sm:text-base">{item.q}</span>
                        <ChevronDown
                          size={18}
                          className={cn(
                            "text-muted-foreground shrink-0 transition-transform",
                            isOpen && "rotate-180 text-[#00d4ff]"
                          )}
                        />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                              {item.a}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </GlassCard>
                  </motion.div>
                );
              })
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <GlassCard variant="strong" borderGlow className="p-8 sm:p-10 text-center">
            <HelpCircle size={28} className="mx-auto text-[#00d4ff] mb-3" />
            <h2 className="text-2xl font-bold tracking-tight">Still have questions?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Our team is happy to help with anything you need.
            </p>
            <div className="mt-5">
              <CyberButton size="lg" to={ROUTES.contact}>Contact support</CyberButton>
            </div>
          </GlassCard>
        </div>
      </section>
    </div>
  );
}
