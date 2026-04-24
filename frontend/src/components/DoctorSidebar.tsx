import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../services/api';
import './DoctorSidebar.css';

interface DoctorSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const DoctorSidebar: React.FC<DoctorSidebarProps> = ({ isOpen, onToggle }) => {
  const navigate = useNavigate();
  const user = getUser();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/doctor-dashboard' },
    { id: 'schedule', label: 'Manage Schedule', icon: '📅', path: '/manage-schedule' },
    { id: 'appointments', label: 'Patient Appointments', icon: '🗓️', path: '/patient-appointments' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onToggle}></div>
      <aside className={`doctor-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">🏥</span>
            <span className="logo-text">Smart Healthcare</span>
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
                  className={`nav-link ${window.location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => handleNavigation(item.path)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  {window.location.pathname === item.path && <div className="nav-indicator"></div>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">👨‍⚕️</div>
            <div className="user-details">
              <div className="user-name">{user?.name || 'Doctor'}</div>
              <div className="user-role">Doctor</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DoctorSidebar;
