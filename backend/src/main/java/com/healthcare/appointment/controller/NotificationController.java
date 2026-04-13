package com.healthcare.appointment.controller;

import com.healthcare.appointment.dto.NotificationResponse;
import com.healthcare.appointment.model.Notification;
import com.healthcare.appointment.model.User;
import com.healthcare.appointment.repository.NotificationRepository;
import com.healthcare.appointment.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserService userService;

    /**
     * Get all notifications for the authenticated user
     * Accessible by all authenticated users (PATIENT, DOCTOR, ADMIN)
     *
     * @param authentication Current user authentication
     * @return List of user's notifications
     */
    @GetMapping("/my-notifications")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(Authentication authentication) {
        try {
            // Get current user
            String email = authentication.getName();
            User currentUser = userService.findByEmail(email);

            // Get notifications for the user
            List<Notification> notifications = notificationRepository.findByUser_UserIdOrderByTimestampDesc(currentUser.getUserId());

            // Convert to response DTOs
            List<NotificationResponse> response = notifications.stream()
                    .map(notification -> new NotificationResponse(
                            notification.getNotificationId(),
                            currentUser.getUserId(),
                            currentUser.getName(),
                            notification.getAppointment() != null ? notification.getAppointment().getAppointmentId() : null,
                            notification.getMessage(),
                            notification.getTimestamp()
                    ))
                    .collect(Collectors.toList());

            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get notification count for the authenticated user
     * Useful for displaying notification badges
     *
     * @param authentication Current user authentication
     * @return Number of unread notifications (all are considered unread for simplicity)
     */
    @GetMapping("/count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Integer> getNotificationCount(Authentication authentication) {
        try {
            // Get current user
            String email = authentication.getName();
            User currentUser = userService.findByEmail(email);

            // Get notification count
            int count = notificationRepository.findByUser_UserIdOrderByTimestampDesc(currentUser.getUserId()).size();

            return new ResponseEntity<>(count, HttpStatus.OK);

        } catch (Exception e) {
            return new ResponseEntity<>(0, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
