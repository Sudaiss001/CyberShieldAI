import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CyberShield AI — See It. Hear It. Verify It.",
  description:
    "CyberShield AI is your AI Security Analyst for every digital threat. Analyze emails, URLs, screenshots, QR codes, documents, audio, and videos using multimodal AI.",
  keywords: [
    "CyberShield AI",
    "cybersecurity",
    "AI security analyst",
    "phishing detection",
    "QR code scanner",
    "deepfake detection",
    "multimodal AI",
  ],
  authors: [{ name: "CyberShield AI" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "CyberShield AI",
    description: "Your AI Security Analyst for Every Digital Threat.",
    siteName: "CyberShield AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CyberShield AI",
    description: "Your AI Security Analyst for Every Digital Threat.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        {children}
        <Toaster />
        <SonnerToaster
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "rgba(15, 20, 40, 0.9)",
              border: "1px solid rgba(0, 212, 255, 0.3)",
              color: "#e2e8f0",
              backdropFilter: "blur(12px)",
            },
          }}
        />
      </body>
    </html>
  );
}
