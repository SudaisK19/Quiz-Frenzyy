import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

connect(); // Ensure MongoDB is connected

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { username, email, password } = reqBody;

    if (!username || !email || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    console.log("Request Body:", reqBody);

    // Check if the user already exists
    const user = await User.findOne({ email });
    if (user) {
      return NextResponse.json({ error: "User already exists." }, { status: 400 });
    }

    // Create a new user without hashing the password
    const newUser = new User({
      username,
      email,
      password, // Password stored as plain text (not recommended for production)
    });

    const savedUser = await newUser.save();
    console.log("Saved User:", savedUser);

    return NextResponse.json(
      { message: "User created successfully.", success: true, user: savedUser },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error in signup route:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
