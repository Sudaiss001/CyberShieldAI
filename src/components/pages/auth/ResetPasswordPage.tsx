"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Check, ShieldCheck } from "lucide-react";
import { CyberButton } from "@/components/shared/CyberButton";
import { navigate } from "@/hooks/use-router";
import { ROUTES } from "@/lib/routes";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const RULES = [
  { label: "At least 12 characters", test: (p: string) => p.length >= 12 },
  { label: "Upper & lowercase letters", test: (p: string) => /[A-Z]/.test(p) && /[a-z]/.test(p) },
  { label: "At least one number", test: (p: string) => /[0-9]/.test(p) },
  { label: "At least one symbol", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export function ResetPasswordPage() {
  const { toast } = useToast();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  const allRulesMet = RULES.every((r) => r.test(pwd));
  const matches = pwd === confirmPwd && pwd.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allRulesMet) {
      toast({ title: "Password doesn't meet requirements", variant: "destructive" });
      return;
    }
    if (!matches) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({ title: "Password reset!", description: "You can now sign in with your new password." });
      navigate(ROUTES.login);
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs font-medium text-foreground mb-1.5 block">New password</label>
        <div className="relative">
          <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type={showPwd ? "text" : "password"}
            required
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
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
      </div>

      <div>
        <label className="text-xs font-medium text-foreground mb-1.5 block">Confirm new password</label>
        <div className="relative">
          <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type={showPwd ? "text" : "password"}
            required
            value={confirmPwd}
            onChange={(e) => setConfirmPwd(e.target.value)}
            placeholder="Re-enter new password"
            className={cn(
              "w-full pl-9 pr-10 py-2.5 rounded-xl bg-white/[0.03] border text-sm outline-none transition-all",
              confirmPwd && !matches
                ? "border-red-500/50 focus:bg-red-500/5"
                : "border-white/10 focus:border-[#00d4ff]/50 focus:bg-[#00d4ff]/5"
            )}
          />
          {confirmPwd && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              {matches ? <Check size={15} className="text-emerald-400" /> : null}
            </span>
          )}
        </div>
      </div>

      <div className="glass rounded-xl p-3 space-y-1.5">
        <p className="text-xs font-medium mb-1">Password requirements:</p>
        {RULES.map((r) => {
          const met = r.test(pwd);
          return (
            <div key={r.label} className="flex items-center gap-2 text-xs">
              <span
                className={cn(
                  "w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 transition-colors",
                  met ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-muted-foreground"
                )}
              >
                <Check size={9} strokeWidth={3} />
              </span>
              <span className={cn(met ? "text-emerald-400" : "text-muted-foreground")}>{r.label}</span>
            </div>
          );
        })}
      </div>

      <CyberButton type="submit" fullWidth size="lg" disabled={loading} icon={<ShieldCheck size={16} />}>
        {loading ? (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block w-4 h-4 border-2 border-[#0a0e1a] border-t-transparent rounded-full"
          />
        ) : (
          "Reset password"
        )}
      </CyberButton>
    </form>
  );
}
