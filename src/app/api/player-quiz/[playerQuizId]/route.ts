import { NextRequest, NextResponse } from "next/server";
import PlayerQuiz from "@/models/playerQuizModel";
import { connect } from "@/dbConfig/dbConfig";

connect();

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ playerQuizId: string }> }
) {
  try {
    const resolvedParams = await context.params;
    const { playerQuizId } = resolvedParams;

    if (!playerQuizId) {
      return NextResponse.json({ error: "player quiz id is required" }, { status: 400 });
    }

    console.log("fetching player quiz:", playerQuizId);

    const playerQuiz = await PlayerQuiz.findById(playerQuizId);
    if (!playerQuiz) {
      return NextResponse.json({ error: "player quiz not found" }, { status: 404 });
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
    console.error("error fetching player quiz:", error);
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}
