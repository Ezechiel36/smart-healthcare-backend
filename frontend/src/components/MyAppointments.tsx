import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Spinner, Alert, Container, Modal, Row, Col } from 'react-bootstrap';
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

const MyAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  
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

  const handleDelete = async () => {
    if (!selectedApt) return;
    try {
      setActionLoading(true);
      await appointmentAPI.cancelAppointment(selectedApt.appointmentId);
      setShowDeleteModal(false);
      setSelectedApt(null);
      await fetchAppointments();
      alert('Appointment deleted successfully.');
    } catch (err: any) {
      alert('Failed to delete: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const canCancelAppointment = (status: string) => !['COMPLETED', 'CANCELED', 'NO_SHOW'].includes(status.toUpperCase());

  const getBadgeVariant = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CONFIRMED': return 'success';
      case 'PENDING': return 'warning';
      case 'COMPLETED': return 'info';
      case 'CANCELED': return 'secondary';
      case 'NO_SHOW': return 'danger';
      default: return 'primary';
    }
  };

  if (loading && appointments.length === 0) return (
    <div className="text-center p-5">
      <Spinner animation="border" variant="primary" />
      <p className="mt-2 text-muted">Retrieving your appointments...</p>
    </div>
  );

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">📋 My Appointments</h2>
          <p className="text-muted">Manage all your scheduled healthcare visits</p>
        </div>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="bg-light text-secondary text-uppercase small fw-bold">
                <tr>
                  <th className="px-4 py-3">Doctor</th>
                  <th className="py-3">Specialization</th>
                  <th className="py-3">Date & Time</th>
                  <th className="py-3">Status</th>
                  <th className="px-4 py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-5 text-muted">
                      No appointments found. Book your first appointment!
                    </td>
                  </tr>
                ) : (
                  appointments.map((apt) => (
                    <tr key={apt.appointmentId}>
                      <td className="px-4 py-3">
                        <div className="fw-bold text-primary">Dr. {apt.doctorName}</div>
                      </td>
                      <td>{apt.specialization}</td>
                      <td>
                        <div className="fw-medium">{new Date(apt.startTime).toLocaleDateString()}</div>
                        <small className="text-muted">
                          {new Date(apt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </small>
                      </td>
                      <td>
                        <Badge bg={getBadgeVariant(apt.status)} className="px-3 py-2 fw-medium rounded-pill">
                          {apt.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <Button 
                            variant="light" 
                            size="sm" 
                            className="rounded-pill px-3"
                            onClick={() => {
                              setSelectedApt(apt);
                              setShowViewModal(true);
                            }}
                          >
                            👁️ View
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            className="rounded-pill px-3"
                            disabled={!canCancelAppointment(apt.status)}
                            onClick={() => {
                              setSelectedApt(apt);
                              setShowDeleteModal(true);
                            }}
                          >
                            🗑️ Cancel
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* View Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Appointment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedApt && (
            <div className="text-center">
              <div className="display-4 mb-3">👨‍⚕️</div>
              <h4 className="fw-bold">Dr. {selectedApt.doctorName}</h4>
              <p className="text-primary fw-medium mb-4">{selectedApt.specialization}</p>
              
              <div className="bg-light p-3 rounded-4 mb-3 text-start">
                <Row className="mb-2">
                  <Col xs={4} className="text-muted small">DATE</Col>
                  <Col xs={8} className="fw-bold">{new Date(selectedApt.startTime).toLocaleDateString(undefined, { dateStyle: 'long' })}</Col>
                </Row>
                <Row className="mb-2">
                  <Col xs={4} className="text-muted small">TIME</Col>
                  <Col xs={8} className="fw-bold">
                    {new Date(selectedApt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                    {new Date(selectedApt.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Col>
                </Row>
                <Row>
                  <Col xs={4} className="text-muted small">STATUS</Col>
                  <Col xs={8}>
                    <Badge bg={getBadgeVariant(selectedApt.status)} className="rounded-pill">
                      {selectedApt.status}
                    </Badge>
                  </Col>
                </Row>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="primary" className="w-100 rounded-pill py-2" onClick={() => setShowViewModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
        <Modal.Body className="p-4 text-center">
          <div className="text-danger display-4 mb-3">⚠️</div>
          <h5 className="fw-bold">Cancel Appointment?</h5>
          <p className="text-muted small">This appointment will be marked as canceled. Are you sure you want to proceed?</p>
          <div className="d-flex gap-2 mt-4">
            <Button variant="light" className="w-100 rounded-pill" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" className="w-100 rounded-pill" onClick={handleDelete} disabled={actionLoading}>
              {actionLoading ? <Spinner animation="border" size="sm" /> : 'Confirm'}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default MyAppointments;
