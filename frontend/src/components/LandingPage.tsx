import React from 'react';
import { Button, Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
        </div>
        <Container className="hero-content">
          <Row className="align-items-center min-vh-100">
            <Col lg={6} className="hero-text">
              <h1 className="hero-title animate-fade-in">
                Smart Healthcare
                <span className="gradient-text"> Appointment System</span>
              </h1>
              <p className="hero-subtitle animate-slide-up">
                Book appointments with top doctors seamlessly. Manage your healthcare journey with our modern, secure, and easy-to-use platform.
              </p>
              <div className="hero-buttons animate-slide-up">
                <Link to="/login">
                  <Button variant="primary" size="lg" className="hero-btn btn-animate">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline-light" size="lg" className="hero-btn btn-animate">
                    Register
                  </Button>
                </Link>
              </div>
            </Col>
            <Col lg={6} className="hero-image">
              <div className="illustration animate-float">
                <div className="doctor-card">
                  <div className="doctor-avatar">
                    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="50" cy="50" r="45" fill="#e3f2fd"/>
                      <circle cx="50" cy="40" r="20" fill="#2196f3"/>
                      <path d="M20 85 Q50 60 80 85" fill="#2196f3"/>
                      <rect x="35" y="20" width="30" height="25" rx="5" fill="#1976d2"/>
                      <circle cx="50" cy="32" r="8" fill="#bbdefb"/>
                    </svg>
                  </div>
                  <div className="pulse-ring"></div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <Container>
          <h2 className="section-title animate-fade-in">Why Choose Us?</h2>
          <Row className="g-4">
            <Col md={4}>
              <div className="feature-card animate-slide-up">
                <div className="feature-icon">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                </div>
                <h3>Easy Booking</h3>
                <p>Book appointments with just a few clicks. No more waiting on hold or complicated forms.</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="feature-card animate-slide-up">
                <div className="feature-icon">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <h3>Secure & Private</h3>
                <p>Your health information is protected with industry-leading security standards.</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="feature-card animate-slide-up">
                <div className="feature-icon">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <h3>24/7 Access</h3>
                <p>Access your appointments and health records anytime, anywhere.</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <Container>
          <h2 className="section-title animate-fade-in">How It Works</h2>
          <Row className="g-4">
            <Col md={4}>
              <div className="step-card animate-slide-up">
                <div className="step-number">1</div>
                <h3>Create Account</h3>
                <p>Register as a patient or doctor in just a few simple steps.</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="step-card animate-slide-up">
                <div className="step-number">2</div>
                <h3>Book Appointment</h3>
                <p>Choose your preferred doctor and available time slot.</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="step-card animate-slide-up">
                <div className="step-number">3</div>
                <h3>Get Confirmed</h3>
                <p>Receive confirmation and manage your appointments easily.</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <Container>
          <div className="cta-content animate-fade-in">
            <h2>Ready to Get Started?</h2>
            <p>Join thousands of patients and doctors who trust our platform.</p>
            <div className="cta-buttons">
              <Link to="/register">
                <Button variant="primary" size="lg" className="cta-btn btn-animate">
                  Create Account
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline-light" size="lg" className="cta-btn btn-animate">
                  Login Now
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <Container>
          <p>&copy; 2026 Smart Healthcare. All rights reserved.</p>
        </Container>
      </footer>
    </div>
  );
};

export default LandingPage;
