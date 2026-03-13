package com.smarthealthcare.appointment.model
import jakarta.persistence.*

@Entity
data class Patient(
@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
val id: Long = 0,
val name: String,
val email: String
)
