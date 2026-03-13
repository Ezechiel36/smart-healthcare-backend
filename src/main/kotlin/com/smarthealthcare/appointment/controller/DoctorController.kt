package com.smarthealthcare.appointment.controller

import com.smarthealthcare.appointment.model.Doctor
import com.smarthealthcare.appointment.service.DoctorService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/doctors")
class DoctorController(private val doctorService: DoctorService) {

    @PostMapping
    fun create(@RequestBody d: Doctor) = doctorService.createDoctor(d)

    @GetMapping
    fun getAll() = doctorService.getAllDoctors()

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long) = doctorService.getDoctorById(id)

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long) = doctorService.deleteDoctor(id)
}
