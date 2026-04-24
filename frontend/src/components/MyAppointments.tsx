import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Alert } from 'react-bootstrap';
import { appointmentAPI } from '../services/api';
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

const MyAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await appointmentAPI.getMyAppointments();
      setAppointments(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setError('Failed to load your appointments. Please try again later.');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'CANCELED':
        return 'danger';
      case 'COMPLETED':
        return 'primary';
      default:
        return 'warning';
    }
  };

  if (loading) return (
    <div className="dashboard-wrapper">
      <PatientSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <PatientNavbar onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading your appointments...</div>
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
            <h1 className="dashboard-title">🗓️ My Appointments</h1>
            <p className="dashboard-subtitle">View and manage your scheduled appointments</p>
          </div>
          <div className="d-flex gap-2 align-items-center mb-3">
            <Button variant="primary" onClick={() => window.location.href = '/book-appointment'} className="rounded-pill px-4 fw-bold shadow-sm">Book New</Button>
          </div>

          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

          <div className="dashboard-grid">
            <div className="status-section">
              <div className="section-header">
                <h2 className="section-title">My Appointments</h2>
                <p className="section-subtitle">View and manage your scheduled appointments</p>
              </div>
              <Card className="status-card">
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <Table hover className="mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th className="px-4 py-3">Doctor</th>
                          <th className="px-4 py-3">Specialization</th>
                          <th className="px-4 py-3">Date & Time</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center py-5 text-muted">
                              No appointments found. Book your first appointment!
                            </td>
                          </tr>
                        ) : (
                          appointments.map((apt) => (
                            <tr key={apt.appointmentId}>
                              <td className="px-4 py-3">
                                <div className="fw-bold">Dr. {apt.doctorName}</div>
                              </td>
                              <td className="px-4 py-3">
                                {apt.specialization}
                              </td>
                              <td className="px-4 py-3">
                                <div className="fw-medium">{new Date(apt.startTime).toLocaleDateString()}</div>
                                <small className="text-muted">
                                  {new Date(apt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </small>
                              </td>
                              <td className="px-4 py-3">
                                <Badge bg={getBadgeVariant(apt.status)} className="rounded-pill">
                                  {apt.status}
                                </Badge>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MyAppointments;
