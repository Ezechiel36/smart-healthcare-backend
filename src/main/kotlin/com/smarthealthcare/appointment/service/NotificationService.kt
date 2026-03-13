package com.smarthealthcare.appointment.service

import com.smarthealthcare.appointment.model.Notification
import com.smarthealthcare.appointment.repository.NotificationRepository
import org.springframework.stereotype.Service

@Service
class NotificationService(private val notificationRepository: NotificationRepository) {

    fun createNotification(n: Notification) = notificationRepository.save(n)
    fun getAllNotifications(): List<Notification> = notificationRepository.findAll()
    fun deleteNotification(id: Long) = notificationRepository.deleteById(id)
}
