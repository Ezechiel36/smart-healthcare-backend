package com.smarthealthcare.appointment.service

import com.smarthealthcare.appointment.model.Admin
import com.smarthealthcare.appointment.repository.AdminRepository
import org.springframework.stereotype.Service

@Service
class AdminService(private val adminRepository: AdminRepository) {

    fun createAdmin(a: Admin) = adminRepository.save(a)
    fun getAllAdmins(): List<Admin> = adminRepository.findAll()
    fun getAdminById(id: Long) = adminRepository.findById(id).orElse(null)
    fun deleteAdmin(id: Long) = adminRepository.deleteById(id)
}
