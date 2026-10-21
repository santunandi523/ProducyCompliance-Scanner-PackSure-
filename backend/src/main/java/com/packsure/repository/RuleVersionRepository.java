package com.packsure.repository;

import com.packsure.model.RuleVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RuleVersionRepository extends JpaRepository<RuleVersion, Long> {
    List<RuleVersion> findByRuleIdOrderByChangedAtDesc(Long ruleId);
}
