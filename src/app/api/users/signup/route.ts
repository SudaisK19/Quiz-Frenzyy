import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

connect();

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { username, email, password } = reqBody as {
      username: string;
      email: string;
      password: string;
    };

    if (!username || !email || !password) {
      return NextResponse.json({ error: "all fields are required" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (user) {
      return NextResponse.json({ error: "user already exists" }, { status: 400 });
    }

    const newUser = new User({
      username,
      email,
      password,
    });

    const savedUser = await newUser.save();

    return NextResponse.json(
      { message: "user created successfully", success: true, user: savedUser },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("error in signup route:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}