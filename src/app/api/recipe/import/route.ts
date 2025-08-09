import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import * as cheerio from "cheerio";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Step 1: Scrape the webpage content
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract relevant content from the page
    let content = "";

    // Try to find recipe-specific content first
    const recipeSelectors = [
      '[itemtype*="Recipe"]',
      ".recipe",
      ".recipe-content",
      ".recipe-card",
      "[data-recipe]",
      ".entry-content",
      ".post-content",
      "main",
      "article",
    ];

    let foundRecipeContent = false;
    for (const selector of recipeSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text().trim();
        foundRecipeContent = true;
        break;
      }
    }

    // Fallback to body content if no recipe-specific content found
    if (!foundRecipeContent || content.length < 100) {
      content = $("body").text().trim();
    }

    // Clean up the content
    content = content
      .replace(/\s+/g, " ")
      .replace(/\n+/g, "\n")
      .trim()
      .substring(0, 8000); // Limit content length for OpenAI

    // Step 2: Use OpenAI to extract recipe information
    const prompt = `
      Extract recipe information from the following webpage content and return it as a JSON object with the following structure:
      
      {
        "name": "Recipe name",
        "shortDescription": "One sentence description of the recipe",
        "description": "Brief description",
        "servings": number,
        "prepTime": number (in minutes),
        "cookTime": number (in minutes), 
        "difficulty": "Beginner" | "Intermediate" | "Advanced",
        "mealType": "breakfast" | "lunch" | "dinner" | "snack",
        "dietaryTag": "High Protein" | "Antioxidants" | "Low Carb" | "Heart Healthy" | "Anti-Inflammatory" | "Fiber Rich" (optional),
        "ingredients": [
          {
            "name": "ingredient name",
            "quantity": number,
            "unit": "unit (cups, tbsp, oz, etc.)"
          }
        ],
        "instructions": [
          "Step 1 instruction",
          "Step 2 instruction"
        ]
      }

      Rules:
      - Extract actual recipe data, not ads or unrelated content
      - Convert all time measurements to minutes
      - Standardize ingredient units (cup, tbsp, tsp, oz, lb, g, kg, etc.)
      - Make instructions clear and actionable
      - If difficulty is not specified, infer from complexity
      - If meal type is not clear, infer from recipe type
      - For shortDescription, create a concise one-sentence summary of what the recipe is
      - For dietaryTag, analyze the ingredients and determine the best fit (optional, omit if unclear)
      - Only include actual cooking/preparation instructions, not serving suggestions
      - Ensure all numeric values are actual numbers, not strings

      Webpage content:
      ${content}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that extracts recipe information from webpage content. Always respond with valid JSON only, no additional text.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 2000,
    });

    const extractedData = completion.choices[0].message.content;

    if (!extractedData) {
      throw new Error("No response from OpenAI");
    }

    // Clean the response by removing markdown code blocks if present
    let cleanedData = extractedData.trim();
    if (cleanedData.startsWith("```json")) {
      cleanedData = cleanedData
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "");
    } else if (cleanedData.startsWith("```")) {
      cleanedData = cleanedData.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    // Parse the JSON response
    let recipeData;
    try {
      recipeData = JSON.parse(cleanedData);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Cleaned data:", cleanedData);
      console.error("Raw response:", extractedData);
      throw new Error("Failed to parse recipe data from AI response");
    }

    return NextResponse.json(recipeData);
  } catch (error) {
    console.error("Recipe import error:", error);
    return NextResponse.json(
      { error: "Failed to import recipe. Please check the URL and try again." },
      { status: 500 }
    );
  }
}
