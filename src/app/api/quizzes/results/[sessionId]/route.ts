import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Session from "@/models/sessionModel";
import PlayerQuiz from "@/models/playerQuizModel";
import AnswerNew from "@/models/answerModel";
import QuestionNews from "@/models/questionModel"; // ✅ Ensure this is imported
import { connect } from "@/dbConfig/dbConfig";

connect();

export async function GET(request: NextRequest) {
  try {
    // ✅ Step 1: Authenticate User
    const token = request.cookies.get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.id;
    console.log("Authenticated user ID:", userId);

    // ✅ Step 2: Extract Session ID from URL
    const pathSegments = request.nextUrl.pathname.split("/");
    const sessionId = pathSegments[pathSegments.length - 1];

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    // ✅ Step 3: Find the session
    const session = await Session.findById(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // ✅ Step 4: Find the PlayerQuiz entry for this user & session
    const playerQuiz = await PlayerQuiz.findOne({ session_id: sessionId, player_id: userId });
    if (!playerQuiz) {
      return NextResponse.json({ error: "No quiz results found for this user in this session" }, { status: 404 });
    }

    // ✅ Step 5: Fetch user's answers and populate questions
    const answers = await AnswerNew.find({ player_quiz_id: playerQuiz._id })
      .populate({
        path: "question_id",
        select: "question_text options correct_answer question_type media_url",
        model: QuestionNews, // Ensure correct model reference
      });

    if (!answers.length) {
      return NextResponse.json({ error: "No answers found for this session" }, { status: 404 });
    }

    const formattedAnswers = answers.map((ans) => {
      console.log("Mapped Answer:", ans.question_id); // ✅ Debugging step
      return {
        question_text: ans.question_id?.question_text || "",
        options: ans.question_id?.options || [],
        correct_answer: ans.question_id?.correct_answer || null,
        submitted_answer: ans.submitted_answer,
        is_correct: ans.is_correct,
        points: ans.points,
        question_type: ans.question_id?.question_type || "text",
        image_url: ans.question_id?.media_url ? ans.question_id.media_url.trim() : null, // ✅ Fix applied
      };
    });
    
    

    const result = {
      playerQuizId: playerQuiz._id,
      quiz_id: playerQuiz.quiz_id,
      player_id: playerQuiz.player_id,
      displayName: playerQuiz.displayName || "Anonymous",
      score: playerQuiz.score || 0,
      completed_at: playerQuiz.completed_at || null,
      end_time: session.end_time ? session.end_time.toISOString() : null, // ✅ Ensure end_time is returned
      answers: formattedAnswers,
    };

    return NextResponse.json({ success: true, sessionId, result }, { status: 200 });

  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}