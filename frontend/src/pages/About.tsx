import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="text-center mb-4">
            <Card.Header>
              <h1>Smart Healthcare Appointment Management System</h1>
            </Card.Header>
            <Card.Body>
              <p className="lead">
                A comprehensive platform for managing healthcare appointments with secure role-based access control.
                Connect patients with doctors efficiently and manage your healthcare appointments seamlessly.
              </p>

              <Row className="mt-4">
                <Col md={4}>
                  <Card className="h-100">
                    <Card.Body>
                      <Card.Title>For Patients</Card.Title>
                      <Card.Text>
                        Book appointments with doctors, view your appointment history,
                        receive notifications, and manage your healthcare journey.
                      </Card.Text>
                      <Link to="/register">
                        <Button variant="primary">Register as Patient</Button>
                      </Link>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="h-100">
                    <Card.Body>
                      <Card.Title>For Doctors</Card.Title>
                      <Card.Text>
                        Manage your availability, view patient appointments,
                        update appointment statuses, and provide quality care.
                      </Card.Text>
                      <Link to="/register">
                        <Button variant="success">Register as Doctor</Button>
                      </Link>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="h-100">
                    <Card.Body>
                      <Card.Title>For Administrators</Card.Title>
                      <Card.Text>
                        Monitor system analytics, manage users,
                        oversee appointments, and maintain system health.
                      </Card.Text>
                      <Link to="/register">
                        <Button variant="info">Register as Admin</Button>
                      </Link>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <hr className="my-4" />

              <h3>Features</h3>
              <Row className="text-start">
                <Col md={6}>
                  <ul>
                    <li>Secure JWT-based authentication</li>
                    <li>Role-based access control (Patient, Doctor, Admin)</li>
                    <li>Real-time appointment booking</li>
                    <li>Doctor availability management</li>
                    <li>Automated notifications</li>
                  </ul>
                </Col>
                <Col md={6}>
                  <ul>
                    <li>Appointment status tracking</li>
                    <li>Comprehensive dashboards</li>
                    <li>Admin analytics and reporting</li>
                    <li>Responsive design</li>
                    <li>RESTful API architecture</li>
                  </ul>
                </Col>
              </Row>

              <div className="mt-4">
                <Link to="/login">
                  <Button variant="primary" size="lg" className="me-2">
                    Login to Your Account
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline-primary" size="lg">
                    Create New Account
                  </Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default About;
