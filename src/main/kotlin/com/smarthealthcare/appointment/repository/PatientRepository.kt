package com.smarthealthcare.appointment.repository

import com.smarthealthcare.appointment.model.Patient
import org.springframework.data.jpa.repository.JpaRepository

interface PatientRepository : JpaRepository<Patient, Long>
