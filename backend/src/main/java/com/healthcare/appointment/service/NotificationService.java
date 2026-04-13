package com.healthcare.appointment.service;

import com.healthcare.appointment.model.Appointment;
import com.healthcare.appointment.model.Notification;
import com.healthcare.appointment.model.User;
import com.healthcare.appointment.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private NotificationRepository notificationRepository;

    /**
     * Send a notification to a user about an appointment
     * Saves the notification to the database and logs a simulated email/SMS
     *
     * @param user The user to notify
     * @param appointment The appointment (can be null for general notifications)
     * @param message The notification message
     */
    public void sendNotification(User user, Appointment appointment, String message) {
        // Save notification to database
        Notification notification = new Notification(user, appointment, message);
        notificationRepository.save(notification);

        // Simulate sending email/SMS by logging
        String notificationType = determineNotificationType(user);
        String recipient = user.getEmail();

        logger.info("=== SIMULATED {} NOTIFICATION ===", notificationType.toUpperCase());
        logger.info("To: {} ({})", recipient, user.getName());
        logger.info("Subject/Appointment: {}", appointment != null ?
            "Appointment #" + appointment.getAppointmentId() : "General Notification");
        logger.info("Message: {}", message);
        logger.info("Timestamp: {}", notification.getTimestamp());
        logger.info("=====================================");
    }

    /**
     * Determine the notification type based on user role
     */
    private String determineNotificationType(User user) {
        switch (user.getRole()) {
            case PATIENT:
                return "EMAIL"; // Patients typically receive email notifications
            case DOCTOR:
                return "SMS";   // Doctors might prefer SMS for urgent appointment updates
            case ADMIN:
                return "EMAIL"; // Admins receive email notifications
            default:
                return "EMAIL";
        }
    }

    /**
     * Send appointment booking confirmation to both patient and doctor
     */
    public void sendAppointmentBookingNotifications(Appointment appointment) {
        // Notify patient
        String patientMessage = String.format(
            "Your appointment with Dr. %s has been confirmed for %s to %s.",
            appointment.getDoctor().getUser().getName(),
            appointment.getSchedule().getStartTime(),
            appointment.getSchedule().getEndTime()
        );
        sendNotification(appointment.getPatient().getUser(), appointment, patientMessage);

        // Notify doctor
        String doctorMessage = String.format(
            "New appointment booked with patient %s for %s to %s.",
            appointment.getPatient().getUser().getName(),
            appointment.getSchedule().getStartTime(),
            appointment.getSchedule().getEndTime()
        );
        sendNotification(appointment.getDoctor().getUser(), appointment, doctorMessage);
    }

    /**
     * Send appointment cancellation notification to the other party
     */
    public void sendAppointmentCancellationNotification(Appointment appointment, User cancelingUser) {
        User recipient;
        String message;

        if (cancelingUser.getRole().toString().equals("PATIENT")) {
            // Patient canceled - notify doctor
            recipient = appointment.getDoctor().getUser();
            message = String.format(
                "Patient %s has canceled their appointment scheduled for %s to %s.",
                cancelingUser.getName(),
                appointment.getSchedule().getStartTime(),
                appointment.getSchedule().getEndTime()
            );
        } else {
            // Doctor or Admin canceled - notify patient
            recipient = appointment.getPatient().getUser();
            message = String.format(
                "Your appointment with Dr. %s scheduled for %s to %s has been canceled.",
                appointment.getDoctor().getUser().getName(),
                appointment.getSchedule().getStartTime(),
                appointment.getSchedule().getEndTime()
            );
        }

        sendNotification(recipient, appointment, message);
    }
}
