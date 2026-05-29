from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.audit import generate_mock_video_audit
from app.models import VideoAuditRequest, VideoAuditResponse


app = FastAPI(title="DisclosureLens API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["chrome-extension://*", "http://localhost", "http://127.0.0.1"],
    allow_origin_regex=r"chrome-extension://.*",
    allow_credentials=False,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/audit/video", response_model=VideoAuditResponse)
def audit_video(payload: VideoAuditRequest) -> VideoAuditResponse:
    return generate_mock_video_audit(payload)
