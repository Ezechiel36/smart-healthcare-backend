import React, { useState, useEffect } from 'react';
import { Card, Button, ListGroup, Badge, Alert, Spinner, Row, Col, Modal, Form } from 'react-bootstrap';
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

interface Schedule {
  scheduleId: number;
  doctorId: number;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

const DoctorDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    startTime: '',
    endTime: '',
  });
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const user = getUser();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, schedulesRes, notificationsRes] = await Promise.all([
        appointmentAPI.getDoctorAppointments(),
        scheduleAPI.getMySchedules(),
        notificationAPI.getMyNotifications(),
      ]);

      setAppointments(appointmentsRes.data);
      setSchedules(schedulesRes.data);
      setNotifications(notificationsRes.data);
    } catch (err: any) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = async () => {
    setScheduleLoading(true);
    try {
      await scheduleAPI.addAvailability({
        startTime: new Date(newSchedule.startTime).toISOString(),
        endTime: new Date(newSchedule.endTime).toISOString(),
      });

      setShowAddScheduleModal(false);
      setNewSchedule({ startTime: '', endTime: '' });
      fetchDashboardData(); // Refresh data
      alert('Schedule added successfully!');
    } catch (err: any) {
      alert('Failed to add schedule: ' + err.response?.data?.message);
    } finally {
      setScheduleLoading(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;

    try {
      await scheduleAPI.deleteSchedule(scheduleId);
      fetchDashboardData(); // Refresh data
      alert('Schedule deleted successfully!');
    } catch (err: any) {
      alert('Failed to delete schedule: ' + err.response?.data?.message);
    }
  };

  const handleUpdateAppointmentStatus = async (appointmentId: number, status: string) => {
    try {
      await appointmentAPI.updateAppointmentStatus(appointmentId, { status });
      fetchDashboardData(); // Refresh data
      alert('Appointment status updated successfully!');
    } catch (err: any) {
      alert('Failed to update appointment status: ' + err.response?.data?.message);
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
                        <Col md={6}>
                          <strong>{appointment.patientName}</strong>
                          <br />
                          <small>
                            {new Date(appointment.startTime).toLocaleString()} - {new Date(appointment.endTime).toLocaleString()}
                          </small>
                        </Col>
                        <Col md={3}>
                          <Badge bg={getStatusBadgeVariant(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </Col>
                        <Col md={3}>
                          {appointment.status === 'CONFIRMED' && (
                            <div>
                              <Button
                                variant="outline-success"
                                size="sm"
                                className="me-1"
                                onClick={() => handleUpdateAppointmentStatus(appointment.appointmentId, 'COMPLETED')}
                              >
                                Complete
                              </Button>
                              <Button
                                variant="outline-warning"
                                size="sm"
                                onClick={() => handleUpdateAppointmentStatus(appointment.appointmentId, 'NO_SHOW')}
                              >
                                No Show
                              </Button>
                            </div>
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
              <h4>Manage Availability</h4>
            </Card.Header>
            <Card.Body>
              <Button
                variant="primary"
                className="w-100 mb-3"
                onClick={() => setShowAddScheduleModal(true)}
              >
                Add New Schedule
              </Button>

              <h6>My Schedules</h6>
              {schedules.length === 0 ? (
                <p>No schedules found.</p>
              ) : (
                <ListGroup variant="flush">
                  {schedules.map((schedule) => (
                    <ListGroup.Item key={schedule.scheduleId}>
                      <Row>
                        <Col md={8}>
                          <small>
                            {new Date(schedule.startTime).toLocaleString()} - {new Date(schedule.endTime).toLocaleString()}
                          </small>
                          <br />
                          <Badge bg={schedule.isBooked ? 'danger' : 'success'}>
                            {schedule.isBooked ? 'Booked' : 'Available'}
                          </Badge>
                        </Col>
                        <Col md={4}>
                          {!schedule.isBooked && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteSchedule(schedule.scheduleId)}
                            >
                              Delete
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

      {/* Add Schedule Modal */}
      <Modal show={showAddScheduleModal} onHide={() => setShowAddScheduleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Schedule</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Start Time</Form.Label>
              <Form.Control
                type="datetime-local"
                value={newSchedule.startTime}
                onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>End Time</Form.Label>
              <Form.Control
                type="datetime-local"
                value={newSchedule.endTime}
                onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddScheduleModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddSchedule}
            disabled={scheduleLoading || !newSchedule.startTime || !newSchedule.endTime}
          >
            {scheduleLoading ? <Spinner animation="border" size="sm" /> : 'Add Schedule'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DoctorDashboard;
