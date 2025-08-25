import { NextRequest, NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS || "{}"),
});

const bucketName = "mob_workout_images";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const workoutId = formData.get("workoutId") as string;

    if (!file || !workoutId) {
      return NextResponse.json(
        { error: "Missing file or workoutId" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const filename = `workout-preview-${workoutId}-${Date.now()}.png`;

    // Upload to Google Cloud Storage
    const bucket = storage.bucket(bucketName);
    const fileObj = bucket.file(filename);

    await fileObj.save(buffer, {
      metadata: {
        contentType: "image/png",
      },
    });

    // With uniform bucket-level access, files are automatically public if bucket is configured as public
    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;

    return NextResponse.json({
      success: true,
      publicUrl,
    });
  } catch (error) {
    console.error("Error uploading workout preview:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to upload workout preview",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
