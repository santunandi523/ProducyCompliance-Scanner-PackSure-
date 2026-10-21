import re
import cv2
import numpy as np
from rapidocr_onnxruntime import RapidOCR

# Initialize singleton OCR engine
_ocr_engine = None

def get_ocr_engine():
    global _ocr_engine
    if _ocr_engine is None:
        _ocr_engine = RapidOCR()
    return _ocr_engine

def run_ocr(image_bytes: bytes, image_id: str = "img-1") -> list:
    """
    Executes Deep Learning OCR using RapidOCR (PaddleOCR models).
    Returns list of detected text boxes with:
    - regionId
    - text (raw)
    - normalizedText
    - confidence (0.0 - 1.0)
    - bbox: {x, y, width, height} in percentage (0-100) and pixels
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return []

    h, w = img.shape[:2]
    engine = get_ocr_engine()
    result, _ = engine(img)

    if not result:
        return []

    regions = []
    for idx, item in enumerate(result):
        # item: [box_coordinates, text, score]
        # box: [[x1, y1], [x2, y2], [x3, y3], [x4, y4]]
        box, raw_text, score = item[0], item[1], float(item[2])
        raw_text = str(raw_text).strip()
        if not raw_text:
            continue

        xs = [pt[0] for pt in box]
        ys = [pt[1] for pt in box]
        min_x = max(0, min(xs))
        max_x = min(w, max(xs))
        min_y = max(0, min(ys))
        max_y = min(h, max(ys))

        box_w = max(1, max_x - min_x)
        box_h = max(1, max_y - min_y)

        # Contextual normalization
        normalized = normalize_ocr_text(raw_text)

        regions.append({
            "regionId": f"{image_id}-reg-{idx + 1}",
            "imageId": image_id,
            "text": raw_text,
            "normalizedText": normalized,
            "confidence": round(score, 4),
            "bbox": {
                "x": round(min_x, 1),
                "y": round(min_y, 1),
                "width": round(box_w, 1),
                "height": round(box_h, 1),
                "xPct": round((min_x / w) * 100.0, 2),
                "yPct": round((min_y / h) * 100.0, 2),
                "widthPct": round((box_w / w) * 100.0, 2),
                "heightPct": round((box_h / h) * 100.0, 2)
            }
        })

    return regions

def normalize_ocr_text(text: str) -> str:
    """
    Applies contextual normalization for packaging tokens:
    - Normalizes Indian Rupee symbol variants: 'Rs.', 'Rs', 'INR', '₹', '/-'
    - Fixes common OCR letter-to-digit errors ONLY in strictly currency contexts (₹, $)
    """
    if not text:
        return ""
    s = text.strip()

    # Normalize currency patterns: "Rs. 85.00", "MRP: 85/-" -> "MRP ₹ 85.00"
    s = re.sub(r'(?i)\b(?:rs\.?|inr)\b', '₹', s)
    s = re.sub(r'\s*/-\b', '', s)

    # Contextual digit fix ONLY directly after currency symbols (₹, $) followed strictly by digits/symbols
    def fix_currency_numbers(match):
        prefix = match.group(1)
        val = match.group(2)
        val = val.replace('O', '0').replace('o', '0')
        val = val.replace('I', '1').replace('l', '1')
        val = val.replace('S', '5').replace('s', '5')
        return prefix + val

    s = re.sub(r'([₹\$]\s*)([0-9OolISs\.\,]+)', fix_currency_numbers, s)

    # Normalize multiple whitespace
    s = re.sub(r'\s+', ' ', s).strip()
    return s
