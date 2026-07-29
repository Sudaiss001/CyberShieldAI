"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Github, Chrome, ShieldCheck } from "lucide-react";
import { CyberButton } from "@/components/shared/CyberButton";
import { navigate } from "@/hooks/use-router";
import { ROUTES } from "@/lib/routes";
import { useToast } from "@/hooks/use-toast";

export function LoginPage() {
  const { toast } = useToast();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", remember: true });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({ title: "Welcome back!", description: "Redirecting to your dashboard..." });
      navigate(ROUTES.dashboard);
    }, 1200);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Social auth */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => navigate(ROUTES.dashboard)}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-medium transition-all"
        >
          <Chrome size={16} className="text-[#00d4ff]" />
          Google
        </button>
        <button
          type="button"
          onClick={() => navigate(ROUTES.dashboard)}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-medium transition-all"
        >
          <Github size={16} />
          GitHub
        </button>
      </div>

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-transparent px-3 text-xs text-muted-foreground uppercase tracking-wider">
            or continue with email
          </span>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-foreground mb-1.5 block">Email</label>
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
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-foreground">Password</label>
          <button
            type="button"
            onClick={() => navigate(ROUTES.forgot)}
            className="text-xs text-[#00d4ff] hover:underline"
          >
            Forgot?
          </button>
        </div>
        <div className="relative">
          <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type={showPwd ? "text" : "password"}
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
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
      </div>

      <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
        <input
          type="checkbox"
          checked={form.remember}
          onChange={(e) => setForm({ ...form, remember: e.target.checked })}
          className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 accent-[#00d4ff]"
        />
        Keep me signed in for 30 days
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
            <ShieldCheck size={16} />
            Sign in securely
          </>
        )}
      </CyberButton>

      <p className="text-center text-xs text-muted-foreground pt-2">
        New to CyberShield AI?{" "}
        <button
          type="button"
          onClick={() => navigate(ROUTES.register)}
          className="text-[#00d4ff] font-medium hover:underline"
        >
          Create an account
        </button>
      </p>
    </form>
  );
}
