"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Save, Eye, Download, Wand2, Target, ChevronDown, ChevronUp, Plus, Trash2, Crown, Loader2 } from "lucide-react";
import { useResumeStore } from "@/store/resumeStore";
import { AppNav } from "@/components/AppNav";
import { ResumeForm } from "@/components/resume/ResumeForm";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { TemplateSelector } from "@/components/resume/TemplateSelector";
import { TailorModal } from "@/components/resume/TailorModal";
import { InterviewPrepModal } from "@/components/resume/InterviewPrepModal";
import { cn } from "@/lib/utils";
import type { ResumeData } from "@/types";

type ActiveTab = "edit" | "preview" | "tailor" | "interview";

export default function BuilderPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const resumeId = searchParams.get("id");
  const defaultTab = (searchParams.get("tab") as ActiveTab) || "edit";

  const { resumes, updateResume, setActiveResume, plan, canUseAI, incrementAI } = useResumeStore();
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>(defaultTab);
  const [isSaving, setIsSaving] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [tailorOpen, setTailorOpen] = useState(false);
  const [interviewOpen, setInterviewOpen] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);

  const isPremium = plan === "premium";

  useEffect(() => {
    if (resumeId) {
      const found = resumes.find((r) => r.id === resumeId);
      if (found) {
        setResume(found);
        setActiveResume(found.id);
      } else {
        router.push("/dashboard");
      }
    } else if (resumes.length > 0) {
      setResume(resumes[0]);
      setActiveResume(resumes[0].id);
    } else {
      router.push("/dashboard");
    }
  }, [resumeId, resumes]);

  // Auto-save every 30s
  useEffect(() => {
    if (!resume) return;
    const timer = setTimeout(() => {
      if (hasUnsaved) {
        handleSave();
      }
    }, 30_000);
    return () => clearTimeout(timer);
  }, [resume, hasUnsaved]);

  function handleChange(updated: Partial<ResumeData>) {
    if (!resume) return;
    const next = { ...resume, ...updated };
    setResume(next);
    setHasUnsaved(true);
  }

  function handleSave() {
    if (!resume) return;
    setIsSaving(true);
    updateResume(resume.id, resume);
    setTimeout(() => {
      setIsSaving(false);
      setHasUnsaved(false);
    }, 600);
  }

  function handlePrint() {
    window.print();
  }

  const TABS: { id: ActiveTab; label: string; icon?: React.ReactNode; premium?: boolean }[] = [
    { id: "edit",      label: "Edit" },
    { id: "preview",   label: "Preview" },
    { id: "tailor",    label: "AI Tailor", premium: !isPremium },
    { id: "interview", label: "Interview Prep", premium: !isPremium },
  ];

  if (!resume) {
    return (
      <div className="min-h-screen bg-surface-50">
        <AppNav />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-forge-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <AppNav />

      {/* Builder toolbar */}
      <div className="bg-white border-b border-surface-200 sticky top-14 z-40">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between gap-4">
          {/* Resume name */}
          <input
            value={resume.name}
            onChange={(e) => handleChange({ name: e.target.value })}
            className="font-medium text-sm text-surface-800 bg-transparent border-0 outline-none 
                       focus:outline-none w-40 sm:w-56 truncate"
            placeholder="Resume name..."
          />

          {/* Tab switcher */}
          <div className="hidden sm:flex items-center gap-0.5 bg-surface-100 p-0.5 rounded-lg">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-white text-surface-900 shadow-sm"
                    : "text-surface-600 hover:text-surface-900"
                )}
              >
                {tab.label}
                {tab.premium && (
                  <Crown className="w-3 h-3 text-yellow-500" />
                )}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-surface-600 
                         hover:text-surface-900 px-2.5 py-1.5 rounded-lg hover:bg-surface-100 transition-all"
            >
              Template
              {showTemplates ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all",
                hasUnsaved
                  ? "bg-forge-600 text-white hover:bg-forge-700"
                  : "bg-surface-100 text-surface-600 hover:bg-surface-200"
              )}
            >
              {isSaving ? (
                <><Loader2 className="w-3 h-3 animate-spin" /> Saving...</>
              ) : (
                <><Save className="w-3 h-3" />{hasUnsaved ? "Save*" : "Saved"}</>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs font-medium text-white bg-emerald-600 
                         hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition-all"
            >
              <Download className="w-3 h-3" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Template selector drawer */}
        {showTemplates && (
          <div className="border-t border-surface-100 bg-surface-50 px-4 py-4">
            <TemplateSelector
              selected={resume.templateId}
              isPremium={isPremium}
              onSelect={(id) => {
                handleChange({ templateId: id });
                setShowTemplates(false);
              }}
            />
          </div>
        )}
      </div>

      {/* Mobile tab bar */}
      <div className="sm:hidden flex border-b border-surface-200 bg-white px-4 gap-0.5 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-1 px-3 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-all",
              activeTab === tab.id
                ? "border-forge-500 text-forge-700"
                : "border-transparent text-surface-500"
            )}
          >
            {tab.label}
            {tab.premium && <Crown className="w-3 h-3 text-yellow-500" />}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === "edit" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <ResumeForm resume={resume} onChange={handleChange} isPremium={isPremium} canUseAI={canUseAI} onAIUsed={incrementAI} />
            </div>
            <div className="hidden lg:block">
              <div className="sticky top-28">
                <ResumePreview resume={resume} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "preview" && (
          <div className="max-w-3xl mx-auto">
            <ResumePreview resume={resume} showActions />
          </div>
        )}

        {activeTab === "tailor" && (
          <div>
            {isPremium ? (
              <TailorModal
                resume={resume}
                inline
                onApply={(updated) => {
                  handleChange(updated);
                  setActiveTab("preview");
                }}
              />
            ) : (
              <PremiumGate feature="Job-Tailoring Engine" />
            )}
          </div>
        )}

        {activeTab === "interview" && (
          <div>
            {isPremium ? (
              <InterviewPrepModal resume={resume} inline />
            ) : (
              <PremiumGate feature="Interview Prep" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PremiumGate({ feature }: { feature: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center mb-5">
        <Crown className="w-8 h-8 text-yellow-500" />
      </div>
      <h2 className="font-display font-bold text-2xl text-surface-900 mb-2">{feature}</h2>
      <p className="text-surface-500 max-w-sm mb-6">
        This feature is available on the Premium plan. Upgrade to unlock job tailoring,
        unlimited AI, and more.
      </p>
      <button className="btn-forge px-8 py-3">
        <Crown className="w-4 h-4 text-yellow-300" />
        Upgrade to Premium — $12/mo
      </button>
    </div>
  );
}
