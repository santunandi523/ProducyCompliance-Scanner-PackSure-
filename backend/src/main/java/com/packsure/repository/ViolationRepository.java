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

    List<Violation> findByInspectionUserIdOrderByCreatedAtDesc(Long userId);
    List<Violation> findByInspectionUserIdAndStatusOrderByCreatedAtDesc(Long userId, String status);

    @Query("SELECT v.fieldName, COUNT(v) FROM Violation v GROUP BY v.fieldName ORDER BY COUNT(v) DESC")
    List<Object[]> countRecurringViolationsByField();

    @Query("SELECT v.fieldName, COUNT(v) FROM Violation v WHERE v.inspection.user.id = :userId GROUP BY v.fieldName ORDER BY COUNT(v) DESC")
    List<Object[]> countRecurringViolationsByFieldForUser(Long userId);
}
