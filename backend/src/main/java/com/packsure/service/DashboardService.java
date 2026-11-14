package com.packsure.service;

import com.packsure.model.Inspection;
import com.packsure.model.User;
import com.packsure.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
public class DashboardService {

    @Autowired
    private InspectionRepository inspectionRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ViolationRepository violationRepository;

    public Map<String, Object> getDashboardSummary(User user) {
        Map<String, Object> summary = new HashMap<>();

        if (user != null && "ROLE_OFFICER".equalsIgnoreCase(user.getRole())) {
            long totalInspections = inspectionRepository.countByUserId(user.getId());
            long todayInspections = inspectionRepository.countInspectionsByUserIdSince(
                    user.getId(), LocalDateTime.of(LocalDate.now(), LocalTime.MIN));
            long needsReview = inspectionRepository.countByUserIdAndFinalStatus(user.getId(), "NEEDS_FURTHER_REVIEW");
            long potentialViolations = inspectionRepository.countByUserIdAndFinalStatus(user.getId(), "POTENTIAL_NON_COMPLIANCE");
            long compliant = inspectionRepository.countByUserIdAndFinalStatus(user.getId(), "COMPLIANT");
            long finalized = inspectionRepository.countByUserIdAndStatus(user.getId(), "FINALIZED");
            long productsScanned = inspectionRepository.countDistinctProductsByUserId(user.getId());

            summary.put("totalInspections", totalInspections);
            summary.put("todayInspections", todayInspections);
            summary.put("needsReview", needsReview);
            summary.put("potentialViolations", potentialViolations);
            summary.put("compliant", compliant);
            summary.put("finalized", finalized);
            summary.put("productsScanned", productsScanned);
            summary.put("officerName", user.getFullName());
            summary.put("isPersonalized", true);
            return summary;
        }

        long totalInspections = inspectionRepository.count();
        long todayInspections = inspectionRepository.countInspectionsSince(LocalDateTime.of(LocalDate.now(), LocalTime.MIN));
        long needsReview = inspectionRepository.countByFinalStatus("NEEDS_FURTHER_REVIEW");
        long potentialViolations = inspectionRepository.countByFinalStatus("POTENTIAL_NON_COMPLIANCE");
        long compliant = inspectionRepository.countByFinalStatus("COMPLIANT");
        long finalized = inspectionRepository.countByStatus("FINALIZED");
        long productsScanned = productRepository.count();

        summary.put("totalInspections", totalInspections);
        summary.put("todayInspections", todayInspections);
        summary.put("needsReview", needsReview);
        summary.put("potentialViolations", potentialViolations);
        summary.put("compliant", compliant);
        summary.put("finalized", finalized);
        summary.put("productsScanned", productsScanned);
        summary.put("isPersonalized", false);

        return summary;
    }

    public List<Map<String, Object>> getViolationCategories(User user) {
        List<Object[]> rows = (user != null && "ROLE_OFFICER".equalsIgnoreCase(user.getRole()))
                ? violationRepository.countRecurringViolationsByFieldForUser(user.getId())
                : violationRepository.countRecurringViolationsByField();

        List<Map<String, Object>> list = new ArrayList<>();
        for (Object[] r : rows) {
            Map<String, Object> item = new HashMap<>();
            item.put("name", r[0]);
            item.put("count", r[1]);
            list.add(item);
        }
        return list;
    }

    public List<Inspection> getRecentInspections(User user) {
        if (user != null && "ROLE_OFFICER".equalsIgnoreCase(user.getRole())) {
            return inspectionRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        }
        return inspectionRepository.findAllByOrderByCreatedAtDesc();
    }
}
