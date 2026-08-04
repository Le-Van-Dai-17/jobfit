import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { evaluateInterviewAnswer } from "@/lib/ai/gemini";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { questionText, expectedKeywords, answerText } = body;

    if (!questionText || !answerText) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const result = await evaluateInterviewAnswer(questionText, expectedKeywords || [], answerText);

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Evaluate Answer API Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to evaluate answer" },
      { status: 500 }
    );
  }
}
