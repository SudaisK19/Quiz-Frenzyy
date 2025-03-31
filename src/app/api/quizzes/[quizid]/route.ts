import { NextRequest, NextResponse } from "next/server";
import Quiz from "@/models/quizModel";
import Question from "@/models/questionModel";
import { connect } from "@/dbConfig/dbConfig";

connect();

export async function PATCH(request: NextRequest, context: unknown) {
  const { params } = context as { params: { quizid: string } };
  try {
    const { title, description, duration, questions } = await request.json();

    const totalQuizPoints = await Question.aggregate([
      { $match: { quiz_id: params.quizid } },
      { $group: { _id: null, total: { $sum: "$points" } } },
    ]);

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      params.quizid,
      {
        title,
        description,
        duration,
        total_points: totalQuizPoints[0]?.total || 0,
      },
      { new: true }
    );

    if (!updatedQuiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    if (Array.isArray(questions) && questions.length > 0) {
      for (const q of questions) {
        await Question.findByIdAndUpdate(q._id, {
          question_text: q.question_text,
          question_type: q.question_type,
          media_url: q.media_url || null,
          options: q.options,
          correct_answer: q.correct_answer,
          correct_answers: q.correct_answers || [],
          hint: q.hint || null,
          points: q.points,
        });
      }
    }

    return NextResponse.json({ success: true, quiz: updatedQuiz }, { status: 200 });
  } catch (error) {
    console.error("Error updating quiz:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}