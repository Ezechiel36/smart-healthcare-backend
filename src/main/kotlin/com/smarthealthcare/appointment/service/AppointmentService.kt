package com.smarthealthcare.appointment.service

import com.smarthealthcare.appointment.model.Appointment
import com.smarthealthcare.appointment.repository.AppointmentRepository
import org.springframework.stereotype.Service

@Service
class AppointmentService(private val appointmentRepository: AppointmentRepository) {

    fun createAppointment(a: Appointment) = appointmentRepository.save(a)
    fun getAllAppointments(): List<Appointment> = appointmentRepository.findAll()
    fun getAppointmentById(id: Long) = appointmentRepository.findById(id).orElse(null)
    fun deleteAppointment(id: Long) = appointmentRepository.deleteById(id)
}
