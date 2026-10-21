package com.packsure.repository;

import com.packsure.model.InspectionImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InspectionImageRepository extends JpaRepository<InspectionImage, Long> {
    List<InspectionImage> findByInspectionIdOrderByCreatedAtAsc(Long inspectionId);
}
