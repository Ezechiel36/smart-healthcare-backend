package com.healthcare.appointment.service;

import com.healthcare.appointment.exception.ResourceNotFoundException;
import com.healthcare.appointment.model.AppointmentStatus;
import com.healthcare.appointment.model.Doctor;
import com.healthcare.appointment.repository.AppointmentRepository;
import com.healthcare.appointment.repository.DoctorRepository;
import com.healthcare.appointment.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    /**
     * Get dashboard analytics data
     *
     * @return Map containing all dashboard metrics
     */
    public Map<String, Object> getDashboardAnalytics() {
        Map<String, Object> analytics = new HashMap<>();

        // Total registered patients
        long totalPatients = patientRepository.count();
        analytics.put("totalPatients", totalPatients);

        // Total registered doctors
        long totalDoctors = doctorRepository.count();
        analytics.put("totalDoctors", totalDoctors);

        // Total appointments and breakdown by status
        long totalAppointments = appointmentRepository.count();
        analytics.put("totalAppointments", totalAppointments);

        // Appointment status breakdown
        Map<String, Long> appointmentStatusBreakdown = new HashMap<>();
        appointmentStatusBreakdown.put("pending", appointmentRepository.countByStatus(AppointmentStatus.PENDING));
        appointmentStatusBreakdown.put("confirmed", appointmentRepository.countByStatus(AppointmentStatus.CONFIRMED));
        appointmentStatusBreakdown.put("canceled", appointmentRepository.countByStatus(AppointmentStatus.CANCELED));
        appointmentStatusBreakdown.put("completed", appointmentRepository.countByStatus(AppointmentStatus.COMPLETED));
        appointmentStatusBreakdown.put("noShow", appointmentRepository.countByStatus(AppointmentStatus.NO_SHOW));

        analytics.put("appointmentStatusBreakdown", appointmentStatusBreakdown);

        return analytics;
    }

    /**
     * Get total number of registered patients
     *
     * @return Total patient count
     */
    public long getTotalPatients() {
        return patientRepository.count();
    }

    /**
     * Get total number of registered doctors
     *
     * @return Total doctor count
     */
    public long getTotalDoctors() {
        return doctorRepository.count();
    }

    /**
     * Get total number of appointments
     *
     * @return Total appointment count
     */
    public long getTotalAppointments() {
        return appointmentRepository.count();
    }

    /**
     * Get appointment status breakdown
     *
     * @return Map with status counts
     */
    public Map<String, Long> getAppointmentStatusBreakdown() {
        Map<String, Long> breakdown = new HashMap<>();
        breakdown.put("pending", appointmentRepository.countByStatus(AppointmentStatus.PENDING));
        breakdown.put("confirmed", appointmentRepository.countByStatus(AppointmentStatus.CONFIRMED));
        breakdown.put("canceled", appointmentRepository.countByStatus(AppointmentStatus.CANCELED));
        breakdown.put("completed", appointmentRepository.countByStatus(AppointmentStatus.COMPLETED));
        breakdown.put("noShow", appointmentRepository.countByStatus(AppointmentStatus.NO_SHOW));
        return breakdown;
    }

    /**
     * Get all pending doctors (not yet approved)
     *
     * @return List of pending doctors
     */
    public List<Doctor> getPendingDoctors() {
        return doctorRepository.findByApproved(false);
    }

    /**
     * Update doctor approval status
     *
     * @param doctorId Doctor ID
     * @param approved Approval status
     * @return Updated Doctor
     */
    public Doctor updateDoctorApproval(Long doctorId, boolean approved) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + doctorId));
        doctor.setApproved(approved);
        return doctorRepository.save(doctor);
    }
}
