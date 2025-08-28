import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("=== Main Subscription API Called ===");

    const requestBody = await request.json();
    console.log("Request body:", requestBody);

    const { action, ...data } = requestBody;

    if (!action) {
      console.error("No action specified in request");
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 }
      );
    }

    console.log("Action requested:", action);

    // Route to appropriate handler based on action
    switch (action) {
      case "create-checkout":
        return await handleCreateCheckout(request, data);
      case "cancel":
        return await handleCancel(request, data);
      case "status":
        return await handleStatus(request, data);
      default:
        console.error("Unknown action:", action);
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in main subscription API:", error);
    return NextResponse.json(
      {
        error: "Failed to perform subscription action",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function handleCreateCheckout(request: NextRequest, data: any) {
  try {
    console.log("Handling create-checkout action");

    // Import the create-checkout handler
    const { POST: createCheckoutHandler } = await import(
      "./create-checkout/route"
    );

    // Create a new request with the data
    const newRequest = new NextRequest(request.url, {
      method: "POST",
      headers: request.headers,
      body: JSON.stringify(data),
    });

    return await createCheckoutHandler(newRequest);
  } catch (error) {
    console.error("Error in create-checkout handler:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

async function handleCancel(request: NextRequest, data: any) {
  try {
    console.log("Handling cancel action");

    // Import the cancel handler
    const { POST: cancelHandler } = await import("./cancel/route");

    // Create a new request with the data
    const newRequest = new NextRequest(request.url, {
      method: "POST",
      headers: request.headers,
      body: JSON.stringify(data),
    });

    return await cancelHandler(newRequest);
  } catch (error) {
    console.error("Error in cancel handler:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}

async function handleStatus(request: NextRequest, data: any) {
  try {
    console.log("Handling status action");

    // Import the status handler
    const { GET: statusHandler } = await import("./status/route");

    // Create a new request with the data
    const newRequest = new NextRequest(request.url, {
      method: "GET",
      headers: request.headers,
    });

    return await statusHandler(newRequest);
  } catch (error) {
    console.error("Error in status handler:", error);
    return NextResponse.json(
      { error: "Failed to get subscription status" },
      { status: 500 }
    );
  }
}
