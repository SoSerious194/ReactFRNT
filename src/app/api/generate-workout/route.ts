import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json();

    if (!description) {
      return NextResponse.json(
        { error: "Workout description is required" },
        { status: 400 }
      );
    }

    const prompt = `
    Parse the following workout description and extract structured workout data. Return the result as a valid JSON object.

    Workout Description:
    ${description}

    Please extract and structure the following information:

    1. Workout Metadata:
       - title: Generate a descriptive workout title based on the exercises
       - creator: "AI Generated"
       - description: The original description
       - difficulty: Estimate difficulty level based on exercises and reps
       - equipment: List of equipment needed
       - duration: Estimate total workout duration

    2. Workout Blocks/Sections:
       * CRITICAL: Carefully analyze the exercise pattern to determine the correct type:
         - "normal": Each exercise appears only once, done sequentially without repetition
         - "circuit": Same exercises repeat in rounds/cycles, or AMRAP style repetition
         - "superset": Two exercises paired together, done back-to-back
         - "warmup": Warm-up exercises at the beginning
         - "cooldown": Cool-down exercises at the end
       
       Each block should contain exercises of the same type.

    3. Exercises:
       - Each exercise should have:
         - name: Exercise name (normalize common variations)
         - duration: For time-based exercises (e.g., "1 min")
         - instructions: Any specific instructions mentioned
         - rest: Rest periods if mentioned

    4. Handle common exercise variations:
       - "goblet squats" → "Goblet Squats"
       - "deadlifts" → "Deadlifts"
       - "sit-ups" → "Sit-ups"
       - "crunches" → "Crunches"
       - "v-ups" → "V-ups"
       - "pull-ups" → "Pull-ups"
       - "push-ups" → "Push-ups"
       - "squats" → "Squats"
       - "lunges" → "Lunges"
       - "bench press" → "Bench Press"
       - "overhead press" → "Overhead Press"
       - "bicep curls" → "Bicep Curls"
       - "tricep dips" → "Tricep Dips"

    5. Parse set information:
       - Look for patterns like "three sets of 12", "four sets of four", "20 reps each"
       - Extract reps, weight, rest periods if mentioned
       - For circuits, each exercise gets the same reps
       - For warmup sets, create separate warmup blocks

    6. Special handling:
       - When "circuit" is mentioned, create a circuit block with all exercises in that circuit
       - When "warmup sets" is mentioned, create separate warmup blocks
       - When "1RM" or percentage is mentioned, include in weight field
       - When reps are specified, use them in the duration field (e.g., "12 reps")

    Return the data in this exact JSON structure:
    {
      "metadata": {
        "title": "string",
        "creator": "AI Generated",
        "description": "string",
        "difficulty": "Beginner" | "Intermediate" | "Advanced",
        "equipment": ["string array"],
        "duration": "string"
      },
      "blocks": [
        {
          "name": "string (e.g., 'Goblet Squats', 'Deadlifts', 'Circuit')",
          "type": "normal" | "circuit" | "superset" | "warmup" | "cooldown",
          "duration": "string",
          "exercises": [
            {
              "name": "string",
              "duration": "string (e.g., '12 reps', '4 reps', '20 reps')",
              "instructions": "string (optional)",
              "rest": "string (optional)"
            }
          ]
        }
      ]
    }

    Ensure the response is valid JSON and follows the exact structure above.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a fitness workout parser. Parse natural language workout descriptions and return structured JSON data. Always return valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error("No response from OpenAI");
    }

    console.log("AI Response:", responseText);

    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response as JSON:", responseText);
      throw new Error("Invalid JSON response from AI");
    }

    if (!parsedData.metadata || !parsedData.blocks) {
      throw new Error("Invalid workout structure from AI");
    }

    return NextResponse.json({
      success: true,
      data: parsedData,
    });
  } catch (error) {
    console.error("Error generating workout:", error);

    return NextResponse.json(
      {
        error: "Failed to generate workout",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
