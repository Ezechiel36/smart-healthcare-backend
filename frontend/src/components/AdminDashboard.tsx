import React, { useState, useEffect, useCallback } from 'react';
import { Card, Alert, Button } from 'react-bootstrap';
import { adminAPI, getUser, removeAuthToken } from '../services/api';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

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
        setError('Authentication required. Please log in again.');
        navigate('/login');
        return;
      }
      
      const dashboardRes = await adminAPI.getDashboard();
      setDashboardData(dashboardRes.data);
    } catch (err: any) {
      console.error('Admin dashboard data loading error:', err);
      
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">
            {user?.role === 'DOCTOR'
              ? `Welcome to your Doctor Dashboard, Dr. ${user?.name}`
              : user?.role === 'ADMIN'
              ? `Welcome to Admin Dashboard, ${user?.name}`
              : `Welcome to your Dashboard, ${user?.name}`}
          </h1>
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
          <>
            <div className="stats-grid">
              <Card className="stat-card patients">
                <Card.Body>
                  <div className="stat-icon">
                    👥
                  </div>
                  <div className="stat-number">{dashboardData.totalPatients}</div>
                  <div className="stat-label">Total Patients</div>
                </Card.Body>
              </Card>

              <Card className="stat-card doctors">
                <Card.Body>
                  <div className="stat-icon">
                    🩺
                  </div>
                  <div className="stat-number">{dashboardData.totalDoctors}</div>
                  <div className="stat-label">Total Doctors</div>
                </Card.Body>
              </Card>

              <Card className="stat-card appointments">
                <Card.Body>
                  <div className="stat-icon">
                    📅
                  </div>
                  <div className="stat-number">{dashboardData.totalAppointments}</div>
                  <div className="stat-label">Total Appointments</div>
                </Card.Body>
              </Card>

              <Card className="stat-card active">
                <Card.Body>
                  <div className="stat-icon">
                    ⚡
                  </div>
                  <div className="stat-number">
                    {Object.values(dashboardData.appointmentStatusBreakdown).reduce((a, b) => a + b, 0)}
                  </div>
                  <div className="stat-label">Active Appointments</div>
                </Card.Body>
              </Card>
            </div>

            <Card className="status-card">
              <Card.Body>
                <h3 className="status-header">Appointment Status Breakdown</h3>
                <div className="status-grid">
                  <div className="status-item pending">
                    <div className="status-label">Pending</div>
                    <div className="status-count">{dashboardData.appointmentStatusBreakdown.pending}</div>
                  </div>
                  <div className="status-item confirmed">
                    <div className="status-label">Confirmed</div>
                    <div className="status-count">{dashboardData.appointmentStatusBreakdown.confirmed}</div>
                  </div>
                  <div className="status-item completed">
                    <div className="status-label">Completed</div>
                    <div className="status-count">{dashboardData.appointmentStatusBreakdown.completed}</div>
                  </div>
                  <div className="status-item canceled">
                    <div className="status-label">Canceled</div>
                    <div className="status-count">{dashboardData.appointmentStatusBreakdown.canceled}</div>
                  </div>
                  <div className="status-item no-show">
                    <div className="status-label">No Show</div>
                    <div className="status-count">{dashboardData.appointmentStatusBreakdown.noShow}</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
