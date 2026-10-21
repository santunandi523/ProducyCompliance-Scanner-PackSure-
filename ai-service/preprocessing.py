import cv2
import numpy as np

def preprocess_image(image_bytes: bytes) -> bytes:
    """
    OpenCV Preprocessing Pipeline:
    1. Decode original image
    2. Resize if oversized (keep max dimension around 2000px for optimal OCR)
    3. Noise reduction using bilateral filter (preserves sharp edges of fonts)
    4. Contrast enhancement via CLAHE (Contrast Limited Adaptive Histogram Equalization)
    5. Deskewing to straighten text lines
    6. Gentle unsharp masking for font edge clarity
    7. Returns preprocessed JPEG bytes (Original is always preserved separately)
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return image_bytes

    h, w = img.shape[:2]

    # Step 1: Normalize dimension if overly massive
    max_dim = 2400
    if max(h, w) > max_dim:
        scale = max_dim / float(max(h, w))
        img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)

    # Step 2: Noise reduction that preserves edges
    denoised = cv2.bilateralFilter(img, d=5, sigmaColor=50, sigmaSpace=50)

    # Step 3: Contrast enhancement in LAB color space
    lab = cv2.cvtColor(denoised, cv2.COLOR_BGR2LAB)
    l_channel, a_channel, b_channel = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    cl = clahe.apply(l_channel)
    enhanced_lab = cv2.merge((cl, a_channel, b_channel))
    enhanced = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)

    # Step 4: Deskewing check
    gray = cv2.cvtColor(enhanced, cv2.COLOR_BGR2GRAY)
    thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]
    coords = np.column_stack(np.where(thresh > 0))
    angle = 0.0
    if len(coords) > 100:
        angle = cv2.minAreaRect(coords)[-1]
        if angle < -45:
            angle = -(90 + angle)
        elif angle > 45:
            angle = 90 - angle
        else:
            angle = -angle

    # Only rotate if small skew (-15 to 15 degrees)
    if abs(angle) > 0.5 and abs(angle) < 15.0:
        (h_e, w_e) = enhanced.shape[:2]
        center = (w_e // 2, h_e // 2)
        m = cv2.getRotationMatrix2D(center, angle, 1.0)
        enhanced = cv2.warpAffine(enhanced, m, (w_e, h_e), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

    # Step 5: Unsharp mask for text definition
    gaussian = cv2.GaussianBlur(enhanced, (0, 0), 2.0)
    sharpened = cv2.addWeighted(enhanced, 1.3, gaussian, -0.3, 0)

    # Encode back to JPEG
    success, encoded = cv2.imencode(".jpg", sharpened, [int(cv2.IMWRITE_JPEG_QUALITY), 92])
    return encoded.tobytes() if success else image_bytes

def get_ocr_variants(image_bytes: bytes) -> list:
    """
    Generates 3 complementary preprocessing variants for maximum OCR recall:
    Variant 1: CLAHE Contrast Enhanced + Deskewed + Unsharp Mask (Standard)
    Variant 2: 2x Upscaled Grayscale (Optimal for small printed MRP & dates)
    Variant 3: Otsu Adaptive Threshold Binarized (Optimal for faint inkjet batch stamps)
    Returns list of bytes tuples: [(variant_name, image_bytes), ...]
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return [("original", image_bytes)]

    variants = []

    # Variant 1: Standard CLAHE Preprocessed
    v1_bytes = preprocess_image(image_bytes)
    variants.append(("clahe_enhanced", v1_bytes))

    try:
        h, w = img.shape[:2]

        # Variant 2: 2x Upscaled Grayscale + Contrast Stretch
        scale = 2.0 if max(h, w) < 1800 else 1.2
        scaled = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_CUBIC)
        gray = cv2.cvtColor(scaled, cv2.COLOR_BGR2GRAY)
        clahe_g = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        enhanced_gray = clahe_g.apply(gray)
        s2, e2 = cv2.imencode(".jpg", enhanced_gray, [int(cv2.IMWRITE_JPEG_QUALITY), 92])
        if s2:
            variants.append(("upscaled_grayscale", e2.tobytes()))

        # Variant 3: Adaptive Binarization for faint inkjet text
        blur = cv2.GaussianBlur(enhanced_gray, (3, 3), 0)
        binary = cv2.adaptiveThreshold(blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
        s3, e3 = cv2.imencode(".jpg", binary, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
        if s3:
            variants.append(("adaptive_threshold", e3.tobytes()))

    except Exception:
        pass

    return variants

