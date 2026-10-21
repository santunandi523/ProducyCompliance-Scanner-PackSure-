package com.packsure.controller;

import com.packsure.dto.ApiResponse;
import com.packsure.model.User;
import com.packsure.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<User>>> listUsers() {
        List<User> users = userService.listUsers();
        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<User>> createUser(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User adminUser) {
        String fullName = body.get("fullName");
        String username = body.get("username");
        String email = body.get("email");
        String password = body.get("password");
        String role = body.get("role");
        String location = body.get("location");

        User user = userService.createUser(fullName, username, email, password, role, location, adminUser);
        return ResponseEntity.ok(ApiResponse.ok(user, "Officer created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> updateUser(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User adminUser) {
        String fullName = body.get("fullName");
        String email = body.get("email");
        String role = body.get("role");
        String location = body.get("location");

        User user = userService.updateUser(id, fullName, email, role, location, adminUser);
        return ResponseEntity.ok(ApiResponse.ok(user, "Officer updated successfully"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<User>> changeUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User adminUser) {
        String status = body.get("status");
        User user = userService.changeUserStatus(id, status, adminUser);
        return ResponseEntity.ok(ApiResponse.ok(user, "User status updated to " + user.getStatus()));
    }

    @PostMapping("/{id}/reset-password")
    public ResponseEntity<ApiResponse<User>> resetPassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User adminUser) {
        String newPassword = body.get("newPassword");
        User user = userService.resetUserPassword(id, newPassword, adminUser);
        return ResponseEntity.ok(ApiResponse.ok(user, "Password reset successfully for " + user.getUsername()));
    }
}
