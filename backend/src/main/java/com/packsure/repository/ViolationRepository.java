package com.packsure.repository;

import com.packsure.model.Violation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ViolationRepository extends JpaRepository<Violation, Long> {
    List<Violation> findByInspectionId(Long inspectionId);
    void deleteByInspectionId(Long inspectionId);
    List<Violation> findByStatus(String status);
    List<Violation> findAllByOrderByCreatedAtDesc();

    @Query("SELECT v.fieldName, COUNT(v) FROM Violation v GROUP BY v.fieldName ORDER BY COUNT(v) DESC")
    List<Object[]> countRecurringViolationsByField();
}
