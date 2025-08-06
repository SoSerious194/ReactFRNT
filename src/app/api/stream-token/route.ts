import { NextRequest, NextResponse } from "next/server";
import { StreamChat } from "stream-chat";

const serverClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY || "demo_key",
  process.env.STREAM_API_SECRET || "demo_secret"
);

export async function POST(request: NextRequest) {
  try {
    const { userId, userName } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    // Check if we have proper API keys
    if (!process.env.STREAM_API_KEY || !process.env.STREAM_API_SECRET) {
      console.warn("GetStream API keys not configured, using demo mode");
      return NextResponse.json({ 
        success: true, 
        demo: true,
        token: "demo_token"
      });
    }

    // Create or update the user in GetStream if userName is provided
    if (userName) {
      try {
        await serverClient.upsertUser({
          id: userId,
          name: userName,
        });
        console.log(`User ${userName} (${userId}) created/updated in GetStream`);
      } catch (error) {
        console.error("Error creating user in GetStream:", error);
        // Continue anyway, the user might already exist
      }
    }

    // Generate a token for the user
    const token = serverClient.createToken(userId);

    return NextResponse.json({ 
      success: true,
      token: token
    });
  } catch (error) {
    console.error("Error generating Stream token:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
