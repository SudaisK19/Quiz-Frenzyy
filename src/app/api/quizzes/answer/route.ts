import { NextRequest, NextResponse } from "next/server";
import Answer from "@/models/answerModel";
import Question from "@/models/questionModel";
import PlayerQuiz from "@/models/playerQuizModel";
import { connect } from "@/dbConfig/dbConfig";

connect();

export async function POST(request: NextRequest) {
  try {
    const { player_quiz_id, question_id, submitted_answer } = await request.json();

    if (!player_quiz_id || !question_id || !submitted_answer) {
      return NextResponse.json({ error: "missing required fields" }, { status: 400 });
    }

    const question = await Question.findById(question_id);
    if (!question) {
      return NextResponse.json({ error: "question not found" }, { status: 404 });
    }

    const is_correct =
      question.correct_answer.toLowerCase() === submitted_answer.toLowerCase();
    const pointsEarned = is_correct ? question.points : 0;

    const newAnswer = new Answer({
      player_quiz_id,
      question_id,
      submitted_answer,
      is_correct,
      points: pointsEarned,
    });
    await newAnswer.save();

    const totalScore = await Answer.aggregate([
      { $match: { player_quiz_id } },
      { $group: { _id: null, total: { $sum: "$points" } } },
    ]);

    await PlayerQuiz.findByIdAndUpdate(player_quiz_id, {
      $set: { score: totalScore[0]?.total || 0 },
    });

    return NextResponse.json(
      { success: true, is_correct, pointsEarned },
      { status: 201 }
    );
  } catch (error) {
    console.error("error saving answer:", error);
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}
