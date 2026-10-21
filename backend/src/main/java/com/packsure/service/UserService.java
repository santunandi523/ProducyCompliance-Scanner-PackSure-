package com.packsure.service;

import com.packsure.model.User;
import com.packsure.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuditService auditService;

    public List<User> listUsers() {
        return userRepository.findAll();
    }

    public User createUser(String fullName, String username, String email, String password, String role, String location, User adminUser) {
        if (userRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("Username '" + username + "' is already taken.");
        }

        String encodedPassword = passwordEncoder.encode(password != null ? password : "Officer@123");
        User user = new User(username, encodedPassword, fullName, email, role != null ? role : "ROLE_OFFICER", location != null ? location : "Delhi Zone");
        user.setStatus("ACTIVE");
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
