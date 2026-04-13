package com.healthcare.appointment.dto;

public class LoginResponse {
    private String token;
    private String message;
    private Long userId;
    private String email;
    private String role;
    private String name;

    // Constructors
    public LoginResponse() {}

    public LoginResponse(String token, String message, Long userId, String email, String role) {
        this.token = token;
        this.message = message;
        this.userId = userId;
        this.email = email;
        this.role = role;
    }

    public LoginResponse(String token, String message, Long userId, String email, String role, String name) {
        this.token = token;
        this.message = message;
        this.userId = userId;
        this.email = email;
        this.role = role;
        this.name = name;
    }

    // Getters and Setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
