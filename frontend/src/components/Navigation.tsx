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
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotificationCount();
    }
  }, [user]);

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
            {/* The role-specific links have been moved to Sidebar.tsx */}
          </Nav>
          <Nav className="align-items-center">
                        <div className="ms-2">
              {user ? (
                <Button variant="outline-light" onClick={handleLogout}>
                  Logout
                </Button>
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
            </div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
