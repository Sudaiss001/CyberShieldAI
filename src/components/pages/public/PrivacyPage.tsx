"use client";

import { GlassCard } from "@/components/shared/GlassCard";

const SECTIONS = [
  {
    title: "1. Introduction",
    body: "This Privacy Policy explains how CyberShield AI ('we', 'us', or 'our') collects, uses, discloses, and safeguards your information when you use our platform, website, and services. We are committed to protecting your privacy and ensuring that your personal data is handled in accordance with applicable data protection laws, including the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA). By accessing or using CyberShield AI, you consent to the practices described in this policy. If you do not agree with these terms, please do not use our services. This policy applies to all users of our platform, including free, professional, and enterprise tier customers. We may update this policy from time to time, and we will notify you of any material changes via email or in-app notification at least 30 days before the changes take effect."
  },
  {
    title: "2. Information We Collect",
    body: "We collect information that you provide directly to us when you create an account, including your name, email address, organization name, and role. We also collect information automatically when you use our services, including: (a) Scan data — files, URLs, emails, and other content you submit for analysis. This data is processed in-memory by default and discarded immediately after analysis unless you explicitly save a report. (b) Usage data — information about how you interact with our platform, including pages visited, features used, time spent, and crash reports. (c) Device data — IP address, browser type, operating system, and device identifiers. (d) Communication data — records of your interactions with our support team, including emails and chat transcripts. We never collect biometric data, location data from mobile devices, or contacts from your address book."
  },
  {
    title: "3. How We Use Your Information",
    body: "We use your information to: (a) Provide, operate, and maintain our services, including processing your scans and generating reports. (b) Improve our services, including training our threat intelligence models on aggregate, fully-anonymized data. We never use customer-submitted content to train our AI models. (c) Communicate with you about product updates, security alerts, and promotional offers (you can opt out of marketing communications at any time). (d) Detect, prevent, and address technical issues, fraud, and security incidents. (e) Comply with legal obligations and enforce our terms of service. (f) Personalize your experience and provide customer support. We do not sell your personal information to third parties under any circumstances."
  },
  {
    title: "4. Data Retention",
    body: "We retain your data for as long as your account is active or as needed to provide our services. Scan data is processed in-memory by default and discarded within 24 hours unless you save a report. Saved reports are retained based on your plan: Free (7 days), Professional (1 year), Enterprise (configurable, up to 7 years for compliance). When you delete your account, we permanently remove all your data within 30 days, except where retention is required by law (e.g., financial records for tax compliance). You can request a copy of your data or its deletion at any time through Settings → Privacy."
  },
  {
    title: "5. Data Sharing & Disclosure",
    body: "We do not sell, rent, or trade your personal information. We may share your data with: (a) Service providers — third parties that help us operate our platform (e.g., cloud hosting, email delivery, analytics). These providers are bound by strict confidentiality agreements and may only use your data to provide services to us. (b) Legal authorities — when required by law, court order, or government regulation, or to protect our rights and the safety of others. (c) Business transfers — in connection with a merger, acquisition, or asset sale, we will notify you before your data is transferred. (d) Threat intelligence sharing — we may share aggregate, anonymized threat statistics (e.g., 'phishing up 12% this month') with the broader security community. This data is never personally identifiable."
  },
  {
    title: "6. Data Security",
    body: "We implement industry-standard security measures to protect your data, including: (a) Encryption — all data in transit is encrypted with TLS 1.3; all data at rest is encrypted with AES-256. (b) Access controls — strict role-based access with multi-factor authentication for all internal systems. (c) Regular audits — SOC 2 Type II annual audits, quarterly penetration tests by independent third parties, and continuous vulnerability scanning. (d) Incident response — a documented incident response plan with a 24-hour breach notification commitment. (e) Infrastructure — ISO 27001-certified data centers with biometric access controls and 24/7 monitoring. Despite these measures, no system is 100% secure, and we cannot guarantee absolute security."
  },
  {
    title: "7. Your Privacy Rights",
    body: "Depending on your jurisdiction, you may have the right to: (a) Access — request a copy of your personal data. (b) Rectification — request correction of inaccurate data. (c) Erasure — request deletion of your data ('right to be forgotten'). (d) Restriction — request that we limit processing of your data. (e) Portability — receive your data in a machine-readable format. (f) Objection — object to certain processing activities. (g) Withdraw consent — withdraw consent for processing based on consent. To exercise these rights, go to Settings → Privacy → 'Manage my data' or contact privacy@cybershield.ai. We respond to all verifiable requests within 30 days."
  },
  {
    title: "8. International Data Transfers",
    body: "CyberShield AI operates globally, and your data may be transferred to and processed in countries other than your country of residence, including the United States, the European Union, and the United Kingdom. We ensure appropriate safeguards are in place for these transfers, including Standard Contractual Clauses (SCCs) approved by the European Commission and the UK Information Commissioner's Office. For transfers from the EEA, we rely on the EU-US Data Privacy Framework. You can request a copy of these safeguards by contacting privacy@cybershield.ai."
  },
  {
    title: "9. Cookies & Tracking Technologies",
    body: "We use cookies and similar tracking technologies to operate and improve our services. We use: (a) Strictly necessary cookies — required for basic site functionality (authentication, security). These cannot be disabled. (b) Functional cookies — remember your preferences (theme, language, etc.). (c) Analytics cookies — help us understand how visitors use our site so we can improve it. (d) We do not use advertising cookies or cross-site tracking pixels. You can manage your cookie preferences in Settings → Privacy. Most browsers also allow you to block or delete cookies through their settings."
  },
  {
    title: "10. Children's Privacy",
    body: "CyberShield AI is not directed to children under 16, and we do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact privacy@cybershield.ai and we will promptly delete it. Educational institutions using CyberShield AI for students aged 16-18 must obtain parental consent and may use our specialized Education plan, which includes additional safeguards."
  },
  {
    title: "11. Changes to This Policy",
    body: "We may update this Privacy Policy from time to time. We will notify you of any material changes by email or in-app notification at least 30 days before the changes take effect. We will also update the 'Last updated' date at the top of this policy. For non-material changes (e.g., clarifications, formatting), we may update the policy without prior notice. We encourage you to review this policy periodically. Your continued use of CyberShield AI after changes take effect constitutes acceptance of the updated policy."
  },
  {
    title: "12. Contact Us",
    body: "If you have questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact our Data Protection Officer at privacy@cybershield.ai or by mail at: CyberShield AI, Attn: Privacy Team, 1234 Market Street, Suite 500, San Francisco, CA 94103, USA. We are committed to resolving any concerns promptly and will acknowledge receipt of your inquiry within 48 hours."
  },
];

export function PrivacyPage() {
  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#00d4ff]">Legal</span>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="mt-3 text-sm text-muted-foreground">Last updated: July 28, 2026</p>
        </div>

        <GlassCard variant="strong" className="p-6 sm:p-10">
          <div className="space-y-8">
            {SECTIONS.map((s) => (
              <section key={s.title}>
                <h2 className="text-lg font-semibold mb-2 text-[#00d4ff]">{s.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </section>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
