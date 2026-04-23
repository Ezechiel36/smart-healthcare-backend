# Smart Healthcare Appointment Management System

A comprehensive REST API for managing healthcare appointments with secure role-based access control. Built with Spring Boot, Spring Security, JWT authentication, and PostgreSQL database.

## 🚀 Features

- **Secure Authentication**: JWT-based stateless authentication with BCrypt password hashing
- **Role-Based Access Control**: Support for Patients, Doctors, and Administrators
- **Appointment Management**: Book, cancel, and manage appointments with approval workflow
- **Doctor Availability**: Manage doctor schedules and availability
- **Automated Notifications**: System notifications for appointment updates
- **RESTful API**: Clean, well-documented REST endpoints
- **Appointment Status Flow**: Patient appointments start as PENDING, doctors can approve or reject

## 🏗️ Architecture

- **Backend**: Spring Boot 3.2.5
- **Frontend**: React 19 with TypeScript and Bootstrap
- **Security**: Spring Security with JWT tokens
- **Database**: PostgreSQL with JPA/Hibernate
- **Build Tool**: Maven (Backend), npm (Frontend)
- **Java Version**: 17

## 📋 Prerequisites

- Java 17 or higher
- PostgreSQL 14 or higher
- Node.js 16 or higher
- npm or yarn
- Maven 3.6+

## 🛠️ Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd healthcare
```

### 2. Backend Setup
```bash
cd backend
```

#### Database Setup
Create a PostgreSQL database named `healthcare_db`. The application uses environment variables for database configuration:

- **DB_URL**: PostgreSQL connection URL (e.g., `jdbc:postgresql://localhost:5432/healthcare_db`)
- **DB_USERNAME**: Database username
- **DB_PASSWORD**: Database password
- **JWT_SECRET**: Secret key for JWT token generation

#### Build and Run Backend
```bash
mvn clean package -DskipTests
java -jar target/healthcare-0.0.1-SNAPSHOT.jar
```
Or using Maven:
```bash
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm start
```

The frontend will start on `http://localhost:3000`

### 4. Database Connection
The application is configured to connect to PostgreSQL using environment variables:
- **DB_URL**: PostgreSQL connection URL
- **DB_USERNAME**: Database username
- **DB_PASSWORD**: Database password
- **Port**: 5432 (default PostgreSQL port)

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('PATIENT', 'DOCTOR', 'ADMIN'))
);
```

### Patients Table
```sql
CREATE TABLE patients (
    patient_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    medical_history TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

### Doctors Table
```sql
CREATE TABLE doctors (
    doctor_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    specialization VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

### Schedules Table
```sql
CREATE TABLE schedules (
    schedule_id BIGSERIAL PRIMARY KEY,
    doctor_id BIGINT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    is_booked BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
);
```

### Appointments Table
```sql
CREATE TABLE appointments (
    appointment_id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    schedule_id BIGINT NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'CONFIRMED', 'REJECTED', 'COMPLETED', 'CANCELED', 'NO_SHOW')),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id),
    FOREIGN KEY (schedule_id) REFERENCES schedules(schedule_id)
);
```

### Notifications Table
```sql
CREATE TABLE notifications (
    notification_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    appointment_id BIGINT,
    message TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id)
);
```

## 🔐 API Endpoints

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "password123",
    "role": "PATIENT"
}
```

**Response:**
```json
{
    "message": "User registered successfully",
    "userId": 1,
    "email": "john.doe@example.com",
    "name": "John Doe",
    "role": "PATIENT"
}
```

**For Doctor Registration (specialization is REQUIRED):**
```http
POST /api/auth/register
Content-Type: application/json

{
    "name": "Dr. Sarah Johnson",
    "email": "sarah.johnson@hospital.com",
    "password": "doctor123",
    "role": "DOCTOR",
    "specialization": "Cardiology"
}
```

**For Admin Registration:**
```http
POST /api/auth/register
Content-Type: application/json

{
    "name": "Administrator",
    "email": "admin@hospital.com",
    "password": "admin123",
    "role": "ADMIN"
}
```

**Validation Rules:**
- All fields (name, email, password, role) are required
- For DOCTOR role, specialization field is **MANDATORY** (must not be null or empty)
- Email must be unique and is automatically converted to lowercase
- Names and specializations are trimmed of whitespace
- Password will be hashed using BCrypt before storage

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "john.doe@example.com",
    "password": "password123"
}
```

**Response:**
```json
{
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "message": "Login successful",
    "userId": 1,
    "email": "john.doe@example.com",
    "role": "PATIENT"
}
```

#### Validate Token
```http
GET /api/auth/validate
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
    "valid": true,
    "email": "john.doe@example.com",
    "role": "PATIENT",
    "message": "Token is valid"
}
```

### Schedule Management Endpoints

#### Add Doctor Availability
```http
POST /api/schedules/availability
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
    "startTime": "2026-04-15T09:00:00",
    "endTime": "2026-04-15T10:00:00"
}
```

**Response:**
```json
{
    "message": "Availability added successfully",
    "scheduleId": 1,
    "startTime": "2026-04-15T09:00:00",
    "endTime": "2026-04-15T10:00:00"
}
```

#### Get Doctor Available Slots
```http
GET /api/schedules/doctors/{doctorId}/available
Authorization: Bearer <jwt-token>
```

**Response:**
```json
[
    {
        "scheduleId": 1,
        "doctorId": 1,
        "doctorName": "Dr. Sarah Johnson",
        "specialization": "Cardiology",
        "startTime": "2026-04-15T09:00:00",
        "endTime": "2026-04-15T10:00:00",
        "isBooked": false
    }
]
```

#### Get My Schedules (Doctor Only)
```http
GET /api/schedules/my-schedules
Authorization: Bearer <jwt-token>
```

#### Delete Availability (Doctor Only)
```http
DELETE /api/schedules/{scheduleId}
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
    "message": "Availability deleted successfully",
    "scheduleId": 1
}
```

### Appointment Management Endpoints

#### Book Appointment (Patient Only)
```http
POST /api/appointments/book
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
    "doctorId": 1,
    "scheduleId": 1
}
```

**Response:**
```json
{
    "message": "Appointment booked successfully",
    "appointmentId": 1,
    "doctorName": "Dr. Sarah Johnson",
    "startTime": "2026-04-15T09:00:00",
    "endTime": "2026-04-15T10:00:00",
    "status": "PENDING"
}
```

#### Get My Appointments (Patient Only)
```http
GET /api/appointments/my-appointments
Authorization: Bearer <jwt-token>
```

**Response:**
```json
[
    {
        "appointmentId": 1,
        "patientId": 1,
        "patientName": "John Doe",
        "doctorId": 1,
        "doctorName": "Dr. Sarah Johnson",
        "specialization": "Cardiology",
        "scheduleId": 1,
        "startTime": "2026-04-15T09:00:00",
        "endTime": "2026-04-15T10:00:00",
        "status": "PENDING",
        "createdAt": "2026-04-13T10:30:00",
        "updatedAt": null
    }
]
```

#### Get Doctor Appointments (Doctor Only)
```http
GET /api/appointments/doctor-appointments
Authorization: Bearer <jwt-token>
```

#### Cancel Appointment
```http
DELETE /api/appointments/{appointmentId}
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
    "message": "Appointment cancelled successfully",
    "appointmentId": 1
}
```

#### Update Appointment Status (Doctor Only)
Doctors can approve, reject, complete, or mark appointments as no-show.

**Approve Appointment (PENDING → CONFIRMED):**
```http
PUT /api/appointments/{appointmentId}/status
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
    "status": "CONFIRMED"
}
```

**Reject Appointment (PENDING → REJECTED):**
```http
PUT /api/appointments/{appointmentId}/status
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
    "status": "REJECTED"
}
```
Note: When an appointment is rejected, the schedule becomes available again for booking.

**Complete Appointment (CONFIRMED → COMPLETED):**
```http
PUT /api/appointments/{appointmentId}/status
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
    "status": "COMPLETED"
}
```

**Mark No Show (CONFIRMED → NO_SHOW):**
```http
PUT /api/appointments/{appointmentId}/status
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
    "status": "NO_SHOW"
}
```

**Response:**
```json
{
    "message": "Appointment status updated successfully",
    "appointmentId": 1,
    "newStatus": "CONFIRMED"
}
```

### Notification Endpoints

#### Get My Notifications
```http
GET /api/notifications/my-notifications
Authorization: Bearer <jwt-token>
```

**Response:**
```json
[
    {
        "notificationId": 1,
        "userId": 1,
        "userName": "John Doe",
        "appointmentId": 1,
        "message": "Your appointment with Dr. Sarah Johnson has been confirmed for 2026-04-15T09:00:00 to 2026-04-15T10:00:00.",
        "timestamp": "2026-04-13T10:30:00"
    }
]
```

#### Get Notification Count
```http
GET /api/notifications/count
Authorization: Bearer <jwt-token>
```

**Response:**
```json
5
```

### Admin Endpoints

#### Get Dashboard Analytics
```http
GET /api/admin/dashboard
Authorization: Bearer <admin-jwt-token>
```

**Response:**
```json
{
    "totalPatients": 10,
    "totalDoctors": 5,
    "totalAppointments": 25,
    "appointmentStatusBreakdown": {
        "pending": 2,
        "confirmed": 15,
        "canceled": 3,
        "completed": 4,
        "noShow": 1
    }
}
```

## 📮 Postman Collection - Sample Requests

### 1. Authentication Flow

#### Register Patient
```json
{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "patient123",
    "role": "PATIENT"
}
```

#### Register Doctor (with Specialization - REQUIRED)
```json
{
    "name": "Dr. Sarah Johnson",
    "email": "sarah.johnson@hospital.com",
    "password": "doctor123",
    "role": "DOCTOR",
    "specialization": "Cardiology"
}
```

#### Register Another Doctor
```json
{
    "name": "Dr. Michael Chen",
    "email": "michael.chen@hospital.com",
    "password": "doctor123",
    "role": "DOCTOR",
    "specialization": "Neurology"
}
```

#### Register Admin
```json
{
    "name": "Administrator",
    "email": "admin@hospital.com",
    "password": "admin123",
    "role": "ADMIN"
}
```

#### Login (Get JWT Token)
```json
{
    "email": "john.doe@example.com",
    "password": "patient123"
}
```

### 2. Schedule Management (Doctor Operations)

#### Add Availability - Doctor 1
```json
{
    "startTime": "2026-04-15T09:00:00",
    "endTime": "2026-04-15T10:00:00"
}
```

#### Add Another Time Slot - Doctor 1
```json
{
    "startTime": "2026-04-15T10:30:00",
    "endTime": "2026-04-15T11:30:00"
}
```

#### Add Availability - Doctor 2
```json
{
    "startTime": "2026-04-16T14:00:00",
    "endTime": "2026-04-16T15:00:00"
}
```

### 3. Appointment Booking (Patient Operations)

#### Book Appointment with Doctor 1
```json
{
    "doctorId": 1,
    "scheduleId": 1
}
```

#### Book Appointment with Doctor 2
```json
{
    "doctorId": 2,
    "scheduleId": 3
}
```

### 4. Get Data Endpoints

#### Get Patient's Appointments
```
GET /api/appointments/my-appointments
Authorization: Bearer <patient-jwt-token>
```

#### Get Doctor's Appointments
```
GET /api/appointments/doctor-appointments
Authorization: Bearer <doctor-jwt-token>
```

#### Get Available Slots for Doctor 1
```
GET /api/schedules/doctors/1/available
Authorization: Bearer <any-jwt-token>
```

#### Get My Schedules (Doctor Only)
```
GET /api/schedules/my-schedules
Authorization: Bearer <doctor-jwt-token>
```

### 5. Update Appointment Status (Doctor Operations)

#### Approve Appointment (PENDING → CONFIRMED)
```json
{
    "status": "CONFIRMED"
}
```

#### Reject Appointment (PENDING → REJECTED)
```json
{
    "status": "REJECTED"
}
```
Note: When rejected, the schedule becomes available again.

#### Mark Appointment as Completed
```json
{
    "status": "COMPLETED"
}
```

#### Mark Appointment as NO_SHOW
```json
{
    "status": "NO_SHOW"
}
```

### 6. Cancel Appointment

#### Cancel as Patient
```
DELETE /api/appointments/{appointmentId}
Authorization: Bearer <patient-jwt-token>
```

#### Cancel as Doctor/Admin
```
DELETE /api/appointments/{appointmentId}
Authorization: Bearer <doctor-or-admin-jwt-token>
```

#### Delete Schedule (Doctor Only)
```
DELETE /api/schedules/{scheduleId}
Authorization: Bearer <doctor-jwt-token>
```

## 🔄 Implementation Status

### Phase 1: Core Configuration & Entities ✅ Complete
- [x] pom.xml with required dependencies
- [x] application.yml with PostgreSQL connection
- [x] JPA Entities: User, Patient, Doctor with relationships
- [x] Lombok annotations implemented

### Phase 2: Authentication & User Management ✅ Complete
- [x] Repositories: UserRepository, PatientRepository, DoctorRepository
- [x] Security Configuration with BCryptPasswordEncoder
- [x] JWT-based stateless authentication
- [x] Role-Based Access Control (RBAC)
- [x] AuthController with /register and /login endpoints
- [x] Automatic creation of Patient/Doctor records on registration
- [x] Request/Response DTOs for clean API

### Phase 3: Availability Engine ✅ Complete
- [x] Schedule JPA Entity with relationships
- [x] ScheduleRepository with custom queries
- [x] ScheduleService with overlap validation
- [x] ScheduleController with proper authorization
- [x] Availability management (add/delete)
- [x] Get available slots functionality

### Phase 4: Appointment Logic ✅ Complete
- [x] AppointmentRepository with custom queries
- [x] AppointmentService with transactional methods
- [x] Double-booking prevention with DoubleBookingException
- [x] AppointmentController with role-based access
- [x] Appointment status management (PENDING, CONFIRMED, REJECTED, COMPLETED, CANCELED, NO_SHOW)
- [x] Appointment approval workflow (doctors can approve/reject pending appointments)
- [x] Schedule availability restoration on appointment rejection
- [x] Request/Response DTOs

### Phase 5: Notification Service & Admin Analytics ✅ Complete
- [x] Notification Entity and Repository
- [x] NotificationService
- [x] Integration with AppointmentService
- [x] AdminService for analytics
- [x] AdminController for dashboard endpoints
- [x] NotificationController for user notifications

## 🚀 Future Enhancements

- [ ] Email/SMS integration for real-time notifications
- [ ] Medical history management with document uploads
- [ ] Appointment reminders via email/SMS
- [ ] Patient ratings and reviews for doctors
- [ ] Advanced search and filtering for appointments and doctors
- [ ] Bulk appointment management for administrators
- [ ] Calendar view integration for better scheduling visualization
- [ ] Payment integration for consultation fees
- [ ] Telemedicine integration for video consultations
- [ ] Prescription management system

## 🐛 Troubleshooting

### ClassNotFoundException on Application Start
If you see: `com.healthcare.appointment.healthcare.HealthcareApplication`
- The main class path is: `com.healthcare.appointment.HealthcareApplication`
- Ensure you're running the correct class or using Maven/IDE to start the application

### Doctor Specialization Null Error
```json
{
    "error": "not-null property references a null or transient value : com.healthcare.appointment.model.Doctor.specialization"
}
```
**Solution**: When registering a Doctor, always include the `specialization` field:
```json
{
    "name": "Dr. Name",
    "email": "doctor@hospital.com",
    "password": "password",
    "role": "DOCTOR",
    "specialization": "Specialty Name"
}
```

### Port 8080 Already in Use
Kill the process using port 8080:

**Windows PowerShell:**
```powershell
Get-NetTCPConnection -LocalPort 8080 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

**Linux/Mac:**
```bash
lsof -i :8080 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

## 📞 Support & Documentation

For detailed API documentation, refer to the endpoint sections above. Each endpoint includes:
- HTTP method and path
- Required authentication token
- Request body example
- Expected response format
- Authorization requirements
