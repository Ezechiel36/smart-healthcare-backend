import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Spinner, Alert, Container } from 'react-bootstrap';
import { appointmentAPI } from '../services/api';

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

  const canCancelAppointment = (status: string) => !['COMPLETED', 'CANCELED', 'NO_SHOW'].includes(status.toUpperCase());

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

  if (loading) return <Spinner animation="border" className="m-5" />;

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <h2 className="fw-bold">🧑‍⚕️ Patient Appointments</h2>
        <p className="text-muted">Manage your patient visits and update their status</p>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3">Patient Name</th>
                  <th className="py-3">Date & Time</th>
                  <th className="py-3">Status</th>
                  <th className="px-4 py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-5 text-muted">No patient appointments found.</td>
                  </tr>
                ) : (
                  appointments.map((apt) => (
                    <tr key={apt.appointmentId}>
                      <td className="px-4 py-3 fw-bold">{apt.patientName}</td>
                      <td>
                        <div>{new Date(apt.startTime).toLocaleDateString()}</div>
                        <small className="text-muted">
                          {new Date(apt.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                        </small>
                      </td>
                      <td>
                        <Badge bg={getBadgeVariant(apt.status)} className="px-3 py-2">
                          {apt.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-end">
                        {apt.status?.toUpperCase() === 'PENDING' && (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              className="me-2"
                              disabled={actionLoadingId === apt.appointmentId}
                              onClick={() => handleUpdateStatus(apt.appointmentId, 'CONFIRMED')}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              className="me-2"
                              disabled={actionLoadingId === apt.appointmentId}
                              onClick={() => handleUpdateStatus(apt.appointmentId, 'REJECTED')}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {apt.status?.toUpperCase() === 'CONFIRMED' && (
                          <>
                            <Button 
                              variant="success" 
                              size="sm" 
                              className="me-2"
                              disabled={actionLoadingId === apt.appointmentId}
                              onClick={() => handleUpdateStatus(apt.appointmentId, 'COMPLETED')}
                            >
                              Complete
                            </Button>
                            <Button 
                              variant="danger" 
                              size="sm"
                              className="me-2"
                              disabled={actionLoadingId === apt.appointmentId}
                              onClick={() => handleUpdateStatus(apt.appointmentId, 'NO_SHOW')}
                            >
                              No Show
                            </Button>
                          </>
                        )}
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          disabled={!canCancelAppointment(apt.status) || actionLoadingId === apt.appointmentId}
                          onClick={async () => {
                            if(window.confirm('Are you sure you want to delete this appointment?')) {
                              try {
                                setActionLoadingId(apt.appointmentId);
                                await appointmentAPI.cancelAppointment(apt.appointmentId);
                                await fetchAppointments();
                                alert('Appointment deleted/canceled.');
                              } catch (err: any) {
                                alert('Delete failed: ' + (err.response?.data?.message || err.message));
                              } finally {
                                setActionLoadingId(null);
                              }
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PatientAppointments;
