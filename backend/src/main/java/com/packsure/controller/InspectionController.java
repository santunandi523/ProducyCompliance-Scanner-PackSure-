package com.packsure.controller;

import com.packsure.dto.ApiResponse;
import com.packsure.model.*;
import com.packsure.repository.*;
import com.packsure.service.InspectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inspections")
public class InspectionController {

    @Autowired
    private InspectionService inspectionService;

    @Autowired
    private InspectionRepository inspectionRepository;

    @Autowired
    private InspectionImageRepository inspectionImageRepository;

    @Autowired
    private DeclarationRepository declarationRepository;

    @Autowired
    private RuleEvaluationRepository ruleEvaluationRepository;

    @Autowired
    private EvidenceRepository evidenceRepository;

    @Autowired
    private RuleRepository ruleRepository;

    @Autowired
    private com.packsure.service.RuleEngineService ruleEngineService;

    @PatchMapping("/{id}/category")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateCategory(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User user) {
        String category = body != null ? body.get("category") : null;
        String productType = body != null ? body.get("productType") : null;
        String source = body != null ? body.get("source") : "MANUAL";

        if (category == null || category.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("INVALID_INPUT", "Category is required"));
        }

        Map<String, Object> result = inspectionService.updateInspectionCategory(id, category, productType, source, user);
        return ResponseEntity.ok(ApiResponse.ok(result, "Category updated and compliance recalculated successfully"));
    }

    @PostMapping("/{id}/recalculate-compliance")
    public ResponseEntity<ApiResponse<Map<String, Object>>> recalculateCompliance(@PathVariable Long id) {
        Map<String, Object> result = inspectionService.recalculateInspection(id);
        return ResponseEntity.ok(ApiResponse.ok(result, "Compliance recalculated successfully"));
    }

    @GetMapping("/{id}/category")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getInspectionCategory(@PathVariable Long id) {
        Inspection inspection = inspectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inspection not found with id: " + id));

        Map<String, Object> categoryInfo = Map.of(
                "inspectionId", inspection.getId(),
                "detectedCategory", inspection.getDetectedCategory() != null ? inspection.getDetectedCategory() : "OTHER",
                "detectedCategoryConfidence", inspection.getDetectedCategoryConfidence() != null ? inspection.getDetectedCategoryConfidence() : 0,
                "detectedCategorySource", inspection.getDetectedCategorySource() != null ? inspection.getDetectedCategorySource() : "AI",
                "detectedCategoryReasons", inspection.getDetectedCategoryReasons() != null ? inspection.getDetectedCategoryReasons() : "[]",
                "categoryDecisionState", inspection.getCategoryDecisionState() != null ? inspection.getCategoryDecisionState() : "REVIEW_REQUIRED",
                "finalCategory", inspection.getFinalCategory() != null ? inspection.getFinalCategory() : "OTHER",
                "finalCategorySource", inspection.getFinalCategorySource() != null ? inspection.getFinalCategorySource() : "MANUAL",
                "categoryReviewed", Boolean.TRUE.equals(inspection.getCategoryReviewed())
        );

        return ResponseEntity.ok(ApiResponse.ok(categoryInfo));
    }

    @GetMapping("/{id}/applicable-rules")
    public ResponseEntity<ApiResponse<List<Rule>>> getApplicableRules(@PathVariable Long id) {
        Inspection inspection = inspectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inspection not found with id: " + id));

        String category = inspection.getFinalCategory() != null ? inspection.getFinalCategory() : "OTHER";
        List<Rule> allRules = ruleRepository.findByActiveTrue();
        List<Rule> applicableRules = allRules.stream()
                .filter(r -> "ALL".equalsIgnoreCase(r.getCategory()) || category.equalsIgnoreCase(r.getCategory()))
                .toList();

        return ResponseEntity.ok(ApiResponse.ok(applicableRules, "Applicable rules for category " + category));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Inspection>> createInspection(
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal User user) {
        String location = body != null ? body.get("location") : "Retail Store";
        Inspection inspection = inspectionService.createInspection(user, location);
        return ResponseEntity.ok(ApiResponse.ok(inspection, "Inspection initialized"));
    }

    @PostMapping("/{id}/images")
    public ResponseEntity<ApiResponse<InspectionImage>> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "imageType", required = false, defaultValue = "PRIMARY") String imageType,
            @AuthenticationPrincipal User user) {
        InspectionImage img = inspectionService.addImage(id, file, imageType, user);
        return ResponseEntity.ok(ApiResponse.ok(img, "Image uploaded successfully"));
    }

    @PostMapping("/{id}/images/batch")
    public ResponseEntity<ApiResponse<List<InspectionImage>>> uploadImagesBatch(
            @PathVariable Long id,
            @RequestParam("files") List<MultipartFile> files,
            @AuthenticationPrincipal User user) {
        List<InspectionImage> imgs = inspectionService.addImagesBatch(id, files, user);
        return ResponseEntity.ok(ApiResponse.ok(imgs, "Batch images uploaded successfully"));
    }

    @PostMapping("/{id}/analyze")
    public ResponseEntity<ApiResponse<Map<String, Object>>> analyzeInspection(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        Map<String, Object> result = inspectionService.analyzeInspection(id, user);
        return ResponseEntity.ok(ApiResponse.ok(result, "Inspection analyzed successfully"));
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Inspection>> getInspectionStatus(@PathVariable Long id) {
        Inspection inspection = inspectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inspection not found with id: " + id));
        return ResponseEntity.ok(ApiResponse.ok(inspection));
    }

    @GetMapping("/{id}/results")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getInspectionResults(@PathVariable Long id) {
        Inspection inspection = inspectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inspection not found with id: " + id));

        List<Declaration> declarations = declarationRepository.findByInspectionId(id);
        List<RuleEvaluation> evaluations = ruleEvaluationRepository.findByInspectionId(id);
        List<InspectionImage> images = inspectionImageRepository.findByInspectionIdOrderByCreatedAtAsc(id);

        Map<String, Object> scoreData = ruleEngineService.calculateComplianceScore(evaluations != null ? evaluations : List.of());

        Map<String, Object> data = new java.util.HashMap<>();
        data.put("inspection", inspection);
        data.put("declarations", declarations != null ? declarations : List.of());
        data.put("evaluations", evaluations != null ? evaluations : List.of());
        data.put("images", images != null ? images : List.of());
        data.put("product", inspection.getProduct() != null ? inspection.getProduct() : Map.of());
        data.put("complianceScore", scoreData.get("complianceScore"));
        data.put("complianceStatus", scoreData.get("complianceStatus"));
        data.put("summary", scoreData.get("summary"));
        data.put("problems", scoreData.get("problems"));
        data.put("screeningScore", scoreData.get("complianceScore"));
        data.put("finalCategory", inspection.getFinalCategory() != null ? inspection.getFinalCategory() : "OTHER");

        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    @PostMapping("/{id}/finalize")
    public ResponseEntity<ApiResponse<Inspection>> finalizeInspection(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User user) {
        String remarks = body != null ? body.get("remarks") : "Inspection completed";
        String status = body != null ? body.get("finalStatus") : "COMPLIANT";
        String officerName = user != null ? user.getFullName() : "Enforcement Officer";

        Inspection inspection = inspectionService.finalizeInspection(id, remarks, status, officerName);
        return ResponseEntity.ok(ApiResponse.ok(inspection, "Inspection finalized"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Inspection>>> listInspections() {
        return ResponseEntity.ok(ApiResponse.ok(inspectionRepository.findAllByOrderByCreatedAtDesc()));
    }

    @GetMapping("/images/{imageId}/content")
    public ResponseEntity<org.springframework.core.io.Resource> getImageContent(@PathVariable Long imageId) {
        InspectionImage image = inspectionImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found with id: " + imageId));

        java.io.File file = new java.io.File(image.getOriginalPath());
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }

        String contentType = "image/jpeg";
        if (file.getName().toLowerCase().endsWith(".png")) contentType = "image/png";

        return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                .header(org.springframework.http.HttpHeaders.CACHE_CONTROL, "max-age=3600")
                .body(new org.springframework.core.io.FileSystemResource(file));
    }
}
