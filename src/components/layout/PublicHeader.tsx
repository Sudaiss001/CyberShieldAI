"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, Bell } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { CyberButton } from "@/components/shared/CyberButton";
import { PUBLIC_NAV, ROUTES } from "@/lib/routes";
import { navigate, hrefFor, useHashRoute } from "@/hooks/use-router";
import { cn } from "@/lib/utils";

export function PublicHeader() {
  const [path] = useHashRoute();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (itemPath: string) => {
    if (itemPath === "/") return path === "/" || path === "";
    return path.startsWith(itemPath);
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="glass-strong border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo href={hrefFor("/")} size="md" />

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {PUBLIC_NAV.map((item) => (
                <a
                  key={item.label}
                  href={hrefFor(item.path)}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(item.path);
                  }}
                  className={cn(
                    "px-3.5 py-2 text-sm font-medium rounded-lg transition-all",
                    isActive(item.path)
                      ? "text-[#00d4ff] bg-[#00d4ff]/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <a
                href={hrefFor(ROUTES.login)}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(ROUTES.login);
                }}
                className="hidden sm:inline-flex px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Login
              </a>
              <CyberButton
                size="sm"
                to={ROUTES.register}
                className="hidden sm:inline-flex"
              >
                Get Started
              </CyberButton>

              <button
                className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden glass-strong border-b border-white/5 overflow-hidden"
          >
            <nav className="px-4 py-4 space-y-1">
              {PUBLIC_NAV.map((item) => (
                <a
                  key={item.label}
                  href={hrefFor(item.path)}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(item.path);
                    setMobileOpen(false);
                  }}
                  className={cn(
                    "block px-4 py-2.5 text-sm font-medium rounded-lg transition-colors",
                    isActive(item.path)
                      ? "text-[#00d4ff] bg-[#00d4ff]/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-2 flex gap-2">
                <CyberButton
                  variant="secondary"
                  size="sm"
                  to={ROUTES.login}
                  fullWidth
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </CyberButton>
                <CyberButton
                  size="sm"
                  to={ROUTES.register}
                  fullWidth
                  onClick={() => setMobileOpen(false)}
                >
                  Get Started
                </CyberButton>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
