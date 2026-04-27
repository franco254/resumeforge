"use client";

import { useState } from "react";
import {
  User, Briefcase, GraduationCap, Code, FolderOpen, Award,
  ChevronDown, ChevronUp, Plus, Trash2, Wand2, Loader2, Sparkles
} from "lucide-react";
import { cn, generateId } from "@/lib/utils";
import type { ResumeData, WorkExperience, Education, Skill, Project, Certification } from "@/types";

interface ResumeFormProps {
  resume: ResumeData;
  onChange: (data: Partial<ResumeData>) => void;
  isPremium: boolean;
  canUseAI: () => boolean;
  onAIUsed: () => void;
}

type SectionKey = "personal" | "experience" | "education" | "skills" | "projects" | "certifications";

const SECTIONS: { key: SectionKey; label: string; icon: React.ElementType }[] = [
  { key: "personal",       label: "Personal Info",    icon: User },
  { key: "experience",     label: "Experience",       icon: Briefcase },
  { key: "education",      label: "Education",        icon: GraduationCap },
  { key: "skills",         label: "Skills",           icon: Code },
  { key: "projects",       label: "Projects",         icon: FolderOpen },
  { key: "certifications", label: "Certifications",   icon: Award },
];

export function ResumeForm({ resume, onChange, isPremium, canUseAI, onAIUsed }: ResumeFormProps) {
  const [openSection, setOpenSection] = useState<SectionKey>("personal");
  const [rewritingBullet, setRewritingBullet] = useState<string | null>(null);

  const toggle = (key: SectionKey) => setOpenSection(openSection === key ? "personal" : key);

  // ── AI bullet rewrite ──────────────────────────────────────
  async function rewriteBullet(bullet: string, context: string): Promise<string> {
    if (!canUseAI()) {
      alert("Daily AI limit reached. Upgrade to Premium for unlimited AI.");
      return bullet;
    }
    setRewritingBullet(bullet);
    onAIUsed();
    try {
      const res = await fetch("/api/rewrite-bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bullet, context }),
      });
      const data = await res.json();
      return data.rewritten || bullet;
    } catch {
      return bullet;
    } finally {
      setRewritingBullet(null);
    }
  }

  // ── Personal Info ──────────────────────────────────────────
  const pi = resume.personalInfo;

  function InputField({ label, value, field, placeholder, type = "text" }: {
    label: string; value: string; field: string; placeholder?: string; type?: string
  }) {
    return (
      <div>
        <label className="block text-xs font-semibold text-surface-600 mb-1">{label}</label>
        <input
          type={type}
          value={value || ""}
          placeholder={placeholder}
          onChange={(e) => onChange({
            personalInfo: { ...pi, [field]: e.target.value }
          })}
          className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none 
                     focus:ring-2 focus:ring-forge-500 focus:border-transparent bg-white transition-shadow"
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {SECTIONS.map(({ key, label, icon: Icon }) => (
        <div key={key} className="bg-white border border-surface-200 rounded-xl overflow-hidden shadow-card">
          {/* Section header */}
          <button
            onClick={() => toggle(key)}
            className={cn(
              "w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors",
              openSection === key ? "bg-forge-50" : "hover:bg-surface-50"
            )}
          >
            <div className="flex items-center gap-3">
              <Icon className={cn("w-4 h-4", openSection === key ? "text-forge-600" : "text-surface-400")} />
              <span className={cn("font-semibold text-sm", openSection === key ? "text-forge-700" : "text-surface-700")}>
                {label}
              </span>
              {key === "experience" && resume.experience.length > 0 && (
                <span className="text-xs bg-forge-100 text-forge-700 px-2 py-0.5 rounded-full font-medium">
                  {resume.experience.length}
                </span>
              )}
            </div>
            {openSection === key
              ? <ChevronUp className="w-4 h-4 text-surface-400" />
              : <ChevronDown className="w-4 h-4 text-surface-400" />
            }
          </button>

          {/* Section content */}
          {openSection === key && (
            <div className="px-5 pb-5 pt-1 border-t border-surface-100">

              {/* ── Personal Info ── */}
              {key === "personal" && (
                <div className="space-y-3 mt-3">
                  <InputField label="Full Name" value={pi.fullName} field="fullName" placeholder="Jane Smith" />
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="Email" value={pi.email} field="email" placeholder="jane@email.com" type="email" />
                    <InputField label="Phone" value={pi.phone} field="phone" placeholder="+1 (555) 000-0000" />
                  </div>
                  <InputField label="Location" value={pi.location} field="location" placeholder="San Francisco, CA" />
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="LinkedIn URL" value={pi.linkedin || ""} field="linkedin" placeholder="linkedin.com/in/..." />
                    <InputField label="GitHub URL" value={pi.github || ""} field="github" placeholder="github.com/..." />
                  </div>
                  <InputField label="Website / Portfolio" value={pi.website || ""} field="website" placeholder="yoursite.com" />
                  <div>
                    <label className="block text-xs font-semibold text-surface-600 mb-1">Professional Summary</label>
                    <textarea
                      value={pi.summary}
                      placeholder="Results-driven software engineer with 5+ years building scalable web applications..."
                      onChange={(e) => onChange({ personalInfo: { ...pi, summary: e.target.value } })}
                      rows={4}
                      className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none 
                                 focus:ring-2 focus:ring-forge-500 focus:border-transparent bg-white resize-y transition-shadow"
                    />
                  </div>
                </div>
              )}

              {/* ── Experience ── */}
              {key === "experience" && (
                <div className="space-y-4 mt-3">
                  {resume.experience.map((exp, idx) => (
                    <ExperienceCard
                      key={exp.id}
                      exp={exp}
                      onUpdate={(updated) => {
                        const next = [...resume.experience];
                        next[idx] = updated;
                        onChange({ experience: next });
                      }}
                      onDelete={() => {
                        onChange({ experience: resume.experience.filter((_, i) => i !== idx) });
                      }}
                      rewritingBullet={rewritingBullet}
                      onRewriteBullet={(bullet) =>
                        rewriteBullet(bullet, `${exp.title} at ${exp.company}`)
                      }
                    />
                  ))}
                  <button
                    onClick={() => onChange({
                      experience: [...resume.experience, {
                        id: generateId(), company: "", title: "", location: "",
                        startDate: "", endDate: "", current: false, bullets: [""],
                      }],
                    })}
                    className="w-full py-2.5 border-2 border-dashed border-surface-200 rounded-xl text-sm 
                               text-surface-500 hover:border-forge-300 hover:text-forge-600 
                               hover:bg-forge-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Experience
                  </button>
                </div>
              )}

              {/* ── Education ── */}
              {key === "education" && (
                <div className="space-y-4 mt-3">
                  {resume.education.map((edu, idx) => (
                    <EducationCard
                      key={edu.id}
                      edu={edu}
                      onUpdate={(updated) => {
                        const next = [...resume.education];
                        next[idx] = updated;
                        onChange({ education: next });
                      }}
                      onDelete={() => onChange({ education: resume.education.filter((_, i) => i !== idx) })}
                    />
                  ))}
                  <button
                    onClick={() => onChange({
                      education: [...resume.education, {
                        id: generateId(), institution: "", degree: "", field: "",
                        location: "", startDate: "", endDate: "", gpa: "",
                      }],
                    })}
                    className="w-full py-2.5 border-2 border-dashed border-surface-200 rounded-xl text-sm 
                               text-surface-500 hover:border-forge-300 hover:text-forge-600 
                               hover:bg-forge-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Education
                  </button>
                </div>
              )}

              {/* ── Skills ── */}
              {key === "skills" && (
                <div className="mt-3">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {resume.skills.map((skill) => (
                      <div key={skill.id}
                           className="flex items-center gap-1.5 bg-forge-50 border border-forge-200 
                                      text-forge-700 text-sm px-3 py-1 rounded-full">
                        {skill.name}
                        <button
                          onClick={() => onChange({ skills: resume.skills.filter((s) => s.id !== skill.id) })}
                          className="text-forge-400 hover:text-red-500 transition-colors"
                        >×</button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      id="skill-input"
                      type="text"
                      placeholder="Add skill (press Enter)"
                      className="flex-1 px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none 
                                 focus:ring-2 focus:ring-forge-500 focus:border-transparent"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const val = (e.target as HTMLInputElement).value.trim();
                          if (val) {
                            onChange({
                              skills: [...resume.skills, { id: generateId(), name: val, category: "general" }],
                            });
                            (e.target as HTMLInputElement).value = "";
                          }
                        }
                      }}
                    />
                  </div>
                  <p className="text-xs text-surface-400 mt-2">Press Enter to add each skill</p>
                </div>
              )}

              {/* ── Projects ── */}
              {key === "projects" && (
                <div className="space-y-4 mt-3">
                  {resume.projects.map((proj, idx) => (
                    <ProjectCard
                      key={proj.id}
                      project={proj}
                      onUpdate={(updated) => {
                        const next = [...resume.projects];
                        next[idx] = updated;
                        onChange({ projects: next });
                      }}
                      onDelete={() => onChange({ projects: resume.projects.filter((_, i) => i !== idx) })}
                    />
                  ))}
                  <button
                    onClick={() => onChange({
                      projects: [...resume.projects, {
                        id: generateId(), name: "", description: "", technologies: [], url: "", bullets: [""],
                      }],
                    })}
                    className="w-full py-2.5 border-2 border-dashed border-surface-200 rounded-xl text-sm 
                               text-surface-500 hover:border-forge-300 hover:text-forge-600 
                               hover:bg-forge-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Project
                  </button>
                </div>
              )}

              {/* ── Certifications ── */}
              {key === "certifications" && (
                <div className="space-y-4 mt-3">
                  {resume.certifications.map((cert, idx) => (
                    <CertCard
                      key={cert.id}
                      cert={cert}
                      onUpdate={(updated) => {
                        const next = [...resume.certifications];
                        next[idx] = updated;
                        onChange({ certifications: next });
                      }}
                      onDelete={() => onChange({ certifications: resume.certifications.filter((_, i) => i !== idx) })}
                    />
                  ))}
                  <button
                    onClick={() => onChange({
                      certifications: [...resume.certifications, {
                        id: generateId(), name: "", issuer: "", date: "", url: "",
                      }],
                    })}
                    className="w-full py-2.5 border-2 border-dashed border-surface-200 rounded-xl text-sm 
                               text-surface-500 hover:border-forge-300 hover:text-forge-600 
                               hover:bg-forge-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Certification
                  </button>
                </div>
              )}

            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────

function ExperienceCard({ exp, onUpdate, onDelete, rewritingBullet, onRewriteBullet }: {
  exp: WorkExperience;
  onUpdate: (e: WorkExperience) => void;
  onDelete: () => void;
  rewritingBullet: string | null;
  onRewriteBullet: (b: string) => Promise<string>;
}) {
  function field(key: keyof WorkExperience) {
    return (val: string | boolean) => onUpdate({ ...exp, [key]: val });
  }

  async function handleRewriteBullet(idx: number) {
    const rewritten = await onRewriteBullet(exp.bullets[idx]);
    const next = [...exp.bullets];
    next[idx] = rewritten;
    onUpdate({ ...exp, bullets: next });
  }

  return (
    <div className="border border-surface-200 rounded-xl p-4 space-y-3 bg-surface-50">
      <div className="flex justify-between items-start">
        <span className="text-xs font-bold text-surface-400 uppercase tracking-wide">Experience</span>
        <button onClick={onDelete} className="text-red-400 hover:text-red-600 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <SmallInput label="Job Title" value={exp.title} onChange={(v) => field("title")(v)} placeholder="Software Engineer" />
        <SmallInput label="Company" value={exp.company} onChange={(v) => field("company")(v)} placeholder="Acme Corp" />
        <SmallInput label="Location" value={exp.location} onChange={(v) => field("location")(v)} placeholder="Remote" />
        <div className="flex items-end gap-2">
          <label className="flex items-center gap-1.5 text-xs text-surface-600 cursor-pointer">
            <input type="checkbox" checked={exp.current}
              onChange={(e) => onUpdate({ ...exp, current: e.target.checked, endDate: e.target.checked ? "Present" : "" })}
              className="w-3.5 h-3.5 accent-forge-600"
            />
            Current role
          </label>
        </div>
        <SmallInput label="Start Date" value={exp.startDate} onChange={(v) => field("startDate")(v)} placeholder="2022-01" type="month" />
        {!exp.current && (
          <SmallInput label="End Date" value={exp.endDate} onChange={(v) => field("endDate")(v)} placeholder="2024-12" type="month" />
        )}
      </div>

      {/* Bullet points */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-surface-600">Achievements & Responsibilities</label>
        </div>
        <div className="space-y-2">
          {exp.bullets.map((bullet, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-surface-300 mt-2.5 shrink-0" />
              <textarea
                value={bullet}
                onChange={(e) => {
                  const next = [...exp.bullets];
                  next[i] = e.target.value;
                  onUpdate({ ...exp, bullets: next });
                }}
                placeholder="Reduced deployment time by 40% by implementing CI/CD pipeline with GitHub Actions..."
                rows={2}
                className="flex-1 px-2 py-1.5 text-sm border border-surface-200 rounded-lg focus:outline-none 
                           focus:ring-2 focus:ring-forge-500 focus:border-transparent resize-y bg-white"
              />
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleRewriteBullet(i)}
                  disabled={rewritingBullet === bullet}
                  title="Rewrite with AI"
                  className="p-1 rounded-md bg-forge-50 text-forge-600 hover:bg-forge-100 transition-colors disabled:opacity-50"
                >
                  {rewritingBullet === bullet
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Sparkles className="w-3.5 h-3.5" />
                  }
                </button>
                <button
                  onClick={() => onUpdate({ ...exp, bullets: exp.bullets.filter((_, j) => j !== i) })}
                  className="p-1 rounded-md text-surface-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => onUpdate({ ...exp, bullets: [...exp.bullets, ""] })}
          className="mt-2 text-xs text-forge-600 hover:text-forge-700 font-medium flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Add bullet
        </button>
      </div>
    </div>
  );
}

function EducationCard({ edu, onUpdate, onDelete }: {
  edu: Education; onUpdate: (e: Education) => void; onDelete: () => void;
}) {
  return (
    <div className="border border-surface-200 rounded-xl p-4 space-y-3 bg-surface-50">
      <div className="flex justify-between">
        <span className="text-xs font-bold text-surface-400 uppercase tracking-wide">Education</span>
        <button onClick={onDelete} className="text-red-400 hover:text-red-600">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <SmallInput label="Institution" value={edu.institution} onChange={(v) => onUpdate({ ...edu, institution: v })} placeholder="MIT" />
        <SmallInput label="Degree" value={edu.degree} onChange={(v) => onUpdate({ ...edu, degree: v })} placeholder="B.S." />
        <SmallInput label="Field of Study" value={edu.field} onChange={(v) => onUpdate({ ...edu, field: v })} placeholder="Computer Science" />
        <SmallInput label="GPA" value={edu.gpa || ""} onChange={(v) => onUpdate({ ...edu, gpa: v })} placeholder="3.9" />
        <SmallInput label="Start" value={edu.startDate} onChange={(v) => onUpdate({ ...edu, startDate: v })} type="month" />
        <SmallInput label="End" value={edu.endDate} onChange={(v) => onUpdate({ ...edu, endDate: v })} type="month" placeholder="Present" />
      </div>
    </div>
  );
}

function ProjectCard({ project, onUpdate, onDelete }: {
  project: Project; onUpdate: (p: Project) => void; onDelete: () => void;
}) {
  return (
    <div className="border border-surface-200 rounded-xl p-4 space-y-3 bg-surface-50">
      <div className="flex justify-between">
        <span className="text-xs font-bold text-surface-400 uppercase tracking-wide">Project</span>
        <button onClick={onDelete} className="text-red-400 hover:text-red-600">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <SmallInput label="Project Name" value={project.name} onChange={(v) => onUpdate({ ...project, name: v })} placeholder="E-Commerce Platform" />
      <SmallInput label="URL" value={project.url || ""} onChange={(v) => onUpdate({ ...project, url: v })} placeholder="github.com/..." />
      <SmallInput
        label="Technologies (comma-separated)"
        value={project.technologies.join(", ")}
        onChange={(v) => onUpdate({ ...project, technologies: v.split(",").map((s) => s.trim()) })}
        placeholder="React, Node.js, PostgreSQL"
      />
      <div>
        <label className="block text-xs font-semibold text-surface-600 mb-1">Description</label>
        <textarea
          value={project.description}
          onChange={(e) => onUpdate({ ...project, description: e.target.value })}
          rows={2}
          className="w-full px-2 py-1.5 text-sm border border-surface-200 rounded-lg focus:outline-none 
                     focus:ring-2 focus:ring-forge-500 bg-white resize-y"
          placeholder="Brief description of the project..."
        />
      </div>
    </div>
  );
}

function CertCard({ cert, onUpdate, onDelete }: {
  cert: Certification; onUpdate: (c: Certification) => void; onDelete: () => void;
}) {
  return (
    <div className="border border-surface-200 rounded-xl p-4 space-y-3 bg-surface-50">
      <div className="flex justify-between">
        <span className="text-xs font-bold text-surface-400 uppercase tracking-wide">Certification</span>
        <button onClick={onDelete} className="text-red-400 hover:text-red-600">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <SmallInput label="Certification Name" value={cert.name} onChange={(v) => onUpdate({ ...cert, name: v })} placeholder="AWS Solutions Architect" />
        <SmallInput label="Issuing Organization" value={cert.issuer} onChange={(v) => onUpdate({ ...cert, issuer: v })} placeholder="Amazon Web Services" />
        <SmallInput label="Date" value={cert.date} onChange={(v) => onUpdate({ ...cert, date: v })} type="month" />
        <SmallInput label="Credential URL" value={cert.url || ""} onChange={(v) => onUpdate({ ...cert, url: v })} placeholder="verify.credential.net/..." />
      </div>
    </div>
  );
}

function SmallInput({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-surface-600 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2.5 py-1.5 text-sm border border-surface-200 rounded-lg focus:outline-none 
                   focus:ring-2 focus:ring-forge-500 focus:border-transparent bg-white transition-shadow"
      />
    </div>
  );
}
