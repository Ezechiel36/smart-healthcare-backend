package com.healthcare.appointment.dto;

import com.healthcare.appointment.model.AppointmentStatus;

public class UpdateAppointmentStatusRequest {
    private AppointmentStatus status;

    // Constructors
    public UpdateAppointmentStatusRequest() {}

    public UpdateAppointmentStatusRequest(AppointmentStatus status) {
        this.status = status;
    }

    // Getters and Setters
    public AppointmentStatus getStatus() {
        return status;
    }

    public void setStatus(AppointmentStatus status) {
        this.status = status;
    }
}
