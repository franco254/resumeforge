"use client";

import { useState } from "react";
import { MessageSquare, Loader2, ChevronDown, ChevronUp, Lightbulb, Sparkles } from "lucide-react";
import type { ResumeData, InterviewQuestion } from "@/types";
import { cn } from "@/lib/utils";

const CATEGORY_COLORS: Record<string, string> = {
  behavioral:     "bg-blue-100 text-blue-700",
  technical:      "bg-purple-100 text-purple-700",
  situational:    "bg-orange-100 text-orange-700",
  "role-specific": "bg-emerald-100 text-emerald-700",
};

interface InterviewPrepModalProps {
  resume: ResumeData;
  inline?: boolean;
}

export function InterviewPrepModal({ resume, inline }: InterviewPrepModalProps) {
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setQuestions([]);
    try {
      const res = await fetch("/api/interview-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jobTitle, company }),
      });
      if (!res.ok) throw new Error("Failed to generate questions");
      const data = await res.json();
      setQuestions(data.questions || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h2 className="font-display font-bold text-xl text-surface-900">Interview Question Prep</h2>
          <p className="text-sm text-surface-500">Get AI-generated questions tailored to your resume and target role</p>
        </div>
      </div>

      {/* Input */}
      {questions.length === 0 && (
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-surface-600 mb-1">Target Job Title</label>
              <input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Senior Product Manager"
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none 
                           focus:ring-2 focus:ring-forge-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-600 mb-1">Company (optional)</label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Meta, Stripe, startup..."
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none 
                           focus:ring-2 focus:ring-forge-500"
              />
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-800">
            <p className="font-semibold mb-1">💡 What you'll get:</p>
            <ul className="space-y-0.5 text-xs text-orange-700">
              <li>• Behavioral questions based on your specific experience</li>
              <li>• Technical questions for your skills and tech stack</li>
              <li>• Role-specific questions for your target position</li>
              <li>• Guidance tips and sample answer frameworks (STAR method)</li>
            </ul>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full btn-forge py-3 justify-center text-base"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Generating questions…</>
            ) : (
              <><Sparkles className="w-5 h-5" /> Generate My Interview Questions</>
            )}
          </button>
        </div>
      )}

      {/* Questions list */}
      {questions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-surface-700">
              {questions.length} questions generated
            </p>
            <button
              onClick={() => { setQuestions([]); setOpenIdx(null); }}
              className="text-xs text-forge-600 hover:text-forge-700 font-medium"
            >
              ↩ Regenerate
            </button>
          </div>

          {questions.map((q, i) => (
            <div
              key={i}
              className="bg-white border border-surface-200 rounded-xl overflow-hidden shadow-card"
            >
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-surface-50 transition-colors"
              >
                <span className="text-xs font-bold text-surface-400 mt-0.5 shrink-0">Q{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium capitalize",
                      CATEGORY_COLORS[q.category] || "bg-surface-100 text-surface-600")}>
                      {q.category.replace("-", " ")}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-surface-900">{q.question}</p>
                </div>
                {openIdx === i
                  ? <ChevronUp className="w-4 h-4 text-surface-400 shrink-0 mt-0.5" />
                  : <ChevronDown className="w-4 h-4 text-surface-400 shrink-0 mt-0.5" />
                }
              </button>

              {openIdx === i && (
                <div className="border-t border-surface-100 px-5 py-4 space-y-3">
                  <div className="flex items-start gap-2 bg-blue-50 rounded-lg px-3 py-2">
                    <Lightbulb className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 leading-relaxed">{q.tip}</p>
                  </div>
                  {q.sampleAnswer && (
                    <div>
                      <p className="text-xs font-semibold text-surface-600 mb-1">Sample Answer Framework:</p>
                      <p className="text-xs text-surface-700 leading-relaxed bg-surface-50 rounded-lg px-3 py-2">
                        {q.sampleAnswer}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          <div className="text-center pt-2">
            <p className="text-xs text-surface-400">
              Practice each answer out loud. Aim for 1–2 minutes per response using the STAR method.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
