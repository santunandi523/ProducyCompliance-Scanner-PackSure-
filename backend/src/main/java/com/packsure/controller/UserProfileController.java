package com.packsure.controller;

import com.packsure.dto.ApiResponse;
import com.packsure.model.User;
import com.packsure.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserProfileController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProfile(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("UNAUTHORIZED", "Not authenticated"));
        }
        Map<String, Object> profile = userService.getUserProfileWithStats(user);
        return ResponseEntity.ok(ApiResponse.ok(profile));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("UNAUTHORIZED", "Not authenticated"));
        }
        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");

        try {
            userService.changeSelfPassword(user, currentPassword, newPassword);
            return ResponseEntity.ok(ApiResponse.ok("Password updated successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("INVALID_REQUEST", e.getMessage()));
        }
    }
}
