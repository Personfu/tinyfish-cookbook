import { NextRequest, NextResponse } from 'next/server';
import { parseTestDescription } from '@/lib/ai-client';

export async function POST(request: NextRequest) {
  try {
    const { plainEnglish, websiteUrl } = await request.json();

    if (!plainEnglish || !websiteUrl) {
      return NextResponse.json(
        { error: 'plainEnglish and websiteUrl are required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'OPENROUTER_API_KEY not configured' },
        { status: 500 }
      );
    }

    const result = await parseTestDescription(plainEnglish, websiteUrl);

    return NextResponse.json(result);
  } catch {
    console.error('Failed to parse test description');
    return NextResponse.json(
      { error: 'Failed to parse test description' },
      { status: 500 }
    );
  }
}
