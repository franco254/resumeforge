import { NextRequest, NextResponse } from "next/server";
import { callAI, parseAIJson } from "@/lib/ai-provider";
import type { ResumeAnalysis } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { resumeText } = await req.json();

    if (!resumeText || typeof resumeText !== "string") {
      return NextResponse.json({ error: "Resume text is required" }, { status: 400 });
    }

    if (resumeText.length < 100) {
      return NextResponse.json({ error: "Resume text is too short" }, { status: 400 });
    }

    const response = await callAI([
      {
        role: "system",
        content: `You are an expert resume coach and ATS specialist with 15+ years of experience. 
Analyze resumes and provide detailed, actionable feedback. Always respond with valid JSON only.`,
      },
      {
        role: "user",
        content: `Analyze this resume and return a JSON object matching this exact structure:

{
  "overallScore": <number 0-100>,
  "scoreBreakdown": {
    "impact": <number 0-100, measures quantified achievements and action verbs>,
    "clarity": <number 0-100, measures readability and structure>,
    "keywords": <number 0-100, measures relevant industry keywords>,
    "formatting": <number 0-100, measures ATS-friendliness and consistency>,
    "completeness": <number 0-100, measures all required sections present>
  },
  "strengths": [<3-5 specific, positive statements about the resume>],
  "improvements": [<4-6 specific, actionable improvement suggestions>],
  "missingKeywords": [<5-10 industry keywords that are missing but relevant>],
  "suggestions": [
    {
      "section": "<section name>",
      "original": "<the problematic text>",
      "improved": "<a significantly better version>",
      "explanation": "<why this improvement matters>"
    }
  ],
  "atsCompatibility": "<poor|fair|good|excellent>"
}

Rules:
- Be honest and critical — vague praise is useless
- For suggestions, provide 3-5 of the worst bullet points and dramatically improved versions
- Use strong action verbs and quantify achievements in the improved versions
- The "missingKeywords" should be role-relevant terms that ATS systems look for
- Score rigorously: a score of 80+ should require quantified achievements, strong action verbs, no typos

RESUME TO ANALYZE:
${resumeText}

Respond with JSON only. No preamble.`,
      },
    ], { maxTokens: 2000, temperature: 0.3 });

    const analysis = parseAIJson<ResumeAnalysis>(response.text);
    return NextResponse.json(analysis);

  } catch (error: any) {
    console.error("Analyze API error:", error);
    return NextResponse.json(
      { error: error.message || "Analysis failed. Check your AI provider configuration." },
      { status: 500 }
    );
  }
}
