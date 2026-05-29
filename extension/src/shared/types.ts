export type VideoPageData = {
  url: string;
  title: string;
  channelName: string;
  description: string | null;
  thumbnailUrl: string | null;
  pinnedComment: string | null;
  transcript: string | null;
  screenshotBase64?: string | null;
};

export type VideoAuditResponse = {
  riskScore: number;
  riskLabel: 'Low' | 'Medium' | 'High';
  biggestFinding: string;
  quickestFix: string;
  descriptionDisclosure: string;
  pinnedCommentDisclosure: string;
  titleThumbnailCaution: string;
  sponsorRiskNote: string;
  platformReadinessNote: string;
  markdown: string;
};

export type ExtractVideoMessage = {
  type: 'DISCLOSURELENS_EXTRACT_VIDEO';
};

export type AuditCurrentTabMessage = {
  type: 'DISCLOSURELENS_AUDIT_CURRENT_TAB';
};

export type ExtensionMessage = ExtractVideoMessage | AuditCurrentTabMessage;
