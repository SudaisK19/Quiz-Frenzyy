import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
const jwt = require("jsonwebtoken");


connect(); // Ensure MongoDB connection

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { email, password } = reqBody;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (user.password !== password) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Ensure TOKEN_SECRET exists
    if (!process.env.TOKEN_SECRET) {
      throw new Error("TOKEN_SECRET is not defined in the environment variables.");
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.TOKEN_SECRET!,
      { expiresIn: "1h" }
    );

    return NextResponse.json(
      { message: "Login successful!", token },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in login route:", error.message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
