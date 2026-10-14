export const OFFICIAL_ABBREVIATIONS: Record<string, string> = {
  'Healthcare & Wellness': 'HCW',
  'Agriculture & Smart Farming': 'ASF',
  'Environment & Sustainability': 'ENV',
  'Water Management': 'WMG',
  'Education & Skill Development': 'ESD',
  'Smart Cities & Transportation': 'SCT',
  'Energy & Renewable Energy': 'ERE',
  'Industry 4.0 & Manufacturing': 'I4M',
  'Rural Development & Social Innovation': 'RDS',
  'Food Technology & Nutrition': 'FTN',
};

export const RESERVED_ABBREVIATIONS = new Set(Object.values(OFFICIAL_ABBREVIATIONS));

const ABBREVIATION_REGEX = /^[A-Z0-9]{3}$/;

export function isValidAbbreviation(abbr: string): boolean {
  return ABBREVIATION_REGEX.test(abbr);
}

// Stop words that are ignored when identifying primary words if sufficient words exist
const STOP_WORDS = new Set(['AND', '&', 'THE', 'OF', 'IN', 'FOR', 'ON', 'WITH', 'AT', 'BY', 'TO']);

/**
 * Deterministically generates a 3-character uppercase alphanumeric abbreviation
 * from a custom problem area title.
 */
export function generateCustomAbbreviation(title: string): string {
  if (!title || typeof title !== 'string') {
    throw new Error('Custom title is required to generate an abbreviation');
  }

  // 1. Normalize, remove punctuation, trim
  const cleanStr = title.replace(/[^a-zA-Z0-9\s]/g, ' ').trim();
  const rawWords = cleanStr.split(/\s+/).filter(Boolean);

  if (rawWords.length === 0) {
    throw new Error('Title does not contain any alphanumeric characters');
  }

  // Filter stop words if we have at least 3 words after filtering
  const significantWords = rawWords.filter(w => !STOP_WORDS.has(w.toUpperCase()));
  const words = significantWords.length >= 2 ? significantWords : rawWords;

  let candidate = '';

  if (words.length >= 3) {
    // Take first character of first three meaningful words
    candidate = words[0][0] + words[1][0] + words[2][0];
  } else if (words.length === 2) {
    // First two initials + third meaningful character
    const firstWord = words[0];
    const secondWord = words[1];
    let thirdChar = '';
    if (secondWord.length > 1) {
      thirdChar = secondWord[1];
    } else if (firstWord.length > 1) {
      thirdChar = firstWord[1];
    } else {
      thirdChar = 'X';
    }
    candidate = firstWord[0] + secondWord[0] + thirdChar;
  } else {
    // One word: use its first three alphanumeric characters
    const singleWord = words[0];
    if (singleWord.length >= 3) {
      candidate = singleWord.slice(0, 3);
    } else if (singleWord.length === 2) {
      candidate = singleWord + 'X';
    } else {
      candidate = singleWord + 'XX';
    }
  }

  candidate = candidate.toUpperCase();

  // Ensure candidate is alphanumeric; if any char is invalid, replace
  candidate = candidate.replace(/[^A-Z0-9]/g, 'X');
  while (candidate.length < 3) {
    candidate += 'X';
  }
  candidate = candidate.slice(0, 3);

  // Check for conflicts with reserved official abbreviations
  if (RESERVED_ABBREVIATIONS.has(candidate)) {
    candidate = resolveAbbreviationCollision(candidate, cleanStr);
  }

  return candidate;
}

/**
 * Deterministically resolves abbreviation collisions with reserved official abbreviations
 */
function resolveAbbreviationCollision(collided: string, context: string): string {
  // Strategy: Try replacing the last character with a deterministic alternative or numeric suffix
  const alphanumOnly = context.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  
  // Try using characters from the context string that haven't been used yet
  for (let i = 2; i < alphanumOnly.length; i++) {
    const testCandidate = collided.slice(0, 2) + alphanumOnly[i];
    if (!RESERVED_ABBREVIATIONS.has(testCandidate) && isValidAbbreviation(testCandidate)) {
      return testCandidate;
    }
  }

  // Fallback to stable numeric suffixes (e.g. HC1, HC2...)
  for (let digit = 1; digit <= 9; digit++) {
    const testCandidate = collided.slice(0, 2) + digit;
    if (!RESERVED_ABBREVIATIONS.has(testCandidate)) {
      return testCandidate;
    }
  }

  // Final fallback
  return collided.slice(0, 2) + 'Z';
}
