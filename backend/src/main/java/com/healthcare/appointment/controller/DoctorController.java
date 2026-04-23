package com.healthcare.appointment.controller;

import com.healthcare.appointment.model.Doctor;
import com.healthcare.appointment.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private static final Logger logger = LoggerFactory.getLogger(DoctorController.class);

    @Autowired
    private DoctorRepository doctorRepository;

    /**
     * Get all doctors with their basic information
     * Only returns approved doctors
     *
     * @return List of doctors
     */
    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<?> getAllDoctors() {
        try {
            // Only show approved doctors to patients/authenticated users
            List<Doctor> doctors = doctorRepository.findByApproved(true);
            
            List<Map<String, Object>> response = doctors.stream()
                .filter(doctor -> doctor.getUser() != null)
                .map(doctor -> 
                    Map.<String, Object>of(
                        "doctorId", doctor.getDoctorId(),
                        "name", doctor.getUser().getName(),
                        "specialization", doctor.getSpecialization(),
                        "email", doctor.getUser().getEmail()
                    )
                ).collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching doctors: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get doctors");
            errorResponse.put("message", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get doctor by ID
     *
     * @param id Doctor ID
     * @return Doctor details
     */
    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getDoctorById(@PathVariable Long id) {
        try {
            return doctorRepository.findById(id)
                    .map(doctor -> ResponseEntity.ok(Map.<String, Object>of(
                            "doctorId", doctor.getDoctorId(),
                            "name", doctor.getUser().getName(),
                            "specialization", doctor.getSpecialization(),
                            "email", doctor.getUser().getEmail()
                    )))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            logger.error("Error fetching doctor by ID: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get doctor");
            errorResponse.put("message", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
