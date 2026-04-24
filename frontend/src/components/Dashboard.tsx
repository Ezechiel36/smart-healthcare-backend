import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Alert } from 'react-bootstrap';
import { getUser, removeAuthToken, appointmentAPI, notificationAPI } from '../services/api';
import PatientSidebar from './PatientSidebar';
import PatientNavbar from './PatientNavbar';
import './PatientDashboard.css';

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

const Dashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const user = getUser();
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
      
      // Try to fetch both appointments and notifications separately
      let appointmentsData: any[] = [];
      let notificationsData: any[] = [];
      let hasError = false;
      let errorMessages: string[] = [];

      try {
        const appointmentsRes = await appointmentAPI.getMyAppointments();
        appointmentsData = appointmentsRes.data.sort((a: any, b: any) => 
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
      } catch (err: any) {
        hasError = true;
        errorMessages.push('Appointments');
        console.error('Failed to load appointments:', err);
        
        // Check if it's an authentication error
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Session expired. Please log in again.');
          removeAuthToken();
          navigate('/login');
          return;
        }
      }

      try {
        const notificationsRes = await notificationAPI.getMyNotifications();
        notificationsData = notificationsRes.data;
      } catch (err: any) {
        hasError = true;
        errorMessages.push('Notifications');
        console.error('Failed to load notifications:', err);
        
        // Check if it's an authentication error
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Session expired. Please log in again.');
          removeAuthToken();
          navigate('/login');
          return;
        }
      }

      // Set data even if partial
      setAppointments(appointmentsData);
      setNotifications(notificationsData);

      // Show error only if both failed or if user has no data at all
      if (hasError && appointmentsData.length === 0 && notificationsData.length === 0) {
        setError(`Failed to load ${errorMessages.join(' and ')}. Please try refreshing the page.`);
      } else if (hasError) {
        setError(`Some data (${errorMessages.join(' and ')}) could not be loaded. Showing available data.`);
      }

    } catch (err: any) {
      console.error('Dashboard data loading error:', err);
      setError('Failed to load dashboard data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) return (
    <div className="dashboard-wrapper">
      <PatientSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <PatientNavbar onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Preparing your wellness overview...</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-wrapper">
      <PatientSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <PatientNavbar onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="dashboard-header">
            <h1 className="dashboard-title">Welcome back, {user?.name || 'Patient'}</h1>
            <p className="dashboard-subtitle">Your personalized health dashboard</p>
          </div>

          {error && (
            <Alert variant="warning" dismissible onClose={() => setError('')}>{error}</Alert>
          )}

          <div className="dashboard-grid">
            <div className="stats-section">
              <div className="section-header">
                <h2 className="section-title">Overview</h2>
                <p className="section-subtitle">Your health at a glance</p>
              </div>
              <div className="stats-grid">
                <Card className="stat-card appointments">
                  <Card.Body>
                    <div className="stat-icon-wrapper">
                      <div className="stat-icon">📅</div>
                    </div>
                    <div className="stat-content">
                      <div className="stat-number">{appointments.length}</div>
                      <div className="stat-label">Total Visits</div>
                    </div>
                    <div className="stat-trend neutral">
                      <span className="trend-icon">→</span>
                      <span className="trend-value">All time</span>
                    </div>
                  </Card.Body>
                </Card>

                <Card className="stat-card doctors">
                  <Card.Body>
                    <div className="stat-icon-wrapper">
                      <div className="stat-icon">🏥</div>
                    </div>
                    <div className="stat-content">
                      <div className="stat-number">{notifications.length}</div>
                      <div className="stat-label">Notifications</div>
                    </div>
                    <div className="stat-trend neutral">
                      <span className="trend-icon">🔔</span>
                      <span className="trend-value">Recent</span>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </div>

            <div className="status-section">
              <div className="section-header">
                <h2 className="section-title">Notifications</h2>
                <p className="section-subtitle">Latest updates and alerts</p>
              </div>
              <Card className="status-card">
                <Card.Body>
                  {notifications.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <div className="notification-empty-icon">🔔</div>
                      <p>No notifications at this time.</p>
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

export default Dashboard;
