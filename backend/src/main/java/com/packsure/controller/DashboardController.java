package com.packsure.controller;

import com.packsure.dto.ApiResponse;
import com.packsure.model.Inspection;
import com.packsure.model.User;
import com.packsure.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSummary(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getDashboardSummary(user)));
    }

    @GetMapping("/violations")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getViolationCategories(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getViolationCategories(user)));
    }

    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<Inspection>>> getRecentInspections(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getRecentInspections(user)));
    }
}
