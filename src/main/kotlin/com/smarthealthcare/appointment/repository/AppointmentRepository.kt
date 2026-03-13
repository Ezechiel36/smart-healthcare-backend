package com.smarthealthcare.appointment.repository
import com.smarthealthcare.appointment.model.Appointment
import org.springframework.data.jpa.repository.JpaRepository

interface AppointmentRepository : JpaRepository<Appointment, Long>
