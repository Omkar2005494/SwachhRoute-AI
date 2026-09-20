/**
 * SwachhRoute AI — Ollama Local Client
 * 
 * Interacts with the local Ollama daemon (localhost:11434).
 * Enforces zero-cloud privacy, strict JSON mode, timeout controls,
 * and seamless failover to the deterministic rule-based fallback.
 */

import { buildComplaintAnalysisPrompt } from './promptBuilder';
import { validateComplaintAnalysis } from './schemaValidation';
import { runDeterministicFallback } from './deterministicFallback';
import { ComplaintAnalysis } from '@/types';

export const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
export const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b';

export interface OllamaHealthStatus {
  connected: boolean;
  model: string;
  hasModelInstalled: boolean;
  availableModels: string[];
  latencyMs?: number;
  error?: string;
}

export interface ComplaintAnalysisResult {
  analysis: ComplaintAnalysis;
  usedFallback: boolean;
  rawResponse?: string;
  validationErrors?: string[];
}

/**
 * Lightweight health check detecting whether Ollama is running and has the target model
 */
export async function checkOllamaHealth(): Promise<OllamaHealthStatus> {
  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return {
        connected: false,
        model: OLLAMA_MODEL,
        hasModelInstalled: false,
        availableModels: [],
        error: `Ollama returned HTTP ${res.status}`,
      };
    }

    const data = await res.json();
    const availableModels: string[] = (data?.models || []).map((m: any) => m.name || m.model);
    const hasModelInstalled = availableModels.some(
      (name) => name === OLLAMA_MODEL || name.startsWith(`${OLLAMA_MODEL}:`) || name.startsWith(OLLAMA_MODEL)
    );

    return {
      connected: true,
      model: OLLAMA_MODEL,
      hasModelInstalled,
      availableModels,
      latencyMs: Date.now() - startTime,
    };
  } catch (err: any) {
    return {
      connected: false,
      model: OLLAMA_MODEL,
      hasModelInstalled: false,
      availableModels: [],
      error: err?.message || 'Connection refused',
    };
  }
}

/**
 * Performs local NLU analysis on a citizen waste complaint
 */
export async function analyzeCitizenComplaint(
  complaintText: string
): Promise<ComplaintAnalysisResult> {
  const { systemPrompt, userPrompt } = buildComplaintAnalysisPrompt(complaintText);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s inference timeout

    const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        system: systemPrompt,
        prompt: userPrompt,
        format: 'json', // Forces Ollama grammar-constrained JSON mode
        stream: false,
        options: {
          temperature: 0.1, // Low temperature for deterministic, factual reasoning
          num_predict: 350,
        },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[Ollama Client] Request failed with HTTP ${res.status}. Triggering deterministic fallback.`);
      return {
        analysis: runDeterministicFallback(complaintText),
        usedFallback: true,
        validationErrors: [`Ollama returned HTTP ${res.status}`],
      };
    }

    const data = await res.json();
    const rawResponse = data.response;

    // Strict validation against domain schema
    const validation = validateComplaintAnalysis(rawResponse);

    if (validation.isValid) {
      return {
        analysis: validation.data,
        usedFallback: false,
        rawResponse,
      };
    }

    // Schema validation failed: do NOT trust invalid LLM output
    console.warn('[Ollama Client] LLM output failed schema validation. Falling back to rule-based analyzer.', validation.errors);
    return {
      analysis: runDeterministicFallback(complaintText),
      usedFallback: true,
      rawResponse,
      validationErrors: validation.errors,
    };
  } catch (err: any) {
    console.warn(`[Ollama Client] Error contacting Ollama daemon (${err?.message}). Engaging rule-based fallback.`);
    return {
      analysis: runDeterministicFallback(complaintText),
      usedFallback: true,
      validationErrors: [err?.message || 'Network error'],
    };
  }
}
