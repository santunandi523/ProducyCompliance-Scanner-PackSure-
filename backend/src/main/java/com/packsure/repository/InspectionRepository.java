package com.packsure.repository;

import com.packsure.model.Inspection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InspectionRepository extends JpaRepository<Inspection, Long> {
    Optional<Inspection> findByInspectionNumber(String inspectionNumber);
    List<Inspection> findByProductIdOrderByCreatedAtDesc(Long productId);
    List<Inspection> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COUNT(i) FROM Inspection i WHERE i.createdAt >= :since")
    long countInspectionsSince(LocalDateTime since);

    long countByFinalStatus(String finalStatus);
    long countByStatus(String status);
}
