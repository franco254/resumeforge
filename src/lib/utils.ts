import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { v4 as uuidv4 } from "uuid";
import type { ResumeData, TemplateId } from "@/types";

// ── Class name helper ────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── UUID ─────────────────────────────────────────────────────
export { uuidv4 as generateId };

// ── Empty Resume Factory ─────────────────────────────────────
export function createEmptyResume(templateId: TemplateId = "modern"): ResumeData {
  return {
    id: uuidv4(),
    name: "Untitled Resume",
    templateId,
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      github: "",
      website: "",
      summary: "",
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ── Local Storage Helpers ─────────────────────────────────────
const STORAGE_KEYS = {
  resumes: "resumeforge_resumes",
  coverLetters: "resumeforge_cover_letters",
  userPlan: "resumeforge_plan",
  aiRequests: "resumeforge_ai_requests",
} as const;

export function getStoredResumes(): ResumeData[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.resumes);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveResumeToStorage(resume: ResumeData): void {
  if (typeof window === "undefined") return;
  const resumes = getStoredResumes();
  const idx = resumes.findIndex((r) => r.id === resume.id);
  if (idx >= 0) {
    resumes[idx] = { ...resume, updatedAt: new Date().toISOString() };
  } else {
    resumes.push(resume);
  }
  localStorage.setItem(STORAGE_KEYS.resumes, JSON.stringify(resumes));
}

export function deleteResumeFromStorage(id: string): void {
  if (typeof window === "undefined") return;
  const resumes = getStoredResumes().filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEYS.resumes, JSON.stringify(resumes));
}

export function getUserPlan(): "free" | "premium" {
  if (typeof window === "undefined") return "free";
  return (localStorage.getItem(STORAGE_KEYS.userPlan) as "free" | "premium") || "free";
}

export function setUserPlan(plan: "free" | "premium"): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.userPlan, plan);
}

// ── AI request tracking (rate-limit free users) ──────────────
export function getAiRequestsToday(): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(STORAGE_KEYS.aiRequests);
  if (!raw) return 0;
  const parsed = JSON.parse(raw);
  const today = new Date().toDateString();
  if (parsed.date !== today) return 0;
  return parsed.count || 0;
}

export function incrementAiRequests(): void {
  if (typeof window === "undefined") return;
  const count = getAiRequestsToday();
  const today = new Date().toDateString();
  localStorage.setItem(STORAGE_KEYS.aiRequests, JSON.stringify({ date: today, count: count + 1 }));
}

// ── Format date for display ──────────────────────────────────
export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  if (dateStr.toLowerCase() === "present") return "Present";
  try {
    const d = new Date(dateStr + "-01");
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

// ── Score color helper ────────────────────────────────────────
export function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-500";
  if (score >= 60) return "text-yellow-500";
  return "text-red-400";
}

export function getScoreBg(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-yellow-500";
  return "bg-red-400";
}

// ── Parse plain-text resume into structured data (best-effort) ──
export function parseResumeText(text: string): Partial<ResumeData> {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/);
  const linkedinMatch = text.match(/linkedin\.com\/in\/([a-zA-Z0-9\-]+)/i);

  return {
    personalInfo: {
      fullName: lines[0] || "",
      email: emailMatch?.[0] || "",
      phone: phoneMatch?.[0] || "",
      location: "",
      linkedin: linkedinMatch ? `https://linkedin.com/in/${linkedinMatch[1]}` : "",
      summary: "",
      github: "",
      website: "",
    },
  };
}
