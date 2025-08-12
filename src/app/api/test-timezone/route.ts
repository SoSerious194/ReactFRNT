import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { time, timezone } = await request.json();
    
    if (!time) {
      return NextResponse.json({ error: "Time is required" }, { status: 400 });
    }
    
    const [localHours, localMinutes] = time.split(":").map(Number);
    const userTimezone = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    console.log(`Testing timezone conversion for ${time} in ${userTimezone}`);
    
    // Get local timezone offset
    const now = new Date();
    const localOffset = now.getTimezoneOffset(); // minutes
    
    // Create a date with the specified local time
    const localDate = new Date();
    localDate.setHours(localHours, localMinutes, 0, 0);
    
    // Convert to UTC by adding the offset
    const utcDate = new Date(localDate.getTime() + (localOffset * 60 * 1000));
    
    const utcHours = utcDate.getUTCHours();
    const utcMinutes = utcDate.getUTCMinutes();
    
    // Create cron expression
    const cronExpression = `${utcMinutes} ${utcHours} * * *`;
    
    return NextResponse.json({
      localTime: time,
      localTimezone: userTimezone,
      localOffset: localOffset,
      utcTime: `${utcHours.toString().padStart(2, '0')}:${utcMinutes.toString().padStart(2, '0')}`,
      cronExpression: cronExpression,
      explanation: `Local time ${time} in ${userTimezone} (offset: ${localOffset} minutes) converts to UTC ${utcHours}:${utcMinutes}`
    });
    
  } catch (error) {
    console.error("Error testing timezone conversion:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
