import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Answer from "@/models/answerModel";
import Question from "@/models/questionModel";
import PlayerQuiz from "@/models/playerQuizModel";
import UserNew from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";

connect();
export async function POST(request: NextRequest) {
  try {
    const { player_quiz_id, answers } = await request.json();

    if (!player_quiz_id || !answers || answers.length === 0) {
      console.log("Missing required fields: player_quiz_id or answers");
      return NextResponse.json(
        { error: "Player quiz Id and answers are required" },
        { status: 400 }
      );
    }

    const playerQuiz = await PlayerQuiz.findById(player_quiz_id);
    if (!playerQuiz) {
      console.log("Player quiz not found for id:", player_quiz_id);
      return NextResponse.json(
        { error: "Player quiz not found" },
        { status: 404 }
      );
    }

    const answerDocs = await Promise.all(
      answers.map(async (ans: { question_id: string; submitted_answer: string | string[] }) => {
        const question = await Question.findById(ans.question_id);
        if (!question) {
          throw new Error(`Question not found for Id: ${ans.question_id}`);
        }
        let is_correct = false;
        const submitted = ans.submitted_answer;

        if (typeof question.correct_answer === "string") {
          if (typeof submitted === "string") {
            is_correct =
              question.correct_answer.trim().toLowerCase() ===
              submitted.trim().toLowerCase();
          }
        } else if (Array.isArray(question.correct_answer)) {
          if (question.question_type === "Ranking") {
            if (Array.isArray(submitted)) {
              const correctOrder = (question.correct_answer as string[]).map(
                (x: string) => x.trim().toLowerCase()
              );
              const submittedOrder = (submitted as string[]).map(
                (x: string) => x.trim().toLowerCase()
              );
              is_correct =
                JSON.stringify(correctOrder) === JSON.stringify(submittedOrder);
            }
          } else {
            if (typeof submitted === "string") {
              is_correct = (question.correct_answer as string[]).some(
                (acc: string) =>
                  acc.trim().toLowerCase() === submitted.trim().toLowerCase()
              );
            }
          }
        } else {
          is_correct = false;
        }

        const points = is_correct ? question.points : 0;

        const answerDoc = {
          player_quiz_id: new mongoose.Types.ObjectId(player_quiz_id),
          question_id: new mongoose.Types.ObjectId(ans.question_id),
          submitted_answer: submitted,
          is_correct,
          points,
        };

        console.log("Computed answer document:", answerDoc);
        return answerDoc;
      })
    );

    await Answer.insertMany(answerDocs);

    const totalScore = await Answer.aggregate([
      { $match: { player_quiz_id: new mongoose.Types.ObjectId(player_quiz_id) } },
      { $group: { _id: null, total: { $sum: "$points" } } },
    ]);
    console.log("Aggregation result (total score):", totalScore);

    playerQuiz.score = totalScore[0]?.total || 0;
    playerQuiz.completed_at = new Date();
    await playerQuiz.save();
    console.log("Updated player quiz document:", playerQuiz);

    const user = await UserNew.findById(playerQuiz.player_id);
    if (user) {
      user.total_points += playerQuiz.score;
      await user.save();
      console.log("Updated user's total points:", user.total_points);
    }

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
    console.error("Error finalizing quiz:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}