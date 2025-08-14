import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { AIGenerationRequest, AIGenerationResponse } from "@/types/aiMessaging";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body: AIGenerationRequest = await request.json();
    const { context_data, ai_tone, personalization_level } = body;

    // Build the prompt based on context
    const prompt = buildAIPrompt(context_data, ai_tone, personalization_level);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an AI personal trainer assistant. Your job is to generate personalized, encouraging messages for clients based on their achievements and progress. 

Key guidelines:
- Keep messages concise (1-2 sentences maximum)
- Be authentic and genuine, not overly promotional
- Match the specified tone: ${ai_tone}
- Use the client's name when available
- Reference specific achievements when possible
- Be encouraging but not pushy
- Avoid generic fitness clichés
- Make it feel personal and human

Personalization level: ${personalization_level}
- Low: Generic but encouraging
- Medium: Include some specific details
- High: Highly personalized with specific achievements and context`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const generatedContent = completion.choices[0]?.message?.content?.trim();

    if (!generatedContent) {
      throw new Error("No content generated");
    }

    const response: AIGenerationResponse = {
      content: generatedContent,
      context_used: [
        context_data.event_type,
        context_data.event_data.exercise_name ||
          context_data.event_data.workout_name ||
          "achievement",
      ].filter(Boolean),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("AI message generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate AI message" },
      { status: 500 }
    );
  }
}

function buildAIPrompt(
  contextData: any,
  aiTone: string,
  personalizationLevel: string
): string {
  const { event_type, event_data, client_name, coach_name } = contextData;

  let prompt = `Generate a personalized message for ${
    client_name || "the client"
  } from ${coach_name || "their coach"}. `;
  prompt += `Tone: ${aiTone}. Personalization: ${personalizationLevel}. `;

  switch (event_type) {
    case "new_pr":
      prompt += `The client just set a new personal record: ${event_data.exercise_name} - ${event_data.weight}lbs for ${event_data.reps} reps. `;
      if (event_data.previous_pr) {
        prompt += `Previous PR was ${event_data.previous_pr}lbs. `;
      }
      prompt += `Celebrate this achievement and encourage them to keep pushing.`;
      break;

    case "workout_completed":
      prompt += `The client just completed a workout: ${
        event_data.workout_name || "their workout"
      }. `;
      if (event_data.duration) {
        prompt += `Duration: ${event_data.duration} minutes. `;
      }
      if (event_data.exercises_count) {
        prompt += `Completed ${event_data.exercises_count} exercises. `;
      }
      prompt += `Acknowledge their effort and consistency.`;
      break;

    case "streak_milestone":
      prompt += `The client reached a ${event_data.streak_type} streak milestone: ${event_data.streak_count} days! `;
      prompt += `Celebrate their consistency and dedication.`;
      break;

    case "weight_goal":
      prompt += `The client achieved a weight goal: ${event_data.goal_type}. `;
      if (event_data.current_value && event_data.target_value) {
        prompt += `Current: ${event_data.current_value}, Target: ${event_data.target_value}. `;
      }
      prompt += `Congratulate them on their progress.`;
      break;

    case "consistency_milestone":
      prompt += `The client has been consistent for ${event_data.days_consistent} days with their ${event_data.consistency_type} routine. `;
      prompt += `Acknowledge their dedication and consistency.`;
      break;

    case "first_workout":
      prompt += `The client completed their first workout! `;
      if (event_data.program_name) {
        prompt += `Program: ${event_data.program_name}. `;
      }
      prompt += `Welcome them and encourage them to keep going.`;
      break;

    case "program_completion":
      prompt += `The client completed their program! `;
      if (event_data.program_duration) {
        prompt += `Duration: ${event_data.program_duration} days. `;
      }
      if (event_data.total_workouts) {
        prompt += `Total workouts: ${event_data.total_workouts}. `;
      }
      prompt += `Congratulate them on this major achievement.`;
      break;

    case "exercise_milestone":
      prompt += `The client reached an exercise milestone: ${event_data.milestone_type}. `;
      if (event_data.exercise_count) {
        prompt += `Completed ${event_data.exercise_count} exercises. `;
      }
      prompt += `Acknowledge their progress and variety.`;
      break;

    default:
      prompt += `The client achieved something noteworthy. Send an encouraging message.`;
  }

  return prompt;
}
