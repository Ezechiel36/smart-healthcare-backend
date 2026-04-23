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
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

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
    public ResponseEntity<List<ScheduleResponse>> getMySchedules() {
        Long doctorId = getCurrentDoctorId();
        List<ScheduleResponse> schedules = scheduleService.getDoctorSchedules(doctorId);
        return new ResponseEntity<>(schedules, HttpStatus.OK);
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

        // Find doctor record
        Doctor doctor = doctorRepository.findByUser_UserId(user.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Doctor record not found for current user"));

        return doctor.getDoctorId();
    }
}
