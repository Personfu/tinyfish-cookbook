import { NextRequest, NextResponse } from 'next/server';
import { generateBugReport } from '@/lib/ai-client';
import { redactReportData, redactReportText } from '@/lib/report-privacy.mjs';
import type { TestCase, TestResult } from '@/types';

interface GenerateReportRequest {
  failedTest: TestResult;
  testCase: TestCase;
  projectUrl: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateReportRequest = await request.json();
    const { failedTest, testCase, projectUrl } = body;

    if (!failedTest || !testCase || !projectUrl) {
      return NextResponse.json(
        { error: 'failedTest, testCase, and projectUrl are required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'OPENROUTER_API_KEY not configured' },
        { status: 500 }
      );
    }

    const report = await generateBugReport(
      {
        title: redactReportText(testCase.title),
        description: redactReportText(testCase.description),
        expectedOutcome: redactReportText(testCase.expectedOutcome),
      },
      {
        error: redactReportText(failedTest.error),
        extractedData: redactReportData(failedTest.extractedData),
      },
      redactReportText(projectUrl)
    );

    return NextResponse.json(report);
  } catch {
    console.error('Failed to generate bug report');
    return NextResponse.json(
      { error: 'Failed to generate bug report' },
      { status: 500 }
    );
  }
}
