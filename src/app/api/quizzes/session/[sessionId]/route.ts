import { NextRequest, NextResponse } from "next/server";
import Session from "@/models/sessionModel";
import Question from "@/models/questionModel";
import { connect } from "@/dbConfig/dbConfig";
import { shuffle } from "lodash"; // Library for shuffle function

connect();

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await context.params;

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    console.log("Fetching session for session ID:", sessionId);

    const session = await Session.findById(sessionId).populate("quiz_id");
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const now = new Date();
    if (session.end_time && now > session.end_time) {
      if (session.is_active) {
        session.is_active = false;
        await session.save();
      }
      return NextResponse.json({ error: "Session expired" }, { status: 400 });
    }

    let questions = await Question.find({ quiz_id: session.quiz_id._id });
    if (questions.length === 0) {
      return NextResponse.json({ error: "No questions available for this quiz" }, { status: 404 });
    }

    questions = shuffle(questions).map((question) => {
      if (
        (question.question_type === "MCQ" ||
          question.question_type === "Ranking" ||
          question.question_type === "Image") &&
        question.options?.length
      ) {
        question.options = shuffle(question.options);
      }
      return {
        _id: question._id,
        question_text: question.question_text,
        question_type: question.question_type,
        options: question.options || [],
        media_url: question.media_url || "",
        hint: question.hint || "",
        points: question.points,
      };
    });

    return NextResponse.json(
      {
        success: true,
        session_id: session._id,
        quiz: session.quiz_id,
        questions,
        duration: session.quiz_id.duration,
        start_time: session.start_time, // ✅ Added Start Time
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching session details:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}