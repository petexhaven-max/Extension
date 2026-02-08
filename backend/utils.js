import crypto from 'crypto';

export function generateId(title, link) {
  return crypto.createHash('md5').update(title + link).digest('hex');
}

export function summarize(text, maxLength = 200) {
  // Ultra-short, high-signal summary: Take first sentence if under limit, else truncate.
  if (!text) return '';
  const firstSentenceEnd = text.indexOf('.') + 1;
  let summary = (firstSentenceEnd > 0 && firstSentenceEnd <= maxLength) ? text.slice(0, firstSentenceEnd) : text.slice(0, maxLength);
  return summary.trim();
}
