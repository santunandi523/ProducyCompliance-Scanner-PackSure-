package com.packsure.repository;

import com.packsure.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    Optional<Report> findByInspectionId(Long inspectionId);
    Optional<Report> findByReportNumber(String reportNumber);
    Optional<Report> findByReportHash(String reportHash);
}
