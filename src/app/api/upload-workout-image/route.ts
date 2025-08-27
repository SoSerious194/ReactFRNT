import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import OpenAI from "openai";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    const name = formData.get("name") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop();
    const fileName = `workout-samples/${user.id}/${timestamp}.${fileExtension}`;

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

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
      new Blob([buffer], { type: file.type }),
      fileName
    );
    cloudflareFormData.append(
      "metadata",
      JSON.stringify({
        coach_id: user.id,
        upload_type: "workout_sample",
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

    // Analyze the image with AI
    let aiAnalysis = null;
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this workout/fitness image and provide a detailed description. Focus on:
1. What type of exercise/workout is shown
2. What equipment is visible
3. What muscle groups are being targeted
4. The difficulty level (beginner/intermediate/advanced)
5. The setting/environment
6. Any specific fitness activities or movements

Provide a comprehensive analysis that can be used to match this image with appropriate workout types. Return ONLY valid JSON without any markdown formatting or code blocks. Use this exact structure:
{
  "exercise_type": "string",
  "equipment": ["array", "of", "equipment"],
  "muscle_groups": ["array", "of", "muscles"],
  "difficulty": "beginner|intermediate|advanced",
  "setting": "string",
  "description": "detailed description",
  "tags": ["relevant", "tags", "for", "matching"]
}`,
              },
              {
                type: "image_url",
                image_url: {
                  url: publicUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
      });

      let rawAnalysis = response.choices[0]?.message?.content;

      // Clean the analysis if it contains markdown formatting
      if (rawAnalysis) {
        // Remove markdown code blocks if present
        rawAnalysis = rawAnalysis
          .replace(/```json\s*/g, "")
          .replace(/```\s*/g, "")
          .trim();

        // Try to parse as JSON to validate
        try {
          JSON.parse(rawAnalysis);
          aiAnalysis = rawAnalysis;
        } catch (parseError) {
          console.error("Failed to parse AI analysis as JSON:", parseError);
          aiAnalysis = rawAnalysis; // Still save the raw content
        }
      }

      console.log("AI Analysis result:", aiAnalysis);
    } catch (analysisError) {
      console.error("AI analysis failed:", analysisError);
      // Continue without AI analysis if it fails
    }

    // Save to database
    console.log("Saving to database with ai_analysis:", aiAnalysis);
    const { data: imageData, error: dbError } = await supabase
      .from("workout_sample_images")
      .insert({
        name: name || file.name,
        image_url: publicUrl,
        coach_id: user.id,
        is_global: false,
        ai_analysis: aiAnalysis,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to save image data" },
        { status: 500 }
      );
    }

    console.log("Successfully saved image with data:", imageData);
    return NextResponse.json({
      success: true,
      image: imageData,
      url: publicUrl,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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

    // Get sample images (global + user's own)
    const { data: images, error } = await supabase
      .from("workout_sample_images")
      .select("*")
      .or(`is_global.eq.true,coach_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch images" },
        { status: 500 }
      );
    }

    return NextResponse.json({ images });
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
