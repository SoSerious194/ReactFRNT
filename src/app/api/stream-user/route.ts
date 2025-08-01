import { NextRequest, NextResponse } from "next/server";
import { StreamChat } from "stream-chat";

const serverClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY || "demo_key",
  process.env.STREAM_API_SECRET || "demo_secret"
);

export async function POST(request: NextRequest) {
  try {
    const { userId, userName } = await request.json();

    if (!userId || !userName) {
      return NextResponse.json(
        { error: "Missing userId or userName" },
        { status: 400 }
      );
    }

    // Check if we have proper API keys
    if (!process.env.STREAM_API_KEY || !process.env.STREAM_API_SECRET) {
      console.warn("GetStream API keys not configured, using demo mode");
      return NextResponse.json({
        success: true,
        demo: true,
        token: "demo_token",
      });
    }

    // Create or update the user in GetStream using server-side client
    try {
      await serverClient.upsertUser({
        id: userId,
        name: userName,
      });
      console.log(`User ${userName} (${userId}) created/updated in GetStream`);
    } catch (error) {
      console.error("Error creating user in GetStream:", error);
      return NextResponse.json(
        { error: "Failed to create user in GetStream" },
        { status: 500 }
      );
    }

    // Generate a token for the user
    const token = serverClient.createToken(userId);

    return NextResponse.json({
      success: true,
      token: token,
    });
  } catch (error) {
    console.error("Error in stream-user API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
