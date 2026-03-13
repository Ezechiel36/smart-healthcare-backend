package com.smarthealthcare.appointment.repository

import com.smarthealthcare.appointment.model.Notification
import org.springframework.data.jpa.repository.JpaRepository

interface NotificationRepository : JpaRepository<Notification, Long>
