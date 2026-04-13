import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Components
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import DoctorDashboard from './components/DoctorDashboard';
import AdminDashboard from './components/AdminDashboard';
import Navigation from './components/Navigation';
import About from './pages/About';

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

// Layout component that conditionally renders header
const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const showHeader = !['/', '/login', '/register'].includes(location.pathname);
  const isAuthPage = ['/', '/login', '/register'].includes(location.pathname);

  return (
    <div className={`App ${isAuthPage ? 'auth-background' : ''}`}>
      {showHeader && <Navigation />}
      <Container className={showHeader ? 'mt-4' : ''}>
        {children}
      </Container>
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
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
