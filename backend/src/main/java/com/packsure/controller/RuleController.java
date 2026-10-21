package com.packsure.controller;

import com.packsure.dto.ApiResponse;
import com.packsure.model.Declaration;
import com.packsure.model.Rule;
import com.packsure.model.RuleEvaluation;
import com.packsure.model.RuleVersion;
import com.packsure.model.User;
import com.packsure.repository.RuleRepository;
import com.packsure.repository.RuleVersionRepository;
import com.packsure.service.RuleEngineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rules")
public class RuleController {

    @Autowired
    private RuleRepository ruleRepository;

    @Autowired
    private RuleVersionRepository ruleVersionRepository;

    @Autowired
    private RuleEngineService ruleEngineService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Rule>>> getAllRules() {
        return ResponseEntity.ok(ApiResponse.ok(ruleRepository.findAll()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Rule>> createRule(@RequestBody Rule rule, @AuthenticationPrincipal User user) {
        rule.setVersion("1.0");
        rule.setLastReviewedAt(LocalDateTime.now());
        rule.setReviewedBy(user != null ? user.getFullName() : "Admin");
        Rule saved = ruleRepository.save(rule);

        RuleVersion version = new RuleVersion(saved, "1.0", saved.getConfiguration(), user != null ? user.getFullName() : "Admin", "Initial rule creation");
        ruleVersionRepository.save(version);

        return ResponseEntity.ok(ApiResponse.ok(saved, "Rule created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Rule>> updateRule(
            @PathVariable Long id,
            @RequestBody Rule updated,
            @AuthenticationPrincipal User user) {
        Rule rule = ruleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rule not found with id: " + id));

        // Increment minor version
        String currentVersion = rule.getVersion() != null ? rule.getVersion() : "1.0";
        double vNum = Double.parseDouble(currentVersion) + 0.1;
        String newVersion = String.format("%.1f", vNum);

        rule.setTitle(updated.getTitle());
        rule.setDescription(updated.getDescription());
        rule.setSeverity(updated.getSeverity());
        rule.setRequired(updated.getRequired());
        rule.setValidationType(updated.getValidationType());
        rule.setCategory(updated.getCategory());
        rule.setConfiguration(updated.getConfiguration());
        rule.setLegalReference(updated.getLegalReference());
        rule.setVersion(newVersion);
        rule.setLastReviewedAt(LocalDateTime.now());
        rule.setReviewedBy(user != null ? user.getFullName() : "Admin");
        Rule saved = ruleRepository.save(rule);

        RuleVersion version = new RuleVersion(saved, newVersion, saved.getConfiguration(), user != null ? user.getFullName() : "Admin", "Updated parameters");
        ruleVersionRepository.save(version);

        return ResponseEntity.ok(ApiResponse.ok(saved, "Rule updated to version " + newVersion));
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<Rule>> activateRule(@PathVariable Long id) {
        Rule rule = ruleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rule not found with id: " + id));
        rule.setActive(true);
        return ResponseEntity.ok(ApiResponse.ok(ruleRepository.save(rule), "Rule activated"));
    }

    @PostMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<Rule>> deactivateRule(@PathVariable Long id) {
        Rule rule = ruleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rule not found with id: " + id));
        rule.setActive(false);
        return ResponseEntity.ok(ApiResponse.ok(ruleRepository.save(rule), "Rule deactivated"));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<List<RuleVersion>>> getRuleHistory(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(ruleVersionRepository.findByRuleIdOrderByChangedAtDesc(id)));
    }

    @PostMapping("/test")
    public ResponseEntity<ApiResponse<Map<String, Object>>> testRule(@RequestBody Map<String, String> body) {
        String ruleCode = body.get("ruleCode");
        String sampleValue = body.get("sampleValue");

        Rule rule = ruleRepository.findByRuleCode(ruleCode)
                .orElseThrow(() -> new RuntimeException("Rule not found with code: " + ruleCode));

        Declaration sampleDecl = new Declaration();
        sampleDecl.setFieldName(rule.getFieldName());
        sampleDecl.setDetectedValue(sampleValue);
        sampleDecl.setNormalizedValue(sampleValue);
        sampleDecl.setDisplayValue(sampleValue);
        sampleDecl.setFinalConfidence(0.95);

        RuleEvaluation eval = ruleEngineService.evaluateSingleRule(rule, sampleDecl);

        Map<String, Object> resp = Map.of(
                "ruleCode", rule.getRuleCode(),
                "ruleTitle", rule.getTitle(),
                "testValue", sampleValue,
                "result", eval.getResult(),
                "reasoning", eval.getReasoning()
        );
        return ResponseEntity.ok(ApiResponse.ok(resp, "Rule evaluated successfully"));
    }
}
