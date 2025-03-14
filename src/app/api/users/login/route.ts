import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

connect();

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "user not found" }, { status: 404 });
    }

    if (password !== user.password) {
      return NextResponse.json({ error: "invalid email or password" }, { status: 401 });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("jwt_secret not defined in environment variables");
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    const response = NextResponse.json({ message: "login successful", success: true }, { status: 200 });
    response.cookies.set({
      name: "authToken",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("error during login:", error);
    return NextResponse.json({ error: "login failed" }, { status: 500 });
  }
}
