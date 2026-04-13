package com.healthcare.appointment.dto;

import java.time.LocalDateTime;

public class ScheduleResponse {
    private Long scheduleId;
    private Long doctorId;
    private String doctorName;
    private String specialization;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Boolean isBooked;

    // Constructors
    public ScheduleResponse() {}

    public ScheduleResponse(Long scheduleId, Long doctorId, String doctorName, String specialization,
                           LocalDateTime startTime, LocalDateTime endTime, Boolean isBooked) {
        this.scheduleId = scheduleId;
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.specialization = specialization;
        this.startTime = startTime;
        this.endTime = endTime;
        this.isBooked = isBooked;
    }

    // Getters and Setters
    public Long getScheduleId() {
        return scheduleId;
    }

    public void setScheduleId(Long scheduleId) {
        this.scheduleId = scheduleId;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public Boolean getIsBooked() {
        return isBooked;
    }

    public void setIsBooked(Boolean isBooked) {
        this.isBooked = isBooked;
    }
}
