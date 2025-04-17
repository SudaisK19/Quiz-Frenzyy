import { NextRequest, NextResponse } from "next/server";
import Session from "@/models/sessionModel";
import { connect } from "@/dbConfig/dbConfig";



export async function GET(request: NextRequest) {
  try {
    await connect();
    const { searchParams } = new URL(request.url);
    const quizId = searchParams.get("quizId");

    if (!quizId) {
      return NextResponse.json({ error: "Quiz Id is required" }, { status: 400 });
    }

    // Find all sessions for the given quiz id, sorted by createdAt descending (newest first)
    const sessions = await Session.find({ quiz_id: quizId }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, sessions }, { status: 200 });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}