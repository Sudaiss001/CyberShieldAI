"use client";

import { useEffect } from "react";
import { useHashRoute } from "@/hooks/use-router";
import { ROUTES } from "@/lib/routes";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Public pages
import { LandingPage } from "@/components/pages/public/LandingPage";
import { FeaturesPage } from "@/components/pages/public/FeaturesPage";
import { AboutPage } from "@/components/pages/public/AboutPage";
import { AcademyPublicPage } from "@/components/pages/public/AcademyPublicPage";
import { ContactPage } from "@/components/pages/public/ContactPage";
import { FaqPage } from "@/components/pages/public/FaqPage";
import { PrivacyPage } from "@/components/pages/public/PrivacyPage";
import { TermsPage } from "@/components/pages/public/TermsPage";
import { NotFoundPage } from "@/components/pages/public/NotFoundPage";

// Auth pages
import { LoginPage } from "@/components/pages/auth/LoginPage";
import { RegisterPage } from "@/components/pages/auth/RegisterPage";
import { ForgotPasswordPage } from "@/components/pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/components/pages/auth/ResetPasswordPage";
import { VerifyEmailPage } from "@/components/pages/auth/VerifyEmailPage";

// Dashboard pages
import { DashboardHome } from "@/components/pages/dashboard/DashboardHome";
import { ReportsPage } from "@/components/pages/dashboard/ReportsPage";
import { ReportDetailsPage } from "@/components/pages/dashboard/ReportDetailsPage";
import { NotificationsPage } from "@/components/pages/dashboard/NotificationsPage";
import { ProfilePage } from "@/components/pages/dashboard/ProfilePage";
import { SettingsPage } from "@/components/pages/dashboard/SettingsPage";
import { HelpCenterPage } from "@/components/pages/dashboard/HelpCenterPage";
import { AcademyDashboardPage } from "@/components/pages/dashboard/AcademyDashboardPage";
import { LearningModulePage } from "@/components/pages/dashboard/LearningModulePage";
import { AiChatPage } from "@/components/pages/dashboard/AiChatPage";

// Scanner pages
import { ScannerPage } from "@/components/pages/scanners/ScannerPage";
import { ProcessingScreen } from "@/components/pages/scanners/ProcessingScreen";

// Admin pages
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminGuard } from "@/components/shared/AdminGuard";
import { AdminLoginPage } from "@/components/pages/admin/AdminLoginPage";
import { AdminDashboardPage } from "@/components/pages/admin/AdminDashboardPage";
import { AdminUsersPage } from "@/components/pages/admin/AdminUsersPage";
import { AdminScansPage } from "@/components/pages/admin/AdminScansPage";
import { AdminReportsPage } from "@/components/pages/admin/AdminReportsPage";
import { AdminAnalyticsPage } from "@/components/pages/admin/AdminAnalyticsPage";
import { AdminAiUsagePage } from "@/components/pages/admin/AdminAiUsagePage";
import { AdminAcademyPage } from "@/components/pages/admin/AdminAcademyPage";
import { AdminNotificationsPage } from "@/components/pages/admin/AdminNotificationsPage";
import { AdminRolesPage } from "@/components/pages/admin/AdminRolesPage";
import { AdminAuditLogsPage } from "@/components/pages/admin/AdminAuditLogsPage";
import { AdminSettingsPage } from "@/components/pages/admin/AdminSettingsPage";
import { AdminProfilePage } from "@/components/pages/admin/AdminProfilePage";

import { PageTransition } from "@/components/shared/PageTransition";

const PUBLIC_PAGES: Record<string, () => React.ReactElement> = {
  [ROUTES.home]: LandingPage,
  [ROUTES.features]: FeaturesPage,
  [ROUTES.about]: AboutPage,
  [ROUTES.academy]: AcademyPublicPage,
  [ROUTES.contact]: ContactPage,
  [ROUTES.faq]: FaqPage,
  [ROUTES.privacy]: PrivacyPage,
  [ROUTES.terms]: TermsPage,
};

const AUTH_PAGES: Record<string, { component: () => React.ReactElement; title: string; subtitle: string }> = {
  [ROUTES.login]: {
    component: LoginPage,
    title: "Welcome back",
    subtitle: "Sign in to your CyberShield AI account to continue scanning.",
  },
  [ROUTES.register]: {
    component: RegisterPage,
    title: "Create your account",
    subtitle: "Start defending against digital threats with AI-powered analysis.",
  },
  [ROUTES.forgot]: {
    component: ForgotPasswordPage,
    title: "Forgot password?",
    subtitle: "Enter your email and we'll send you reset instructions.",
  },
  [ROUTES.reset]: {
    component: ResetPasswordPage,
    title: "Reset password",
    subtitle: "Choose a new password for your account.",
  },
  [ROUTES.verifyEmail]: {
    component: VerifyEmailPage,
    title: "Verify your email",
    subtitle: "Enter the 6-digit code we sent to your inbox.",
  },
};

const DASHBOARD_PAGES: Record<string, () => React.ReactElement> = {
  [ROUTES.dashboard]: DashboardHome,
  [ROUTES.reports]: ReportsPage,
  [ROUTES.notifications]: NotificationsPage,
  [ROUTES.profile]: ProfilePage,
  [ROUTES.settings]: SettingsPage,
  [ROUTES.help]: HelpCenterPage,
  [ROUTES.aiChat]: AiChatPage,
  [ROUTES.academyDashboard]: AcademyDashboardPage,
};

const ADMIN_PAGES: Record<string, () => React.ReactElement> = {
  [ROUTES.admin]: AdminDashboardPage,
  [ROUTES.adminDashboard]: AdminDashboardPage,
  [ROUTES.adminUsers]: AdminUsersPage,
  [ROUTES.adminScans]: AdminScansPage,
  [ROUTES.adminReports]: AdminReportsPage,
  [ROUTES.adminAnalytics]: AdminAnalyticsPage,
  [ROUTES.adminAiUsage]: AdminAiUsagePage,
  [ROUTES.adminAcademy]: AdminAcademyPage,
  [ROUTES.adminNotifications]: AdminNotificationsPage,
  [ROUTES.adminRoles]: AdminRolesPage,
  [ROUTES.adminAuditLogs]: AdminAuditLogsPage,
  [ROUTES.adminSettings]: AdminSettingsPage,
  [ROUTES.adminProfile]: AdminProfilePage,
};

// Admin login is rendered WITHOUT the AdminLayout or AdminGuard —
// it's the entry point to the admin area and must be publicly reachable.
// All other admin routes are wrapped in <AdminGuard> below.

export function Router() {
  const [path] = useHashRoute();

  // Update document title based on route
  useEffect(() => {
    const titleMap: Record<string, string> = {
      [ROUTES.home]: "CyberShield AI — See It. Hear It. Verify It.",
      [ROUTES.dashboard]: "Dashboard — CyberShield AI",
      [ROUTES.features]: "Features — CyberShield AI",
      [ROUTES.about]: "About — CyberShield AI",
      [ROUTES.academy]: "Cyber Academy — CyberShield AI",
      [ROUTES.contact]: "Contact — CyberShield AI",
      [ROUTES.faq]: "FAQ — CyberShield AI",
      [ROUTES.login]: "Sign In — CyberShield AI",
      [ROUTES.register]: "Get Started — CyberShield AI",
      [ROUTES.adminLogin]: "Admin Sign-In — Cyber Guardian AI",
      [ROUTES.adminDashboard]: "Admin Dashboard — Cyber Guardian AI",
      [ROUTES.adminUsers]: "User Management — Admin",
      [ROUTES.adminScans]: "Scan Management — Admin",
      [ROUTES.adminReports]: "Reports — Admin",
      [ROUTES.adminAnalytics]: "Analytics — Admin",
      [ROUTES.adminAiUsage]: "AI Usage — Admin",
      [ROUTES.adminAcademy]: "Cyber Academy — Admin",
      [ROUTES.adminNotifications]: "Notifications — Admin",
      [ROUTES.adminRoles]: "Roles & Permissions — Admin",
      [ROUTES.adminAuditLogs]: "Audit Logs — Admin",
      [ROUTES.adminSettings]: "System Settings — Admin",
      [ROUTES.adminProfile]: "Admin Profile — CyberShield AI",
    };
    document.title = titleMap[path] ?? "CyberShield AI";
  }, [path]);

  // Public routes
  if (PUBLIC_PAGES[path]) {
    const Page = PUBLIC_PAGES[path];
    return (
      <PublicLayout>
        <PageTransition>
          <Page />
        </PageTransition>
      </PublicLayout>
    );
  }

  // Auth routes
  if (AUTH_PAGES[path]) {
    const { component: Page, title, subtitle } = AUTH_PAGES[path];
    return (
      <AuthLayout title={title} subtitle={subtitle}>
        <Page />
      </AuthLayout>
    );
  }

  // Scanner routes (dashboard layout)
  const SCANNER_PATHS = [
    ROUTES.aiScanner,
    ROUTES.urlScanner,
    ROUTES.emailScanner,
    ROUTES.imageScanner,
    ROUTES.documentScanner,
    ROUTES.audioScanner,
    ROUTES.videoScanner,
    ROUTES.qrScanner,
  ];
  if (SCANNER_PATHS.includes(path as never)) {
    return (
      <DashboardLayout>
        <PageTransition>
          <ScannerPage scannerKey={path as never} />
        </PageTransition>
      </DashboardLayout>
    );
  }

  // Processing screen
  if (path === ROUTES.processing) {
    return (
      <DashboardLayout>
        <ProcessingScreen />
      </DashboardLayout>
    );
  }

  // Report details (path starts with /reports/)
  if (path.startsWith(ROUTES.reportDetails) && path !== ROUTES.reports) {
    return (
      <DashboardLayout>
        <PageTransition>
          <ReportDetailsPage />
        </PageTransition>
      </DashboardLayout>
    );
  }

  // Learning module
  if (path === ROUTES.learningModule) {
    return (
      <DashboardLayout>
        <PageTransition>
          <LearningModulePage />
        </PageTransition>
      </DashboardLayout>
    );
  }

  // Other dashboard pages
  if (DASHBOARD_PAGES[path]) {
    const Page = DASHBOARD_PAGES[path];
    return (
      <DashboardLayout>
        <PageTransition>
          <Page />
        </PageTransition>
      </DashboardLayout>
    );
  }

  // ============================================
  // Admin routes
  // ============================================
  // Admin Login — public, no guard, no admin layout (it IS the entry point)
  if (path === ROUTES.adminLogin) {
    return <AdminLoginPage />;
  }

  // All other admin routes — protected by AdminGuard.
  // If not authenticated as an admin, the guard redirects to /admin/login.
  if (ADMIN_PAGES[path]) {
    const Page = ADMIN_PAGES[path];
    return (
      <AdminGuard>
        <AdminLayout>
          <PageTransition>
            <Page />
          </PageTransition>
        </AdminLayout>
      </AdminGuard>
    );
  }

  // 404 fallback
  return (
    <PublicLayout>
      <PageTransition>
        <NotFoundPage />
      </PageTransition>
    </PublicLayout>
  );
}
