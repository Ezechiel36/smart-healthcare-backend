import React, { useState, useEffect } from 'react';
import { Button, Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: 'Smart Healthcare',
      subtitle: 'Appointment System',
      description: 'Book appointments with top doctors seamlessly. Manage your healthcare journey with our modern, secure, and easy-to-use platform.',
      gradient: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: 'Expert Doctors',
      subtitle: 'At Your Fingertips',
      description: 'Connect with certified healthcare professionals across various specializations. Get the care you deserve.',
      gradient: 'linear-gradient(135deg, rgba(51, 172, 170, 0.9) 0%, rgba(0, 150, 136, 0.9) 100%)'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: '24/7 Healthcare',
      subtitle: 'Always Available',
      description: 'Access your appointments and health records anytime, anywhere. Your health, your schedule, your control.',
      gradient: 'linear-gradient(135deg, rgba(255, 112, 67, 0.9) 0%, rgba(255, 87, 34, 0.9) 100%)'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="landing-page">
      {/* Hero Section with Sliding Images */}
      <section className="hero-section">
        <div className="slider-container">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`slide ${index === currentSlide ? 'active' : ''}`}
              style={{
                backgroundImage: `url(${slide.image})`,
                opacity: index === currentSlide ? 1 : 0
              }}
            >
              <div className="slide-overlay" style={{ background: slide.gradient }}></div>
            </div>
          ))}
          
          <div className="slider-content">
            <Container>
              <Row className="align-items-center min-vh-100">
                <Col lg={8} className="hero-text">
                  <div className="slide-text">
                    <h1 className="hero-title animate-fade-in">
                      {slides[currentSlide].title}
                      <span className="gradient-text"> {slides[currentSlide].subtitle}</span>
                    </h1>
                    <p className="hero-subtitle animate-slide-up">
                      {slides[currentSlide].description}
                    </p>
                    <div className="hero-buttons animate-slide-up">
                      <Link to="/login">
                        <Button variant="light" size="lg" className="hero-btn btn-animate">
                          Login
                        </Button>
                      </Link>
                      <Link to="/register">
                        <Button variant="outline-light" size="lg" className="hero-btn btn-animate">
                          Register
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Col>
              </Row>
            </Container>
          </div>

          {/* Slider Controls */}
          <button className="slider-control prev-btn" onClick={prevSlide}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button className="slider-control next-btn" onClick={nextSlide}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>

          {/* Slider Indicators */}
          <div className="slider-indicators">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              ></button>
            ))}
          </div>
        </div>
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
