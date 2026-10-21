package com.packsure.controller;

import com.packsure.config.JwtUtils;
import com.packsure.dto.ApiResponse;
import com.packsure.dto.AuthResponse;
import com.packsure.dto.LoginRequest;
import com.packsure.model.User;
import com.packsure.repository.UserRepository;
import com.packsure.service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AuditService auditService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody LoginRequest req) {
        User user = userRepository.findByUsername(req.getUsername())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body(ApiResponse.error("AUTH_FAILED", "Invalid username or password"));
        }

        String token = jwtUtils.generateJwtToken(user.getUsername(), user.getRole(), user.getFullName());
        auditService.log(user.getId(), user.getUsername(), "LOGIN", "User", user.getId(), "User logged in", null);

        return ResponseEntity.ok(ApiResponse.ok(new AuthResponse(token, user), "Authentication successful"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse.UserDto>> getCurrentUser(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("UNAUTHORIZED", "User not authenticated"));
        }
        AuthResponse.UserDto dto = new AuthResponse.UserDto(
                user.getId(), user.getUsername(), user.getFullName(), user.getRole(), user.getEmployeeId(), user.getLocation()
        );
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @RequestBody java.util.Map<String, String> body,
            @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("UNAUTHORIZED", "User not authenticated"));
        }
        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");

        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("INVALID_PASSWORD", "Current password is incorrect"));
        }
        if (newPassword == null || newPassword.trim().length() < 6) {
            return ResponseEntity.badRequest().body(ApiResponse.error("INVALID_NEW_PASSWORD", "New password must be at least 6 characters"));
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        auditService.log(user.getId(), user.getUsername(), "CHANGE_SELF_PASSWORD", "User", user.getId(), "User changed own password", null);

        return ResponseEntity.ok(ApiResponse.ok("Password changed successfully"));
    }
}
