package com.packsure.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspection_id", nullable = false)
    private Inspection inspection;

    @Column(nullable = false, unique = true, length = 100)
    private String reportNumber; // REP-INS-2026-000001

    @Column(nullable = false, length = 500)
    private String filePath;

    @Column(nullable = false, length = 100)
    private String reportHash; // SHA-256 checksum

    private LocalDateTime generatedAt = LocalDateTime.now();

    @Column(length = 100)
    private String generatedBy;

    public Report() {}

    public Report(Inspection inspection, String reportNumber, String filePath, String reportHash, String generatedBy) {
        this.inspection = inspection;
        this.reportNumber = reportNumber;
        this.filePath = filePath;
        this.reportHash = reportHash;
        this.generatedBy = generatedBy;
        this.generatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Inspection getInspection() { return inspection; }
    public void setInspection(Inspection inspection) { this.inspection = inspection; }

    public String getReportNumber() { return reportNumber; }
    public void setReportNumber(String reportNumber) { this.reportNumber = reportNumber; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public String getReportHash() { return reportHash; }
    public void setReportHash(String reportHash) { this.reportHash = reportHash; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }

    public String getGeneratedBy() { return generatedBy; }
    public void setGeneratedBy(String generatedBy) { this.generatedBy = generatedBy; }
}
