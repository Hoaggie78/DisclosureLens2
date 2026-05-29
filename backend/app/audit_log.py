import base64
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from app.models import VideoAuditRequest, VideoAuditResponse


def _default_log_dir() -> Path:
    return Path(__file__).resolve().parents[2] / "logs"


def _screenshot_size_bytes(screenshot_base64: str | None) -> int:
    if not screenshot_base64:
        return 0
    _, _, data = screenshot_base64.partition(",")
    raw = data or screenshot_base64
    try:
        return len(base64.b64decode(raw, validate=False))
    except Exception:
        return len(screenshot_base64.encode("utf-8"))


def _redacted_request(payload: VideoAuditRequest) -> dict[str, Any]:
    data = payload.model_dump(exclude={"screenshotBase64"})
    data["screenshotBytes"] = _screenshot_size_bytes(payload.screenshotBase64)
    return data


def append_audit_log(payload: VideoAuditRequest, response: VideoAuditResponse) -> Path:
    log_dir = Path(os.environ.get("DISCLOSURELENS_LOG_DIR", _default_log_dir()))
    log_dir.mkdir(parents=True, exist_ok=True)
    log_file = log_dir / "audit_requests.jsonl"

    record = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "request": _redacted_request(payload),
        "response": response.model_dump(),
    }

    with log_file.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(record, ensure_ascii=False) + "\n")

    return log_file
