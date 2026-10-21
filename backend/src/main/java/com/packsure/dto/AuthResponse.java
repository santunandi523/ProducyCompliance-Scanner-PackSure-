package com.packsure.dto;

import com.packsure.model.User;

public class AuthResponse {
    private String token;
    private UserDto user;

    public AuthResponse() {}

    public AuthResponse(String token, User user) {
        this.token = token;
        this.user = new UserDto(user.getId(), user.getUsername(), user.getFullName(), user.getRole(), user.getEmployeeId(), user.getLocation());
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public UserDto getUser() { return user; }
    public void setUser(UserDto user) { this.user = user; }

    public static class UserDto {
        private Long id;
        private String username;
        private String fullName;
        private String role;
        private String employeeId;
        private String location;

        public UserDto(Long id, String username, String fullName, String role, String employeeId, String location) {
            this.id = id;
            this.username = username;
            this.fullName = fullName;
            this.role = role;
            this.employeeId = employeeId;
            this.location = location;
        }

        public Long getId() { return id; }
        public String getUsername() { return username; }
        public String getFullName() { return fullName; }
        public String getRole() { return role; }
        public String getEmployeeId() { return employeeId; }
        public String getLocation() { return location; }
    }
}
