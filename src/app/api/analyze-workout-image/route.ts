import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    // Analyze the image using OpenAI Vision
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
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    const analysis = response.choices[0]?.message?.content;

    if (!analysis) {
      return NextResponse.json(
        { error: "Failed to analyze image" },
        { status: 500 }
      );
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Error analyzing image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
