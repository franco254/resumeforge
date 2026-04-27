import { NextRequest, NextResponse } from "next/server";
import { callAI, parseAIJson } from "@/lib/ai-provider";
import type { ResumeData, InterviewQuestion } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { resume, jobTitle, company } = await req.json() as {
      resume: ResumeData;
      jobTitle: string;
      company: string;
    };

    if (!resume) {
      return NextResponse.json({ error: "Resume is required" }, { status: 400 });
    }

    const pi = resume.personalInfo;
    const skills = resume.skills.map((s) => s.name).join(", ");
    const experience = resume.experience.map((e) =>
      `${e.title} at ${e.company}: ${e.bullets.slice(0, 2).join("; ")}`
    ).join("\n");

    const response = await callAI([
      {
        role: "system",
        content: `You are an expert interview coach who has helped thousands of candidates land roles 
at top companies. You create highly targeted, specific interview questions based on a candidate's 
actual resume and target role. Always respond with valid JSON only.`,
      },
      {
        role: "user",
        content: `Generate interview questions for this candidate applying for ${jobTitle || "a professional role"}${company ? ` at ${company}` : ""}.

CANDIDATE BACKGROUND:
- Summary: ${pi.summary || "N/A"}
- Experience: ${experience || "N/A"}
- Skills: ${skills || "N/A"}

Create 12 interview questions across these categories. Return as JSON:

{
  "questions": [
    {
      "question": "<specific, targeted question based on their actual resume>",
      "category": "<behavioral|technical|situational|role-specific>",
      "tip": "<specific coaching tip for how to answer this using their background, 2-3 sentences>",
      "sampleAnswer": "<a STAR-method framework hint tailored to their experience, 2-3 sentences>"
    }
  ]
}

Distribution: 4 behavioral, 3 technical (based on their tech stack), 2 situational, 3 role-specific

Rules:
- Reference their ACTUAL experience in the questions (e.g., "Tell me about the microservices migration you led at Acme")
- Technical questions should target their specific skills listed
- Tips must be actionable and specific to their background
- Sample answers should give a STAR framework tailored to them
- Make questions progressively harder
- Include at least 2 curveball/stress-test questions

Respond with JSON only.`,
      },
    ], { maxTokens: 2500, temperature: 0.6 });

    const parsed = parseAIJson<{ questions: InterviewQuestion[] }>(response.text);
    return NextResponse.json(parsed);

  } catch (error: any) {
    console.error("Interview prep API error:", error);
    return NextResponse.json(
      { error: error.message || "Interview prep generation failed" },
      { status: 500 }
    );
  }
}
