/**
 * Text Cleaning & Sanitization Service
 * Prepares raw citizen input before passing to AI understanding services.
 */

export interface CleanedTextResult {
  originalText: string;
  cleanedText: string;
  wordCount: number;
  extractedLandmarks: string[];
}

/**
 * Common landmark indicators in urban reporting
 */
const LANDMARK_PATTERNS = [
  /near\s+([A-Za-z0-9\s]+?)(?:,|\.|\band\b|$)/gi,
  /opposite\s+([A-Za-z0-9\s]+?)(?:,|\.|\band\b|$)/gi,
  /behind\s+([A-Za-z0-9\s]+?)(?:,|\.|\band\b|$)/gi,
  /next to\s+([A-Za-z0-9\s]+?)(?:,|\.|\band\b|$)/gi,
  /at\s+([A-Za-z0-9\s]+?)(?:junction|signal|road|cross|main|circle)/gi,
];

/**
 * Sanitizes input text: trims, strips control characters, normalizes whitespace
 */
export function cleanComplaintText(input: string): CleanedTextResult {
  if (!input || typeof input !== 'string') {
    return {
      originalText: '',
      cleanedText: '',
      wordCount: 0,
      extractedLandmarks: [],
    };
  }

  const originalText = input;

  // Remove unprintable control characters, normalize newlines/spaces
  const cleaned = input
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Extract potential landmarks safely
  const landmarks: string[] = [];
  for (const pattern of LANDMARK_PATTERNS) {
    const matches = Array.from(cleaned.matchAll(pattern));
    for (const match of matches) {
      if (match[1] && match[1].trim().length > 2) {
        landmarks.push(match[1].trim());
      }
    }
  }

  const wordCount = cleaned.length > 0 ? cleaned.split(/\s+/).length : 0;

  return {
    originalText,
    cleanedText: cleaned,
    wordCount,
    extractedLandmarks: Array.from(new Set(landmarks)),
  };
}
