package com.healthcare.appointment.repository;

import com.healthcare.appointment.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    /**
     * Find all appointments for a specific patient
     */
    List<Appointment> findByPatient_PatientIdOrderByCreatedAtDesc(Long patientId);

    /**
     * Find all appointments for a specific doctor
     */
    List<Appointment> findByDoctor_DoctorIdOrderByCreatedAtDesc(Long doctorId);

    /**
     * Find appointments by schedule ID
     */
    List<Appointment> findBySchedule_ScheduleId(Long scheduleId);

    /**
     * Check if a schedule already has an appointment
     */
    boolean existsBySchedule_ScheduleId(Long scheduleId);

    /**
     * Count appointments by status
     */
    long countByStatus(com.healthcare.appointment.model.AppointmentStatus status);
}
