from app.models import VideoAuditRequest, VideoAuditResponse


def generate_mock_video_audit(payload: VideoAuditRequest) -> VideoAuditResponse:
    has_disclosure = any(
        marker in (text or "").lower()
        for text in [payload.description, payload.pinnedComment]
        for marker in ["ai-assisted", "ai assisted", "created with ai", "synthetic voice", "ai voice"]
    )

    risk_score = 2 if has_disclosure else 3
    risk_label = "Low" if risk_score <= 2 else "Medium"

    description_disclosure = (
        "AI-assisted production note: this video may use AI-assisted scripting, visuals, narration, "
        "or editing. Creative direction, topic selection, and final publishing decisions are human-reviewed."
    )
    pinned_comment_disclosure = (
        "Quick transparency note: this channel may use AI-assisted tools for parts of the script, visuals, "
        "voice, or editing, with human review before publishing."
    )
    biggest_finding = (
        "Visible signals suggest the video may benefit from clearer AI-assisted content disclosure "
        "near the top of the description and/or in a pinned comment."
    )
    quickest_fix = (
        "Add a short disclosure in the first two lines of the description and as a pinned comment; this may benefit "
        "viewer trust by helping viewers and sponsors understand how AI-assisted tools may have been used."
    )
    title_thumbnail_caution = (
        "Keep the title and thumbnail aligned with the actual video content. Avoid implying exclusive footage, "
        "real events, or human-only production if visible signals suggest AI-assisted production."
    )
    sponsor_risk_note = (
        "Sponsors may prefer proactive transparency. A concise disclosure lowers brand-safety ambiguity without "
        "framing the content as lower quality."
    )
    platform_readiness_note = (
        "This is not an AI detection result or legal/compliance advice. It is a visible-signal review focused on "
        "viewer trust, sponsor risk, and platform-readiness."
    )

    markdown = f"""## DisclosureLens Video Audit

**Video:** {payload.title}
**Channel:** {payload.channelName}
**URL:** {payload.url}

**Risk score:** {risk_score}/5
**Risk label:** {risk_label}

### Biggest finding
{biggest_finding}

### Quickest fix
{quickest_fix}

### Paste-ready description disclosure
{description_disclosure}

### Paste-ready pinned comment disclosure
{pinned_comment_disclosure}

### Title/thumbnail caution
{title_thumbnail_caution}

### Sponsor-risk note
{sponsor_risk_note}

### Platform-readiness note
{platform_readiness_note}
"""

    return VideoAuditResponse(
        riskScore=risk_score,
        riskLabel=risk_label,
        biggestFinding=biggest_finding,
        quickestFix=quickest_fix,
        descriptionDisclosure=description_disclosure,
        pinnedCommentDisclosure=pinned_comment_disclosure,
        titleThumbnailCaution=title_thumbnail_caution,
        sponsorRiskNote=sponsor_risk_note,
        platformReadinessNote=platform_readiness_note,
        markdown=markdown,
    )
