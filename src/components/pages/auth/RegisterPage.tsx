"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, Check, ShieldCheck, Zap } from "lucide-react";
import { CyberButton } from "@/components/shared/CyberButton";
import { navigate } from "@/hooks/use-router";
import { ROUTES } from "@/lib/routes";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const STRENGTH = [
  { label: "Weak", color: "#ef4444", width: "25%" },
  { label: "Fair", color: "#f59e0b", width: "50%" },
  { label: "Good", color: "#06b6d4", width: "75%" },
  { label: "Strong", color: "#10b981", width: "100%" },
];

function getStrength(pwd: string) {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return Math.min(3, score);
}

import { useAuth } from "@/hooks/use-auth";

export function RegisterPage() {
  const { toast } = useToast();
  const { register } = useAuth();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    agree: false,
  });

  const strength = getStrength(form.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.agree) {
      toast({ title: "Please accept the terms", variant: "destructive" });
      return;
    }
    setLoading(true);
    const success = await register(form.name, form.email, form.password, form.password);
    setLoading(false);

    if (success) {
      toast({ title: "Account created!", description: "Account created and logged in. Redirecting..." });
      navigate(ROUTES.dashboard);
    } else {
      toast({ title: "Registration failed", description: "Please check your details and try again.", variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs font-medium text-foreground mb-1.5 block">Full name</label>
        <div className="relative">
          <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Jane Doe"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm outline-none focus:border-[#00d4ff]/50 focus:bg-[#00d4ff]/5 transition-all"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-foreground mb-1.5 block">Work email</label>
        <div className="relative">
          <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@company.com"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm outline-none focus:border-[#00d4ff]/50 focus:bg-[#00d4ff]/5 transition-all"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-foreground mb-1.5 block">Password</label>
        <div className="relative">
          <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type={showPwd ? "text" : "password"}
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Create a strong password"
            className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm outline-none focus:border-[#00d4ff]/50 focus:bg-[#00d4ff]/5 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {form.password && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-2"
          >
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: STRENGTH[strength].color }}
                  initial={{ width: 0 }}
                  animate={{ width: STRENGTH[strength].width }}
                />
              </div>
              <span className="text-[10px] font-medium" style={{ color: STRENGTH[strength].color }}>
                {STRENGTH[strength].label}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1 text-[10px]">
              {["8+ characters", "Upper & lowercase", "Number", "Symbol"].map((req, i) => {
                const met = [
                  form.password.length >= 8,
                  /[A-Z]/.test(form.password) && /[a-z]/.test(form.password),
                  /[0-9]/.test(form.password),
                  /[^A-Za-z0-9]/.test(form.password),
                ][i];
                return (
                  <span key={req} className={cn("flex items-center gap-1", met ? "text-emerald-400" : "text-muted-foreground")}>
                    <Check size={10} /> {req}
                  </span>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
        <input
          type="checkbox"
          checked={form.agree}
          onChange={(e) => setForm({ ...form, agree: e.target.checked })}
          className="w-3.5 h-3.5 mt-0.5 rounded border-white/20 bg-white/5 accent-[#00d4ff]"
        />
        <span>
          I agree to the{" "}
          <a href={`#${ROUTES.terms}`} className="text-[#00d4ff] hover:underline">Terms of Service</a>{" "}
          and{" "}
          <a href={`#${ROUTES.privacy}`} className="text-[#00d4ff] hover:underline">Privacy Policy</a>
        </span>
      </label>

      <CyberButton type="submit" fullWidth size="lg" disabled={loading}>
        {loading ? (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block w-4 h-4 border-2 border-[#0a0e1a] border-t-transparent rounded-full"
          />
        ) : (
          <>
            <Zap size={16} />
            Create my account
          </>
        )}
      </CyberButton>

      <div className="flex items-center justify-center gap-4 pt-2 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <ShieldCheck size={11} className="text-emerald-400" /> SOC 2 Type II
        </span>
        <span className="flex items-center gap-1">
          <ShieldCheck size={11} className="text-emerald-400" /> GDPR Compliant
        </span>
        <span className="flex items-center gap-1">
          <ShieldCheck size={11} className="text-emerald-400" /> 14-day refund
        </span>
      </div>

      <p className="text-center text-xs text-muted-foreground pt-2">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => navigate(ROUTES.login)}
          className="text-[#00d4ff] font-medium hover:underline"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}
