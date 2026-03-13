package com.smarthealthcare.appointment.controller

import com.smarthealthcare.appointment.model.Notification
import com.smarthealthcare.appointment.service.NotificationService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/notifications")
class NotificationController(private val notificationService: NotificationService) {

    @PostMapping
    fun create(@RequestBody n: Notification) = notificationService.createNotification(n)

    @GetMapping
    fun getAll() = notificationService.getAllNotifications()

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long) = notificationService.deleteNotification(id)
}
