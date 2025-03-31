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
      return NextResponse.json(
        { error: "session id is required" },
        { status: 400 }
      );
    }

    console.log("fetching leaderboard for session:", sessionId);

    // Fetch the PlayerQuiz documents for the session.
    const leaderboard = await PlayerQuizNew.find({ session_id: sessionId })
      .populate("player_id", "username")
      .sort({ score: -1, completed_at: 1 }) // initial sort based on available fields
      .select("_id player_id score completed_at displayName avatar");

    // For each PlayerQuiz, calculate the attempted and correct counts.
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

    // Now perform local sorting using the computed attempted count.
    // Sorting order: Score (desc), Attempted (desc), Completed_at (asc)
    leaderboardWithCounts.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.attempted !== a.attempted) return b.attempted - a.attempted;
      return new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime();
    });

    return NextResponse.json(
      { success: true, leaderboard: leaderboardWithCounts },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}