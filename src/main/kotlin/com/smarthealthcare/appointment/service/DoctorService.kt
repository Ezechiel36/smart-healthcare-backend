package com.smarthealthcare.appointment.service

import com.smarthealthcare.appointment.model.Doctor
import com.smarthealthcare.appointment.repository.DoctorRepository
import org.springframework.stereotype.Service

@Service
class DoctorService(private val doctorRepository: DoctorRepository) {

    fun createDoctor(d: Doctor) = doctorRepository.save(d)
    fun getAllDoctors(): List<Doctor> = doctorRepository.findAll()
    fun getDoctorById(id: Long) = doctorRepository.findById(id).orElse(null)
    fun deleteDoctor(id: Long) = doctorRepository.deleteById(id)
}
