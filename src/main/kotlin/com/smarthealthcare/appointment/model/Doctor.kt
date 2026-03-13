package com.smarthealthcare.appointment.model

import jakarta.persistence.*

@Entity
@Table(name = "doctors")
class Doctor(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,
    var name: String = "",
    var specialization: String = "",
    var availability: String = ""
)
