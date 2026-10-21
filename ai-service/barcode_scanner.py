import cv2
import numpy as np
from pyzbar.pyzbar import decode as zbar_decode

def scan_barcodes(image_bytes: bytes, image_id: str = "img-1") -> list:
    """
    Detects 1D Barcodes (EAN-13, EAN-8, UPC, CODE128) and 2D QR Codes.
    Returns list of barcode results with bounding boxes.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return []

    h, w = img.shape[:2]
    decoded_objects = zbar_decode(img)
    results = []

    for obj in decoded_objects:
        try:
            val = obj.data.decode("utf-8", errors="ignore").strip()
        except Exception:
            continue

        if not val:
            continue

        rect = obj.rect
        results.append({
            "barcodeType": obj.type,
            "barcodeValue": val,
            "imageId": image_id,
            "bbox": {
                "x": rect.left,
                "y": rect.top,
                "width": rect.width,
                "height": rect.height,
                "xPct": round((rect.left / w) * 100.0, 2),
                "yPct": round((rect.top / h) * 100.0, 2),
                "widthPct": round((rect.width / w) * 100.0, 2),
                "heightPct": round((rect.height / h) * 100.0, 2)
            }
        })

    return results
