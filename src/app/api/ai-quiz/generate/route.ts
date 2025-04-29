import "openai/shims/node" 

import { NextRequest, NextResponse } from "next/server";
import Quiz from "@/models/quizModel";
import Question from "@/models/questionModel";
import UserNew from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";
import mongoose from "mongoose";
import jwt, { JwtPayload } from "jsonwebtoken";
import OpenAI from "openai";



interface DecodedToken extends JwtPayload {
  id?: string;
}

interface GeneratedQuestion {
  question_text: string;
  options: string[];
  correct_answer: string;
}

export async function POST(request: NextRequest) {
  try {
    await connect();

    const { topic, numQuestions, duration, questionConfigs } = await request.json();
    if (!topic || !numQuestions) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const prompt = `Generate ${numQuestions} quiz questions on the topic "${topic}".
IMPORTANT: All questions must be strictly multiple choice only. Do not generate any short answer questions.
Each question must include:
- "question_text"
- "options" (an array of at least 4 choices)
- "correct_answer" (one of the options)
- "points" (this will be overridden by the provided configuration)
Do not include any "question_type" field or markdown formatting.`;

    const tokenCookie = request.cookies.get("authToken");
    if (!tokenCookie?.value) {
      return NextResponse.json({ error: "User is not authenticated" }, { status: 401 });
    }

    const token = tokenCookie.value;
    let decoded: DecodedToken;
    try {
      if (!process.env.JWT_SECRET) throw new Error("jwt_secret not set in environment");
      decoded = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken;
    } catch {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const userId = decoded.id;
    if (!userId) {
      return NextResponse.json({ error: "Could not determine user from token" }, { status: 401 });
    }

    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      return NextResponse.json({ error: "Github token not configured" }, { status: 500 });
    }

    const client = new OpenAI({
      baseURL: "https://models.inference.ai.azure.com",
      apiKey: githubToken,
    });

    const aiResponse = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an assistant that creates quiz questions." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
      top_p: 1,
    });

    let generatedOutput = aiResponse.choices[0]?.message?.content;
    if (!generatedOutput) {
      console.error("No content returned by the AI model");
      return NextResponse.json({ error: "No AI output returned" }, { status: 500 });
    }

    generatedOutput = generatedOutput
      .replace(/```json\s*([\s\S]*?)```/, "$1")
      .replace(/```([\s\S]*?)```/, "$1")
      .trim();

    let generatedQuestions;
    try {
      generatedQuestions = JSON.parse(generatedOutput);
    } catch {
      try {
        const fixedOutput = `[${generatedOutput.replace(/}\s*{/g, "},{")}]`;
        generatedQuestions = JSON.parse(fixedOutput);
      } catch (err2) {
        const regex = /{[^}]+}/g;
        const matches = generatedOutput.match(regex);
        if (matches && matches.length > 0) {
          const joined = `[${matches.join(",")}]`;
          try {
            generatedQuestions = JSON.parse(joined);
          } catch (err3) {
            console.error("Error parsing extracted JSON objects:", err3, joined);
            return NextResponse.json({ error: "Failed to parse generated questions" }, { status: 500 });
          }
        } else {
          console.error("Error parsing model output:", err2, generatedOutput);
          return NextResponse.json({ error: "Failed to parse generated questions" }, { status: 500 });
        }
      }
    }

    if (!Array.isArray(generatedQuestions)) {
      generatedQuestions = [generatedQuestions];
    }

    const filteredQuestions = (generatedQuestions as GeneratedQuestion[]).filter(
      (q) => Array.isArray(q.options) && q.options.length >= 4
    );

    const newQuiz = new Quiz({
      title: `AI Quiz on ${topic}`,
      description: `Automatically generated quiz on ${topic}`,
      created_by: new mongoose.Types.ObjectId(userId),
      duration: duration || 10,
      total_points: 0,
    });
    await newQuiz.save();

    await UserNew.findByIdAndUpdate(
      userId,
      { $addToSet: { hosted_quizzes: newQuiz._id } },
      { new: true }
    );

    const questionDocs = filteredQuestions.map((q: GeneratedQuestion, index: number) => {
      const options = Array.isArray(q.options) && q.options.length >= 4
        ? q.options
        : ["Option A", "Option B", "Option C", "Option D"];
      const correct_answer = (q.correct_answer && options.includes(q.correct_answer))
        ? q.correct_answer
        : options[0];

      return {
        quiz_id: newQuiz._id,
        question_text: q.question_text,
        question_type: "MCQ",
        options,
        correct_answer,
        points: questionConfigs?.[index]?.points || 10,
      };
    });

    await Question.insertMany(questionDocs);

    const totalQuizPoints = questionDocs.reduce((sum: number, q: { points: number }) => sum + q.points, 0);
    newQuiz.total_points = totalQuizPoints;
    await newQuiz.save();

    return NextResponse.json(
      {
        success: true,
        quizId: newQuiz._id,
        message: "AI Quiz generated successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error generating AI quiz:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}