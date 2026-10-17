const NOISE_WORDS = new Set([
  'resume', 'cv', 'updated', 'optimized', 'ats', 'latest', 'final', 'new',
  'copy', 'format', 'difficulty', 'rating', 'document', 'docx', 'pdf', 'doc',
  'job', 'profile', 'applicant', 'candidate', 'draft', 'version', 'v1', 'v2', 'v3'
]);

/**
 * Clean candidate name for frontend display:
 * 1. Return cand.name if it exists and doesn't contain filename extensions or noise words
 * 2. Fallback to clean filename derivation (removing noise words, numbers in brackets)
 * 3. Fallback to 'Unknown Candidate'
 */
export const cleanCandidateName = (cand) => {
  if (!cand) return 'Unknown Candidate';

  const rawName = cand.name || '';
  const filename = cand.resumeOriginalName || '';

  // If candidate name exists and is already clean
  if (
    rawName &&
    rawName !== 'Unknown Candidate' &&
    rawName !== 'Candidate' &&
    !/\.(pdf|docx|doc)$/i.test(rawName) &&
    !/^\d+$/.test(rawName.trim())
  ) {
    const words = rawName.trim().split(/\s+/).filter((w) => !NOISE_WORDS.has(w.toLowerCase()));
    if (words.length > 0) {
      return formatTitleCase(words.join(' '));
    }
  }

  // 2. Clean filename fallback
  let text = filename || '';

  // Remove extension
  text = text.replace(/\.(pdf|docx|doc)$/i, '');

  // Remove numbers in brackets or parentheses like (30), [1], (2), (4)
  text = text.replace(/[\(\[\{]\s*\d+\s*[\)\]\}]/g, '');

  // Replace underscores, dashes, dots with spaces
  text = text.replace(/[_.-]+/g, ' ');

  // Remove standalone numbers
  text = text.replace(/\b\d+\b/g, '');

  const words = text.split(/\s+/);
  const cleanWords = words.filter((w) => {
    const cleanWord = w.replace(/[^a-zA-Z]/g, '');
    return cleanWord.length >= 2 && !NOISE_WORDS.has(cleanWord.toLowerCase());
  });

  if (cleanWords.length > 0) {
    return formatTitleCase(cleanWords.join(' '));
  }

  if (cand.email && cand.email.includes('@')) {
    const emailUser = cand.email.split('@')[0].replace(/[._-]+/g, ' ').trim();
    if (emailUser && emailUser.length >= 2) return formatTitleCase(emailUser);
  }

  return 'Unknown Candidate';
};

const formatTitleCase = (str) => {
  return str
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};
