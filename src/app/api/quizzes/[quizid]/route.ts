import { NextRequest, NextResponse } from "next/server";
import Quiz from "@/models/quizModel";
import Question from "@/models/questionModel";
import { connect } from "@/dbConfig/dbConfig";

connect();

export async function GET(request: NextRequest, context: unknown) {
  const { params } = context as { params: { quizid: string } };
  try {
    const quiz = await Quiz.findById(params.quizid);
    if (!quiz) {
      return NextResponse.json({ error: "quiz not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, quiz }, { status: 200 });
  } catch (error) {
    console.error("error fetching quiz:", error);
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: unknown) {
  const { params } = context as { params: { quizid: string } };
  try {
    const deletedQuiz = await Quiz.findByIdAndDelete(params.quizid);
    if (!deletedQuiz) {
      return NextResponse.json({ error: "quiz not found" }, { status: 404 });
    }
    await Question.deleteMany({ quiz_id: params.quizid });
    return NextResponse.json(
      { success: true, message: "quiz and questions deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.error("error deleting quiz:", error);
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: unknown) {
  const { params } = context as { params: { quizid: string } };
  try {
    const { title, description, duration } = await request.json();

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
      return NextResponse.json({ error: "quiz not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, quiz: updatedQuiz }, { status: 200 });
  } catch (error) {
    console.error("error updating quiz:", error);
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}