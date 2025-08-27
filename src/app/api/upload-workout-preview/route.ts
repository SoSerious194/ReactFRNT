import { NextRequest, NextResponse } from "next/server";

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
    cloudflareFormData.append(
      "file",
      new Blob([buffer], { type: "image/png" }),
      filename
    );
    cloudflareFormData.append(
      "metadata",
      JSON.stringify({
        workout_id: workoutId,
        upload_type: "workout_preview",
      })
    );

    const cloudflareResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/images/v1`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cloudflareApiToken}`,
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
    const publicUrl = cloudflareResult.result.variants[0]; // Get the first variant URL

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
