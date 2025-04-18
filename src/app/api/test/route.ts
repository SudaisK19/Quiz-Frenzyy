import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Force an error for testing
    throw new Error("Simulated server error");
  } catch (error: unknown) {
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
