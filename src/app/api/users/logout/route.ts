import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({ message: "Logout successful", success: true }, { status: 200 });

    response.cookies.set({
      name: "authToken",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error("error during logout:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}