package com.packsure.model;

import jakarta.persistence.*;

@Entity
@Table(name = "evidence")
public class Evidence {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "declaration_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Declaration declaration;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspection_image_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private InspectionImage inspectionImage;

    private Double bboxX;
    private Double bboxY;
    private Double bboxWidth;
    private Double bboxHeight;

    private Double xPct;
    private Double yPct;
    private Double widthPct;
    private Double heightPct;

    @Column(columnDefinition = "TEXT")
    private String ocrText;

    private Double confidence;

    public Evidence() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Declaration getDeclaration() { return declaration; }
    public void setDeclaration(Declaration declaration) { this.declaration = declaration; }

    public InspectionImage getInspectionImage() { return inspectionImage; }
    public void setInspectionImage(InspectionImage inspectionImage) { this.inspectionImage = inspectionImage; }

    public Double getBboxX() { return bboxX; }
    public void setBboxX(Double bboxX) { this.bboxX = bboxX; }

    public Double getBboxY() { return bboxY; }
    public void setBboxY(Double bboxY) { this.bboxY = bboxY; }

    public Double getBboxWidth() { return bboxWidth; }
    public void setBboxWidth(Double bboxWidth) { this.bboxWidth = bboxWidth; }

    public Double getBboxHeight() { return bboxHeight; }
    public void setBboxHeight(Double bboxHeight) { this.bboxHeight = bboxHeight; }

    public Double getxPct() { return xPct; }
    public void setxPct(Double xPct) { this.xPct = xPct; }

    public Double getyPct() { return yPct; }
    public void setyPct(Double yPct) { this.yPct = yPct; }

    public Double getWidthPct() { return widthPct; }
    public void setWidthPct(Double widthPct) { this.widthPct = widthPct; }

    public Double getHeightPct() { return heightPct; }
    public void setHeightPct(Double heightPct) { this.heightPct = heightPct; }

    public String getOcrText() { return ocrText; }
    public void setOcrText(String ocrText) { this.ocrText = ocrText; }

    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }
}
