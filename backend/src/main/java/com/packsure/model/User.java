package com.packsure.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String username;

    @Column(nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private String password;

    @Column(nullable = false, length = 150)
    private String fullName;

    @Column(length = 150)
    private String email;

    @Column(nullable = false, length = 50)
    private String role; // ROLE_OFFICER, ROLE_SUPERVISOR, ROLE_ADMIN

    @Column(length = 50)
    private String status = "ACTIVE"; // ACTIVE, INACTIVE

    @Column(length = 50)
    private String employeeId;

    @Column(length = 150)
    private String location;

    private LocalDateTime createdAt = LocalDateTime.now();

    public User() {}

    public User(String username, String password, String fullName, String role, String employeeId, String location) {
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.role = role;
        this.employeeId = employeeId;
        this.location = location;
        this.status = "ACTIVE";
        this.createdAt = LocalDateTime.now();
    }

    public User(String username, String password, String fullName, String email, String role, String location, String status) {
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.location = location;
        this.status = status != null ? status : "ACTIVE";
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getPasswordHash() { return password; }
    public void setPasswordHash(String passwordHash) { this.password = passwordHash; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
