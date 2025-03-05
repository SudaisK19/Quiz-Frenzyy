import { NextRequest, NextResponse } from "next/server";
import Quiz from "@/models/quizModel";
import Session from "@/models/sessionModel";
import { connect } from "@/dbConfig/dbConfig";
import mongoose from "mongoose";

connect();

export async function POST(request: NextRequest) {
  try {
    const { quizId, duration } = await request.json();
    if (!quizId) {
      return NextResponse.json({ error: "Quiz ID is required" }, { status: 400 });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const sessionDuration = duration || quiz.duration || 10;
    const sessionStartTime = new Date();
    const sessionEndTime = new Date(sessionStartTime.getTime() + sessionDuration * 60000);

    const newSession = new Session({
      quiz_id: quiz._id,
      start_time: sessionStartTime,
      end_time: sessionEndTime,
      is_active: true,
    });

    await newSession.save();

    return NextResponse.json(
      {
        success: true,
        sessionId: newSession._id,
        join_code: newSession.join_code,
        message: "New session created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error rehosting quiz:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
