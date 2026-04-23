package com.healthcare.appointment.controller;

import com.healthcare.appointment.dto.AddAvailabilityRequest;
import com.healthcare.appointment.dto.ScheduleResponse;
import com.healthcare.appointment.model.Doctor;
import com.healthcare.appointment.model.Schedule;
import com.healthcare.appointment.model.User;
import com.healthcare.appointment.model.UserRole;
import com.healthcare.appointment.repository.DoctorRepository;
import com.healthcare.appointment.service.ScheduleService;
import com.healthcare.appointment.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    private static final Logger logger = LoggerFactory.getLogger(ScheduleController.class);

    @Autowired
    private ScheduleService scheduleService;

    @Autowired
    private UserService userService;

    @Autowired
    private DoctorRepository doctorRepository;

    /**
     * Add availability for the currently logged-in doctor
     * Only DOCTOR role can access this endpoint
     */
    @PostMapping("/availability")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Map<String, Object>> addAvailability(@RequestBody AddAvailabilityRequest request) {
        try {
            Long doctorId = getCurrentDoctorId();

            Schedule schedule = scheduleService.addAvailability(doctorId, request);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Availability added successfully");
            response.put("scheduleId", schedule.getScheduleId());
            response.put("startTime", schedule.getStartTime());
            response.put("endTime", schedule.getEndTime());

            return new ResponseEntity<>(response, HttpStatus.CREATED);

        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Validation Error");
            errorResponse.put("message", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            logger.error("Error adding availability: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Internal Server Error");
            errorResponse.put("message", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get available slots for a specific doctor
     * Any authenticated user can view availability
     */
    @GetMapping("/doctors/{doctorId}/available")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAvailableSlots(@PathVariable Long doctorId) {
        try {
            List<ScheduleResponse> availableSlots = scheduleService.getAvailableSlots(doctorId);
            return new ResponseEntity<>(availableSlots, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get available slots");
            errorResponse.put("message", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get all schedules for the currently logged-in doctor
     * Only DOCTOR role can access this endpoint
     */
    @GetMapping("/my-schedules")
    @PreAuthorize("hasRole('DOCTOR')")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getMySchedules() {
        try {
            Long doctorId = getCurrentDoctorId();
            List<ScheduleResponse> schedules = scheduleService.getDoctorSchedules(doctorId);
            return new ResponseEntity<>(schedules, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            logger.error("Validation error fetching schedules: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Validation Error");
            errorResponse.put("message", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            logger.error("Error fetching doctor schedules: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get schedules");
            errorResponse.put("message", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Delete availability slot
     * Only DOCTOR role can delete their own availability
     */
    @DeleteMapping("/{scheduleId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Map<String, Object>> deleteAvailability(@PathVariable Long scheduleId) {
        try {
            Long doctorId = getCurrentDoctorId();

            scheduleService.deleteAvailability(scheduleId, doctorId);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Availability deleted successfully");
            response.put("scheduleId", scheduleId);

            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Validation Error");
            errorResponse.put("message", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            logger.error("Error deleting availability: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Internal Server Error");
            errorResponse.put("message", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Helper method to get the current doctor's ID from security context
     */
    private Long getCurrentDoctorId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userService.findByEmail(email);

        // Verify user is a doctor
        if (user.getRole() != UserRole.DOCTOR) {
            throw new IllegalArgumentException("Current user is not a doctor");
        }

        // Find doctor record, create if missing
        Doctor doctor = doctorRepository.findByUser_UserId(user.getUserId())
                .orElseGet(() -> {
                    Doctor newDoctor = new Doctor();
                    newDoctor.setUser(user);
                    newDoctor.setSpecialization("General"); // Default specialization
                    return doctorRepository.save(newDoctor);
                });

        return doctor.getDoctorId();
    }
}
