import { NextResponse } from 'next/server';
import { checkOllamaHealth } from '@/services/ai';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const health = await checkOllamaHealth();
    return NextResponse.json(health);
  } catch (err: any) {
    return NextResponse.json(
      {
        connected: false,
        model: 'llama3.2:3b',
        hasModelInstalled: false,
        availableModels: [],
        error: err?.message || 'Failed to check Ollama health',
      },
      { status: 500 }
    );
  }
}
