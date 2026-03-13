package com.smarthealthcare.appointment.model

import jakarta.persistence.*

@Entity
@Table(name = "notifications")
class Notification(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,
    var message: String = "",
    var recipientEmail: String = "",
    var sent: Boolean = false
)
