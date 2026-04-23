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
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserService userService;

    @GetMapping("/my-notifications")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(Authentication authentication) {
        try {
            String email = authentication.getName();
            User currentUser = userService.findByEmail(email);

            List<Notification> notifications = notificationRepository.findByUser_UserIdOrderByTimestampDesc(currentUser.getUserId());

            List<NotificationResponse> response = notifications.stream()
                    .map(notification -> new NotificationResponse(
                            notification.getNotificationId(),
                            currentUser.getUserId(),
                            currentUser.getName() != null ? currentUser.getName() : "Unknown",
                            notification.getAppointment() != null ? notification.getAppointment().getAppointmentId() : null,
                            notification.getMessage(),
                            notification.getTimestamp()
                    ))
                    .collect(Collectors.toList());

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(List.of(), HttpStatus.OK);
        }
    }

    @GetMapping("/count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Integer> getNotificationCount(Authentication authentication) {
        try {
            String email = authentication.getName();
            User currentUser = userService.findByEmail(email);

            int count = notificationRepository.findByUser_UserIdOrderByTimestampDesc(currentUser.getUserId()).size();

            return new ResponseEntity<>(count, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(0, HttpStatus.OK);
        }
    }
}
