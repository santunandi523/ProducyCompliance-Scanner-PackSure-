package com.packsure.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "rules")
public class Rule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String ruleCode; // e.g. PC-MRP-001

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 50)
    private String category = "ALL"; // ALL, FOOD, COSMETIC, HOUSEHOLD, etc.

    @Column(nullable = false, length = 100)
    private String fieldName; // MRP, NET_QUANTITY, MANUFACTURER, etc.

    @Column(nullable = false, length = 50)
    private String validationType; // PRESENCE, FORMAT, NUMERIC, DATE, RANGE, READABILITY, CUSTOM

    private Boolean required = true;

    @Column(length = 20)
    private String severity = "HIGH"; // CRITICAL, HIGH, MEDIUM, LOW

    @Column(length = 20)
    private String version = "1.0";

    private LocalDate effectiveFrom = LocalDate.now();
    private LocalDate effectiveTo;

    private Boolean active = true;

    @Column(columnDefinition = "TEXT")
    private String configuration; // JSON parameters for the rule

    @Column(length = 250)
    private String legalSource = "Legal Metrology (Packaged Commodities) Rules, 2011";

    @Column(length = 250)
    private String legalReference = "Rule 6(1)";

    private LocalDateTime lastReviewedAt = LocalDateTime.now();

    @Column(length = 100)
    private String reviewedBy = "Director General Legal Metrology";

    public Rule() {}

    public Rule(String ruleCode, String title, String description, String category, String fieldName, String validationType, Boolean required, String severity, String legalReference) {
        this.ruleCode = ruleCode;
        this.title = title;
        this.description = description;
        this.category = category;
        this.fieldName = fieldName;
        this.validationType = validationType;
        this.required = required;
        this.severity = severity;
        this.legalReference = legalReference;
        this.active = true;
        this.version = "1.0";
        this.effectiveFrom = LocalDate.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRuleCode() { return ruleCode; }
    public void setRuleCode(String ruleCode) { this.ruleCode = ruleCode; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getFieldName() { return fieldName; }
    public void setFieldName(String fieldName) { this.fieldName = fieldName; }

    public String getValidationType() { return validationType; }
    public void setValidationType(String validationType) { this.validationType = validationType; }

    public Boolean getRequired() { return required; }
    public void setRequired(Boolean required) { this.required = required; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }

    public LocalDate getEffectiveFrom() { return effectiveFrom; }
    public void setEffectiveFrom(LocalDate effectiveFrom) { this.effectiveFrom = effectiveFrom; }

    public LocalDate getEffectiveTo() { return effectiveTo; }
    public void setEffectiveTo(LocalDate effectiveTo) { this.effectiveTo = effectiveTo; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public String getConfiguration() { return configuration; }
    public void setConfiguration(String configuration) { this.configuration = configuration; }

    public String getLegalSource() { return legalSource; }
    public void setLegalSource(String legalSource) { this.legalSource = legalSource; }

    public String getLegalReference() { return legalReference; }
    public void setLegalReference(String legalReference) { this.legalReference = legalReference; }

    public LocalDateTime getLastReviewedAt() { return lastReviewedAt; }
    public void setLastReviewedAt(LocalDateTime lastReviewedAt) { this.lastReviewedAt = lastReviewedAt; }

    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String reviewedBy) { this.reviewedBy = reviewedBy; }
}
