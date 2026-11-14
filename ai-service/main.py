import sys
import os

# Ensure UTF-8 output on Windows without encoding crashes
try:
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

def safe_print(*args, **kwargs):
    try:
        print(*args, **kwargs)
    except Exception:
        try:
            clean_args = [str(a).encode('ascii', errors='replace').decode('ascii') for a in args]
            print(*clean_args, **kwargs)
        except Exception:
            pass

import time
from typing import List
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from quality import assess_image_quality
from preprocessing import preprocess_image, get_ocr_variants
from ocr_engine import run_ocr
from barcode_scanner import scan_barcodes
from extractor import extract_declarations
from classifier import classify_category

app = FastAPI(
    title="PackSure AI & Computer Vision Service",
    version="1.0.0",
    description="Real OCR, Preprocessing, Quality Assessment, and Legal Metrology Declaration Extraction"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "UP",
        "service": "packsure-ai-vision",
        "ocrEngine": "RapidOCR (PaddleOCR ONNX)",
        "barcodeEngine": "pyzbar",
        "visionFramework": "OpenCV"
    }

@app.post("/api/v1/analyze")
async def analyze_package(files: List[UploadFile] = File(...)):
    """
    Ingests one or multiple package images (Front, Back, Side, Label).
    Performs:
    1. Quality assessment on each image
    2. OpenCV preprocessing
    3. Deep learning OCR with bounding boxes
    4. Barcode/QR detection
    5. Multi-image merge & Legal Metrology declaration extraction
    6. Product category classification
    """
    if not files:
        raise HTTPException(status_code=400, detail="No images provided for analysis")

    start_total = time.time()
    images_analysis = []
    all_ocr_regions = []
    all_barcodes = []
    all_text_blobs = []

    for idx, f in enumerate(files):
        img_id = f"img-{idx + 1}"
        file_bytes = await f.read()

        # Step 1: Quality check
        quality_res = assess_image_quality(file_bytes)

        # Step 2: OpenCV Preprocessing
        prep_bytes = preprocess_image(file_bytes)

        # Step 3: Barcode scanning on original & preprocessed
        barcodes = scan_barcodes(file_bytes, img_id)
        if not barcodes and prep_bytes:
            barcodes = scan_barcodes(prep_bytes, img_id)
        all_barcodes.extend(barcodes)

        # Step 4: Multi-Variant OCR Engine execution
        t0_ocr = time.time()
        variants = get_ocr_variants(file_bytes)
        ocr_regions = []
        seen_texts = set()

        for v_name, v_bytes in variants:
            v_regions = run_ocr(v_bytes, img_id)
            for r in v_regions:
                clean_t = r["normalizedText"].lower()
                if clean_t not in seen_texts:
                    seen_texts.add(clean_t)
                    ocr_regions.append(r)

        ocr_time = round(time.time() - t0_ocr, 3)

        all_ocr_regions.extend(ocr_regions)
        img_text = "\n".join([r["text"] for r in ocr_regions])
        all_text_blobs.append(img_text)

        words_count = len(img_text.split())
        img_avg_conf = (
            sum(r["confidence"] for r in ocr_regions) / len(ocr_regions)
            if ocr_regions else 0.0
        )

        # Single-image extraction check for per-image debug reporting
        image_decls = extract_declarations(ocr_regions, barcodes)
        extracted_fields = [d["field"] for d in image_decls if d.get("detectedValue")]

        # Determine processing status & diagnostic reason for 0 declarations
        status = "SUCCESS"
        reason = ""

        if not file_bytes or len(file_bytes) == 0:
            status = "UNSUPPORTED_FORMAT"
            reason = "Empty or unreadable file bytes uploaded"
        elif quality_res.get("status") == "REJECT" or quality_res.get("score", 100) < 40:
            status = "BAD_IMAGE_QUALITY"
            reason = f"Low quality score ({quality_res.get('score')}). Issues: {', '.join(quality_res.get('issues', []))}"
        elif len(ocr_regions) == 0 or len(img_text.strip()) == 0:
            status = "OCR_RETURNED_EMPTY_TEXT"
            reason = "OCR engine returned 0 text regions. Label text may be out of focus or absent."
        elif len(extracted_fields) == 0:
            status = "ZERO_DECLARATION_CANDIDATES"
            reason = f"OCR recognized {len(img_text)} chars, but no standard Legal Metrology declaration patterns matched."
        else:
            status = "SUCCESS"

        # Output explicit TEMPORARY DEBUG LOG as specified in prompt section 3 & 29
        safe_print(f"\n------------------------------------")
        safe_print(f"IMAGE {idx + 1}")
        safe_print(f"------------------------------------")
        safe_print(f"IMAGE ID: {img_id}")
        safe_print(f"IMAGE NAME: {f.filename}")
        safe_print(f"IMAGE SIZE: {len(file_bytes)} bytes")
        safe_print(f"IMAGE QUALITY: {quality_res.get('status')} (Score: {quality_res.get('score')})")
        safe_print(f"OCR TEXT LENGTH: {len(img_text)} chars")
        safe_print(f"OCR WORD COUNT: {words_count}")
        safe_print(f"OCR CONFIDENCE: {round(img_avg_conf, 3)}")
        safe_print(f"NUMBER OF DETECTED DECLARATIONS: {len(extracted_fields)}")
        safe_print(f"\nFULL OCR TEXT:")
        safe_print(img_text if img_text else "[EMPTY OCR TEXT]")
        safe_print(f"\nEXTRACTED CANDIDATES:")
        if image_decls:
            for d in image_decls:
                safe_print(f"  {d['field']}: {d.get('detectedValue') or d.get('displayValue')}")
        else:
            safe_print("  None")
        safe_print(f"\nPROCESSING STATUS: {status}")
        if reason:
            safe_print(f"DIAGNOSTIC REASON: {reason}")
        safe_print(f"------------------------------------\n", flush=True)

        images_analysis.append({
            "imageId": img_id,
            "filename": f.filename,
            "quality": quality_res,
            "ocrTextLength": len(img_text),
            "ocrConfidence": round(img_avg_conf, 3),
            "ocrRegionsCount": len(ocr_regions),
            "ocrProcessingTimeSec": ocr_time,
            "extractedDeclarationsCount": len(extracted_fields),
            "extractedFields": extracted_fields,
            "processingStatus": status,
            "diagnosticReason": reason,
            "barcodes": barcodes
        })

    # Step 5: Multi-image Declaration Extraction
    t0_extract = time.time()
    declarations = extract_declarations(all_ocr_regions, all_barcodes)
    extract_time = round(time.time() - t0_extract, 3)

    # Step 6: Classification
    combined_text = " ".join(all_text_blobs)
    classification = classify_category(combined_text, declarations, all_barcodes)

    total_time = round(time.time() - start_total, 3)

    # Calculate average OCR confidence across all images
    avg_ocr_conf = (
        sum(r["confidence"] for r in all_ocr_regions) / len(all_ocr_regions)
        if all_ocr_regions else 0.0
    )

    return {
        "success": True,
        "images": images_analysis,
        "declarations": declarations,
        "classification": classification,
        "ocrRegions": all_ocr_regions,
        "barcodes": all_barcodes,
        "metrics": {
            "totalProcessingTimeSec": total_time,
            "extractionTimeSec": extract_time,
            "totalOcrRegions": len(all_ocr_regions),
            "averageOcrConfidence": round(avg_ocr_conf, 3)
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
