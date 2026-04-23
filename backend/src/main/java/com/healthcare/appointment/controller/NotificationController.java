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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private static final Logger logger = LoggerFactory.getLogger(NotificationController.class);

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
    @Transactional(readOnly = true)
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

        } catch (com.healthcare.appointment.exception.ResourceNotFoundException e) {
            logger.warn("Authenticated user not found while getting notifications", e);
            return new ResponseEntity<>(List.of(), HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting notifications: ", e);
            return new ResponseEntity<>(List.of(), HttpStatus.OK);
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

        } catch (com.healthcare.appointment.exception.ResourceNotFoundException e) {
            logger.warn("Authenticated user not found while getting notification count", e);
            return new ResponseEntity<>(0, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting notification count: ", e);
            return new ResponseEntity<>(0, HttpStatus.OK);
        }
    }
}
