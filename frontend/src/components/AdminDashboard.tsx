import React, { useState, useEffect, useCallback } from 'react';
import { Card, Alert, Button } from 'react-bootstrap';
import { adminAPI, getUser, removeAuthToken } from '../services/api';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';
import './AdminDashboard.css';

// Backend endpoint: GET /api/admin/dashboard
// Requires: Bearer token with ADMIN role
// Returns: {
//   totalPatients: number,
//   totalDoctors: number,
//   totalAppointments: number,
//   appointmentStatusBreakdown: {
//     pending: number,
//     confirmed: number,
//     canceled: number,
//     completed: number,
//     noShow: number
//   }
// }

interface DashboardData {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  appointmentStatusBreakdown: {
    pending: number;
    confirmed: number;
    canceled: number;
    completed: number;
    noShow: number;
  };
}

const AdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const user = getUser();

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      const currentUser = getUser();
      
      if (!token || !currentUser) {
        console.error('Authentication failed: No token or user found');
        setError('Authentication required. Please log in again.');
        navigate('/login');
        return;
      }

      // Check if user has ADMIN role
      if (currentUser.role !== 'ADMIN') {
        console.error(`Authorization failed: User role is ${currentUser.role}, expected ADMIN`);
        setError('Access denied. Admin privileges required.');
        // Redirect to appropriate dashboard based on role
        if (currentUser.role === 'DOCTOR') {
          navigate('/doctor-dashboard');
        } else {
          navigate('/dashboard');
        }
        return;
      }
      
      console.log('Fetching dashboard data from endpoint: /api/admin/dashboard');
      const dashboardRes = await adminAPI.getDashboard();
      console.log('Dashboard data received:', dashboardRes.data);
      setDashboardData(dashboardRes.data);
    } catch (err: any) {
      console.error('Admin dashboard data loading error:', err);
      
      // Check if it's an authentication error
      if (err.response?.status === 401) {
        console.error('401 Unauthorized: Token may be expired or invalid');
        setError('Session expired. Please log in again.');
        removeAuthToken();
        navigate('/login');
        return;
      }
      
      if (err.response?.status === 403) {
        console.error('403 Forbidden: User lacks admin privileges');
        setError('Access denied. You do not have admin privileges.');
        return;
      }
      
      if (err.response?.status === 404) {
        console.error('404 Not Found: Dashboard endpoint not available');
        setError('Dashboard endpoint not found. Please contact support.');
        return;
      }
      
      if (err.response?.status === 500) {
        console.error('500 Internal Server Error: Backend server error');
        setError('Server error. Please try again later.');
        return;
      }
      
      if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        console.error('Request timeout: Server did not respond in time');
        setError('Request timeout. Please check your connection and try again.');
        return;
      }
      
      if (err.message.includes('Network Error')) {
        console.error('Network error: Unable to connect to server');
        setError('Network error. Please check your internet connection.');
        return;
      }
      
      // Generic error
      console.error('Unknown error:', err.message);
      setError('Failed to load dashboard data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <AdminNavbar onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="dashboard-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <AdminNavbar onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="dashboard-header">
            <h1 className="dashboard-title">
              Welcome to Admin Dashboard, {user?.name}
            </h1>
            <p className="dashboard-subtitle">
              Monitor and manage your healthcare system
            </p>
          </div>

          {error && (
            <Alert variant="danger" dismissible className="d-flex align-items-center justify-content-between">
              <div>{error}</div>
              <Button 
                variant="outline-danger" 
                size="sm" 
                onClick={fetchDashboardData}
                className="ms-3"
              >
                Retry
              </Button>
            </Alert>
          )}

          {dashboardData && (
            <div className="dashboard-grid">
              <div className="stats-section">
                <div className="section-header">
                  <h2 className="section-title">Overview</h2>
                  <p className="section-subtitle">Key metrics at a glance</p>
                </div>
                <div className="stats-grid">
                  <Card className="stat-card patients">
                    <Card.Body>
                      <div className="stat-icon-wrapper">
                        <div className="stat-icon">👥</div>
                      </div>
                      <div className="stat-content">
                        <div className="stat-number">{dashboardData.totalPatients}</div>
                        <div className="stat-label">Total Patients</div>
                      </div>
                      <div className="stat-trend positive">
                        <span className="trend-icon">↑</span>
                        <span className="trend-value">12%</span>
                      </div>
                    </Card.Body>
                  </Card>

                  <Card className="stat-card doctors">
                    <Card.Body>
                      <div className="stat-icon-wrapper">
                        <div className="stat-icon">🩺</div>
                      </div>
                      <div className="stat-content">
                        <div className="stat-number">{dashboardData.totalDoctors}</div>
                        <div className="stat-label">Total Doctors</div>
                      </div>
                      <div className="stat-trend positive">
                        <span className="trend-icon">↑</span>
                        <span className="trend-value">5%</span>
                      </div>
                    </Card.Body>
                  </Card>

                  <Card className="stat-card appointments">
                    <Card.Body>
                      <div className="stat-icon-wrapper">
                        <div className="stat-icon">📅</div>
                      </div>
                      <div className="stat-content">
                        <div className="stat-number">{dashboardData.totalAppointments}</div>
                        <div className="stat-label">Total Appointments</div>
                      </div>
                      <div className="stat-trend positive">
                        <span className="trend-icon">↑</span>
                        <span className="trend-value">18%</span>
                      </div>
                    </Card.Body>
                  </Card>

                  <Card className="stat-card active">
                    <Card.Body>
                      <div className="stat-icon-wrapper">
                        <div className="stat-icon">⚡</div>
                      </div>
                      <div className="stat-content">
                        <div className="stat-number">
                          {Object.values(dashboardData.appointmentStatusBreakdown).reduce((a, b) => a + b, 0)}
                        </div>
                        <div className="stat-label">Active Appointments</div>
                      </div>
                      <div className="stat-trend neutral">
                        <span className="trend-icon">→</span>
                        <span className="trend-value">0%</span>
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
                          <div className="status-count">{dashboardData.appointmentStatusBreakdown.pending}</div>
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
                          <div className="status-count">{dashboardData.appointmentStatusBreakdown.confirmed}</div>
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
                          <div className="status-count">{dashboardData.appointmentStatusBreakdown.completed}</div>
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
                          <div className="status-count">{dashboardData.appointmentStatusBreakdown.canceled}</div>
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
                          <div className="status-count">{dashboardData.appointmentStatusBreakdown.noShow}</div>
                          <div className="status-label">No Show</div>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
