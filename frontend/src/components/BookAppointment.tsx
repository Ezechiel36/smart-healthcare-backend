import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Spinner, Row, Col, Modal, Form } from 'react-bootstrap';
import { scheduleAPI, appointmentAPI, doctorAPI } from '../services/api';
import PatientSidebar from './PatientSidebar';
import PatientNavbar from './PatientNavbar';
import './PatientDashboard.css';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <div className="dashboard-wrapper">
      <PatientSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <PatientNavbar onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading available practitioners...</div>
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
            <h1 className="dashboard-title">📅 Book an Appointment</h1>
            <p className="dashboard-subtitle">Schedule your next visit with a healthcare provider</p>
          </div>

          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

          <div className="dashboard-grid">
            <div className="status-section">
              <div className="section-header">
                <h2 className="section-title">Book Appointment</h2>
                <p className="section-subtitle">Schedule your visit with a specialist</p>
              </div>
              <Card className="status-card">
                <Card.Body>
                  <Form onSubmit={handleSearchSlots}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold mb-2">Select Doctor</Form.Label>
                      <Form.Select 
                        size="lg"
                        className="rounded-3"
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
                      className="w-100 py-3 rounded-pill fw-bold"
                      disabled={!selectedDoctorId || slotsLoading}
                    >
                      {slotsLoading ? <Spinner animation="border" size="sm" /> : 'Find Available Time'}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </div>

            {availableSlots.length > 0 && (
              <div className="status-section">
                <div className="section-header">
                  <h2 className="section-title">Available Slots</h2>
                  <p className="section-subtitle">Select your preferred time</p>
                </div>
                <Card className="status-card">
                  <Card.Body>
                    <div className="row g-3">
                      {availableSlots.map((slot) => (
                        <div key={slot.scheduleId} className="col-md-4 col-sm-6">
                          <Card 
                            className={`text-center cursor-pointer border-2 ${selectedSlot?.scheduleId === slot.scheduleId ? 'border-primary bg-primary bg-opacity-10' : 'border-light'}`}
                            onClick={() => setSelectedSlot(slot)}
                            style={{ cursor: 'pointer' }}
                          >
                            <Card.Body className="p-3">
                              <div className="fw-bold mb-1">
                                {new Date(slot.startTime).toLocaleDateString()}
                              </div>
                              <div className="text-muted small">
                                {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </Card.Body>
                          </Card>
                        </div>
                      ))}
                    </div>
                    {selectedSlot && (
                      <div className="mt-4">
                        <Button 
                          variant="primary" 
                          className="w-100 py-3 rounded-pill fw-bold"
                          onClick={() => setShowConfirmModal(true)}
                        >
                          Confirm Booking
                        </Button>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </div>
            )}
          </div>

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
                  className="rounded-pill px-4"
                >
                  {bookingLoading ? <Spinner animation="border" size="sm" /> : 'Confirm Booking'}
                </Button>
              </div>
            </Modal.Body>
          </Modal>

                  </div>
      </div>
    </div>
  );
};

export default BookAppointment;