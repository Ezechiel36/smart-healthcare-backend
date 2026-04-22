import React, { useState, useEffect } from 'react';
import { Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useLocation } from 'react-router-dom';
import { getUser } from '../services/api';
import './Sidebar.css'; // We will create this for custom styling

const Sidebar: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    setUser(getUser());
  }, [location]); // Re-check user if route changes just in case

  if (!user) {
    return null; // Don't show sidebar if not logged in
  }

  return (
    <div className="sidebar bg-dark text-white p-3">
      <h5 className="mb-4 text-center border-bottom pb-2">Menu</h5>
      <Nav className="flex-column nav-pills">
        {user.role === 'PATIENT' && (
          <>
            <LinkContainer to="/dashboard">
              <Nav.Link className="text-white mb-2">🏠 My Dashboard</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/book-appointment">
              <Nav.Link className="text-white mb-2">📅 Book Appointment</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/my-appointments">
              <Nav.Link className="text-white mb-2">📋 My Appointments</Nav.Link>
            </LinkContainer>
          </>
        )}
        
        {user.role === 'DOCTOR' && (
          <>
            <LinkContainer to="/doctor-dashboard">
              <Nav.Link className="text-white mb-2">🏥 Doctor Dashboard</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/manage-schedule">
              <Nav.Link className="text-white mb-2">🕒 Manage Schedule</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/patient-appointments">
              <Nav.Link className="text-white mb-2">🧑‍⚕️ Patient Appointments</Nav.Link>
            </LinkContainer>
          </>
        )}

        {user.role === 'ADMIN' && (
          <>
            <LinkContainer to="/admin-dashboard">
              <Nav.Link className="text-white mb-2">🛡️ Admin Dashboard</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/system-analytics">
              <Nav.Link className="text-white mb-2">📊 System Analytics</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/user-management">
              <Nav.Link className="text-white mb-2">👥 Manage Users</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/doctor-approval">
              <Nav.Link className="text-white mb-2">👨‍⚕️ Doctor Verification</Nav.Link>
            </LinkContainer>
          </>
        )}
      </Nav>
    </div>
  );
};

export default Sidebar;
