package com.healthcare.appointment.controller;

import com.healthcare.appointment.model.User;
import com.healthcare.appointment.service.AdminService;
import com.healthcare.appointment.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private UserService userService;

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

    /**
     * Get all users
     * Admin only endpoint to retrieve all registered users
     *
     * @return List of all users
     */
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        try {
            List<User> users = userService.getAllUsers();
            return new ResponseEntity<>(users, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Delete a user by ID
     * Admin only endpoint to delete a user
     *
     * @param id User ID to delete
     * @return No content on success
     */
    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get pending doctors (doctors awaiting approval)
     * Admin only endpoint to retrieve pending doctors
     *
     * @return List of pending doctors
     */
    @GetMapping("/doctors/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<com.healthcare.appointment.model.Doctor>> getPendingDoctors() {
        try {
            List<com.healthcare.appointment.model.Doctor> pendingDoctors = adminService.getPendingDoctors();
            return new ResponseEntity<>(pendingDoctors, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update doctor approval status
     * Admin only endpoint to approve or reject a doctor
     *
     * @param id Doctor ID
     * @param approvalRequest Map containing 'approved' boolean
     * @return Updated doctor
     */
    @PutMapping("/doctors/{id}/approval")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.healthcare.appointment.model.Doctor> updateDoctorApproval(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> approvalRequest) {
        try {
            Boolean approved = approvalRequest.get("approved");
            if (approved == null) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            com.healthcare.appointment.model.Doctor doctor = adminService.updateDoctorApproval(id, approved);
            return new ResponseEntity<>(doctor, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
