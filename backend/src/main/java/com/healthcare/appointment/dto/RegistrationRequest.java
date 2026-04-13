package com.healthcare.appointment.dto;

import com.healthcare.appointment.model.UserRole;

public class RegistrationRequest {
    private String name;
    private String email;
    private String password;
    private UserRole role;
    private String specialization;  // Only for DOCTOR role

    // Constructors
    public RegistrationRequest() {}

    public RegistrationRequest(String name, String email, String password, UserRole role, String specialization) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.specialization = specialization;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }
}

