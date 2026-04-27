"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload, Sparkles, FileText, TrendingUp, Loader2, AlertCircle,
  CheckCircle, XCircle, ChevronRight, Wand2, RefreshCw
} from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { useResumeStore } from "@/store/resumeStore";
import { cn, getScoreColor, getScoreBg } from "@/lib/utils";
import type { ResumeAnalysis, SectionSuggestion } from "@/types";

type Step = "upload" | "loading" | "result";

const ATS_COLORS: Record<string, string> = {
  poor:      "text-red-500",
  fair:      "text-yellow-500",
  good:      "text-blue-500",
  excellent: "text-emerald-500",
};

export default function AnalyzePage() {
  const { canUseAI, incrementAI } = useResumeStore();
  const [resumeText, setResumeText] = useState("");
  const [step, setStep] = useState<Step>("upload");
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputMethod, setInputMethod] = useState<"paste" | "upload">("paste");
  const [rewritingIdx, setRewritingIdx] = useState<number | null>(null);
  const [rewrittenSuggestions, setRewrittenSuggestions] = useState<Record<number, string>>({});

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setResumeText(e.target?.result as string || "");
    };
    reader.readAsText(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/plain": [".txt"], "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  async function handleAnalyze() {
    if (!resumeText.trim()) return;
    if (!canUseAI()) {
      setError("Daily AI limit reached. Upgrade to Premium for unlimited analysis.");
      return;
    }
    setStep("loading");
    setError(null);
    incrementAI();

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Analysis failed");
      }
      const data: ResumeAnalysis = await res.json();
      setAnalysis(data);
      setStep("result");
    } catch (err: any) {
      setError(err.message || "Analysis failed. Please try again.");
      setStep("upload");
    }
  }

  async function handleRewriteSuggestion(idx: number, suggestion: SectionSuggestion) {
    setRewritingIdx(idx);
    try {
      const res = await fetch("/api/rewrite-bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bullet: suggestion.original, context: suggestion.section }),
      });
      const data = await res.json();
      setRewrittenSuggestions((prev) => ({ ...prev, [idx]: data.rewritten }));
    } catch {
      // silent
    } finally {
      setRewritingIdx(null);
    }
  }

  const scoreBreakdownItems = analysis ? [
    { label: "Impact",        value: analysis.scoreBreakdown.impact },
    { label: "Clarity",       value: analysis.scoreBreakdown.clarity },
    { label: "Keywords",      value: analysis.scoreBreakdown.keywords },
    { label: "Formatting",    value: analysis.scoreBreakdown.formatting },
    { label: "Completeness",  value: analysis.scoreBreakdown.completeness },
  ] : [];

  return (
    <div className="min-h-screen bg-surface-50">
      <AppNav />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-surface-900">AI Resume Analyzer</h1>
            <p className="text-sm text-surface-500">Get an instant score and actionable improvements</p>
          </div>
        </div>

        {/* Upload / Input step */}
        {step === "upload" && (
          <div className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 
                              text-sm px-4 py-3 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Method selector */}
            <div className="flex gap-2 bg-surface-100 p-1 rounded-xl w-fit">
              {(["paste", "upload"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setInputMethod(m)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize",
                    inputMethod === m ? "bg-white text-surface-900 shadow-sm" : "text-surface-600"
                  )}
                >
                  {m === "paste" ? "Paste Text" : "Upload File"}
                </button>
              ))}
            </div>

            {inputMethod === "paste" ? (
              <div>
                <label className="block text-xs font-semibold text-surface-600 mb-1.5">
                  Paste your resume text
                </label>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  rows={18}
                  placeholder="Jane Smith
jane@email.com | (555) 000-0000 | San Francisco, CA | linkedin.com/in/janesmith

SUMMARY
Results-driven Software Engineer with 5+ years of experience building scalable web applications...

EXPERIENCE
Senior Software Engineer — Acme Corp (2022 – Present)
• Led migration of monolithic architecture to microservices, reducing deployment time by 40%
• Built real-time data pipeline processing 10M events/day using Kafka and Spark
..."
                  className="w-full px-4 py-3 text-sm border border-surface-200 rounded-xl focus:outline-none 
                             focus:ring-2 focus:ring-forge-500 resize-y bg-white font-mono"
                />
                <p className="text-xs text-surface-400 mt-1">{resumeText.length} characters</p>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all",
                  isDragActive
                    ? "border-forge-500 bg-forge-50"
                    : "border-surface-200 hover:border-forge-300 hover:bg-surface-50 bg-white"
                )}
              >
                <input {...getInputProps()} />
                <Upload className={cn("w-10 h-10 mx-auto mb-3", isDragActive ? "text-forge-500" : "text-surface-300")} />
                <p className="font-medium text-surface-700 mb-1">
                  {isDragActive ? "Drop your resume here" : "Drop your resume here"}
                </p>
                <p className="text-sm text-surface-500 mb-3">or click to browse · TXT, PDF supported</p>
                {resumeText && (
                  <div className="flex items-center justify-center gap-2 text-emerald-600 text-sm font-medium">
                    <CheckCircle className="w-4 h-4" />
                    File loaded ({resumeText.length} characters)
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={!resumeText.trim()}
              className={cn(
                "w-full btn-forge py-3 text-base justify-center",
                !resumeText.trim() && "opacity-50 cursor-not-allowed"
              )}
            >
              <Sparkles className="w-5 h-5" />
              Analyze My Resume
            </button>
          </div>
        )}

        {/* Loading */}
        {step === "loading" && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full border-4 border-blue-100 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-blue-500 animate-pulse" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />
            </div>
            <h3 className="font-display font-bold text-xl text-surface-900 mb-2">Analyzing your resume…</h3>
            <p className="text-surface-500 text-sm">Evaluating impact, clarity, ATS compatibility, and more</p>
          </div>
        )}

        {/* Results */}
        {step === "result" && analysis && (
          <div className="space-y-6 animate-fade-in">
            {/* Overall score */}
            <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-card flex flex-col sm:flex-row items-center gap-6">
              {/* Score ring */}
              <div className="relative w-28 h-28 shrink-0">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112">
                  <circle cx="56" cy="56" r="46" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                  <circle
                    cx="56" cy="56" r="46" fill="none"
                    stroke={analysis.overallScore >= 80 ? "#10b981" : analysis.overallScore >= 60 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={`${(analysis.overallScore / 100) * 289} 289`}
                    className="score-ring"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={cn("font-display font-bold text-3xl", getScoreColor(analysis.overallScore))}>
                    {analysis.overallScore}
                  </span>
                  <span className="text-xs text-surface-400">/100</span>
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h2 className="font-display font-bold text-2xl text-surface-900 mb-1">
                  {analysis.overallScore >= 80 ? "Strong Resume! 🎉" :
                   analysis.overallScore >= 60 ? "Good Foundation 👍" : "Needs Improvement ⚡"}
                </h2>
                <div className="flex items-center gap-2 justify-center sm:justify-start mb-3">
                  <span className="text-sm text-surface-600">ATS Compatibility:</span>
                  <span className={cn("text-sm font-bold capitalize", ATS_COLORS[analysis.atsCompatibility])}>
                    {analysis.atsCompatibility}
                  </span>
                </div>
                {/* Breakdown bars */}
                <div className="space-y-2">
                  {scoreBreakdownItems.map(({ label, value }) => (
                    <div key={label} className="flex items-center gap-3">
                      <span className="text-xs text-surface-500 w-24 shrink-0">{label}</span>
                      <div className="flex-1 h-1.5 bg-surface-100 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all duration-700", getScoreBg(value))}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-surface-600 w-8 text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white border border-surface-200 rounded-2xl p-5 shadow-card">
                <h3 className="font-semibold text-surface-800 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Strengths
                </h3>
                <ul className="space-y-2">
                  {analysis.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-surface-700 flex gap-2">
                      <span className="text-emerald-400 shrink-0">✓</span>{s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white border border-surface-200 rounded-2xl p-5 shadow-card">
                <h3 className="font-semibold text-surface-800 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  Improvements Needed
                </h3>
                <ul className="space-y-2">
                  {analysis.improvements.map((s, i) => (
                    <li key={i} className="text-sm text-surface-700 flex gap-2">
                      <span className="text-yellow-400 shrink-0">→</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Missing keywords */}
            {analysis.missingKeywords.length > 0 && (
              <div className="bg-white border border-surface-200 rounded-2xl p-5 shadow-card">
                <h3 className="font-semibold text-surface-800 mb-3 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-400" />
                  Missing Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingKeywords.map((kw) => (
                    <span key={kw} className="text-xs bg-red-50 text-red-600 border border-red-200 
                                               px-2.5 py-1 rounded-full">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* AI Suggestions */}
            {analysis.suggestions.length > 0 && (
              <div className="bg-white border border-surface-200 rounded-2xl p-5 shadow-card">
                <h3 className="font-semibold text-surface-800 mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-forge-500" />
                  AI Rewrite Suggestions
                </h3>
                <div className="space-y-4">
                  {analysis.suggestions.map((suggestion, idx) => (
                    <div key={idx} className="border border-surface-100 rounded-xl p-4 bg-surface-50">
                      <div className="text-xs font-bold text-surface-400 uppercase tracking-wide mb-2">
                        {suggestion.section}
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-medium text-surface-500 mb-1">Original</p>
                          <p className="text-sm text-surface-700 leading-relaxed bg-white border border-surface-200 
                                       rounded-lg px-3 py-2">
                            {suggestion.original}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-emerald-600 mb-1">Improved</p>
                          <p className="text-sm text-surface-700 leading-relaxed bg-emerald-50 border border-emerald-200 
                                       rounded-lg px-3 py-2">
                            {rewrittenSuggestions[idx] || suggestion.improved}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-surface-500 italic">{suggestion.explanation}</p>
                        <button
                          onClick={() => handleRewriteSuggestion(idx, suggestion)}
                          disabled={rewritingIdx === idx}
                          className="flex items-center gap-1.5 text-xs text-forge-600 font-medium 
                                     hover:text-forge-700 disabled:opacity-50"
                        >
                          {rewritingIdx === idx
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <Wand2 className="w-3 h-3" />
                          }
                          Rewrite Again
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => { setStep("upload"); setAnalysis(null); setResumeText(""); }}
                className="btn-forge-outline flex-1 justify-center"
              >
                <RefreshCw className="w-4 h-4" />
                Analyze Another Resume
              </button>
              <a href="/builder" className="btn-forge flex-1 justify-center">
                <Sparkles className="w-4 h-4" />
                Build a Better Resume
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
