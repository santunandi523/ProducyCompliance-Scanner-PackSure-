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
    List<Inspection> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT COUNT(i) FROM Inspection i WHERE i.createdAt >= :since")
    long countInspectionsSince(LocalDateTime since);

    @Query("SELECT COUNT(i) FROM Inspection i WHERE i.user.id = :userId AND i.createdAt >= :since")
    long countInspectionsByUserIdSince(Long userId, LocalDateTime since);

    @Query("SELECT COUNT(DISTINCT i.product.id) FROM Inspection i WHERE i.user.id = :userId AND i.product IS NOT NULL")
    long countDistinctProductsByUserId(Long userId);

    long countByFinalStatus(String finalStatus);
    long countByStatus(String status);

    long countByUserId(Long userId);
    long countByUserIdAndFinalStatus(Long userId, String finalStatus);
    long countByUserIdAndStatus(Long userId, String status);

    Optional<Inspection> findByIdAndUserId(Long id, Long userId);
}
