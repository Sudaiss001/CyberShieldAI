"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Search, Filter, MoreHorizontal, Eye, Pencil, UserX,
  UserCheck, Trash2, KeyRound, Download, ChevronLeft, ChevronRight,
  X, AlertTriangle, ShieldCheck,
} from "lucide-react";
import { AdminHeader } from "@/components/shared/AdminHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { CyberButton } from "@/components/shared/CyberButton";
import { useToast } from "@/hooks/use-toast";
import { ADMIN_USERS, type AdminUser } from "@/lib/mock-data/admin";
import { cn } from "@/lib/utils";

type Action = "view" | "edit" | "suspend" | "activate" | "delete" | "reset";

const ACTIONS: { id: Action; label: string; icon: any; color: string; danger?: boolean }[] = [
  { id: "view", label: "View", icon: Eye, color: "#00d4ff" },
  { id: "edit", label: "Edit", icon: Pencil, color: "#a855f7" },
  { id: "suspend", label: "Suspend", icon: UserX, color: "#f59e0b", danger: true },
  { id: "activate", label: "Activate", icon: UserCheck, color: "#10b981" },
  { id: "reset", label: "Reset Password", icon: KeyRound, color: "#06b6d4" },
  { id: "delete", label: "Delete", icon: Trash2, color: "#ef4444", danger: true },
];

const ROLE_COLORS: Record<string, string> = {
  "Super Admin": "#ef4444",
  Admin: "#a855f7",
  Moderator: "#f59e0b",
  User: "#00d4ff",
};

const STATUS_COLORS: Record<string, string> = {
  active: "#10b981",
  suspended: "#ef4444",
  pending: "#f59e0b",
};

const PAGE_SIZE = 8;

export function AdminUsersPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ user: AdminUser; action: Action } | null>(null);
  const [users, setUsers] = useState<AdminUser[]>(ADMIN_USERS);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (statusFilter !== "all" && u.status !== statusFilter) return false;
      if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [users, roleFilter, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageItems = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const handleAction = (user: AdminUser, action: Action) => {
    setOpenMenu(null);
    if (action === "view") {
      toast({ title: "Viewing user", description: `${user.name} — ${user.email}` });
      return;
    }
    if (action === "edit") {
      toast({ title: "Edit user", description: `Opening edit form for ${user.name}` });
      return;
    }
    setConfirmAction({ user, action });
  };

  const executeAction = () => {
    if (!confirmAction) return;
    const { user, action } = confirmAction;
    const actionLabels: Record<Action, string> = {
      view: "viewed",
      edit: "edited",
      suspend: "suspended",
      activate: "activated",
      delete: "deleted",
      reset: "sent password reset to",
    };

    if (action === "delete") {
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } else if (action === "suspend") {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: "suspended" } : u)));
    } else if (action === "activate") {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: "active" } : u)));
    }

    toast({
      title: `User ${actionLabels[action]}`,
      description: action === "reset" ? `Reset email sent to ${user.email}` : `${user.name} has been ${actionLabels[action]}.`,
    });
    setConfirmAction(null);
  };

  return (
    <div>
      <AdminHeader
        title="User Management"
        description={`${users.length} total users — ${users.filter((u) => u.status === "active").length} active, ${users.filter((u) => u.status === "suspended").length} suspended`}
        breadcrumbs={[{ label: "Users" }]}
        icon={<Users size={20} className="text-[#a855f7]" />}
        showBack
        actions={
          <>
            <CyberButton variant="secondary" size="sm" icon={<Download size={14} />} onClick={() => toast({ title: "Export started", description: "CSV will be ready in a moment." })}>
              Export
            </CyberButton>
            <CyberButton size="sm" onClick={() => toast({ title: "Add user", description: "Opening new user form" })}>
              Add User
            </CyberButton>
          </>
        }
      />

      {/* Filters */}
      <GlassCard className="p-4 mb-5">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-sm outline-none focus:border-[#a855f7]/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-muted-foreground shrink-0" />
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs outline-none focus:border-[#a855f7]/50"
            >
              <option value="all">All Roles</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Admin">Admin</option>
              <option value="Moderator">Moderator</option>
              <option value="User">User</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs outline-none focus:border-[#a855f7]/50"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground border-b border-white/5">
                <th className="py-3 px-4 font-semibold">User</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Total Scans</th>
                <th className="py-3 px-4 font-semibold">Plan</th>
                <th className="py-3 px-4 font-semibold">Joined</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {pageItems.map((user) => (
                  <motion.tr
                    key={user.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ background: `linear-gradient(135deg, ${user.color}, ${user.color}99)` }}
                        >
                          {user.avatar}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{user.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md"
                        style={{
                          color: ROLE_COLORS[user.role],
                          background: `${ROLE_COLORS[user.role]}15`,
                          border: `1px solid ${ROLE_COLORS[user.role]}30`,
                        }}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-medium"
                        style={{ color: STATUS_COLORS[user.status] }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: STATUS_COLORS[user.status] }}
                        />
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">{user.totalScans.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md",
                        user.plan === "enterprise" && "bg-[#a855f7]/15 text-[#a855f7]",
                        user.plan === "pro" && "bg-[#00d4ff]/15 text-[#00d4ff]",
                        user.plan === "free" && "bg-white/5 text-muted-foreground"
                      )}>
                        {user.plan}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {new Date(user.joinedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="py-3 px-4 text-right relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      <AnimatePresence>
                        {openMenu === user.id && (
                          <>
                            <div className="fixed inset-0 z-30" onClick={() => setOpenMenu(null)} />
                            <motion.div
                              initial={{ opacity: 0, y: -8, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -8, scale: 0.95 }}
                              transition={{ duration: 0.15 }}
                              className="absolute right-4 top-12 z-40 w-48 glass-strong rounded-xl border border-white/10 shadow-2xl overflow-hidden p-1.5"
                            >
                              {ACTIONS.filter((a) => {
                                if (a.id === "suspend" && user.status === "suspended") return false;
                                if (a.id === "activate" && user.status === "active") return false;
                                return true;
                              }).map((action) => (
                                <button
                                  key={action.id}
                                  onClick={() => handleAction(user, action.id)}
                                  className={cn(
                                    "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors",
                                    action.danger
                                      ? "text-red-400 hover:bg-red-500/10"
                                      : "hover:bg-white/5"
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
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {pageItems.length === 0 && (
          <div className="p-12 text-center">
            <Users size={40} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium">No users match your filters</p>
            <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/5">
            <p className="text-xs text-muted-foreground">
              Showing {(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, filtered.length)} of {filtered.length} users
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, current - 1))}
                disabled={current === 1}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={cn(
                    "w-8 h-8 rounded-lg text-xs font-medium transition-colors",
                    current === i + 1 ? "bg-[#a855f7] text-white" : "bg-white/5 hover:bg-white/10"
                  )}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(Math.min(totalPages, current + 1))}
                disabled={current === totalPages}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Confirmation dialog */}
      <AnimatePresence>
        {confirmAction && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              onClick={() => setConfirmAction(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md"
            >
              <GlassCard variant="strong" className="p-6 relative">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X size={16} />
                </button>
                <div className="flex items-start gap-4 mb-5">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                      confirmAction.action === "delete" || confirmAction.action === "suspend"
                        ? "bg-red-500/15 border border-red-500/30"
                        : "bg-amber-500/15 border border-amber-500/30"
                    )}
                  >
                    {confirmAction.action === "delete" ? (
                      <Trash2 size={22} className="text-red-400" />
                    ) : confirmAction.action === "suspend" ? (
                      <UserX size={22} className="text-red-400" />
                    ) : confirmAction.action === "activate" ? (
                      <UserCheck size={22} className="text-emerald-400" />
                    ) : (
                      <AlertTriangle size={22} className="text-amber-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">
                      {confirmAction.action === "delete" && "Delete user?"}
                      {confirmAction.action === "suspend" && "Suspend user?"}
                      {confirmAction.action === "activate" && "Activate user?"}
                      {confirmAction.action === "reset" && "Reset password?"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {confirmAction.action === "delete" && (
                        <>This will permanently delete <strong className="text-foreground">{confirmAction.user.name}</strong>'s account and all associated data. This action cannot be undone.</>
                      )}
                      {confirmAction.action === "suspend" && (
                        <><strong className="text-foreground">{confirmAction.user.name}</strong> will lose access immediately. They can be reactivated later.</>
                      )}
                      {confirmAction.action === "activate" && (
                        <><strong className="text-foreground">{confirmAction.user.name}</strong> will regain full access to the platform.</>
                      )}
                      {confirmAction.action === "reset" && (
                        <>A password reset link will be emailed to <strong className="text-foreground">{confirmAction.user.email}</strong>. The link expires in 1 hour.</>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                  <CyberButton variant="secondary" fullWidth onClick={() => setConfirmAction(null)}>
                    Cancel
                  </CyberButton>
                  <CyberButton
                    fullWidth
                    variant={confirmAction.action === "activate" ? "success" : "danger"}
                    onClick={executeAction}
                  >
                    {confirmAction.action === "delete" && "Delete user"}
                    {confirmAction.action === "suspend" && "Suspend user"}
                    {confirmAction.action === "activate" && "Activate user"}
                    {confirmAction.action === "reset" && "Send reset email"}
                  </CyberButton>
                </div>
              </GlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
