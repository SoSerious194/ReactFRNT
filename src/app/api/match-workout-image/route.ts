import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import OpenAI from "openai";

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

    const { workoutId } = await request.json();

    if (!workoutId) {
      return NextResponse.json(
        { error: "Workout ID is required" },
        { status: 400 }
      );
    }

    // Get workout details
    const { data: workout, error: workoutError } = await supabase
      .from("workouts")
      .select("*")
      .eq("id", workoutId)
      .single();

    if (workoutError || !workout) {
      return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    }

    // Get available sample images
    const { data: images, error: imagesError } = await supabase
      .from("workout_sample_images")
      .select("*")
      .or(`is_global.eq.true,coach_id.eq.${user.id}`)
      .not("ai_analysis", "is", null);

    if (imagesError) {
      return NextResponse.json(
        { error: "Failed to fetch images" },
        { status: 500 }
      );
    }

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: "No analyzed images available" },
        { status: 404 }
      );
    }

    // Create workout description for matching
    const workoutDescription = `
      Workout Name: ${workout.name || "Unknown"}
      Difficulty: ${workout.difficulty || "Unknown"}
      Duration: ${workout.duration || "Unknown"}
      Equipment: ${workout.equipment || "None specified"}
      Description: ${workout.description || "No description"}
    `;

    // Use AI to find the best matching image
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert fitness trainer who matches workout programs with appropriate visual images. 
          Given a workout description and a list of analyzed images, select the best matching image based on:
          1. Exercise type compatibility
          2. Equipment used
          3. Difficulty level
          4. Muscle groups targeted
          5. Overall fitness context
          
          Analyze the JSON data in each image's AI analysis to make the best match.
          Return only the image ID of the best match.`,
        },
        {
          role: "user",
          content: `Workout to match: ${workoutDescription}
          
          Available images with AI analysis:
          ${images
            .map(
              (img) => `
              Image ID: ${img.id}
              Name: ${img.name}
              AI Analysis: ${img.ai_analysis}
            `
            )
            .join("\n")}
          
          Return only the image ID of the best match.`,
        },
      ],
      max_tokens: 50,
    });

    const selectedImageId = response.choices[0]?.message?.content?.trim();

    if (!selectedImageId) {
      return NextResponse.json(
        { error: "Failed to select image" },
        { status: 500 }
      );
    }

    // Find the selected image
    const selectedImage = images.find((img) => img.id === selectedImageId);

    if (!selectedImage) {
      return NextResponse.json(
        { error: "Selected image not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      selectedImage,
      workout,
      matchReason: `AI selected this image based on workout compatibility`,
    });
  } catch (error) {
    console.error("Error matching workout image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
