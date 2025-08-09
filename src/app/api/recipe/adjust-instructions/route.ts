import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { instructions, originalServings, newServings, ratio } =
      await request.json();

    if (
      !instructions ||
      !Array.isArray(instructions) ||
      instructions.length === 0
    ) {
      return NextResponse.json(
        { error: "Instructions array is required" },
        { status: 400 }
      );
    }

    const prompt = `
      Adjust the following cooking instructions for a recipe that was originally for ${originalServings} serving(s) but now needs to serve ${newServings} serving(s) (ratio: ${ratio.toFixed(
      2
    )}x).

      Original instructions:
      ${instructions
        .map((instruction, index) => `${index + 1}. ${instruction}`)
        .join("\n")}

      Please adjust:
      - Cooking times (if needed based on quantity changes)
      - Pan sizes (if significantly more/less food)
      - Temperature adjustments (if needed)
      - Any quantity-specific mentions in the instructions
      - Keep the same cooking method and order of steps

      Rules:
      - Return ONLY a JSON array of adjusted instruction strings
      - Keep instructions clear and actionable
      - Don't add extra steps, just adjust existing ones
      - If no adjustment is needed for a step, keep it the same
      - For small ratio changes (0.8x to 1.2x), minimal adjustments needed
      - For large changes (2x+), consider cooking time and equipment adjustments
      - Round all quantities to practical cooking measurements (1/4, 1/2, 3/4, etc.)
      - Use common cooking fractions instead of decimals (e.g., "3/4 cup" not "0.75 cups")

      Return format: ["Step 1 instruction", "Step 2 instruction", ...]
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful cooking assistant that adjusts recipe instructions for different serving sizes. Always respond with valid JSON only, no additional text.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 1000,
    });

    const adjustedInstructionsData = completion.choices[0].message.content;

    if (!adjustedInstructionsData) {
      throw new Error("No response from OpenAI");
    }

    // Clean the response by removing markdown code blocks if present
    let cleanedData = adjustedInstructionsData.trim();
    if (cleanedData.startsWith("```json")) {
      cleanedData = cleanedData
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "");
    } else if (cleanedData.startsWith("```")) {
      cleanedData = cleanedData.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    // Parse the JSON response
    let adjustedInstructions;
    try {
      adjustedInstructions = JSON.parse(cleanedData);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Cleaned data:", cleanedData);
      console.error("Raw response:", adjustedInstructionsData);
      // Fallback to original instructions if parsing fails
      adjustedInstructions = instructions;
    }

    // Validate that result is an array
    if (!Array.isArray(adjustedInstructions)) {
      adjustedInstructions = instructions;
    }

    return NextResponse.json({ adjustedInstructions });
  } catch (error) {
    console.error("Instruction adjustment error:", error);
    return NextResponse.json(
      { error: "Failed to adjust instructions" },
      { status: 500 }
    );
  }
}
