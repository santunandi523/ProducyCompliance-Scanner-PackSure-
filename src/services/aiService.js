// Mock AI service — replace with real FastAPI/OCR calls later.

const STAGES = [
  { key: "preprocess", label: "Image preprocessing", note: "Denoise, deskew, contrast normalization" },
  { key: "ocr", label: "OCR extraction", note: "PaddleOCR / Tesseract text detection" },
  { key: "declaration", label: "Declaration detection", note: "Mandatory field identification" },
  { key: "rules", label: "Rule matching", note: "Rule engine (versioned)" },
  { key: "analysis", label: "Compliance analysis", note: "AI-assisted screening completed" },
];

export const analysisStages = STAGES;

export const runMockAnalysis = ({ product, images = [] }, onStage) => {
  return new Promise((resolve) => {
    let i = 0;
    const tick = () => {
      if (i < STAGES.length) {
        onStage?.(STAGES[i], i);
        i += 1;
        setTimeout(tick, 650);
      } else {
        setTimeout(() => resolve(buildResult(product, images)), 300);
      }
    };
    tick();
  });
};

const buildResult = (product, images) => {
  const isNonCompliant = product?.latestStatus === "POTENTIAL NON-COMPLIANCE";
  const isReview = product?.latestStatus === "NEEDS FURTHER REVIEW";

  const declarations = [
    {
      field: "manufacturer",
      label: "Manufacturer / Packer",
      value: product?.manufacturer || "ABC Foods Pvt. Ltd.",
      confidence: 0.96,
      status: "PASS",
      ruleCode: "PC-R-001",
      evidence: { image: 0, region: { x: 12, y: 55, w: 40, h: 8 } },
    },
    {
      field: "net_quantity",
      label: "Net Quantity",
      value: product?.netQuantity || "500 g",
      confidence: 0.94,
      status: "PASS",
      ruleCode: "PC-R-002",
      evidence: { image: 0, region: { x: 12, y: 67, w: 32, h: 6 } },
    },
    {
      field: "mrp",
      label: "Maximum Retail Price",
      value: isNonCompliant ? "" : product?.mrp || "₹85.00",
      confidence: isNonCompliant ? 0.38 : 0.91,
      status: isNonCompliant ? "REVIEW" : "PASS",
      ruleCode: "PC-R-003",
      evidence: { image: 0, region: { x: 60, y: 62, w: 25, h: 20 } },
    },
    {
      field: "date_info",
      label: "Date of Manufacture",
      value: isReview ? "MFD: 06/26 (partial)" : "MFD: 06/2026",
      confidence: isReview ? 0.61 : 0.89,
      status: isReview ? "REVIEW" : "PASS",
      ruleCode: "PC-R-004",
      evidence: { image: 0, region: { x: 12, y: 78, w: 35, h: 5 } },
    },
    {
      field: "consumer_care",
      label: "Consumer Care Details",
      value: isNonCompliant ? "" : product?.consumerCare || "1800-123-4567",
      confidence: isNonCompliant ? 0.42 : 0.86,
      status: isNonCompliant ? "REVIEW" : "PASS",
      ruleCode: "PC-R-005",
      evidence: { image: 0, region: { x: 12, y: 86, w: 45, h: 5 } },
    },
    {
      field: "country_of_origin",
      label: "Country of Origin",
      value: product?.countryOfOrigin || "India",
      confidence: 0.97,
      status: "PASS",
      ruleCode: "PC-R-006",
      evidence: { image: 0, region: { x: 60, y: 15, w: 25, h: 6 } },
    },
  ];

  const violations = declarations
    .filter((d) => d.status !== "PASS")
    .map((d) => ({
      id: `V-${d.field.toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`,
      ruleCode: d.ruleCode,
      field: d.field,
      title: `${d.label} requires verification`,
      severity: d.field === "mrp" ? "HIGH" : "MEDIUM",
      status: "NEEDS_REVIEW",
      confidence: d.confidence,
      reason:
        d.confidence < 0.5
          ? "Required declaration could not be reliably extracted from the uploaded images."
          : "OCR confidence is below the threshold — manual verification recommended.",
    }));

  const passCount = declarations.filter((d) => d.status === "PASS").length;
  const screeningScore = Math.round((passCount / declarations.length) * 100);

  let overallStatus = "COMPLIANT";
  if (violations.some((v) => v.severity === "HIGH")) overallStatus = "POTENTIAL NON-COMPLIANCE";
  else if (violations.length > 0) overallStatus = "NEEDS FURTHER REVIEW";

  return {
    demo: true,
    generatedAt: new Date().toISOString(),
    product,
    imagesCount: images.length,
    declarations,
    violations,
    screeningScore,
    overallStatus,
  };
};