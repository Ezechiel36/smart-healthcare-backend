package com.healthcare.appointment.service;

import com.healthcare.appointment.dto.AddAvailabilityRequest;
import com.healthcare.appointment.exception.ResourceNotFoundException;
import com.healthcare.appointment.model.Doctor;
import com.healthcare.appointment.model.Schedule;
import com.healthcare.appointment.model.User;
import com.healthcare.appointment.repository.DoctorRepository;
import com.healthcare.appointment.repository.ScheduleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ScheduleServiceTest {

    @Mock
    private ScheduleRepository scheduleRepository;

    @Mock
    private DoctorRepository doctorRepository;

    @InjectMocks
    private ScheduleService scheduleService;

    private Doctor doctor;
    private User doctorUser;

    @BeforeEach
    void setUp() {
        doctorUser = new User();
        doctorUser.setUserId(1L);
        doctorUser.setName("Dr. Smith");

        doctor = new Doctor();
        doctor.setDoctorId(1L);
        doctor.setUser(doctorUser);
    }

    @Test
    void addAvailability_Success() {
        AddAvailabilityRequest request = new AddAvailabilityRequest();
        request.setStartTime(LocalDateTime.now().plusDays(1).withHour(9).withMinute(0));
        request.setEndTime(LocalDateTime.now().plusDays(1).withHour(10).withMinute(0));

        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));
        when(scheduleRepository.countOverlappingSchedules(eq(1L), any(), any(), any())).thenReturn(0L);

        Schedule savedSchedule = new Schedule(doctor, request.getStartTime(), request.getEndTime());
        when(scheduleRepository.save(any(Schedule.class))).thenReturn(savedSchedule);

        Schedule result = scheduleService.addAvailability(1L, request);

        assertNotNull(result);
        assertEquals(request.getStartTime(), result.getStartTime());
        assertEquals(request.getEndTime(), result.getEndTime());
        
        verify(scheduleRepository, times(1)).save(any(Schedule.class));
    }

    @Test
    void addAvailability_ThrowsException_WhenEndTimeBeforeStartTime() {
        AddAvailabilityRequest request = new AddAvailabilityRequest();
        request.setStartTime(LocalDateTime.now().plusDays(1).withHour(10).withMinute(0));
        request.setEndTime(LocalDateTime.now().plusDays(1).withHour(9).withMinute(0)); // End time is before start time

        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            scheduleService.addAvailability(1L, request);
        });
        
        assertEquals("End time must be after start time", exception.getMessage());
        verify(scheduleRepository, never()).save(any(Schedule.class));
    }

    @Test
    void addAvailability_ThrowsException_WhenOverlappingScheduleExists() {
        AddAvailabilityRequest request = new AddAvailabilityRequest();
        request.setStartTime(LocalDateTime.now().plusDays(1).withHour(9).withMinute(0));
        request.setEndTime(LocalDateTime.now().plusDays(1).withHour(10).withMinute(0));

        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));
        when(scheduleRepository.countOverlappingSchedules(eq(1L), any(), any(), any())).thenReturn(1L);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            scheduleService.addAvailability(1L, request);
        });

        assertEquals("Time slot overlaps with existing availability", exception.getMessage());
        verify(scheduleRepository, never()).save(any(Schedule.class));
    }

    @Test
    void deleteAvailability_Success() {
        Schedule schedule = new Schedule();
        schedule.setScheduleId(1L);
        schedule.setDoctor(doctor);
        schedule.setIsBooked(false);

        when(scheduleRepository.findById(1L)).thenReturn(Optional.of(schedule));

        scheduleService.deleteAvailability(1L, 1L);

        verify(scheduleRepository, times(1)).delete(schedule);
    }

    @Test
    void deleteAvailability_ThrowsException_WhenAlreadyBooked() {
        Schedule schedule = new Schedule();
        schedule.setScheduleId(1L);
        schedule.setDoctor(doctor);
        schedule.setIsBooked(true);

        when(scheduleRepository.findById(1L)).thenReturn(Optional.of(schedule));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            scheduleService.deleteAvailability(1L, 1L);
        });

        assertEquals("Cannot delete a booked schedule", exception.getMessage());
        verify(scheduleRepository, never()).delete(any(Schedule.class));
    }
}
