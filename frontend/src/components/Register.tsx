import React, { useState } from 'react';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'PATIENT',
    specialization: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<any>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const registerData: any = { ...formData };
      if (formData.role !== 'DOCTOR') {
        delete registerData.specialization;
      }

      console.log('Registering user with data:', registerData);
      const response = await authAPI.register(registerData);
      console.log('Registration response:', response);
      
      setSuccess('Registration successful! Please login with your credentials.');

      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      // Show detailed backend error if available
      console.error('Registration error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <Card style={{ width: '400px' }}>
        <Card.Header>
          <h3 className="text-center">Register</h3>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select name="role" value={formData.role} onChange={handleChange} required>
                <option value="PATIENT">Patient</option>
                <option value="DOCTOR">Doctor</option>
              </Form.Select>
            </Form.Group>

            {formData.role === 'DOCTOR' && (
              <Form.Group className="mb-3">
                <Form.Label>Specialization</Form.Label>
                <Form.Control
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  required
                  placeholder="Enter your specialization (e.g., Cardiology)"
                />
              </Form.Group>
            )}

            <Button variant="primary" type="submit" className="w-100" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : 'Register'}
            </Button>
          </Form>
        </Card.Body>
        <Card.Footer className="text-center">
          Already have an account? <Link to="/login">Login here</Link>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default Register;
