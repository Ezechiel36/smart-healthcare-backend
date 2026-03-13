package com.smarthealthcare.appointment.controller

import com.smarthealthcare.appointment.model.Admin
import com.smarthealthcare.appointment.service.AdminService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/admins")
class AdminController(private val adminService: AdminService) {

    @PostMapping
    fun create(@RequestBody a: Admin) = adminService.createAdmin(a)

    @GetMapping
    fun getAll() = adminService.getAllAdmins()

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long) = adminService.getAdminById(id)

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long) = adminService.deleteAdmin(id)
}
