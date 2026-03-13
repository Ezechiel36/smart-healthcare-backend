package com.smarthealthcare.appointment.repository

import com.smarthealthcare.appointment.model.Doctor
import org.springframework.data.jpa.repository.JpaRepository

interface DoctorRepository : JpaRepository<Doctor, Long>
