// ============================================================
// ResumeForge — Global Store (Zustand)
// ============================================================
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ResumeData, CoverLetterData, Plan, TemplateId } from "@/types";
import { createEmptyResume } from "@/lib/utils";

const MAX_FREE_RESUMES = 2;
const MAX_FREE_AI_REQUESTS = 5;

interface ResumeStore {
  // ── State ──────────────────────────────────────────────────
  resumes: ResumeData[];
  activeResumeId: string | null;
  coverLetters: CoverLetterData[];
  plan: Plan;
  aiRequestsToday: number;
  aiRequestDate: string;
  isLoading: boolean;
  toastMessage: string | null;

  // ── Resume CRUD ────────────────────────────────────────────
  createResume: (templateId?: TemplateId) => ResumeData;
  updateResume: (id: string, data: Partial<ResumeData>) => void;
  deleteResume: (id: string) => void;
  setActiveResume: (id: string) => void;
  getActiveResume: () => ResumeData | null;
  duplicateResume: (id: string) => ResumeData | null;

  // ── Cover Letters ──────────────────────────────────────────
  saveCoverLetter: (cl: CoverLetterData) => void;
  deleteCoverLetter: (id: string) => void;

  // ── Plan / Limits ──────────────────────────────────────────
  setPlan: (plan: Plan) => void;
  canCreateResume: () => boolean;
  canUseAI: () => boolean;
  incrementAI: () => void;

  // ── UI helpers ─────────────────────────────────────────────
  setLoading: (v: boolean) => void;
  showToast: (msg: string) => void;
  clearToast: () => void;
}

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set, get) => ({
      resumes: [],
      activeResumeId: null,
      coverLetters: [],
      plan: "free",
      aiRequestsToday: 0,
      aiRequestDate: "",
      isLoading: false,
      toastMessage: null,

      // ── Resume CRUD ────────────────────────────────────────
      createResume: (templateId = "modern") => {
        const resume = createEmptyResume(templateId);
        set((s) => ({
          resumes: [...s.resumes, resume],
          activeResumeId: resume.id,
        }));
        return resume;
      },

      updateResume: (id, data) => {
        set((s) => ({
          resumes: s.resumes.map((r) =>
            r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r
          ),
        }));
      },

      deleteResume: (id) => {
        set((s) => {
          const filtered = s.resumes.filter((r) => r.id !== id);
          return {
            resumes: filtered,
            activeResumeId: s.activeResumeId === id
              ? (filtered[0]?.id ?? null)
              : s.activeResumeId,
          };
        });
      },

      setActiveResume: (id) => set({ activeResumeId: id }),

      getActiveResume: () => {
        const { resumes, activeResumeId } = get();
        return resumes.find((r) => r.id === activeResumeId) || null;
      },

      duplicateResume: (id) => {
        const resume = get().resumes.find((r) => r.id === id);
        if (!resume) return null;
        const { v4: uuidv4 } = require("uuid");
        const dup: ResumeData = {
          ...resume,
          id: uuidv4(),
          name: `${resume.name} (copy)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((s) => ({ resumes: [...s.resumes, dup] }));
        return dup;
      },

      // ── Cover Letters ────────────────────────────────────
      saveCoverLetter: (cl) => {
        set((s) => ({
          coverLetters: [
            cl,
            ...s.coverLetters.filter((c) => c.id !== cl.id),
          ],
        }));
      },

      deleteCoverLetter: (id) => {
        set((s) => ({ coverLetters: s.coverLetters.filter((c) => c.id !== id) }));
      },

      // ── Plan / Limits ────────────────────────────────────
      setPlan: (plan) => set({ plan }),

      canCreateResume: () => {
        const { plan, resumes } = get();
        return plan === "premium" || resumes.length < MAX_FREE_RESUMES;
      },

      canUseAI: () => {
        const { plan, aiRequestsToday, aiRequestDate } = get();
        if (plan === "premium") return true;
        const today = new Date().toDateString();
        if (aiRequestDate !== today) return true; // new day
        return aiRequestsToday < MAX_FREE_AI_REQUESTS;
      },

      incrementAI: () => {
        const today = new Date().toDateString();
        set((s) => ({
          aiRequestsToday: s.aiRequestDate === today ? s.aiRequestsToday + 1 : 1,
          aiRequestDate: today,
        }));
      },

      // ── UI helpers ────────────────────────────────────────
      setLoading: (v) => set({ isLoading: v }),
      showToast: (msg) => set({ toastMessage: msg }),
      clearToast: () => set({ toastMessage: null }),
    }),
    {
      name: "resumeforge-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        resumes: s.resumes,
        coverLetters: s.coverLetters,
        plan: s.plan,
        aiRequestsToday: s.aiRequestsToday,
        aiRequestDate: s.aiRequestDate,
      }),
    }
  )
);
