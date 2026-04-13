package com.healthcare.appointment.service;

import com.healthcare.appointment.dto.AddAvailabilityRequest;
import com.healthcare.appointment.dto.ScheduleResponse;
import com.healthcare.appointment.exception.ResourceNotFoundException;
import com.healthcare.appointment.model.Doctor;
import com.healthcare.appointment.model.Schedule;
import com.healthcare.appointment.repository.DoctorRepository;
import com.healthcare.appointment.repository.ScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ScheduleService {

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    /**
     * Add availability for a doctor
     * Validates that endTime is after startTime and checks for overlapping schedules
     *
     * @param doctorId Doctor ID
     * @param request Availability request with start and end times
     * @return Created schedule
     */
    @Transactional
    public Schedule addAvailability(Long doctorId, AddAvailabilityRequest request) {
        // Validate that doctor exists
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + doctorId));

        // Validate time constraints
        if (request.getStartTime() == null || request.getEndTime() == null) {
            throw new IllegalArgumentException("Start time and end time are required");
        }

        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        // Check for overlapping schedules
        long overlappingCount = scheduleRepository.countOverlappingSchedules(
                doctorId, request.getStartTime(), request.getEndTime(), -1L);

        if (overlappingCount > 0) {
            throw new IllegalArgumentException("Time slot overlaps with existing availability");
        }

        // Create and save new schedule
        Schedule schedule = new Schedule(doctor, request.getStartTime(), request.getEndTime());
        return scheduleRepository.save(schedule);
    }

    /**
     * Get all available (unbooked) slots for a doctor
     *
     * @param doctorId Doctor ID
     * @return List of available schedule responses
     */
    public List<ScheduleResponse> getAvailableSlots(Long doctorId) {
        // Validate that doctor exists
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + doctorId));

        List<Schedule> schedules = scheduleRepository.findByDoctor_DoctorIdAndIsBookedFalseOrderByStartTimeAsc(doctorId);

        return schedules.stream()
                .map(schedule -> new ScheduleResponse(
                        schedule.getScheduleId(),
                        doctor.getDoctorId(),
                        doctor.getUser().getName(),
                        doctor.getSpecialization(),
                        schedule.getStartTime(),
                        schedule.getEndTime(),
                        schedule.getIsBooked()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Delete availability slot for a doctor (only if not booked)
     *
     * @param scheduleId Schedule ID
     * @param doctorId Doctor ID (for authorization)
     */
    @Transactional
    public void deleteAvailability(Long scheduleId, Long doctorId) {
        // Find the schedule
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with ID: " + scheduleId));

        // Verify the schedule belongs to the doctor
        if (!schedule.getDoctor().getDoctorId().equals(doctorId)) {
            throw new IllegalArgumentException("Schedule does not belong to the specified doctor");
        }

        // Check if the schedule is already booked
        if (schedule.getIsBooked()) {
            throw new IllegalArgumentException("Cannot delete a booked schedule");
        }

        // Delete the schedule
        scheduleRepository.delete(schedule);
    }

    /**
     * Get all schedules for a doctor (for doctor's own view)
     *
     * @param doctorId Doctor ID
     * @return List of all schedule responses for the doctor
     */
    public List<ScheduleResponse> getDoctorSchedules(Long doctorId) {
        // Validate that doctor exists
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + doctorId));

        List<Schedule> schedules = scheduleRepository.findByDoctor_DoctorIdOrderByStartTimeAsc(doctorId);

        return schedules.stream()
                .map(schedule -> new ScheduleResponse(
                        schedule.getScheduleId(),
                        doctor.getDoctorId(),
                        doctor.getUser().getName(),
                        doctor.getSpecialization(),
                        schedule.getStartTime(),
                        schedule.getEndTime(),
                        schedule.getIsBooked()
                ))
                .collect(Collectors.toList());
    }
}
