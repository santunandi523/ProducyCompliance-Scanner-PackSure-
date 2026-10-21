package com.packsure.service;

import com.packsure.model.*;
import com.packsure.repository.RuleEvaluationRepository;
import com.packsure.repository.RuleRepository;
import com.packsure.repository.ViolationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;

@Service
public class RuleEngineService {

    @Autowired
    private RuleRepository ruleRepository;

    @Autowired
    private RuleEvaluationRepository ruleEvaluationRepository;

    @Autowired
    private ViolationRepository violationRepository;

    @org.springframework.transaction.annotation.Transactional
    public List<RuleEvaluation> evaluateInspection(Inspection inspection, List<Declaration> declarations, String category) {
        try {
            violationRepository.deleteByInspectionId(inspection.getId());
            ruleEvaluationRepository.deleteByInspectionId(inspection.getId());
        } catch (Exception ignored) {}

        List<Rule> activeRules = ruleRepository.findByActiveTrue();
        List<RuleEvaluation> evaluations = new ArrayList<>();

        Map<String, Declaration> declMap = new HashMap<>();
        for (Declaration d : declarations) {
            declMap.put(d.getFieldName(), d);
        }

        for (Rule rule : activeRules) {
            // Check category applicability
            if (!"ALL".equalsIgnoreCase(rule.getCategory()) && !rule.getCategory().equalsIgnoreCase(category)) {
                RuleEvaluation naEval = new RuleEvaluation();
                naEval.setInspection(inspection);
                naEval.setRule(rule);
                naEval.setRuleVersion(rule.getVersion());
                naEval.setResult("NOT_APPLICABLE");
                naEval.setReasoning("Rule applies only to " + rule.getCategory() + " commodities.");
                evaluations.add(ruleEvaluationRepository.save(naEval));
                continue;
            }

            String ruleField = rule.getFieldName();
            Declaration decl = declMap.get(ruleField);

            // Flexible mapping for Customer Care details (accept CUSTOMER_CARE_CONTACT, CUSTOMER_CARE_EMAIL, CUSTOMER_CARE_PHONE, CUSTOMER_CARE_WEBSITE, CONSUMER_CARE)
            if ("CONSUMER_CARE".equalsIgnoreCase(ruleField) || "CUSTOMER_CARE_CONTACT".equalsIgnoreCase(ruleField) || "CUSTOMER_CARE_PHONE".equalsIgnoreCase(ruleField) || "CUSTOMER_CARE_EMAIL".equalsIgnoreCase(ruleField)) {
                if (decl == null) decl = declMap.get("CUSTOMER_CARE_CONTACT");
                if (decl == null) decl = declMap.get("CUSTOMER_CARE_EMAIL");
                if (decl == null) decl = declMap.get("CUSTOMER_CARE_PHONE");
                if (decl == null) decl = declMap.get("CUSTOMER_CARE_WEBSITE");
                if (decl == null) decl = declMap.get("CONSUMER_CARE");
            }

            // Flexible canonical mapping for Manufacture / Packing Date
            if ("MANUFACTURE_DATE".equalsIgnoreCase(ruleField) || "DATE_OF_MANUFACTURE".equalsIgnoreCase(ruleField) || "MANUFACTURING_DATE".equalsIgnoreCase(ruleField) || "DATE_OF_MANUFACTURE_PACKING".equalsIgnoreCase(ruleField) || "DATE_OF_MANUFACTURE_OR_PACKING".equalsIgnoreCase(ruleField) || "PACKING_DATE".equalsIgnoreCase(ruleField) || "DATE_OF_PACKING".equalsIgnoreCase(ruleField) || "PACK_DATE".equalsIgnoreCase(ruleField) || "MFG_DATE".equalsIgnoreCase(ruleField) || "MFD".equalsIgnoreCase(ruleField) || "PKD".equalsIgnoreCase(ruleField)) {
                if (decl == null) decl = declMap.get("MANUFACTURE_DATE");
                if (decl == null) decl = declMap.get("DATE_OF_MANUFACTURE_PACKING");
                if (decl == null) decl = declMap.get("MANUFACTURING_DATE");
                if (decl == null) decl = declMap.get("DATE_OF_MANUFACTURE");
                if (decl == null) decl = declMap.get("PACKING_DATE");
                if (decl == null) decl = declMap.get("DATE_OF_PACKING");
                if (decl == null) decl = declMap.get("PACK_DATE");
                if (decl == null) decl = declMap.get("MFG_DATE");
                if (decl == null) decl = declMap.get("MFD");
                if (decl == null) decl = declMap.get("PKD");
            }

            // Flexible canonical mapping for Country of Origin
            if ("COUNTRY_OF_ORIGIN".equalsIgnoreCase(ruleField) || "COUNTRY_ORIGIN".equalsIgnoreCase(ruleField) || "MADE_IN".equalsIgnoreCase(ruleField) || "COUNTRY_OF_MANUFACTURE".equalsIgnoreCase(ruleField)) {
                if (decl == null) decl = declMap.get("COUNTRY_OF_ORIGIN");
                if (decl == null) decl = declMap.get("MADE_IN");
                if (decl == null) decl = declMap.get("COUNTRY_OF_MANUFACTURE");
                if (decl == null) decl = declMap.get("ORIGIN");
            }

            RuleEvaluation eval = evaluateSingleRule(rule, decl);
            eval.setInspection(inspection);
            eval.setDeclaration(decl);
            RuleEvaluation savedEval = ruleEvaluationRepository.save(eval);
            evaluations.add(savedEval);

            // If POTENTIAL_ISSUE or REVIEW, create Violation record
            if ("POTENTIAL_ISSUE".equals(savedEval.getResult()) || "REVIEW".equals(savedEval.getResult())) {
                Violation violation = new Violation();
                violation.setInspection(inspection);
                violation.setRuleEvaluation(savedEval);
                violation.setFieldName(rule.getFieldName());
                violation.setSeverity(rule.getSeverity());
                violation.setStatus(savedEval.getResult().equals("POTENTIAL_ISSUE") ? "PENDING" : "REVIEW");
                violation.setOfficerNotes(savedEval.getReasoning());
                violationRepository.save(violation);
            }
        }

        return evaluations;
    }

    public Map<String, Object> calculateComplianceScore(List<RuleEvaluation> evaluations) {
        int totalApplicableChecks = 0;
        int passedChecks = 0;
        int failedChecks = 0;
        int reviewChecks = 0;
        int notApplicableChecks = 0;

        double totalApplicableWeight = 0;
        double passedWeight = 0;

        List<Map<String, Object>> problems = new ArrayList<>();

        for (RuleEvaluation eval : evaluations) {
            String res = eval.getResult();
            Rule rule = eval.getRule();
            boolean isMandatory = rule != null && Boolean.TRUE.equals(rule.getRequired());
            double weight = isMandatory ? 2.0 : 1.0;

            if ("NOT_APPLICABLE".equalsIgnoreCase(res)) {
                notApplicableChecks++;
            } else {
                totalApplicableChecks++;
                totalApplicableWeight += weight;

                if ("PASS".equalsIgnoreCase(res)) {
                    passedChecks++;
                    passedWeight += weight;
                } else if ("REVIEW".equalsIgnoreCase(res)) {
                    reviewChecks++;
                    Map<String, Object> prob = new HashMap<>();
                    prob.put("rule", rule != null ? rule.getFieldName() : "UNKNOWN");
                    prob.put("ruleName", rule != null ? rule.getTitle() : "Requirement Review");
                    prob.put("status", "REVIEW");
                    prob.put("message", eval.getReasoning() != null ? eval.getReasoning() : "Requires officer review.");
                    prob.put("weight", weight);
                    prob.put("mandatory", isMandatory);
                    problems.add(prob);
                } else { // POTENTIAL_ISSUE / FAIL
                    failedChecks++;
                    Map<String, Object> prob = new HashMap<>();
                    prob.put("rule", rule != null ? rule.getFieldName() : "UNKNOWN");
                    prob.put("ruleName", rule != null ? rule.getTitle() : "Mandatory Requirement");
                    prob.put("status", "FAIL");
                    prob.put("message", eval.getReasoning() != null ? eval.getReasoning() : "Mandatory declaration is non-compliant.");
                    prob.put("weight", weight);
                    prob.put("mandatory", isMandatory);
                    problems.add(prob);
                }
            }
        }

        double score = totalApplicableWeight > 0 ? (passedWeight / totalApplicableWeight) * 100.0 : 100.0;
        double roundedScore = Math.round(score * 10.0) / 10.0;

        String status;
        if (roundedScore < 50.0) {
            status = "NON-COMPLIANT";
        } else if (roundedScore < 75.0) {
            status = "NEEDS REVIEW";
        } else {
            status = "COMPLIANT";
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalApplicableChecks", totalApplicableChecks);
        summary.put("passedChecks", passedChecks);
        summary.put("failedChecks", failedChecks);
        summary.put("reviewChecks", reviewChecks);
        summary.put("notApplicableChecks", notApplicableChecks);

        Map<String, Object> result = new HashMap<>();
        result.put("complianceScore", roundedScore);
        result.put("complianceStatus", status);
        result.put("summary", summary);
        result.put("problems", problems);
        return result;
    }

    public RuleEvaluation evaluateSingleRule(Rule rule, Declaration decl) {
        RuleEvaluation eval = new RuleEvaluation();
        eval.setRule(rule);
        eval.setRuleVersion(rule.getVersion());

        if (decl == null || decl.getDetectedValue() == null || decl.getDetectedValue().trim().isEmpty()) {
            if (Boolean.TRUE.equals(rule.getRequired())) {
                eval.setResult("POTENTIAL_ISSUE");
                eval.setReasoning("Mandatory declaration '" + rule.getTitle() + "' was not found on the package evidence.");
            } else {
                eval.setResult("NOT_APPLICABLE");
                eval.setReasoning("Optional declaration not detected.");
            }
            return eval;
        }

        String val = decl.getNormalizedValue() != null ? decl.getNormalizedValue() : decl.getDetectedValue();
        Double conf = decl.getFinalConfidence() != null ? decl.getFinalConfidence() : 0.0;

        if ("COUNTRY_OF_ORIGIN".equalsIgnoreCase(rule.getFieldName()) || "COUNTRY_ORIGIN".equalsIgnoreCase(rule.getFieldName())) {
            String evType = decl.getEvidenceType();
            if ("INFERRED_FROM_MANUFACTURER_ADDRESS".equalsIgnoreCase(evType)) {
                eval.setResult("REVIEW");
                eval.setReasoning("Country of Origin candidate detected from manufacturer address: " + decl.getDisplayValue() + " (Inferred Evidence). Officer visual verification required for explicit packaging declaration.");
            } else {
                eval.setResult(conf >= 0.60 ? "PASS" : "REVIEW");
                eval.setReasoning("Explicit Country of Origin declaration present: " + decl.getDisplayValue());
            }
            return eval;
        }

        switch (rule.getValidationType().toUpperCase()) {
            case "PRESENCE":
                if (conf < 0.60) {
                    eval.setResult("REVIEW");
                    eval.setReasoning("Declaration detected but confidence is low (" + Math.round(conf * 100) + "%). Officer visual verification required.");
                } else {
                    eval.setResult("PASS");
                    eval.setReasoning("Declaration present and clearly identified (" + Math.round(conf * 100) + "% confidence).");
                }
                break;

            case "NUMERIC":
                try {
                    double num = Double.parseDouble(val.replaceAll("[^0-9.]", ""));
                    if (num <= 0) {
                        eval.setResult("POTENTIAL_ISSUE");
                        eval.setReasoning("Value must be strictly positive. Detected: " + val);
                    } else if (conf < 0.65) {
                        eval.setResult("REVIEW");
                        eval.setReasoning("Numeric value detected but requires officer verification due to low confidence (" + Math.round(conf * 100) + "%).");
                    } else {
                        eval.setResult("PASS");
                        eval.setReasoning("Valid positive numeric declaration: " + decl.getDisplayValue());
                    }
                } catch (Exception e) {
                    eval.setResult("POTENTIAL_ISSUE");
                    eval.setReasoning("Failed to parse valid number from declaration: " + val);
                }
                break;

            case "FORMAT":
                if ("CONSUMER_CARE".equalsIgnoreCase(rule.getFieldName()) || "CUSTOMER_CARE_CONTACT".equalsIgnoreCase(rule.getFieldName())) {
                    boolean hasPhone = Pattern.compile("\\b(?:1800|\\+?91)?[0-9\\-\\s]{8,14}\\b").matcher(val).find();
                    boolean hasEmail = Pattern.compile("[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+").matcher(val).find();
                    boolean isPresent = "PRESENT".equalsIgnoreCase(val) || val.toUpperCase().contains("PRESENT");
                    if (hasPhone || hasEmail || isPresent) {
                        eval.setResult(conf >= 0.60 ? "PASS" : "REVIEW");
                        eval.setReasoning(hasPhone ? "Valid consumer care helpline detected: " + val : (hasEmail ? "Valid consumer care email detected: " + val : "Valid consumer care contact details present: " + val));
                    } else {
                        eval.setResult("POTENTIAL_ISSUE");
                        eval.setReasoning("Consumer care declaration lacks standard helpline number or email address.");
                    }
                } else {
                    eval.setResult(conf >= 0.65 ? "PASS" : "REVIEW");
                    eval.setReasoning("Format verified for " + rule.getTitle());
                }
                break;

            case "DATE":
                eval.setResult(conf >= 0.60 ? "PASS" : "REVIEW");
                eval.setReasoning("Date declaration detected: " + val);
                break;

            default:
                eval.setResult(conf >= 0.65 ? "PASS" : "REVIEW");
                eval.setReasoning("General compliance requirement evaluated.");
                break;
        }

        return eval;
    }
}
