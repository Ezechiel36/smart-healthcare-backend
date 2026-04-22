-- Drop and Recreate Database
DROP DATABASE IF EXISTS healthcare_db;
CREATE DATABASE healthcare_db;
USE healthcare_db;

-- Users Table
CREATE TABLE users (
    user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('PATIENT', 'DOCTOR', 'ADMIN') NOT NULL
);

-- Patients Table
CREATE TABLE patients (
    patient_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    medical_history TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Doctors Table
CREATE TABLE doctors (
    doctor_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    specialization VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Schedules Table
CREATE TABLE schedules (
    schedule_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    doctor_id BIGINT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    is_booked BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
);

-- Appointments Table
CREATE TABLE appointments (
    appointment_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    schedule_id BIGINT NOT NULL UNIQUE,
    status ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELED', 'NO_SHOW') NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id),
    FOREIGN KEY (schedule_id) REFERENCES schedules(schedule_id)
);

-- Notifications Table
CREATE TABLE notifications (
    notification_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    appointment_id BIGINT,
    message TEXT NOT NULL,
    timestamp DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id)
);

-- RESTORE DATA FROM README AND SETUP
-- Note: Password 'password123' BCrypt hash: $2a$10$8K2L0H1Y/8VzJ8QzJ8QzJ8QzJ8QzJ8QzJ8QzJ8QzJ8QzJ8QzJ8QzJ

INSERT INTO users (user_id, name, email, password, role) VALUES
(1, 'John Doe', 'john.doe@example.com', '$2a$10$CgysjyQWK/EeX8P1q0kMmOHPKERgd7UQC3aclxkbCZrKseECLgKri', 'PATIENT'),
(2, 'Ezekiel Ukwishaka', 'ezekielukwishaka@gmail.com', '$2a$10$CgysjyQWK/EeX8P1q0kMmOHPKERgd7UQC3aclxkbCZrKseECLgKri', 'DOCTOR'),
(3, 'Admin User', 'admin2@test.com', '$2a$10$CgysjyQWK/EeX8P1q0kMmOHPKERgd7UQC3aclxkbCZrKseECLgKri', 'ADMIN');

INSERT INTO patients (patient_id, user_id, medical_history) VALUES
(1, 1, 'Regular check-ups.');

INSERT INTO doctors (doctor_id, user_id, specialization) VALUES
(1, 2, 'General Medicine');

-- Sample Schedules
INSERT INTO schedules (schedule_id, doctor_id, start_time, end_time, is_booked) VALUES
(1, 1, '2026-04-20 09:00:00', '2026-04-20 10:00:00', FALSE),
(2, 1, '2026-04-20 10:00:00', '2026-04-20 11:00:00', FALSE);

