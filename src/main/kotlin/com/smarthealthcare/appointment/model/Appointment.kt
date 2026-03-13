package com.smarthealthcare.appointment.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "appointments")
class Appointment(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,
    var appointmentTime: LocalDateTime? = null,
    var status: String = "BOOKED",
    @ManyToOne var patient: Patient? = null,
    @ManyToOne var doctor: Doctor? = null
)
