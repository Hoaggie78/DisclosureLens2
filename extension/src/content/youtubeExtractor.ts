import type { ExtractVideoMessage, VideoPageData } from '../shared/types';
import { cleanGenericYouTubeDescription, extractShortsChannelNameFromText } from './youtubeExtractionHelpers';

function text(selector: string): string | null {
  const element = document.querySelector(selector);
  return element?.textContent?.trim() || null;
}

function getMeta(property: string): string | null {
  const element = document.querySelector<HTMLMetaElement>(`meta[property="${property}"], meta[name="${property}"]`);
  return element?.content?.trim() || null;
}

function getDescription(): string | null {
  const expanded = text('ytd-text-inline-expander #expanded') || text('#description-inline-expander');
  const attributed = text('ytd-watch-metadata yt-attributed-string');
  const metaDescription = getMeta('description');
  return cleanGenericYouTubeDescription(expanded || attributed || metaDescription);
}

function getChannelName(): string {
  return (
    text('ytd-watch-metadata ytd-channel-name a') ||
    text('#owner #channel-name a') ||
    extractShortsChannelNameFromText(document.body?.innerText || null) ||
    getMeta('og:video:tag') ||
    'Unknown YouTube channel'
  );
}

function getPinnedComment(): string | null {
  const commentRenderers = Array.from(document.querySelectorAll('ytd-comment-thread-renderer'));
  for (const renderer of commentRenderers) {
    const isPinned = renderer.textContent?.toLowerCase().includes('pinned');
    if (isPinned) {
      const content = renderer.querySelector('#content-text')?.textContent?.trim();
      if (content) return content;
    }
  }
  return null;
}

function extractVideoPageData(): VideoPageData {
  return {
    url: window.location.href,
    title: text('h1 yt-formatted-string') || getMeta('og:title') || document.title.replace(' - YouTube', ''),
    channelName: getChannelName(),
    description: getDescription(),
    thumbnailUrl: getMeta('og:image'),
    pinnedComment: getPinnedComment(),
    transcript: null,
  };
}

chrome.runtime.onMessage.addListener((message: ExtractVideoMessage, _sender, sendResponse) => {
  if (message.type !== 'DISCLOSURELENS_EXTRACT_VIDEO') return false;
  sendResponse(extractVideoPageData());
  return true;
});
