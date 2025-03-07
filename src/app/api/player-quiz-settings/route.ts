import { NextRequest, NextResponse } from "next/server";
import PlayerQuiz from "@/models/playerQuizModel";
import { connect } from "@/dbConfig/dbConfig";

connect();

export async function PATCH(request: NextRequest) {
  console.log("PATCH /api/player-quiz-settings was called!");
  try {
    // Read the JSON body
    const body = await request.json();
    // Log the entire body for debugging
    console.log("PATCH body:", body);

    const { playerQuizId, avatar, displayName } = body;

    if (!playerQuizId) {
      return NextResponse.json({ error: "playerQuizId is required" }, { status: 400 });
    }

    // Attempt to update the PlayerQuiz document
    const updatedPlayerQuiz = await PlayerQuiz.findByIdAndUpdate(
      playerQuizId,
      { avatar, displayName },
      { new: true, runValidators: true }
    );

    console.log("Updated doc:", updatedPlayerQuiz);

    if (!updatedPlayerQuiz) {
      return NextResponse.json({ error: "Player quiz not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Player quiz updated successfully",
        playerQuiz: updatedPlayerQuiz,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating player quiz:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}