import React, { useState, useEffect } from 'react';
import { Card, Alert, Spinner, Row, Col, ListGroup } from 'react-bootstrap';
import { adminAPI, notificationAPI, getUser } from '../services/api';

interface DashboardData {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  appointmentStatusBreakdown: {
    pending: number;
    confirmed: number;
    canceled: number;
    completed: number;
    noShow: number;
  };
}

const AdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const user = getUser();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, notificationsRes] = await Promise.all([
        adminAPI.getDashboard(),
        notificationAPI.getMyNotifications(),
      ]);

      setDashboardData(dashboardRes.data);
      setNotifications(notificationsRes.data);
    } catch (err: any) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
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
          {dashboardData && (
            <>
              <Row className="mb-4">
                <Col md={3}>
                  <Card className="text-center">
                    <Card.Body>
                      <h3 className="text-primary">{dashboardData.totalPatients}</h3>
                      <p>Total Patients</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center">
                    <Card.Body>
                      <h3 className="text-success">{dashboardData.totalDoctors}</h3>
                      <p>Total Doctors</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center">
                    <Card.Body>
                      <h3 className="text-info">{dashboardData.totalAppointments}</h3>
                      <p>Total Appointments</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center">
                    <Card.Body>
                      <h3 className="text-warning">
                        {Object.values(dashboardData.appointmentStatusBreakdown).reduce((a, b) => a + b, 0)}
                      </h3>
                      <p>Active Appointments</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Card className="mb-4">
                <Card.Header>
                  <h4>Appointment Status Breakdown</h4>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <ListGroup variant="flush">
                        <ListGroup.Item>
                          <strong>Pending:</strong> {dashboardData.appointmentStatusBreakdown.pending}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>Confirmed:</strong> {dashboardData.appointmentStatusBreakdown.confirmed}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>Completed:</strong> {dashboardData.appointmentStatusBreakdown.completed}
                        </ListGroup.Item>
                      </ListGroup>
                    </Col>
                    <Col md={6}>
                      <ListGroup variant="flush">
                        <ListGroup.Item>
                          <strong>Canceled:</strong> {dashboardData.appointmentStatusBreakdown.canceled}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>No Show:</strong> {dashboardData.appointmentStatusBreakdown.noShow}
                        </ListGroup.Item>
                      </ListGroup>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </>
          )}
        </Col>

        <Col md={4}>
          <Card>
            <Card.Header>
              <h4>Recent Notifications</h4>
            </Card.Header>
            <Card.Body>
              {notifications.length === 0 ? (
                <p>No notifications.</p>
              ) : (
                <ListGroup variant="flush">
                  {notifications.slice(0, 10).map((notification) => (
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

export default AdminDashboard;
