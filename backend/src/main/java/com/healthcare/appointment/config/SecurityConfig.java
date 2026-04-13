package com.healthcare.appointment.config;

import com.healthcare.appointment.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authz -> authz
                        // Public endpoints
                        .requestMatchers("/api/auth/**").permitAll()

                        // Patient endpoints - PATIENT or ADMIN
                        .requestMatchers("/api/patients/**").hasAnyRole("PATIENT", "ADMIN")

                        // Doctor endpoints - DOCTOR or ADMIN
                        .requestMatchers("/api/doctors/**").hasAnyRole("DOCTOR", "ADMIN")

                        // Admin endpoints - ADMIN only
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // Schedule endpoints
                        .requestMatchers("/api/schedules/doctors/*/available").authenticated()  // Any authenticated user can view availability
                        .requestMatchers("/api/schedules/availability", "/api/schedules/my-schedules", "/api/schedules/*").hasRole("DOCTOR")  // Only doctors can manage their schedules

                        // Appointment endpoints
                        .requestMatchers("/api/appointments/book", "/api/appointments/my-appointments").hasRole("PATIENT")  // Patients can book and view their appointments
                        .requestMatchers("/api/appointments/doctor-appointments", "/api/appointments/*/status").hasRole("DOCTOR")  // Doctors can view and update their appointments
                        .requestMatchers("/api/appointments/*").authenticated()  // Any authenticated user can cancel appointments (authorization checked in service)

                        // All other requests require authentication
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

