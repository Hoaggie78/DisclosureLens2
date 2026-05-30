import './popup.css';
import type { VideoAuditResponse } from '../shared/types';
import { formatAuditError } from './popupErrors';

type AuditMessageResponse =
  | { ok: true; audit: VideoAuditResponse }
  | { ok: false; error: string };

const auditButton = document.querySelector<HTMLButtonElement>('#auditButton')!;
const statusEl = document.querySelector<HTMLElement>('#status')!;
const resultEl = document.querySelector<HTMLElement>('#result')!;

function setText(id: string, value: string): void {
  document.querySelector<HTMLElement>(`#${id}`)!.textContent = value;
}

function setTextarea(id: string, value: string): void {
  document.querySelector<HTMLTextAreaElement>(`#${id}`)!.value = value;
}

function setHidden(id: string, hidden: boolean): void {
  document.querySelector<HTMLElement>(`#${id}`)!.classList.toggle('hidden', hidden);
}

function shouldShowDisclosureTemplates(audit: VideoAuditResponse): boolean {
  return audit.showDisclosureTemplates;
}

function formatList(values: string[], emptyLabel: string): string {
  return values.length > 0 ? values.join(', ').replaceAll('_', ' ') : emptyLabel;
}

function renderAudit(audit: VideoAuditResponse): void {
  setText('riskLabel', audit.riskLabel);
  setText('riskScore', `${audit.riskScore}/5`);
  setText('biggestFinding', audit.biggestFinding);
  setText('quickestFix', audit.quickestFix);
  setText('evidenceReviewed', `Reviewed: ${formatList(audit.evidenceReviewed, 'no page evidence captured')} · Context: ${audit.contextQuality}`);
  setText('signalsFound', `Signals found: ${formatList(audit.signalsFound, 'none')}`);
  const showDisclosureTemplates = shouldShowDisclosureTemplates(audit);
  setHidden('copyPasteFixes', !showDisclosureTemplates);
  setHidden('noDisclosureTemplate', showDisclosureTemplates);
  if (showDisclosureTemplates) {
    setTextarea('descriptionDisclosure', audit.descriptionDisclosure);
    setTextarea('pinnedCommentDisclosure', audit.pinnedCommentDisclosure);
  } else {
    setTextarea('descriptionDisclosure', '');
    setTextarea('pinnedCommentDisclosure', '');
  }
  setTextarea('markdown', audit.markdown);
  resultEl.classList.remove('hidden');
}

async function runAudit(): Promise<void> {
  auditButton.disabled = true;
  statusEl.textContent = 'Collecting visible YouTube page signals...';
  resultEl.classList.add('hidden');

  const response = await chrome.runtime.sendMessage({ type: 'DISCLOSURELENS_AUDIT_CURRENT_TAB' }) as AuditMessageResponse;
  if (!response.ok) throw new Error(response.error);

  renderAudit(response.audit);
  statusEl.textContent = response.audit.recommendedAction === 'none'
    ? 'Audit complete. No disclosure template is recommended from current evidence.'
    : 'Audit complete. Review and copy fixes below.';
}

auditButton.addEventListener('click', () => {
  runAudit().catch((error: Error) => {
    statusEl.textContent = formatAuditError(error.message);
  }).finally(() => {
    auditButton.disabled = false;
  });
});

document.addEventListener('click', (event) => {
  const button = event.target as HTMLElement;
  if (!button.matches('button.copy')) return;
  const targetId = button.getAttribute('data-copy-target');
  if (!targetId) return;
  const value = document.querySelector<HTMLTextAreaElement>(`#${targetId}`)?.value || '';
  navigator.clipboard.writeText(value);
});
