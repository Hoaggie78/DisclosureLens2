import assert from 'node:assert/strict';
import { formatAuditError } from '../src/popup/popupErrors.ts';

assert.equal(
  formatAuditError('Failed to fetch'),
  'DisclosureLens backend is not running at localhost:8000. Start the backend, then run the audit again.',
);

assert.equal(
  formatAuditError('Open a YouTube video or Shorts page before running an audit.'),
  'Open a YouTube video or Short before running an audit.',
);

assert.equal(
  formatAuditError('Could not establish connection. Receiving end does not exist.'),
  'Could not read this YouTube page yet. Reload the YouTube tab, wait a moment, then run the audit again.',
);

assert.equal(
  formatAuditError('Audit API failed: 500 Internal Server Error'),
  'Audit service returned an error. Check the backend logs, then try again.',
);

assert.equal(
  formatAuditError('Some unexpected extension error'),
  'Audit failed: Some unexpected extension error',
);

console.log('popupErrors tests passed');
