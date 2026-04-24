import React from 'react';
import { removeAuthToken, getUser } from '../services/api';
import { useNavigate } from 'react-router-dom';
import './AdminNavbar.css';

interface AdminNavbarProps {
  onSidebarToggle: () => void;
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({ onSidebarToggle }) => {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    removeAuthToken();
    navigate('/login');
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <nav className="admin-navbar">
      <div className="navbar-left">
        <button className="sidebar-toggle" onClick={onSidebarToggle}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <div className="navbar-brand">
          <span className="brand-icon">🏥</span>
          <span className="brand-text">Smart Healthcare</span>
        </div>
      </div>

      <div className="navbar-center">
        <div className="datetime-display">
          <div className="current-time">{getCurrentTime()}</div>
          <div className="current-date">{getCurrentDate()}</div>
        </div>
      </div>

      <div className="navbar-right">
        <div className="user-menu">
          <div className="user-profile">
            <div className="profile-avatar">
              <span>👤</span>
            </div>
            <div className="profile-info">
              <div className="profile-name">{user?.name || 'Admin'}</div>
              <div className="profile-role">Administrator</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
