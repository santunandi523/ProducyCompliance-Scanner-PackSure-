package com.packsure.controller;

import com.packsure.dto.ApiResponse;
import com.packsure.model.Declaration;
import com.packsure.model.Evidence;
import com.packsure.model.User;
import com.packsure.repository.DeclarationRepository;
import com.packsure.repository.EvidenceRepository;
import com.packsure.service.InspectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class DeclarationController {

    @Autowired
    private DeclarationRepository declarationRepository;

    @Autowired
    private EvidenceRepository evidenceRepository;

    @Autowired
    private InspectionService inspectionService;

    @GetMapping("/inspections/{id}/declarations")
    public ResponseEntity<ApiResponse<List<Declaration>>> getDeclarations(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(declarationRepository.findByInspectionId(id)));
    }

    @PostMapping("/declarations/{id}/verify")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyDeclaration(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal User user) {
        String officerVal = body.get("officerValue") != null ? body.get("officerValue").toString() : null;
        Boolean verified = body.get("officerVerified") != null ? Boolean.valueOf(body.get("officerVerified").toString()) : true;
        String officerName = user != null ? user.getFullName() : "Enforcement Officer";

        Map<String, Object> result = inspectionService.verifyDeclarationAndRecalculate(id, officerVal, verified, officerName);
        return ResponseEntity.ok(ApiResponse.ok(result, "Declaration verified and inspection recalculated"));
    }

    @PutMapping("/declarations/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateDeclaration(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal User user) {
        String officerVal = body.containsKey("officerValue") && body.get("officerValue") != null ? body.get("officerValue").toString() : null;
        Boolean verified = body.containsKey("officerVerified") && body.get("officerVerified") != null ? Boolean.valueOf(body.get("officerVerified").toString()) : true;
        String officerName = user != null ? user.getFullName() : "Enforcement Officer";

        Map<String, Object> result = inspectionService.verifyDeclarationAndRecalculate(id, officerVal, verified, officerName);
        return ResponseEntity.ok(ApiResponse.ok(result, "Declaration updated and inspection recalculated"));
    }

    @GetMapping("/declarations/{id}/evidence")
    public ResponseEntity<ApiResponse<List<Evidence>>> getDeclarationEvidence(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(evidenceRepository.findByDeclarationId(id)));
    }
}

