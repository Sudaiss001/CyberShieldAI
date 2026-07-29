"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Lock, Eye, EyeOff, ShieldCheck, AlertTriangle, ArrowLeft,
  Fingerprint, Lock as LockIcon, Server, Cpu, Check,
} from "lucide-react";
import { CyberBackground } from "@/components/shared/CyberBackground";
import { Logo } from "@/components/shared/Logo";
import { CyberButton } from "@/components/shared/CyberButton";
import { navigate, goBack } from "@/hooks/use-router";
import { ROUTES } from "@/lib/routes";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth, MOCK_ADMIN_CREDENTIALS } from "@/hooks/use-admin-auth";

export function AdminLoginPage() {
  const { toast } = useToast();
  const { login } = useAdminAuth();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Simulate a brief network call before validating
    setTimeout(() => {
      const success = login(form.email, form.password);
      setLoading(false);

      if (success) {
        toast({
          title: "Admin authenticated",
          description: "Welcome back, Administrator. Redirecting to dashboard...",
        });
        // Small delay so the toast can render before navigation
        setTimeout(() => navigate(ROUTES.adminDashboard), 400);
      } else {
        setError(
          "Invalid administrator credentials. Please verify your email and password, or contact your system administrator."
        );
        toast({
          title: "Authentication failed",
          description: "The credentials you entered do not match an administrator account.",
          variant: "destructive",
        });
      }
    }, 900);
  };

  const fillDemoCredentials = () => {
    setForm({
      email: MOCK_ADMIN_CREDENTIALS.email,
      password: MOCK_ADMIN_CREDENTIALS.password,
      remember: true,
    });
    setError(null);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 relative">
      <CyberBackground variant="all" />

      {/* Left side — admin login form */}
      <div className="flex items-center justify-center p-6 sm:p-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Admin badge + logo */}
          <div className="mb-8 flex items-center justify-between">
            <Logo size="md" />
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
              <ShieldCheck size={11} />
              Admin Console
            </span>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Administrator Sign-In
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Restricted access. Authorized personnel only. All sign-in
              attempts are logged and monitored.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error banner */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                      <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-red-400">
                          Access Denied
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                          {error}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="admin@cyberguardian.ai"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm outline-none focus:border-[#a855f7]/50 focus:bg-[#a855f7]/5 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      toast({
                        title: "Password recovery",
                        description:
                          "Contact your Super Admin to reset your administrator password.",
                      })
                    }
                    className="text-xs text-[#a855f7] hover:underline"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPwd ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm outline-none focus:border-[#a855f7]/50 focus:bg-[#a855f7]/5 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPwd ? "Hide password" : "Show password"}
                  >
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                  className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 accent-[#a855f7]"
                />
                Keep me signed in on this device
              </label>

              {/* Submit */}
              <CyberButton
                type="submit"
                fullWidth
                size="lg"
                disabled={loading}
                icon={!loading && <ShieldCheck size={16} />}
              >
                {loading ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="inline-block w-4 h-4 border-2 border-[#0a0e1a] border-t-transparent rounded-full"
                  />
                ) : (
                  "Authenticate"
                )}
              </CyberButton>

              {/* Demo credentials helper */}
              <div className="pt-3 mt-1 border-t border-white/5">
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[#a855f7]/5 border border-[#a855f7]/15">
                  <Cpu size={13} className="text-[#a855f7] shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-[#a855f7] uppercase tracking-wider">
                      Demo Credentials
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 font-mono break-all">
                      {MOCK_ADMIN_CREDENTIALS.email}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {MOCK_ADMIN_CREDENTIALS.password}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={fillDemoCredentials}
                    className="text-[10px] font-medium text-[#a855f7] hover:underline shrink-0 mt-0.5"
                  >
                    Autofill
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
            <button
              onClick={() => navigate(ROUTES.home)}
              className="hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft size={12} /> Back to site
            </button>
            <span className="flex items-center gap-1.5">
              <LockIcon size={11} className="text-emerald-400" />
              Secured with TLS 1.3
            </span>
          </div>
        </motion.div>
      </div>

      {/* Right side — admin feature panel */}
      <div className="hidden lg:flex items-center justify-center p-10 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative max-w-md"
        >
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[#a855f7]/15 blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-[#ec4899]/15 blur-3xl" />
          </div>

          <div className="space-y-6">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#a855f7] bg-[#a855f7]/10 px-3 py-1 rounded-full border border-[#a855f7]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7] animate-pulse" />
                Cyber Guardian Admin Console
              </span>
              <h2 className="mt-4 text-3xl font-bold leading-tight">
                Command center for your{" "}
                <span className="gradient-text">security platform</span>
              </h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Manage users, monitor scans, configure AI, audit activity, and
                keep the entire Cyber Guardian platform running smoothly — all
                from a single, secure administrative interface.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  icon: Server,
                  label: "Platform-wide control",
                  desc: "12 admin modules covering users, scans, reports, analytics, AI, and settings",
                },
                {
                  icon: Fingerprint,
                  label: "Role-based access",
                  desc: "Super Admin, Admin, Moderator, and User roles with granular permissions",
                },
                {
                  icon: LockIcon,
                  label: "Audit-ready",
                  desc: "Every admin action logged with user, IP, timestamp, and module for compliance",
                },
                {
                  icon: ShieldCheck,
                  label: "Enterprise-grade security",
                  desc: "SOC 2 Type II, 2FA enforcement, session management, and IP whitelisting",
                },
              ].map((feat, i) => (
                <motion.div
                  key={feat.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex gap-3 glass rounded-xl p-3.5"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center shrink-0">
                    <feat.icon size={16} className="text-[#a855f7]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{feat.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{feat.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-2 text-[10px] text-muted-foreground">
              <Check size={11} className="text-emerald-400" />
              <span>SOC 2 Type II Certified</span>
              <span>•</span>
              <Check size={11} className="text-emerald-400" />
              <span>GDPR / CCPA Compliant</span>
              <span>•</span>
              <Check size={11} className="text-emerald-400" />
              <span>ISO 27001</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
