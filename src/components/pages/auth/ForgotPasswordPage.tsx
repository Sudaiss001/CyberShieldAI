"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { CyberButton } from "@/components/shared/CyberButton";
import { navigate, goBack } from "@/hooks/use-router";
import { ROUTES } from "@/lib/routes";
import { useToast } from "@/hooks/use-toast";

export function ForgotPasswordPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      toast({ title: "Reset link sent", description: `Check ${email} for instructions.` });
    }, 1200);
  };

  if (sent) {
    return (
      <div className="text-center space-y-5">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center"
        >
          <Mail size={28} className="text-emerald-400" />
        </motion.div>
        <div>
          <h2 className="text-xl font-semibold">Check your email</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            We've sent a password reset link to{" "}
            <span className="text-foreground font-medium">{email}</span>.
            The link expires in 1 hour.
          </p>
        </div>
        <CyberButton variant="outline" fullWidth onClick={() => setSent(false)} icon={<ArrowLeft size={15} />}>
          Use a different email
        </CyberButton>
        <p className="text-xs text-muted-foreground">
          Didn't get the email?{" "}
          <button onClick={() => navigate(ROUTES.reset)} className="text-[#00d4ff] hover:underline">
            Enter code manually
          </button>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs font-medium text-foreground mb-1.5 block">Email address</label>
        <div className="relative">
          <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm outline-none focus:border-[#00d4ff]/50 focus:bg-[#00d4ff]/5 transition-all"
          />
        </div>
      </div>

      <CyberButton type="submit" fullWidth size="lg" disabled={loading} icon={!loading && <Send size={16} />}>
        {loading ? (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block w-4 h-4 border-2 border-[#0a0e1a] border-t-transparent rounded-full"
          />
        ) : (
          "Send reset link"
        )}
      </CyberButton>

      <button
        type="button"
        onClick={() => goBack(ROUTES.login)}
        className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={13} /> Back to sign in
      </button>
    </form>
  );
}
