package com.healthcare.appointment.service;

import com.healthcare.appointment.dto.RegistrationRequest;
import com.healthcare.appointment.exception.ResourceNotFoundException;
import com.healthcare.appointment.model.Doctor;
import com.healthcare.appointment.model.Patient;
import com.healthcare.appointment.model.User;
import com.healthcare.appointment.model.UserRole;
import com.healthcare.appointment.repository.DoctorRepository;
import com.healthcare.appointment.repository.PatientRepository;
import com.healthcare.appointment.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Register a new user with automatic creation of related Patient or Doctor records.
     *
     * Constraint: When registering PATIENT role, a User and Patient record are created.
     *            When registering DOCTOR role, a User and Doctor record are created.
     *            ADMIN role creates only a User record.
     *
     * @param registrationRequest Registration details
     * @return Created User entity
     * @throws IllegalArgumentException if email already exists
     */
    @Transactional
    public User registerUser(RegistrationRequest registrationRequest) {
        // Validate required fields
        if (registrationRequest.getName() == null || registrationRequest.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Name is required");
        }
        if (registrationRequest.getEmail() == null || registrationRequest.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (registrationRequest.getPassword() == null || registrationRequest.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("Password is required");
        }
        if (registrationRequest.getRole() == null) {
            throw new IllegalArgumentException("Role is required");
        }

        // Check for duplicate email
        if (userRepository.existsByEmail(registrationRequest.getEmail())) {
            throw new IllegalArgumentException("Email already registered: " + registrationRequest.getEmail());
        }

        // Create and save User entity
        User user = new User();
        user.setName(registrationRequest.getName().trim());
        user.setEmail(registrationRequest.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));
        user.setRole(registrationRequest.getRole());

        User savedUser = userRepository.save(user);

        // Create related records based on role
        if (registrationRequest.getRole() == UserRole.PATIENT) {
            Patient patient = new Patient();
            patient.setUser(savedUser);
            patient.setMedicalHistory(null);  // Will be filled later
            patientRepository.save(patient);
        } else if (registrationRequest.getRole() == UserRole.DOCTOR) {
            // Validate that specialization is provided for doctors
            if (registrationRequest.getSpecialization() == null || registrationRequest.getSpecialization().trim().isEmpty()) {
                throw new IllegalArgumentException("Specialization is required for doctor registration");
            }

            Doctor doctor = new Doctor();
            doctor.setUser(savedUser);
            doctor.setSpecialization(registrationRequest.getSpecialization().trim());
            doctorRepository.save(doctor);
        }
        // For ADMIN role, only User record is created

        return savedUser;
    }

    /**
     * Find a user by email
     *
     * @param email User email
     * @return User entity
     * @throws ResourceNotFoundException if user not found
     */
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    /**
     * Find a user by userId
     *
     * @param userId User ID
     * @return User entity
     * @throws ResourceNotFoundException if user not found
     */
    public User findById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
    }

    /**
     * Check if password matches for a user
     *
     * @param rawPassword Raw password provided
     * @param encodedPassword Encoded password from database
     * @return true if password matches
     */
    public boolean validatePassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }
}
