import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  TemplateGenerationRequest,
  TemplateGenerationResponse,
} from "@/types/messageScheduler";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: TemplateGenerationRequest = await request.json();
    const { category, context, tone, target_audience, specific_goals } = body;

    // Validate required fields
    if (!category) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is configured
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // Build the prompt for OpenAI
    const prompt = buildPrompt(
      category,
      context,
      tone,
      target_audience,
      specific_goals
    );

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a professional fitness coach assistant. Generate engaging, personalized message templates for coaches to send to their clients. Keep messages concise, motivational, and actionable.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI API error:", error);
      return NextResponse.json(
        { error: "Failed to generate template" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const generatedContent = data.choices[0]?.message?.content;

    if (!generatedContent) {
      return NextResponse.json(
        { error: "No content generated" },
        { status: 500 }
      );
    }

    // Parse the generated content
    const parsed = parseGeneratedContent(generatedContent);

    const result: TemplateGenerationResponse = {
      title: parsed.title,
      content: parsed.content,
      suggestions: parsed.suggestions,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating template:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function buildPrompt(
  category: string,
  context?: string,
  tone?: string,
  target_audience?: string,
  specific_goals?: string[]
): string {
  let prompt = `Generate a message template for a fitness coach with the following specifications:

Category: ${category}
${tone ? `Tone: ${tone}` : ""}
${target_audience ? `Target Audience: ${target_audience}` : ""}
${context ? `Context: ${context}` : ""}
${
  specific_goals && specific_goals.length > 0
    ? `Specific Goals: ${specific_goals.join(", ")}`
    : ""
}

IMPORTANT REQUIREMENTS:
- Do NOT include any client names or personal references
- Use generic, professional language that works for any client
- Keep messages concise and actionable
- Focus on motivation, encouragement, and clear next steps
- Maximum 200 words for the main content

Please provide:
1. A compelling title (max 50 characters)
2. The message content (max 200 words)
3. 3-5 alternative suggestions for different variations

Format your response EXACTLY as follows:
TITLE: [title]
CONTENT: [content]
SUGGESTIONS:
- [suggestion 1]
- [suggestion 2]
- [suggestion 3]
- [suggestion 4]
- [suggestion 5]

Make the message engaging, professional, and actionable without using any specific names.`;

  return prompt;
}

function parseGeneratedContent(content: string): {
  title: string;
  content: string;
  suggestions: string[];
} {
  // Clean up the content
  const cleanContent = content.trim();

  // If content is too short or incomplete, return default
  if (cleanContent.length < 20) {
    return {
      title: "Generated Template",
      content:
        "Thank you for your dedication to your fitness journey! Keep up the great work and stay consistent with your goals.",
      suggestions: [
        "Keep up the great work!",
        "You're making amazing progress!",
        "Stay consistent and results will follow!",
        "Your dedication is inspiring!",
        "Every step forward counts!",
      ],
    };
  }

  const lines = cleanContent
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);

  let title = "";
  let messageContent = "";
  let suggestions: string[] = [];

  let currentSection = "";

  for (const line of lines) {
    if (line.startsWith("TITLE:")) {
      title = line.replace("TITLE:", "").trim();
    } else if (line.startsWith("CONTENT:")) {
      messageContent = line.replace("CONTENT:", "").trim();
    } else if (line.startsWith("SUGGESTIONS:")) {
      currentSection = "suggestions";
    } else if (currentSection === "suggestions" && line.startsWith("-")) {
      suggestions.push(line.replace("-", "").trim());
    }
  }

  // Fallback parsing if structured format fails
  if (!title || !messageContent) {
    const sections = cleanContent.split("\n\n");
    if (sections.length >= 2) {
      title = sections[0].replace(/^.*?:/, "").trim();
      messageContent = sections[1].replace(/^.*?:/, "").trim();

      // Extract suggestions from remaining sections
      for (let i = 2; i < sections.length; i++) {
        const suggestion = sections[i].replace(/^[-•*]\s*/, "").trim();
        if (suggestion && suggestion.length > 5) {
          suggestions.push(suggestion);
        }
      }
    }
  }

  // If still no content, treat the entire response as content
  if (!title && !messageContent) {
    const words = cleanContent.split(" ");
    if (words.length <= 10) {
      title = "Generated Template";
      messageContent = cleanContent;
    } else {
      title = words.slice(0, 3).join(" ") + "...";
      messageContent = cleanContent;
    }
  }

  // Ensure we have at least some content
  if (!title) title = "Generated Template";
  if (!messageContent) {
    messageContent =
      "Thank you for your dedication to your fitness journey! Keep up the great work and stay consistent with your goals.";
  }

  if (suggestions.length === 0) {
    suggestions = [
      "Keep up the great work!",
      "You're making amazing progress!",
      "Stay consistent and results will follow!",
      "Your dedication is inspiring!",
      "Every step forward counts!",
    ];
  }

  // Clean up any incomplete content
  if (messageContent.length < 10) {
    messageContent =
      "Thank you for your dedication to your fitness journey! Keep up the great work and stay consistent with your goals.";
  }

  return { title, content: messageContent, suggestions };
}
