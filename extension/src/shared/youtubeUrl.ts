export function isSupportedYouTubeVideoUrl(url: string | undefined): boolean {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, '');

    if (hostname !== 'youtube.com' && hostname !== 'm.youtube.com') return false;

    return parsed.pathname === '/watch' || /^\/shorts\/[^/]+/.test(parsed.pathname);
  } catch {
    return false;
  }
}
