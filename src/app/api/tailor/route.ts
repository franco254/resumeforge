import { NextRequest, NextResponse } from "next/server";
import { callAI, parseAIJson } from "@/lib/ai-provider";
import type { ResumeData, TailoringResult, WorkExperience, Skill } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { resume, jobDescription, jobTitle, company } = await req.json() as {
      resume: ResumeData;
      jobDescription: string;
      jobTitle: string;
      company: string;
    };

    if (!resume || !jobDescription) {
      return NextResponse.json({ error: "Resume and job description are required" }, { status: 400 });
    }

    // Build a text representation of the current resume for context
    const resumeText = buildResumeText(resume);

    const response = await callAI([
      {
        role: "system",
        content: `You are an elite resume writer and career coach with expertise in ATS optimization 
and targeted job applications. You transform resumes to perfectly match specific job descriptions 
while keeping all information truthful. You write with powerful action verbs, quantified results, 
and mirror the exact language of the job description. Always respond with valid JSON only.`,
      },
      {
        role: "user",
        content: `Tailor this resume to match the job description below. 

Your task:
1. Rewrite EVERY bullet point to use keywords and language from the job description
2. Quantify achievements where possible (add realistic estimates if exact numbers are missing)
3. Prioritize the most relevant experience for this role
4. Update the summary to speak directly to this position and company
5. Reorder skills to put the most job-relevant ones first
6. Add missing keywords from the job description to skills if they're plausibly within the candidate's skill set
7. Adjust action verbs to match the seniority level of the role

CURRENT RESUME:
${resumeText}

JOB TITLE: ${jobTitle}
COMPANY: ${company}
JOB DESCRIPTION:
${jobDescription}

Return a JSON object with this exact structure:
{
  "tailoredResume": {
    "personalInfo": {
      "fullName": "<same as original>",
      "email": "<same>",
      "phone": "<same>",
      "location": "<same>",
      "linkedin": "<same>",
      "github": "<same>",
      "website": "<same>",
      "summary": "<REWRITTEN: 2-3 sentences tailored to this exact role and company, using keywords from JD>"
    },
    "experience": [
      {
        "id": "<same id>",
        "company": "<same>",
        "title": "<same>",
        "location": "<same>",
        "startDate": "<same>",
        "endDate": "<same>",
        "current": <same>,
        "bullets": ["<REWRITTEN bullet with JD keywords, action verbs, and quantified results>", ...]
      }
    ],
    "skills": [
      { "id": "<same or new uuid>", "name": "<skill name>", "category": "general" }
    ]
  },
  "matchScore": <number 0-100, how well the tailored resume now matches the JD>,
  "keywordsAdded": ["<keyword1>", "<keyword2>", ...],
  "missingSkills": ["<skill mentioned in JD that candidate clearly doesn't have>", ...],
  "changes": [
    "<concise description of a major change made, e.g. 'Rewrote 8 bullet points to emphasize cloud infrastructure experience'>",
    ...
  ]
}

Critical rules:
- NEVER invent companies, job titles, dates, or degrees — only rewrite bullets and summary
- Keep all factual information intact
- bullets arrays must have the same count as the original or more
- matchScore should honestly reflect how well the candidate fits AFTER tailoring
- keywordsAdded should list new keywords that were woven into the bullets/summary
- changes should list 4-6 major transformations you made
- missingSkills should list 3-5 genuinely missing qualifications (things you could NOT invent)

Respond with JSON only. No markdown fences.`,
      },
    ], { maxTokens: 3000, temperature: 0.4 });

    const result = parseAIJson<TailoringResult>(response.text);

    // Merge IDs and unchanged fields back from original resume
    if (result.tailoredResume) {
      result.tailoredResume.id = resume.id;
      result.tailoredResume.name = resume.name;
      result.tailoredResume.templateId = resume.templateId;
      result.tailoredResume.education = resume.education;
      result.tailoredResume.projects = resume.projects;
      result.tailoredResume.certifications = resume.certifications;
      result.tailoredResume.createdAt = resume.createdAt;
      result.tailoredResume.updatedAt = new Date().toISOString();
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Tailor API error:", error);
    return NextResponse.json(
      { error: error.message || "Tailoring failed. Please try again." },
      { status: 500 }
    );
  }
}

function buildResumeText(resume: ResumeData): string {
  const pi = resume.personalInfo;
  const lines: string[] = [
    `Name: ${pi.fullName}`,
    `Email: ${pi.email} | Phone: ${pi.phone} | Location: ${pi.location}`,
    `Summary: ${pi.summary}`,
    "",
    "EXPERIENCE:",
    ...resume.experience.map((exp) => [
      `${exp.title} at ${exp.company} (${exp.startDate} – ${exp.current ? "Present" : exp.endDate})`,
      ...exp.bullets.map((b) => `  • ${b}`),
    ].join("\n")),
    "",
    "SKILLS:",
    resume.skills.map((s) => s.name).join(", "),
    "",
    "EDUCATION:",
    ...resume.education.map((edu) =>
      `${edu.degree} in ${edu.field} — ${edu.institution} (${edu.endDate})`
    ),
  ];
  return lines.join("\n");
}
