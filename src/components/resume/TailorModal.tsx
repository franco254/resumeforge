"use client";

import { useState } from "react";
import {
  Target, Loader2, Sparkles, CheckCircle, AlertCircle,
  ChevronRight, Download, RefreshCw
} from "lucide-react";
import type { ResumeData, TailoringResult } from "@/types";
import { cn } from "@/lib/utils";

interface TailorModalProps {
  resume: ResumeData;
  inline?: boolean;
  onApply: (updated: Partial<ResumeData>) => void;
}

type TailorStep = "input" | "loading" | "result";

export function TailorModal({ resume, inline, onApply }: TailorModalProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [step, setStep] = useState<TailorStep>("input");
  const [result, setResult] = useState<TailoringResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMsg, setLoadingMsg] = useState("");

  const LOADING_MESSAGES = [
    "Analyzing job requirements…",
    "Identifying key skills and keywords…",
    "Rewriting your experience bullets…",
    "Optimizing for ATS systems…",
    "Matching your achievements to the role…",
    "Polishing the final resume…",
  ];

  async function handleTailor() {
    if (!jobDescription.trim()) return;
    setStep("loading");
    setError(null);

    // Cycle loading messages
    let msgIdx = 0;
    setLoadingMsg(LOADING_MESSAGES[0]);
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[msgIdx]);
    }, 2500);

    try {
      const res = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jobDescription, jobTitle, company }),
      });

      clearInterval(interval);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Tailoring failed");
      }

      const data: TailoringResult = await res.json();
      setResult(data);
      setStep("result");
    } catch (err: any) {
      clearInterval(interval);
      setError(err.message || "Something went wrong. Please try again.");
      setStep("input");
    }
  }

  function handleApply() {
    if (!result) return;
    onApply({
      experience: result.tailoredResume.experience,
      personalInfo: result.tailoredResume.personalInfo,
      skills: result.tailoredResume.skills,
    });
  }

  return (
    <div className={cn("max-w-3xl mx-auto", inline ? "" : "")}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
          <Target className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h2 className="font-display font-bold text-xl text-surface-900">AI Job-Tailoring Engine</h2>
          <p className="text-sm text-surface-500">Paste a job description — AI rewrites your resume to match it perfectly</p>
        </div>
      </div>

      {/* Step: Input */}
      {step === "input" && (
        <div className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 
                            text-sm px-4 py-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-surface-600 mb-1">Job Title</label>
              <input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Senior Software Engineer"
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none 
                           focus:ring-2 focus:ring-forge-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-600 mb-1">Company (optional)</label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Google, Stripe, etc."
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none 
                           focus:ring-2 focus:ring-forge-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-600 mb-1">
              Job Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here. The more detail you provide, the better the tailoring will be...

Example:
We are looking for a Senior Software Engineer to join our platform team. You will:
- Design and build scalable backend services using Go and Python
- Lead technical discussions and mentor junior engineers
- Work closely with product to define technical roadmap...

Requirements:
- 5+ years of software engineering experience
- Strong knowledge of distributed systems
- Experience with AWS, Docker, Kubernetes..."
              rows={14}
              className="w-full px-3 py-2 text-sm border border-surface-200 rounded-xl focus:outline-none 
                         focus:ring-2 focus:ring-forge-500 resize-y"
            />
            <p className="text-xs text-surface-400 mt-1">
              {jobDescription.length} characters · Recommended: 300+ characters for best results
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800">
            <p className="font-semibold mb-1">✨ What the AI will do:</p>
            <ul className="space-y-0.5 text-xs text-emerald-700">
              <li>• Rewrite your bullet points using keywords from the job description</li>
              <li>• Quantify achievements and amplify impact using action verbs</li>
              <li>• Reorder skills to match the role's priorities</li>
              <li>• Update your summary to speak directly to this position</li>
              <li>• Flag any missing qualifications you might want to address</li>
            </ul>
          </div>

          <button
            onClick={handleTailor}
            disabled={!jobDescription.trim()}
            className={cn(
              "w-full btn-forge py-3 justify-center text-base",
              !jobDescription.trim() && "opacity-50 cursor-not-allowed"
            )}
          >
            <Sparkles className="w-5 h-5" />
            Tailor My Resume with AI
          </button>
        </div>
      )}

      {/* Step: Loading */}
      {step === "loading" && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full border-4 border-forge-100 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-forge-500 animate-pulse" />
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-forge-500 animate-spin" />
          </div>
          <h3 className="font-display font-bold text-xl text-surface-900 mb-2">AI is tailoring your resume…</h3>
          <p className="text-surface-500 text-sm max-w-xs animate-pulse">{loadingMsg}</p>
          <div className="mt-8 flex gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-forge-300 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Step: Result */}
      {step === "result" && result && (
        <div className="space-y-5">
          {/* Match score */}
          <div className="bg-gradient-to-r from-emerald-50 to-forge-50 border border-emerald-200 
                          rounded-2xl p-5 flex items-center gap-5">
            <div className="relative w-20 h-20 shrink-0">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                <circle
                  cx="40" cy="40" r="34" fill="none"
                  stroke={result.matchScore >= 80 ? "#10b981" : result.matchScore >= 60 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${(result.matchScore / 100) * 213.6} 213.6`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display font-bold text-lg text-surface-900">{result.matchScore}%</span>
              </div>
            </div>
            <div>
              <div className="font-display font-bold text-xl text-surface-900 mb-1">
                {result.matchScore >= 80 ? "Excellent match!" : result.matchScore >= 60 ? "Good match" : "Needs work"}
              </div>
              <p className="text-sm text-surface-600">
                Your resume now matches {result.matchScore}% of the job requirements.
              </p>
            </div>
          </div>

          {/* Keywords added */}
          {result.keywordsAdded.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm text-surface-800 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Keywords Added ({result.keywordsAdded.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.keywordsAdded.map((kw) => (
                  <span key={kw} className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium">
                    + {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing skills */}
          {result.missingSkills.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm text-surface-800 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                Missing Skills to Consider
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.missingSkills.map((s) => (
                  <span key={s} className="bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs px-2.5 py-1 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Changes made */}
          {result.changes.length > 0 && (
            <div className="bg-white border border-surface-200 rounded-xl p-4">
              <h3 className="font-semibold text-sm text-surface-800 mb-3">Changes Made by AI</h3>
              <ul className="space-y-2">
                {result.changes.map((change, i) => (
                  <li key={i} className="flex gap-2 text-sm text-surface-700">
                    <ChevronRight className="w-4 h-4 text-forge-400 shrink-0 mt-0.5" />
                    {change}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => { setStep("input"); setResult(null); }}
              className="btn-forge-outline flex-1 justify-center"
            >
              <RefreshCw className="w-4 h-4" />
              Retailor
            </button>
            <button
              onClick={handleApply}
              className="btn-forge flex-1 justify-center"
            >
              <CheckCircle className="w-4 h-4" />
              Apply to My Resume
            </button>
          </div>

          <p className="text-xs text-center text-surface-400">
            Review the changes before applying. Original resume is preserved in your dashboard.
          </p>
        </div>
      )}
    </div>
  );
}
