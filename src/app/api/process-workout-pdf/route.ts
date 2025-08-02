import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  try {
    // Import pdf-parse with dynamic import
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(pdfBuffer);
    return data.text;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  console.log("API route hit: /api/process-workout-pdf");
  try {
    const { pdfBase64 } = await request.json();
    console.log("Received pdfBase64 length:", pdfBase64?.length || 0);

    if (!pdfBase64) {
      return NextResponse.json(
        { error: "PDF data is required" },
        { status: 400 }
      );
    }

    // Convert base64 to buffer
    const pdfBuffer = Buffer.from(pdfBase64, "base64");

    // Extract text from PDF using pdf-parse with dynamic import
    let pdfText: string;
    try {
      pdfText = await extractTextFromPDF(pdfBuffer);
    } catch (parseError) {
      console.error("Error parsing PDF:", parseError);
      const errorMessage =
        parseError instanceof Error
          ? parseError.message
          : "Unknown parsing error";
      console.error("Parse error details:", {
        name: parseError instanceof Error ? parseError.name : "Unknown",
        message: errorMessage,
        stack: parseError instanceof Error ? parseError.stack : undefined,
      });
      return NextResponse.json(
        { error: "Failed to parse PDF", details: errorMessage },
        { status: 400 }
      );
    }

    // Create a structured prompt for parsing workout data
    const prompt = `
Parse the following workout PDF text and extract structured workout data. Return the result as a valid JSON object.

PDF Text:
${pdfText}

Please extract and structure the following information:

1. Workout Metadata:
   - title: The workout title
   - creator: The creator's name (if available)
   - date: The date (if available)
   - description: Any description or instructions
   - difficulty: Estimated difficulty level
   - equipment: List of equipment needed
   - duration: Total workout duration

2. Workout Blocks/Sections:
   - Each section should be a block with:
     - name: Section name (e.g., "EMOM #1 - Interval", "Full Body Warm Up")
     - type: Section type ("normal", "superset", "circuit")
       * IMPORTANT: Analyze the exercise pattern to intelligently determine the type:
         - "normal": Each exercise appears only once, done sequentially without repetition
         - "circuit": Same exercises repeat in rounds/cycles, or AMRAP style repetition
         - "superset": Two exercises paired together, done back-to-back
         - "warmup": Warm-up exercises at the beginning
         - "cooldown": Cool-down exercises at the end
       * Look for these patterns to determine type:
         - EMOM (time-based intervals) → usually "normal"
         - AMRAP (repetition-based) → usually "circuit" 
         - Interval (fixed work/rest with repetition) → usually "circuit"
         - Repeating exercise sequences → "circuit"
         - Paired exercises → "superset"
         - Warm-up sections → "warmup"
         - Cool-down sections → "cooldown"
         - Regular exercises → "normal"
       * Count exercise repetitions and analyze sequence patterns to make the determination
     - duration: Section duration (e.g., "3:45 mins")
     - exercises: Array of exercises in this section

3. Exercises:
   - Each exercise should have:
     - name: Exercise name
     - duration: Exercise duration (e.g., "1 min", "30 min")
     - instructions: Any specific instructions (e.g., "Right leg only", "Each side")
     - rest: Rest period after exercise (e.g., "REST", "45s")

4. Handle exercise name variations:
   - "BB" should be expanded to "Barbell"
   - "DB" should be expanded to "Dumbbell"
   - "BW" should be expanded to "Bodyweight"
   - "Assisted" should be noted in instructions

5. Handle special instructions:
   - "switch side each round" → Add to exercise notes
   - "Single leg - switch side each round" → Add to exercise notes
   - "Each side" → Add to exercise notes
   - "hold the fifth rep for 20 seconds" → Add to exercise notes
   - "Right leg only" / "Left leg only" → Add to exercise notes

6. Handle repeating exercises:
   - If the same exercise appears multiple times in sequence, it indicates a circuit
   - Track exercise repetition patterns to determine workout structure

Return the data in this exact JSON structure:
{
  "metadata": {
    "title": "string",
    "creator": "string (optional)",
    "date": "string (optional)",
    "description": "string (optional)",
    "difficulty": "string (optional)",
    "equipment": ["string array"],
    "duration": "string (optional)"
  },
  "blocks": [
    {
      "name": "string",
      "type": "normal" | "circuit" | "superset" | "warmup" | "cooldown",
      "duration": "string (optional)",
      "exercises": [
        {
          "name": "string",
          "duration": "string (optional)",
          "instructions": "string (optional)",
          "rest": "string (optional)"
        }
      ]
    }
  ]
}

Ensure the response is valid JSON and follows the exact structure above.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a fitness workout parser. Parse workout PDFs and return structured JSON data. Always return valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.1, // Low temperature for consistent parsing
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error("No response from OpenAI");
    }

    // Parse the JSON response
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response as JSON:", responseText);
      throw new Error("Invalid JSON response from AI");
    }

    // Validate the structure
    if (!parsedData.metadata || !parsedData.blocks) {
      throw new Error("Invalid workout structure from AI");
    }

    return NextResponse.json({
      success: true,
      data: parsedData,
    });
  } catch (error) {
    console.error("Error processing workout PDF:", error);

    return NextResponse.json(
      {
        error: "Failed to process workout PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
