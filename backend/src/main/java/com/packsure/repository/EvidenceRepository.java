package com.packsure.repository;

import com.packsure.model.Evidence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EvidenceRepository extends JpaRepository<Evidence, Long> {
    List<Evidence> findByDeclarationId(Long declarationId);
    List<Evidence> findByInspectionImageId(Long inspectionImageId);
    void deleteByDeclarationId(Long declarationId);
}
