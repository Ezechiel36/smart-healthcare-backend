package com.smarthealthcare.appointment.model
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
data class Appointment(
@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
val id: Long = 0,
val patientId: Long,
val doctorId: Long,
val appointmentTime: LocalDateTime
)
