package com.packsure.repository;

import com.packsure.model.RuleEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RuleEvaluationRepository extends JpaRepository<RuleEvaluation, Long> {
    List<RuleEvaluation> findByInspectionId(Long inspectionId);
    void deleteByInspectionId(Long inspectionId);
}
