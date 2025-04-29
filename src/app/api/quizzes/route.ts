import { NextRequest, NextResponse } from "next/server";
import Quiz from "@/models/quizModel";
import Question from "@/models/questionModel";
import UserNew from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";
import mongoose from "mongoose";  // Import mongoose to reference the ValidationError type

interface QuestionInput {
  question_text: string;
  question_type: string;
  media_url?: string;
  options: string[];
  correct_answer: string | string[];
  hint?: string;
  points: number;
}

export async function POST(request: NextRequest) {
  try {
    await connect();
    const { title, description, created_by, duration, total_points, questions } = await request.json();

    // Validate required fields
    if (!title) {
      return NextResponse.json({ error: "Quiz title is required" }, { status: 400 });
    }
    if (!description) {
      return NextResponse.json({ error: "Quiz description is required" }, { status: 400 });
    }
    if (!created_by) {
      return NextResponse.json({ error: "Creator ID is required" }, { status: 400 });
    }
    if (!duration) {
      return NextResponse.json({ error: "Quiz duration is required" }, { status: 400 });
    }

    // Create and save the quiz
    const quiz = new Quiz({
      title,
      description,
      created_by,
      duration,
      total_points: total_points || 0,
    });
    await quiz.save();

    // Update the UserNew model to add the hosted quiz
    await UserNew.findByIdAndUpdate(
      created_by,
      { $addToSet: { hosted_quizzes: quiz._id } },
      { new: true }
    );

    // If questions are provided, format and insert them
    if (Array.isArray(questions) && questions.length > 0) {
      const formattedQuestions = questions.map((q: QuestionInput) => ({
        quiz_id: quiz._id,
        question_text: q.question_text,
        question_type: q.question_type,
        media_url: q.media_url || null,
        options: q.options,
        correct_answer: q.correct_answer,
        hint: q.hint || null,
        points: q.points,
      }));

      await Question.insertMany(formattedQuestions);
    }

    // Aggregate points from questions and update the quiz total_points
    const agg = await Question.aggregate([
      { $match: { quiz_id: quiz._id } },
      { $group: { _id: null, total: { $sum: "$points" } } },
    ]);
    quiz.total_points = agg[0]?.total || 0;
    await quiz.save();

    // Return the success response
    return NextResponse.json(
      { success: true, quiz },
      { status: 201 }
    );
  } catch (error: unknown) {  // Explicitly typing 'error' as 'unknown'
    console.error("Error creating quiz:", error);

    // Check if the error is a Mongoose ValidationError
    if (error instanceof mongoose.Error.ValidationError) {
      // If the error is a validation error, handle it
      const validationErrors =Object.values(error.errors).map(
        (err: mongoose.Error.ValidatorError | mongoose.Error.CastError) => err.message
      );
      return NextResponse.json({ error: validationErrors.join(", ") }, { status: 400 });
    }

    // For other errors, return a generic internal server error message
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}