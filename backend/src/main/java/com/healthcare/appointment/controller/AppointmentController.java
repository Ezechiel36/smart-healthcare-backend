package com.healthcare.appointment.controller;

import com.healthcare.appointment.dto.AppointmentResponse;
import com.healthcare.appointment.dto.BookAppointmentRequest;
import com.healthcare.appointment.dto.UpdateAppointmentStatusRequest;
import com.healthcare.appointment.model.Appointment;
import com.healthcare.appointment.model.Doctor;
import com.healthcare.appointment.model.Patient;
import com.healthcare.appointment.model.User;
import com.healthcare.appointment.model.UserRole;
import com.healthcare.appointment.repository.DoctorRepository;
import com.healthcare.appointment.repository.PatientRepository;
import com.healthcare.appointment.service.AppointmentService;
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
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private UserService userService;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @PostMapping("/book")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Map<String, Object>> bookAppointment(@RequestBody BookAppointmentRequest request) {
        try {
            Long patientId = getCurrentPatientId();
            Appointment appointment = appointmentService.bookAppointment(patientId, request);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Appointment booked successfully");
            response.put("appointmentId", appointment.getAppointmentId());
            response.put("doctorName", appointment.getDoctor().getUser().getName());
            response.put("startTime", appointment.getSchedule().getStartTime());
            response.put("endTime", appointment.getSchedule().getEndTime());
            response.put("status", appointment.getStatus());

            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Booking Failed");
            errorResponse.put("message", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/my-appointments")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> getMyAppointments() {
        try {
            Long patientId = getCurrentPatientId();
            List<AppointmentResponse> appointments = appointmentService.getPatientAppointments(patientId);
            return new ResponseEntity<>(appointments, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(List.of(), HttpStatus.OK);
        }
    }

    @GetMapping("/doctor-appointments")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> getDoctorAppointments() {
        try {
            Long doctorId = getCurrentDoctorId();
            List<AppointmentResponse> appointments = appointmentService.getDoctorAppointments(doctorId);
            return new ResponseEntity<>(appointments, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(List.of(), HttpStatus.OK);
        }
    }

    @DeleteMapping("/{appointmentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> cancelAppointment(@PathVariable Long appointmentId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            User user = userService.findByEmail(email);

            appointmentService.cancelAppointment(appointmentId, getUserSpecificId(user), user.getRole().toString(), user);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Appointment cancelled successfully");
            response.put("appointmentId", appointmentId);

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Cancellation Failed");
            errorResponse.put("message", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{appointmentId}/status")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Map<String, Object>> updateAppointmentStatus(
            @PathVariable Long appointmentId,
            @RequestBody UpdateAppointmentStatusRequest request) {
        try {
            Long doctorId = getCurrentDoctorId();

            appointmentService.updateAppointmentStatus(appointmentId, doctorId, request);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Appointment status updated successfully");
            response.put("appointmentId", appointmentId);
            response.put("newStatus", request.getStatus());

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Status Update Failed");
            errorResponse.put("message", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }
    }

    private Long getCurrentPatientId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userService.findByEmail(email);

        if (user.getRole() != UserRole.PATIENT) {
            throw new IllegalArgumentException("Current user is not a patient");
        }

        Patient patient = patientRepository.findByUser_UserId(user.getUserId())
                .orElseGet(() -> {
                    Patient newPatient = new Patient();
                    newPatient.setUser(user);
                    newPatient.setMedicalHistory(null);
                    return patientRepository.save(newPatient);
                });

        return patient.getPatientId();
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

    private Long getUserSpecificId(User user) {
        if (user.getRole() == UserRole.PATIENT) {
            Patient patient = patientRepository.findByUser_UserId(user.getUserId())
                    .orElseGet(() -> {
                        Patient newPatient = new Patient();
                        newPatient.setUser(user);
                        newPatient.setMedicalHistory(null);
                        return patientRepository.save(newPatient);
                    });
            return patient.getPatientId();
        } else if (user.getRole() == UserRole.DOCTOR) {
            Doctor doctor = doctorRepository.findByUser_UserId(user.getUserId())
                    .orElseGet(() -> {
                        Doctor newDoctor = new Doctor();
                        newDoctor.setUser(user);
                        newDoctor.setSpecialization("General");
                        return doctorRepository.save(newDoctor);
                    });
            return doctor.getDoctorId();
        } else if (user.getRole() == UserRole.ADMIN) {
            return user.getUserId();
        }
        throw new IllegalArgumentException("Invalid user role");
    }
}
