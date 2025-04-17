import { NextRequest, NextResponse } from "next/server";
import Quiz from "@/models/quizModel";
import Session from "@/models/sessionModel";
import UserNew from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    await connect();

    const { quizId, duration } = await req.json();

    if (!quizId) {
      return NextResponse.json({ error: "Quiz ID is required" }, { status: 400 });
    }

    // Verify JWT from cookies
    const token = req.cookies.get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    const userId = decoded.id;

    // Check if quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Set session time
    const sessionDuration = duration || quiz.duration || 10;
    const sessionStartTime = new Date();
    const sessionEndTime = new Date(sessionStartTime.getTime() + sessionDuration * 60000);

    // Create a new session
    const newSession = new Session({
      quiz_id: quiz._id,
      start_time: sessionStartTime,
      end_time: sessionEndTime,
      is_active: true,
      // no has_started
    });

    await newSession.save();

    // Add the quiz to the user's hosted quizzes if not already added
    const updatedUser = await UserNew.findByIdAndUpdate(
      userId,
      { $addToSet: { hosted_quizzes: quiz._id } },
      { new: true }
    );

    console.log("Updated user document:", updatedUser);

    // Return only what’s needed — no has_started
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
    console.error("Error starting quiz:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
