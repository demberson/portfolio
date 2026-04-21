from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import cv2
import joblib
import numpy as np
from mtcnn import MTCNN

# number of principle components (can be adjusted to change accuracy/creepiness of faces)
BLUR_AMOUNT = 5
NOISE_LEVEL = 15
N_COMPONENTS = 80
DETAIL_BLEND_STRENGTH = 0.28

FACE_WIDTH = 37
FACE_HEIGHT = 50


@dataclass
class DetectionResult:
  output_png_bytes: bytes
  face_box: tuple[int, int, int, int]


class UncannyDetector:
  def __init__(self, model_path: Path, n_components: int = N_COMPONENTS) -> None:
    if not model_path.exists():
      raise FileNotFoundError(
        f"PCA model not found at {model_path}. Place pca_model.pkl in uncanny-api/models/."
      )

    self.pca = joblib.load(model_path)
    self.detector = MTCNN()
    self.n_components = n_components

  def transform(self, image_bytes: bytes) -> DetectionResult:
    source = self._decode_image(image_bytes)
    gray = cv2.cvtColor(source, cv2.COLOR_BGR2GRAY)

    # detect face
    rgb = cv2.cvtColor(source, cv2.COLOR_BGR2RGB)
    results = self.detector.detect_faces(rgb)
    if not results:
      raise ValueError("No face detected in uploaded image.")

    # take first face found
    x, y, width, height = results[0]["box"]
    y1, y2 = max(0, y), min(source.shape[0], y + height)
    x1, x2 = max(0, x), min(source.shape[1], x + width)
    if y2 <= y1 or x2 <= x1:
      raise ValueError("Detected face bounds are invalid.")

    # extract face
    face_region = gray[y1:y2, x1:x2]
    # pre-process for PCA
    face_resized = cv2.resize(face_region, (FACE_WIDTH, FACE_HEIGHT))
    face_flat = face_resized.reshape(1, -1)

    # project face into eigenspace
    components = self.pca.transform(face_flat)
    # zero out all components after chosen number of components
    components[:, self.n_components :] = 0

    # reconstruct faces w/ limited components
    reconstruction = self.pca.inverse_transform(components)
    reconstruction = reconstruction.reshape(FACE_HEIGHT, FACE_WIDTH)

    # post-processing
    # resize image back to original size
    uncanny_face = cv2.resize(reconstruction, (x2 - x1, y2 - y1))
    uncanny_face = _match_brightness(uncanny_face, face_region)
    uncanny_face = np.clip(uncanny_face, 0, 255).astype("uint8")
    uncanny_face = _reinject_detail(
      base_face=uncanny_face,
      reference_face=face_region,
      strength=DETAIL_BLEND_STRENGTH,
    )

    # masking
    mask = _build_soft_face_mask(height=uncanny_face.shape[0], width=uncanny_face.shape[1])

    # create final image
    final_face = (
      uncanny_face.astype("float32") * mask + face_region.astype("float32") * (1.0 - mask)
    ).astype("uint8")
    final_image = gray.copy()
    final_image = cv2.GaussianBlur(final_image, (BLUR_AMOUNT, BLUR_AMOUNT), 0)
    final_image[y1:y2, x1:x2] = final_face
    final_image = _add_grain(final_image, intensity=NOISE_LEVEL)

    ok, encoded = cv2.imencode(".png", final_image)
    if not ok:
      raise RuntimeError("Failed to encode output image.")

    return DetectionResult(
      output_png_bytes=encoded.tobytes(),
      face_box=(x1, y1, x2 - x1, y2 - y1),
    )

  @staticmethod
  def _decode_image(image_bytes: bytes) -> np.ndarray:
    decoded = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
    if decoded is None:
      raise ValueError("Unable to read image file.")
    return decoded


def _add_grain(image: np.ndarray, intensity: int = 10) -> np.ndarray:
  h, w = image.shape
  noise = np.random.normal(0, intensity, (h, w)).astype("float32")
  with_grain = image.astype("float32") + noise
  return np.clip(with_grain, 0, 255).astype("uint8")


def _build_soft_face_mask(height: int, width: int) -> np.ndarray:
  mask = np.zeros((height, width), dtype="uint8")
  center = (width // 2, int(height * 0.47))
  axes = (max(1, int(width * 0.42)), max(1, int(height * 0.46)))
  cv2.ellipse(mask, center, axes, 0, 0, 360, 255, -1)

  blur_size = _odd_kernel(int(min(height, width) * 0.22), min_size=5)
  softened = cv2.GaussianBlur(mask, (blur_size, blur_size), 0)
  return (softened.astype("float32") / 255.0).clip(0.0, 1.0)


def _reinject_detail(base_face: np.ndarray, reference_face: np.ndarray, strength: float) -> np.ndarray:
  blur_size = _odd_kernel(int(min(reference_face.shape) * 0.18), min_size=5)
  ref_float = reference_face.astype("float32")
  low_freq = cv2.GaussianBlur(ref_float, (blur_size, blur_size), 0)
  detail = ref_float - low_freq
  blended = base_face.astype("float32") + (strength * detail)
  return np.clip(blended, 0, 255).astype("uint8")


def _odd_kernel(value: int, min_size: int = 3) -> int:
  kernel = max(min_size, value)
  if kernel % 2 == 0:
    kernel += 1
  return kernel


def _match_brightness(source: np.ndarray, reference: np.ndarray) -> np.ndarray:
  # calculate mean and standard deviation
  src_mean, src_std = cv2.meanStdDev(source)
  ref_mean, ref_std = cv2.meanStdDev(reference)
  # linear transformation
  epsilon = 1e-6
  adjusted = (source.astype("float32") - src_mean) * (ref_std / (src_std + epsilon)) + ref_mean
  return np.clip(adjusted, 0, 255).astype("uint8")
