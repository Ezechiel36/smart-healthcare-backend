import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './PatientSidebar.css';

interface PatientSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const PatientSidebar: React.FC<PatientSidebarProps> = ({ isOpen, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
    { id: 'book', label: 'Book Appointment', icon: '📅', path: '/book-appointment' },
    { id: 'appointments', label: 'My Appointments', icon: '🗓️', path: '/my-appointments' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onToggle}></div>
      <aside className={`patient-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">🏥</span>
            <span className="logo-text">SmartHealth</span>
          </div>
          <button className="sidebar-toggle close-btn" onClick={onToggle}>
            ✕
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            {menuItems.map((item) => (
              <li key={item.id} className="nav-item">
                <button
                  className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => handleNavigation(item.path)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  {isActive(item.path) && <span className="nav-indicator"></span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <span>👤</span>
            </div>
            <div className="user-details">
              <div className="user-name">Patient</div>
              <div className="user-role">Patient Portal</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default PatientSidebar;
