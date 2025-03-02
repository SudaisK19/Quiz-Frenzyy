import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Answer from "@/models/answerModel";
import Question from "@/models/questionModel";
import PlayerQuiz from "@/models/playerQuizModel";
import { connect } from "@/dbConfig/dbConfig";

connect();

export async function POST(request: NextRequest) {
  try {
    const { player_quiz_id, answers } = await request.json();

    if (!player_quiz_id || !answers || answers.length === 0) {
      console.log("missing required fields: player_quiz_id or answers");
      return NextResponse.json({ error: "player quiz id and answers are required" }, { status: 400 });
    }

    const playerQuiz = await PlayerQuiz.findById(player_quiz_id);
    if (!playerQuiz) {
      console.log("player quiz not found for id:", player_quiz_id);
      return NextResponse.json({ error: "player quiz not found" }, { status: 404 });
    }

    const answerDocs = await Promise.all(
      answers.map(async (ans: { question_id: string; submitted_answer: string }) => {
        const question = await Question.findById(ans.question_id);
        if (!question) {
          throw new Error(`question not found for id: ${ans.question_id}`);
        }
        const is_correct =
          question.correct_answer.trim().toLowerCase() === ans.submitted_answer.trim().toLowerCase();
        const points = is_correct ? question.points : 0;

        const answerDoc = {
          player_quiz_id: new mongoose.Types.ObjectId(player_quiz_id),
          question_id: new mongoose.Types.ObjectId(ans.question_id),
          submitted_answer: ans.submitted_answer,
          is_correct,
          points,
        };

        console.log("computed answer document:", answerDoc);
        return answerDoc;
      })
    );

    await Answer.insertMany(answerDocs);

    const totalScore = await Answer.aggregate([
      { $match: { player_quiz_id: new mongoose.Types.ObjectId(player_quiz_id) } },
      { $group: { _id: null, total: { $sum: "$points" } } },
    ]);
    console.log("aggregation result (total score):", totalScore);

    playerQuiz.score = totalScore[0]?.total || 0;
    playerQuiz.completed_at = new Date();
    await playerQuiz.save();
    console.log("updated player quiz document:", playerQuiz);

    return NextResponse.json(
      {
        success: true,
        session_id: playerQuiz.session_id,
        score: playerQuiz.score,
        completed_at: playerQuiz.completed_at,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("error finalizing quiz:", error);
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}
