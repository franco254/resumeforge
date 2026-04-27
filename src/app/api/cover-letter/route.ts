import { NextRequest, NextResponse } from "next/server";
import { callAI } from "@/lib/ai-provider";
import type { ResumeData } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { resume, jobTitle, company, jobDescription, tone } = await req.json() as {
      resume: ResumeData;
      jobTitle: string;
      company: string;
      jobDescription?: string;
      tone: "professional" | "enthusiastic" | "concise";
    };

    if (!resume || !jobTitle || !company) {
      return NextResponse.json({ error: "Resume, job title, and company are required" }, { status: 400 });
    }

    const pi = resume.personalInfo;
    const topExperience = resume.experience.slice(0, 2).map((exp) => ({
      title: exp.title,
      company: exp.company,
      bullets: exp.bullets.slice(0, 3),
    }));

    const toneGuide = {
      professional:   "formal, confident, polished — suitable for corporate environments",
      enthusiastic:   "energetic, passionate, genuine — shows real excitement for the role",
      concise:        "brief and direct — 3 short paragraphs, no fluff, high signal-to-noise ratio",
    }[tone];

    const response = await callAI([
      {
        role: "system",
        content: `You are an expert career coach and professional writer specializing in cover letters 
that get candidates noticed. You write compelling, personalized cover letters that feel human and genuine — 
never generic or template-like. Your letters have personality, specificity, and strong calls to action.`,
      },
      {
        role: "user",
        content: `Write a cover letter for ${pi.fullName || "the candidate"} applying for the ${jobTitle} role at ${company}.

TONE: ${toneGuide}

CANDIDATE INFO:
- Name: ${pi.fullName}
- Email: ${pi.email}
- Summary: ${pi.summary}
- Recent Experience: ${JSON.stringify(topExperience, null, 2)}
- Key Skills: ${resume.skills.slice(0, 10).map((s) => s.name).join(", ")}

${jobDescription ? `JOB DESCRIPTION:\n${jobDescription}\n` : ""}

REQUIREMENTS:
- Address it "Dear Hiring Manager," (or specific name if available)
- Opening: Hook with a specific, compelling reason why you want THIS role at THIS company
- Middle paragraph(s): 2-3 specific achievements from their experience that directly map to the role
- Closing: Confident CTA — express genuine interest and next steps
- Sign off with their name
- Do NOT use clichés like "I am writing to express my interest" or "I believe I would be a great fit"
- Make it feel written by a real, thoughtful human
- Keep it to ~300-400 words${tone === "concise" ? " (target 200-250 words)" : ""}

Return ONLY the cover letter text. No labels, no explanations.`,
      },
    ], { maxTokens: 800, temperature: 0.75 });

    return NextResponse.json({ coverLetter: response.text.trim() });

  } catch (error: any) {
    console.error("Cover letter API error:", error);
    return NextResponse.json(
      { error: error.message || "Cover letter generation failed" },
      { status: 500 }
    );
  }
}
