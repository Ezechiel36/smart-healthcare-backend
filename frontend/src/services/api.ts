import axios from 'axios';

// Base URL for the backend API
const API_BASE_URL = 'http://localhost:8081/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication APIs
export const authAPI = {
  register: (userData: any) => api.post('/auth/register', userData),
  login: (credentials: { email: string; password: string }) => api.post('/auth/login', credentials),
  validateToken: () => api.get('/auth/validate'),
};

// Schedule APIs
export const scheduleAPI = {
  addAvailability: (availability: { startTime: string; endTime: string }) =>
    api.post('/schedules/availability', availability),
  updateAvailability: (scheduleId: number, availability: { startTime: string; endTime: string }) =>
    api.put(`/schedules/${scheduleId}`, availability),
  getAvailableSlots: (doctorId: number) => api.get(`/schedules/doctors/${doctorId}/available`),
  getMySchedules: () => api.get('/schedules/my-schedules'),
  deleteSchedule: (scheduleId: number) => api.delete(`/schedules/${scheduleId}`),
};

// Appointment APIs
export const appointmentAPI = {
  bookAppointment: (bookingData: { doctorId: number; scheduleId: number }) =>
    api.post('/appointments/book', bookingData),
  getMyAppointments: () => api.get('/appointments/my-appointments'),
  getDoctorAppointments: () => api.get('/appointments/doctor-appointments'),
  cancelAppointment: (appointmentId: number) => api.delete(`/appointments/${appointmentId}`),
  updateAppointmentStatus: (appointmentId: number, status: { status: string }) =>
    api.put(`/appointments/${appointmentId}/status`, status),
};

// Notification APIs
export const notificationAPI = {
  getMyNotifications: () => api.get('/notifications/my-notifications'),
  getNotificationCount: () => api.get('/notifications/count'),
};

// Doctor APIs
export const doctorAPI = {
  getAllDoctors: () => api.get('/doctors'),
  getDoctorById: (id: number) => api.get(`/doctors/${id}`),
};

// Admin APIs
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: () => api.get('/admin/users'),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),
  getPendingDoctors: () => api.get('/admin/doctors/pending'),
  updateDoctorApproval: (id: number, approved: boolean) => 
    api.put(`/admin/doctors/${id}/approval`, { approved }),
};

// Utility functions
export const setAuthToken = (token: string) => {
  localStorage.setItem('token', token);
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const removeAuthToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const setUser = (user: any) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export default api;
