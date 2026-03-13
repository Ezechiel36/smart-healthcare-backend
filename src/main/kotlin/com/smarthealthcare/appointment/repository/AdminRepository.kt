package com.smarthealthcare.appointment.repository

import com.smarthealthcare.appointment.model.Admin
import org.springframework.data.jpa.repository.JpaRepository

interface AdminRepository : JpaRepository<Admin, Long>
