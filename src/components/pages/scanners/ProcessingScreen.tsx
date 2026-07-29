"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { DynamicIcon } from "@/components/shared/DynamicIcon";
import { navigate, goBack } from "@/hooks/use-router";
import { ROUTES } from "@/lib/routes";
import { PROCESSING_STEPS } from "@/lib/mock-data";

export function ProcessingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepDuration = 900;
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= PROCESSING_STEPS.length - 1) {
          clearInterval(interval);
          // Navigate to report after a brief pause
          setTimeout(() => navigate(`${ROUTES.reportDetails}scan_001`), 800);
          return prev;
        }
        return prev + 1;
      });
    }, stepDuration);

    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(100, p + Math.random() * 4));
    }, 80);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, []);

  const isComplete = currentStep >= PROCESSING_STEPS.length - 1;

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <GlassCard variant="strong" className="p-8 sm:p-10 relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 -z-10 opacity-30">
            <motion.div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[#00d4ff] blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>

          {/* Center animation */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative inline-flex mb-5"
            >
              {/* Outer rings */}
              <motion.div
                className="absolute inset-0 -m-4 rounded-full border-2 border-[#00d4ff]/30"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-0 -m-8 rounded-full border-2 border-dashed border-[#a855f7]/30"
                animate={{ rotate: -360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              />

              {/* Center icon */}
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#00d4ff] to-[#a855f7] flex items-center justify-center relative">
                {isComplete ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <Icons.CheckCircle2 size={48} className="text-white" strokeWidth={2.5} />
                  </motion.div>
                ) : (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Icons.Loader size={40} className="text-white" strokeWidth={2.5} />
                  </motion.div>
                )}
              </div>

              {/* Scan line */}
              {!isComplete && (
                <motion.div
                  className="absolute inset-x-0 -m-12 h-0.5 bg-gradient-to-r from-transparent via-[#00d4ff] to-transparent"
                  animate={{ top: ["-50%", "150%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              )}
            </motion.div>

            <motion.h2
              key={currentStep}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold tracking-tight"
            >
              {isComplete ? "Analysis Complete!" : "Analyzing your input..."}
            </motion.h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {isComplete
                ? "Generating your detailed threat report."
                : "Our AI is cross-referencing threat intelligence and multimodal signals."}
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-mono font-semibold text-[#00d4ff]">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden relative">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#00d4ff] to-[#a855f7] relative"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute inset-0 animate-shimmer" />
              </motion.div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-2">
            {PROCESSING_STEPS.map((step, i) => {
              const isDone = i < currentStep;
              const isActive = i === currentStep;
              const isPending = i > currentStep;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{
                    opacity: isPending ? 0.4 : 1,
                    x: 0,
                  }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                    isActive ? "bg-[#00d4ff]/10 border border-[#00d4ff]/20" : "bg-white/[0.02] border border-transparent"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isDone
                        ? "bg-emerald-500/15 border border-emerald-500/30"
                        : isActive
                        ? "bg-[#00d4ff]/20 border border-[#00d4ff]/40"
                        : "bg-white/5 border border-white/10"
                    }`}
                  >
                    {isDone ? (
                      <Icons.Check size={15} className="text-emerald-400" strokeWidth={3} />
                    ) : isActive ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Icons.Loader2 size={15} className="text-[#00d4ff]" />
                      </motion.div>
                    ) : (
                      <DynamicIcon name={step.icon} size={15} className="text-muted-foreground" />
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      isDone ? "text-emerald-400" : isActive ? "text-[#00d4ff]" : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                  {isActive && (
                    <motion.div
                      className="ml-auto flex gap-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {[0, 1, 2].map((dot) => (
                        <span
                          key={dot}
                          className="w-1 h-1 rounded-full bg-[#00d4ff] typing-dot"
                          style={{ animationDelay: `${dot * 0.2}s` }}
                        />
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Cancel button */}
          {!isComplete && (
            <div className="mt-6 text-center">
              <button
                onClick={() => goBack(ROUTES.aiScanner)}
                className="text-xs text-muted-foreground hover:text-red-400 transition-colors"
              >
                Cancel scan
              </button>
            </div>
          )}

          {isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-center"
            >
              <button
                onClick={() => navigate(`${ROUTES.reportDetails}scan_001`)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#00d4ff] to-[#0099cc] text-[#0a0e1a] hover:shadow-[0_4px_20px_rgba(0,212,255,0.4)] transition-all"
              >
                <Icons.FileText size={16} />
                View Full Report
              </button>
            </motion.div>
          )}
        </GlassCard>

        {/* Stats below */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 grid grid-cols-3 gap-3"
        >
          {[
            { label: "Threat IOCs checked", value: "5.2M", icon: Icons.Database },
            { label: "AI model runs", value: "12", icon: Icons.Cpu },
            { label: "Time elapsed", value: `${(currentStep + 1) * 0.9}s`, icon: Icons.Clock },
          ].map((stat) => (
            <GlassCard key={stat.label} className="p-3 text-center">
              <stat.icon size={14} className="mx-auto text-[#00d4ff] mb-1" />
              <p className="text-sm font-bold">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </GlassCard>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
