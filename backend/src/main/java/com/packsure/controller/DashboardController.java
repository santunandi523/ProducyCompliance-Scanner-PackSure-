package com.packsure.controller;

import com.packsure.dto.ApiResponse;
import com.packsure.model.Inspection;
import com.packsure.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSummary() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getDashboardSummary()));
    }

    @GetMapping("/violations")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getViolationCategories() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getViolationCategories()));
    }

    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<Inspection>>> getRecentInspections() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getRecentInspections()));
    }
}
