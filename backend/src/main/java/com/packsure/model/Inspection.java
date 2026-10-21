package com.packsure.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inspections")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Inspection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String inspectionNumber; // INS-2026-000001

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Product product;

    @Column(nullable = false, length = 50)
    private String status = "CREATED"; // CREATED, UPLOADING, PROCESSING, ANALYZING, REVIEW_REQUIRED, OFFICER_REVIEW, FINALIZED, REPORT_GENERATED, ERROR

    @Column(length = 200)
    private String location;

    private Integer screeningScore = 0; // 0-100

    @Column(length = 50)
    private String finalStatus = "PENDING"; // COMPLIANT, POTENTIAL_NON_COMPLIANCE, NEEDS_FURTHER_REVIEW

    @Column(columnDefinition = "TEXT")
    private String officerRemarks;

    @Column(length = 50)
    private String detectedCategory = "OTHER";

    private Double detectedCategoryConfidence = 0.50;

    @Column(length = 50)
    private String detectedCategorySource = "AI";

    @Column(columnDefinition = "TEXT")
    private String detectedCategoryReasons;

    @Column(length = 50)
    private String finalCategory = "OTHER";

    @Column(length = 50)
    private String finalCategorySource = "AUTO"; // AUTO, MANUAL

    @Column(length = 50)
    private String categoryDecisionState = "AUTO_DETECTED"; // AUTO_DETECTED, MANUAL_SELECTED, REVIEW_REQUIRED, CATEGORY_CONFLICT

    private Boolean categoryReviewed = false;

    @Column(length = 100)
    private String categoryReviewedBy;

    private LocalDateTime categoryReviewedAt;

    @Column(length = 50)
    private String detectedProductType;

    private Double detectedProductTypeConfidence;

    @Column(length = 50)
    private String finalProductType;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime finalizedAt;

    public Inspection() {}

    public Inspection(String inspectionNumber, User user, String location) {
        this.inspectionNumber = inspectionNumber;
        this.user = user;
        this.location = location;
        this.status = "CREATED";
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getInspectionNumber() { return inspectionNumber; }
    public void setInspectionNumber(String inspectionNumber) { this.inspectionNumber = inspectionNumber; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Integer getScreeningScore() { return screeningScore; }
    public void setScreeningScore(Integer screeningScore) { this.screeningScore = screeningScore; }

    public String getFinalStatus() { return finalStatus; }
    public void setFinalStatus(String finalStatus) { this.finalStatus = finalStatus; }

    public String getOfficerRemarks() { return officerRemarks; }
    public void setOfficerRemarks(String officerRemarks) { this.officerRemarks = officerRemarks; }

    public String getDetectedCategory() { return detectedCategory; }
    public void setDetectedCategory(String detectedCategory) { this.detectedCategory = detectedCategory; }

    public Double getDetectedCategoryConfidence() { return detectedCategoryConfidence; }
    public void setDetectedCategoryConfidence(Double detectedCategoryConfidence) { this.detectedCategoryConfidence = detectedCategoryConfidence; }

    public String getDetectedCategorySource() { return detectedCategorySource; }
    public void setDetectedCategorySource(String detectedCategorySource) { this.detectedCategorySource = detectedCategorySource; }

    public String getDetectedCategoryReasons() { return detectedCategoryReasons; }
    public void setDetectedCategoryReasons(String detectedCategoryReasons) { this.detectedCategoryReasons = detectedCategoryReasons; }

    public String getFinalCategory() { return finalCategory; }
    public void setFinalCategory(String finalCategory) { this.finalCategory = finalCategory; }

    public String getFinalCategorySource() { return finalCategorySource; }
    public void setFinalCategorySource(String finalCategorySource) { this.finalCategorySource = finalCategorySource; }

    public String getCategoryDecisionState() { return categoryDecisionState; }
    public void setCategoryDecisionState(String categoryDecisionState) { this.categoryDecisionState = categoryDecisionState; }

    public Boolean getCategoryReviewed() { return categoryReviewed; }
    public void setCategoryReviewed(Boolean categoryReviewed) { this.categoryReviewed = categoryReviewed; }

    public String getCategoryReviewedBy() { return categoryReviewedBy; }
    public void setCategoryReviewedBy(String categoryReviewedBy) { this.categoryReviewedBy = categoryReviewedBy; }

    public LocalDateTime getCategoryReviewedAt() { return categoryReviewedAt; }
    public void setCategoryReviewedAt(LocalDateTime categoryReviewedAt) { this.categoryReviewedAt = categoryReviewedAt; }

    public String getDetectedProductType() { return detectedProductType; }
    public void setDetectedProductType(String detectedProductType) { this.detectedProductType = detectedProductType; }

    public Double getDetectedProductTypeConfidence() { return detectedProductTypeConfidence; }
    public void setDetectedProductTypeConfidence(Double detectedProductTypeConfidence) { this.detectedProductTypeConfidence = detectedProductTypeConfidence; }

    public String getFinalProductType() { return finalProductType; }
    public void setFinalProductType(String finalProductType) { this.finalProductType = finalProductType; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getFinalizedAt() { return finalizedAt; }
    public void setFinalizedAt(LocalDateTime finalizedAt) { this.finalizedAt = finalizedAt; }
}
