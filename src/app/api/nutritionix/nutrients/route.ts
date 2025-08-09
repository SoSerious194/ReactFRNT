import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const response = await fetch('https://trackapi.nutritionix.com/v2/natural/nutrients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-app-id': process.env.NUTRITIONIX_APP_ID!,
        'x-app-key': process.env.NUTRITIONIX_APP_KEY!,
      },
      body: JSON.stringify({
        query: query,
      }),
    });

    if (!response.ok) {
      throw new Error(`Nutritionix API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Nutritionix API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nutrition data' },
      { status: 500 }
    );
  }
}
