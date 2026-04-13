package com.healthcare.appointment.dto;

public class BookAppointmentRequest {
    private Long doctorId;
    private Long scheduleId;

    // Constructors
    public BookAppointmentRequest() {}

    public BookAppointmentRequest(Long doctorId, Long scheduleId) {
        this.doctorId = doctorId;
        this.scheduleId = scheduleId;
    }

    // Getters and Setters
    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public Long getScheduleId() {
        return scheduleId;
    }

    public void setScheduleId(Long scheduleId) {
        this.scheduleId = scheduleId;
    }
}
