// ============================================================
// ResumeForge — Core Types
// ============================================================

export type TemplateId = "classic" | "modern" | "creative" | "executive" | "minimal";

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  website?: string;
  summary: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  honors?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  level?: "beginner" | "intermediate" | "advanced" | "expert";
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  bullets: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface ResumeData {
  id: string;
  name: string; // name of this saved resume (e.g. "Software Engineer - Google")
  templateId: TemplateId;
  personalInfo: PersonalInfo;
  experience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  createdAt: string;
  updatedAt: string;
  isPremium?: boolean;
}

// ── AI Analysis ─────────────────────────────────────────────

export interface ScoreBreakdown {
  impact: number;       // 0-100
  clarity: number;
  keywords: number;
  formatting: number;
  completeness: number;
}

export interface ResumeAnalysis {
  overallScore: number; // 0-100
  scoreBreakdown: ScoreBreakdown;
  strengths: string[];
  improvements: string[];
  missingKeywords: string[];
  suggestions: SectionSuggestion[];
  atsCompatibility: "poor" | "fair" | "good" | "excellent";
}

export interface SectionSuggestion {
  section: string;
  original: string;
  improved: string;
  explanation: string;
}

// ── Job Tailoring ────────────────────────────────────────────

export interface TailoringResult {
  tailoredResume: ResumeData;
  matchScore: number;
  keywordsAdded: string[];
  missingSkills: string[];
  changes: string[];
}

// ── Cover Letter ─────────────────────────────────────────────

export interface CoverLetterData {
  id: string;
  resumeId: string;
  jobTitle: string;
  company: string;
  content: string;
  createdAt: string;
}

// ── User / Plan ──────────────────────────────────────────────

export type Plan = "free" | "premium";

export interface UserState {
  plan: Plan;
  resumeCount: number;
  maxFreeResumes: number; // 2
  aiRequestsToday: number;
  maxFreeAiRequests: number; // 5
}

// ── Interview Prep ───────────────────────────────────────────

export interface InterviewQuestion {
  question: string;
  category: "behavioral" | "technical" | "situational" | "role-specific";
  tip: string;
  sampleAnswer?: string;
}
