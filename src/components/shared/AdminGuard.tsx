"use client";

import { useEffect, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Loader2 } from "lucide-react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { navigate } from "@/hooks/use-router";
import { ROUTES } from "@/lib/routes";

interface AdminGuardProps {
  children: ReactNode;
}

/**
 * Frontend-only route guard for admin pages.
 *
 * If a user navigates to any /admin/* route (other than /admin/login)
 * without an active mock admin session in localStorage, they are
 * redirected to /admin/login.
 *
 * When Laravel RBAC is integrated later, this guard will additionally
 * verify the session token with the backend and check the user's role
 * against the required permission for the route. The component structure
 * stays the same — only the auth check implementation changes.
 */
export function AdminGuard({ children }: AdminGuardProps) {
  const { isAuthenticated, hydrated } = useAdminAuth();

  useEffect(() => {
    // Wait for localStorage hydration before deciding.
    if (!hydrated) return;
    if (!isAuthenticated) {
      navigate(ROUTES.adminLogin);
    }
  }, [isAuthenticated, hydrated]);

  // While hydrating, show a branded loading state (no flash of content).
  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#a855f7] to-[#ec4899] flex items-center justify-center">
              <ShieldCheck size={26} className="text-white" />
            </div>
            <Loader2
              size={16}
              className="absolute -bottom-1 -right-1 text-[#a855f7] animate-spin bg-background rounded-full p-0.5"
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold">Verifying admin session</p>
            <p className="text-xs text-muted-foreground mt-0.5">Please wait...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Not authenticated — render nothing (redirect is in flight).
  if (!isAuthenticated) {
    return null;
  }

  // Authenticated — render the protected admin page.
  return <>{children}</>;
}
