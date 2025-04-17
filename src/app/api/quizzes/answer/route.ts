import { NextRequest, NextResponse } from "next/server";
import Answer from "@/models/answerModel";
import Question from "@/models/questionModel";
import PlayerQuiz from "@/models/playerQuizModel";
import { connect } from "@/dbConfig/dbConfig";



export async function POST(request: NextRequest) {
  try {
    await connect();
    const { player_quiz_id, question_id, submitted_answer } = await request.json();

    if (!player_quiz_id || !question_id || submitted_answer === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const question = await Question.findById(question_id);
    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    let is_correct = false;
    if (question.question_type === "Short Answer" && Array.isArray(question.correct_answer)) {
      // Check if any acceptable answer matches
      is_correct = question.correct_answer.some(
        (ans: string) => ans.toLowerCase() === submitted_answer.toLowerCase()
      );
    } else if (question.question_type === "Ranking" && Array.isArray(question.correct_answer)) {
      // Assume submitted_answer is a comma-separated string
      const submittedArray = submitted_answer
        .split(",")
        .map((item: string) => item.trim().toLowerCase());
      const correctArray = (question.correct_answer as string[]).map(item => item.toLowerCase());
      is_correct = JSON.stringify(submittedArray) === JSON.stringify(correctArray);
    } else {
      is_correct = question.correct_answer.toLowerCase() === submitted_answer.toLowerCase();
    }
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

    return NextResponse.json({ success: true, is_correct, pointsEarned }, { status: 201 });
  } catch (error) {
    console.error("error saving answer:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}