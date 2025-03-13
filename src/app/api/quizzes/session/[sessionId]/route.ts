import { NextRequest, NextResponse } from "next/server";
import Session from "@/models/sessionModel";
import Question from "@/models/questionModel";
import { connect } from "@/dbConfig/dbConfig";
import { shuffle } from "lodash";  //library for shuffle function

connect();

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const resolvedParams = await context.params;
    const sessionId = resolvedParams.sessionId;

    if (!sessionId) {
      return NextResponse.json({ error: "session id is required" }, { status: 400 });
    }

    console.log("fetching session for session id:", sessionId);

    const session = await Session.findById(sessionId).populate("quiz_id");
    if (!session) {
      return NextResponse.json({ error: "session not found" }, { status: 404 });
    }

    const now = new Date();
    if (session.end_time && now > session.end_time) {
      if (session.is_active) {
        session.is_active = false;
        await session.save();
      }
      return NextResponse.json({ error: "session expired" }, { status: 400 });
    }

    let questions = await Question.find({ quiz_id: session.quiz_id._id });
    if (questions.length === 0) {
      return NextResponse.json({ error: "no questions available for this quiz" }, { status: 404 });
    }


    questions = shuffle(questions);


    questions = questions.map((question) => {
      if (question.question_type === "MCQ" && question.options && question.options.length) {
        question.options = shuffle(question.options);
      }
      return question;
    });

    return NextResponse.json(
      {
        success: true,
        session_id: session._id,
        quiz: session.quiz_id,
        questions,
        duration: session.quiz_id.duration,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("error fetching session details:", error);
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}