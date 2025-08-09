import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`https://trackapi.nutritionix.com/v2/search/instant?query=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'x-app-id': process.env.NUTRITIONIX_APP_ID!,
        'x-app-key': process.env.NUTRITIONIX_APP_KEY!,
      },
    });

    if (!response.ok) {
      throw new Error(`Nutritionix API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Nutritionix search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search ingredients' },
      { status: 500 }
    );
  }
}
