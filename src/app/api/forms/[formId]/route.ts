import { NextRequest, NextResponse } from "next/server";
import { FormService } from "@/lib/formServices";

export async function GET(
  request: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {
    const formService = new FormService();
    const form = await formService.getFormForMobile(params.formId);

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    return NextResponse.json({ form });
  } catch (error) {
    console.error("Error fetching form:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
