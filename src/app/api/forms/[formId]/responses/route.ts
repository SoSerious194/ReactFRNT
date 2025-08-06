import { NextRequest, NextResponse } from "next/server";
import { FormService } from "@/lib/formServices";

export async function POST(
  request: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {
    const { clientId, responses } = await request.json();

    if (!clientId || !responses) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const formService = new FormService();
    const success = await formService.submitFormResponse(
      params.formId,
      clientId,
      responses
    );

    if (!success) {
      return NextResponse.json(
        { error: "Failed to submit response" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error submitting form response:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
