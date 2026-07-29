"use client";

import { Logo } from "@/components/shared/Logo";
import { navigate, hrefFor } from "@/hooks/use-router";
import { ROUTES } from "@/lib/routes";
import { Twitter, Github, Linkedin, Mail } from "lucide-react";

const FOOTER_LINKS = [
  {
    title: "Product",
    links: [
      { label: "Features", path: ROUTES.features },
      { label: "AI Scanner", path: ROUTES.aiScanner },
      { label: "Cyber Academy", path: ROUTES.academy },
      { label: "Pricing", path: ROUTES.features },
      { label: "Get Started", path: ROUTES.register },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", path: ROUTES.about },
      { label: "Contact", path: ROUTES.contact },
      { label: "FAQ", path: ROUTES.faq },
      { label: "Blog", path: ROUTES.about },
      { label: "Careers", path: ROUTES.about },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", path: ROUTES.privacy },
      { label: "Terms of Service", path: ROUTES.terms },
      { label: "Security", path: ROUTES.privacy },
      { label: "Compliance", path: ROUTES.privacy },
    ],
  },
];

export function PublicFooter() {
  return (
    <footer className="relative mt-auto border-t border-white/5 glass-strong">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <Logo size="md" />
            <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
              Your AI Security Analyst for every digital threat. See it. Hear it. Verify it.
            </p>
            <div className="flex gap-2 mt-5">
              {[Twitter, Github, Linkedin, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href={hrefFor(ROUTES.contact)}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(ROUTES.contact);
                  }}
                  className="w-9 h-9 rounded-lg glass flex items-center justify-center text-muted-foreground hover:text-[#00d4ff] hover:border-[#00d4ff]/30 transition-all"
                  aria-label="Social link"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {FOOTER_LINKS.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={hrefFor(link.path)}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(link.path);
                      }}
                      className="text-sm text-muted-foreground hover:text-[#00d4ff] transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © 2026 CyberShield AI. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}
