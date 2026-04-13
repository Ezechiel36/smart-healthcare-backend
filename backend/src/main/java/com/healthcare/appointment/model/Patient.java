package com.healthcare.appointment.model;

import jakarta.persistence.*;

@Entity
@Table(name = "patients")
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long patientId;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = true, columnDefinition = "TEXT")
    private String medicalHistory;

    // Constructors
    public Patient() {}

    public Patient(User user, String medicalHistory) {
        this.user = user;
        this.medicalHistory = medicalHistory;
    }

    // Getters and Setters
    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getMedicalHistory() {
        return medicalHistory;
    }

    public void setMedicalHistory(String medicalHistory) {
        this.medicalHistory = medicalHistory;
    }

    @Override
    public String toString() {
        return "Patient{" +
                "patientId=" + patientId +
                ", user=" + user +
                ", medicalHistory='" + medicalHistory + '\'' +
                '}';
    }
}

