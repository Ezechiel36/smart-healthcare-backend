package com.healthcare.appointment.dto;

import java.time.LocalDateTime;

public class NotificationResponse {

    private Long notificationId;
    private Long userId;
    private String userName;
    private Long appointmentId;
    private String message;
    private LocalDateTime timestamp;

    // Constructors
    public NotificationResponse() {}

    public NotificationResponse(Long notificationId, Long userId, String userName,
                               Long appointmentId, String message, LocalDateTime timestamp) {
        this.notificationId = notificationId;
        this.userId = userId;
        this.userName = userName;
        this.appointmentId = appointmentId;
        this.message = message;
        this.timestamp = timestamp;
    }

    // Getters and Setters
    public Long getNotificationId() {
        return notificationId;
    }

    public void setNotificationId(Long notificationId) {
        this.notificationId = notificationId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public Long getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(Long appointmentId) {
        this.appointmentId = appointmentId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
