import React, { useState, useEffect } from 'react';
import { Card, Button, ListGroup, Badge, Alert, Spinner, Row, Col, Modal, Form, Container } from 'react-bootstrap';
import { scheduleAPI } from '../services/api';

interface Schedule {
  scheduleId: number;
  doctorId: number;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

const ManageSchedule: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newSlot, setNewSlot] = useState({ startTime: '', endTime: '' });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  
  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await scheduleAPI.getMySchedules();
      setSchedules(res.data);
    } catch (err: any) {
      setError('Could not load your schedules.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAvailability = async () => {
    if (!newSlot.startTime || !newSlot.endTime) return;

    if (new Date(newSlot.startTime) < new Date()) {
      alert('Cannot set availability in the past. Please select a future date and time.');
      return;
    }

    if (new Date(newSlot.endTime) <= new Date(newSlot.startTime)) {
      alert('End time must be after the start time.');
      return;
    }
    try {
      setSaving(true);
      const payload = {
        startTime: new Date(newSlot.startTime).toISOString(),
        endTime: new Date(newSlot.endTime).toISOString(),
      };
      
      if (editingId) {
        await scheduleAPI.updateAvailability(editingId, payload);
        alert('Availability updated!');
      } else {
        await scheduleAPI.addAvailability(payload);
        alert('Availability slot added!');
      }
      
      setShowModal(false);
      setEditingId(null);
      setNewSlot({ startTime: '', endTime: '' });
      fetchSchedules();
    } catch (err: any) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this availability?')) return;
    try {
      await scheduleAPI.deleteSchedule(id);
      fetchSchedules();
    } catch (err: any) {
      alert('Delete failed: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <Spinner animation="border" className="m-5" />;

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">🕒 Manage My Schedule</h2>
          <p className="text-muted">Set your working hours and availability</p>
        </div>
        <Button variant="primary" onClick={() => {
          setEditingId(null);
          setNewSlot({ startTime: '', endTime: '' });
          setShowModal(true);
        }}>+ Add Time Slot</Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col md={12}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white py-3">
              <h5 className="mb-0">Your Availability Slots</h5>
            </Card.Header>
            <Card.Body>
              {schedules.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">You haven't added any availability yet.</p>
                </div>
              ) : (
                <ListGroup variant="flush">
                  {schedules.map((s) => (
                    <ListGroup.Item key={s.scheduleId} className="px-0 py-3">
                      <Row className="align-items-center">
                        <Col md={5}>
                          <div className="fw-bold">{new Date(s.startTime).toLocaleDateString()}</div>
                          <div className="text-muted">
                            {new Date(s.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - 
                            {new Date(s.endTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                          </div>
                        </Col>
                        <Col md={3}>
                          <Badge bg={s.isBooked ? 'danger' : 'success'} className="px-3 py-2">
                            {s.isBooked ? 'Booked' : 'Available'}
                          </Badge>
                        </Col>
                        <Col md={4} className="text-end">
                          {!s.isBooked && (
                            <>
                                <Button 
                                  variant="warning" 
                                  size="sm" 
                                  className="me-2 text-dark"
                                  onClick={() => {
                                    setEditingId(s.scheduleId);
                                    setNewSlot({
                                      startTime: new Date(new Date(s.startTime).getTime() - new Date(s.startTime).getTimezoneOffset() * 60000).toISOString().slice(0, 16),
                                      endTime: new Date(new Date(s.endTime).getTime() - new Date(s.endTime).getTimezoneOffset() * 60000).toISOString().slice(0, 16)
                                    });
                                    setShowModal(true);
                                  }}
                                >
                                  Reschedule
                                </Button>
                              <Button variant="outline-danger" size="sm" onClick={() => handleDelete(s.scheduleId)}>
                                Delete
                              </Button>
                            </>
                          )}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? 'Reschedule Availability' : 'Add New Availability'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Start Time</Form.Label>
              <Form.Control 
                type="datetime-local" 
                value={newSlot.startTime}
                min={new Date().toISOString().slice(0, 16)}
                onChange={e => setNewSlot({...newSlot, startTime: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>End Time</Form.Label>
              <Form.Control 
                type="datetime-local" 
                value={newSlot.endTime}
                min={newSlot.startTime || new Date().toISOString().slice(0, 16)}
                onChange={e => setNewSlot({...newSlot, endTime: e.target.value})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveAvailability} disabled={saving}>
            {saving ? <Spinner size="sm" animation="border" /> : (editingId ? 'Save Changes' : 'Save Availability')}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ManageSchedule;
