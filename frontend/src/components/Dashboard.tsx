import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Badge, Button, Alert, Spinner } from 'react-bootstrap';
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

  const nextAppointment = appointments.find(a => 
    new Date(a.startTime).getTime() > Date.now() && a.status === 'CONFIRMED'
  );

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

                <Card className="stat-card patients">
                  <Card.Body>
                    <div className="stat-icon-wrapper">
                      <div className="stat-icon">👨‍⚕️</div>
                    </div>
                    <div className="stat-content">
                      <div className="stat-number">{nextAppointment ? '1' : '0'}</div>
                      <div className="stat-label">Upcoming</div>
                    </div>
                    <div className="stat-trend positive">
                      <span className="trend-icon">↑</span>
                      <span className="trend-value">Next visit</span>
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
                <h2 className="section-title">Next Appointment</h2>
                <p className="section-subtitle">Your upcoming scheduled visit</p>
              </div>
              <Card className="status-card">
                <Card.Body>
                  {nextAppointment ? (
                    <div className="d-flex align-items-center gap-4">
                      <div className="status-icon">📅</div>
                      <div className="status-info">
                        <div className="status-count">Check-up</div>
                        <div className="status-label">with Dr. {nextAppointment.doctorName}</div>
                      </div>
                      <div className="ms-auto text-end">
                        <div className="fw-bold">{new Date(nextAppointment.startTime).toLocaleDateString()}</div>
                        <div className="text-muted small">{new Date(nextAppointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted">
                      <div className="display-4 mb-2 opacity-50">📅</div>
                      <p>No upcoming appointments scheduled.</p>
                      <Button variant="primary" onClick={() => navigate('/book-appointment')} className="mt-3">Book Now</Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </div>

            <div className="status-section">
              <div className="section-header">
                <h2 className="section-title">Recent Activity</h2>
                <p className="section-subtitle">Your latest appointments</p>
              </div>
              <Card className="status-card">
                <Card.Body className="p-0">
                  {appointments.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      No appointments found. Book your first appointment!
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <Table hover className="mb-0">
                        <thead className="bg-light">
                          <tr>
                            <th className="px-4 py-3">Doctor</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {appointments.slice(0, 5).map((apt) => (
                            <tr key={apt.appointmentId}>
                              <td className="px-4 py-3">
                                <div className="fw-bold">Dr. {apt.doctorName}</div>
                                <div className="text-muted small">{apt.specialization}</div>
                              </td>
                              <td className="px-4 py-3">
                                {new Date(apt.startTime).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3">
                                <Badge bg={apt.status === 'CONFIRMED' ? 'success' : apt.status === 'CANCELED' ? 'danger' : 'warning'} className="rounded-pill">
                                  {apt.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
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
