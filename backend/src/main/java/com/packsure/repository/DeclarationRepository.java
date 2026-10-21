package com.packsure.repository;

import com.packsure.model.Declaration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DeclarationRepository extends JpaRepository<Declaration, Long> {
    List<Declaration> findByInspectionId(Long inspectionId);
    Optional<Declaration> findByInspectionIdAndFieldName(Long inspectionId, String fieldName);
}
