import type { AuditCurrentTabMessage, VideoAuditResponse, VideoPageData } from '../shared/types';
import { isSupportedYouTubeVideoUrl } from '../shared/youtubeUrl';

async function getActiveYouTubeTab(): Promise<chrome.tabs.Tab> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !isSupportedYouTubeVideoUrl(tab.url)) {
    throw new Error('Open a YouTube video or Shorts page before running an audit.');
  }
  return tab;
}

async function extractVideoData(tabId: number): Promise<VideoPageData> {
  return chrome.tabs.sendMessage(tabId, { type: 'DISCLOSURELENS_EXTRACT_VIDEO' });
}

async function captureScreenshot(): Promise<string | null> {
  try {
    const currentWindow = await chrome.windows.getCurrent();
    if (!currentWindow.id) return null;
    return await chrome.tabs.captureVisibleTab(currentWindow.id, { format: 'png' });
  } catch {
    return null;
  }
}

async function auditCurrentTab(): Promise<VideoAuditResponse> {
  const tab = await getActiveYouTubeTab();
  const [videoData, screenshotBase64] = await Promise.all([
    extractVideoData(tab.id!),
    captureScreenshot(),
  ]);

  const response = await fetch('http://localhost:8000/audit/video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...videoData, screenshotBase64 }),
  });

  if (!response.ok) {
    throw new Error(`Audit API failed: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

chrome.runtime.onMessage.addListener((message: AuditCurrentTabMessage, _sender, sendResponse) => {
  if (message.type !== 'DISCLOSURELENS_AUDIT_CURRENT_TAB') return false;

  auditCurrentTab()
    .then((audit) => sendResponse({ ok: true, audit }))
    .catch((error: Error) => sendResponse({ ok: false, error: error.message }));

  return true;
});
