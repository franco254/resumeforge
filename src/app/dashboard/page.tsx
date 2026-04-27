"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus, FileText, Upload, Sparkles, Target, Mail, Crown,
  Trash2, Copy, Clock, ChevronRight, Zap, TrendingUp,
  MessageSquare, MoreVertical
} from "lucide-react";
import { useResumeStore } from "@/store/resumeStore";
import { AppNav } from "@/components/AppNav";
import { cn, formatDate } from "@/lib/utils";
import type { ResumeData } from "@/types";

const TEMPLATE_COLORS: Record<string, string> = {
  classic:   "bg-slate-600",
  modern:    "bg-forge-600",
  creative:  "bg-purple-600",
  executive: "bg-zinc-800",
  minimal:   "bg-emerald-600",
};

export default function Dashboard() {
  const router = useRouter();
  const {
    resumes, plan, createResume, deleteResume, duplicateResume,
    setActiveResume, canCreateResume, aiRequestsToday
  } = useResumeStore();

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const isPremium = plan === "premium";
  const MAX_FREE = 2;

  function handleCreate() {
    if (!canCreateResume()) return;
    setIsCreating(true);
    const resume = createResume("modern");
    router.push(`/builder?id=${resume.id}`);
  }

  function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (confirm("Delete this resume? This cannot be undone.")) {
      deleteResume(id);
    }
    setOpenMenuId(null);
  }

  function handleDuplicate(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    const dup = duplicateResume(id);
    if (dup) {
      setActiveResume(dup.id);
    }
    setOpenMenuId(null);
  }

  function handleOpenResume(resume: ResumeData) {
    setActiveResume(resume.id);
    router.push(`/builder?id=${resume.id}`);
  }

  const QUICK_ACTIONS = [
    {
      icon: TrendingUp,
      label: "Analyze Resume",
      desc: "Get AI score & improvements",
      href: "/analyze",
      color: "text-blue-500",
      bg: "bg-blue-50 hover:bg-blue-100",
    },
    {
      icon: Target,
      label: "Tailor for Job",
      desc: "Match resume to job description",
      href: isPremium ? "/builder?tab=tailor" : "#",
      color: "text-emerald-500",
      bg: "bg-emerald-50 hover:bg-emerald-100",
      premium: !isPremium,
    },
    {
      icon: Mail,
      label: "Cover Letter",
      desc: "Auto-generate cover letter",
      href: "/cover-letter",
      color: "text-purple-500",
      bg: "bg-purple-50 hover:bg-purple-100",
    },
    {
      icon: MessageSquare,
      label: "Interview Prep",
      desc: "Practice questions for your role",
      href: isPremium ? "/builder?tab=interview" : "#",
      color: "text-orange-500",
      bg: "bg-orange-50 hover:bg-orange-100",
      premium: !isPremium,
    },
  ];

  return (
    <div className="min-h-screen bg-surface-50">
      <AppNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl text-surface-900">Dashboard</h1>
            <p className="text-surface-500 mt-1">
              {resumes.length === 0
                ? "Create your first resume to get started"
                : `${resumes.length} resume${resumes.length > 1 ? "s" : ""} · ${
                    isPremium ? "Premium" : `${MAX_FREE - resumes.length} free slot${MAX_FREE - resumes.length !== 1 ? "s" : ""} remaining`
                  }`}
            </p>
          </div>
          <button
            onClick={handleCreate}
            disabled={!canCreateResume() || isCreating}
            className={cn(
              "btn-forge shadow-forge",
              !canCreateResume() && "opacity-50 cursor-not-allowed"
            )}
          >
            <Plus className="w-4 h-4" />
            {isCreating ? "Creating..." : "New Resume"}
          </button>
        </div>

        {/* Free plan limit warning */}
        {!isPremium && resumes.length >= MAX_FREE && (
          <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 
                          rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-yellow-600 shrink-0" />
              <div>
                <div className="font-semibold text-yellow-900 text-sm">Free limit reached</div>
                <div className="text-yellow-700 text-xs">Upgrade to create unlimited resumes and unlock AI tailoring</div>
              </div>
            </div>
            <Link href="#" className="shrink-0 bg-gradient-to-r from-yellow-500 to-orange-500 text-white 
                                       text-xs font-bold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity">
              Upgrade →
            </Link>
          </div>
        )}

        {/* AI usage bar (free users) */}
        {!isPremium && (
          <div className="mb-6 bg-white border border-surface-200 rounded-xl p-4 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm text-surface-700">
                <Sparkles className="w-4 h-4 text-forge-500" />
                <span className="font-medium">AI requests today</span>
              </div>
              <span className="text-sm text-surface-500">
                {aiRequestsToday}/5
              </span>
            </div>
            <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-forge-500 to-emerald-500 rounded-full transition-all"
                style={{ width: `${Math.min((aiRequestsToday / 5) * 100, 100)}%` }}
              />
            </div>
            {aiRequestsToday >= 5 && (
              <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Daily limit reached. Upgrade for unlimited AI.
              </p>
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Resumes section */}
          <div className="lg:col-span-2">
            <h2 className="font-display font-semibold text-lg text-surface-800 mb-4">My Resumes</h2>

            {resumes.length === 0 ? (
              /* Empty state */
              <div className="bg-white border-2 border-dashed border-surface-200 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-forge-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-forge-500" />
                </div>
                <h3 className="font-display font-semibold text-xl text-surface-800 mb-2">No resumes yet</h3>
                <p className="text-surface-500 text-sm mb-6">
                  Create your first resume from scratch or upload an existing one.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={handleCreate} className="btn-forge">
                    <Plus className="w-4 h-4" />
                    Create from Scratch
                  </button>
                  <Link href="/analyze" className="btn-forge-outline">
                    <Upload className="w-4 h-4" />
                    Upload & Analyze
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {resumes.map((resume) => (
                  <div
                    key={resume.id}
                    onClick={() => handleOpenResume(resume)}
                    className="bg-white border border-surface-200 rounded-xl p-4 cursor-pointer 
                               card-hover flex items-center gap-4 shadow-card"
                  >
                    {/* Template color badge */}
                    <div className={cn(
                      "w-12 h-14 rounded-lg flex items-center justify-center shrink-0",
                      TEMPLATE_COLORS[resume.templateId] || "bg-forge-600"
                    )}>
                      <FileText className="w-6 h-6 text-white/80" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-surface-900 truncate">{resume.name}</div>
                      <div className="text-sm text-surface-500 truncate">
                        {resume.personalInfo?.fullName || "No name set"} · {resume.templateId} template
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-surface-400">
                        <Clock className="w-3 h-3" />
                        Updated {formatDate(resume.updatedAt.slice(0, 7))}
                      </div>
                    </div>

                    {/* Actions menu */}
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setOpenMenuId(openMenuId === resume.id ? null : resume.id)}
                        className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-surface-400" />
                      </button>
                      {openMenuId === resume.id && (
                        <div className="absolute right-0 top-8 w-44 bg-white border border-surface-200 
                                        rounded-xl shadow-card-hover z-10 overflow-hidden">
                          <button
                            onClick={(e) => handleDuplicate(resume.id, e)}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm 
                                       text-surface-700 hover:bg-surface-50 transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            Duplicate
                          </button>
                          <button
                            onClick={(e) => handleDelete(resume.id, e)}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm 
                                       text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    <ChevronRight className="w-4 h-4 text-surface-300 shrink-0" />
                  </div>
                ))}

                {/* Add new card */}
                {canCreateResume() && (
                  <button
                    onClick={handleCreate}
                    disabled={isCreating}
                    className="w-full bg-white border-2 border-dashed border-surface-200 rounded-xl p-4 
                               flex items-center gap-3 text-surface-500 hover:border-forge-300 
                               hover:text-forge-600 hover:bg-forge-50 transition-all"
                  >
                    <div className="w-12 h-14 rounded-lg bg-surface-100 flex items-center justify-center">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-sm">Add another resume</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions sidebar */}
          <div>
            <h2 className="font-display font-semibold text-lg text-surface-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border border-surface-200 bg-white",
                    "transition-all card-hover shadow-card",
                    action.premium && "opacity-75"
                  )}
                >
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", action.bg)}>
                    <action.icon className={cn("w-5 h-5", action.color)} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-surface-900">{action.label}</span>
                      {action.premium && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 font-bold px-1.5 py-0.5 rounded-full">
                          PRO
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-surface-500">{action.desc}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-surface-300" />
                </Link>
              ))}
            </div>

            {/* Upgrade card */}
            {!isPremium && (
              <div className="mt-6 bg-gradient-to-br from-forge-600 to-forge-800 rounded-2xl p-6 text-white">
                <Crown className="w-8 h-8 text-yellow-400 mb-3" />
                <h3 className="font-display font-bold text-lg mb-1">Go Premium</h3>
                <p className="text-forge-200 text-sm mb-4">
                  Unlock job tailoring, unlimited AI, and all templates for $12/mo.
                </p>
                <button className="w-full bg-white text-forge-700 font-bold text-sm py-2.5 rounded-xl 
                                   hover:bg-forge-50 transition-colors justify-center flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  Upgrade Now
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
