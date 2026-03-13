package com.smarthealthcare.appointment.controller

import com.smarthealthcare.appointment.model.Appointment
import com.smarthealthcare.appointment.service.AppointmentService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/appointments")
class AppointmentController(private val appointmentService: AppointmentService) {

    @PostMapping
    fun create(@RequestBody a: Appointment) = appointmentService.createAppointment(a)

    @GetMapping
    fun getAll() = appointmentService.getAllAppointments()

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long) = appointmentService.getAppointmentById(id)

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long) = appointmentService.deleteAppointment(id)
}
