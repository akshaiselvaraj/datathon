/**
 * Simple utility to check if the query contains Kannada characters.
 * Kannada Unicode Block: U+0C80 to U+0CFF
 */
export function detectLanguage(text) {
  if (!text) return 'en';
  
  const kannadaPattern = /[\u0C80-\u0CFF]/;
  if (kannadaPattern.test(text)) {
    return 'kn';
  }
  return 'en';
}
