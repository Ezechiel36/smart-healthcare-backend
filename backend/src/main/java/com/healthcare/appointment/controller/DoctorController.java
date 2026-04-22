package com.healthcare.appointment.controller;

import com.healthcare.appointment.model.Doctor;
import com.healthcare.appointment.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(origins = "*")
public class DoctorController {

    @Autowired
    private DoctorRepository doctorRepository;

    /**
     * Get all doctors with their basic information
     * Only returns approved doctors
     *
     * @return List of doctors
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllDoctors() {
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
    }

    /**
     * Get doctor by ID
     *
     * @param id Doctor ID
     * @return Doctor details
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getDoctorById(@PathVariable Long id) {
        return doctorRepository.findById(id)
                .map(doctor -> ResponseEntity.ok(Map.<String, Object>of(
                        "doctorId", doctor.getDoctorId(),
                        "name", doctor.getUser().getName(),
                        "specialization", doctor.getSpecialization(),
                        "email", doctor.getUser().getEmail()
                )))
                .orElse(ResponseEntity.notFound().build());
    }
}
