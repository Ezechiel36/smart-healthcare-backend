import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button, Badge } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getUser, removeAuthToken, notificationAPI } from '../services/api';

const Navigation: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);

    if (currentUser) {
      fetchNotificationCount();
    }
  }, []);

  const fetchNotificationCount = async () => {
    try {
      const response = await notificationAPI.getNotificationCount();
      setNotificationCount(response.data);
    } catch (error) {
      console.error('Failed to fetch notification count:', error);
    }
  };

  const handleLogout = () => {
    removeAuthToken();
    setUser(null);
    setNotificationCount(0);
    navigate('/login');
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand>Smart Healthcare</Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {!user && (
              <LinkContainer to="/about">
                <Nav.Link>About</Nav.Link>
              </LinkContainer>
            )}
            {user && (
              <LinkContainer to={
                user.role === 'ADMIN' ? '/admin-dashboard' :
                user.role === 'DOCTOR' ? '/doctor-dashboard' :
                '/dashboard'
              }>
                <Nav.Link>Dashboard</Nav.Link>
              </LinkContainer>
            )}
          </Nav>
          <Nav>
            {user ? (
              <>
                <Navbar.Text className="me-3">
                  Welcome, {user.name} ({user.role})
                  {notificationCount > 0 && (
                    <Badge bg="danger" className="ms-2">
                      {notificationCount}
                    </Badge>
                  )}
                </Navbar.Text>
                <Button variant="outline-light" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <LinkContainer to="/login">
                  <Nav.Link>Login</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/register">
                  <Nav.Link>Register</Nav.Link>
                </LinkContainer>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
