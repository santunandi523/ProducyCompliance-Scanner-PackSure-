package com.packsure.controller;

import com.packsure.dto.ApiResponse;
import com.packsure.model.User;
import com.packsure.model.Violation;
import com.packsure.repository.ViolationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/violations")
public class ViolationController {

    @Autowired
    private ViolationRepository violationRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Violation>>> getAllViolations(
            @RequestParam(required = false) String status) {
        List<Violation> list = (status != null && !status.isEmpty() && !"ALL".equalsIgnoreCase(status))
                ? violationRepository.findByStatus(status.toUpperCase())
                : violationRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Violation>> getViolation(@PathVariable Long id) {
        Violation v = violationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Violation not found with id: " + id));
        return ResponseEntity.ok(ApiResponse.ok(v));
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse<Violation>> confirmViolation(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal User user) {
        Violation v = violationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Violation not found with id: " + id));

        v.setStatus("CONFIRMED");
        if (body != null && body.containsKey("notes")) {
            v.setOfficerNotes(body.get("notes"));
        }
        v.setConfirmedAt(LocalDateTime.now());
        v.setConfirmedBy(user != null ? user.getFullName() : "Enforcement Officer");
        return ResponseEntity.ok(ApiResponse.ok(violationRepository.save(v), "Violation confirmed"));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<Violation>> rejectViolation(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal User user) {
        Violation v = violationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Violation not found with id: " + id));

        v.setStatus("REJECTED");
        if (body != null && body.containsKey("notes")) {
            v.setOfficerNotes(body.get("notes"));
        }
        v.setConfirmedAt(LocalDateTime.now());
        v.setConfirmedBy(user != null ? user.getFullName() : "Enforcement Officer");
        return ResponseEntity.ok(ApiResponse.ok(violationRepository.save(v), "Violation rejected"));
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<ApiResponse<Violation>> reviewViolation(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        Violation v = violationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Violation not found with id: " + id));

        v.setStatus("REVIEW");
        if (body != null && body.containsKey("notes")) {
            v.setOfficerNotes(body.get("notes"));
        }
        return ResponseEntity.ok(ApiResponse.ok(violationRepository.save(v), "Marked for review"));
    }
}
