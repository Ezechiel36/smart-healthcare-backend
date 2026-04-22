import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Spinner, Row, Col, Modal, Form, Container } from 'react-bootstrap';
import { scheduleAPI, appointmentAPI, doctorAPI } from '../services/api';

interface AvailableSlot {
  scheduleId: number;
  doctorId: number;
  doctorName: string;
  specialization: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

const BookAppointment: React.FC = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await doctorAPI.getAllDoctors();
      setDoctors(res.data);
    } catch (err) {
      setError('Failed to load available medical practitioners.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSlots = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId) return;

    try {
      setSlotsLoading(true);
      const res = await scheduleAPI.getAvailableSlots(Number(selectedDoctorId));
      const now = new Date();
      const futureSlots = res.data.filter((slot: AvailableSlot) => new Date(slot.startTime) > now);
      setAvailableSlots(futureSlots);
    } catch (err) {
      setError('Error retrieving time slots.');
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleBook = async () => {
    if (!selectedSlot) return;
    try {
      setBookingLoading(true);
      await appointmentAPI.bookAppointment({
        doctorId: selectedSlot.doctorId,
        scheduleId: selectedSlot.scheduleId
      });
      setShowConfirmModal(false);
      setAvailableSlots(availableSlots.filter(s => s.scheduleId !== selectedSlot.scheduleId));
      setSelectedSlot(null);
      alert('Successfully booked! Check "My Appointments" for details.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Booking failed.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return (
    <div className="text-center p-5">
      <Spinner animation="grow" variant="primary" />
      <p className="mt-3 text-muted">Loading medical directory...</p>
    </div>
  );

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">📅 Reserve an Appointment</h2>
        <p className="text-muted">Choose your preferred doctor and available time slot</p>
      </div>

      {error && <Alert variant="danger" className="rounded-4 mb-4" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Row>
        <Col lg={4}>
          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-3">1. Select Specialist</h5>
              <Form onSubmit={handleSearchSlots}>
                <Form.Group className="mb-3">
                  <Form.Label className="small text-muted fw-bold">CHOOSE DOCTOR</Form.Label>
                  <Form.Select 
                    size="lg"
                    className="rounded-3 border-light bg-light"
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                  >
                    <option value="">-- View Directory --</option>
                    {doctors.map(doc => (
                      <option key={doc.doctorId} value={doc.doctorId}>
                        Dr. {doc.name} ({doc.specialization})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-100 py-2 rounded-pill fw-bold shadow-sm"
                  disabled={!selectedDoctorId || slotsLoading}
                >
                  {slotsLoading ? <Spinner animation="border" size="sm" /> : 'Find Available Time'}
                </Button>
              </Form>
              <div className="mt-4 p-3 bg-primary bg-opacity-10 rounded-4 text-primary small">
                <p className="mb-0"><strong>Note:</strong> We only display verified and approved medical practitioners for your safety.</p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
            <Card.Header className="bg-white border-bottom p-4">
              <h5 className="fw-bold mb-0">2. Select Your Preferred Slot</h5>
            </Card.Header>
            <Card.Body className="p-0">
              {availableSlots.length === 0 ? (
                <div className="text-center py-5 text-muted">
                   <div className="display-1 mb-3 opacity-25">⏰</div>
                   {selectedDoctorId ? 'No slots available for this doctor.' : 'Select a doctor to view their schedule.'}
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {availableSlots.map((slot) => (
                    <div key={slot.scheduleId} className="list-group-item p-4 border-0 border-bottom slot-item">
                      <Row className="align-items-center">
                        <Col md={8}>
                          <div className="d-flex align-items-center mb-2">
                            <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2 me-3">
                              Available
                            </span>
                            <span className="fw-bold text-dark fs-5">
                              {new Date(slot.startTime).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <div className="text-muted ps-1">
                            🕒 {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                            {' - '} 
                            {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </Col>
                        <Col md={4} className="text-end">
                          <Button 
                            variant="primary" 
                            className="rounded-pill px-4 fw-bold shadow-sm"
                            onClick={() => {
                              setSelectedSlot(slot);
                              setShowConfirmModal(true);
                            }}
                          >
                            Book This Slot
                          </Button>
                        </Col>
                      </Row>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Body className="p-5 text-center">
          <div className="display-4 text-primary mb-4">🏥</div>
          <h3 className="fw-bold mb-3">Confirm Appointment</h3>
          <p className="text-muted mb-4">
            You are booking an appointment with <br/>
            <strong className="text-dark">Dr. {selectedSlot?.doctorName}</strong> <br/>
            on <strong>{selectedSlot && new Date(selectedSlot.startTime).toLocaleDateString()}</strong> at <strong>{selectedSlot && new Date(selectedSlot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Button variant="outline-secondary" onClick={() => setShowConfirmModal(false)} className="rounded-pill px-4">Change</Button>
            <Button 
              variant="primary" 
              onClick={handleBook} 
              disabled={bookingLoading}
              className="rounded-pill px-4 shadow-sm"
            >
              {bookingLoading ? <Spinner animation="border" size="sm" /> : 'Confirm Booking'}
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <style>{`
        .slot-item:hover { background-color: #f8fbff; transition: background 0.2s; cursor: pointer; }
      `}</style>
    </Container>
  );
};

export default BookAppointment;
