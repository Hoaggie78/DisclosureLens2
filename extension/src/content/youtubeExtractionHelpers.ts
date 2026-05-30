const GENERIC_YOUTUBE_DESCRIPTION =
  'enjoy the videos and music you love, upload original content, and share it all with friends, family, and the world on youtube.';

export function cleanGenericYouTubeDescription(description: string | null): string | null {
  const cleaned = description?.trim() || null;
  if (!cleaned) return null;

  if (cleaned.toLowerCase() === GENERIC_YOUTUBE_DESCRIPTION) return null;

  return cleaned;
}

export function extractShortsChannelNameFromText(pageText: string | null): string | null {
  if (!pageText) return null;

  const lines = pageText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.find((line) => /^@[A-Za-z0-9._-]{2,}$/.test(line)) || null;
}
