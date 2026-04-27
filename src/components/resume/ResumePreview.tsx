"use client";

import { useRef } from "react";
import { Download, Printer } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import type { ResumeData } from "@/types";

interface ResumePreviewProps {
  resume: ResumeData;
  showActions?: boolean;
}

export function ResumePreview({ resume, showActions }: ResumePreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    window.print();
  }

  return (
    <div>
      {showActions && (
        <div className="flex justify-end gap-2 mb-4 no-print">
          <button onClick={handlePrint} className="btn-forge-outline">
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </button>
          <button onClick={handlePrint} className="btn-forge">
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      )}

      <div ref={printRef} className="resume-preview">
        {resume.templateId === "classic"   && <ClassicTemplate   resume={resume} />}
        {resume.templateId === "modern"    && <ModernTemplate    resume={resume} />}
        {resume.templateId === "creative"  && <CreativeTemplate  resume={resume} />}
        {resume.templateId === "executive" && <ExecutiveTemplate resume={resume} />}
        {resume.templateId === "minimal"   && <MinimalTemplate   resume={resume} />}
      </div>
    </div>
  );
}

// ── Shared section title component ───────────────────────────

function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn("text-xs font-bold uppercase tracking-[0.15em] mb-2", className)}>
      {children}
    </h2>
  );
}

// ═══════════════════════════════════════════════════════════
// TEMPLATE 1: MODERN (default)
// Clean two-column layout with blue accent
// ═══════════════════════════════════════════════════════════
function ModernTemplate({ resume }: { resume: ResumeData }) {
  const { personalInfo: pi, experience, education, skills, projects, certifications } = resume;

  return (
    <div className="bg-white shadow-lg font-sans text-[13px] leading-[1.5] w-full max-w-[794px] mx-auto"
         style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div className="bg-forge-700 text-white px-8 py-6">
        <div className="text-2xl font-bold tracking-tight">{pi.fullName || "Your Name"}</div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-forge-200 text-xs">
          {pi.email    && <span>{pi.email}</span>}
          {pi.phone    && <span>{pi.phone}</span>}
          {pi.location && <span>{pi.location}</span>}
          {pi.linkedin && <span>{pi.linkedin.replace("https://", "")}</span>}
          {pi.github   && <span>{pi.github.replace("https://", "")}</span>}
          {pi.website  && <span>{pi.website}</span>}
        </div>
      </div>

      <div className="flex">
        {/* Left column */}
        <div className="w-1/3 bg-forge-50 px-5 py-5 space-y-5 border-r border-forge-100">
          {skills.length > 0 && (
            <div>
              <SectionTitle className="text-forge-700">Skills</SectionTitle>
              <div className="space-y-1">
                {skills.map((s) => (
                  <div key={s.id} className="text-xs text-surface-700 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-forge-400 shrink-0" />
                    {s.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {education.length > 0 && (
            <div>
              <SectionTitle className="text-forge-700">Education</SectionTitle>
              {education.map((edu) => (
                <div key={edu.id} className="mb-3">
                  <div className="font-semibold text-xs">{edu.degree} {edu.field && `in ${edu.field}`}</div>
                  <div className="text-surface-600 text-xs">{edu.institution}</div>
                  <div className="text-surface-400 text-xs">{formatDate(edu.startDate)} – {edu.endDate === "Present" ? "Present" : formatDate(edu.endDate)}</div>
                  {edu.gpa && <div className="text-xs text-surface-500">GPA: {edu.gpa}</div>}
                </div>
              ))}
            </div>
          )}

          {certifications.length > 0 && (
            <div>
              <SectionTitle className="text-forge-700">Certifications</SectionTitle>
              {certifications.map((c) => (
                <div key={c.id} className="mb-2">
                  <div className="font-semibold text-xs">{c.name}</div>
                  <div className="text-surface-500 text-xs">{c.issuer} · {formatDate(c.date)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="flex-1 px-6 py-5 space-y-5">
          {pi.summary && (
            <div>
              <SectionTitle className="text-forge-700 border-b border-forge-200 pb-1">Summary</SectionTitle>
              <p className="text-surface-700 text-xs leading-relaxed">{pi.summary}</p>
            </div>
          )}

          {experience.length > 0 && (
            <div>
              <SectionTitle className="text-forge-700 border-b border-forge-200 pb-1">Experience</SectionTitle>
              <div className="space-y-4">
                {experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline">
                      <div className="font-bold text-surface-900">{exp.title}</div>
                      <div className="text-xs text-surface-500 shrink-0 ml-2">
                        {formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}
                      </div>
                    </div>
                    <div className="text-forge-600 text-xs font-semibold">{exp.company}{exp.location && ` · ${exp.location}`}</div>
                    <ul className="mt-1 space-y-0.5">
                      {exp.bullets.filter(Boolean).map((b, i) => (
                        <li key={i} className="flex gap-1.5 text-xs text-surface-700">
                          <span className="text-forge-400 shrink-0 mt-0.5">•</span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {projects.length > 0 && (
            <div>
              <SectionTitle className="text-forge-700 border-b border-forge-200 pb-1">Projects</SectionTitle>
              {projects.map((p) => (
                <div key={p.id} className="mb-3">
                  <div className="font-bold text-surface-900 text-xs">{p.name}
                    {p.technologies.length > 0 && (
                      <span className="ml-2 font-normal text-surface-500">· {p.technologies.join(", ")}</span>
                    )}
                  </div>
                  {p.description && <p className="text-xs text-surface-600">{p.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TEMPLATE 2: CLASSIC
// Traditional single-column with dividers
// ═══════════════════════════════════════════════════════════
function ClassicTemplate({ resume }: { resume: ResumeData }) {
  const { personalInfo: pi, experience, education, skills, projects, certifications } = resume;

  return (
    <div className="bg-white shadow-lg text-[12.5px] leading-[1.5] w-full max-w-[794px] mx-auto px-10 py-8"
         style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold tracking-wide text-surface-900">{pi.fullName || "Your Name"}</h1>
        <div className="flex justify-center flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-surface-600">
          {pi.email    && <span>{pi.email}</span>}
          {pi.phone    && <span>| {pi.phone}</span>}
          {pi.location && <span>| {pi.location}</span>}
          {pi.linkedin && <span>| {pi.linkedin.replace("https://", "")}</span>}
        </div>
      </div>

      {pi.summary && (
        <div className="mb-4">
          <div className="border-b-2 border-surface-800 mb-1.5">
            <h2 className="font-bold text-surface-900 text-xs uppercase tracking-widest mb-0.5">Professional Summary</h2>
          </div>
          <p className="text-xs text-surface-700 leading-relaxed">{pi.summary}</p>
        </div>
      )}

      {experience.length > 0 && (
        <div className="mb-4">
          <div className="border-b-2 border-surface-800 mb-2">
            <h2 className="font-bold text-surface-900 text-xs uppercase tracking-widest mb-0.5">Experience</h2>
          </div>
          {experience.map((exp) => (
            <div key={exp.id} className="mb-3">
              <div className="flex justify-between">
                <div className="font-bold text-surface-900">{exp.title}, {exp.company}</div>
                <div className="text-xs text-surface-500">
                  {formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}
                </div>
              </div>
              {exp.location && <div className="text-xs italic text-surface-600">{exp.location}</div>}
              <ul className="mt-1 list-disc list-inside space-y-0.5">
                {exp.bullets.filter(Boolean).map((b, i) => (
                  <li key={i} className="text-xs text-surface-700 ml-2">{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <div className="mb-4">
          <div className="border-b-2 border-surface-800 mb-2">
            <h2 className="font-bold text-surface-900 text-xs uppercase tracking-widest mb-0.5">Education</h2>
          </div>
          {education.map((edu) => (
            <div key={edu.id} className="flex justify-between mb-1.5">
              <div>
                <span className="font-bold">{edu.degree} {edu.field && `in ${edu.field}`}</span>
                <span className="text-surface-600">, {edu.institution}</span>
              </div>
              <div className="text-xs text-surface-500">
                {formatDate(edu.startDate)} – {edu.endDate === "Present" ? "Present" : formatDate(edu.endDate)}
              </div>
            </div>
          ))}
        </div>
      )}

      {skills.length > 0 && (
        <div className="mb-4">
          <div className="border-b-2 border-surface-800 mb-2">
            <h2 className="font-bold text-surface-900 text-xs uppercase tracking-widest mb-0.5">Skills</h2>
          </div>
          <p className="text-xs text-surface-700">{skills.map((s) => s.name).join(" · ")}</p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TEMPLATE 3: EXECUTIVE
// Dark header, conservative styling, premium feel
// ═══════════════════════════════════════════════════════════
function ExecutiveTemplate({ resume }: { resume: ResumeData }) {
  const { personalInfo: pi, experience, education, skills } = resume;

  return (
    <div className="bg-white shadow-lg text-[12.5px] leading-[1.5] w-full max-w-[794px] mx-auto"
         style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="bg-zinc-900 text-white px-8 py-7">
        <div className="text-3xl font-bold tracking-tight">{pi.fullName || "Your Name"}</div>
        {pi.summary && <p className="text-zinc-300 text-xs mt-2 max-w-xl leading-relaxed">{pi.summary}</p>}
        <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-zinc-400 text-xs">
          {pi.email && <span>{pi.email}</span>}
          {pi.phone && <span>{pi.phone}</span>}
          {pi.location && <span>{pi.location}</span>}
          {pi.linkedin && <span>{pi.linkedin.replace("https://", "")}</span>}
        </div>
      </div>
      <div className="px-8 py-6 space-y-5">
        {experience.length > 0 && (
          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-3">Professional Experience</h2>
            {experience.map((exp) => (
              <div key={exp.id} className="mb-4">
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="font-bold text-zinc-900">{exp.title}</span>
                  <span className="text-xs text-zinc-500">{formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}</span>
                </div>
                <div className="text-xs font-semibold text-zinc-600 mb-1.5">{exp.company}{exp.location && `, ${exp.location}`}</div>
                <ul className="space-y-0.5">
                  {exp.bullets.filter(Boolean).map((b, i) => (
                    <li key={i} className="flex gap-2 text-xs text-zinc-700">
                      <span className="text-zinc-400 shrink-0">▸</span>{b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {education.length > 0 && (
          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">Education</h2>
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between text-xs mb-1">
                <div><span className="font-semibold">{edu.degree} {edu.field && `in ${edu.field}`}</span> — {edu.institution}</div>
                <div className="text-zinc-500">{formatDate(edu.startDate)} – {formatDate(edu.endDate)}</div>
              </div>
            ))}
          </div>
        )}

        {skills.length > 0 && (
          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">Core Competencies</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <span key={s.id} className="text-xs bg-zinc-100 text-zinc-700 px-2.5 py-1 rounded-md font-medium">
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TEMPLATE 4: CREATIVE
// Purple accent, modern design, good for designers/creatives
// ═══════════════════════════════════════════════════════════
function CreativeTemplate({ resume }: { resume: ResumeData }) {
  const { personalInfo: pi, experience, education, skills, projects } = resume;
  return (
    <div className="bg-white shadow-lg text-[12.5px] leading-[1.5] w-full max-w-[794px] mx-auto"
         style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="flex">
        <div className="w-[220px] bg-purple-700 text-white px-5 py-7 shrink-0">
          <div className="text-xl font-bold leading-tight mb-1">{pi.fullName || "Your Name"}</div>
          <div className="space-y-0.5 text-purple-200 text-xs mb-5">
            {pi.email    && <div>{pi.email}</div>}
            {pi.phone    && <div>{pi.phone}</div>}
            {pi.location && <div>{pi.location}</div>}
            {pi.linkedin && <div>{pi.linkedin.replace("https://", "")}</div>}
          </div>
          {skills.length > 0 && (
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-purple-300 mb-2">Skills</div>
              <div className="space-y-1.5">
                {skills.map((s) => (
                  <div key={s.id}>
                    <div className="text-xs text-white mb-0.5">{s.name}</div>
                    <div className="h-1 bg-purple-900 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-300 rounded-full" style={{ width: "80%" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {education.length > 0 && (
            <div className="mt-5">
              <div className="text-xs font-bold uppercase tracking-widest text-purple-300 mb-2">Education</div>
              {education.map((edu) => (
                <div key={edu.id} className="mb-2">
                  <div className="text-xs font-semibold">{edu.degree}</div>
                  <div className="text-purple-300 text-xs">{edu.institution}</div>
                  <div className="text-purple-400 text-xs">{formatDate(edu.endDate)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 px-6 py-7 space-y-5">
          {pi.summary && (
            <div>
              <div className="h-0.5 bg-purple-100 mb-3 relative">
                <span className="absolute -top-2.5 bg-white pr-2 text-xs font-bold uppercase tracking-widest text-purple-600">
                  About
                </span>
              </div>
              <p className="text-xs text-surface-700 leading-relaxed">{pi.summary}</p>
            </div>
          )}
          {experience.length > 0 && (
            <div>
              <div className="h-0.5 bg-purple-100 mb-3 relative">
                <span className="absolute -top-2.5 bg-white pr-2 text-xs font-bold uppercase tracking-widest text-purple-600">
                  Experience
                </span>
              </div>
              {experience.map((exp) => (
                <div key={exp.id} className="mb-3.5">
                  <div className="flex justify-between items-baseline">
                    <div className="font-bold text-surface-900">{exp.title}</div>
                    <div className="text-xs text-surface-400">{formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}</div>
                  </div>
                  <div className="text-purple-600 text-xs font-semibold mb-1">{exp.company}</div>
                  <ul className="space-y-0.5">
                    {exp.bullets.filter(Boolean).map((b, i) => (
                      <li key={i} className="flex gap-1.5 text-xs text-surface-700">
                        <span className="text-purple-400 shrink-0">→</span>{b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
          {projects.length > 0 && (
            <div>
              <div className="h-0.5 bg-purple-100 mb-3 relative">
                <span className="absolute -top-2.5 bg-white pr-2 text-xs font-bold uppercase tracking-widest text-purple-600">
                  Projects
                </span>
              </div>
              {projects.map((p) => (
                <div key={p.id} className="mb-2">
                  <div className="font-semibold text-xs">{p.name} <span className="text-surface-400 font-normal">— {p.technologies.join(", ")}</span></div>
                  {p.description && <p className="text-xs text-surface-600">{p.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TEMPLATE 5: MINIMAL
// Ultra-clean, typography-focused, ATS-safe
// ═══════════════════════════════════════════════════════════
function MinimalTemplate({ resume }: { resume: ResumeData }) {
  const { personalInfo: pi, experience, education, skills } = resume;
  return (
    <div className="bg-white shadow-lg text-[12.5px] leading-relaxed w-full max-w-[794px] mx-auto px-10 py-8"
         style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="mb-5 pb-4 border-b border-surface-900">
        <h1 className="text-3xl font-light text-surface-900 tracking-wide">{pi.fullName || "Your Name"}</h1>
        <div className="flex flex-wrap gap-x-4 text-xs text-surface-500 mt-1">
          {pi.email && <span>{pi.email}</span>}
          {pi.phone && <span>{pi.phone}</span>}
          {pi.location && <span>{pi.location}</span>}
          {pi.linkedin && <span>{pi.linkedin.replace("https://", "")}</span>}
        </div>
      </div>
      {pi.summary && <p className="text-xs text-surface-600 mb-5 leading-relaxed">{pi.summary}</p>}
      {experience.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs uppercase tracking-[0.15em] text-surface-400 mb-3">Experience</h2>
          {experience.map((exp) => (
            <div key={exp.id} className="mb-4 pl-3 border-l border-surface-200">
              <div className="flex justify-between items-baseline">
                <span className="font-semibold">{exp.title}, {exp.company}</span>
                <span className="text-xs text-surface-400">{formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}</span>
              </div>
              <ul className="mt-1 space-y-0.5">
                {exp.bullets.filter(Boolean).map((b, i) => (
                  <li key={i} className="text-xs text-surface-600 flex gap-2">
                    <span>—</span>{b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      {education.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs uppercase tracking-[0.15em] text-surface-400 mb-3">Education</h2>
          {education.map((edu) => (
            <div key={edu.id} className="flex justify-between text-xs mb-1.5">
              <div><span className="font-semibold">{edu.degree} {edu.field && `in ${edu.field}`}</span>, {edu.institution}</div>
              <div className="text-surface-400">{formatDate(edu.endDate)}</div>
            </div>
          ))}
        </div>
      )}
      {skills.length > 0 && (
        <div>
          <h2 className="text-xs uppercase tracking-[0.15em] text-surface-400 mb-2">Skills</h2>
          <p className="text-xs text-surface-600">{skills.map((s) => s.name).join(", ")}</p>
        </div>
      )}
    </div>
  );
}
