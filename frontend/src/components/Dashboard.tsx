import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, Alert, Spinner, Row, Col, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { appointmentAPI, notificationAPI, getUser, removeAuthToken } from '../services/api';

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

const Dashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const user = getUser();
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
      
      // Try to fetch both appointments and notifications separately
      let appointmentsData: any[] = [];
      let notificationsData: any[] = [];
      let hasError = false;
      let errorMessages: string[] = [];

      try {
        const appointmentsRes = await appointmentAPI.getMyAppointments();
        appointmentsData = appointmentsRes.data.sort((a: any, b: any) => 
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
      } catch (err: any) {
        hasError = true;
        errorMessages.push('Appointments');
        console.error('Failed to load appointments:', err);
        
        // Check if it's an authentication error
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Session expired. Please log in again.');
          removeAuthToken();
          navigate('/login');
          return;
        }
      }

      try {
        const notificationsRes = await notificationAPI.getMyNotifications();
        notificationsData = notificationsRes.data;
      } catch (err: any) {
        hasError = true;
        errorMessages.push('Notifications');
        console.error('Failed to load notifications:', err);
        
        // Check if it's an authentication error
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Session expired. Please log in again.');
          removeAuthToken();
          navigate('/login');
          return;
        }
      }

      // Set data even if partial
      setAppointments(appointmentsData);
      setNotifications(notificationsData);

      // Show error only if both failed or if user has no data at all
      if (hasError && appointmentsData.length === 0 && notificationsData.length === 0) {
        setError(`Failed to load ${errorMessages.join(' and ')}. Please try refreshing the page.`);
      } else if (hasError) {
        setError(`Some data (${errorMessages.join(' and ')}) could not be loaded. Showing available data.`);
      }

    } catch (err: any) {
      console.error('Dashboard data loading error:', err);
      setError('Failed to load dashboard data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const nextAppointment = appointments.find(a => 
    new Date(a.startTime).getTime() > Date.now() && a.status === 'CONFIRMED'
  );

  if (loading) return (
    <div className="text-center p-5">
      <Spinner animation="grow" variant="primary" />
      <p className="mt-3 text-muted">Preparing your wellness overview...</p>
    </div>
  );

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Hello, {user?.name}! 👋</h2>
          <p className="text-muted">Welcome back to your healthcare portal.</p>
        </div>
      </div>

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

      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-4 bg-primary text-white p-3 h-100">
            <Card.Body className="d-flex flex-column justify-content-between">
              <div>
                <span className="opacity-75 small fw-bold text-uppercase ls-1">TOTAL VISITS</span>
                <h2 className="display-4 fw-bold mt-2 mb-0">{appointments.length}</h2>
              </div>
              <div className="mt-4 small opacity-75">Your complete medical journey history</div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={8}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4 d-flex align-items-center">
              {nextAppointment ? (
                <div className="w-100">
                   <div className="d-flex justify-content-between align-items-center mb-3">
                     <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2">UPCOMING VISIT</span>
                     <span className="text-muted small">{new Date(nextAppointment.startTime).toLocaleDateString()}</span>
                   </div>
                   <h4 className="fw-bold mb-2">Check-up with Dr. {nextAppointment.doctorName}</h4>
                   <p className="text-muted mb-0">
                     <span className="me-3">👨‍⚕️ {nextAppointment.specialization}</span>
                     <span>🕒 {new Date(nextAppointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                   </p>
                </div>
              ) : (
                <div className="text-center w-100 py-4 opacity-50">
                  <div className="display-4 mb-2">📅</div>
                  <p className="mb-0">No upcoming appointments scheduled.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 border-top pt-4">
        <Col lg={7}>
           <Card className="border-0 bg-transparent">
             <div className="d-flex justify-content-between align-items-center mb-3">
               <h5 className="fw-bold mb-0">Recent Activity</h5>
               <Button variant="link" onClick={() => navigate('/my-appointments')} className="text-decoration-none p-0">View All →</Button>
             </div>
             <div className="bg-white rounded-4 shadow-sm overflow-hidden">
               {appointments.length === 0 ? (
                 <div className="p-5 text-center text-muted">
                   <div className="display-4 mb-3"> calendar</div>
                   <h5 className="mb-2">No appointments yet</h5>
                   <p className="mb-3">Book your first appointment to get started with your healthcare journey.</p>
                   <Button variant="primary" onClick={() => navigate('/book-appointment')}>
                     Book Appointment
                   </Button>
                 </div>
               ) : (
                 <div className="list-group list-group-flush">
                   {appointments.slice(0, 4).map(apt => (
                     <div key={apt.appointmentId} className="list-group-item p-3 border-light border-bottom-0">
                       <Row className="align-items-center">
                         <Col className="flex-grow-1">
                           <div className="fw-bold">{apt.doctorName}</div>
                           <small className="text-muted">{new Date(apt.startTime).toLocaleDateString()}</small>
                         </Col>
                         <Col xs="auto">
                           <Badge bg={apt.status === 'CONFIRMED' ? 'success' : 'secondary'} className="px-2 py-1">
                             {apt.status}
                           </Badge>
                         </Col>
                       </Row>
                     </div>
                   ))}
                 </div>
               )}
             </div>
           </Card>
        </Col>

        <Col lg={5}>
          <Card className="border-0 bg-transparent">
            <h5 className="fw-bold mb-3">Notifications</h5>
            <div className="bg-white rounded-4 shadow-sm overflow-hidden">
              {notifications.length === 0 ? (
                <div className="p-5 text-center text-muted small">Stay tuned for updates here.</div>
              ) : (
                <div className="list-group list-group-flush">
                  {notifications.slice(0, 5).map(note => (
                    <div key={note.notificationId} className={`list-group-item p-3 border-light ${note.message.includes('confirmed') ? 'border-success border-2' : ''}`}>
                      <div className="small mb-1">
                        {note.message.includes('confirmed') && <span className="text-success me-1"> confirmed</span>}
                        {note.message}
                      </div>
                      <div className="text-muted" style={{ fontSize: '10px' }}>
                        {new Date(note.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
