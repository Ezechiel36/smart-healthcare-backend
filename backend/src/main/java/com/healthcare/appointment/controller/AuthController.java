package com.healthcare.appointment.controller;

import com.healthcare.appointment.dto.LoginRequest;
import com.healthcare.appointment.dto.LoginResponse;
import com.healthcare.appointment.dto.RegistrationRequest;
import com.healthcare.appointment.model.User;
import com.healthcare.appointment.security.JwtTokenProvider;
import com.healthcare.appointment.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    /**
     * Register a new user (Patient, Doctor, or Admin)
     *
     * @param registrationRequest Registration details
     * @return Success message with user details
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody RegistrationRequest registrationRequest) {
        User registeredUser = userService.registerUser(registrationRequest);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "User registered successfully");
        response.put("userId", registeredUser.getUserId());
        response.put("email", registeredUser.getEmail());
        response.put("name", registeredUser.getName());
        response.put("role", registeredUser.getRole());

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Login a user and return JWT token
     *
     * @param loginRequest Login credentials
     * @return JWT token and user details
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        User user = userService.findByEmail(loginRequest.getEmail());

        // Validate password
        if (!userService.validatePassword(loginRequest.getPassword(), user.getPassword())) {
            return new ResponseEntity<>(
                    new LoginResponse(null, "Invalid email or password", null, null, null, null),
                    HttpStatus.UNAUTHORIZED
            );
        }

        // Generate JWT token
        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().toString());

        LoginResponse loginResponse = new LoginResponse();
        loginResponse.setToken(token);
        loginResponse.setMessage("Login successful");
        loginResponse.setUserId(user.getUserId());
        loginResponse.setEmail(user.getEmail());
        loginResponse.setRole(user.getRole().toString());
        loginResponse.setName(user.getName());

        return new ResponseEntity<>(loginResponse, HttpStatus.OK);
    }

    /**
     * Validate JWT token
     *
     * @param token JWT token from Authorization header
     * @return Token validity status
     */
    @GetMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateToken(@RequestHeader("Authorization") String token) {
        Map<String, Object> response = new HashMap<>();

        if (token == null || !token.startsWith("Bearer ")) {
            response.put("valid", false);
            response.put("message", "Invalid token format");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        String jwt = token.substring(7);
        boolean isValid = jwtTokenProvider.validateToken(jwt);

        response.put("valid", isValid);
        if (isValid) {
            response.put("email", jwtTokenProvider.getEmailFromToken(jwt));
            response.put("role", jwtTokenProvider.getRoleFromToken(jwt));
            response.put("message", "Token is valid");
        } else {
            response.put("message", "Token is invalid or expired");
        }

        return new ResponseEntity<>(response, isValid ? HttpStatus.OK : HttpStatus.UNAUTHORIZED);
    }
}
