import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(__file__))

from classifier import classify_category

def test_food_classification():
    ocr_regions = [
        {"imageId": "img-1", "text": "Amul Pure Butter Delicious & Fresh 500g"},
        {"imageId": "img-2", "text": "Ingredients: Milk Fat, Salt, Moisture max 16%. Nutritional Info per 100g: Energy 720 kcal"},
        {"imageId": "img-3", "text": "Best Before 6 months from packaging. FSSAI Lic No. 10012021000001"}
    ]
    declarations = [
        {"field": "PRODUCT_NAME", "detectedValue": "Pure Butter"},
        {"field": "BRAND", "detectedValue": "Amul"},
        {"field": "NET_QUANTITY", "detectedValue": "500", "unit": "g"}
    ]
    res = classify_category(ocr_regions, declarations)
    assert res["category"] == "FOOD", f"Expected FOOD, got {res['category']}"
    assert res["confidence"] >= 0.80, f"Expected confidence >= 0.80, got {res['confidence']}"
    assert res["decisionState"] == "AUTO_DETECTED", f"Expected AUTO_DETECTED, got {res['decisionState']}"
    assert len(res["reasons"]) > 0, "Reasons list should not be empty"
    print("[PASS] TEST 1: Food Classification Passed")

def test_electronics_classification():
    ocr_regions = [
        {"imageId": "img-1", "text": "Anker PowerPort Wireless Charger 20W Fast Charging Pad"},
        {"imageId": "img-2", "text": "Input 100-240V ~ 50/60Hz Output 5V 3A Wireless Output 15W Max Voltage"},
        {"imageId": "img-3", "text": "Made in Vietnam. BIS Registration R-41001234. USB Type-C Cable included"}
    ]
    declarations = [
        {"field": "PRODUCT_NAME", "detectedValue": "Wireless Charger Pad"},
        {"field": "BRAND", "detectedValue": "Anker"}
    ]
    res = classify_category(ocr_regions, declarations)
    assert res["category"] == "ELECTRONICS", f"Expected ELECTRONICS, got {res['category']}"
    assert res["confidence"] >= 0.80, f"Expected confidence >= 0.80, got {res['confidence']}"
    assert res["decisionState"] == "AUTO_DETECTED", f"Expected AUTO_DETECTED, got {res['decisionState']}"
    print("[PASS] TEST 2: Electronics Classification Passed")

def test_cosmetics_classification():
    ocr_regions = [
        {"imageId": "img-1", "text": "L'Oreal Paris Revitalift Skin Care Moisture Cream SPF 30"},
        {"imageId": "img-2", "text": "Apply smoothly over face and neck every morning. Anti-wrinkle hyaluronic acid complex."},
        {"imageId": "img-3", "text": "For external cosmetic use only. Avoid contact with eyes."}
    ]
    declarations = [
        {"field": "PRODUCT_NAME", "detectedValue": "Revitalift Skin Care Cream"},
        {"field": "BRAND", "detectedValue": "L'Oreal Paris"}
    ]
    res = classify_category(ocr_regions, declarations)
    assert res["category"] == "COSMETICS", f"Expected COSMETICS, got {res['category']}"
    assert res["confidence"] >= 0.80, f"Expected confidence >= 0.80, got {res['confidence']}"
    print("[PASS] TEST 3: Cosmetics Classification Passed")

def test_medicines_nasal_spray_classification():
    ocr_regions = [
        {"imageId": "img-1", "text": "Otrivin Oxy Fast Relief Adult Nasal Spray 10ml"},
        {"imageId": "img-2", "text": "Contains Oxymetazoline Hydrochloride 0.05% w/v active pharmaceutical ingredient"},
        {"imageId": "img-3", "text": "Dosage instructions: 1-2 sprays into each nostril every 8-10 hours. Mfg by Vivimed Labs"}
    ]
    declarations = [
        {"field": "PRODUCT_NAME", "detectedValue": "Adult Nasal Spray"},
        {"field": "BRAND", "detectedValue": "Otrivin"}
    ]
    res = classify_category(ocr_regions, declarations)
    assert res["category"] == "MEDICINES_HEALTHCARE", f"Expected MEDICINES_HEALTHCARE, got {res['category']}"
    assert res["productType"] == "NASAL_SPRAY", f"Expected NASAL_SPRAY productType, got {res['productType']}"
    assert res["confidence"] >= 0.80, f"Expected confidence >= 0.80, got {res['confidence']}"
    print("[PASS] TEST 4: Medicines & Nasal Spray Classification Passed")

def test_multi_image_consolidation():
    # Category signals split across different image cards (not all on image 0)
    ocr_regions = [
        {"imageId": "img-1", "text": "Generic Brand Item"},
        {"imageId": "img-2", "text": "Manufacturer: Vivimed Labs, Uttarakhand"},
        {"imageId": "img-3", "text": "Contains Oxymetazoline Hydrochloride active pharmaceutical ingredient"},
        {"imageId": "img-4", "text": "Dosage instructions: 2 drops daily"}
    ]
    res = classify_category(ocr_regions, [])
    assert res["category"] == "MEDICINES_HEALTHCARE", "Multi-image consolidation failed to identify medicine keywords from image 3 & 4"
    print("[PASS] TEST 8: Multi-image OCR consolidation category test passed")

def test_brand_alone_not_determining_category():
    # Brand is "Philips" (famous for electronics), but product is "Philips Healthcare Oral Rinse / Toothpaste"
    ocr_regions = [
        {"imageId": "img-1", "text": "Philips Sonicare Anti-Cavity Toothpaste 100g Fluoride"},
        {"imageId": "img-2", "text": "Brush teeth thoroughly after meals. Ingredients: Sodium Fluoride, Sorbitol"}
    ]
    res = classify_category(ocr_regions, [{"field": "BRAND", "detectedValue": "Philips"}])
    assert res["category"] in ["PERSONAL_CARE", "MEDICINES_HEALTHCARE"], f"Expected PERSONAL_CARE or MEDICINES_HEALTHCARE, got {res['category']}"
    print("[PASS] TEST 9: Brand alone does not override product content passed")

def test_explainable_reasons():
    ocr_regions = [
        {"imageId": "img-1", "text": "Dettol Antiseptic Liquid Disinfectant Household Cleaner 500ml"}
    ]
    res = classify_category(ocr_regions, [])
    assert len(res["reasons"]) >= 1, "Expected explainable reasons list"
    print("[PASS] TEST 10: Explainable reasons present passed")

if __name__ == "__main__":
    test_food_classification()
    test_electronics_classification()
    test_cosmetics_classification()
    test_medicines_nasal_spray_classification()
    test_multi_image_consolidation()
    test_brand_alone_not_determining_category()
    test_explainable_reasons()
    print("\nALL AI CATEGORY CLASSIFIER TESTS PASSED SUCCESSFULLY!")
