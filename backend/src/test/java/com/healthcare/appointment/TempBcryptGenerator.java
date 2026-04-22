package com.healthcare.appointment;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class TempBcryptGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println("admin123 hash: " + encoder.encode("admin123"));
        System.out.println("doctor123 hash: " + encoder.encode("doctor123"));
        System.out.println("password123 hash: " + encoder.encode("password123"));
    }
}
