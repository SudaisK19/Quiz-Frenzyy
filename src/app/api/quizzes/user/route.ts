import { NextRequest, NextResponse } from "next/server";
import Quiz from "@/models/quizModel";
import PlayerQuiz from "@/models/playerQuizModel";
import { connect } from "@/dbConfig/dbConfig";
import jwt from "jsonwebtoken";

connect();

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "unauthorized access" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: "invalid token" }, { status: 401 });
    }

    const hostedQuizzes = await Quiz.find({ created_by: decoded.id })
      .select("title description created_at");

    const playerQuizzes = await PlayerQuiz.find({ player_id: decoded.id })
      .populate("quiz_id", "title description created_at");

    const participatedQuizzes = playerQuizzes.map((pq) => pq.quiz_id);

    return NextResponse.json(
      { success: true, hosted_quizzes: hostedQuizzes, participated_quizzes: participatedQuizzes },
      { status: 200 }
    );
  } catch (error) {
    console.error("error fetching user quizzes:", error);
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}
