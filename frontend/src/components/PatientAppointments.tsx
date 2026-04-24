import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { appointmentAPI } from '../services/api';
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

const PatientAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await appointmentAPI.getDoctorAppointments();
      setAppointments(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setError('Failed to load patient appointments.');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      setActionLoadingId(id);
      await appointmentAPI.updateAppointmentStatus(id, { status });
      await fetchAppointments();
      alert('Status updated to ' + status);
    } catch (err: any) {
      alert('Update failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoadingId(null);
    }
  };

  const getBadgeVariant = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CONFIRMED': return 'success';
      case 'PENDING': return 'warning';
      case 'REJECTED': return 'danger';
      case 'COMPLETED': return 'info';
      case 'CANCELED': return 'secondary';
      case 'NO_SHOW': return 'dark';
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
          <div className="loading-text">Loading appointments...</div>
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
            <h1 className="dashboard-title">Patient Appointments</h1>
            <p className="dashboard-subtitle">Manage your patient visits and update their status</p>
          </div>

          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

          <div className="dashboard-grid">
            <div className="status-section">
              <div className="section-header">
                <h2 className="section-title">Appointments</h2>
                <p className="section-subtitle">Your patient visits</p>
              </div>
              <Card className="status-card">
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <Table hover className="mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th className="px-4 py-3">Patient</th>
                          <th className="px-4 py-3">Date & Time</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center py-5 text-muted">
                              No appointments found.
                            </td>
                          </tr>
                        ) : (
                          appointments.map((apt) => (
                            <tr key={apt.appointmentId}>
                              <td className="px-4 py-3">
                                <div className="fw-bold">{apt.patientName}</div>
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
                              <td className="px-4 py-3">
                                {apt.status?.toUpperCase() === 'PENDING' && (
                                  <Button
                                    variant="outline-success"
                                    size="sm"
                                    className="rounded-pill"
                                    onClick={() => handleUpdateStatus(apt.appointmentId, 'CONFIRMED')}
                                    disabled={actionLoadingId === apt.appointmentId}
                                  >
                                    {actionLoadingId === apt.appointmentId ? <Spinner animation="border" size="sm" /> : 'Confirm'}
                                  </Button>
                                )}
                                {apt.status?.toUpperCase() === 'CONFIRMED' && (
                                  <>
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      className="rounded-pill me-2"
                                      onClick={() => handleUpdateStatus(apt.appointmentId, 'COMPLETED')}
                                      disabled={actionLoadingId === apt.appointmentId}
                                    >
                                      {actionLoadingId === apt.appointmentId ? <Spinner animation="border" size="sm" /> : 'Complete'}
                                    </Button>
                                    <Button
                                      variant="outline-warning"
                                      size="sm"
                                      className="rounded-pill"
                                      onClick={() => handleUpdateStatus(apt.appointmentId, 'NO_SHOW')}
                                      disabled={actionLoadingId === apt.appointmentId}
                                    >
                                      {actionLoadingId === apt.appointmentId ? <Spinner animation="border" size="sm" /> : 'No Show'}
                                    </Button>
                                  </>
                                )}
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

export default PatientAppointments;
