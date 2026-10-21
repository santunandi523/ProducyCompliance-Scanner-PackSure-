package com.packsure.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "declarations")
public class Declaration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspection_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Inspection inspection;

    @Column(nullable = false, length = 100)
    private String fieldName; // MRP, NET_QUANTITY, MANUFACTURER, etc.

    @Column(columnDefinition = "TEXT")
    private String detectedValue;

    @Column(columnDefinition = "TEXT")
    private String normalizedValue;

    @Column(length = 50)
    private String unit;

    @Column(length = 20)
    private String currency;

    @Column(columnDefinition = "TEXT")
    private String rawOcrText;

    private Double ocrConfidence;
    private Double extractionConfidence;
    private Double finalConfidence;

    @Column(columnDefinition = "TEXT")
    private String officerValue;

    private Boolean officerVerified = false;
    private LocalDateTime verifiedAt;

    @Column(length = 100)
    private String verifiedBy;

    @Column(length = 100)
    private String evidenceType; // EXPLICIT, INFERRED_FROM_MANUFACTURER_ADDRESS

    private Double xPct;
    private Double yPct;
    private Double widthPct;
    private Double heightPct;

    public Declaration() {}

    public String getEvidenceType() { return evidenceType != null ? evidenceType : "EXPLICIT"; }
    public void setEvidenceType(String evidenceType) { this.evidenceType = evidenceType; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Inspection getInspection() { return inspection; }
    public void setInspection(Inspection inspection) { this.inspection = inspection; }

    public String getFieldName() { return fieldName; }
    public void setFieldName(String fieldName) { this.fieldName = fieldName; }

    public String getDetectedValue() { return detectedValue; }
    public void setDetectedValue(String detectedValue) { this.detectedValue = detectedValue; }

    public String getDisplayValue() { return detectedValue != null ? detectedValue : normalizedValue; }
    public void setDisplayValue(String displayValue) { this.detectedValue = displayValue; }

    public String getNormalizedValue() { return normalizedValue; }
    public void setNormalizedValue(String normalizedValue) { this.normalizedValue = normalizedValue; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getRawOcrText() { return rawOcrText; }
    public void setRawOcrText(String rawOcrText) { this.rawOcrText = rawOcrText; }

    public Double getOcrConfidence() { return ocrConfidence; }
    public void setOcrConfidence(Double ocrConfidence) { this.ocrConfidence = ocrConfidence; }

    public Double getExtractionConfidence() { return extractionConfidence; }
    public void setExtractionConfidence(Double extractionConfidence) { this.extractionConfidence = extractionConfidence; }

    public Double getFinalConfidence() { return finalConfidence; }
    public void setFinalConfidence(Double finalConfidence) { this.finalConfidence = finalConfidence; }

    public String getOfficerValue() { return officerValue; }
    public void setOfficerValue(String officerValue) { this.officerValue = officerValue; }

    public Boolean getOfficerVerified() { return officerVerified; }
    public void setOfficerVerified(Boolean officerVerified) { this.officerVerified = officerVerified; }

    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }

    public String getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(String verifiedBy) { this.verifiedBy = verifiedBy; }

    public Double getxPct() { return xPct; }
    public void setxPct(Double xPct) { this.xPct = xPct; }

    public Double getyPct() { return yPct; }
    public void setyPct(Double yPct) { this.yPct = yPct; }

    public Double getWidthPct() { return widthPct; }
    public void setWidthPct(Double widthPct) { this.widthPct = widthPct; }

    public Double getHeightPct() { return heightPct; }
    public void setHeightPct(Double heightPct) { this.heightPct = heightPct; }
}
