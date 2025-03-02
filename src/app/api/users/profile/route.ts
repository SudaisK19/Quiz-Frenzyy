import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import "@/models/quizModel"; 
import PlayerQuiz from "@/models/playerQuizModel"; // ✅ Import PlayerQuiz Model
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

connect();

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in environment variables.");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string };
    } catch (error) {
      console.error("JWT verification failed:", error);
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: "Invalid token structure" }, { status: 401 });
    }

    // ✅ Fetch user + hosted quizzes
    const user = await User.findById(decoded.id)
      .select("-password")
      .populate("hosted_quizzes", "title description created_at");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ Fetch participated quizzes from PlayerQuiz collection
    const playerQuizzes = await PlayerQuiz.find({ player_id: decoded.id }).populate("quiz_id", "title description created_at");
    const participatedQuizzes = playerQuizzes.map((pq) => pq.quiz_id);

    return NextResponse.json({ success: true, user, participated_quizzes: participatedQuizzes }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ Update Profile (PATCH)
export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in environment variables.");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string };
    } catch (error) {
      console.error("JWT verification failed:", error);
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: "Invalid token structure" }, { status: 401 });
    }

    const { username, email, password } = await request.json();

    const updatedUser = await User.findByIdAndUpdate(
      decoded.id,
      { username, email, password },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Profile updated successfully", user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
