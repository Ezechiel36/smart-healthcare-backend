import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import './styles/theme.css';

// Components
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import DoctorDashboard from './components/DoctorDashboard';
import AdminDashboard from './components/AdminDashboard';
import About from './pages/About';
import SystemAnalytics from './components/SystemAnalytics';
import MyAppointments from './components/MyAppointments';
import ManageSchedule from './components/ManageSchedule';
import PatientAppointments from './components/PatientAppointments';
import UserManagement from './components/UserManagement';
import DoctorApproval from './components/DoctorApproval';
import BookAppointment from './components/BookAppointment';

// Auth guard component
const PrivateRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');

  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin-dashboard" />;
    } else if (user.role === 'DOCTOR') {
      return <Navigate to="/doctor-dashboard" />;
    } else {
      return <Navigate to="/dashboard" />;
    }
  }

  return <>{children}</>;
};

function App() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // Create a component to handle role-based redirect from root
  const RoleBasedRedirect = () => {
    const token = localStorage.getItem('token');
    if (!token || !user) {
      return <Navigate to="/landing" />;
    }

    if (user.role === 'ADMIN') {
      return <Navigate to="/admin-dashboard" />;
    } else if (user.role === 'DOCTOR') {
      return <Navigate to="/doctor-dashboard" />;
    } else {
      return <Navigate to="/dashboard" />;
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<RoleBasedRedirect />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRoles={['PATIENT']}>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/doctor-dashboard"
          element={
            <PrivateRoute allowedRoles={['DOCTOR']}>
              <DoctorDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        {/* Patient Routes */}
        <Route path="/book-appointment" element={<PrivateRoute allowedRoles={['PATIENT']}><BookAppointment /></PrivateRoute>} />
        <Route path="/my-appointments" element={<PrivateRoute allowedRoles={['PATIENT']}><MyAppointments /></PrivateRoute>} />
        
        {/* Doctor Routes */}
        <Route path="/manage-schedule" element={<PrivateRoute allowedRoles={['DOCTOR']}><ManageSchedule /></PrivateRoute>} />
        <Route path="/patient-appointments" element={<PrivateRoute allowedRoles={['DOCTOR']}><PatientAppointments /></PrivateRoute>} />

        {/* Admin Routes */}
        <Route path="/system-analytics" element={<PrivateRoute allowedRoles={['ADMIN']}><SystemAnalytics /></PrivateRoute>} />
        <Route path="/user-management" element={<PrivateRoute allowedRoles={['ADMIN']}><UserManagement /></PrivateRoute>} />
        <Route path="/doctor-approval" element={<PrivateRoute allowedRoles={['ADMIN']}><DoctorApproval /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
