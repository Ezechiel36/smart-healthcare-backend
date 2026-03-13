package com.smarthealthcare.appointment.service

import com.smarthealthcare.appointment.model.Patient
import com.smarthealthcare.appointment.repository.PatientRepository
import org.springframework.stereotype.Service

@Service
class PatientService(private val patientRepository: PatientRepository) {

    fun createPatient(p: Patient) = patientRepository.save(p)
    fun getAllPatients(): List<Patient> = patientRepository.findAll()
    fun getPatientById(id: Long) = patientRepository.findById(id).orElse(null)
    fun deletePatient(id: Long) = patientRepository.deleteById(id)
}
