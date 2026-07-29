"use client";

import { motion } from "framer-motion";
import {
  GraduationCap, Clock, Award, TrendingUp, BookOpen, CheckCircle2,
  PlayCircle, Lock, ChevronRight, Flame, Star, Trophy,
} from "lucide-react";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { CyberButton } from "@/components/shared/CyberButton";
import { DynamicIcon } from "@/components/shared/DynamicIcon";
import { navigate } from "@/hooks/use-router";
import { ROUTES } from "@/lib/routes";
import { ACADEMY_CATEGORIES, ACADEMY_LESSONS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const STATS = [
  { label: "Lessons Completed", value: "32", icon: CheckCircle2, color: "#10b981" },
  { label: "Hours Learned", value: "8.5", icon: Clock, color: "#00d4ff" },
  { label: "Certificates", value: "2", icon: Award, color: "#a855f7" },
  { label: "Day Streak", value: "14", icon: Flame, color: "#f59e0b" },
];

export function AcademyDashboardPage() {
  const totalLessons = ACADEMY_CATEGORIES.reduce((sum, c) => sum + c.lessonsCount, 0);
  const completedLessons = ACADEMY_CATEGORIES.reduce((sum, c) => sum + c.completedLessons, 0);
  const overallProgress = Math.round((completedLessons / totalLessons) * 100);

  return (
    <div>
      <DashboardHeader
        title="Cyber Academy"
        description="Learn to spot threats before they spot you. 80+ lessons across 8 tracks."
        breadcrumbs={[{ label: "Cyber Academy" }]}
        icon={<GraduationCap size={20} className="text-[#a855f7]" />}
        showBack
      />

      {/* Hero progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <GlassCard variant="strong" className="p-6 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-1/4 w-64 h-64 rounded-full bg-[#a855f7]/15 blur-3xl" />
            <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full bg-[#00d4ff]/15 blur-3xl" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#a855f7] bg-[#a855f7]/10 px-2.5 py-1 rounded-full border border-[#a855f7]/20 mb-3">
                <Trophy size={12} /> Your learning journey
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                You've completed{" "}
                <span className="gradient-text">{completedLessons} of {totalLessons}</span>{" "}
                lessons
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Keep your streak alive — 2 more lessons to reach the next certificate!
              </p>
              <div className="mt-4 flex items-center gap-3">
                <CyberButton to={ROUTES.learningModule} icon={<BookOpen size={15} />}>
                  Continue learning
                </CyberButton>
                <CyberButton variant="outline" to={ROUTES.faq}>Browse FAQ</CyberButton>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative w-28 h-28 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
                  <motion.circle
                    cx="50" cy="50" r="42"
                    stroke="url(#acadGrad)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 42}
                    initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - overallProgress / 100) }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="acadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#00d4ff" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold gradient-text">{overallProgress}%</span>
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Complete</span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard variant="hover" className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}30` }}
                >
                  <stat.icon size={16} style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Categories */}
      <h2 className="text-lg font-semibold mb-3">Learning Tracks</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {ACADEMY_CATEGORIES.map((cat, i) => {
          const progress = Math.round((cat.completedLessons / cat.lessonsCount) * 100);
          const isComplete = progress === 100;
          return (
            <motion.button
              key={cat.id}
              onClick={() => navigate(ROUTES.learningModule)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4 }}
              className="text-left"
            >
              <GlassCard variant="hover" className="p-5 h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: `${cat.color}15`, border: `1px solid ${cat.color}30` }}
                  >
                    <DynamicIcon name={cat.icon} fallback="GraduationCap" size={20} style={{ color: cat.color }} strokeWidth={2.2} />
                  </div>
                  {isComplete && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      ✓ DONE
                    </span>
                  )}
                </div>
                <h3 className="font-semibold mb-1">{cat.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">{cat.description}</p>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">{cat.completedLessons}/{cat.lessonsCount} lessons</span>
                    <span className="font-semibold" style={{ color: cat.color }}>{progress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: cat.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, delay: 0.3 + i * 0.05 }}
                    />
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                    style={{ background: `${cat.color}10`, color: cat.color }}
                  >
                    {cat.difficulty}
                  </span>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </div>
              </GlassCard>
            </motion.button>
          );
        })}
      </div>

      {/* Continue learning */}
      <h2 className="text-lg font-semibold mb-3">Continue Learning</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {ACADEMY_LESSONS.slice(0, 4).map((lesson, i) => {
          const category = ACADEMY_CATEGORIES.find((c) => c.id === lesson.categoryId);
          if (!category) return null;
          return (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <GlassCard variant="hover" className="p-5 cursor-pointer" onClick={() => navigate(ROUTES.learningModule)}>
                <div className="flex gap-4">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0 relative"
                    style={{ background: `${category.color}15`, border: `1px solid ${category.color}30` }}
                  >
                    <DynamicIcon name={category.icon} fallback="GraduationCap" size={26} style={{ color: category.color }} />
                    {lesson.progress > 0 && lesson.progress < 100 && (
                      <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-black/40">
                        <PlayCircle size={24} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                        style={{ background: `${category.color}10`, color: category.color }}
                      >
                        {category.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Clock size={9} /> {lesson.duration}
                      </span>
                    </div>
                    <h4 className="font-semibold text-sm mb-1 truncate">{lesson.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{lesson.description}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${lesson.progress}%`, background: category.color }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">{lesson.progress}%</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Certificate preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6"
      >
        <GlassCard variant="strong" borderGlow className="p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#a855f7]/15 blur-3xl" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#a855f7] to-[#8b5cf6] flex items-center justify-center shrink-0">
              <Award size={32} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold">Earn your CyberShield Certificate</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Complete any track to earn a verifiable certificate. Share it on LinkedIn or add it to your portfolio.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} className="fill-amber-400" />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">Recognized by 12,000+ organizations</span>
              </div>
            </div>
            <CyberButton to={ROUTES.learningModule} icon={<TrendingUp size={15} />}>
              Start track
            </CyberButton>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
