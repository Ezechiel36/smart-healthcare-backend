package com.healthcare.appointment.service;

import com.healthcare.appointment.dto.AppointmentResponse;
import com.healthcare.appointment.dto.BookAppointmentRequest;
import com.healthcare.appointment.dto.UpdateAppointmentStatusRequest;
import com.healthcare.appointment.exception.DoubleBookingException;
import com.healthcare.appointment.exception.ResourceNotFoundException;
import com.healthcare.appointment.model.*;
import com.healthcare.appointment.repository.AppointmentRepository;
import com.healthcare.appointment.repository.DoctorRepository;
import com.healthcare.appointment.repository.PatientRepository;
import com.healthcare.appointment.repository.ScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private NotificationService notificationService;

    /**
     * Book an appointment for a patient with a doctor at a specific schedule
     * This method is transactional to prevent race conditions
     *
     * @param patientId Patient ID
     * @param request Booking request with doctorId and scheduleId
     * @return Created appointment
     */
    @Transactional
    public Appointment bookAppointment(Long patientId, BookAppointmentRequest request) {
        // Validate that patient exists
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + patientId));

        // Validate that doctor exists
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + request.getDoctorId()));

        // Validate that schedule exists
        Schedule schedule = scheduleRepository.findById(request.getScheduleId())
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with ID: " + request.getScheduleId()));

        // Validate that schedule belongs to the doctor
        if (!schedule.getDoctor().getDoctorId().equals(request.getDoctorId())) {
            throw new IllegalArgumentException("Schedule does not belong to the specified doctor");
        }

        // Check if schedule is already booked (double-check in transaction)
        if (schedule.getIsBooked()) {
            throw new DoubleBookingException("This time slot is already booked");
        }

        // Check if there's already an appointment for this schedule
        if (appointmentRepository.existsBySchedule_ScheduleId(request.getScheduleId())) {
            throw new DoubleBookingException("This time slot is already booked");
        }

        // Create the appointment with PENDING status
        Appointment appointment = new Appointment(patient, doctor, schedule, AppointmentStatus.PENDING);
        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Mark the schedule as booked
        schedule.setIsBooked(true);
        scheduleRepository.save(schedule);

        // Send notifications to both patient and doctor
        notificationService.sendAppointmentBookingNotifications(savedAppointment);

        return savedAppointment;
    }

    /**
     * Cancel an appointment
     * Allows patient to cancel their own appointment, or doctor/admin to cancel it
     *
     * @param appointmentId Appointment ID
     * @param userId Current user ID
     * @param role Current user role
     * @param cancelingUser The user who is canceling (for notifications)
     */
    @Transactional
    public void cancelAppointment(Long appointmentId, Long userId, String role, User cancelingUser) {
        // Find the appointment
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + appointmentId));

        // Authorization check
        boolean isAuthorized = false;

        if ("PATIENT".equals(role)) {
            // Patient can only cancel their own appointments
            isAuthorized = appointment.getPatient().getPatientId().equals(userId);
        } else if ("DOCTOR".equals(role)) {
            // Doctor can cancel appointments with their patients
            isAuthorized = appointment.getDoctor().getDoctorId().equals(userId);
        } else if ("ADMIN".equals(role)) {
            // Admin can cancel any appointment
            isAuthorized = true;
        }

        if (!isAuthorized) {
            throw new IllegalArgumentException("You are not authorized to cancel this appointment");
        }

        // Update appointment status
        appointment.setStatus(AppointmentStatus.CANCELED);
        appointmentRepository.save(appointment);

        // Make the schedule available again
        Schedule schedule = appointment.getSchedule();
        schedule.setIsBooked(false);
        scheduleRepository.save(schedule);

        // Send notification to the other party
        notificationService.sendAppointmentCancellationNotification(appointment, cancelingUser);
    }

    /**
     * Get all appointments for a specific patient
     *
     * @param patientId Patient ID
     * @return List of appointment responses
     */
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getPatientAppointments(Long patientId) {
        return patientRepository.findById(patientId)
                .map(patient -> {
                    List<Appointment> appointments = appointmentRepository.findByPatient_PatientIdOrderByCreatedAtDesc(patientId);
                    return appointments.stream()
                            .filter(appointment -> appointment.getDoctor() != null)
                            .filter(appointment -> appointment.getDoctor().getUser() != null)
                            .filter(appointment -> appointment.getSchedule() != null)
                            .map(appointment -> new AppointmentResponse(
                                    appointment.getAppointmentId(),
                                    patient.getPatientId(),
                                    patient.getUser() != null ? patient.getUser().getName() : "Unknown",
                                    appointment.getDoctor().getDoctorId(),
                                    appointment.getDoctor().getUser().getName(),
                                    appointment.getDoctor().getSpecialization(),
                                    appointment.getSchedule().getScheduleId(),
                                    appointment.getSchedule().getStartTime(),
                                    appointment.getSchedule().getEndTime(),
                                    appointment.getStatus(),
                                    appointment.getCreatedAt(),
                                    appointment.getUpdatedAt()
                            ))
                            .collect(Collectors.toList());
                })
                .orElse(List.of());
    }

    /**
     * Get all appointments for a specific doctor
     *
     * @param doctorId Doctor ID
     * @return List of appointment responses
     */
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getDoctorAppointments(Long doctorId) {
        return doctorRepository.findById(doctorId)
                .map(doctor -> {
                    List<Appointment> appointments = appointmentRepository.findByDoctor_DoctorIdOrderByCreatedAtDesc(doctorId);
                    return appointments.stream()
                            .filter(appointment -> appointment.getPatient() != null)
                            .filter(appointment -> appointment.getPatient().getUser() != null)
                            .filter(appointment -> appointment.getSchedule() != null)
                            .map(appointment -> new AppointmentResponse(
                                    appointment.getAppointmentId(),
                                    appointment.getPatient().getPatientId(),
                                    appointment.getPatient().getUser().getName(),
                                    doctor.getDoctorId(),
                                    doctor.getUser() != null ? doctor.getUser().getName() : "Unknown",
                                    doctor.getSpecialization(),
                                    appointment.getSchedule().getScheduleId(),
                                    appointment.getSchedule().getStartTime(),
                                    appointment.getSchedule().getEndTime(),
                                    appointment.getStatus(),
                                    appointment.getCreatedAt(),
                                    appointment.getUpdatedAt()
                            ))
                            .collect(Collectors.toList());
                })
                .orElse(List.of());
    }

    /**
     * Update appointment status (Doctor only)
     * Allows doctor to approve (CONFIRMED), reject (REJECTED), complete (COMPLETED), or mark NO_SHOW
     *
     * @param appointmentId Appointment ID
     * @param doctorId Doctor ID (for authorization)
     * @param request Status update request
     */
    @Transactional
    public void updateAppointmentStatus(Long appointmentId, Long doctorId, UpdateAppointmentStatusRequest request) {
        // Find the appointment
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + appointmentId));

        // Verify the appointment belongs to the doctor
        if (!appointment.getDoctor().getDoctorId().equals(doctorId)) {
            throw new IllegalArgumentException("Appointment does not belong to the specified doctor");
        }

        // Validate the new status
        AppointmentStatus newStatus = request.getStatus();
        if (newStatus != AppointmentStatus.CONFIRMED && newStatus != AppointmentStatus.REJECTED &&
            newStatus != AppointmentStatus.COMPLETED && newStatus != AppointmentStatus.NO_SHOW) {
            throw new IllegalArgumentException("Invalid status. Doctor can only set status to CONFIRMED, REJECTED, COMPLETED, or NO_SHOW");
        }

        // Handle rejected appointments - make schedule available again
        if (newStatus == AppointmentStatus.REJECTED) {
            Schedule schedule = appointment.getSchedule();
            schedule.setIsBooked(false);
            scheduleRepository.save(schedule);
        }

        // Update the status
        appointment.setStatus(newStatus);
        appointmentRepository.save(appointment);
    }
}
