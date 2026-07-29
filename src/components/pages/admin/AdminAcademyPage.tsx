"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, Plus, Search, MoreHorizontal, Pencil, Trash2,
  Send, Eye, EyeOff, X, BookOpen, Users, Star, Clock, Layers,
} from "lucide-react";
import { AdminHeader } from "@/components/shared/AdminHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { CyberButton } from "@/components/shared/CyberButton";
import { useToast } from "@/hooks/use-toast";
import { ADMIN_LESSONS, ADMIN_CATEGORIES, type AdminLesson } from "@/lib/mock-data/admin";
import { cn } from "@/lib/utils";

type Action = "edit" | "delete" | "publish" | "unpublish" | "view";

const ACTIONS: { id: Action; label: string; icon: any; color: string; danger?: boolean }[] = [
  { id: "view", label: "Preview", icon: Eye, color: "#00d4ff" },
  { id: "edit", label: "Edit", icon: Pencil, color: "#a855f7" },
  { id: "publish", label: "Publish", icon: Send, color: "#10b981" },
  { id: "unpublish", label: "Unpublish", icon: EyeOff, color: "#f59e0b" },
  { id: "delete", label: "Delete", icon: Trash2, color: "#ef4444", danger: true },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "#10b981",
  intermediate: "#f59e0b",
  advanced: "#ef4444",
};

export function AdminAcademyPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<"lessons" | "categories" | "quizzes">("lessons");
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [lessons, setLessons] = useState<AdminLesson[]>(ADMIN_LESSONS);
  const [confirmDelete, setConfirmDelete] = useState<AdminLesson | null>(null);
  const [editLesson, setEditLesson] = useState<AdminLesson | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const filteredLessons = lessons.filter(
    (l) =>
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleAction = (lesson: AdminLesson, action: Action) => {
    setOpenMenu(null);
    if (action === "edit") {
      setEditLesson(lesson);
      return;
    }
    if (action === "delete") {
      setConfirmDelete(lesson);
      return;
    }
    if (action === "publish" || action === "unpublish") {
      setLessons((prev) => prev.map((l) => (l.id === lesson.id ? { ...l, published: action === "publish" } : l)));
      toast({ title: `Lesson ${action === "publish" ? "published" : "unpublished"}`, description: lesson.title });
      return;
    }
    if (action === "view") {
      toast({ title: "Preview mode", description: `Opening preview for: ${lesson.title}` });
    }
  };

  const deleteLesson = () => {
    if (!confirmDelete) return;
    setLessons((prev) => prev.filter((l) => l.id !== confirmDelete.id));
    toast({ title: "Lesson deleted", description: confirmDelete.title, variant: "destructive" });
    setConfirmDelete(null);
  };

  return (
    <div>
      <AdminHeader
        title="Cyber Academy Management"
        description={`${lessons.length} lessons across ${ADMIN_CATEGORIES.length} categories.`}
        breadcrumbs={[{ label: "Cyber Academy" }]}
        icon={<GraduationCap size={20} className="text-[#a855f7]" />}
        showBack
        actions={
          <CyberButton size="sm" icon={<Plus size={14} />} onClick={() => setCreateOpen(true)}>
            Add Lesson
          </CyberButton>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-1.5 mb-5 overflow-x-auto no-scrollbar">
        {[
          { id: "lessons" as const, label: "Lessons", icon: BookOpen },
          { id: "categories" as const, label: "Categories", icon: Layers },
          { id: "quizzes" as const, label: "Quizzes", icon: GraduationCap },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
              tab === t.id ? "bg-[#a855f7]/10 text-[#a855f7] border border-[#a855f7]/30" : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
            )}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* Lessons tab */}
      {tab === "lessons" && (
        <>
          <GlassCard className="p-4 mb-5">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search lessons..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-sm outline-none focus:border-[#a855f7]/50 transition-all"
              />
            </div>
          </GlassCard>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredLessons.map((lesson, i) => (
                <motion.div
                  key={lesson.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <GlassCard variant="hover" className="p-5 h-full flex flex-col relative">
                    <div className="flex items-start justify-between mb-3">
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md"
                        style={{
                          color: DIFFICULTY_COLORS[lesson.difficulty],
                          background: `${DIFFICULTY_COLORS[lesson.difficulty]}15`,
                          border: `1px solid ${DIFFICULTY_COLORS[lesson.difficulty]}30`,
                        }}
                      >
                        {lesson.difficulty}
                      </span>
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === lesson.id ? null : lesson.id)}
                          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <MoreHorizontal size={15} />
                        </button>
                        <AnimatePresence>
                          {openMenu === lesson.id && (
                            <>
                              <div className="fixed inset-0 z-30" onClick={() => setOpenMenu(null)} />
                              <motion.div
                                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 top-9 z-40 w-44 glass-strong rounded-xl border border-white/10 shadow-2xl overflow-hidden p-1.5"
                              >
                                {ACTIONS.filter((a) => {
                                  if (a.id === "publish" && lesson.published) return false;
                                  if (a.id === "unpublish" && !lesson.published) return false;
                                  return true;
                                }).map((action) => (
                                  <button
                                    key={action.id}
                                    onClick={() => handleAction(lesson, action.id)}
                                    className={cn(
                                      "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors",
                                      action.danger ? "text-red-400 hover:bg-red-500/10" : "hover:bg-white/5"
                                    )}
                                    style={!action.danger ? { color: action.color } : undefined}
                                  >
                                    <action.icon size={13} />
                                    {action.label}
                                  </button>
                                ))}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{lesson.category}</p>
                    <h3 className="text-sm font-semibold mb-2 line-clamp-2">{lesson.title}</h3>

                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-3">
                      <span className="flex items-center gap-1"><Clock size={11} /> {lesson.duration}</span>
                      <span className="flex items-center gap-1"><Users size={11} /> {lesson.enrolled.toLocaleString()}</span>
                      {lesson.rating > 0 && (
                        <span className="flex items-center gap-1"><Star size={11} className="text-amber-400 fill-amber-400" /> {lesson.rating}</span>
                      )}
                    </div>

                    <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md",
                        lesson.published ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"
                      )}>
                        {lesson.published ? "Published" : "Draft"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {lesson.completed.toLocaleString()} completed
                      </span>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredLessons.length === 0 && (
            <GlassCard className="p-12 text-center">
              <BookOpen size={40} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium">No lessons found</p>
              <p className="text-xs text-muted-foreground mt-1">Try adjusting your search.</p>
            </GlassCard>
          )}
        </>
      )}

      {/* Categories tab */}
      {tab === "categories" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ADMIN_CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard variant="hover" className="p-5 h-full">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${cat.color}15`, border: `1px solid ${cat.color}30` }}
                >
                  <Layers size={20} style={{ color: cat.color }} strokeWidth={2.2} />
                </div>
                <h3 className="font-semibold text-sm mb-1">{cat.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{cat.lessons} lessons</p>
                <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                  <button
                    onClick={() => toast({ title: "Edit category", description: cat.name })}
                    className="flex-1 text-xs py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toast({ title: "Delete category?", description: "This will move lessons to Uncategorized.", variant: "destructive" })}
                    className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ADMIN_CATEGORIES.length * 0.05 }}
            onClick={() => toast({ title: "Add category", description: "Opening new category form" })}
            className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-white/10 hover:border-[#a855f7]/50 hover:bg-[#a855f7]/5 transition-all min-h-[180px]"
          >
            <Plus size={24} className="text-muted-foreground mb-2" />
            <span className="text-xs font-medium text-muted-foreground">Add Category</span>
          </motion.button>
        </div>
      )}

      {/* Quizzes tab */}
      {tab === "quizzes" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { id: "q1", title: "Phishing Recognition Quiz", category: "Phishing Defense", questions: 10, attempts: 3420, avgScore: 78 },
            { id: "q2", title: "Homoglyph Hunting", category: "Phishing Defense", questions: 8, attempts: 2680, avgScore: 65 },
            { id: "q3", title: "Deepfake Spotting", category: "Deepfake Detection", questions: 12, attempts: 1240, avgScore: 52 },
            { id: "q4", title: "Password Strength", category: "Password Security", questions: 6, attempts: 4680, avgScore: 88 },
            { id: "q5", title: "Ransomware Recovery", category: "Ransomware Resilience", questions: 15, attempts: 680, avgScore: 71 },
            { id: "q6", title: "BEC Pattern Recognition", category: "Phishing Defense", questions: 10, attempts: 1820, avgScore: 60 },
          ].map((quiz, i) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard variant="hover" className="p-5 h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#a855f7]/15 border border-[#a855f7]/30 flex items-center justify-center">
                    <GraduationCap size={18} className="text-[#a855f7]" />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">{quiz.questions} Q</span>
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{quiz.category}</p>
                <h3 className="text-sm font-semibold mb-3">{quiz.title}</h3>
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5 text-[10px]">
                  <div>
                    <p className="text-muted-foreground">Attempts</p>
                    <p className="font-semibold mt-0.5">{quiz.attempts.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avg Score</p>
                    <p className="font-semibold mt-0.5" style={{ color: quiz.avgScore >= 75 ? "#10b981" : quiz.avgScore >= 60 ? "#f59e0b" : "#ef4444" }}>{quiz.avgScore}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => toast({ title: "Edit quiz", description: quiz.title })}
                    className="flex-1 text-xs py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-1"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  <button
                    onClick={() => toast({ title: "Delete quiz?", description: quiz.title, variant: "destructive" })}
                    className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => toast({ title: "Create quiz", description: "Opening quiz builder" })}
            className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-white/10 hover:border-[#a855f7]/50 hover:bg-[#a855f7]/5 transition-all min-h-[180px]"
          >
            <Plus size={24} className="text-muted-foreground mb-2" />
            <span className="text-xs font-medium text-muted-foreground">Create Quiz</span>
          </motion.button>
        </div>
      )}

      {/* Delete confirmation */}
      <AnimatePresence>
        {confirmDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              onClick={() => setConfirmDelete(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md"
            >
              <GlassCard variant="strong" className="p-6">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center shrink-0">
                    <Trash2 size={22} className="text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Delete lesson?</h3>
                    <p className="text-sm text-muted-foreground">
                      This will permanently delete <strong className="text-foreground">{confirmDelete.title}</strong> and all associated quiz data. This action cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CyberButton variant="secondary" fullWidth onClick={() => setConfirmDelete(null)}>Cancel</CyberButton>
                  <CyberButton variant="danger" fullWidth onClick={deleteLesson}>Delete lesson</CyberButton>
                </div>
              </GlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit/Create lesson modal (shared UI) */}
      <AnimatePresence>
        {(editLesson || createOpen) && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              onClick={() => { setEditLesson(null); setCreateOpen(false); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin"
            >
              <GlassCard variant="strong" className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold">
                    {editLesson ? "Edit Lesson" : "Create New Lesson"}
                  </h3>
                  <button
                    onClick={() => { setEditLesson(null); setCreateOpen(false); }}
                    className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast({ title: editLesson ? "Lesson updated" : "Lesson created" }); setEditLesson(null); setCreateOpen(false); }}>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block">Lesson Title</label>
                    <input
                      type="text"
                      defaultValue={editLesson?.title ?? ""}
                      placeholder="e.g. Advanced Phishing Defense"
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-sm outline-none focus:border-[#a855f7]/50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium mb-1.5 block">Category</label>
                      <select
                        defaultValue={editLesson?.category ?? ""}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-sm outline-none focus:border-[#a855f7]/50"
                      >
                        {ADMIN_CATEGORIES.map((c) => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1.5 block">Difficulty</label>
                      <select
                        defaultValue={editLesson?.difficulty ?? "beginner"}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-sm outline-none focus:border-[#a855f7]/50"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium mb-1.5 block">Duration</label>
                      <input
                        type="text"
                        defaultValue={editLesson?.duration ?? "15 min"}
                        placeholder="e.g. 15 min"
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-sm outline-none focus:border-[#a855f7]/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1.5 block">Points</label>
                      <input
                        type="number"
                        defaultValue="75"
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-sm outline-none focus:border-[#a855f7]/50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block">Description</label>
                    <textarea
                      rows={3}
                      defaultValue={editLesson?.title ? `Deep dive into ${editLesson.category.toLowerCase()} topics.` : ""}
                      placeholder="Brief description of what this lesson covers..."
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-sm outline-none focus:border-[#a855f7]/50 resize-none"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" defaultChecked={editLesson?.published ?? false} className="w-3.5 h-3.5 rounded accent-[#a855f7]" />
                      Publish immediately
                    </label>
                    <div className="flex items-center gap-2">
                      <CyberButton type="button" variant="secondary" size="sm" onClick={() => { setEditLesson(null); setCreateOpen(false); }}>Cancel</CyberButton>
                      <CyberButton type="submit" size="sm">{editLesson ? "Save changes" : "Create lesson"}</CyberButton>
                    </div>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
