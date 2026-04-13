package com.healthcare.appointment.controller;

import com.healthcare.appointment.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminService adminService;

    /**
     * Get dashboard analytics
     * Admin only endpoint providing hospital dashboard data
     *
     * @return Dashboard analytics including patient/doctor counts and appointment statistics
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        try {
            Map<String, Object> analytics = adminService.getDashboardAnalytics();

            return new ResponseEntity<>(analytics, HttpStatus.OK);

        } catch (Exception e) {
            Map<String, Object> errorResponse = Map.of(
                "error", "Failed to retrieve dashboard data",
                "message", e.getMessage()
            );
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
