import { NextRequest, NextResponse } from "next/server";
import Question from "@/models/questionModel";
import { connect } from "@/dbConfig/dbConfig";

connect();

type RouteContext = { params: { quizid: string } };

export async function POST(request: NextRequest, context: RouteContext) {
  const { quizid } = context.params;
  try {
    const { question_text, question_type, options, correct_answer } = await request.json();

    if (!question_text || !correct_answer) {
      return NextResponse.json({ error: "missing required fields" }, { status: 400 });
    }

    const newQuestion = new Question({
      quiz_id: quizid,
      question_text,
      question_type,
      options,
      correct_answer,
    });
    await newQuestion.save();

    return NextResponse.json(
      { success: true, message: "question added successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("error adding question:", error);
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}
