import { NextRequest, NextResponse } from "next/server";
const cloudinary = require("cloudinary").v2; // <-- CommonJS

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataUri);

    return NextResponse.json({ success: true, imageUrl: result.secure_url });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ success: false, error: "Image upload failed" }, { status: 500 });
  }
}
