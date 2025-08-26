import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { Storage } from "@google-cloud/storage";

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS || "{}"),
});

const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME || "mob_workout_images";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const workoutId = formData.get("workoutId") as string;

    if (!workoutId || !file) {
      return NextResponse.json(
        { error: "Workout ID and image file are required" },
        { status: 400 }
      );
    }

    // Generate unique filename for the generated preview
    const timestamp = Date.now();
    const fileName = `workout-previews/${user.id}/${workoutId}-${timestamp}.png`;

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Google Cloud Storage
    const bucket = storage.bucket(bucketName);
    const fileUpload = bucket.file(fileName);

    await fileUpload.save(buffer, {
      metadata: {
        contentType: "image/png",
      },
    });

    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;

    // Update the workout's cover_photo with the generated image URL
    const { error: updateError } = await supabase
      .from("workouts")
      .update({ cover_photo: publicUrl })
      .eq("id", workoutId);

    if (updateError) {
      console.error("Error updating workout cover photo:", updateError);
      // If database save fails, delete the uploaded file
      await fileUpload.delete();
      return NextResponse.json(
        { error: "Failed to save cover photo" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      coverPhotoUrl: publicUrl,
      message: "Cover photo saved successfully",
    });
  } catch (error) {
    console.error("Error generating workout preview:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
