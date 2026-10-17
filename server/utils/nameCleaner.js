const NOISE_WORDS = new Set([
  'resume', 'cv', 'updated', 'optimized', 'ats', 'latest', 'final', 'new',
  'copy', 'format', 'difficulty', 'rating', 'document', 'docx', 'pdf', 'doc',
  'job', 'profile', 'applicant', 'candidate', 'draft', 'version', 'v1', 'v2', 'v3'
]);

/**
 * Clean candidate name based on strict priority:
 * 1. Parsed name extracted from resume text (if reliable)
 * 2. Clean fallback derived from filename (removing noise, extensions, numbers in brackets)
 * 3. Fallback to 'Unknown Candidate'
 */
function cleanCandidateName(parsedName, originalFilename = '', email = '') {
  // 1. Check if parsedName is reliable and clean
  if (parsedName && typeof parsedName === 'string' && parsedName.trim()) {
    const trimmed = parsedName.trim();
    if (
      trimmed !== 'Unknown Candidate' &&
      trimmed !== 'Candidate' &&
      !/\.(pdf|docx|doc)$/i.test(trimmed) &&
      !/^\d+$/.test(trimmed) &&
      trimmed.length >= 2
    ) {
      // Strip any trailing noise words from parsed name if present
      const words = trimmed.split(/\s+/).filter((w) => !NOISE_WORDS.has(w.toLowerCase()));
      if (words.length > 0) {
        return formatTitleCase(words.join(' '));
      }
    }
  }

  // 2. Clean filename fallback
  let text = originalFilename || '';

  // Remove extension
  text = text.replace(/\.(pdf|docx|doc)$/i, '');

  // Remove numbers in brackets or parentheses e.g. (30), [1], (2), (4)
  text = text.replace(/[\(\[\{]\s*\d+\s*[\)\]\}]/g, '');

  // Replace underscores, dashes, and dots with spaces
  text = text.replace(/[_.-]+/g, ' ');

  // Remove standalone numbers (e.g., 500, 1415, 30)
  text = text.replace(/\b\d+\b/g, '');

  // Filter out noise words
  const words = text.split(/\s+/);
  const cleanWords = words.filter((w) => {
    const cleanWord = w.replace(/[^a-zA-Z]/g, '');
    return cleanWord.length >= 2 && !NOISE_WORDS.has(cleanWord.toLowerCase());
  });

  if (cleanWords.length > 0) {
    return formatTitleCase(cleanWords.join(' '));
  }

  // 3. Fallback from email prefix if filename was numeric
  if (email && email.includes('@')) {
    const emailPrefix = email.split('@')[0].replace(/[._-]+/g, ' ');
    if (emailPrefix.trim() && emailPrefix.trim().length >= 2) {
      return formatTitleCase(emailPrefix.trim());
    }
  }

  return 'Unknown Candidate';
}

function formatTitleCase(str) {
  return str
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

module.exports = { cleanCandidateName };
