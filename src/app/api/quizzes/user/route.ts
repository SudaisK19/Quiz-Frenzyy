import { NextRequest, NextResponse } from "next/server";
import PlayerQuiz from "@/models/playerQuizModel";
import UserNew from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";
import jwt from "jsonwebtoken";

connect();

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = await UserNew.findById(decoded.id).populate("hosted_quizzes", "title description created_at");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const playerQuizzes = await PlayerQuiz.find({ player_id: decoded.id })
      .populate("quiz_id", "title description created_at");
    const participatedQuizzes = playerQuizzes.map((pq) => pq.quiz_id);

    return NextResponse.json(
      {
        success: true,
        hosted_quizzes: user.hosted_quizzes,
        participated_quizzes: participatedQuizzes,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("error fetching user quizzes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}