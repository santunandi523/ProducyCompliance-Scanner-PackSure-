import re

MONTH_MAP = {
    'jan': '01', 'january': '01',
    'feb': '02', 'february': '02',
    'mar': '03', 'march': '03',
    'apr': '04', 'april': '04',
    'may': '05',
    'jun': '06', 'june': '06',
    'jul': '07', 'july': '07',
    'aug': '08', 'august': '08',
    'sep': '09', 'sept': '09', 'september': '09',
    'oct': '10', 'october': '10',
    'nov': '11', 'november': '11',
    'dec': '12', 'december': '12'
}

def normalize_date_to_iso(val: str) -> str:
    if not val:
        return val
    v = val.strip()
    tokens = [t for t in re.split(r'[\/\-\.\s]+', v) if t]
    if not tokens:
        return val

    year = None
    month = None
    day = None

    # Check for month name in tokens
    for i, t in enumerate(tokens):
        t_lower = t.lower()
        if t_lower in MONTH_MAP:
            month = MONTH_MAP[t_lower]
            tokens.pop(i)
            break

    # Parse 4-digit year starting with 19 or 20
    for i, t in enumerate(tokens):
        if len(t) == 4 and t.isdigit() and (t.startswith("20") or t.startswith("19")):
            year = t
            tokens.pop(i)
            break

    # If no 4-digit year, check for 2-digit year
    if year is None and tokens:
        if len(tokens) >= 2:
            last_t = tokens[-1]
            if len(last_t) == 2 and last_t.isdigit():
                year = f"20{last_t}"
                tokens.pop()
            elif len(tokens[0]) == 2 and tokens[0].isdigit() and not month and int(tokens[0]) > 12:
                year = f"20{tokens[0]}"
                tokens.pop(0)

    # Parse month from remaining numeric tokens
    if month is None and tokens:
        for i, t in enumerate(tokens):
            if t.isdigit() and 1 <= int(t) <= 12:
                month = t.zfill(2)
                tokens.pop(i)
                break

    # Parse day from remaining numeric tokens if present
    if tokens:
        for i, t in enumerate(tokens):
            if t.isdigit() and 1 <= int(t) <= 31:
                day = t.zfill(2)
                tokens.pop(i)
                break

    if year and month:
        if day:
            return f"{year}-{month}-{day}"
        return f"{year}-{month}"

    return val.strip()

MONTH_PATTERN = r'(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)'

DATE_VAL_PATTERN = (
    r'(?:'
    r'(?:[0-3]?[0-9][\/\-\.\s]+)?' + MONTH_PATTERN + r'[\/\-\.\s]*(?:19|20)?[0-9]{2}'
    r'|(?:0?[1-9]|1[0-2])[\/\-\.\s]+(?:19|20)?[0-9]{2}'
    r'|(?:[0-3]?[0-9])[\/\-\.\s]+(?:0?[1-9]|1[0-2])[\/\-\.\s]+(?:19|20)?[0-9]{2}'
    r'|(?:19|20)[0-9]{2}[\/\-\.\s]+(?:0?[1-9]|1[0-2])(?:[\/\-\.\s]+[0-3]?[0-9])?'
    r')'
)

def is_valid_date(val: str) -> bool:
    """
    Strict validation for date candidates. Rejects batch numbers, price strings, phone numbers,
    or garbled tokens (e.g. 'OV25072', 'CtDe n05@ vx25072').
    """
    if not val or len(val.strip()) < 2:
        return False
    v = val.strip()

    # Reject non-date keywords, price symbols, or garbled punctuation
    if re.search(r'(?i)\b(?:batch|lot|mrp|rs|inr|₹|phone|email|care|brand|net|pkg|no\.?|num)\b', v):
        return False
    if re.search(r'[@#$\%^&*()=+|{}:;<>?]', v):
        return False

    # Must match structured date pattern
    if re.search(r'(?i)^' + DATE_VAL_PATTERN + r'$', v) or re.search(r'(?i)\b' + DATE_VAL_PATTERN + r'\b', v):
        return True

    return False

# Comprehensive Legal Metrology Declaration Extraction Engine (PCR 2011 Rules)
PATTERNS = {
    "MRP": {
        "keywords": [
            r'\bm\.?r\.?p\b',
            r'\bmax(?:imum)?\s*retail\s*price\b',
            r'\bincl\.?\s*of\s*all\s*taxes\b',
            r'\b₹\s*\d+',
            r'\brs\.?\s*\d+'
        ],
        "regex": r'(?:m\.?r\.?p\.?|max\.?\s*retail\s*price|price|incl\.?\s*of\s*all\s*taxes)?[\s\:\₹\$\.\-\/]*(?:rs\.?|inr|₹)?\s*([0-9]+(?:[\.\,][0-9]{1,2})?)',
    },
    "NET_QUANTITY": {
        "keywords": [
            r'\bnet\s*(?:qty|quantity|wt\.?|weight|vol\.?|volume|content|contents)\b',
            r'\b\d+\s*(?:g|kg|ml|l|ltr|gm|gms|grams|pcs|units|n)\b'
        ],
        "regex": r'(?:net\s*(?:qty|quantity|wt\.?|weight|vol\.?|volume|content|contents)\s*[\:\-]?)?\s*([0-9]+(?:\.[0-9]+)?\s*(?:kg|g|gm|gms|grams?|ml|l|ltr|litres?|pcs|units?|n))\b',
    },
    "MANUFACTURER": {
        "keywords": [
            r'\bmfd\.?\s*by\b',
            r'\bmfg\.?\s*by\b',
            r'\bmanufactured\s*(?:&|and)?\s*marketed\s*by\b',
            r'\bmanufactured\s*(?:&|and)?\s*packed\s*by\b',
            r'\bmanufactured\s*by\b',
            r'\bmanufactured\s*for\b',
            r'\bproduced\s*by\b',
            r'\bpacked\s*by\b',
            r'\bpacker\b',
            r'\bimported\s*by\b',
            r'\bimporter\b',
            r'\bmarketed\s*by\b'
        ],
        "regex": r'(?:mfd\.?\s*by|mfg\.?\s*by|manufactured\s*(?:&|and)?\s*(?:marketed|packed|for)?\s*by|produced\s*by|packed\s*by|packer|imported\s*by|importer|marketed\s*by)[\s\:\-]+(.+)',
    },
    "MANUFACTURER_ADDRESS": {
        "keywords": [r'\bmfd\s*address\b', r'\bmanufactured\s*at\b', r'\bfactory\s*address\b', r'\bregd\.?\s*office\b'],
        "regex": r'(?:mfd\s*address|manufactured\s*at|factory\s*address|regd\.?\s*office)[\s\:\-]+(.+)',
    },
    "PACKER": {
        "keywords": [r'\bpacked\s*by\b', r'\bpkd\.?\s*by\b', r'\bpackaging\s*by\b', r'\bpacker\b'],
        "regex": r'(?:packed\s*by|pkd\.?\s*by|packaging\s*by|packer)[\s\:\-]+(.+)',
    },
    "PACKER_ADDRESS": {
        "keywords": [r'\bpacked\s*at\b', r'\bpacker\s*address\b'],
        "regex": r'(?:packed\s*at|packer\s*address)[\s\:\-]+(.+)',
    },
    "IMPORTER": {
        "keywords": [r'\bimported\s*by\b', r'\bimporter\b', r'\bimp\.?\s*by\b'],
        "regex": r'(?:imported\s*by|importer|imp\.?\s*by)[\s\:\-]+(.+)',
    },
    "IMPORTER_ADDRESS": {
        "keywords": [r'\bimported\s*at\b', r'\bimporter\s*address\b'],
        "regex": r'(?:imported\s*at|importer\s*address)[\s\:\-]+(.+)',
    },
    "MANUFACTURE_DATE": {
        "keywords": [
            r'(?i)\bmfg[\.\s]*d[a|t|c|l|1]*[e|c|o|t]?\b',
            r'(?i)\bmfd[\.\s]*d[a|t|c|l|1]*[e|c|o|t]?\b',
            r'(?i)\bpkd[\.\s]*d[a|t|c|l|1]*[e|c|o|t]?\b',
            r'(?i)\bmfg\.?\b',
            r'(?i)\bmfd\.?\b',
            r'(?i)\bpkd\.?\b',
            r'(?i)\bdom\.?\b',
            r'(?i)\bd\.?o\.?m\.?\b',
            r'(?i)\bmfo\.?\b',
            r'(?i)\bmfc\.?\b',
            r'(?i)\bm\.?f\.?d\.?\b',
            r'(?i)\bm\.?f\.?g\.?\b',
            r'(?i)\bp\.?k\.?d\.?\b',
            r'(?i)\bmanufactur(?:e|ed|ing)?\s*(?:date|on|dat|dato|datc|dale|da1e|dt)?\b',
            r'(?i)\bpacked?\s*(?:date|on|dat|dato|datc|dale|da1e|dt)?\b',
            r'(?i)\bpacking\s*(?:date|dat|dato|datc|dale|da1e|dt)?\b',
            r'(?i)\bdate\s*(?:of\s*)?(?:mfg|mfd|pkd|dom|manufacture|manufacturing|pack|packing|packaging)\b',
            r'(?i)\bmfg\s*d\s*ate\b',
            r'(?i)\bmfd\s*d\s*ate\b'
        ],
        "regex": r'(?i)(?:mfd\.?|mfg\.?|pkd\.?|dom\.?|mfo\.?|mfc\.?|m\.?f\.?d\.?|m\.?f\.?g\.?|p\.?k\.?d\.?|d\.?o\.?m\.?|manufactur(?:e|ed|ing)?|date\s*(?:of\s*)?(?:mfg|mfd|pkd|dom|manufacture|manufacturing|pack|packing|packaging)|packed?|packing)[\.\s\:\/\-]*'
                 r'(?:date|on|dat|dato|datc|dale|da1e|dt|d\s*ate)?[\.\s\:\/\-]*'
                 r'(' + DATE_VAL_PATTERN + r')',
    },
    "EXPIRY_DATE": {
        "keywords": [
            r'\bexp[\.\s]*date\b',
            r'\bexpiry[\.\s]*date\b',
            r'\bexp\.?\b',
            r'\beyp\.?\b',
            r'\be\.?x\.?p\.?\b',
            r'\bexpiry\b',
            r'\bexpires?\b',
            r'\buse\s*before\b',
            r'\buse\s*by\b',
            r'\bbest\s*before\b'
        ],
        "regex": r'(?:exp|eyp|e\.?x\.?p\.?|expiry|expires?|use\s*before|use\s*by|best\s*before)[\.\s\:\/\-]*'
                 r'(?:date|on)?[\.\s\:\/\-]*'
                 r'(' + DATE_VAL_PATTERN + r')',
    },
    "BEST_BEFORE": {
        "keywords": [r'\bbest\s*before\b'],
        "regex": r'(?:best\s*before)[\s\:\.\-]*([0-9]+\s*(?:months|years|days)|' + DATE_VAL_PATTERN + r')',
    },
    "BATCH_NUMBER": {
        "keywords": [
            r'\bbatch\s*(?:no\.?|num(?:ber)?)?\b',
            r'\bb\.?\s*no\.?\b',
            r'\bbatch\b'
        ],
        "regex": r'(?:batch|b\s*no)[\s\:\.\-\#]*(?:no\.?|num(?:ber)?)?[\s\:\.\-\#]*([a-zA-Z0-9\/\-\_]+)',
    },
    "LOT_NUMBER": {
        "keywords": [
            r'\blot\s*(?:no\.?|num(?:ber)?)?\b',
            r'\blot\b'
        ],
        "regex": r'(?:lot)[\s\:\.\-\#]*(?:no\.?|num(?:ber)?)?[\s\:\.\-\#]*([a-zA-Z0-9\/\-\_]+)',
    },
    "CUSTOMER_CARE_PHONE": {
        "keywords": [
            r'\bconsumer\s*care\b',
            r'\bcustomer\s*care\b',
            r'\bhelpline\b',
            r'\btoll\s*free\b',
            r'\bfor\s*complaints\b',
            r'\bcall\b'
        ],
        "regex": r'(?:1800[\-\s]?[0-9]{3}[\-\s]?[0-9]{4}|\+?91[\-\s]?[0-9]{10}|0[0-9]{2,4}[\-\s]?[0-9]{6,8})',
    },
    "CUSTOMER_CARE_EMAIL": {
        "keywords": [
            r'\bemail\b', r'\be-mail\b', r'\bcare@\b', r'\bfeedback@\b', r'\bsupport@\b',
            r'\bconsumer\s*care\b', r'\bcustomer\s*care\b', r'\bfor\s*complaints\b', r'\bcontact\b', r'\bhelpline\b'
        ],
        "regex": r'([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)',
    },
    "WEBSITE": {
        "keywords": [r'\bwebsite\b', r'\bweb\b', r'\bvisit\b'],
        "regex": r'((?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[a-zA-Z0-9-._~:\/?#\[\]@!$&\'()*+,;=]*)?)',
    },
    "COUNTRY_OF_ORIGIN": {
        "keywords": [
            r'\bcountry\s*(?:of|0f|of)?\s*(?:origin|0rigin|orlgin)\b',
            r'\bcountryoforigin\b',
            r'\bmade\s*(?:in|ln)\b',
            r'\bproduct\s*of\b',
            r'\bmanufactured\s*(?:in|ln)\b',
            r'\bproduced\s*(?:in|ln)\b',
            r'\bcountry\s*of\s*manufacture\b',
            r'\borigin\b'
        ],
        "regex": r'(?:country\s*(?:of|0f)?\s*(?:origin|0rigin|orlgin)|countryoforigin|made\s*(?:in|ln)|product\s*of|manufactured\s*(?:in|ln)|produced\s*(?:in|ln)|country\s*of\s*manufacture|origin)[\s\:\.\-]*([a-zA-Z\s]+)',
    },
}

def extract_declarations(ocr_regions: list, barcodes: list = None) -> list:
    """
    Multi-pass Legal Metrology declaration extraction across ALL uploaded images.
    Preserves source image IDs, groups findings across panels, merges evidence, and resolves conflicts.
    """
    raw_findings = []
    matched_region_ids = set()

    # Sort regions by imageId, then top-to-bottom
    sorted_regions = sorted(ocr_regions, key=lambda r: (r.get("imageId", "img-1"), r["bbox"]["y"], r["bbox"]["x"]))

    # PASS 1: Pattern & Multi-Line Proximity Matching
    for field_name, rules in PATTERNS.items():
        for i, region in enumerate(sorted_regions):
            text = region["normalizedText"]

            triggered = False
            for kw in rules["keywords"]:
                if re.search(kw, text, re.IGNORECASE):
                    triggered = True
                    break

            if triggered:
                extracted_val = None
                ocr_conf = region["confidence"]
                extraction_conf = 0.95
                matched_reg = region

                # 1. Check same line
                m = re.search(rules["regex"], text, re.IGNORECASE)
                if m:
                    candidate = m.group(1).strip() if m.groups() and m.group(1) else m.group(0).strip()
                    if field_name in ["MANUFACTURE_DATE", "EXPIRY_DATE", "PACK_DATE", "BEST_BEFORE"]:
                        if is_valid_date(candidate):
                            extracted_val = candidate
                    else:
                        extracted_val = candidate

                # 2. Multi-line proximity search: check up to 4 adjacent lines on same image
                if not extracted_val or len(extracted_val) < 2:
                    for offset in range(1, 5):
                        if i + offset < len(sorted_regions):
                            next_region = sorted_regions[i + offset]
                            if next_region.get("imageId") == region.get("imageId"):
                                next_text = next_region["normalizedText"]

                                if field_name in ["MANUFACTURE_DATE", "PACK_DATE"]:
                                    # Stop proximity search if next line belongs to another header (e.g. EXPIRY, BATCH, MRP)
                                    if re.search(r'(?i)\b(?:exp|eyp|expiry|use\s*before|use\s*by|best\s*before|batch|lot|mrp)\b', next_text):
                                        break
                                    m_date = re.search(r'(?i)\b(' + DATE_VAL_PATTERN + r')\b', next_text)
                                    if m_date and is_valid_date(m_date.group(1)):
                                        extracted_val = m_date.group(1).strip()
                                        ocr_conf = min(region["confidence"], next_region["confidence"])
                                        extraction_conf = 0.90
                                        matched_reg = next_region
                                        break
                                elif field_name in ["EXPIRY_DATE", "BEST_BEFORE"]:
                                    # Stop proximity search if next line belongs to another header (e.g. MFG, BATCH, MRP)
                                    if re.search(r'(?i)\b(?:mfd|mfg|pkd|manufactur(?:e|ed|ing)?|date\s*of\s*(?:mfg|mfd|pkd|manufacture)|batch|lot|mrp)\b', next_text):
                                        break
                                    m_date = re.search(r'(?i)\b(' + DATE_VAL_PATTERN + r')\b', next_text)
                                    if m_date and is_valid_date(m_date.group(1)):
                                        extracted_val = m_date.group(1).strip()
                                        ocr_conf = min(region["confidence"], next_region["confidence"])
                                        extraction_conf = 0.90
                                        matched_reg = next_region
                                        break
                                else:
                                    # Non-date fields proximity logic
                                    m_next = re.search(rules["regex"], next_text, re.IGNORECASE)
                                    if m_next:
                                        extracted_val = m_next.group(1).strip() if m_next.groups() and m_next.group(1) else m_next.group(0).strip()
                                        ocr_conf = min(region["confidence"], next_region["confidence"])
                                        extraction_conf = 0.85
                                        matched_reg = next_region
                                        break
                                    elif len(next_text.strip()) >= 2 and not any(re.search(other_kw, next_text, re.IGNORECASE) for other_field, other_rules in PATTERNS.items() for other_kw in other_rules["keywords"]):
                                        # Next line does not match any other header keyword, treat as value extension
                                        extracted_val = next_text.strip()
                                        ocr_conf = min(region["confidence"], next_region["confidence"])
                                        extraction_conf = 0.80
                                        matched_reg = next_region
                                        break

                if extracted_val and len(extracted_val) >= 1:
                    norm_res = normalize_field_value(field_name, extracted_val, text)

                    if field_name in ["MANUFACTURE_DATE", "EXPIRY_DATE", "PACK_DATE", "BEST_BEFORE"]:
                        print(f"\n====================================")
                        print(f"DATE EXTRACTION DEBUG")
                        print(f"Label: {text}")
                        print(f"Value: {norm_res['displayValue']}")
                        print(f"Field: {field_name}")
                        print(f"Image ID: {matched_reg.get('imageId', 'img-1')}")
                        print(f"Bounding Box: {matched_reg.get('bbox', {})}")
                        print(f"Confidence: {round(float(ocr_conf) * float(extraction_conf), 3)}")
                        print(f"====================================\n", flush=True)

                    raw_findings.append({
                        "field": field_name,
                        "displayValue": norm_res["displayValue"],
                        "normalizedValue": norm_res["normalizedValue"],
                        "unit": norm_res.get("unit"),
                        "currency": norm_res.get("currency"),
                        "rawOcrText": text,
                        "ocrConfidence": round(float(ocr_conf), 3),
                        "extractionConfidence": round(float(extraction_conf), 3),
                        "finalConfidence": round(float(ocr_conf) * float(extraction_conf), 3),
                        "evidenceType": norm_res.get("evidenceType", "EXPLICIT"),
                        "needsVerification": norm_res.get("flagVerify", False),
                        "evidence": {
                            "imageId": matched_reg.get("imageId", "img-1"),
                            "regionId": matched_reg.get("regionId", f"reg-{i}"),
                            "bbox": matched_reg.get("bbox", {}),
                            "ocrText": matched_reg.get("text", "")
                        }
                    })
                    matched_region_ids.add(matched_reg.get("regionId"))

    # PASS 2: Standalone Fallback Extraction across all images
    extracted_fields = set(f["field"] for f in raw_findings)

    for region in sorted_regions:
        text = region["normalizedText"]

        # Standalone Customer Care Phone check
        if "CUSTOMER_CARE_PHONE" not in extracted_fields:
            phone_m = re.search(r'\b(?:1800[\-\s]?[0-9]{3}[\-\s]?[0-9]{4}|\+?91[\-\s]?[0-9]{10})\b', text)
            if phone_m:
                val = phone_m.group(0)
                raw_findings.append({
                    "field": "CUSTOMER_CARE_PHONE",
                    "displayValue": val,
                    "normalizedValue": val,
                    "unit": None,
                    "currency": None,
                    "rawOcrText": text,
                    "ocrConfidence": round(float(region["confidence"]), 3),
                    "extractionConfidence": 0.90,
                    "finalConfidence": round(float(region["confidence"]) * 0.90, 3),
                    "evidenceType": "EXPLICIT",
                    "needsVerification": False,
                    "evidence": {
                        "imageId": region.get("imageId", "img-1"),
                        "regionId": region["regionId"],
                        "bbox": region["bbox"],
                        "ocrText": region["text"]
                    }
                })
                extracted_fields.add("CUSTOMER_CARE_PHONE")

        # Standalone Customer Care Email check
        if "CUSTOMER_CARE_EMAIL" not in extracted_fields:
            email_m = re.search(r'\b[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+\b', text)
            if email_m:
                val = email_m.group(0)
                raw_findings.append({
                    "field": "CUSTOMER_CARE_EMAIL",
                    "displayValue": val,
                    "normalizedValue": val,
                    "unit": None,
                    "currency": None,
                    "rawOcrText": text,
                    "ocrConfidence": round(float(region["confidence"]), 3),
                    "extractionConfidence": 0.92,
                    "finalConfidence": round(float(region["confidence"]) * 0.92, 3),
                    "evidenceType": "EXPLICIT",
                    "needsVerification": False,
                    "evidence": {
                        "imageId": region.get("imageId", "img-1"),
                        "regionId": region["regionId"],
                        "bbox": region["bbox"],
                        "ocrText": region["text"]
                    }
                })
                extracted_fields.add("CUSTOMER_CARE_EMAIL")

        # Standalone Manufacture / Packing Date check
        if "MANUFACTURE_DATE" not in extracted_fields:
            mfg_m = re.search(
                r'(?i)\b(?:mfd\.?|mfg\.?|pkd\.?|manufactured|packed|date\s*of\s*(?:mfg|mfd|pkd|manufacture|packing))[\s\:\.\/\-]*'
                r'(?:date|on)?[\s\:\.\/\-]*'
                r'(' + DATE_VAL_PATTERN + r')',
                text
            )
            if mfg_m and is_valid_date(mfg_m.group(1)):
                val = mfg_m.group(1).strip()
                norm_res = normalize_field_value("MANUFACTURE_DATE", val, text)
                raw_findings.append({
                    "field": "MANUFACTURE_DATE",
                    "displayValue": norm_res["displayValue"],
                    "normalizedValue": norm_res["normalizedValue"],
                    "unit": None,
                    "currency": None,
                    "rawOcrText": text,
                    "ocrConfidence": round(float(region["confidence"]), 3),
                    "extractionConfidence": 0.90,
                    "finalConfidence": round(float(region["confidence"]) * 0.90, 3),
                    "evidenceType": "EXPLICIT",
                    "needsVerification": False,
                    "evidence": {
                        "imageId": region.get("imageId", "img-1"),
                        "regionId": region["regionId"],
                        "bbox": region["bbox"],
                        "ocrText": region["text"]
                    }
                })
                extracted_fields.add("MANUFACTURE_DATE")

        # Standalone Expiry Date check
        if "EXPIRY_DATE" not in extracted_fields:
            exp_m = re.search(
                r'(?i)\b(?:exp\.?|expiry|use\s*before|use\s*by|best\s*before)[\s\:\.\/\-]*'
                r'(?:date|on)?[\s\:\.\/\-]*'
                r'(' + DATE_VAL_PATTERN + r')',
                text
            )
            if exp_m and is_valid_date(exp_m.group(1)):
                val = exp_m.group(1).strip()
                norm_res = normalize_field_value("EXPIRY_DATE", val, text)
                raw_findings.append({
                    "field": "EXPIRY_DATE",
                    "displayValue": norm_res["displayValue"],
                    "normalizedValue": norm_res["normalizedValue"],
                    "unit": None,
                    "currency": None,
                    "rawOcrText": text,
                    "ocrConfidence": round(float(region["confidence"]), 3),
                    "extractionConfidence": 0.90,
                    "finalConfidence": round(float(region["confidence"]) * 0.90, 3),
                    "evidenceType": "EXPLICIT",
                    "needsVerification": False,
                    "evidence": {
                        "imageId": region.get("imageId", "img-1"),
                        "regionId": region["regionId"],
                        "bbox": region["bbox"],
                        "ocrText": region["text"]
                    }
                })
                extracted_fields.add("EXPIRY_DATE")

        # Standalone MRP check
        if "MRP" not in extracted_fields:
            mrp_m = re.search(r'(?:₹|Rs\.?)\s*([0-9]+(?:\.[0-9]{1,2})?)', text, re.IGNORECASE)
            if mrp_m:
                val = mrp_m.group(1)
                norm_res = normalize_field_value("MRP", val, text)
                raw_findings.append({
                    "field": "MRP",
                    "displayValue": norm_res["displayValue"],
                    "normalizedValue": norm_res["normalizedValue"],
                    "unit": None,
                    "currency": "INR",
                    "rawOcrText": text,
                    "ocrConfidence": round(float(region["confidence"]), 3),
                    "extractionConfidence": 0.90,
                    "finalConfidence": round(float(region["confidence"]) * 0.90, 3),
                    "evidenceType": "EXPLICIT",
                    "needsVerification": False,
                    "evidence": {
                        "imageId": region.get("imageId", "img-1"),
                        "regionId": region["regionId"],
                        "bbox": region["bbox"],
                        "ocrText": region["text"]
                    }
                })
                extracted_fields.add("MRP")

        # Standalone Net Quantity check
        if "NET_QUANTITY" not in extracted_fields:
            qty_m = re.search(r'\b([0-9]+(?:\.[0-9]+)?\s*(?:kg|g|gm|gms|grams?|ml|l|ltr|litres?|pcs|units?|n))\b', text, re.IGNORECASE)
            if qty_m:
                val = qty_m.group(1)
                norm_res = normalize_field_value("NET_QUANTITY", val, text)
                raw_findings.append({
                    "field": "NET_QUANTITY",
                    "displayValue": norm_res["displayValue"],
                    "normalizedValue": norm_res["normalizedValue"],
                    "unit": norm_res.get("unit"),
                    "currency": None,
                    "rawOcrText": text,
                    "ocrConfidence": round(float(region["confidence"]), 3),
                    "extractionConfidence": 0.88,
                    "finalConfidence": round(float(region["confidence"]) * 0.88, 3),
                    "evidenceType": "EXPLICIT",
                    "needsVerification": False,
                    "evidence": {
                        "imageId": region.get("imageId", "img-1"),
                        "regionId": region["regionId"],
                        "bbox": region["bbox"],
                        "ocrText": region["text"]
                    }
                })
                extracted_fields.add("NET_QUANTITY")

    # Multi-line MANUFACTURER_ADDRESS synthesis if manufacturer was extracted but address line wasn't captured separately
    mfg_findings = [f for f in raw_findings if f["field"] == "MANUFACTURER"]
    if mfg_findings and not any(f["field"] == "MANUFACTURER_ADDRESS" for f in raw_findings):
        primary_mfg = mfg_findings[0]
        mfg_reg_id = primary_mfg["evidence"]["regionId"]
        for idx, r in enumerate(sorted_regions):
            if r["regionId"] == mfg_reg_id and idx + 1 < len(sorted_regions):
                next_r = sorted_regions[idx + 1]
                if next_r.get("imageId") == r.get("imageId"):
                    addr_candidate = next_r["normalizedText"].strip()
                    if len(addr_candidate) >= 3 and not any(re.search(other_kw, addr_candidate, re.IGNORECASE) for other_f, other_rules in PATTERNS.items() for other_kw in other_rules["keywords"]):
                        raw_findings.append({
                            "field": "MANUFACTURER_ADDRESS",
                            "displayValue": addr_candidate,
                            "normalizedValue": addr_candidate,
                            "unit": None,
                            "currency": None,
                            "rawOcrText": addr_candidate,
                            "ocrConfidence": next_r["confidence"],
                            "extractionConfidence": 0.85,
                            "finalConfidence": round(next_r["confidence"] * 0.85, 3),
                            "evidenceType": "EXPLICIT",
                            "needsVerification": False,
                            "evidence": {
                                "imageId": next_r.get("imageId", "img-1"),
                                "regionId": next_r["regionId"],
                                "bbox": next_r["bbox"],
                                "ocrText": next_r["text"]
                            }
                        })
                        break

    # Synthesize COUNTRY_OF_ORIGIN from address if explicit country declaration was not found
    explicit_coo = any(f["field"] == "COUNTRY_OF_ORIGIN" and f.get("evidenceType") == "EXPLICIT" for f in raw_findings)
    if not explicit_coo:
        country_regex = r'\b(India|Bharat|China|USA|United States|UK|United Kingdom|Germany|Japan|Vietnam|Thailand|Taiwan|Malaysia|Indonesia|Korea|Italy|France|Spain|Australia|Canada|Mexico|Brazil|Sri Lanka|Bangladesh|Nepal)\b'
        for region in sorted_regions:
            text = region["normalizedText"]
            country_m = re.search(country_regex, text, re.IGNORECASE)
            if country_m:
                country_candidate = country_m.group(1).title()
                raw_findings.append({
                    "field": "COUNTRY_OF_ORIGIN",
                    "displayValue": country_candidate,
                    "normalizedValue": country_candidate,
                    "unit": None,
                    "currency": None,
                    "rawOcrText": text,
                    "ocrConfidence": round(float(region["confidence"]), 3),
                    "extractionConfidence": 0.80,
                    "finalConfidence": round(float(region["confidence"]) * 0.80, 3),
                    "evidenceType": "INFERRED_FROM_MANUFACTURER_ADDRESS",
                    "needsVerification": False,
                    "evidence": {
                        "imageId": region.get("imageId", "img-1"),
                        "regionId": region["regionId"],
                        "bbox": region["bbox"],
                        "ocrText": region["text"]
                    }
                })
                break

    # Synthesize CUSTOMER_CARE_CONTACT if any customer care contact (phone, email, website) exists
    cc_findings = [f for f in raw_findings if f["field"] in ["CUSTOMER_CARE_EMAIL", "CUSTOMER_CARE_PHONE", "WEBSITE"]]
    if cc_findings and not any(f["field"] == "CUSTOMER_CARE_CONTACT" for f in raw_findings):
        best_cc = max(cc_findings, key=lambda x: x["finalConfidence"])
        raw_findings.append({
            "field": "CUSTOMER_CARE_CONTACT",
            "displayValue": "PRESENT",
            "normalizedValue": "PRESENT",
            "unit": None,
            "currency": None,
            "rawOcrText": best_cc["rawOcrText"],
            "ocrConfidence": best_cc["ocrConfidence"],
            "extractionConfidence": best_cc["extractionConfidence"],
            "finalConfidence": best_cc["finalConfidence"],
            "evidenceType": "EXPLICIT",
            "needsVerification": False,
            "evidence": best_cc["evidence"]
        })

    # Add Barcode declarations across images
    if barcodes:
        for bc in barcodes:
            raw_findings.append({
                "field": "BARCODE",
                "displayValue": bc["barcodeValue"],
                "normalizedValue": bc["barcodeValue"],
                "unit": bc["barcodeType"],
                "currency": None,
                "rawOcrText": bc["barcodeValue"],
                "ocrConfidence": 0.99,
                "extractionConfidence": 1.0,
                "finalConfidence": 0.99,
                "evidenceType": "EXPLICIT",
                "needsVerification": False,
                "evidence": {
                    "imageId": bc["imageId"],
                    "regionId": f"{bc['imageId']}-barcode-1",
                    "bbox": bc["bbox"],
                    "ocrText": bc["barcodeValue"]
                }
            })

    # Infer Brand / Product Name from prominent upper text regions
    top_candidates = [
        r for r in sorted_regions
        if r["regionId"] not in matched_region_ids
        and r["bbox"]["yPct"] < 35
        and len(r["text"].split()) <= 6
        and len(r["text"]) >= 3
    ]
    if top_candidates:
        brand_candidate = top_candidates[0]
        raw_findings.append({
            "field": "BRAND",
            "displayValue": brand_candidate["text"].title(),
            "normalizedValue": brand_candidate["text"].upper(),
            "unit": None,
            "currency": None,
            "rawOcrText": brand_candidate["text"],
            "ocrConfidence": brand_candidate["confidence"],
            "extractionConfidence": 0.75,
            "finalConfidence": round(brand_candidate["confidence"] * 0.75, 3),
            "evidenceType": "EXPLICIT",
            "needsVerification": False,
            "evidence": {
                "imageId": brand_candidate.get("imageId", "img-1"),
                "regionId": brand_candidate["regionId"],
                "bbox": brand_candidate["bbox"],
                "ocrText": brand_candidate["text"]
            }
        })
        if len(top_candidates) > 1:
            prod_candidate = top_candidates[1]
            raw_findings.append({
                "field": "PRODUCT_NAME",
                "displayValue": prod_candidate["text"].title(),
                "normalizedValue": prod_candidate["text"].upper(),
                "unit": None,
                "currency": None,
                "rawOcrText": prod_candidate["text"],
                "ocrConfidence": prod_candidate["confidence"],
                "extractionConfidence": 0.70,
                "finalConfidence": round(prod_candidate["confidence"] * 0.70, 3),
                "evidenceType": "EXPLICIT",
                "needsVerification": False,
                "evidence": {
                    "imageId": prod_candidate.get("imageId", "img-1"),
                    "regionId": prod_candidate["regionId"],
                    "bbox": prod_candidate["bbox"],
                    "ocrText": prod_candidate["text"]
                }
            })

    # -------------------------------------------------------------
    # MULTI-IMAGE FUSION & CONFLICT RESOLUTION
    # -------------------------------------------------------------
    grouped = {}
    for finding in raw_findings:
        f_name = finding["field"]
        if f_name not in grouped:
            grouped[f_name] = []
        grouped[f_name].append(finding)

    consolidated_declarations = []

    for field_name, items in grouped.items():
        if len(items) == 1:
            item = items[0]
            item["detectedValue"] = item["displayValue"]
            item["evidences"] = [item["evidence"]]
            item["evidenceType"] = item.get("evidenceType", "EXPLICIT")
            item["conflictDetected"] = False
            consolidated_declarations.append(item)
        else:
            norm_values = set(it["normalizedValue"] for it in items)
            items_sorted = sorted(items, key=lambda x: x["finalConfidence"], reverse=True)
            primary = items_sorted[0]

            evidences = [it["evidence"] for it in items]

            if len(norm_values) == 1:
                # Agreement across images
                primary["detectedValue"] = primary["displayValue"]
                primary["evidences"] = evidences
                primary["evidenceType"] = primary.get("evidenceType", "EXPLICIT")
                primary["conflictDetected"] = False
                primary["finalConfidence"] = min(0.99, primary["finalConfidence"] + 0.05)
                consolidated_declarations.append(primary)
            else:
                # Conflict detected across images
                primary["detectedValue"] = primary["displayValue"]
                primary["evidences"] = evidences
                primary["evidenceType"] = primary.get("evidenceType", "EXPLICIT")
                primary["conflictDetected"] = True
                primary["conflictDetails"] = f"Conflicting values detected across images: {', '.join(norm_values)}"
                primary["needsVerification"] = True
                consolidated_declarations.append(primary)

    # -------------------------------------------------------------
    # TEMPORARY LOGGING FOR TARGET FIELDS (REQUIREMENT 20)
    # -------------------------------------------------------------
    print(f"\n====================================")
    print(f"FIELD EXTRACTION DEBUG")
    print(f"====================================")
    mfg_item = next((d for d in consolidated_declarations if d["field"] == "MANUFACTURER"), None)
    if mfg_item:
        print(f"MANUFACTURER\n  label = \"Manufactured by\"\n  value = \"{mfg_item['displayValue']}\"")
    else:
        print(f"MANUFACTURER\n  status = NOT_DETECTED")

    mfg_addr_item = next((d for d in consolidated_declarations if d["field"] == "MANUFACTURER_ADDRESS"), None)
    if mfg_addr_item:
        print(f"MANUFACTURER_ADDRESS\n  value = \"{mfg_addr_item['displayValue']}\"")
    else:
        print(f"MANUFACTURER_ADDRESS\n  status = NOT_DETECTED")

    mfg_date_item = next((d for d in consolidated_declarations if d["field"] == "MANUFACTURE_DATE"), None)
    if mfg_date_item:
        print(f"MANUFACTURE_DATE\n  label = \"Mfg. Date\"\n  value = \"{mfg_date_item['displayValue']}\"")
    else:
        print(f"MANUFACTURE_DATE\n  status = NOT_DETECTED")

    exp_date_item = next((d for d in consolidated_declarations if d["field"] == "EXPIRY_DATE"), None)
    if exp_date_item:
        print(f"EXPIRY_DATE\n  label = \"Expiry Date\"\n  value = \"{exp_date_item['displayValue']}\"")
    else:
        print(f"EXPIRY_DATE\n  status = NOT_DETECTED")

    cc_email_item = next((d for d in consolidated_declarations if d["field"] == "CUSTOMER_CARE_EMAIL"), None)
    if cc_email_item:
        print(f"CUSTOMER_CARE_EMAIL\n  context = \"Customer Care\"\n  value = \"{cc_email_item['displayValue']}\"")
    else:
        print(f"CUSTOMER_CARE_EMAIL\n  status = NOT_DETECTED")

    coo_item = next((d for d in consolidated_declarations if d["field"] == "COUNTRY_OF_ORIGIN"), None)
    if coo_item:
        print(f"COUNTRY_OF_ORIGIN\n  label = \"Made in / Origin\"\n  value = \"{coo_item['displayValue']}\" (evidenceType: {coo_item.get('evidenceType', 'EXPLICIT')})")
    else:
        print(f"COUNTRY_OF_ORIGIN\n  status = NOT_DETECTED")
    print(f"====================================\n", flush=True)

    return consolidated_declarations

def normalize_field_value(field: str, val: str, raw_text: str) -> dict:
    """
    Standardizes field value into display format and pure normalized representation.
    """
    v = val.strip().strip(",.-:")

    if field == "MRP":
        nums = re.findall(r'\d+(?:\.\d+)?', v)
        num_val = nums[0] if nums else "0.00"
        try:
            float_val = float(num_val)
            return {
                "displayValue": f"Rs. {float_val:.2f}",
                "normalizedValue": f"{float_val:.2f}",
                "currency": "INR",
                "flagVerify": float_val <= 0 or float_val > 100000
            }
        except Exception:
            return {"displayValue": v.replace("₹", "Rs. "), "normalizedValue": v.replace("₹", "Rs. "), "currency": "INR", "flagVerify": True}

    elif field == "NET_QUANTITY":
        m = re.search(r'([0-9]+(?:\.[0-9]+)?)\s*([a-zA-Z]+)', v)
        if m:
            qty_num, qty_unit = m.group(1), m.group(2).lower()
            if qty_unit in ["gm", "gms", "grams", "gram"]:
                qty_unit = "g"
            elif qty_unit in ["ltr", "litres", "litre"]:
                qty_unit = "l"
            return {
                "displayValue": f"{qty_num} {qty_unit}",
                "normalizedValue": qty_num,
                "unit": qty_unit,
                "flagVerify": False
            }
        return {"displayValue": v, "normalizedValue": v, "unit": "unit", "flagVerify": True}

    elif field in ["MANUFACTURER", "PACKER", "IMPORTER"]:
        clean_v = re.sub(r'(?i)^(?:mfd\.?|mfg\.?|manufactured|packed|imported|marketed)\s*(?:&|and)?\s*(?:marketed|packed|for)?\s*by[\s\:\-]*', '', v).strip()
        return {
            "displayValue": clean_v.title(),
            "normalizedValue": clean_v,
            "flagVerify": len(clean_v) < 3
        }

    elif field in ["CUSTOMER_CARE_PHONE", "CUSTOMER_CARE_EMAIL"]:
        phone_match = re.search(r'(?:1800[\-\s]?[0-9]{3}[\-\s]?[0-9]{4}|\+?91[\-\s]?[0-9]{10}|[0-9]{10})', v)
        email_match = re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', v)
        display = phone_match.group(0) if phone_match else (email_match.group(0) if email_match else v)
        return {
            "displayValue": display,
            "normalizedValue": display,
            "flagVerify": False
        }

    elif field in ["MANUFACTURE_DATE", "PACK_DATE", "EXPIRY_DATE", "BEST_BEFORE"]:
        clean_d = re.sub(r'(?i)^(?:mfd\.?|mfg\.?|pkd\.?|exp\.?|expiry|use\s*before|use\s*by|best\s*before|date\s*of\s*(?:mfg|mfd|pkd|manufacture|packing))[\s\:\.\/]*(?:date|on)?[\s\:\.\/]*', '', v).strip()
        iso_val = normalize_date_to_iso(clean_d)
        return {
            "displayValue": clean_d.upper(),
            "normalizedValue": iso_val,
            "evidenceType": "EXPLICIT",
            "flagVerify": len(clean_d) < 2
        }

    elif field == "COUNTRY_OF_ORIGIN":
        clean_country = re.sub(r'(?i)^(?:country\s*(?:of|0f)?\s*(?:origin|0rigin|orlgin)|countryoforigin|made\s*(?:in|ln)|product\s*of|manufactured\s*(?:in|ln)|produced\s*(?:in|ln)|country\s*of\s*manufacture|origin)[\s\:\.\-]*', '', v).strip().title()
        return {
            "displayValue": clean_country,
            "normalizedValue": clean_country,
            "evidenceType": "EXPLICIT",
            "flagVerify": len(clean_country) < 2
        }

    return {"displayValue": v, "normalizedValue": v, "flagVerify": False}
