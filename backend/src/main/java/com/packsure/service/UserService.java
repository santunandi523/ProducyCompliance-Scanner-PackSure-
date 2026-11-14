package com.packsure.service;

import com.packsure.model.User;
import com.packsure.repository.InspectionRepository;
import com.packsure.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InspectionRepository inspectionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuditService auditService;

    public List<User> listUsers() {
        return userRepository.findAll();
    }

    public List<Map<String, Object>> listUsersWithWorkStats() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (User u : users) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("username", u.getUsername());
            map.put("fullName", u.getFullName());
            map.put("name", u.getFullName());
            map.put("email", u.getEmail());
            map.put("role", u.getRole());
            map.put("status", u.getStatus() != null ? u.getStatus() : "ACTIVE");
            map.put("location", u.getLocation());
            map.put("employeeId", u.getEmployeeId());
            map.put("createdAt", u.getCreatedAt());

            long totalScans = inspectionRepository.countByUserId(u.getId());
            long compliantScans = inspectionRepository.countByUserIdAndFinalStatus(u.getId(), "COMPLIANT");
            long violationScans = inspectionRepository.countByUserIdAndFinalStatus(u.getId(), "POTENTIAL_NON_COMPLIANCE");
            long reviewScans = inspectionRepository.countByUserIdAndFinalStatus(u.getId(), "NEEDS_FURTHER_REVIEW");

            map.put("totalScans", totalScans);
            map.put("compliantScans", compliantScans);
            map.put("violationScans", violationScans);
            map.put("reviewScans", reviewScans);
            map.put("complianceRate", totalScans > 0 ? Math.round(((double) compliantScans / totalScans) * 100) : 100);

            result.add(map);
        }
        return result;
    }

    public Map<String, Object> getUserProfileWithStats(User user) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("username", user.getUsername());
        map.put("fullName", user.getFullName());
        map.put("name", user.getFullName());
        map.put("email", user.getEmail());
        map.put("role", user.getRole());
        map.put("status", user.getStatus() != null ? user.getStatus() : "ACTIVE");
        map.put("location", user.getLocation());
        map.put("employeeId", user.getEmployeeId());
        map.put("department", "Legal Metrology Department");
        map.put("phone", "+91 11 2338 9000");

        long totalScans = inspectionRepository.countByUserId(user.getId());
        long compliantScans = inspectionRepository.countByUserIdAndFinalStatus(user.getId(), "COMPLIANT");
        long violationScans = inspectionRepository.countByUserIdAndFinalStatus(user.getId(), "POTENTIAL_NON_COMPLIANCE");
        long reviewScans = inspectionRepository.countByUserIdAndFinalStatus(user.getId(), "NEEDS_FURTHER_REVIEW");

        map.put("totalScans", totalScans);
        map.put("compliantScans", compliantScans);
        map.put("violationScans", violationScans);
        map.put("reviewScans", reviewScans);
        map.put("complianceRate", totalScans > 0 ? Math.round(((double) compliantScans / totalScans) * 100) : 100);

        return map;
    }

    public User createUser(String fullName, String username, String email, String password, String role, String location, String employeeId, User adminUser) {
        if (userRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("Username '" + username + "' is already taken.");
        }

        String encodedPassword = passwordEncoder.encode(password != null && !password.trim().isEmpty() ? password : "Officer@123");
        User user = new User(username, encodedPassword, fullName, email, role != null ? role : "ROLE_OFFICER", location != null ? location : "Enforcement Circle 1");
        user.setStatus("ACTIVE");
        user.setEmployeeId(employeeId != null && !employeeId.trim().isEmpty() ? employeeId : "LM-OFF-" + String.format("%04d", (int)(Math.random() * 9000) + 1000));
        user = userRepository.save(user);

        auditService.log(adminUser != null ? adminUser.getId() : null, adminUser != null ? adminUser.getUsername() : "system",
                "CREATE_OFFICER", "User", user.getId(), "Created officer " + username + " (" + fullName + ")", null);

        return user;
    }

    public User updateUser(Long userId, String fullName, String email, String role, String location, User adminUser) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (fullName != null) user.setFullName(fullName);
        if (email != null) user.setEmail(email);
        if (role != null) user.setRole(role);
        if (location != null) user.setLocation(location);

        user = userRepository.save(user);

        auditService.log(adminUser != null ? adminUser.getId() : null, adminUser != null ? adminUser.getUsername() : "system",
                "UPDATE_OFFICER", "User", user.getId(), "Updated officer details for " + user.getUsername(), null);

        return user;
    }

    public User changeUserStatus(Long userId, String status, User adminUser) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        user.setStatus(status != null ? status.toUpperCase() : "ACTIVE");
        user = userRepository.save(user);

        auditService.log(adminUser != null ? adminUser.getId() : null, adminUser != null ? adminUser.getUsername() : "system",
                "CHANGE_USER_STATUS", "User", user.getId(), "Status changed to " + user.getStatus() + " for " + user.getUsername(), null);

        return user;
    }

    public User resetUserPassword(Long userId, String newPassword, User adminUser) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (newPassword == null || newPassword.trim().length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters long.");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user = userRepository.save(user);

        auditService.log(adminUser != null ? adminUser.getId() : null, adminUser != null ? adminUser.getUsername() : "system",
                "RESET_PASSWORD", "User", user.getId(), "Admin reset password for officer " + user.getUsername(), null);

        return user;
    }

    public void changeSelfPassword(User user, String currentPassword, String newPassword) {
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new RuntimeException("Current password does not match.");
        }
        if (newPassword == null || newPassword.trim().length() < 6) {
            throw new RuntimeException("New password must be at least 6 characters long.");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        auditService.log(user.getId(), user.getUsername(), "CHANGE_SELF_PASSWORD", "User", user.getId(), "User changed own password", null);
    }
}
