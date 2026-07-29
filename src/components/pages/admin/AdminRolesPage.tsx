"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck, Plus, Users, Pencil, Trash2, Check, X,
  Eye, EyeOff, Crown, Shield,
} from "lucide-react";
import { AdminHeader } from "@/components/shared/AdminHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { CyberButton } from "@/components/shared/CyberButton";
import { useToast } from "@/hooks/use-toast";
import { ADMIN_ROLES, PERMISSION_MODULES, PERMISSION_MATRIX, type PermissionLevel } from "@/lib/mock-data/admin";
import { cn } from "@/lib/utils";

const ROLE_ICON: Record<string, any> = {
  "Super Admin": Crown,
  Admin: Shield,
  Moderator: Users,
  User: Users,
};

const PERMISSION_DISPLAY: Record<PermissionLevel, { label: string; color: string; bg: string; icon: any }> = {
  full: { label: "Full", color: "#10b981", bg: "rgba(16,185,129,0.1)", icon: Check },
  read: { label: "Read", color: "#00d4ff", bg: "rgba(0,212,255,0.1)", icon: Eye },
  none: { label: "None", color: "#64748b", bg: "rgba(100,116,139,0.1)", icon: X },
};

export function AdminRolesPage() {
  const { toast } = useToast();
  const [matrix, setMatrix] = useState(PERMISSION_MATRIX);
  const [selectedRole, setSelectedRole] = useState<string>("Admin");

  const cyclePermission = (role: string, module: (typeof PERMISSION_MODULES)[number]) => {
    const current = matrix[role][module];
    const next: PermissionLevel = current === "full" ? "read" : current === "read" ? "none" : "full";
    setMatrix((prev) => ({
      ...prev,
      [role]: { ...prev[role], [module]: next },
    }));
    toast({ title: "Permission updated", description: `${role} → ${module}: ${PERMISSION_DISPLAY[next].label}` });
  };

  return (
    <div>
      <AdminHeader
        title="Roles & Permissions"
        description={`${ADMIN_ROLES.length} roles defined. ${ADMIN_ROLES.reduce((sum, r) => sum + r.users, 0).toLocaleString()} users assigned.`}
        breadcrumbs={[{ label: "Roles" }]}
        icon={<ShieldCheck size={20} className="text-[#a855f7]" />}
        showBack
        actions={
          <CyberButton size="sm" icon={<Plus size={14} />} onClick={() => toast({ title: "Create custom role", description: "Opening role builder" })}>
            New Role
          </CyberButton>
        }
      />

      {/* Role cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {ADMIN_ROLES.map((role, i) => {
          const Icon = ROLE_ICON[role.name] ?? Users;
          return (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <GlassCard
                variant={selectedRole === role.name ? "strong" : "hover"}
                className={cn("p-5 cursor-pointer transition-all", selectedRole === role.name && "border-l-2")}
                style={selectedRole === role.name ? { borderLeftColor: role.color } : undefined}
                onClick={() => setSelectedRole(role.name)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: `${role.color}15`, border: `1px solid ${role.color}30` }}
                  >
                    <Icon size={20} style={{ color: role.color }} strokeWidth={2.2} />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); toast({ title: "Edit role", description: role.name }); }}
                      className="p-1 rounded hover:bg-white/10 transition-colors"
                    >
                      <Pencil size={12} className="text-muted-foreground" />
                    </button>
                    {role.name !== "Super Admin" && role.name !== "User" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); toast({ title: "Delete role?", description: role.name, variant: "destructive" }); }}
                        className="p-1 rounded hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={12} className="text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
                <h3 className="font-semibold text-sm">{role.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{role.description}</p>
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Users</span>
                  <span className="font-mono font-semibold">{role.users.toLocaleString()}</span>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Permission matrix */}
      <GlassCard className="overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Permission Matrix</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Click a cell to cycle through Full → Read → None. Currently editing: <span className="text-[#a855f7] font-medium">{selectedRole}</span>
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-xs">
            {(Object.keys(PERMISSION_DISPLAY) as PermissionLevel[]).map((level) => (
              <span key={level} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded" style={{ background: PERMISSION_DISPLAY[level].bg, border: `1px solid ${PERMISSION_DISPLAY[level].color}` }} />
                <span className="text-muted-foreground">{PERMISSION_DISPLAY[level].label}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-white/5">
                <th className="py-3 px-4 text-left text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Module</th>
                {ADMIN_ROLES.map((role) => (
                  <th
                    key={role.id}
                    className={cn(
                      "py-3 px-4 text-center text-[10px] uppercase tracking-wider font-semibold cursor-pointer transition-colors",
                      selectedRole === role.name ? "text-[#a855f7]" : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => setSelectedRole(role.name)}
                  >
                    {role.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSION_MODULES.map((module, mIdx) => (
                <motion.tr
                  key={module}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: mIdx * 0.03 }}
                  className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3 px-4 text-xs font-medium">{module}</td>
                  {ADMIN_ROLES.map((role) => {
                    const level = matrix[role.name][module];
                    const display = PERMISSION_DISPLAY[level];
                    const isSuperAdmin = role.name === "Super Admin";
                    return (
                      <td key={role.id} className="py-3 px-4 text-center">
                        <button
                          onClick={() => !isSuperAdmin && cyclePermission(role.name, module)}
                          disabled={isSuperAdmin}
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                            isSuperAdmin && "cursor-not-allowed"
                          )}
                          style={{
                            color: display.color,
                            background: display.bg,
                            border: `1px solid ${display.color}30`,
                          }}
                        >
                          <display.icon size={11} strokeWidth={3} />
                          {display.label}
                        </button>
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-white/5 flex items-center justify-between text-xs">
          <p className="text-muted-foreground">
            💡 Super Admin permissions are locked. They always have full access to all modules.
          </p>
          <CyberButton size="sm" onClick={() => toast({ title: "Permissions saved", description: "All changes have been applied." })}>
            Save changes
          </CyberButton>
        </div>
      </GlassCard>

      {/* Role distribution */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ADMIN_ROLES.map((role, i) => {
          const fullCount = PERMISSION_MODULES.filter((m) => matrix[role.name][m] === "full").length;
          const readCount = PERMISSION_MODULES.filter((m) => matrix[role.name][m] === "read").length;
          return (
            <motion.div
              key={`dist-${role.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.08 }}
            >
              <GlassCard className="p-4">
                <p className="text-xs font-semibold mb-2" style={{ color: role.color }}>{role.name}</p>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Full access</span>
                    <span className="font-mono text-emerald-400">{fullCount}/{PERMISSION_MODULES.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Read only</span>
                    <span className="font-mono text-[#00d4ff]">{readCount}/{PERMISSION_MODULES.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">No access</span>
                    <span className="font-mono text-muted-foreground">{PERMISSION_MODULES.length - fullCount - readCount}/{PERMISSION_MODULES.length}</span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
