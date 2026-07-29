"use client";

import { GlassCard } from "@/components/shared/GlassCard";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing or using CyberShield AI ('the Service'), you agree to be bound by these Terms of Service ('Terms'). If you do not agree to these Terms, you may not access or use the Service. These Terms form a legally binding agreement between you and CyberShield AI ('we', 'us', or 'our'). If you are using the Service on behalf of an organization, you represent that you have the authority to bind that organization to these Terms. We may modify these Terms at any time, and we will notify you of material changes via email or in-app notification at least 30 days before they take effect. Your continued use of the Service after the effective date of any changes constitutes acceptance of the modified Terms."
  },
  {
    title: "2. Description of Service",
    body: "CyberShield AI provides a multimodal cybersecurity platform that analyzes emails, URLs, images, documents, audio, video, and QR codes for threats using artificial intelligence. The Service includes: (a) Eight specialized scanners with file upload and analysis capabilities. (b) An AI chat assistant for cybersecurity questions. (c) A learning platform ('Cyber Academy') with courses on cybersecurity topics. (d) Reporting and notification features. (e) Integration capabilities via API and webhooks. We reserve the right to modify, suspend, or discontinue any feature of the Service at any time, with or without notice. We are not liable for any modification, suspension, or discontinuance of the Service."
  },
  {
    title: "3. Account Registration & Responsibilities",
    body: "To access most features, you must register for an account. You agree to: (a) Provide accurate, current, and complete information during registration. (b) Maintain the security of your password and account credentials. (c) Promptly notify us of any unauthorized use or security breach. (d) Be responsible for all activities that occur under your account. (e) Not share your account credentials with others. (f) Be at least 16 years old (or the age of digital consent in your jurisdiction). You may not create an account using a false identity or information belonging to another person. Organizations are responsible for managing user access and may terminate user access at any time through the admin interface."
  },
  {
    title: "4. Acceptable Use Policy",
    body: "You agree NOT to: (a) Use the Service for any unlawful purpose or in violation of any law. (b) Submit content that infringes on intellectual property rights, privacy, or other rights of any third party. (c) Upload classified, controlled, or export-restricted materials. (d) Attempt to reverse engineer, decompile, or disassemble any part of the Service. (e) Use the Service to develop, train, or improve competing AI or security products. (f) Attempt to overwhelm, attack, or disrupt the Service's infrastructure. (g) Use automated tools (bots, scrapers) except through our official API. (h) Submit malware, exploits, or active attack tools for analysis without proper authorization. (i) Resell or sublicense access to the Service without written permission. Violations may result in immediate account termination and legal action."
  },
  {
    title: "5. Subscription & Payment Terms",
    body: "We offer three subscription plans: Free (limited features, 25 scans/month), Professional ($49/month, unlimited scans), and Enterprise (custom pricing, contact sales). Subscription fees are billed in advance on a monthly or annual basis. All fees are non-refundable except as expressly stated in these Terms. We offer a 14-day money-back guarantee on first-time paid subscriptions. You can upgrade, downgrade, or cancel your subscription at any time through Settings → Account. Upgrades take effect immediately with prorated billing. Downgrades take effect at the end of your current billing period. We may change our fees upon 30 days' notice. Taxes are added where applicable based on your billing address."
  },
  {
    title: "6. Free Trial & Promotional Offers",
    body: "We may offer free trials or promotional subscriptions from time to time. Free trials are limited to one per organization and last for 14 days unless otherwise stated. At the end of a free trial, your subscription will automatically convert to a paid plan unless you cancel before the trial ends. We will send a reminder email 3 days before the trial expires. Promotional offers cannot be combined with other offers and may be modified or withdrawn at any time. Abuse of free trials (e.g., creating multiple accounts) will result in immediate termination of all accounts and a ban from future promotional offers."
  },
  {
    title: "7. Intellectual Property Rights",
    body: "The Service and its original content, features, and functionality (including software, designs, trademarks, and documentation) are owned by CyberShield AI and are protected by international copyright, trademark, patent, and other intellectual property laws. You retain all rights to the content you submit for analysis ('User Content'). By submitting User Content, you grant us a limited, non-exclusive, royalty-free license to process your content solely for the purpose of providing the Service to you. We do not claim ownership of your User Content. We do not use your User Content to train our AI models. Reports generated by the Service are owned by you, subject to our rights in the underlying analysis methodology."
  },
  {
    title: "8. Data Processing & Security",
    body: "We process your data in accordance with our Privacy Policy. We implement industry-standard security measures including AES-256 encryption at rest, TLS 1.3 in transit, SOC 2 Type II certification, and regular penetration testing. However, no system is 100% secure, and we cannot guarantee absolute security. We are not liable for any unauthorized access to your data resulting from factors beyond our reasonable control. You are responsible for backing up any data you submit to the Service. For enterprise customers, we offer a Data Processing Agreement (DPA) that details our mutual responsibilities under GDPR and other data protection laws."
  },
  {
    title: "9. Service Level Agreement (SLA)",
    body: "For Professional and Enterprise plans, we offer a 99.9% uptime SLA. If we fail to meet this SLA in any calendar month, you may request a service credit equal to: (a) 10% of your monthly fee for 99.0-99.8% uptime, (b) 25% for 95.0-99.0% uptime, or (c) 50% for less than 95.0% uptime. Service credits must be requested within 30 days of the incident and are applied to your next billing cycle. The SLA excludes downtime caused by: (i) scheduled maintenance (announced at least 72 hours in advance), (ii) issues caused by you or your users, (iii) third-party service failures, (iv) force majeure events, or (v) internet or infrastructure issues beyond our control."
  },
  {
    title: "10. Disclaimer of Warranties",
    body: "The Service is provided 'AS IS' and 'AS AVAILABLE' without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of dealing. We do not warrant that: (a) The Service will be uninterrupted, error-free, or secure. (b) The threat analysis results will be accurate, complete, or reliable. (c) Defects will be corrected. (d) The Service is free of viruses or other harmful components. You rely on the Service at your own risk. AI-powered analysis may produce false positives or false negatives. You should not rely solely on the Service for critical security decisions and should always verify results through independent means."
  },
  {
    title: "11. Limitation of Liability",
    body: "To the maximum extent permitted by law, in no event shall CyberShield AI, its directors, employees, partners, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation: lost profits, data loss, business interruption, or reputational damage, arising out of or related to the Service, whether based on warranty, contract, tort, or any other legal theory, even if we have been advised of the possibility of such damages. Our total aggregate liability for any claim arising from these Terms or the Service shall not exceed the amount you paid us in the 12 months preceding the claim, or $100, whichever is greater. This limitation applies even if we have been advised of the possibility of such damages."
  },
  {
    title: "12. Indemnification",
    body: "You agree to indemnify, defend, and hold harmless CyberShield AI, its officers, directors, employees, and agents from and against any claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising out of or related to: (a) Your User Content. (b) Your violation of these Terms. (c) Your violation of any third-party rights, including intellectual property and privacy rights. (d) Your misuse of the Service. We reserve the right to assume the exclusive defense of any claim for which we are entitled to indemnification. You will not settle any claim without our prior written consent."
  },
  {
    title: "13. Account Termination",
    body: "You may terminate your account at any time through Settings → Account → 'Delete my account'. We may terminate or suspend your account immediately, without notice, for: (a) Violations of these Terms or our Acceptable Use Policy. (b) Suspected fraudulent, abusive, or unlawful activity. (c) Failure to pay subscription fees. (d) Long-term inactivity (12+ months for free accounts). Upon termination, your right to use the Service ceases immediately. We will retain your data for 30 days after termination to allow for export, after which it will be permanently deleted (except where retention is required by law). Sections of these Terms that by their nature should survive termination shall survive, including intellectual property, warranty disclaimers, indemnity, and liability limitations."
  },
  {
    title: "14. Governing Law & Dispute Resolution",
    body: "These Terms are governed by the laws of the State of California, USA, without regard to conflict of law principles. You submit to the personal jurisdiction of the courts located in San Francisco County, California. Before filing a lawsuit, you agree to attempt to resolve the dispute through good-faith negotiation. If unresolved after 30 days, either party may initiate binding arbitration through JAMS in San Francisco, California. Arbitration will be conducted by a single arbitrator, in English, and conducted remotely. Class action waivers apply — you may not participate in a class action. Consumer protections in your jurisdiction that cannot be waived by contract are preserved."
  },
  {
    title: "15. Contact Information",
    body: "If you have questions about these Terms, please contact us at legal@cybershield.ai or by mail at: CyberShield AI, Attn: Legal Team, 1234 Market Street, Suite 500, San Francisco, CA 94103, USA. For account-specific questions, please use the in-app support chat or email support@cybershield.ai. We aim to respond to all inquiries within 48 hours. For bug reports or vulnerability disclosures, please email security@cybershield.ai. We operate a responsible disclosure program and offer rewards for verified vulnerability reports."
  },
];

export function TermsPage() {
  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#00d4ff]">Legal</span>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight">Terms of Service</h1>
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
