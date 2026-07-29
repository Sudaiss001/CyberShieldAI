"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, Clock, CheckCircle2, PlayCircle, BookOpen, HelpCircle,
  ArrowLeft, ArrowRight, Award, Star, Lock, FileText, Video, X,
  ChevronDown, Trophy, Zap,
} from "lucide-react";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { CyberButton } from "@/components/shared/CyberButton";
import { navigate } from "@/hooks/use-router";
import { ROUTES } from "@/lib/routes";
import { ACADEMY_CATEGORIES, ACADEMY_LESSONS } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const MODULE_TYPE_ICON = {
  video: Video,
  reading: BookOpen,
  quiz: HelpCircle,
} as const;

const QUIZ_QUESTIONS = [
  {
    question: "Which of the following is a classic homoglyph attack on 'amazon.com'?",
    options: ["amaz0n.com (zero)", "arnazon.com (rn)", "amazom.com (typo)", "amazon.co (TLD)"],
    correct: 1,
    explanation: "The 'rn' character sequence visually mimics 'm', making 'arnazon' look like 'amazon' at a glance. This is a classic homoglyph attack.",
  },
  {
    question: "What's the strongest protection against phishing-based credential theft?",
    options: ["Strong passwords", "Email filtering", "FIDO2 hardware keys", "Regular training"],
    correct: 2,
    explanation: "FIDO2 hardware keys cryptographically verify the domain, making phishing impossible — even if a user is tricked into visiting a fake login page.",
  },
  {
    question: "Which SPF/DKIM/DMARC configuration provides the strongest protection?",
    options: ["SPF=softfail, no DKIM", "DMARC p=quarantine", "DMARC p=reject", "DMARC p=none"],
    correct: 2,
    explanation: "DMARC p=reject blocks spoofed emails at the gateway, providing the strongest protection against domain impersonation.",
  },
];

export function LearningModulePage() {
  const { toast } = useToast();
  const category = ACADEMY_CATEGORIES[0]; // Phishing Defense
  const lessons = ACADEMY_LESSONS;
  const [activeLessonIdx, setActiveLessonIdx] = useState(2); // spear phishing in-progress
  const lesson = lessons[activeLessonIdx];
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizComplete, setQuizComplete] = useState(false);

  const currentModule = lesson.modules[activeModuleIdx];
  const ModuleIcon = MODULE_TYPE_ICON[currentModule.type];

  const handleQuizAnswer = (qIdx: number, optIdx: number) => {
    const newAnswers = [...quizAnswers];
    newAnswers[qIdx] = optIdx;
    setQuizAnswers(newAnswers);
    if (qIdx < QUIZ_QUESTIONS.length - 1) {
      setTimeout(() => setActiveModuleIdx((prev) => prev + 1), 500);
    } else {
      setQuizComplete(true);
    }
  };

  const handleNextModule = () => {
    if (activeModuleIdx < lesson.modules.length - 1) {
      setActiveModuleIdx((prev) => prev + 1);
      if (lesson.modules[activeModuleIdx + 1].type === "quiz") {
        setQuizOpen(true);
        setQuizAnswers([]);
        setQuizComplete(false);
      }
    } else {
      toast({
        title: "Lesson complete!",
        description: `You earned ${lesson.points} points.`,
      });
      navigate(ROUTES.academyDashboard);
    }
  };

  const handlePrevModule = () => {
    if (activeModuleIdx > 0) {
      setActiveModuleIdx((prev) => prev - 1);
    }
  };

  const HeroIcon = PlayCircle;
  const accentColor = category.color;

  return (
    <div>
      <DashboardHeader
        title={lesson.title}
        description={lesson.description}
        breadcrumbs={[
          { label: "Cyber Academy", path: ROUTES.academyDashboard },
          { label: category.title },
          { label: lesson.title },
        ]}
        icon={<GraduationCap size={20} style={{ color: accentColor }} />}
        showBack={ROUTES.academyDashboard}
        actions={
          <CyberButton variant="secondary" size="sm" to={ROUTES.academyDashboard} icon={<ArrowLeft size={14} />}>
            Back to academy
          </CyberButton>
        }
      />

      {/* Hero banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-5"
      >
        <GlassCard variant="strong" className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div
              className="absolute inset-0 opacity-20"
              style={{ background: `radial-gradient(circle at 30% 50%, ${accentColor}, transparent 70%)` }}
            />
          </div>
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}30` }}
              >
                <HeroIcon size={36} style={{ color: accentColor }} />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded font-medium uppercase tracking-wider"
                    style={{ background: `${accentColor}15`, color: accentColor }}
                  >
                    {category.title}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-white/5 text-muted-foreground uppercase tracking-wider">
                    {lesson.difficulty}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock size={11} /> {lesson.duration}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Zap size={11} /> {lesson.points} pts
                  </span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight mb-2">{lesson.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{lesson.description}</p>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}99)` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${lesson.progress}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                  <span className="text-xs font-mono font-semibold" style={{ color: accentColor }}>
                    {lesson.progress}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main content area */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6 min-h-[400px]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ModuleIcon size={18} style={{ color: accentColor }} />
                <h3 className="font-semibold">{currentModule.title}</h3>
              </div>
              <span className="text-xs text-muted-foreground">
                Module {activeModuleIdx + 1} of {lesson.modules.length}
              </span>
            </div>

            {/* Content */}
            <div className="mb-6">
              {currentModule.type === "video" && (
                <div className="aspect-video rounded-xl bg-[#0a0e1a] border border-white/10 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 cyber-grid opacity-30" />
                  <motion.div
                    className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#a855f7] flex items-center justify-center cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <PlayCircle size={32} className="text-white" />
                  </motion.div>
                  <p className="absolute bottom-4 left-4 text-xs text-muted-foreground">{currentModule.duration} • HD video</p>
                </div>
              )}

              {currentModule.type === "reading" && (
                <div className="prose prose-invert max-w-none">
                  <h4 className="text-base font-semibold mb-2" style={{ color: accentColor }}>Introduction</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Spear phishing is a targeted variant of phishing where attackers customize their messages for a specific individual or organization. Unlike mass phishing, which casts a wide net, spear phishing involves reconnaissance — attackers research their target on LinkedIn, company websites, and social media to craft highly convincing messages.
                  </p>
                  <h4 className="text-base font-semibold mb-2" style={{ color: accentColor }}>Key characteristics</h4>
                  <ul className="space-y-2 mb-4">
                    {[
                      "Personalized greeting using the target's name and role",
                      "References to real projects, colleagues, or recent company events",
                      "Spoofed sender address that closely mimics a trusted contact",
                      "Urgency cues tailored to the target's responsibilities (e.g., 'per CFO request')",
                      "Requests for sensitive actions: wire transfers, W-2 disclosures, credential entry",
                    ].map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <h4 className="text-base font-semibold mb-2" style={{ color: accentColor }}>Case study: Ubiquiti $46M fraud</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    In 2015, networking firm Ubiquiti lost $46.7 million to a BEC attack where fraudsters impersonated
                    company executives and used lookalike domains to authorize wire transfers to overseas accounts.
                    The attack succeeded because the requests appeared to come from legitimate leadership —
                    a textbook example of spear phishing combined with business email compromise.
                  </p>
                </div>
              )}

              {currentModule.type === "quiz" && (
                <div>
                  {!quizComplete ? (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Answer the questions below to complete this lesson.
                      </p>
                      {QUIZ_QUESTIONS.map((q, qIdx) => (
                        <div key={qIdx} className={cn("transition-opacity", qIdx !== activeModuleIdx - (lesson.modules.length - QUIZ_QUESTIONS.length) && "hidden")}>
                          <p className="font-medium mb-3 text-sm">{qIdx + 1}. {q.question}</p>
                          <div className="space-y-2">
                            {q.options.map((opt, oIdx) => {
                              const isSelected = quizAnswers[qIdx] === oIdx;
                              const isCorrect = q.correct === oIdx;
                              const showResult = quizAnswers[qIdx] !== undefined;
                              return (
                                <button
                                  key={oIdx}
                                  onClick={() => handleQuizAnswer(qIdx, oIdx)}
                                  disabled={showResult}
                                  className={cn(
                                    "w-full text-left p-3 rounded-xl border text-sm transition-all flex items-center gap-2",
                                    showResult && isCorrect && "border-emerald-500/50 bg-emerald-500/10 text-emerald-400",
                                    showResult && isSelected && !isCorrect && "border-red-500/50 bg-red-500/10 text-red-400",
                                    !showResult && "border-white/10 hover:border-white/20 hover:bg-white/5",
                                    !showResult && isSelected && "border-[#00d4ff]/50 bg-[#00d4ff]/10 text-[#00d4ff]"
                                  )}
                                >
                                  <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold shrink-0">
                                    {String.fromCharCode(65 + oIdx)}
                                  </span>
                                  <span className="flex-1">{opt}</span>
                                  {showResult && isCorrect && <CheckCircle2 size={15} />}
                                </button>
                              );
                            })}
                          </div>
                          {quizAnswers[qIdx] !== undefined && (
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-3 p-3 rounded-xl bg-[#00d4ff]/5 border border-[#00d4ff]/20 text-xs text-muted-foreground"
                            >
                              <strong className="text-[#00d4ff]">Explanation: </strong>{q.explanation}
                            </motion.div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8"
                    >
                      <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-[#10b981] flex items-center justify-center mb-4">
                        <Trophy size={40} className="text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-1">Quiz complete!</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        You scored {quizAnswers.filter((a, i) => a === QUIZ_QUESTIONS[i].correct).length}/{QUIZ_QUESTIONS.length}
                      </p>
                      <CyberButton icon={<Award size={15} />} onClick={() => navigate(ROUTES.academyDashboard)}>
                        Claim your certificate
                      </CyberButton>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <CyberButton
                variant="secondary"
                size="sm"
                onClick={handlePrevModule}
                disabled={activeModuleIdx === 0}
                icon={<ArrowLeft size={14} />}
              >
                Previous
              </CyberButton>
              <div className="flex items-center gap-1">
                {lesson.modules.map((_, i) => (
                  <span
                    key={i}
                    className={cn("w-1.5 h-1.5 rounded-full transition-all", i === activeModuleIdx ? "w-4" : "bg-white/10")}
                    style={i === activeModuleIdx ? { background: accentColor } : undefined}
                  />
                ))}
              </div>
              <CyberButton size="sm" onClick={handleNextModule} iconRight={<ArrowRight size={14} />}>
                {activeModuleIdx === lesson.modules.length - 1 ? "Finish" : "Next"}
              </CyberButton>
            </div>
          </GlassCard>
        </div>

        {/* Sidebar — module list */}
        <div className="space-y-4">
          <GlassCard className="p-5">
            <h3 className="font-semibold mb-3">Lesson modules</h3>
            <div className="space-y-1.5">
              {lesson.modules.map((m, i) => {
                const MIcon = MODULE_TYPE_ICON[m.type];
                const isActive = i === activeModuleIdx;
                const isDone = i < activeModuleIdx;
                return (
                  <button
                    key={i}
                    onClick={() => setActiveModuleIdx(i)}
                    className={cn(
                      "w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all",
                      isActive ? "bg-[#00d4ff]/10 border border-[#00d4ff]/30" : "border border-transparent hover:bg-white/5"
                    )}
                  >
                    <div
                      className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-bold",
                        isDone ? "bg-emerald-500/15 text-emerald-400" : isActive ? "bg-[#00d4ff]/20 text-[#00d4ff]" : "bg-white/5 text-muted-foreground"
                      )}
                    >
                      {isDone ? <CheckCircle2 size={13} /> : i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-xs font-medium truncate", isActive && "text-[#00d4ff]")}>{m.title}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MIcon size={9} /> {m.duration}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard variant="strong" className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Award size={18} className="text-[#a855f7]" />
              <h3 className="font-semibold">Certificate preview</h3>
            </div>
            <div
              className="rounded-xl p-4 text-center relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${accentColor}15, ${accentColor}05)`,
                border: `1px solid ${accentColor}30`,
              }}
            >
              <Award size={28} className="mx-auto mb-2" style={{ color: accentColor }} />
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Certificate of Completion</p>
              <p className="text-sm font-bold mt-1">{category.title}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Alex Morgan • 2026</p>
              <div className="mt-2 flex items-center justify-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={9} className={s <= 4 ? "text-amber-400 fill-amber-400" : "text-white/10"} />
                ))}
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 text-center">
              Complete this lesson to unlock certificate
            </p>
          </GlassCard>

          <GlassCard className="p-5">
            <h3 className="font-semibold mb-3">More in this track</h3>
            <div className="space-y-1.5">
              {lessons.filter((l) => l.id !== lesson.id).slice(0, 3).map((l, i) => (
                <button
                  key={l.id}
                  onClick={() => {
                    setActiveLessonIdx(lessons.findIndex((x) => x.id === l.id));
                    setActiveModuleIdx(0);
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors text-left"
                >
                  <div className={cn(
                    "w-6 h-6 rounded-md flex items-center justify-center shrink-0",
                    l.completed ? "bg-emerald-500/15 text-emerald-400" : l.progress > 0 ? "bg-[#00d4ff]/15 text-[#00d4ff]" : "bg-white/5 text-muted-foreground"
                  )}>
                    {l.completed ? <CheckCircle2 size={12} /> : l.progress > 0 ? <PlayCircle size={12} /> : <Lock size={11} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{l.title}</p>
                    <p className="text-[10px] text-muted-foreground">{l.duration}</p>
                  </div>
                </button>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
