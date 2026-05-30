const ERROR_MESSAGES = {
  backendOffline: 'DisclosureLens backend is not running at localhost:8000. Start the backend, then run the audit again.',
  unsupportedPage: 'Open a YouTube video or Short before running an audit.',
  pageNotReady: 'Could not read this YouTube page yet. Reload the YouTube tab, wait a moment, then run the audit again.',
  apiFailure: 'Audit service returned an error. Check the backend logs, then try again.',
} as const;

export function formatAuditError(message: string): string {
  if (message.includes('Failed to fetch')) return ERROR_MESSAGES.backendOffline;
  if (message.includes('Open a YouTube video or Shorts page')) return ERROR_MESSAGES.unsupportedPage;
  if (message.includes('Receiving end does not exist')) return ERROR_MESSAGES.pageNotReady;
  if (message.includes('Audit API failed')) return ERROR_MESSAGES.apiFailure;
  return `Audit failed: ${message}`;
}
