import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ResumeForge — AI-Powered Resume Builder",
  description:
    "Build, analyze, and tailor your resume with AI. Get more interviews with ATS-optimized resumes crafted by ResumeForge.",
  keywords: ["resume builder", "AI resume", "ATS resume", "cover letter generator"],
  openGraph: {
    title: "ResumeForge — AI-Powered Resume Builder",
    description: "Build ATS-optimized resumes with AI in minutes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body className="min-h-screen bg-surface-50">
        {children}
      </body>
    </html>
  );
}
