import { NextRequest, NextResponse } from 'next/server';
import { analyzeCitizenComplaint } from '@/services/ai';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description, reportId } = body;

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Complaint description is required and must be non-empty.',
        },
        { status: 400 }
      );
    }

    // Call server-side Ollama client with fallback
    const result = await analyzeCitizenComplaint(description);

    return NextResponse.json({
      success: true,
      reportId,
      analysis: result.analysis,
      usedFallback: result.usedFallback,
      validationErrors: result.validationErrors,
    });
  } catch (err: any) {
    console.error('[API analyze-complaint error]:', err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Internal server error during AI analysis',
      },
      { status: 500 }
    );
  }
}
