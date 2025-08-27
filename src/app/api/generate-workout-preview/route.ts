import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

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
    const filename = `workout-previews/${workoutId}-${Date.now()}.png`;

    // Upload to Cloudflare Images
    const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const cloudflareApiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!cloudflareAccountId || !cloudflareApiToken) {
      return NextResponse.json(
        { error: "Cloudflare configuration missing" },
        { status: 500 }
      );
    }

    // Create form data for Cloudflare upload
    const cloudflareFormData = new FormData();
    cloudflareFormData.append("file", new Blob([buffer], { type: "image/png" }), filename);
    cloudflareFormData.append("metadata", JSON.stringify({
      workout_id: workoutId,
      coach_id: user.id,
      upload_type: "workout_preview"
    }));

    const cloudflareResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/images/v1`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${cloudflareApiToken}`,
        },
        body: cloudflareFormData,
      }
    );

    if (!cloudflareResponse.ok) {
      const errorData = await cloudflareResponse.json();
      console.error("Cloudflare upload error:", errorData);
      return NextResponse.json(
        { error: "Failed to upload image to Cloudflare" },
        { status: 500 }
      );
    }

    const cloudflareResult = await cloudflareResponse.json();
    const coverPhotoUrl = cloudflareResult.result.variants[0]; // Get the first variant URL

    // Update the workout's cover photo in the database
    const { error: updateError } = await supabase
      .from("workouts")
      .update({ cover_photo: coverPhotoUrl })
      .eq("id", workoutId);

    if (updateError) {
      console.error("Error updating workout cover photo:", updateError);
      return NextResponse.json(
        { error: "Failed to update workout cover photo" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      coverPhotoUrl,
    });
  } catch (error) {
    console.error("Error saving cover photo:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
