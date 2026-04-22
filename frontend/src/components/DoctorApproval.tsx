import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Spinner, Alert, Container, Modal } from 'react-bootstrap';
import { adminAPI } from '../services/api';

interface User {
  userId: number;
  name: string;
  email: string;
}

interface Doctor {
  doctorId: number;
  user: User;
  specialization: string;
  approved: boolean;
}

const DoctorApproval: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ id: number, approve: boolean, name: string } | null>(null);

  useEffect(() => {
    fetchPendingDoctors();
  }, []);

  const fetchPendingDoctors = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getPendingDoctors();
      setDoctors(res.data);
    } catch (err) {
      setError('Failed to load pending doctor applications.');
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (id: number, approve: boolean, name: string) => {
    setPendingAction({ id, approve, name });
    setShowConfirmModal(true);
  };

  const executeAction = async () => {
    if (!pendingAction) return;
    try {
      setActionLoading(pendingAction.id);
      await adminAPI.updateDoctorApproval(pendingAction.id, pendingAction.approve);
      setDoctors(doctors.filter(d => d.doctorId !== pendingAction.id));
      setShowConfirmModal(false);
    } catch (err) {
      setError('Failed to update doctor status.');
    } finally {
      setActionLoading(null);
      setPendingAction(null);
    }
  };

  if (loading) return (
    <div className="text-center p-5">
      <Spinner animation="border" variant="primary" />
      <p className="mt-2 text-muted">Retrieving pending credentials...</p>
    </div>
  );

  return (
    <Container fluid className="py-4 px-0">
      <div className="d-flex justify-content-between align-items-center mb-4 px-3">
        <div>
          <h2 className="fw-bold mb-1">👨‍⚕️ Doctor Verification</h2>
          <p className="text-muted mb-0">Review and approve medical practitioner applications</p>
        </div>
        <Badge bg="warning" text="dark" className="px-3 py-2 rounded-pill shadow-sm">
          {doctors.length} Awaiting Review
        </Badge>
      </div>

      {error && <Alert variant="danger" className="mx-3 rounded-4" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Card className="border-0 shadow-sm rounded-4 overflow-hidden mx-3">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="bg-light border-bottom">
                <tr>
                  <th className="px-4 py-3 text-muted small fw-bold text-uppercase">Doctor Info</th>
                  <th className="py-3 text-muted small fw-bold text-uppercase">Specialization</th>
                  <th className="py-3 text-muted small fw-bold text-uppercase">Contact</th>
                  <th className="px-4 py-3 text-muted small fw-bold text-uppercase text-end">Verification</th>
                </tr>
              </thead>
              <tbody>
                {doctors.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-5 text-muted">
                      <div className="py-4">
                        <span className="display-4 d-block mb-3">📋</span>
                        No pending applications found.
                      </div>
                    </td>
                  </tr>
                ) : (
                  doctors.map((doctor) => (
                    <tr key={doctor.doctorId} className="approval-row">
                      <td className="px-4 py-3">
                        <div className="d-flex align-items-center">
                          <div className="avatar me-3 rounded-circle bg-primary-soft text-primary d-flex align-items-center justify-content-center fw-bold" style={{ width: '40px', height: '40px' }}>
                            {doctor.user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="fw-bold text-dark">{doctor.user.name}</div>
                            <small className="text-muted">ID: #{doctor.doctorId}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge bg="info" className="bg-opacity-10 text-info border border-info border-opacity-25 px-2 py-1">
                          {doctor.specialization}
                        </Badge>
                      </td>
                      <td className="text-muted small">{doctor.user.email}</td>
                      <td className="px-4 py-3 text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <Button 
                            variant="success" 
                            size="sm" 
                            className="rounded-pill px-3 fw-bold"
                            onClick={() => handleActionClick(doctor.doctorId, true, doctor.user.name)}
                            disabled={actionLoading === doctor.doctorId}
                          >
                            Approve
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            className="rounded-pill px-3 fw-bold"
                            onClick={() => handleActionClick(doctor.doctorId, false, doctor.user.name)}
                            disabled={actionLoading === doctor.doctorId}
                          >
                            Reject
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

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Body className="text-center p-5">
          <div className={`display-1 ${pendingAction?.approve ? 'text-success' : 'text-danger'} mb-4`}>
            {pendingAction?.approve ? '✅' : '🚫'}
          </div>
          <h3 className="fw-bold mb-3">{pendingAction?.approve ? 'Approve' : 'Reject'} Practitioner</h3>
          <p className="text-muted mb-4">
            Are you sure you want to {pendingAction?.approve ? 'approve' : 'reject'} <strong>{pendingAction?.name}</strong>? 
            {pendingAction?.approve ? ' This will grant them full access to the medical system.' : ' This will deny their current application.'}
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Button variant="outline-secondary" onClick={() => setShowConfirmModal(false)} className="rounded-pill px-4">Cancel</Button>
            <Button 
              variant={pendingAction?.approve ? 'success' : 'danger'} 
              onClick={executeAction}
              className="rounded-pill px-4"
              disabled={actionLoading !== null}
            >
              {actionLoading ? <Spinner animation="border" size="sm" /> : 'Confirm Action'}
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <style>{`
        .bg-primary-soft { background-color: rgba(13, 110, 253, 0.1); }
        .approval-row:hover { background-color: #f8fbff; transition: all 0.2s; }
      `}</style>
    </Container>
  );
};

export default DoctorApproval;
