package com.smarthealthcare.appointment.model

import jakarta.persistence.*

@Entity
@Table(name = "admins")
class Admin(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,
    var name: String = "",
    var email: String = ""
)
