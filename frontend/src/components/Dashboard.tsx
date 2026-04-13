import React, { useState, useEffect } from 'react';
import { Card, Button, ListGroup, Badge, Alert, Spinner, Row, Col, Modal } from 'react-bootstrap';
import { appointmentAPI, scheduleAPI, notificationAPI, getUser } from '../services/api';

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

interface AvailableSlot {
  scheduleId: number;
  doctorId: number;
  doctorName: string;
  specialization: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

const Dashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const user = getUser();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, notificationsRes] = await Promise.all([
        appointmentAPI.getMyAppointments(),
        notificationAPI.getMyNotifications(),
      ]);

      setAppointments(appointmentsRes.data);
      setNotifications(notificationsRes.data);
    } catch (err: any) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedSlot) return;

    setBookingLoading(true);
    try {
      await appointmentAPI.bookAppointment({
        doctorId: selectedSlot.doctorId,
        scheduleId: selectedSlot.scheduleId,
      });

      setShowBookingModal(false);
      setSelectedSlot(null);
      fetchDashboardData(); // Refresh data
      alert('Appointment booked successfully!');
    } catch (err: any) {
      alert('Failed to book appointment: ' + err.response?.data?.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      await appointmentAPI.cancelAppointment(appointmentId);
      fetchDashboardData(); // Refresh data
      alert('Appointment cancelled successfully!');
    } catch (err: any) {
      alert('Failed to cancel appointment: ' + err.response?.data?.message);
    }
  };

  const searchAvailableSlots = async (doctorId: number) => {
    try {
      const response = await scheduleAPI.getAvailableSlots(doctorId);
      setAvailableSlots(response.data);
      setShowBookingModal(true);
    } catch (err: any) {
      alert('Failed to load available slots');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'info';
      case 'canceled': return 'secondary';
      case 'no_show': return 'danger';
      default: return 'primary';
    }
  };

  if (loading) {
    return (
      <div className="text-center">
        <Spinner animation="border" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <h2>
        {user?.role === 'DOCTOR'
          ? `Welcome to your Doctor Dashboard, Dr. ${user?.name}`
          : user?.role === 'ADMIN'
          ? `Welcome to Admin Dashboard, ${user?.name}`
          : `Welcome to your Dashboard, ${user?.name}`}
      </h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>
              <h4>My Appointments</h4>
            </Card.Header>
            <Card.Body>
              {appointments.length === 0 ? (
                <p>No appointments found.</p>
              ) : (
                <ListGroup variant="flush">
                  {appointments.map((appointment) => (
                    <ListGroup.Item key={appointment.appointmentId}>
                      <Row>
                        <Col md={8}>
                          <strong>Dr. {appointment.doctorName}</strong> ({appointment.specialization})
                          <br />
                          <small>
                            {new Date(appointment.startTime).toLocaleString()} - {new Date(appointment.endTime).toLocaleString()}
                          </small>
                        </Col>
                        <Col md={2}>
                          <Badge bg={getStatusBadgeVariant(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </Col>
                        <Col md={2}>
                          {appointment.status === 'CONFIRMED' && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleCancelAppointment(appointment.appointmentId)}
                            >
                              Cancel
                            </Button>
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

        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>
              <h4>Quick Actions</h4>
            </Card.Header>
            <Card.Body>
              <Button
                variant="primary"
                className="w-100 mb-2"
                onClick={() => searchAvailableSlots(1)} // For demo, using doctor ID 1
              >
                Book New Appointment
              </Button>
              <p className="text-muted small">Click to view available slots with doctors</p>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h4>Recent Notifications</h4>
            </Card.Header>
            <Card.Body>
              {notifications.length === 0 ? (
                <p>No notifications.</p>
              ) : (
                <ListGroup variant="flush">
                  {notifications.slice(0, 5).map((notification) => (
                    <ListGroup.Item key={notification.notificationId}>
                      <small>{notification.message}</small>
                      <br />
                      <small className="text-muted">
                        {new Date(notification.timestamp).toLocaleString()}
                      </small>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Booking Modal */}
      <Modal show={showBookingModal} onHide={() => setShowBookingModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Available Appointment Slots</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {availableSlots.length === 0 ? (
            <p>No available slots found.</p>
          ) : (
            <ListGroup>
              {availableSlots.map((slot) => (
                <ListGroup.Item key={slot.scheduleId}>
                  <Row>
                    <Col md={8}>
                      <strong>Dr. {slot.doctorName}</strong> ({slot.specialization})
                      <br />
                      <small>
                        {new Date(slot.startTime).toLocaleString()} - {new Date(slot.endTime).toLocaleString()}
                      </small>
                    </Col>
                    <Col md={4}>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => setSelectedSlot(slot)}
                        disabled={selectedSlot?.scheduleId === slot.scheduleId}
                      >
                        {selectedSlot?.scheduleId === slot.scheduleId ? 'Selected' : 'Select'}
                      </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBookingModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleBookAppointment}
            disabled={!selectedSlot || bookingLoading}
          >
            {bookingLoading ? <Spinner animation="border" size="sm" /> : 'Book Appointment'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Dashboard;
