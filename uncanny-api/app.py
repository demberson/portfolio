from __future__ import annotations

import base64
import os
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from detector import UncannyDetector

MODEL_PATH = Path(__file__).parent / "models" / "pca_model.pkl"
DEFAULT_LOCAL_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]


def parse_allowed_origins() -> list[str]:
  raw = os.getenv("CORS_ALLOWED_ORIGINS", "")
  if not raw.strip():
    return DEFAULT_LOCAL_ORIGINS
  return [origin.strip() for origin in raw.split(",") if origin.strip()]

app = FastAPI(title="Uncanny Face Detector API")

app.add_middleware(
  CORSMiddleware,
  allow_origins=parse_allowed_origins(),
  allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1):\d+$",
  allow_credentials=False,
  allow_methods=["*"],
  allow_headers=["*"],
)

detector_init_error: str | None = None

try:
  detector = UncannyDetector(MODEL_PATH)
except FileNotFoundError:
  detector = None
  detector_init_error = "Place pca_model.pkl in uncanny-api/models/."
except Exception as exc:
  detector = None
  detector_init_error = f"Detector failed to initialize: {exc}"


@app.get("/health")
def health() -> dict[str, str]:
  if detector is None:
    if detector_init_error and "pca_model.pkl" in detector_init_error:
      return {"status": "missing_model", "message": detector_init_error}
    return {"status": "startup_error", "message": detector_init_error or "Unknown startup error."}
  return {"status": "ok"}


@app.post("/transform")
async def transform(file: UploadFile = File(...)) -> dict[str, str | list[int]]:
  if detector is None:
    raise HTTPException(
      status_code=500,
      detail=detector_init_error
      or "Detector not initialized. Check /health and restart the API after fixing setup.",
    )

  if not file.content_type or not file.content_type.startswith("image/"):
    raise HTTPException(status_code=400, detail="Only image uploads are supported.")

  try:
    image_bytes = await file.read()
    result = detector.transform(image_bytes)
    image_base64 = base64.b64encode(result.output_png_bytes).decode("ascii")
    return {
      "image_base64": image_base64,
      "face_box": list(result.face_box),
    }
  except ValueError as exc:
    raise HTTPException(status_code=422, detail=str(exc)) from exc
  except Exception as exc:
    raise HTTPException(status_code=500, detail="Failed to process uploaded image.") from exc
