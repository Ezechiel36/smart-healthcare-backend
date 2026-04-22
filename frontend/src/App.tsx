import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import './styles/theme.css';

// Components
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import DoctorDashboard from './components/DoctorDashboard';
import AdminDashboard from './components/AdminDashboard';
import Navigation from './components/Navigation';
import Sidebar from './components/Sidebar';
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
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

// Layout component that conditionally renders header and sidebar
const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const showHeader = !['/', '/login', '/register'].includes(location.pathname);
  const isAuthPage = ['/', '/login', '/register'].includes(location.pathname);

  return (
    <div className={`App ${isAuthPage ? 'auth-background' : ''}`}>
      {showHeader && <Navigation />}
      {showHeader ? (
        <div className="d-flex" style={{ minHeight: "calc(100vh - 76px)" }}>
          <Sidebar />
          <Container fluid className="p-4" style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
            {children}
          </Container>
        </div>
      ) : (
        <Container className={isAuthPage ? '' : 'mt-4'}>
          {children}
        </Container>
      )}
    </div>
  );
};

function App() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  return (
    <Router>
      <Layout>
        <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  {user?.role === 'DOCTOR' ? <DoctorDashboard /> :
                   user?.role === 'ADMIN' ? <AdminDashboard /> : <Dashboard />}
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
        </Layout>
      </Router>
  );
}

export default App;
