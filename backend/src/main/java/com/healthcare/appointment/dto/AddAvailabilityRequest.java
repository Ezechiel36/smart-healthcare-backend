package com.healthcare.appointment.dto;

import java.time.LocalDateTime;

public class AddAvailabilityRequest {
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    // Constructors
    public AddAvailabilityRequest() {}

    public AddAvailabilityRequest(LocalDateTime startTime, LocalDateTime endTime) {
        this.startTime = startTime;
        this.endTime = endTime;
    }

    // Getters and Setters
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
}
