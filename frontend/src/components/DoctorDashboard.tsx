import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, ListGroup, Badge, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { appointmentAPI, scheduleAPI, notificationAPI, getUser, removeAuthToken } from '../services/api';
import DoctorSidebar from './DoctorSidebar';
import DoctorNavbar from './DoctorNavbar';
import './DoctorDashboard.css';

interface Appointment {
  appointmentId: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  specialization: string;
  scheduleId: number;
  startTime: string;
  endTime: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

interface Schedule {
  scheduleId: number;
  doctorId: number;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

const DoctorDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      const currentUser = getUser();
      
      if (!token || !currentUser) {
        setError('Authentication required. Please log in again.');
        navigate('/login');
        return;
      }
      
      let appointmentsData: any[] = [];
      let schedulesData: any[] = [];
      let notificationsData: any[] = [];
      const errorMessages: string[] = [];

      try {
        const appointmentsRes = await appointmentAPI.getDoctorAppointments();
        appointmentsData = Array.isArray(appointmentsRes.data) ? appointmentsRes.data : [];
      } catch (err: any) {
        errorMessages.push('appointments');
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Session expired. Please log in again.');
          removeAuthToken();
          navigate('/login');
          return;
        }
      }

      try {
        const schedulesRes = await scheduleAPI.getMySchedules();
        schedulesData = Array.isArray(schedulesRes.data) ? schedulesRes.data : [];
      } catch (err: any) {
        errorMessages.push('schedules');
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Session expired. Please log in again.');
          removeAuthToken();
          navigate('/login');
          return;
        }
      }

      try {
        const notificationsRes = await notificationAPI.getMyNotifications();
        notificationsData = Array.isArray(notificationsRes.data) ? notificationsRes.data : [];
      } catch (err: any) {
        errorMessages.push('notifications');
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Session expired. Please log in again.');
          removeAuthToken();
          navigate('/login');
          return;
        }
      }

      setAppointments(appointmentsData);
      setSchedules(schedulesData);
      setNotifications(notificationsData);

      if (errorMessages.length > 0) {
        setError(`Some data (${errorMessages.join(', ')}) could not be loaded. Showing available data.`);
      }
    } catch (err: any) {
      console.error('Doctor dashboard data loading error:', err);
      
      // Check if it's an authentication error
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Session expired. Please log in again.');
        removeAuthToken();
        navigate('/login');
        return;
      }
      
      setError('Failed to load dashboard data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;

    try {
      await scheduleAPI.deleteSchedule(scheduleId);
      await fetchDashboardData();
      alert('Schedule deleted successfully!');
    } catch (err: any) {
      alert('Failed to delete schedule: ' + err.response?.data?.message);
    }
  };

  const handleUpdateAppointmentStatus = async (appointmentId: number, status: string) => {
    try {
      await appointmentAPI.updateAppointmentStatus(appointmentId, { status });
      await fetchDashboardData();
      alert('Appointment status updated successfully!');
    } catch (err: any) {
      alert('Failed to update appointment status: ' + err.response?.data?.message);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'info';
      case 'canceled': return 'secondary';
      case 'no_show': return 'danger';
      default: return 'primary';
    }
  };

  if (loading) return (
    <div className="dashboard-wrapper">
      <DoctorSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <DoctorNavbar onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading dashboard...</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-wrapper">
      <DoctorSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <DoctorNavbar onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="dashboard-header">
            <h1 className="dashboard-title">Welcome, Doctor</h1>
            <p className="dashboard-subtitle">Your professional dashboard</p>
          </div>

          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

          <div className="dashboard-grid">
            <div className="stats-section">
              <div className="section-header">
                <h2 className="section-title">Overview</h2>
                <p className="section-subtitle">Key metrics at a glance</p>
              </div>
              <div className="stats-grid">
                <Card className="stat-card appointments">
                  <Card.Body>
                    <div className="stat-icon-wrapper">
                      <div className="stat-icon">📅</div>
                    </div>
                    <div className="stat-content">
                      <div className="stat-number">{appointments.length}</div>
                      <div className="stat-label">Appointments</div>
                    </div>
                    <div className="stat-trend positive">
                      <span className="trend-icon">↑</span>
                      <span className="trend-value">8%</span>
                    </div>
                  </Card.Body>
                </Card>
                <Card className="stat-card schedules">
                  <Card.Body>
                    <div className="stat-icon-wrapper">
                      <div className="stat-icon">🕐</div>
                    </div>
                    <div className="stat-content">
                      <div className="stat-number">{schedules.length}</div>
                      <div className="stat-label">Schedules</div>
                    </div>
                    <div className="stat-trend positive">
                      <span className="trend-icon">↑</span>
                      <span className="trend-value">5%</span>
                    </div>
                  </Card.Body>
                </Card>
                <Card className="stat-card notifications">
                  <Card.Body>
                    <div className="stat-icon-wrapper">
                      <div className="stat-icon">🔔</div>
                    </div>
                    <div className="stat-content">
                      <div className="stat-number">{notifications.length}</div>
                      <div className="stat-label">Notifications</div>
                    </div>
                    <div className="stat-trend neutral">
                      <span className="trend-icon">→</span>
                      <span className="trend-value">0%</span>
                    </div>
                  </Card.Body>
                </Card>
                <Card className="stat-card active">
                  <Card.Body>
                    <div className="stat-icon-wrapper">
                      <div className="stat-icon">⚡</div>
                    </div>
                    <div className="stat-content">
                      <div className="stat-number">{appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING').length}</div>
                      <div className="stat-label">Active Appointments</div>
                    </div>
                    <div className="stat-trend positive">
                      <span className="trend-icon">↑</span>
                      <span className="trend-value">12%</span>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </div>

            <div className="status-section">
              <div className="section-header">
                <h2 className="section-title">Appointment Status</h2>
                <p className="section-subtitle">Current appointment breakdown</p>
              </div>
              <Card className="status-card">
                <Card.Body>
                  <div className="status-grid">
                    <div className="status-item pending">
                      <div className="status-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                      </div>
                      <div className="status-info">
                        <div className="status-count">{appointments.filter(a => a.status === 'PENDING').length}</div>
                        <div className="status-label">Pending</div>
                      </div>
                    </div>
                    <div className="status-item confirmed">
                      <div className="status-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                      </div>
                      <div className="status-info">
                        <div className="status-count">{appointments.filter(a => a.status === 'CONFIRMED').length}</div>
                        <div className="status-label">Confirmed</div>
                      </div>
                    </div>
                    <div className="status-item completed">
                      <div className="status-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                      </div>
                      <div className="status-info">
                        <div className="status-count">{appointments.filter(a => a.status === 'COMPLETED').length}</div>
                        <div className="status-label">Completed</div>
                      </div>
                    </div>
                    <div className="status-item canceled">
                      <div className="status-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="15" y1="9" x2="9" y2="15"></line>
                          <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                      </div>
                      <div className="status-info">
                        <div className="status-count">{appointments.filter(a => a.status === 'CANCELED').length}</div>
                        <div className="status-label">Canceled</div>
                      </div>
                    </div>
                    <div className="status-item no-show">
                      <div className="status-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                      </div>
                      <div className="status-info">
                        <div className="status-count">{appointments.filter(a => a.status === 'NO_SHOW').length}</div>
                        <div className="status-label">No Show</div>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>

            <div className="status-section">
              <div className="section-header">
                <h2 className="section-title">Recent Notifications</h2>
                <p className="section-subtitle">Latest updates and alerts</p>
              </div>
              <Card className="status-card">
                <Card.Body>
                  {notifications.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <div className="notification-empty-icon">🔔</div>
                      <p>No notifications</p>
                    </div>
                  ) : (
                    <div className="notification-list">
                      {notifications.slice(0, 5).map((notification) => (
                        <div key={notification.notificationId} className="notification-item">
                          <div className="notification-icon">
                            🔔
                          </div>
                          <div className="notification-content">
                            <div className="notification-message">{notification.message}</div>
                            <div className="notification-time">
                              {new Date(notification.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
