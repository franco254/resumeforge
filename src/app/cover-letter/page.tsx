"use client";

import { useState } from "react";
import { Mail, Sparkles, Loader2, Copy, Check, RefreshCw, Download } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { useResumeStore } from "@/store/resumeStore";
import { cn } from "@/lib/utils";

export default function CoverLetterPage() {
  const { resumes, canUseAI, incrementAI } = useResumeStore();
  const [selectedResumeId, setSelectedResumeId] = useState(resumes[0]?.id || "");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState<"professional" | "enthusiastic" | "concise">("professional");
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedResume = resumes.find((r) => r.id === selectedResumeId);

  async function handleGenerate() {
    if (!selectedResume || !jobTitle || !company) return;
    if (!canUseAI()) {
      setError("Daily AI limit reached. Upgrade to Premium for unlimited use.");
      return;
    }
    setLoading(true);
    setError(null);
    incrementAI();
    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: selectedResume, jobTitle, company, jobDescription, tone }),
      });
      if (!res.ok) throw new Error("Failed to generate cover letter");
      const data = await res.json();
      setCoverLetter(data.coverLetter);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <AppNav />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
            <Mail className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-surface-900">Cover Letter Generator</h1>
            <p className="text-sm text-surface-500">AI crafts a tailored cover letter from your resume + job details</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Input */}
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Resume selector */}
            <div>
              <label className="block text-xs font-semibold text-surface-600 mb-1.5">
                Select Resume
              </label>
              {resumes.length === 0 ? (
                <div className="text-sm text-surface-500 bg-yellow-50 border border-yellow-200 
                                rounded-xl p-3">
                  No resumes found.{" "}
                  <a href="/builder" className="text-forge-600 font-medium hover:underline">
                    Create one first →
                  </a>
                </div>
              ) : (
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none 
                             focus:ring-2 focus:ring-forge-500 bg-white"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-surface-600 mb-1.5">
                  Job Title <span className="text-red-400">*</span>
                </label>
                <input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Product Manager"
                  className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none 
                             focus:ring-2 focus:ring-forge-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-surface-600 mb-1.5">
                  Company <span className="text-red-400">*</span>
                </label>
                <input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Stripe"
                  className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none 
                             focus:ring-2 focus:ring-forge-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-600 mb-1.5">
                Job Description (optional but recommended)
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={6}
                placeholder="Paste the job description here for a more targeted cover letter..."
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-xl focus:outline-none 
                           focus:ring-2 focus:ring-forge-500 resize-y"
              />
            </div>

            {/* Tone selector */}
            <div>
              <label className="block text-xs font-semibold text-surface-600 mb-1.5">Tone</label>
              <div className="flex gap-2">
                {(["professional", "enthusiastic", "concise"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-lg text-xs font-medium capitalize border transition-all",
                      tone === t
                        ? "bg-forge-600 text-white border-forge-600"
                        : "bg-white text-surface-600 border-surface-200 hover:border-forge-300"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !selectedResume || !jobTitle || !company}
              className={cn(
                "w-full btn-forge py-3 text-base justify-center",
                (loading || !selectedResume || !jobTitle || !company) && "opacity-50 cursor-not-allowed"
              )}
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Writing your cover letter…</>
              ) : (
                <><Sparkles className="w-5 h-5" /> Generate Cover Letter</>
              )}
            </button>
          </div>

          {/* Right: Output */}
          <div className="bg-white border border-surface-200 rounded-2xl shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
              <span className="text-xs font-semibold text-surface-600">
                {coverLetter ? `Cover Letter — ${company || "Company"}` : "Output"}
              </span>
              {coverLetter && (
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs text-surface-600 hover:text-surface-900 
                               px-2.5 py-1 rounded-lg hover:bg-surface-100 transition-all"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={() => { setCoverLetter(""); handleGenerate(); }}
                    className="flex items-center gap-1.5 text-xs text-surface-600 hover:text-surface-900 
                               px-2.5 py-1 rounded-lg hover:bg-surface-100 transition-all"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Regenerate
                  </button>
                </div>
              )}
            </div>

            <div className="p-5">
              {!coverLetter && !loading && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Mail className="w-12 h-12 text-surface-200 mb-4" />
                  <p className="text-sm text-surface-400">
                    Fill in the details on the left and click "Generate" to create your cover letter.
                  </p>
                </div>
              )}
              {loading && (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-3" />
                  <p className="text-sm text-surface-500 animate-pulse">Crafting your cover letter…</p>
                </div>
              )}
              {coverLetter && (
                <div className="prose prose-sm max-w-none">
                  <div className="text-sm text-surface-800 leading-relaxed whitespace-pre-wrap font-sans">
                    {coverLetter}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-purple-50 border border-purple-200 rounded-2xl p-5">
          <h3 className="font-semibold text-purple-900 text-sm mb-2">💡 Cover Letter Tips</h3>
          <ul className="space-y-1 text-xs text-purple-700">
            <li>• Personalize the opening — mention a specific thing you admire about the company</li>
            <li>• Keep it to one page (3–4 paragraphs max)</li>
            <li>• Mirror the language and keywords from the job description</li>
            <li>• End with a clear, confident call-to-action</li>
            <li>• Always address it to a specific person if you can find their name</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
