import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, ListGroup, Badge, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { appointmentAPI, scheduleAPI, notificationAPI, getUser, removeAuthToken } from '../services/api';

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
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      const currentUser = getUser();
      
      if (!token || !currentUser) {
        setError('Authentication required. Please log in again.');
        navigate('/login');
        return;
      }
      
      let appointmentsData: any[] = [];
      let schedulesData: any[] = [];
      let notificationsData: any[] = [];
      const errorMessages: string[] = [];

      try {
        const appointmentsRes = await appointmentAPI.getDoctorAppointments();
        appointmentsData = Array.isArray(appointmentsRes.data) ? appointmentsRes.data : [];
      } catch (err: any) {
        errorMessages.push('appointments');
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Session expired. Please log in again.');
          removeAuthToken();
          navigate('/login');
          return;
        }
      }

      try {
        const schedulesRes = await scheduleAPI.getMySchedules();
        schedulesData = Array.isArray(schedulesRes.data) ? schedulesRes.data : [];
      } catch (err: any) {
        errorMessages.push('schedules');
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Session expired. Please log in again.');
          removeAuthToken();
          navigate('/login');
          return;
        }
      }

      try {
        const notificationsRes = await notificationAPI.getMyNotifications();
        notificationsData = Array.isArray(notificationsRes.data) ? notificationsRes.data : [];
      } catch (err: any) {
        errorMessages.push('notifications');
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Session expired. Please log in again.');
          removeAuthToken();
          navigate('/login');
          return;
        }
      }

      setAppointments(appointmentsData);
      setSchedules(schedulesData);
      setNotifications(notificationsData);

      if (errorMessages.length > 0) {
        setError(`Some data (${errorMessages.join(', ')}) could not be loaded. Showing available data.`);
      }
    } catch (err: any) {
      console.error('Doctor dashboard data loading error:', err);
      
      // Check if it's an authentication error
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Session expired. Please log in again.');
        removeAuthToken();
        navigate('/login');
        return;
      }
      
      setError('Failed to load dashboard data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;

    try {
      await scheduleAPI.deleteSchedule(scheduleId);
      await fetchDashboardData();
      alert('Schedule deleted successfully!');
    } catch (err: any) {
      alert('Failed to delete schedule: ' + err.response?.data?.message);
    }
  };

  const handleUpdateAppointmentStatus = async (appointmentId: number, status: string) => {
    try {
      await appointmentAPI.updateAppointmentStatus(appointmentId, { status });
      await fetchDashboardData();
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
      <h2>Doctor Dashboard</h2>

      {error && (
        <Alert variant="danger" dismissible className="d-flex align-items-center justify-content-between">
          <div>{error}</div>
          <Button 
            variant="outline-danger" 
            size="sm" 
            onClick={fetchDashboardData}
            className="ms-3"
          >
            Retry
          </Button>
        </Alert>
      )}

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
                          {appointment.status === 'PENDING' && (
                            <div>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="me-1"
                                onClick={() => handleUpdateAppointmentStatus(appointment.appointmentId, 'CONFIRMED')}
                              >
                                Confirm
                              </Button>
                            </div>
                          )}
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

    </div>
  );
};

export default DoctorDashboard;
