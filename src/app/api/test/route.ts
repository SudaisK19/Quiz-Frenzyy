import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Force an error for testing
    throw new Error("Simulated server error");
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}