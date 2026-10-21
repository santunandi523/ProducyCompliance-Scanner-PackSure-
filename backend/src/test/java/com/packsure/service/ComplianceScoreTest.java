package com.packsure.service;

import com.packsure.model.Rule;
import com.packsure.model.RuleEvaluation;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class ComplianceScoreTest {

    private RuleEngineService ruleEngineService;

    @BeforeEach
    public void setUp() {
        ruleEngineService = new RuleEngineService();
    }

    private RuleEvaluation createEvaluation(String fieldName, String result, boolean required) {
        RuleEvaluation ev = new RuleEvaluation();
        Rule rule = new Rule("RULE-" + fieldName, fieldName + " Rule", "Description for " + fieldName, "ALL", fieldName, "PRESENCE", required, required ? "CRITICAL" : "MEDIUM", "Rule 6(1)");
        ev.setRule(rule);
        ev.setResult(result);
        ev.setReasoning(result.equals("PASS") ? fieldName + " satisfies PCR requirements" : "Mandatory declaration '" + fieldName + "' is missing or invalid");
        return ev;
    }

    @Test
    public void test1_AllPass100Percent() {
        List<RuleEvaluation> evaluations = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {
            evaluations.add(createEvaluation("FIELD_" + i, "PASS", true));
        }

        Map<String, Object> res = ruleEngineService.calculateComplianceScore(evaluations);
        double score = (Double) res.get("complianceScore");
        String status = (String) res.get("complianceStatus");

        assertEquals(100.0, score, 0.01);
        assertEquals("COMPLIANT", status);
    }

    @Test
    public void test2_EightPassTwoFail_Score80() {
        List<RuleEvaluation> evaluations = new ArrayList<>();
        for (int i = 1; i <= 8; i++) {
            evaluations.add(createEvaluation("FIELD_" + i, "PASS", false));
        }
        for (int i = 9; i <= 10; i++) {
            evaluations.add(createEvaluation("FIELD_" + i, "FAIL", false));
        }

        Map<String, Object> res = ruleEngineService.calculateComplianceScore(evaluations);
        double score = (Double) res.get("complianceScore");
        String status = (String) res.get("complianceStatus");

        assertEquals(80.0, score, 0.01);
        assertEquals("COMPLIANT", status);
    }

    @Test
    public void test3_SevenPassThreeFail_Score70_NeedsReview() {
        List<RuleEvaluation> evaluations = new ArrayList<>();
        for (int i = 1; i <= 7; i++) {
            evaluations.add(createEvaluation("FIELD_" + i, "PASS", false));
        }
        for (int i = 8; i <= 10; i++) {
            evaluations.add(createEvaluation("FIELD_" + i, "FAIL", false));
        }

        Map<String, Object> res = ruleEngineService.calculateComplianceScore(evaluations);
        double score = (Double) res.get("complianceScore");
        String status = (String) res.get("complianceStatus");

        assertEquals(70.0, score, 0.01);
        assertEquals("NEEDS REVIEW", status);
    }

    @Test
    public void test4_FourPassSixFail_Score40_NonCompliant() {
        List<RuleEvaluation> evaluations = new ArrayList<>();
        for (int i = 1; i <= 4; i++) {
            evaluations.add(createEvaluation("FIELD_" + i, "PASS", false));
        }
        for (int i = 5; i <= 10; i++) {
            evaluations.add(createEvaluation("FIELD_" + i, "FAIL", false));
        }

        Map<String, Object> res = ruleEngineService.calculateComplianceScore(evaluations);
        double score = (Double) res.get("complianceScore");
        String status = (String) res.get("complianceStatus");

        assertEquals(40.0, score, 0.01);
        assertEquals("NON-COMPLIANT", status);
    }

    @Test
    public void test5_ExcludesNotApplicable() {
        List<RuleEvaluation> evaluations = new ArrayList<>();
        for (int i = 1; i <= 7; i++) {
            evaluations.add(createEvaluation("FIELD_" + i, "PASS", false));
        }
        evaluations.add(createEvaluation("FIELD_8", "FAIL", false));
        evaluations.add(createEvaluation("FIELD_9", "NOT_APPLICABLE", false));
        evaluations.add(createEvaluation("FIELD_10", "NOT_APPLICABLE", false));

        Map<String, Object> res = ruleEngineService.calculateComplianceScore(evaluations);
        double score = (Double) res.get("complianceScore");
        String status = (String) res.get("complianceStatus");
        Map<String, Object> summary = (Map<String, Object>) res.get("summary");

        assertEquals(87.5, score, 0.01);
        assertEquals("COMPLIANT", status);
        assertEquals(8, summary.get("totalApplicableChecks"));
        assertEquals(7, summary.get("passedChecks"));
        assertEquals(1, summary.get("failedChecks"));
        assertEquals(2, summary.get("notApplicableChecks"));
    }

    @Test
    public void test6_MandatoryMrpFail_PreservesProblemDetails() {
        List<RuleEvaluation> evaluations = new ArrayList<>();
        evaluations.add(createEvaluation("MRP", "FAIL", true));
        for (int i = 2; i <= 10; i++) {
            evaluations.add(createEvaluation("NORMAL_FIELD_" + i, "PASS", false));
        }

        Map<String, Object> res = ruleEngineService.calculateComplianceScore(evaluations);
        List<Map<String, String>> problems = (List<Map<String, String>>) res.get("problems");

        assertNotNull(problems);
        assertFalse(problems.isEmpty());
        assertEquals("MRP", problems.get(0).get("rule"));
        assertEquals("FAIL", problems.get(0).get("status"));
    }

    @Test
    public void test7_WeightedScoring_MandatoryRulesHaveWeightTwo() {
        List<RuleEvaluation> evaluations = new ArrayList<>();
        // Mandatory MRP (weight=2) -> FAIL
        evaluations.add(createEvaluation("MRP", "FAIL", true));
        // Mandatory Manufacturer (weight=2) -> PASS
        evaluations.add(createEvaluation("MANUFACTURER", "PASS", true));
        // Normal check 1 (weight=1) -> PASS
        evaluations.add(createEvaluation("BARCODE", "PASS", false));
        // Normal check 2 (weight=1) -> PASS
        evaluations.add(createEvaluation("BRAND", "PASS", false));

        // Total weight = 2+2+1+1 = 6. Passed weight = 0+2+1+1 = 4. Score = 4/6 * 100 = 66.67%
        Map<String, Object> res = ruleEngineService.calculateComplianceScore(evaluations);
        double score = (Double) res.get("complianceScore");
        String status = (String) res.get("complianceStatus");

        assertEquals(66.7, score, 0.1);
        assertEquals("NEEDS REVIEW", status);
    }

    @Test
    public void test8_ManufactureDateSatisfiesMandatoryDateRule() {
        Rule rule = new Rule("PC-DAT-004", "Date of Manufacture / Packing", "Month and year of manufacture or packing", "ALL", "MANUFACTURE_DATE", "PRESENCE", true, "MEDIUM", "Rule 6(1)(d)");
        com.packsure.model.Declaration decl = new com.packsure.model.Declaration();
        decl.setFieldName("MANUFACTURE_DATE");
        decl.setDetectedValue("SEP.2025");
        decl.setNormalizedValue("2025-09");
        decl.setFinalConfidence(0.95);

        RuleEvaluation eval = ruleEngineService.evaluateSingleRule(rule, decl);
        assertEquals("PASS", eval.getResult());
        assertFalse(eval.getReasoning().contains("not found"));
    }

    @Test
    public void test9_PackingDateSatisfiesMandatoryDateRule() {
        Rule rule = new Rule("PC-DAT-004", "Date of Manufacture / Packing", "Month and year of manufacture or packing", "ALL", "DATE_OF_MANUFACTURE_PACKING", "PRESENCE", true, "MEDIUM", "Rule 6(1)(d)");
        com.packsure.model.Declaration decl = new com.packsure.model.Declaration();
        decl.setFieldName("PACKING_DATE");
        decl.setDetectedValue("SEP.2025");
        decl.setNormalizedValue("2025-09");
        decl.setFinalConfidence(0.90);

        Map<String, com.packsure.model.Declaration> declMap = new java.util.HashMap<>();
        declMap.put("PACKING_DATE", decl);

        com.packsure.model.Declaration resolvedDecl = declMap.get("MANUFACTURE_DATE");
        if (resolvedDecl == null) resolvedDecl = declMap.get("PACKING_DATE");
        assertNotNull(resolvedDecl);
        assertEquals("SEP.2025", resolvedDecl.getDetectedValue());
    }

    @Test
    public void test10_CategorySpecificRuleFiltering() {
        Rule foodRule = new Rule("FOOD-001", "FSSAI License", "Must display FSSAI License Number", "FOOD", "FSSAI_LICENSE", "PRESENCE", true, "HIGH", "FSSAI Regulations");
        Rule elecRule = new Rule("ELEC-001", "BIS Mark", "Must display BIS Standard Mark", "ELECTRONICS", "BIS_MARK", "PRESENCE", true, "HIGH", "CRO Order 2021");

        RuleEvaluation foodEval = new RuleEvaluation();
        foodEval.setRule(foodRule);
        foodEval.setResult("PASS");

        RuleEvaluation elecEval = new RuleEvaluation();
        elecEval.setRule(elecRule);
        elecEval.setResult("NOT_APPLICABLE");
        elecEval.setReasoning("Rule applies only to ELECTRONICS commodities.");

        List<RuleEvaluation> evaluations = List.of(foodEval, elecEval);
        Map<String, Object> scoreData = ruleEngineService.calculateComplianceScore(evaluations);

        assertEquals(100.0, (Double) scoreData.get("complianceScore"), 0.01);
        assertEquals("COMPLIANT", scoreData.get("complianceStatus"));
        Map<String, Object> summary = (Map<String, Object>) scoreData.get("summary");
        assertEquals(1, summary.get("totalApplicableChecks"));
        assertEquals(1, summary.get("passedChecks"));
        assertEquals(1, summary.get("notApplicableChecks"));
    }

    @Test
    public void test11_ProductCategoryEnumValidation() {
        assertTrue(com.packsure.model.ProductCategory.isValid("FOOD"));
        assertTrue(com.packsure.model.ProductCategory.isValid("ELECTRONICS"));
        assertTrue(com.packsure.model.ProductCategory.isValid("COSMETICS"));
        assertTrue(com.packsure.model.ProductCategory.isValid("MEDICINES_HEALTHCARE"));
        assertFalse(com.packsure.model.ProductCategory.isValid("UNKNOWN_CAT_123"));

        assertEquals(com.packsure.model.ProductCategory.FOOD, com.packsure.model.ProductCategory.fromString("FOOD"));
        assertEquals(com.packsure.model.ProductCategory.MEDICINES_HEALTHCARE, com.packsure.model.ProductCategory.fromString("Medicines & Healthcare"));
    }
}
