package com.packsure.controller;

import com.packsure.dto.ApiResponse;
import com.packsure.model.*;
import com.packsure.repository.*;
import com.packsure.service.ReportGeneratorService;
import com.packsure.service.StorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ReportController {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private InspectionRepository inspectionRepository;

    @Autowired
    private DeclarationRepository declarationRepository;

    @Autowired
    private RuleEvaluationRepository ruleEvaluationRepository;

    @Autowired
    private ReportGeneratorService reportGeneratorService;

    @Autowired
    private StorageService storageService;

    @PostMapping("/inspections/{id}/report")
    public ResponseEntity<ApiResponse<Report>> generateReport(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        Inspection inspection = inspectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inspection not found with id: " + id));

        List<Declaration> declarations = declarationRepository.findByInspectionId(id);
        List<RuleEvaluation> evaluations = ruleEvaluationRepository.findByInspectionId(id);
        String officerName = user != null ? user.getFullName() : "Enforcement Officer";

        Report report = reportGeneratorService.generateReport(inspection, declarations, evaluations, officerName);
        return ResponseEntity.ok(ApiResponse.ok(report, "PDF report generated successfully with SHA-256 integrity hash"));
    }

    @GetMapping("/reports/{id}/download")
    public ResponseEntity<Resource> downloadReport(@PathVariable Long id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found with id: " + id));

        File file = new File(report.getFilePath());
        if (!file.exists()) {
            throw new RuntimeException("Report file not found on disk");
        }

        Resource resource = new FileSystemResource(file);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getName() + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }

    @GetMapping("/reports/{id}/verify")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyReportIntegrity(@PathVariable Long id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found with id: " + id));

        String currentHash = storageService.computeFileHash(report.getFilePath());
        boolean isValid = report.getReportHash() != null && report.getReportHash().equalsIgnoreCase(currentHash);

        Map<String, Object> data = Map.of(
                "reportNumber", report.getReportNumber(),
                "storedHash", report.getReportHash(),
                "calculatedHash", currentHash,
                "isAuthentic", isValid,
                "generatedAt", report.getGeneratedAt(),
                "generatedBy", report.getGeneratedBy()
        );

        return ResponseEntity.ok(ApiResponse.ok(data, isValid ? "Report integrity verified" : "Report has been tampered with or modified"));
    }
}
