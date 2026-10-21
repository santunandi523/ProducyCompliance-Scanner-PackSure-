import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(__file__))

from extractor import extract_declarations

def test_mrp_detection():
    ocr_regions = [
        {
            "regionId": "img-1-reg-1",
            "imageId": "img-1",
            "text": "MRP Rs. 120.00",
            "normalizedText": "MRP ₹ 120.00",
            "confidence": 0.95,
            "bbox": {"x": 10, "y": 10, "width": 50, "height": 10, "xPct": 10, "yPct": 10, "widthPct": 50, "heightPct": 10}
        }
    ]
    res = extract_declarations(ocr_regions)
    mrp = next((d for d in res if d["field"] == "MRP"), None)
    assert mrp is not None, "MRP should be detected"
    assert mrp["normalizedValue"] == "120.00", f"Expected 120.00, got {mrp['normalizedValue']}"
    print("[PASS] TEST 1: MRP Detection Passed")

def test_net_quantity_detection():
    ocr_regions = [
        {
            "regionId": "img-1-reg-2",
            "imageId": "img-1",
            "text": "Net Wt. 500 g",
            "normalizedText": "Net Wt. 500 g",
            "confidence": 0.92,
            "bbox": {"x": 10, "y": 30, "width": 40, "height": 10, "xPct": 10, "yPct": 30, "widthPct": 40, "heightPct": 10}
        }
    ]
    res = extract_declarations(ocr_regions)
    net_qty = next((d for d in res if d["field"] == "NET_QUANTITY"), None)
    assert net_qty is not None, "Net Quantity should be detected"
    assert net_qty["normalizedValue"] == "500", f"Expected 500, got {net_qty['normalizedValue']}"
    assert net_qty["unit"] == "g", f"Expected unit g, got {net_qty['unit']}"
    print("[PASS] TEST 2: Net Quantity Detection Passed")

def test_consumer_care_detection():
    ocr_regions = [
        {
            "regionId": "img-1-reg-3",
            "imageId": "img-1",
            "text": "Customer Care Helpline: 1800-123-4567 Email: care@example.com",
            "normalizedText": "Customer Care Helpline: 1800-123-4567 Email: care@example.com",
            "confidence": 0.94,
            "bbox": {"x": 10, "y": 50, "width": 80, "height": 10, "xPct": 10, "yPct": 50, "widthPct": 80, "heightPct": 10}
        }
    ]
    res = extract_declarations(ocr_regions)
    care = next((d for d in res if d["field"] == "CUSTOMER_CARE_PHONE"), None)
    assert care is not None, "Customer Care Phone should be detected"
    assert "1800-123-4567" in care["detectedValue"], f"Expected phone in {care['detectedValue']}"
    print("[PASS] TEST 3: Consumer Care Detection Passed")

def test_multi_image_fusion_agreement():
    ocr_regions = [
        # Image 1 (Front): Brand + MRP
        {
            "regionId": "img-1-reg-1",
            "imageId": "img-1",
            "text": "ABC Biscuits",
            "normalizedText": "ABC Biscuits",
            "confidence": 0.96,
            "bbox": {"x": 10, "y": 5, "width": 30, "height": 10, "xPct": 10, "yPct": 5, "widthPct": 30, "heightPct": 10}
        },
        {
            "regionId": "img-1-reg-2",
            "imageId": "img-1",
            "text": "MRP Rs. 120.00",
            "normalizedText": "MRP ₹ 120.00",
            "confidence": 0.90,
            "bbox": {"x": 60, "y": 20, "width": 30, "height": 10, "xPct": 60, "yPct": 20, "widthPct": 30, "heightPct": 10}
        },
        # Image 2 (Back): MRP Rs 120.00 + Customer Care
        {
            "regionId": "img-2-reg-1",
            "imageId": "img-2",
            "text": "MRP Rs. 120.00",
            "normalizedText": "MRP ₹ 120.00",
            "confidence": 0.94,
            "bbox": {"x": 50, "y": 80, "width": 30, "height": 10, "xPct": 50, "yPct": 80, "widthPct": 30, "heightPct": 10}
        }
    ]
    res = extract_declarations(ocr_regions)
    mrp = next((d for d in res if d["field"] == "MRP"), None)
    assert mrp is not None, "MRP should be detected"
    assert len(mrp["evidences"]) == 2, f"Expected 2 evidence references across images, got {len(mrp['evidences'])}"
    assert mrp["conflictDetected"] == False, "No conflict should be detected when values match"
    print("[PASS] TEST 4: Multi-Image Fusion Agreement Passed")

def test_multi_image_conflict_resolution():
    ocr_regions = [
        # Image 1: MRP Rs 120
        {
            "regionId": "img-1-reg-1",
            "imageId": "img-1",
            "text": "MRP Rs. 120.00",
            "normalizedText": "MRP ₹ 120.00",
            "confidence": 0.90,
            "bbox": {"x": 10, "y": 10, "width": 30, "height": 10, "xPct": 10, "yPct": 10, "widthPct": 30, "heightPct": 10}
        },
        # Image 2: MRP Rs 150
        {
            "regionId": "img-2-reg-1",
            "imageId": "img-2",
            "text": "MRP Rs. 150.00",
            "normalizedText": "MRP ₹ 150.00",
            "confidence": 0.92,
            "bbox": {"x": 10, "y": 10, "width": 30, "height": 10, "xPct": 10, "yPct": 10, "widthPct": 30, "heightPct": 10}
        }
    ]
    res = extract_declarations(ocr_regions)
    mrp = next((d for d in res if d["field"] == "MRP"), None)
    assert mrp is not None, "MRP should be detected"
    assert mrp["conflictDetected"] == True, "Conflict SHOULD be detected when MRP values differ across images"
    assert mrp["needsVerification"] == True, "Needs verification should be True on conflict"
    print("[PASS] TEST 5: Multi-Image Conflict Resolution Passed")

def test_5_image_mixed_fusion():
    ocr_regions = [
        # Image 1 (Front): Brand
        {
            "regionId": "img-1-reg-1",
            "imageId": "img-1",
            "text": "ABC Biscuits",
            "normalizedText": "ABC Biscuits",
            "confidence": 0.96,
            "bbox": {"x": 10, "y": 5, "width": 30, "height": 10, "xPct": 10, "yPct": 5, "widthPct": 30, "heightPct": 10}
        },
        # Image 2 (Back): Manufacturer
        {
            "regionId": "img-2-reg-1",
            "imageId": "img-2",
            "text": "Manufactured by XYZ Foods Pvt Ltd",
            "normalizedText": "Manufactured by XYZ Foods Pvt Ltd",
            "confidence": 0.92,
            "bbox": {"x": 10, "y": 20, "width": 60, "height": 10, "xPct": 10, "yPct": 20, "widthPct": 60, "heightPct": 10}
        },
        # Image 3 (Side): Net Quantity
        {
            "regionId": "img-3-reg-1",
            "imageId": "img-3",
            "text": "Net Wt. 500 g",
            "normalizedText": "Net Wt. 500 g",
            "confidence": 0.94,
            "bbox": {"x": 10, "y": 30, "width": 40, "height": 10, "xPct": 10, "yPct": 30, "widthPct": 40, "heightPct": 10}
        },
        # Image 4 (MRP Close-up): MRP
        {
            "regionId": "img-4-reg-1",
            "imageId": "img-4",
            "text": "MRP Rs. 120.00",
            "normalizedText": "MRP ₹ 120.00",
            "confidence": 0.95,
            "bbox": {"x": 10, "y": 10, "width": 40, "height": 10, "xPct": 10, "yPct": 10, "widthPct": 40, "heightPct": 10}
        },
        # Image 5 (Customer Care Close-up): Helpline
        {
            "regionId": "img-5-reg-1",
            "imageId": "img-5",
            "text": "Customer Care Helpline: 1800-123-4567",
            "normalizedText": "Customer Care Helpline: 1800-123-4567",
            "confidence": 0.93,
            "bbox": {"x": 10, "y": 15, "width": 70, "height": 10, "xPct": 10, "yPct": 15, "widthPct": 70, "heightPct": 10}
        }
    ]

    res = extract_declarations(ocr_regions)
    fields_found = set(d["field"] for d in res)

    assert "BRAND" in fields_found, "Brand from Image 1 should be detected"
    assert "MANUFACTURER" in fields_found, "Manufacturer from Image 2 should be detected"
    assert "NET_QUANTITY" in fields_found, "Net Quantity from Image 3 should be detected"
    assert "MRP" in fields_found, "MRP from Image 4 should be detected"
    assert "CUSTOMER_CARE_PHONE" in fields_found, "Customer Care Phone from Image 5 should be detected"
    print("[PASS] TEST 6: 5-Image Mixed Information Fusion Passed (ALL 5 fields survived!)")

def test_date_and_batch_detection():
    ocr_regions = [
        {
            "regionId": "img-1-reg-1",
            "imageId": "img-1",
            "text": "Mfg. Date: SEP 2025",
            "normalizedText": "Mfg. Date: SEP 2025",
            "confidence": 0.94,
            "bbox": {"x": 10, "y": 10, "width": 40, "height": 10, "xPct": 10, "yPct": 10, "widthPct": 40, "heightPct": 10}
        },
        {
            "regionId": "img-1-reg-2",
            "imageId": "img-1",
            "text": "Expiry Date: AUG 2028",
            "normalizedText": "Expiry Date: AUG 2028",
            "confidence": 0.95,
            "bbox": {"x": 10, "y": 25, "width": 40, "height": 10, "xPct": 10, "yPct": 25, "widthPct": 40, "heightPct": 10}
        },
        {
            "regionId": "img-1-reg-3",
            "imageId": "img-1",
            "text": "Batch No.: OV25072",
            "normalizedText": "Batch No.: OV25072",
            "confidence": 0.93,
            "bbox": {"x": 10, "y": 40, "width": 40, "height": 10, "xPct": 10, "yPct": 40, "widthPct": 40, "heightPct": 10}
        }
    ]
    res = extract_declarations(ocr_regions)
    fields_found = set(d["field"] for d in res)
    assert "MANUFACTURE_DATE" in fields_found, "MANUFACTURE_DATE should be detected"
    assert "EXPIRY_DATE" in fields_found, "EXPIRY_DATE should be detected"
    assert "BATCH_NUMBER" in fields_found, "BATCH_NUMBER should be detected"

    mfg = next(d for d in res if d["field"] == "MANUFACTURE_DATE")
    exp = next(d for d in res if d["field"] == "EXPIRY_DATE")
    batch = next(d for d in res if d["field"] == "BATCH_NUMBER")

    assert "SEP 2025" in mfg["detectedValue"], f"Expected SEP 2025, got {mfg['detectedValue']}"
    assert "AUG 2028" in exp["detectedValue"], f"Expected AUG 2028, got {exp['detectedValue']}"
    assert "OV25072" in batch["detectedValue"], f"Expected OV25072, got {batch['detectedValue']}"
    print("[PASS] TEST 7: Manufacturing Date, Expiry Date & Batch Number Detection Passed")

def test_mfd_exp_shortcuts():
    shortcut_samples = [
        ("MFD: 09/25", "EXP: 08/28"),
        ("MFD. 09.2025", "EXP. 08.2028"),
        ("MFG: SEP 2025", "EXP: AUG 2028"),
        ("MFD SEP 25", "EXP AUG 28"),
        ("MFG.09/25", "EXP.08/28"),
        ("MFD:09/25", "EXP:08/28"),
        ("MFD 09-2025", "USE BY 08-2028"),
    ]

    for idx, (mfd_str, exp_str) in enumerate(shortcut_samples):
        ocr_regions = [
            {
                "regionId": f"s-{idx}-1",
                "imageId": f"img-{idx}",
                "text": mfd_str,
                "normalizedText": mfd_str,
                "confidence": 0.95,
                "bbox": {"x": 10, "y": 10, "width": 40, "height": 10, "xPct": 10, "yPct": 10, "widthPct": 40, "heightPct": 10}
            },
            {
                "regionId": f"s-{idx}-2",
                "imageId": f"img-{idx}",
                "text": exp_str,
                "normalizedText": exp_str,
                "confidence": 0.95,
                "bbox": {"x": 10, "y": 25, "width": 40, "height": 10, "xPct": 10, "yPct": 25, "widthPct": 40, "heightPct": 10}
            }
        ]
        res = extract_declarations(ocr_regions)
        mfg = next((d for d in res if d["field"] == "MANUFACTURE_DATE"), None)
        exp = next((d for d in res if d["field"] == "EXPIRY_DATE"), None)

        assert mfg is not None, f"Failed MFD shortcut detection on '{mfd_str}'"
        assert exp is not None, f"Failed EXP shortcut detection on '{exp_str}'"

    print("[PASS] TEST 8: MFD and EXP Shortcut Variations Detection Passed")

def test_multiline_mfd_exp():
    ocr_regions = [
        # Line 1: MFD:
        {
            "regionId": "ml-1",
            "imageId": "img-ml",
            "text": "MFD:",
            "normalizedText": "MFD:",
            "confidence": 0.95,
            "bbox": {"x": 10, "y": 10, "width": 20, "height": 10, "xPct": 10, "yPct": 10, "widthPct": 20, "heightPct": 10}
        },
        # Line 2: SEP 2025
        {
            "regionId": "ml-2",
            "imageId": "img-ml",
            "text": "SEP 2025",
            "normalizedText": "SEP 2025",
            "confidence": 0.94,
            "bbox": {"x": 10, "y": 25, "width": 30, "height": 10, "xPct": 10, "yPct": 25, "widthPct": 30, "heightPct": 10}
        },
        # Line 3: EXP DATE:
        {
            "regionId": "ml-3",
            "imageId": "img-ml",
            "text": "EXP DATE:",
            "normalizedText": "EXP DATE:",
            "confidence": 0.93,
            "bbox": {"x": 10, "y": 40, "width": 25, "height": 10, "xPct": 10, "yPct": 40, "widthPct": 25, "heightPct": 10}
        },
        # Line 4: AUG 2028
        {
            "regionId": "ml-4",
            "imageId": "img-ml",
            "text": "AUG 2028",
            "normalizedText": "AUG 2028",
            "confidence": 0.96,
            "bbox": {"x": 10, "y": 55, "width": 30, "height": 10, "xPct": 10, "yPct": 55, "widthPct": 30, "heightPct": 10}
        }
    ]
    res = extract_declarations(ocr_regions)
    mfg = next((d for d in res if d["field"] == "MANUFACTURE_DATE"), None)
    exp = next((d for d in res if d["field"] == "EXPIRY_DATE"), None)

    assert mfg is not None, "Multi-line MFD should be detected"
    assert exp is not None, "Multi-line EXP should be detected"
    assert "SEP 2025" in mfg["detectedValue"], f"Expected SEP 2025, got {mfg['detectedValue']}"
    assert "AUG 2028" in exp["detectedValue"], f"Expected AUG 2028, got {exp['detectedValue']}"
    print("[PASS] TEST 9: Multi-Line MFD and EXP Detection Passed")

def test_reject_batch_or_garbled_as_date():
    ocr_regions = [
        # Line 1: Batch No.: OV25072
        {
            "regionId": "t10-1",
            "imageId": "img-t10",
            "text": "Batch No.: OV25072",
            "normalizedText": "Batch No.: OV25072",
            "confidence": 0.94,
            "bbox": {"x": 10, "y": 10, "width": 50, "height": 10, "xPct": 10, "yPct": 10, "widthPct": 50, "heightPct": 10}
        },
        # Line 2: Garbled token near MFD label
        {
            "regionId": "t10-2",
            "imageId": "img-t10",
            "text": "MFD: CtDe n05@ vx25072",
            "normalizedText": "MFD: CtDe n05@ vx25072",
            "confidence": 0.48,
            "bbox": {"x": 10, "y": 25, "width": 60, "height": 10, "xPct": 10, "yPct": 25, "widthPct": 60, "heightPct": 10}
        },
        # Line 3: Valid MFD on next line
        {
            "regionId": "t10-3",
            "imageId": "img-t10",
            "text": "Mfg. Date: SEP 2025",
            "normalizedText": "Mfg. Date: SEP 2025",
            "confidence": 0.96,
            "bbox": {"x": 10, "y": 40, "width": 50, "height": 10, "xPct": 10, "yPct": 40, "widthPct": 50, "heightPct": 10}
        },
        # Line 4: Valid Expiry
        {
            "regionId": "t10-4",
            "imageId": "img-t10",
            "text": "Expiry Date: AUG 2028",
            "normalizedText": "Expiry Date: AUG 2028",
            "confidence": 0.95,
            "bbox": {"x": 10, "y": 55, "width": 50, "height": 10, "xPct": 10, "yPct": 55, "widthPct": 50, "heightPct": 10}
        }
    ]

    res = extract_declarations(ocr_regions)
    mfg = next((d for d in res if d["field"] == "MANUFACTURE_DATE"), None)
    exp = next((d for d in res if d["field"] == "EXPIRY_DATE"), None)
    batch = next((d for d in res if d["field"] == "BATCH_NUMBER"), None)

    assert batch is not None, "Batch number should be detected"
    assert batch["detectedValue"] == "OV25072", f"Expected OV25072 for batch, got {batch['detectedValue']}"

    assert mfg is not None, "MANUFACTURE_DATE should be detected"
    assert exp is not None, "EXPIRY_DATE should be detected"

    assert "CtDe" not in mfg["detectedValue"], f"Garbled text should NOT be assigned to MFD! Got {mfg['detectedValue']}"
    assert "OV25072" not in mfg["detectedValue"], f"Batch number should NOT be assigned to MFD! Got {mfg['detectedValue']}"

    assert "CtDe" not in exp["detectedValue"], f"Garbled text should NOT be assigned to EXP! Got {exp['detectedValue']}"
    assert "OV25072" not in exp["detectedValue"], f"Batch number should NOT be assigned to EXP! Got {exp['detectedValue']}"

    assert "SEP 2025" in mfg["detectedValue"], f"Expected SEP 2025 for MFD, got {mfg['detectedValue']}"
    assert "AUG 2028" in exp["detectedValue"], f"Expected AUG 2028 for EXP, got {exp['detectedValue']}"

    print("[PASS] TEST 10: Garbled text & Batch Number rejection from Date fields Passed")

def test_mfg_date_no_space_shortcuts():
    no_space_samples = [
        ("MFG.DATE: SEP 2025", "EXP.DATE: AUG 2028"),
        ("MFG. DATE: SEP 2025", "EXP. DATE: AUG 2028"),
        ("MFG.DATE SEP 2025", "EXP.DATE AUG 2028"),
        ("MFD.DATE: SEP 2025", "EXPIRY.DATE: AUG 2028"),
        ("MFD. DATE: SEP 2025", "EXPIRY DATE: AUG 2028"),
        ("MANUFACTURING DATE: SEP 2025", "EXPIRY DATE: AUG 2028"),
        ("DATE OF MFG: SEP 2025", "DATE OF EXPIRY: AUG 2028")
    ]

    for idx, (mfd_str, exp_str) in enumerate(no_space_samples):
        ocr_regions = [
            {
                "regionId": f"ns-{idx}-1",
                "imageId": f"img-ns-{idx}",
                "text": mfd_str,
                "normalizedText": mfd_str,
                "confidence": 0.95,
                "bbox": {"x": 10, "y": 10, "width": 50, "height": 10, "xPct": 10, "yPct": 10, "widthPct": 50, "heightPct": 10}
            },
            {
                "regionId": f"ns-{idx}-2",
                "imageId": f"img-ns-{idx}",
                "text": exp_str,
                "normalizedText": exp_str,
                "confidence": 0.95,
                "bbox": {"x": 10, "y": 25, "width": 50, "height": 10, "xPct": 10, "yPct": 25, "widthPct": 50, "heightPct": 10}
            }
        ]
        res = extract_declarations(ocr_regions)
        mfg = next((d for d in res if d["field"] == "MANUFACTURE_DATE"), None)
        exp = next((d for d in res if d["field"] == "EXPIRY_DATE"), None)

        assert mfg is not None, f"Failed no-space MFD shortcut detection on '{mfd_str}'"
        assert exp is not None, f"Failed no-space EXP shortcut detection on '{exp_str}'"
        assert "SEP 2025" in mfg["detectedValue"], f"Expected SEP 2025 on '{mfd_str}', got '{mfg['detectedValue']}'"
        assert "AUG 2028" in exp["detectedValue"], f"Expected AUG 2028 on '{exp_str}', got '{exp['detectedValue']}'"

    print("[PASS] TEST 11: MFG.DATE / MFD.DATE / EXP.DATE No-Space & Dot Shortcuts Passed")

def test_exact_sample_test():
    ocr_regions = [
        {
            "regionId": "sample-1",
            "imageId": "img-sample",
            "text": "Batch No.: OV25072",
            "normalizedText": "Batch No.: OV25072",
            "confidence": 0.96,
            "bbox": {"x": 10, "y": 10, "width": 50, "height": 10, "xPct": 10, "yPct": 10, "widthPct": 50, "heightPct": 10}
        },
        {
            "regionId": "sample-2",
            "imageId": "img-sample",
            "text": "Mfg. Date: SEP 2025",
            "normalizedText": "Mfg. Date: SEP 2025",
            "confidence": 0.95,
            "bbox": {"x": 10, "y": 25, "width": 50, "height": 10, "xPct": 10, "yPct": 25, "widthPct": 50, "heightPct": 10}
        },
        {
            "regionId": "sample-3",
            "imageId": "img-sample",
            "text": "Expiry Date: AUG 2028",
            "normalizedText": "Expiry Date: AUG 2028",
            "confidence": 0.95,
            "bbox": {"x": 10, "y": 40, "width": 50, "height": 10, "xPct": 10, "yPct": 40, "widthPct": 50, "heightPct": 10}
        },
        {
            "regionId": "sample-4",
            "imageId": "img-sample",
            "text": "MRP: ₹120.79",
            "normalizedText": "MRP ₹ 120.79",
            "confidence": 0.94,
            "bbox": {"x": 10, "y": 55, "width": 50, "height": 10, "xPct": 10, "yPct": 55, "widthPct": 50, "heightPct": 10}
        }
    ]

    res = extract_declarations(ocr_regions)
    batch = next((d for d in res if d["field"] == "BATCH_NUMBER"), None)
    mfg = next((d for d in res if d["field"] == "MANUFACTURE_DATE"), None)
    exp = next((d for d in res if d["field"] == "EXPIRY_DATE"), None)
    mrp = next((d for d in res if d["field"] == "MRP"), None)

    assert batch is not None, "BATCH_NUMBER must be detected"
    assert batch["detectedValue"] == "OV25072", f"Expected OV25072, got {batch['detectedValue']}"

    assert mfg is not None, "MANUFACTURE_DATE must be detected"
    assert "SEP 2025" in mfg["detectedValue"], f"Expected SEP 2025 for MANUFACTURE_DATE, got {mfg['detectedValue']}"
    assert mfg["evidence"]["regionId"] == "sample-2", "MANUFACTURE_DATE evidence bounding box must point to Mfg. Date region"

    assert exp is not None, "EXPIRY_DATE must be detected"
    assert "AUG 2028" in exp["detectedValue"], f"Expected AUG 2028 for EXPIRY_DATE, got {exp['detectedValue']}"
    assert exp["evidence"]["regionId"] == "sample-3", "EXPIRY_DATE evidence bounding box must point to Expiry Date region"

    # MUST NOT BE SAME VALUE!
    assert mfg["detectedValue"] != exp["detectedValue"], f"MANUFACTURE_DATE and EXPIRY_DATE MUST NOT BE THE SAME VALUE! Both were {mfg['detectedValue']}"

    assert mrp is not None, "MRP must be detected"
    assert "120.79" in mrp["detectedValue"], f"Expected 120.79 for MRP, got {mrp['detectedValue']}"

    print("[PASS] TEST 12: Exact User Sample Test Passed (MFD=SEP 2025, EXP=AUG 2028, BATCH=OV25072, MRP=120.79)")

def test_required_test_case_18():
    ocr_regions = [
        {
            "regionId": "req18-1",
            "imageId": "img-req18",
            "text": "Manufactured by:",
            "normalizedText": "Manufactured by:",
            "confidence": 0.95,
            "bbox": {"x": 10, "y": 10, "width": 50, "height": 10, "xPct": 10, "yPct": 10, "widthPct": 50, "heightPct": 10}
        },
        {
            "regionId": "req18-2",
            "imageId": "img-req18",
            "text": "Vivmed Lab",
            "normalizedText": "Vivmed Lab",
            "confidence": 0.94,
            "bbox": {"x": 10, "y": 22, "width": 40, "height": 10, "xPct": 10, "yPct": 22, "widthPct": 40, "heightPct": 10}
        },
        {
            "regionId": "req18-3",
            "imageId": "img-req18",
            "text": "Uttarakhand, India",
            "normalizedText": "Uttarakhand, India",
            "confidence": 0.92,
            "bbox": {"x": 10, "y": 34, "width": 50, "height": 10, "xPct": 10, "yPct": 34, "widthPct": 50, "heightPct": 10}
        },
        {
            "regionId": "req18-4",
            "imageId": "img-req18",
            "text": "Mfg. Date: SEP 2025",
            "normalizedText": "Mfg. Date: SEP 2025",
            "confidence": 0.96,
            "bbox": {"x": 10, "y": 48, "width": 50, "height": 10, "xPct": 10, "yPct": 48, "widthPct": 50, "heightPct": 10}
        },
        {
            "regionId": "req18-5",
            "imageId": "img-req18",
            "text": "Expiry Date: AUG 2028",
            "normalizedText": "Expiry Date: AUG 2028",
            "confidence": 0.95,
            "bbox": {"x": 10, "y": 60, "width": 50, "height": 10, "xPct": 10, "yPct": 60, "widthPct": 50, "heightPct": 10}
        },
        {
            "regionId": "req18-6",
            "imageId": "img-req18",
            "text": "Customer Care: consumer.2.co@gsk.com",
            "normalizedText": "Customer Care: consumer.2.co@gsk.com",
            "confidence": 0.94,
            "bbox": {"x": 10, "y": 74, "width": 70, "height": 10, "xPct": 10, "yPct": 74, "widthPct": 70, "heightPct": 10}
        }
    ]

    res = extract_declarations(ocr_regions)
    mfg = next((d for d in res if d["field"] == "MANUFACTURER"), None)
    mfg_addr = next((d for d in res if d["field"] == "MANUFACTURER_ADDRESS"), None)
    mfg_date = next((d for d in res if d["field"] == "MANUFACTURE_DATE"), None)
    exp_date = next((d for d in res if d["field"] == "EXPIRY_DATE"), None)
    cc_email = next((d for d in res if d["field"] == "CUSTOMER_CARE_EMAIL"), None)
    cc_contact = next((d for d in res if d["field"] == "CUSTOMER_CARE_CONTACT"), None)
    coo = next((d for d in res if d["field"] == "COUNTRY_OF_ORIGIN"), None)

    assert mfg is not None, "MANUFACTURER must be detected"
    assert "Vivmed Lab" in mfg["detectedValue"], f"Expected Vivmed Lab, got {mfg['detectedValue']}"

    assert mfg_addr is not None, "MANUFACTURER_ADDRESS must be detected"
    assert "Uttarakhand" in mfg_addr["detectedValue"], f"Expected Uttarakhand, India, got {mfg_addr['detectedValue']}"

    assert mfg_date is not None, "MANUFACTURE_DATE must be detected"
    assert "SEP 2025" in mfg_date["detectedValue"], f"Expected SEP 2025, got {mfg_date['detectedValue']}"

    assert exp_date is not None, "EXPIRY_DATE must be detected"
    assert "AUG 2028" in exp_date["detectedValue"], f"Expected AUG 2028, got {exp_date['detectedValue']}"

    assert cc_email is not None, "CUSTOMER_CARE_EMAIL must be detected"
    assert "consumer.2.co@gsk.com" in cc_email["detectedValue"], f"Expected consumer.2.co@gsk.com, got {cc_email['detectedValue']}"

    assert cc_contact is not None, "CUSTOMER_CARE_CONTACT must be PRESENT when email exists"
    assert "PRESENT" in cc_contact["detectedValue"], f"Expected PRESENT for CUSTOMER_CARE_CONTACT, got {cc_contact['detectedValue']}"

    assert coo is not None, "COUNTRY_OF_ORIGIN should be inferred from manufacturer address"
    assert coo["evidenceType"] == "INFERRED_FROM_MANUFACTURER_ADDRESS", "evidenceType should be INFERRED_FROM_MANUFACTURER_ADDRESS"
    assert "India" in coo["detectedValue"], f"Expected India, got {coo['detectedValue']}"

    print("[PASS] TEST 13: Requirement Test Case Passed (Mfg=Vivmed Lab, Addr=Uttarakhand India, MFD=SEP 2025, EXP=AUG 2028, CC=consumer.2.co@gsk.com, COO=India [INFERRED])")

def test_prompt_regression_1():
    # 1. "Mfg. Date: SEP.2025", "Expiry Date: AUG.2028" -> manufacture = 2025-09, expiry = 2028-08
    ocr_regions = [
        {"regionId": "r1-1", "imageId": "img-1", "text": "Mfg. Date: SEP.2025", "normalizedText": "Mfg. Date: SEP.2025", "confidence": 0.95, "bbox": {"x": 10, "y": 10, "width": 40, "height": 10, "xPct": 10, "yPct": 10, "widthPct": 40, "heightPct": 10}},
        {"regionId": "r1-2", "imageId": "img-1", "text": "Expiry Date: AUG.2028", "normalizedText": "Expiry Date: AUG.2028", "confidence": 0.95, "bbox": {"x": 10, "y": 25, "width": 40, "height": 10, "xPct": 10, "yPct": 25, "widthPct": 40, "heightPct": 10}}
    ]
    res = extract_declarations(ocr_regions)
    mfg = next(d for d in res if d["field"] == "MANUFACTURE_DATE")
    exp = next(d for d in res if d["field"] == "EXPIRY_DATE")
    assert mfg["normalizedValue"] == "2025-09", f"Expected 2025-09, got {mfg['normalizedValue']}"
    assert mfg["displayValue"] == "SEP.2025", f"Expected SEP.2025, got {mfg['displayValue']}"
    assert exp["normalizedValue"] == "2028-08", f"Expected 2028-08, got {exp['normalizedValue']}"
    assert exp["displayValue"] == "AUG.2028", f"Expected AUG.2028, got {exp['displayValue']}"
    print("[PASS] PROMPT REGRESSION 1 Passed")

def test_prompt_regression_2():
    # 2. "MFD: 09/2025", "EXP: 08/2028" -> manufacture = 2025-09, expiry = 2028-08
    ocr_regions = [
        {"regionId": "r2-1", "imageId": "img-1", "text": "MFD: 09/2025", "normalizedText": "MFD: 09/2025", "confidence": 0.95, "bbox": {"x": 10, "y": 10, "width": 40, "height": 10, "xPct": 10, "yPct": 10, "widthPct": 40, "heightPct": 10}},
        {"regionId": "r2-2", "imageId": "img-1", "text": "EXP: 08/2028", "normalizedText": "EXP: 08/2028", "confidence": 0.95, "bbox": {"x": 10, "y": 25, "width": 40, "height": 10, "xPct": 10, "yPct": 25, "widthPct": 40, "heightPct": 10}}
    ]
    res = extract_declarations(ocr_regions)
    mfg = next(d for d in res if d["field"] == "MANUFACTURE_DATE")
    exp = next(d for d in res if d["field"] == "EXPIRY_DATE")
    assert mfg["normalizedValue"] == "2025-09"
    assert exp["normalizedValue"] == "2028-08"
    print("[PASS] PROMPT REGRESSION 2 Passed")

def test_prompt_regression_3():
    # 3. "Manufactured: September 2025", "Best Before: August 2028" -> manufacture = 2025-09, expiry = 2028-08
    ocr_regions = [
        {"regionId": "r3-1", "imageId": "img-1", "text": "Manufactured: September 2025", "normalizedText": "Manufactured: September 2025", "confidence": 0.95, "bbox": {"x": 10, "y": 10, "width": 40, "height": 10, "xPct": 10, "yPct": 10, "widthPct": 40, "heightPct": 10}},
        {"regionId": "r3-2", "imageId": "img-1", "text": "Best Before: August 2028", "normalizedText": "Best Before: August 2028", "confidence": 0.95, "bbox": {"x": 10, "y": 25, "width": 40, "height": 10, "xPct": 10, "yPct": 25, "widthPct": 40, "heightPct": 10}}
    ]
    res = extract_declarations(ocr_regions)
    mfg = next(d for d in res if d["field"] == "MANUFACTURE_DATE")
    exp = next(d for d in res if d["field"] in ["EXPIRY_DATE", "BEST_BEFORE"])
    assert mfg["normalizedValue"] == "2025-09"
    assert exp["normalizedValue"] == "2028-08"
    print("[PASS] PROMPT REGRESSION 3 Passed")

def test_prompt_regression_4():
    # 4. "PKD: 09-2025" -> packing/manufacture candidate = 2025-09
    ocr_regions = [
        {"regionId": "r4-1", "imageId": "img-1", "text": "PKD: 09-2025", "normalizedText": "PKD: 09-2025", "confidence": 0.95, "bbox": {"x": 10, "y": 10, "width": 40, "height": 10, "xPct": 10, "yPct": 10, "widthPct": 40, "heightPct": 10}}
    ]
    res = extract_declarations(ocr_regions)
    mfg = next(d for d in res if d["field"] == "MANUFACTURE_DATE")
    assert mfg["normalizedValue"] == "2025-09"
    print("[PASS] PROMPT REGRESSION 4 Passed")

def test_prompt_regression_5():
    # 5. "Manufactured in India" -> country_of_origin = India, evidenceType = EXPLICIT
    ocr_regions = [
        {"regionId": "r5-1", "imageId": "img-1", "text": "Manufactured in India", "normalizedText": "Manufactured in India", "confidence": 0.96, "bbox": {"x": 10, "y": 10, "width": 40, "height": 10, "xPct": 10, "yPct": 10, "widthPct": 40, "heightPct": 10}}
    ]
    res = extract_declarations(ocr_regions)
    coo = next(d for d in res if d["field"] == "COUNTRY_OF_ORIGIN")
    assert coo["normalizedValue"] == "India"
    assert coo["evidenceType"] == "EXPLICIT"
    print("[PASS] PROMPT REGRESSION 5 Passed")

def test_prompt_regression_6():
    # 6. "Manufactured By Vivimed Labs Limited, Uttarakhand, India" -> manufacturer = Vivimed Labs Limited, country candidate = India (INFERRED_FROM_MANUFACTURER_ADDRESS)
    ocr_regions = [
        {"regionId": "r6-1", "imageId": "img-1", "text": "Manufactured By Vivimed Labs Limited, D-9 Industrial Area, Haridwar - 249401, Uttarakhand, India", "normalizedText": "Manufactured By Vivimed Labs Limited, D-9 Industrial Area, Haridwar - 249401, Uttarakhand, India", "confidence": 0.95, "bbox": {"x": 10, "y": 10, "width": 80, "height": 10, "xPct": 10, "yPct": 10, "widthPct": 80, "heightPct": 10}}
    ]
    res = extract_declarations(ocr_regions)
    mfg = next(d for d in res if d["field"] == "MANUFACTURER")
    coo = next(d for d in res if d["field"] == "COUNTRY_OF_ORIGIN")
    assert "Vivimed Labs Limited" in mfg["detectedValue"]
    assert coo["normalizedValue"] == "India"
    assert coo["evidenceType"] == "INFERRED_FROM_MANUFACTURER_ADDRESS"
    print("[PASS] PROMPT REGRESSION 6 Passed")

def test_prompt_regression_7():
    # 7. Image 1 contains manufacturer. Image 2 contains Mfg Date. Image 3 contains MRP. Expected final inspection contains ALL THREE.
    ocr_regions = [
        {"regionId": "r7-1", "imageId": "img-1", "text": "Manufactured by XYZ Foods Pvt Ltd", "normalizedText": "Manufactured by XYZ Foods Pvt Ltd", "confidence": 0.95, "bbox": {"x": 10, "y": 10, "width": 60, "height": 10, "xPct": 10, "yPct": 10, "widthPct": 60, "heightPct": 10}},
        {"regionId": "r7-2", "imageId": "img-2", "text": "Mfg. Date: SEP 2025", "normalizedText": "Mfg. Date: SEP 2025", "confidence": 0.95, "bbox": {"x": 10, "y": 10, "width": 40, "height": 10, "xPct": 10, "yPct": 10, "widthPct": 40, "heightPct": 10}},
        {"regionId": "r7-3", "imageId": "img-3", "text": "MRP Rs. 120.00", "normalizedText": "MRP ₹ 120.00", "confidence": 0.95, "bbox": {"x": 10, "y": 10, "width": 40, "height": 10, "xPct": 10, "yPct": 10, "widthPct": 40, "heightPct": 10}}
    ]
    res = extract_declarations(ocr_regions)
    fields = set(d["field"] for d in res)
    assert "MANUFACTURER" in fields
    assert "MANUFACTURE_DATE" in fields
    assert "MRP" in fields
    print("[PASS] PROMPT REGRESSION 7 Passed")

def test_prompt_regression_8():
    # 8. Image processing order is reversed. Expected final declarations remain identical.
    ocr_regions_orig = [
        {"regionId": "r8-1", "imageId": "img-1", "text": "Manufactured by XYZ Foods Pvt Ltd", "normalizedText": "Manufactured by XYZ Foods Pvt Ltd", "confidence": 0.95, "bbox": {"x": 10, "y": 10, "width": 60, "height": 10, "xPct": 10, "yPct": 10, "widthPct": 60, "heightPct": 10}},
        {"regionId": "r8-2", "imageId": "img-2", "text": "Mfg. Date: SEP 2025", "normalizedText": "Mfg. Date: SEP 2025", "confidence": 0.95, "bbox": {"x": 10, "y": 10, "width": 40, "height": 10, "xPct": 10, "yPct": 10, "widthPct": 40, "heightPct": 10}}
    ]
    ocr_regions_rev = list(reversed(ocr_regions_orig))

    res1 = extract_declarations(ocr_regions_orig)
    res2 = extract_declarations(ocr_regions_rev)

    fields1 = sorted([d["field"] for d in res1])
    fields2 = sorted([d["field"] for d in res2])
    assert fields1 == fields2, f"Expected {fields1}, got {fields2}"
    print("[PASS] PROMPT REGRESSION 8 Passed")

def test_prompt_regression_9():
    # 9. One image has OCR failure. Expected other images still contribute their declarations.
    ocr_regions = [
        {"regionId": "r9-1", "imageId": "img-1", "text": "Mfg. Date: SEP 2025", "normalizedText": "Mfg. Date: SEP 2025", "confidence": 0.95, "bbox": {"x": 10, "y": 10, "width": 40, "height": 10, "xPct": 10, "yPct": 10, "widthPct": 40, "heightPct": 10}}
        # img-2 failed OCR (no regions)
    ]
    res = extract_declarations(ocr_regions)
    assert any(d["field"] == "MANUFACTURE_DATE" for d in res)
    print("[PASS] PROMPT REGRESSION 9 Passed")

def test_prompt_regression_10():
    # 10. Later image has no manufacture date. Expected previously detected manufacture date is NOT overwritten with null.
    ocr_regions = [
        {"regionId": "r10-1", "imageId": "img-1", "text": "Mfg. Date: SEP 2025", "normalizedText": "Mfg. Date: SEP 2025", "confidence": 0.95, "bbox": {"x": 10, "y": 10, "width": 40, "height": 10, "xPct": 10, "yPct": 10, "widthPct": 40, "heightPct": 10}},
        {"regionId": "r10-2", "imageId": "img-2", "text": "Net Quantity 500g", "normalizedText": "Net Quantity 500g", "confidence": 0.95, "bbox": {"x": 10, "y": 10, "width": 40, "height": 10, "xPct": 10, "yPct": 10, "widthPct": 40, "heightPct": 10}}
    ]
    res = extract_declarations(ocr_regions)
    mfg = next((d for d in res if d["field"] == "MANUFACTURE_DATE"), None)
    assert mfg is not None, "MANUFACTURE_DATE must survive multi-image processing"
    assert mfg["normalizedValue"] == "2025-09"
    print("[PASS] PROMPT REGRESSION 10 Passed")

def test_all_mfg_date_aliases():
    aliases = [
        "Mfg. Date: SEP.2025",
        "Mfg.Date: SEP.2025",
        "Mfg Date: SEP.2025",
        "Mfg.Date SEP.2025",
        "Mfg Date SEP.2025",
        "MFG. DATE: SEP.2025",
        "MFG DATE SEP.2025",
        "Mfd. Date: SEP.2025",
        "Mfd Date: SEP.2025",
        "Mfd.Date: SEP.2025",
        "Mfd. Date SEP.2025",
        "Manufacturing Date: SEP.2025",
        "Manufacture Date: SEP.2025",
        "Date of Manufacture: SEP.2025",
        "Manufactured: SEP.2025",
        "Manufactured on: SEP.2025",
        "Mfg. Datc: SEP.2025",
        "Mfg D ate: SEP.2025",
        "mfg. date : sep.2025"
    ]
    for idx, text_sample in enumerate(aliases):
        ocr_regions = [
            {"regionId": f"al-{idx}", "imageId": f"img-al-{idx}", "text": text_sample, "normalizedText": text_sample, "confidence": 0.95, "bbox": {"x": 10, "y": 10, "width": 50, "height": 10, "xPct": 10, "yPct": 10, "widthPct": 50, "heightPct": 10}}
        ]
        res = extract_declarations(ocr_regions)
        mfg = next((d for d in res if d["field"] == "MANUFACTURE_DATE"), None)
        assert mfg is not None, f"Failed alias detection on: '{text_sample}'"
        assert mfg["normalizedValue"] == "2025-09", f"Expected 2025-09 for '{text_sample}', got {mfg['normalizedValue']}"

    print("[PASS] ALL MANUFACTURING DATE ALIASES & OCR TYPOS TEST PASSED")

def test_full_date_formats():
    samples = [
        ("Mfg. Date: 15/09/2025", "2025-09-15"),
        ("Mfg. Date: 15-09-2025", "2025-09-15"),
        ("Mfg. Date: 15.09.2025", "2025-09-15"),
        ("Mfg. Date: 2025-09-15", "2025-09-15"),
        ("Mfg. Date: September 2025", "2025-09"),
        ("Mfg. Date: 09/25", "2025-09"),
        ("Mfg. Date: 09.25", "2025-09")
    ]
    for idx, (text_sample, expected_iso) in enumerate(samples):
        ocr_regions = [
            {"regionId": f"df-{idx}", "imageId": f"img-df-{idx}", "text": text_sample, "normalizedText": text_sample, "confidence": 0.95, "bbox": {"x": 10, "y": 10, "width": 50, "height": 10, "xPct": 10, "yPct": 10, "widthPct": 50, "heightPct": 10}}
        ]
        res = extract_declarations(ocr_regions)
        mfg = next((d for d in res if d["field"] == "MANUFACTURE_DATE"), None)
        assert mfg is not None, f"Failed date format detection on: '{text_sample}'"
        assert mfg["normalizedValue"] == expected_iso, f"Expected {expected_iso} for '{text_sample}', got {mfg['normalizedValue']}"

    print("[PASS] ALL DATE FORMATS (DAY-MONTH-YEAR & MONTH-YEAR) TEST PASSED")

def test_normalize_ocr_text_preserves_september():
    from ocr_engine import normalize_ocr_text
    raw = "Mfg.Date: SEP.2025"
    norm = normalize_ocr_text(raw)
    assert norm == "Mfg.Date: SEP.2025", f"Expected 'Mfg.Date: SEP.2025', got '{norm}'"
    print("[PASS] TEST 14: normalize_ocr_text preserves month SEP without corruption Passed")

if __name__ == "__main__":
    test_mrp_detection()
    test_net_quantity_detection()
    test_consumer_care_detection()
    test_multi_image_fusion_agreement()
    test_multi_image_conflict_resolution()
    test_5_image_mixed_fusion()
    test_date_and_batch_detection()
    test_mfd_exp_shortcuts()
    test_multiline_mfd_exp()
    test_reject_batch_or_garbled_as_date()
    test_mfg_date_no_space_shortcuts()
    test_exact_sample_test()
    test_required_test_case_18()
    test_prompt_regression_1()
    test_prompt_regression_2()
    test_prompt_regression_3()
    test_prompt_regression_4()
    test_prompt_regression_5()
    test_prompt_regression_6()
    test_prompt_regression_7()
    test_prompt_regression_8()
    test_prompt_regression_9()
    test_prompt_regression_10()
    test_all_mfg_date_aliases()
    test_full_date_formats()
    test_normalize_ocr_text_preserves_september()
    print("==================================================")
    print("ALL PYTHON AI EXTRACTION UNIT TESTS PASSED!")
    print("==================================================")
