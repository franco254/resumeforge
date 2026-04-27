import { NextRequest, NextResponse } from "next/server";
import { callAI } from "@/lib/ai-provider";

export async function POST(req: NextRequest) {
  try {
    const { bullet, context } = await req.json() as { bullet: string; context: string };

    if (!bullet || typeof bullet !== "string") {
      return NextResponse.json({ error: "Bullet text is required" }, { status: 400 });
    }

    const response = await callAI([
      {
        role: "system",
        content: `You are an expert resume writer. Your job is to rewrite resume bullet points 
to be more impactful, quantified, and ATS-friendly. 

Rules:
- Start with a strong action verb (Led, Built, Reduced, Increased, Designed, Implemented, etc.)
- Quantify results where possible (%, $, numbers, timeframes)
- Keep it to 1-2 sentences max
- Be specific and concrete
- Mirror professional language for the role
- Do NOT add false information — only enhance what's there
- Return ONLY the rewritten bullet, nothing else`,
      },
      {
        role: "user",
        content: `Rewrite this resume bullet point for the role: ${context || "professional"}

Original: "${bullet}"

Return only the improved bullet point text (no quotes, no label, no explanation).`,
      },
    ], { maxTokens: 200, temperature: 0.7 });

    const rewritten = response.text.trim().replace(/^["']|["']$/g, "");

    return NextResponse.json({ rewritten });

  } catch (error: any) {
    console.error("Rewrite bullet API error:", error);
    return NextResponse.json(
      { error: error.message || "Rewrite failed" },
      { status: 500 }
    );
  }
}
