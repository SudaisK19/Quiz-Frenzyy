import { NextRequest, NextResponse } from "next/server";
import Quiz from "@/models/quizModel";
import Question from "@/models/questionModel";
import Session from "@/models/sessionModel";
import { connect } from "@/dbConfig/dbConfig";
import crypto from "crypto";

connect();

// ✅ Function to generate a unique join code
function generateJoinCode(): string {
    return crypto.randomBytes(3).toString("hex").toUpperCase();
}

export async function POST(request: NextRequest) {
    try {
        const { title, description, created_by, duration, questions } = await request.json();

        if (!title || !created_by || duration === undefined) {
            return NextResponse.json({ error: "Title, creator ID, and duration are required" }, { status: 400 });
        }

        // ✅ Convert duration to a number and apply default value
        const quizDuration = Number(duration) || 10; // Default 10 minutes

        // ✅ Calculate total quiz points (sum of all question points)
        const totalPoints = questions.reduce((sum: number, q: { points: number }) => sum + (q.points || 0), 0);


        // ✅ Create the Quiz with total points
        const newQuiz = new Quiz({
            title,
            description,
            created_by,
            duration: quizDuration,
            total_points: totalPoints, // ✅ Store total points
        });

        const savedQuiz = await newQuiz.save();

        // ✅ Save Questions
        let savedQuestions = [];
        if (questions && Array.isArray(questions) && questions.length > 0) {
            savedQuestions = await Question.insertMany(
                questions.map((q) => ({
                    ...q,
                    quiz_id: savedQuiz._id
                }))
            );
        }

        // ✅ Generate a unique session join code
        let sessionJoinCode = generateJoinCode();
        while (await Session.findOne({ join_code: sessionJoinCode })) {
            sessionJoinCode = generateJoinCode();
        }

        // ✅ Create a new session for this quiz
        const newSession = new Session({
            quiz_id: savedQuiz._id,
            join_code: sessionJoinCode,
            start_time: new Date() // ✅ Ensure start_time is correctly stored
        });
        const savedSession = await newSession.save();

        return NextResponse.json({
            success: true,
            quiz: savedQuiz,
            questions: savedQuestions,
            session_join_code: savedSession.join_code, // ✅ Return session join code
        }, { status: 201 });

    } catch (error) {
        console.error("❌ Error creating quiz:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
