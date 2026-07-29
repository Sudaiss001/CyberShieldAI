"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { MailCheck, RefreshCw } from "lucide-react";
import { CyberButton } from "@/components/shared/CyberButton";
import { navigate } from "@/hooks/use-router";
import { ROUTES } from "@/lib/routes";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function VerifyEmailPage() {
  const { toast } = useToast();
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (idx: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newCode = [...code];
    newCode[idx] = value;
    setCode(newCode);
    if (value && idx < 5) inputsRef.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length > 0) {
      const newCode = pasted.split("").concat(Array(6 - pasted.length).fill(""));
      setCode(newCode);
      inputsRef.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.join("").length !== 6) {
      toast({ title: "Enter the full 6-digit code", variant: "destructive" });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({ title: "Email verified!", description: "Welcome to CyberShield AI." });
      navigate(ROUTES.dashboard);
    }, 1200);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="mx-auto w-16 h-16 rounded-2xl bg-[#00d4ff]/15 border border-[#00d4ff]/30 flex items-center justify-center mb-4"
        >
          <MailCheck size={28} className="text-[#00d4ff]" />
        </motion.div>
        <p className="text-sm text-muted-foreground">
          We sent a 6-digit code to your inbox. Enter it below.
        </p>
      </div>

      <div className="flex gap-2 justify-center" onPaste={handlePaste}>
        {code.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => { inputsRef.current[idx] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            className={cn(
              "w-11 h-14 sm:w-12 sm:h-14 rounded-xl bg-white/[0.03] border text-center text-xl font-bold outline-none transition-all",
              digit
                ? "border-[#00d4ff]/60 bg-[#00d4ff]/10 text-[#00d4ff]"
                : "border-white/10 focus:border-[#00d4ff]/50 focus:bg-[#00d4ff]/5"
            )}
          />
        ))}
      </div>

      <CyberButton type="submit" fullWidth size="lg" disabled={loading}>
        {loading ? (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block w-4 h-4 border-2 border-[#0a0e1a] border-t-transparent rounded-full"
          />
        ) : (
          "Verify email"
        )}
      </CyberButton>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <button
          type="button"
          onClick={() => toast({ title: "Code resent!", description: "Check your inbox." })}
          className="flex items-center gap-1 hover:text-[#00d4ff] transition-colors"
        >
          <RefreshCw size={12} /> Resend code
        </button>
        <button
          type="button"
          onClick={() => navigate(ROUTES.login)}
          className="hover:text-foreground transition-colors"
        >
          Skip for now →
        </button>
      </div>
    </form>
  );
}
