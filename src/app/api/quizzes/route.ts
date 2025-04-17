import { NextRequest, NextResponse } from "next/server";
import Quiz from "@/models/quizModel";
import Question from "@/models/questionModel";
import UserNew from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";

interface QuestionInput {
  question_text: string;
  question_type: string;
  media_url?: string;
  options: string[];
  correct_answer: string | string[];
  hint?: string;
  points: number;
}

export async function POST(request: NextRequest) {
  try {
    await connect();
    const { title, description, created_by, duration, total_points, questions } = await request.json();

    const quiz = new Quiz({
      title,
      description,
      created_by,
      duration,
      total_points: total_points || 0,
    });
    await quiz.save();

    await UserNew.findByIdAndUpdate(
      created_by,
      { $addToSet: { hosted_quizzes: quiz._id } },
      { new: true }
    );

    if (Array.isArray(questions) && questions.length > 0) {
      const formattedQuestions = questions.map((q: QuestionInput) => ({
        quiz_id: quiz._id,
        question_text: q.question_text,
        question_type: q.question_type,
        media_url: q.media_url || null,
        options: q.options,
        correct_answer: q.correct_answer,
        hint: q.hint || null,
        points: q.points,
      }));

      await Question.insertMany(formattedQuestions);
    }

    const agg = await Question.aggregate([
      { $match: { quiz_id: quiz._id } },
      { $group: { _id: null, total: { $sum: "$points" } } },
    ]);
    quiz.total_points = agg[0]?.total || 0;
    await quiz.save();

    return NextResponse.json(
      { success: true, quiz },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating quiz:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
