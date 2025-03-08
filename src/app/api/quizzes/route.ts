import { NextRequest, NextResponse } from "next/server";
import Quiz from "@/models/quizModel";
import Question from "@/models/questionModel";
import Session from "@/models/sessionModel";
import UserNew from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";

connect();

export async function POST(request: NextRequest) {
  try {
    const { title, description, created_by, duration, total_points, questions } = await request.json();

    // create the quiz document
    const newQuiz = new Quiz({
      title,
      description,
      created_by,
      duration, // duration in minutes
      total_points: total_points || 0,
    });
    await newQuiz.save();

    const updatedUser = await UserNew.findByIdAndUpdate(
      created_by,
      { $addToSet: { hosted_quizzes: newQuiz._id } },
      { new: true }
    );
    console.log("Updated user document:", updatedUser);

    // insert question documents referencing this quiz
    if (Array.isArray(questions) && questions.length > 0) {
      const questionDocs = questions.map((q: any) => ({
        quiz_id: newQuiz._id,
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options,
        correct_answer: q.correct_answer,
        points: q.points,
      }));
      await Question.insertMany(questionDocs);
    }

    // recalculate total quiz points
    const aggregated = await Question.aggregate([
      { $match: { quiz_id: newQuiz._id } },
      { $group: { _id: null, total: { $sum: "$points" } } },
    ]);
    newQuiz.total_points = aggregated[0]?.total || 0;
    await newQuiz.save();

    // create a session for the quiz using its duration
    const sessionStartTime = new Date();
    const sessionEndTime = new Date(sessionStartTime.getTime() + newQuiz.duration * 60000);

    // Generate a join code for the session (example logic)
    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const newSession = new Session({
      quiz_id: newQuiz._id,
      start_time: sessionStartTime,
      end_time: sessionEndTime,
      is_active: true,
      join_code: joinCode, // assign generated join code
    });
    await newSession.save();

    return NextResponse.json(
      {
        success: true,
        quiz: newQuiz,
        session: { sessionId: newSession._id, join_code: newSession.join_code },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("error creating quiz:", error);
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}
