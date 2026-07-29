"use client";

import { type ReactNode } from "react";
import { PublicHeader } from "./PublicHeader";
import { PublicFooter } from "./PublicFooter";
import { CyberBackground } from "@/components/shared/CyberBackground";

interface PublicLayoutProps {
  children: ReactNode;
  showBackground?: boolean;
  backgroundVariant?: "grid" | "radial" | "mesh" | "all";
}

export function PublicLayout({
  children,
  showBackground = true,
  backgroundVariant = "all",
}: PublicLayoutProps) {
  return (
    <div className="relative min-h-screen flex flex-col">
      {showBackground && <CyberBackground variant={backgroundVariant} />}
      <PublicHeader />
      <main className="flex-1 relative">{children}</main>
      <PublicFooter />
    </div>
  );
}
