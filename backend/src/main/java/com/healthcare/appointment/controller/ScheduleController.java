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
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Internal Server Error");
            errorResponse.put("message", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{scheduleId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Map<String, Object>> updateAvailability(
            @PathVariable Long scheduleId,
            @RequestBody AddAvailabilityRequest request) {
        try {
            Long doctorId = getCurrentDoctorId();
            Schedule schedule = scheduleService.updateAvailability(scheduleId, doctorId, request);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Availability updated successfully");
            response.put("scheduleId", schedule.getScheduleId());
            response.put("startTime", schedule.getStartTime());
            response.put("endTime", schedule.getEndTime());

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Validation Error");
            errorResponse.put("message", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Internal Server Error");
            errorResponse.put("message", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/doctors/{doctorId}/available")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAvailableSlots(@PathVariable Long doctorId) {
        try {
            List<ScheduleResponse> availableSlots = scheduleService.getAvailableSlots(doctorId);
            return new ResponseEntity<>(availableSlots, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(List.of(), HttpStatus.OK);
        }
    }

    @GetMapping("/my-schedules")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> getMySchedules() {
        try {
            Long doctorId = getCurrentDoctorId();
            List<ScheduleResponse> schedules = scheduleService.getDoctorSchedules(doctorId);
            return new ResponseEntity<>(schedules, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(List.of(), HttpStatus.OK);
        }
    }

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
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Internal Server Error");
            errorResponse.put("message", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private Long getCurrentDoctorId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userService.findByEmail(email);

        if (user.getRole() != UserRole.DOCTOR) {
            throw new IllegalArgumentException("Current user is not a doctor");
        }

        Doctor doctor = doctorRepository.findByUser_UserId(user.getUserId())
                .orElseGet(() -> {
                    Doctor newDoctor = new Doctor();
                    newDoctor.setUser(user);
                    newDoctor.setSpecialization("General");
                    return doctorRepository.save(newDoctor);
                });

        return doctor.getDoctorId();
    }
}
