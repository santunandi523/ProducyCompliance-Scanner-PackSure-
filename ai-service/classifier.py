import re

CATEGORIES = [
    "FOOD",
    "ELECTRONICS",
    "COSMETICS",
    "PERSONAL_CARE",
    "HOUSEHOLD",
    "TEXTILES",
    "MEDICINES_HEALTHCARE",
    "OTHER"
]

CATEGORY_SIGNALS = {
    "MEDICINES_HEALTHCARE": [
        (r'\b(?:oxymetazoline|paracetamol|ibuprofen|aspirin|hydrochloride|nasal\s*spray|tablet|capsule|syrup|ointment|antiseptic|pharmaceutical|dosage|rx|schedule\s*h|schedule\s*g|medical\s*device|pharmacopoeia|ip|bp|usp)\b', 3.0, "Active pharmaceutical ingredient or dosage statement detected"),
        (r'\b(?:nasal\s*spray|fast\s*relief|decongestant|drops|injection|inhaler|physician|doctor|pharmacist)\b', 2.0, "Healthcare / therapeutic product description detected"),
    ],
    "FOOD": [
        (r'\b(?:fssai|lic\.?\s*no\.?|nutritional\s*information|energy|kcal|protein|carbohydrate|added\s*sugar|fat|trans\s*fat|veg|non-veg|ingredients?|edible\s*oil|flour|biscuit|snack|spices|masala|beverage|juice|tea|coffee|milk)\b', 3.0, "Food nutrition panel / FSSAI license / food ingredients detected"),
        (r'\b(?:per\s*100g|per\s*100ml|serving\s*size|best\s*before|expiry)\b', 1.5, "Packaged food serving & expiry declaration detected"),
    ],
    "COSMETICS": [
        (r'\b(?:sunscreen|spf\s*\d+|lotion|face\s*cream|serum|foundation|lipstick|mascara|eyeliner|nail\s*polish|face\s*wash|skincare|moisturizer|dermatologically\s*tested|anti-aging)\b', 3.0, "Cosmetic formulation / skincare claims detected"),
        (r'\b(?:aqua|glycerin|fragrance|parfum|tocopherol|niacinamide|stearic\s*acid)\b', 2.0, "Cosmetic ingredient list detected"),
    ],
    "PERSONAL_CARE": [
        (r'\b(?:soap|body\s*wash|toothpaste|tooth\s*paste|toothbrush|fluoride|sonicare|deodorant|antiperspirant|shaving\s*cream|razor|hand\s*sanitizer|hair\s*oil|oral\s*care)\b', 3.0, "Personal hygiene / grooming product details detected"),
    ],
    "HOUSEHOLD": [
        (r'\b(?:detergent|laundry|fabric\s*conditioner|dishwash|surface\s*cleaner|disinfectant|floor\s*cleaner|mosquito\s*repellent|toilet\s*cleaner|bleach)\b', 3.0, "Household cleaning / chemical agent details detected"),
    ],
    "ELECTRONICS": [
        (r'\b(?:battery|voltage|volts|v|watts|w|hz|ampere|mah|input|output|dc|ac|bis\s*reg|is\s*\d+|bureau\s*of\s*indian\s*standards|charger|cable|usb|bluetooth|model\s*no|serial\s*no)\b', 3.0, "Electronic specifications / BIS certification mark detected"),
    ],
    "TEXTILES": [
        (r'\b(?:cotton|polyester|fabric|silk|wool|denim|nylon|apparel|garment|chest|waist|size\s*[:\s]*[s|m|l|xl|xxl]|\d+\s*cm|wash\s*care|dry\s*clean)\b', 3.0, "Textile composition / garment wash care label detected"),
    ]
}

def classify_category(full_text, declarations: list = None, barcodes: list = None) -> dict:
    """
    Classifies product into standard Legal Metrology category based on CONSOLIDATED multi-image evidence.
    Returns category, confidence, source, reasons list, decisionState, and optional productType.
    """
    if isinstance(full_text, list):
        text_items = []
        for item in full_text:
            if isinstance(item, dict):
                text_items.append(item.get("text") or item.get("normalizedText") or "")
            elif isinstance(item, str):
                text_items.append(item)
        full_text_str = " ".join(text_items)
    else:
        full_text_str = str(full_text or "")

    all_text = full_text_str.lower()
    if declarations:
        for d in declarations:
            val = str(d.get("displayValue") or d.get("detectedValue") or "").lower()
            all_text += f" {val}"

    scores = {cat: 0.0 for cat in CATEGORIES}
    reasons_map = {cat: [] for cat in CATEGORIES}

    for cat, signals in CATEGORY_SIGNALS.items():
        for pattern, weight, reason_desc in signals:
            matches = re.findall(pattern, all_text)
            if matches:
                scores[cat] += weight * len(matches)
                matched_sample = matches[0] if isinstance(matches[0], str) else matches[0][0]
                reason_str = f"{reason_desc} ('{matched_sample}')"
                if reason_str not in reasons_map[cat]:
                    reasons_map[cat].append(reason_str)

    sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    top_cat, top_score = sorted_scores[0]
    second_cat, second_score = sorted_scores[1]

    # Product Type Extraction (Room for 2nd level classification)
    product_type = None
    if top_cat == "MEDICINES_HEALTHCARE":
        if "nasal spray" in all_text or "spray" in all_text:
            product_type = "NASAL_SPRAY"
        elif "tablet" in all_text or "capsule" in all_text:
            product_type = "TABLET_CAPSULE"
        else:
            product_type = "HEALTHCARE_PRODUCT"
    elif top_cat == "FOOD":
        if "biscuit" in all_text or "cookie" in all_text:
            product_type = "PACKAGED_BISCUITS"
        elif "juice" in all_text or "drink" in all_text:
            product_type = "BEVERAGE"
        else:
            product_type = "PACKAGED_FOOD"
    elif top_cat == "COSMETICS":
        if "sunscreen" in all_text or "spf" in all_text:
            product_type = "SUNSCREEN"
        elif "cream" in all_text or "lotion" in all_text:
            product_type = "SKIN_CARE"
        else:
            product_type = "COSMETIC_PRODUCT"
    elif top_cat == "ELECTRONICS":
        if "charger" in all_text or "cable" in all_text:
            product_type = "MOBILE_ACCESSORY"
        else:
            product_type = "ELECTRONIC_DEVICE"

    if top_score >= 4.0:
        conf = 0.94
    elif top_score >= 2.5:
        conf = 0.85
    elif top_score >= 1.5:
        conf = 0.70
    elif top_score > 0:
        conf = 0.58
    else:
        top_cat = "OTHER"
        conf = 0.50

    # Decision State calculation
    decision_state = "AUTO_DETECTED"
    if conf < 0.80:
        decision_state = "REVIEW_REQUIRED"
    elif second_score > 0 and (top_score - second_score) <= 1.0:
        decision_state = "CATEGORY_CONFLICT"
        reasons_map[top_cat].append(f"Competing category signals detected between {top_cat} and {second_cat}. Officer review required.")

    reasons = reasons_map[top_cat]
    if not reasons:
        reasons = ["General packaged commodity text detected (no specific category keywords matched)."]

    return {
        "category": top_cat,
        "confidence": conf,
        "source": "AI",
        "decisionState": decision_state,
        "reasons": reasons,
        "productType": product_type
    }
