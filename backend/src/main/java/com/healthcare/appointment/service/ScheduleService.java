package com.healthcare.appointment.service;

import com.healthcare.appointment.dto.AddAvailabilityRequest;
import com.healthcare.appointment.dto.ScheduleResponse;
import com.healthcare.appointment.model.Doctor;
import com.healthcare.appointment.model.Schedule;
import com.healthcare.appointment.repository.DoctorRepository;
import com.healthcare.appointment.repository.ScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ScheduleService {

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Transactional
    public Schedule addAvailability(Long doctorId, AddAvailabilityRequest request) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));

        if (request.getStartTime() == null || request.getEndTime() == null) {
            throw new IllegalArgumentException("Start time and end time are required");
        }

        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        Schedule schedule = new Schedule(doctor, request.getStartTime(), request.getEndTime());
        return scheduleRepository.save(schedule);
    }

    @Transactional
    public Schedule updateAvailability(Long scheduleId, Long doctorId, AddAvailabilityRequest request) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("Schedule not found"));

        if (!schedule.getDoctor().getDoctorId().equals(doctorId)) {
            throw new IllegalArgumentException("Schedule does not belong to this doctor");
        }

        if (schedule.getIsBooked()) {
            throw new IllegalArgumentException("Cannot update a booked schedule");
        }

        if (request.getStartTime() == null || request.getEndTime() == null) {
            throw new IllegalArgumentException("Start time and end time are required");
        }

        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        schedule.setStartTime(request.getStartTime());
        schedule.setEndTime(request.getEndTime());
        return scheduleRepository.save(schedule);
    }

    @Transactional(readOnly = true)
    public List<ScheduleResponse> getAvailableSlots(Long doctorId) {
        List<Schedule> schedules = scheduleRepository.findByDoctor_DoctorIdAndIsBookedFalseOrderByStartTimeAsc(doctorId);
        return schedules.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ScheduleResponse> getDoctorSchedules(Long doctorId) {
        List<Schedule> schedules = scheduleRepository.findByDoctor_DoctorIdOrderByStartTimeAsc(doctorId);
        return schedules.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteAvailability(Long scheduleId, Long doctorId) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("Schedule not found"));

        if (!schedule.getDoctor().getDoctorId().equals(doctorId)) {
            throw new IllegalArgumentException("Schedule does not belong to this doctor");
        }

        if (schedule.getIsBooked()) {
            throw new IllegalArgumentException("Cannot delete a booked schedule");
        }

        scheduleRepository.delete(schedule);
    }

    private ScheduleResponse mapToResponse(Schedule schedule) {
        Doctor doctor = schedule.getDoctor();
        String doctorName = doctor.getUser() != null ? doctor.getUser().getName() : "Unknown";
        String specialization = doctor.getSpecialization() != null ? doctor.getSpecialization() : "General";
        return new ScheduleResponse(
                schedule.getScheduleId(),
                doctor.getDoctorId(),
                doctorName,
                specialization,
                schedule.getStartTime(),
                schedule.getEndTime(),
                schedule.getIsBooked()
        );
    }
}
