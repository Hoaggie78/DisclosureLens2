from typing import Literal

from pydantic import BaseModel, Field, field_validator


RecommendedAction = Literal[
    "none",
    "rerun_with_more_context",
    "improve_existing_disclosure",
    "add_disclosure",
]
ContextQuality = Literal["thin", "meaningful"]


class VideoAuditRequest(BaseModel):
    url: str = Field(..., description="Current YouTube video URL opened by the user")
    title: str = Field(..., min_length=1)
    channelName: str = Field(..., min_length=1)
    description: str | None = None
    thumbnailUrl: str | None = None
    pinnedComment: str | None = None
    transcript: str | None = None
    screenshotBase64: str | None = None

    @field_validator("url")
    @classmethod
    def url_must_be_youtube(cls, value: str) -> str:
        allowed_hosts = ("youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be")
        if not any(host in value.lower() for host in allowed_hosts):
            raise ValueError("Audit URL must be a YouTube video URL")
        return value


class VideoAuditResponse(BaseModel):
    riskScore: int = Field(..., ge=1, le=5)
    riskLabel: Literal["Low", "Medium", "High"]
    biggestFinding: str
    quickestFix: str
    recommendedAction: RecommendedAction
    showDisclosureTemplates: bool
    signalsFound: list[str]
    evidenceReviewed: list[str]
    contextQuality: ContextQuality
    descriptionDisclosure: str
    pinnedCommentDisclosure: str
    titleThumbnailCaution: str
    sponsorRiskNote: str
    platformReadinessNote: str
    markdown: str
