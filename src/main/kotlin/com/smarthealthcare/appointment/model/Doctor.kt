package com.smarthealthcare.appointment.model
import jakarta.persistence.*

@Entity
data class Doctor(
@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
val id: Long = 0,
val name: String,
val specialty: String
)
