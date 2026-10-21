package com.packsure.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inspection_images")
public class InspectionImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspection_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Inspection inspection;

    @Column(nullable = false, length = 50)
    private String imageType = "PRIMARY"; // FRONT, BACK, SIDE, TOP, BOTTOM, LABEL

    @Column(nullable = false, length = 500)
    private String originalPath;

    @Column(length = 500)
    private String processedPath;

    @Column(length = 500)
    private String thumbnailPath;

    @Column(length = 100)
    private String imageHash;

    private Integer qualityScore; // 0-100

    @Column(length = 50)
    private String qualityStatus; // GOOD, ACCEPTABLE, POOR

    @Column(columnDefinition = "TEXT")
    private String qualityIssues;

    @Column(columnDefinition = "TEXT")
    private String recommendation;

    private LocalDateTime createdAt = LocalDateTime.now();

    public InspectionImage() {}

    public InspectionImage(Inspection inspection, String imageType, String originalPath) {
        this.inspection = inspection;
        this.imageType = imageType;
        this.originalPath = originalPath;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Inspection getInspection() { return inspection; }
    public void setInspection(Inspection inspection) { this.inspection = inspection; }

    public String getImageType() { return imageType; }
    public void setImageType(String imageType) { this.imageType = imageType; }

    public String getOriginalPath() { return originalPath; }
    public void setOriginalPath(String originalPath) { this.originalPath = originalPath; }

    public String getProcessedPath() { return processedPath; }
    public void setProcessedPath(String processedPath) { this.processedPath = processedPath; }

    public String getThumbnailPath() { return thumbnailPath; }
    public void setThumbnailPath(String thumbnailPath) { this.thumbnailPath = thumbnailPath; }

    public String getImageHash() { return imageHash; }
    public void setImageHash(String imageHash) { this.imageHash = imageHash; }

    public Integer getQualityScore() { return qualityScore; }
    public void setQualityScore(Integer qualityScore) { this.qualityScore = qualityScore; }

    public String getQualityStatus() { return qualityStatus; }
    public void setQualityStatus(String qualityStatus) { this.qualityStatus = qualityStatus; }

    public String getQualityIssues() { return qualityIssues; }
    public void setQualityIssues(String qualityIssues) { this.qualityIssues = qualityIssues; }

    public String getRecommendation() { return recommendation; }
    public void setRecommendation(String recommendation) { this.recommendation = recommendation; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getImageUrl() {
        return id != null ? "http://localhost:8081/api/inspections/images/" + id + "/content" : null;
    }
}
