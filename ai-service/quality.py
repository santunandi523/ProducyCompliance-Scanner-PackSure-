import cv2
import numpy as np

def assess_image_quality(image_bytes: bytes) -> dict:
    """
    Analyzes image quality: resolution, blur, brightness, contrast, and glare.
    Calculates imageQualityScore (0-100) and returns actionable recommendations.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return {
            "score": 0,
            "status": "POOR",
            "resolution": {"width": 0, "height": 0},
            "issues": ["Invalid or corrupted image format"],
            "recommendation": "Please upload a valid JPEG or PNG image."
        }

    h, w = img.shape[:2]
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # 1. Resolution score (target at least 1000px on smallest side)
    min_dim = min(h, w)
    if min_dim >= 1200:
        res_score = 100
    elif min_dim >= 800:
        res_score = 80
    elif min_dim >= 500:
        res_score = 55
    else:
        res_score = 25

    # 2. Blur / Sharpness check using Laplacian variance
    lap_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    if lap_var > 300:
        blur_score = 100
    elif lap_var > 150:
        blur_score = 80
    elif lap_var > 60:
        blur_score = 50
    else:
        blur_score = 20

    # 3. Brightness check (mean pixel value)
    mean_brightness = float(np.mean(gray))
    if 90 <= mean_brightness <= 190:
        bright_score = 100
    elif 60 <= mean_brightness < 90 or 190 < mean_brightness <= 225:
        bright_score = 75
    elif mean_brightness < 60:
        bright_score = 35 # Under-exposed / too dark
    else:
        bright_score = 35 # Over-exposed / washed out

    # 4. Contrast check (standard deviation of gray values)
    contrast_std = float(np.std(gray))
    if contrast_std >= 45:
        contrast_score = 100
    elif contrast_std >= 30:
        contrast_score = 75
    else:
        contrast_score = 40

    # 5. Glare detection (percentage of near-white pixels)
    glare_mask = cv2.inRange(gray, 248, 255)
    glare_pct = (np.count_nonzero(glare_mask) / (h * w)) * 100.0
    glare_score = 100 if glare_pct < 2.0 else (70 if glare_pct < 6.0 else 35)

    # Weighted overall quality score
    overall_score = int(
        (res_score * 0.25) +
        (blur_score * 0.35) +
        (bright_score * 0.15) +
        (contrast_score * 0.15) +
        (glare_score * 0.10)
    )

    issues = []
    if blur_score < 60:
        issues.append("Motion blur or soft focus detected")
    if bright_score < 60:
        if mean_brightness < 90:
            issues.append("Low lighting / underexposed image")
        else:
            issues.append("Excessive direct light / washed out")
    if contrast_score < 60:
        issues.append("Low contrast between text and packaging background")
    if glare_score < 60:
        issues.append("Specular glare / flash reflection obscuring text")
    if res_score < 60:
        issues.append("Low image resolution")

    # Actionable human recommendation
    if overall_score >= 75:
        status = "GOOD"
        recommendation = "Image quality is good for OCR reading."
    elif overall_score >= 50:
        status = "ACCEPTABLE"
        recommendation = "Image is readable, but higher clarity is recommended for small text."
    else:
        status = "POOR"
        if "Motion blur or soft focus detected" in issues:
            recommendation = "Hold the camera steady or rest the package on a flat surface and retake."
        elif "Low lighting / underexposed image" in issues:
            recommendation = "Move to a well-lit area and capture the label again without flash."
        elif "Specular glare / flash reflection obscuring text" in issues:
            recommendation = "Tilt the package slightly to avoid direct light reflection."
        else:
            recommendation = "Move closer to the label and capture a clear, sharp photo."

    return {
        "score": overall_score,
        "status": status,
        "metrics": {
            "resolution": f"{w}x{h}",
            "sharpnessIndex": round(lap_var, 1),
            "meanBrightness": round(mean_brightness, 1),
            "contrastStd": round(contrast_std, 1),
            "glarePercent": round(glare_pct, 2)
        },
        "issues": issues,
        "recommendation": recommendation
    }
