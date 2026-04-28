"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Save, Download, Loader2, ChevronDown, ChevronUp, Crown } from "lucide-react";
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
export default function BuilderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const resumeId = searchParams.get("id");
  const defaultTab = (searchParams.get("tab") as ActiveTab) || "edit";
  const { resumes, updateResume, setActiveResume, plan, canUseAI, incrementAI } = useResumeStore();
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>(defaultTab);
  const [isSaving, setIsSaving] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const isPremium = plan === "premium";
  useEffect(() => {
    if (resumeId) {
      const found = resumes.find((r) => r.id === resumeId);
      if (found) { setResume(found); setActiveResume(found.id); }
      else router.push("/dashboard");
    } else if (resumes.length > 0) {
      setResume(resumes[0]); setActiveResume(resumes[0].id);
    } else { router.push("/dashboard"); }
  }, [resumeId]);
  function handleChange(updated: Partial<ResumeData>) {
    if (!resume) return;
    setResume({ ...resume, ...updated });
    setHasUnsaved(true);
  }
  function handleSave() {
    if (!resume) return;
    setIsSaving(true);
    updateResume(resume.id, resume);
    setTimeout(() => { setIsSaving(false); setHasUnsaved(false); }, 600);
  }
  const TABS: { id: ActiveTab; label: string; premium?: boolean }[] = [
    { id: "edit", label: "Edit" },
    { id: "preview", label: "Preview" },
    { id: "tailor", label: "AI Tailor", premium: !isPremium },
    { id: "interview", label: "Interview Prep", premium: !isPremium },
  ];
  if (!resume) return (
    <div className="min-h-screen bg-surface-50"><AppNav />
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-forge-500 animate-spin" />
      </div>
    </div>
  );
  return (
    <div className="min-h-screen bg-surface-50">
      <AppNav />
      <div className="bg-white border-b border-surface-200 sticky top-14 z-40">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between gap-4">
          <input value={resume.name} onChange={(e) => handleChange({ name: e.target.value })}
            className="font-medium text-sm text-surface-800 bg-transparent border-0 outline-none w-40 sm:w-56 truncate"
            placeholder="Resume name..." />
          <div className="hidden sm:flex items-center gap-0.5 bg-surface-100 p-0.5 rounded-lg">
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={cn("flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition-all",
                  activeTab === tab.id ? "bg-white text-surface-900 shadow-sm" : "text-surface-600 hover:text-surface-900")}>
                {tab.label}{tab.premium && <Crown className="w-3 h-3 text-yellow-500" />}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowTemplates(!showTemplates)}
              className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-surface-600 hover:text-surface-900 px-2.5 py-1.5 rounded-lg hover:bg-surface-100 transition-all">
              Template{showTemplates ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            <button onClick={handleSave} disabled={isSaving}
              className={cn("flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all",
                hasUnsaved ? "bg-forge-600 text-white" : "bg-surface-100 text-surface-600")}>
              {isSaving ? <><Loader2 className="w-3 h-3 animate-spin" />Saving…</> : <>{hasUnsaved ? "Save*" : "Saved"}</>}
            </button>
            <button onClick={() => window.print()}
              className="flex items-center gap-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition-all">
              <Download className="w-3 h-3" />Export PDF
            </button>
          </div>
        </div>
        {showTemplates && (
          <div className="border-t border-surface-100 bg-surface-50 px-4 py-4">
            <TemplateSelector selected={resume.templateId} isPremium={isPremium}
              onSelect={(id) => { handleChange({ templateId: id }); setShowTemplates(false); }} />
          </div>
        )}
      </div>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === "edit" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <ResumeForm resume={resume} onChange={handleChange} isPremium={isPremium} canUseAI={canUseAI} onAIUsed={incrementAI} />
            <div className="hidden lg:block"><div className="sticky top-28"><ResumePreview resume={resume} /></div></div>
          </div>
        )}
        {activeTab === "preview" && <div className="max-w-3xl mx-auto"><ResumePreview resume={resume} showActions /></div>}
        {activeTab === "tailor" && (isPremium
          ? <TailorModal resume={resume} inline onApply={(u) => { handleChange(u); setActiveTab("preview"); }} />
          : <PremiumGate feature="Job-Tailoring Engine" />)}
        {activeTab === "interview" && (isPremium
          ? <InterviewPrepModal resume={resume} inline />
          : <PremiumGate feature="Interview Prep" />)}
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
      <p className="text-surface-500 max-w-sm mb-6">Upgrade to Premium to unlock this feature.</p>
      <button className="btn-forge px-8 py-3">Upgrade to Premium</button>
    </div>
  );
}
