package com.packsure.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.packsure.model.*;
import com.packsure.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class InspectionService {

    @Autowired
    private InspectionRepository inspectionRepository;

    @Autowired
    private InspectionImageRepository inspectionImageRepository;

    @Autowired
    private DeclarationRepository declarationRepository;

    @Autowired
    private EvidenceRepository evidenceRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private RuleEngineService ruleEngineService;

    @Autowired
    private AiClientService aiClientService;

    @Autowired
    private StorageService storageService;

    @Autowired
    private AuditService auditService;

    public Inspection createInspection(User user, String location) {
        long count = inspectionRepository.count();
        String insNum = String.format("INS-2026-%06d", count + 1);
        Inspection inspection = new Inspection(insNum, user, location != null ? location : "Retail Inspection");
        inspection = inspectionRepository.save(inspection);

        auditService.log(user != null ? user.getId() : null, user != null ? user.getUsername() : "officer", "CREATE_INSPECTION", "Inspection", inspection.getId(), "Inspection initialized " + insNum, null);
        return inspection;
    }

    public InspectionImage addImage(Long inspectionId, MultipartFile file, String imageType, User user) {
        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new RuntimeException("Inspection not found with id: " + inspectionId));

        if ("FINALIZED".equals(inspection.getStatus())) {
            throw new RuntimeException("Cannot add images to a finalized inspection.");
        }

        // Store original image
        String origPath = storageService.storeInspectionImage(inspection.getInspectionNumber(), file, "original");
        String hash = storageService.computeFileHash(origPath);

        // Check for duplicate upload
        List<InspectionImage> existing = inspectionImageRepository.findByInspectionIdOrderByCreatedAtAsc(inspectionId);
        for (InspectionImage img : existing) {
            if (hash.equals(img.getImageHash())) {
                throw new RuntimeException("Duplicate image detected. This photo has already been uploaded for this inspection.");
            }
        }

        InspectionImage inspImage = new InspectionImage(inspection, imageType != null ? imageType : "PRIMARY", origPath);
        inspImage.setImageHash(hash);
        inspImage = inspectionImageRepository.save(inspImage);

        auditService.log(user != null ? user.getId() : null, user != null ? user.getUsername() : "system",
                "UPLOAD_IMAGE", "InspectionImage", inspImage.getId(), "Uploaded " + file.getOriginalFilename(), null);

        return inspImage;
    }

    public List<InspectionImage> addImagesBatch(Long inspectionId, List<MultipartFile> files, User user) {
        List<InspectionImage> result = new ArrayList<>();
        if (files == null || files.isEmpty()) return result;

        for (int i = 0; i < files.size(); i++) {
            MultipartFile file = files.get(i);
            try {
                String sideTag = (i == 0) ? "FRONT" : (i == 1 ? "BACK" : "SIDE_" + (i + 1));
                InspectionImage img = addImage(inspectionId, file, sideTag, user);
                result.add(img);
            } catch (Exception e) {
                // Skip duplicates in batch upload gracefully
            }
        }
        if (result.isEmpty()) {
            return inspectionImageRepository.findByInspectionIdOrderByCreatedAtAsc(inspectionId);
        }
        return result;
    }

    @Transactional
    public Map<String, Object> analyzeInspection(Long inspectionId, User user) {
        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new RuntimeException("Inspection not found with id: " + inspectionId));

        List<InspectionImage> images = inspectionImageRepository.findByInspectionIdOrderByCreatedAtAsc(inspectionId);
        if (images.isEmpty()) {
            throw new RuntimeException("Cannot analyze inspection without images.");
        }

        inspection.setStatus("PROCESSING");
        inspectionRepository.save(inspection);

        List<String> imagePaths = new ArrayList<>();
        for (InspectionImage img : images) {
            imagePaths.add(img.getOriginalPath());
        }

        // Call real Python FastAPI AI microservice
        JsonNode aiResult = aiClientService.analyzeImages(imagePaths);

        // Parse quality information and log per-image debug breakdown
        if (aiResult.has("images")) {
            JsonNode imgArr = aiResult.get("images");
            System.out.println("\n==================================================");
            System.out.println("PACKSURE MULTI-IMAGE OCR BACKEND DEBUG LOG");
            System.out.println("==================================================");
            for (int i = 0; i < imgArr.size(); i++) {
                JsonNode imgNode = imgArr.get(i);
                String imgId = imgNode.path("imageId").asText("img-" + (i + 1));
                String fname = imgNode.path("filename").asText("photo.jpg");
                int ocrLen = imgNode.path("ocrTextLength").asInt(0);
                double ocrConf = imgNode.path("ocrConfidence").asDouble(0.0);
                int declCount = imgNode.path("extractedDeclarationsCount").asInt(0);
                String procStatus = imgNode.path("processingStatus").asText("SUCCESS");
                String reason = imgNode.path("diagnosticReason").asText("");
                
                List<String> fields = new ArrayList<>();
                if (imgNode.has("extractedFields")) {
                    for (JsonNode fNode : imgNode.get("extractedFields")) {
                        fields.add(fNode.asText());
                    }
                }

                System.out.println("IMAGE " + (i + 1) + " (" + imgId + ": " + fname + ")");
                System.out.println("Processing Status: " + procStatus);
                System.out.println("OCR Text Length: " + ocrLen + " chars");
                System.out.println("OCR Confidence: " + String.format("%.3f", ocrConf));
                System.out.println("Extracted Declarations: " + declCount);
                System.out.println("Extracted Fields: " + (fields.isEmpty() ? "None" : String.join(", ", fields)));
                if (!reason.isEmpty()) {
                    System.out.println("Diagnostic Reason: " + reason);
                }
                System.out.println("--------------------------------------------------");

                if (i < images.size()) {
                    InspectionImage currentImg = images.get(i);
                    if (imgNode.has("quality")) {
                        JsonNode q = imgNode.get("quality");
                        currentImg.setQualityScore(q.path("score").asInt(75));
                        currentImg.setQualityStatus(q.path("status").asText("GOOD"));
                        currentImg.setRecommendation(q.path("recommendation").asText(""));
                        if (q.has("issues")) {
                            currentImg.setQualityIssues(q.get("issues").toString());
                        }
                        inspectionImageRepository.save(currentImg);
                    }
                }
            }
            System.out.println("==================================================\n");
        }

        // Extract declarations
        List<Declaration> savedDeclarations = new ArrayList<>();
        if (aiResult.has("declarations")) {
            JsonNode declArr = aiResult.get("declarations");
            for (JsonNode dNode : declArr) {
                String field = dNode.path("field").asText();
                Declaration d = declarationRepository.findByInspectionIdAndFieldName(inspectionId, field)
                        .orElse(new Declaration());

                d.setInspection(inspection);
                d.setFieldName(field);
                d.setDetectedValue(cleanString(dNode.path("displayValue").asText()));
                d.setNormalizedValue(cleanString(dNode.path("normalizedValue").asText()));
                d.setUnit(dNode.path("unit").isTextual() ? cleanString(dNode.path("unit").asText()) : null);
                d.setCurrency(dNode.path("currency").isTextual() ? cleanString(dNode.path("currency").asText()) : "INR");
                d.setRawOcrText(cleanString(dNode.path("rawOcrText").asText()));
                d.setEvidenceType(dNode.path("evidenceType").asText("EXPLICIT"));
                d.setOcrConfidence(dNode.path("ocrConfidence").asDouble(0.9));
                d.setExtractionConfidence(dNode.path("extractionConfidence").asDouble(0.9));
                d.setFinalConfidence(dNode.path("finalConfidence").asDouble(0.8));
                d = declarationRepository.save(d);
                savedDeclarations.add(d);

                // Clean old evidence records for this declaration before saving fresh fused evidence
                try {
                    evidenceRepository.deleteByDeclarationId(d.getId());
                } catch (Exception ignored) {}

                // Save evidence bounding boxes (support single or fused multi-image evidences)
                List<JsonNode> evNodes = new ArrayList<>();
                if (dNode.has("evidences") && dNode.get("evidences").isArray()) {
                    for (JsonNode evItem : dNode.get("evidences")) {
                        evNodes.add(evItem);
                    }
                } else if (dNode.has("evidence")) {
                    evNodes.add(dNode.get("evidence"));
                }

                for (JsonNode evNode : evNodes) {
                    Evidence ev = new Evidence();
                    ev.setDeclaration(d);

                    String imgIdStr = evNode.path("imageId").asText("img-1");
                    int imgIdx = 0;
                    if (imgIdStr.startsWith("img-")) {
                        try {
                            imgIdx = Integer.parseInt(imgIdStr.replace("img-", "")) - 1;
                        } catch (Exception ignored) {}
                    }
                    InspectionImage sourceImg = (imgIdx >= 0 && imgIdx < images.size()) ? images.get(imgIdx) : images.get(0);
                    ev.setInspectionImage(sourceImg);
                    ev.setOcrText(evNode.path("ocrText").asText());
                    ev.setConfidence(d.getFinalConfidence());

                    if (evNode.has("bbox")) {
                        JsonNode bbox = evNode.get("bbox");
                        double xp = bbox.path("xPct").asDouble(0);
                        double yp = bbox.path("yPct").asDouble(0);
                        double wp = bbox.path("widthPct").asDouble(10);
                        double hp = bbox.path("heightPct").asDouble(5);

                        ev.setBboxX(bbox.path("x").asDouble(0));
                        ev.setBboxY(bbox.path("y").asDouble(0));
                        ev.setBboxWidth(bbox.path("width").asDouble(100));
                        ev.setBboxHeight(bbox.path("height").asDouble(50));
                        ev.setxPct(xp);
                        ev.setyPct(yp);
                        ev.setWidthPct(wp);
                        ev.setHeightPct(hp);

                        d.setxPct(xp);
                        d.setyPct(yp);
                        d.setWidthPct(wp);
                        d.setHeightPct(hp);
                        declarationRepository.save(d);
                    }
                    evidenceRepository.save(ev);
                }
            }
        }

        // Product resolution & Change Detection
        String detectedCategory = "OTHER";
        double detectedConfidence = 0.5;
        String detectedSource = "AI";
        String decisionState = "REVIEW_REQUIRED";
        String detectedProductType = null;
        double detectedProductTypeConf = 0.0;
        String reasonsJson = "[]";

        if (aiResult.has("classification")) {
            JsonNode clsNode = aiResult.get("classification");
            detectedCategory = clsNode.path("category").asText("OTHER");
            detectedConfidence = clsNode.path("confidence").asDouble(0.5);
            detectedSource = clsNode.path("source").asText("AI");
            decisionState = clsNode.path("decisionState").asText("REVIEW_REQUIRED");
            if (clsNode.has("productType") && !clsNode.get("productType").isNull()) {
                detectedProductType = clsNode.get("productType").asText();
            }
            if (clsNode.has("productTypeConfidence")) {
                detectedProductTypeConf = clsNode.get("productTypeConfidence").asDouble(0.0);
            }

            List<String> reasonsList = new ArrayList<>();
            if (clsNode.has("reasons") && clsNode.get("reasons").isArray()) {
                for (JsonNode rNode : clsNode.get("reasons")) {
                    reasonsList.add(rNode.asText());
                }
            }
            try {
                reasonsJson = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(reasonsList);
            } catch (Exception ignored) {}
        }

        inspection.setDetectedCategory(detectedCategory);
        inspection.setDetectedCategoryConfidence(detectedConfidence);
        inspection.setDetectedCategorySource(detectedSource);
        inspection.setDetectedCategoryReasons(reasonsJson);
        inspection.setCategoryDecisionState(decisionState);
        inspection.setDetectedProductType(detectedProductType);
        inspection.setDetectedProductTypeConfidence(detectedProductTypeConf);

        // If finalCategory not set or source is AI, initialize finalCategory with detected values
        if (inspection.getFinalCategory() == null || "AI".equalsIgnoreCase(inspection.getFinalCategorySource())) {
            inspection.setFinalCategory(detectedCategory);
            inspection.setFinalCategorySource("AI");
            inspection.setFinalProductType(detectedProductType);
        }

        String barcode = null;
        String brand = "Brand";
        String productName = "Packaged Product";
        String mfg = "Manufacturer";

        for (Declaration d : savedDeclarations) {
            if ("BARCODE".equals(d.getFieldName())) barcode = d.getNormalizedValue();
            if ("BRAND".equals(d.getFieldName())) brand = d.getDetectedValue();
            if ("PRODUCT_NAME".equals(d.getFieldName())) productName = d.getDetectedValue();
            if ("MANUFACTURER".equals(d.getFieldName())) mfg = d.getDetectedValue();
        }

        Product product = null;
        boolean changeDetected = false;
        String changeDetails = "";

        if (barcode != null) {
            Optional<Product> prodOpt = productRepository.findByBarcode(barcode);
            if (prodOpt.isPresent()) {
                product = prodOpt.get();
                // Check change detection against latest inspection
                List<Inspection> prevInspections = inspectionRepository.findByProductIdOrderByCreatedAtDesc(product.getId());
                if (!prevInspections.isEmpty()) {
                    Inspection prev = prevInspections.get(0);
                    List<Declaration> prevDecls = declarationRepository.findByInspectionId(prev.getId());
                    for (Declaration pd : prevDecls) {
                        for (Declaration cd : savedDeclarations) {
                            if (pd.getFieldName() != null && pd.getFieldName().equals(cd.getFieldName()) && !Objects.equals(pd.getNormalizedValue(), cd.getNormalizedValue())) {
                                changeDetected = true;
                                changeDetails += cd.getFieldName() + " changed from " + pd.getDisplayValue() + " to " + cd.getDisplayValue() + "; ";
                            }
                        }
                    }
                }
            }
        }

        String targetCategory = inspection.getFinalCategory() != null ? inspection.getFinalCategory() : detectedCategory;

        if (product == null) {
            product = new Product(barcode, productName, brand, targetCategory, mfg);
            product = productRepository.save(product);
        } else {
            product.setCategory(targetCategory);
            productRepository.save(product);
        }

        inspection.setProduct(product);
        inspectionRepository.save(inspection);

        // Run Rule Engine and calculate compliance score
        return recalculateInspection(inspectionId);
    }

    @Transactional
    public Map<String, Object> updateInspectionCategory(Long inspectionId, String category, String productType, String source, User user) {
        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new RuntimeException("Inspection not found with id: " + inspectionId));

        if (!ProductCategory.isValid(category)) {
            throw new RuntimeException("Invalid product category: " + category);
        }

        String normalizedCategory = ProductCategory.fromString(category).name();
        String oldCategory = inspection.getFinalCategory();

        inspection.setFinalCategory(normalizedCategory);
        inspection.setFinalCategorySource(source != null ? source : "MANUAL");
        if (productType != null && !productType.trim().isEmpty()) {
            inspection.setFinalProductType(productType.trim());
        }
        inspection.setCategoryReviewed(true);
        inspection.setCategoryReviewedBy(user != null ? user.getUsername() : "Officer");
        inspection.setCategoryReviewedAt(LocalDateTime.now());

        if (inspection.getProduct() != null) {
            inspection.getProduct().setCategory(normalizedCategory);
            productRepository.save(inspection.getProduct());
        }

        inspectionRepository.save(inspection);

        auditService.log(
                user != null ? user.getId() : null,
                user != null ? user.getUsername() : "officer",
                "CATEGORY_CHANGED",
                "Inspection",
                inspection.getId(),
                "Category updated from " + oldCategory + " to " + normalizedCategory + " (" + (source != null ? source : "MANUAL") + ")",
                null
        );

        return recalculateInspection(inspectionId);
    }

    @Transactional
    public Map<String, Object> recalculateInspection(Long inspectionId) {
        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new RuntimeException("Inspection not found with id: " + inspectionId));

        List<Declaration> declarations = declarationRepository.findByInspectionId(inspectionId);
        List<InspectionImage> images = inspectionImageRepository.findByInspectionIdOrderByCreatedAtAsc(inspectionId);

        String category = "OTHER";
        if (inspection.getFinalCategory() != null) {
            category = inspection.getFinalCategory();
        } else if (inspection.getProduct() != null && inspection.getProduct().getCategory() != null) {
            category = inspection.getProduct().getCategory();
        }

        // Run Rule Engine
        List<RuleEvaluation> evaluations = ruleEngineService.evaluateInspection(inspection, declarations, category);

        // Calculate score & status
        Map<String, Object> scoreData = ruleEngineService.calculateComplianceScore(evaluations);
        double complianceScore = (Double) scoreData.get("complianceScore");
        String complianceStatus = (String) scoreData.get("complianceStatus");

        inspection.setScreeningScore((int) Math.round(complianceScore));
        inspection.setStatus("OFFICER_REVIEW");
        inspection.setFinalStatus(complianceStatus);
        inspectionRepository.save(inspection);

        auditService.log(null, "system",
                "ANALYSIS_COMPLETED", "Inspection", inspection.getId(), "Analysis compliance score for category " + category + ": " + complianceScore + "% (" + complianceStatus + ")", null);

        Map<String, Object> result = new HashMap<>();
        result.put("inspection", inspection);
        result.put("declarations", declarations);
        result.put("evaluations", evaluations);
        result.put("images", images);
        result.put("product", inspection.getProduct() != null ? inspection.getProduct() : Map.of());
        result.put("complianceScore", complianceScore);
        result.put("complianceStatus", complianceStatus);
        result.put("summary", scoreData.get("summary"));
        result.put("problems", scoreData.get("problems"));
        result.put("screeningScore", (int) Math.round(complianceScore));
        result.put("finalCategory", category);
        return result;
    }

    @Transactional
    public Map<String, Object> verifyDeclarationAndRecalculate(Long declarationId, String officerValue, Boolean verified, String officerName) {
        Declaration decl = declarationRepository.findById(declarationId)
                .orElseThrow(() -> new RuntimeException("Declaration not found with id: " + declarationId));

        decl.setOfficerValue(officerValue != null ? officerValue : decl.getDetectedValue());
        decl.setOfficerVerified(verified != null ? verified : true);
        decl.setVerifiedAt(LocalDateTime.now());
        decl.setVerifiedBy(officerName);
        declarationRepository.save(decl);

        Map<String, Object> recalculated = recalculateInspection(decl.getInspection().getId());
        recalculated.put("verifiedDeclaration", decl);
        return recalculated;
    }

    public Declaration verifyDeclaration(Long declarationId, String officerValue, Boolean verified, String officerName) {
        Declaration decl = declarationRepository.findById(declarationId)
                .orElseThrow(() -> new RuntimeException("Declaration not found with id: " + declarationId));

        decl.setOfficerValue(officerValue != null ? officerValue : decl.getDetectedValue());
        decl.setOfficerVerified(verified != null ? verified : true);
        decl.setVerifiedAt(LocalDateTime.now());
        decl.setVerifiedBy(officerName);
        return declarationRepository.save(decl);
    }

    public Inspection finalizeInspection(Long inspectionId, String remarks, String finalStatus, String officerName) {
        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new RuntimeException("Inspection not found with id: " + inspectionId));

        inspection.setStatus("FINALIZED");
        inspection.setFinalStatus(finalStatus != null ? finalStatus : inspection.getFinalStatus());
        inspection.setOfficerRemarks(remarks);
        inspection.setFinalizedAt(LocalDateTime.now());
        return inspectionRepository.save(inspection);
    }

    private String cleanString(String s) {
        if (s == null) return null;
        return s.replace("\u20B9", "Rs. ")
                .replace("₹", "Rs. ");
    }
}
