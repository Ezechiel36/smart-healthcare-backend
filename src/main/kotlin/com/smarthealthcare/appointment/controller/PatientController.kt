package com.smarthealthcare.appointment.controller

import com.smarthealthcare.appointment.model.Patient
import com.smarthealthcare.appointment.service.PatientService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/patients")
class PatientController(private val patientService: PatientService) {

    @PostMapping
    fun create(@RequestBody p: Patient) = patientService.createPatient(p)

    @GetMapping
    fun getAll() = patientService.getAllPatients()

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long) = patientService.getPatientById(id)

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long) = patientService.deletePatient(id)
}
