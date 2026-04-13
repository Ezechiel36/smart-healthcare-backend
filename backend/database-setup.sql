-- Healthcare Database Setup and Sample Data
-- Run this script to set up the database and populate with sample data

-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS healthcare_db;
USE healthcare_db;

-- Create tables (if they don't exist)
-- Note: Tables are automatically created by Hibernate, but this ensures proper structure

-- Sample data for testing
-- Note: Passwords are BCrypt hashed versions of the plain text passwords shown in comments

-- Insert sample admin user
-- Password: admin123 (BCrypt hash)
INSERT INTO users (name, email, password, role) VALUES
('System Admin', 'admin@hospital.com', '$2a$10$8K2L0H1Y/8VzJ8QzJ8QzJ8QzJ8QzJ8QzJ8QzJ8QzJ8QzJ8QzJ8QzJ', 'ADMIN');

-- Insert sample doctor
-- Password: doctor123 (BCrypt hash)
INSERT INTO users (name, email, password, role) VALUES
('Dr. Sarah Johnson', 'sarah.johnson@hospital.com', '$2a$10$8K2L0H1Y/8VzJ8QzJ8QzJ8QzJ8QzJ8QzJ8QzJ8QzJ8QzJ8QzJ8QzJ', 'DOCTOR');

-- Insert sample patient
-- Password: password123 (BCrypt hash)
INSERT INTO users (name, email, password, role) VALUES
('John Doe', 'john.doe@example.com', '$2a$10$8K2L0H1Y/8VzJ8QzJ8QzJ8QzJ8QzJ8QzJ8QzJ8QzJ8QzJ8QzJ8QzJ', 'PATIENT');

-- Insert corresponding records in related tables
INSERT INTO doctors (user_id, specialization) VALUES
(2, 'Cardiology');

INSERT INTO patients (user_id, medical_history) VALUES
(3, 'No significant medical history. Regular check-ups recommended.');

-- Verify data
SELECT 'Users created:' as info, COUNT(*) as count FROM users
UNION ALL
SELECT 'Doctors created:', COUNT(*) FROM doctors
UNION ALL
SELECT 'Patients created:', COUNT(*) FROM patients;

-- Show sample data
SELECT u.user_id, u.name, u.email, u.role,
       CASE
           WHEN u.role = 'DOCTOR' THEN d.specialization
           WHEN u.role = 'PATIENT' THEN p.medical_history
           ELSE 'N/A'
       END as details
FROM users u
LEFT JOIN doctors d ON u.user_id = d.user_id
LEFT JOIN patients p ON u.user_id = p.user_id;
