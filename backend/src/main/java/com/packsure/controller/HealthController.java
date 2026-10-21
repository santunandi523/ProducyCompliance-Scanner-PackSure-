package com.packsure.controller;

import com.packsure.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import javax.sql.DataSource;
import java.io.File;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @Autowired
    private DataSource dataSource;

    @Value("${packsure.ai.service.url}")
    private String aiServiceUrl;

    @Value("${packsure.storage.path}")
    private String storagePath;

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, String>>> checkHealth() {
        Map<String, String> status = new HashMap<>();

        // 1. Check Database
        try (Connection conn = dataSource.getConnection()) {
            status.put("database", conn.isValid(2) ? "CONNECTED" : "DEGRADED");
        } catch (Exception e) {
            status.put("database", "DOWN (" + e.getMessage() + ")");
        }

        // 2. Check AI Service
        try {
            String res = restTemplate.getForObject(aiServiceUrl + "/api/v1/health", String.class);
            status.put("aiService", res != null && res.contains("UP") ? "AVAILABLE" : "DEGRADED");
        } catch (Exception e) {
            status.put("aiService", "UNAVAILABLE");
        }

        // 3. Check Storage Filesystem
        try {
            File dir = new File(storagePath);
            if (!dir.exists()) dir.mkdirs();
            status.put("storage", dir.canWrite() ? "AVAILABLE" : "READ_ONLY");
        } catch (Exception e) {
            status.put("storage", "UNAVAILABLE");
        }

        boolean allOk = "CONNECTED".equals(status.get("database")) && "AVAILABLE".equals(status.get("storage"));
        return ResponseEntity.ok(ApiResponse.ok(status, allOk ? "All core services operational" : "Some services degraded"));
    }
}
