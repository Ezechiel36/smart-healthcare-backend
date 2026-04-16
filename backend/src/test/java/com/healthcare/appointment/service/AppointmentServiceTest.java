package com.healthcare.appointment.service;

import com.healthcare.appointment.dto.BookAppointmentRequest;
import com.healthcare.appointment.exception.DoubleBookingException;
import com.healthcare.appointment.exception.ResourceNotFoundException;
import com.healthcare.appointment.model.*;
import com.healthcare.appointment.repository.AppointmentRepository;
import com.healthcare.appointment.repository.DoctorRepository;
import com.healthcare.appointment.repository.PatientRepository;
import com.healthcare.appointment.repository.ScheduleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private ScheduleRepository scheduleRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private AppointmentService appointmentService;

    private Patient patient;
    private Doctor doctor;
    private Schedule schedule;
    private User patientUser;
    private User doctorUser;

    @BeforeEach
    void setUp() {
        patientUser = new User();
        patientUser.setUserId(1L);
        patientUser.setName("John Doe");

        doctorUser = new User();
        doctorUser.setUserId(2L);
        doctorUser.setName("Dr. Sarah");

        patient = new Patient();
        patient.setPatientId(1L);
        patient.setUser(patientUser);

        doctor = new Doctor();
        doctor.setDoctorId(1L);
        doctor.setUser(doctorUser);

        schedule = new Schedule();
        schedule.setScheduleId(1L);
        schedule.setDoctor(doctor);
        schedule.setIsBooked(false);
    }

    @Test
    void bookAppointment_Success() {
        BookAppointmentRequest request = new BookAppointmentRequest();
        request.setDoctorId(1L);
        request.setScheduleId(1L);

        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));
        when(scheduleRepository.findById(1L)).thenReturn(Optional.of(schedule));
        when(appointmentRepository.existsBySchedule_ScheduleId(1L)).thenReturn(false);

        Appointment savedAppointment = new Appointment(patient, doctor, schedule, AppointmentStatus.CONFIRMED);
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(savedAppointment);

        Appointment result = appointmentService.bookAppointment(1L, request);

        assertNotNull(result);
        assertEquals(AppointmentStatus.CONFIRMED, result.getStatus());
        assertTrue(schedule.getIsBooked());
        
        verify(appointmentRepository, times(1)).save(any(Appointment.class));
        verify(scheduleRepository, times(1)).save(schedule);
        verify(notificationService, times(1)).sendAppointmentBookingNotifications(any(Appointment.class));
    }

    @Test
    void bookAppointment_DoubleBookingException_WhenScheduleBooked() {
        schedule.setIsBooked(true);

        BookAppointmentRequest request = new BookAppointmentRequest();
        request.setDoctorId(1L);
        request.setScheduleId(1L);

        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));
        when(scheduleRepository.findById(1L)).thenReturn(Optional.of(schedule));

        assertThrows(DoubleBookingException.class, () -> appointmentService.bookAppointment(1L, request));
        
        verify(appointmentRepository, never()).save(any(Appointment.class));
    }

    @Test
    void bookAppointment_DoubleBookingException_WhenAppointmentExists() {
        BookAppointmentRequest request = new BookAppointmentRequest();
        request.setDoctorId(1L);
        request.setScheduleId(1L);

        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));
        when(scheduleRepository.findById(1L)).thenReturn(Optional.of(schedule));
        when(appointmentRepository.existsBySchedule_ScheduleId(1L)).thenReturn(true);

        assertThrows(DoubleBookingException.class, () -> appointmentService.bookAppointment(1L, request));
        
        verify(appointmentRepository, never()).save(any(Appointment.class));
    }
    
    @Test
    void bookAppointment_ResourceNotFoundException_WhenPatientNotFound() {
        BookAppointmentRequest request = new BookAppointmentRequest();
        request.setDoctorId(1L);
        request.setScheduleId(1L);

        when(patientRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> appointmentService.bookAppointment(1L, request));
    }
}
