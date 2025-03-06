import { NextRequest, NextResponse } from "next/server";
import PlayerQuizNew from "@/models/playerQuizModel";
import Answer from "@/models/answerModel";
import { connect } from "@/dbConfig/dbConfig";

connect();

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await context.params;

    if (!sessionId) {
      return NextResponse.json({ error: "session id is required" }, { status: 400 });
    }

    console.log("fetching leaderboard for session:", sessionId);

    const leaderboard = await PlayerQuizNew.find({ session_id: sessionId })
      .populate("player_id", "username")
      .sort({ score: -1, completed_at: 1 })
      .select("_id player_id score completed_at displayName avatar");

    const leaderboardWithCounts = await Promise.all(
      leaderboard.map(async (player) => {
        const attemptedCount = await Answer.countDocuments({ player_quiz_id: player._id });
        const correctCount = await Answer.countDocuments({
          player_quiz_id: player._id,
          is_correct: true,
        });

        return {
          _id: player._id,
          displayName: player.displayName,
          avatar: player.avatar,
          originalUsername: player.player_id?.username,
          score: player.score,
          completed_at: player.completed_at,
          attempted: attemptedCount,
          correct: correctCount,
        };
      })
    );

    return NextResponse.json(
      { success: true, leaderboard: leaderboardWithCounts },
      { status: 200 }
    );
  } catch (error) {
    console.error("error fetching leaderboard:", error);
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}
