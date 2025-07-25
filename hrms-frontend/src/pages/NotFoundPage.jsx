// src/pages/NotFoundPage.jsx
import React, { useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import loggingService from '../services/logging.service';
import { FiFrown } from 'react-icons/fi'; // Import an icon
import { useAuth } from '../context/AuthContext.jsx'; // Import useAuth hook

// Import Bootstrap components
import { Container, Row, Col, Button } from 'react-bootstrap';

const NotFoundPage = () => {

  const { logout, isAuthenticated } = useAuth(); // Get logout and isAuthenticated from AuthContext
  const navigate = useNavigate(); // Get navigate hook

  useEffect(() => {
    loggingService.warn('NotFoundPage: 404 Not Found page accessed', { path: window.location.pathname });
  }, []);

  const handleGoHome = useCallback(() => {
    if (isAuthenticated()) {
      loggingService.info('NotFoundPage: User was authenticated, logging out before redirecting to home.');
      logout(); // Call logout to clear session
    }
    navigate('/'); // Redirect to home page
  }, [logout, isAuthenticated, navigate]);

  return (
    // Use Bootstrap classes for layout, background, text color, and padding
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light text-dark p-4">
      {/* Icon with Bootstrap text color and custom size/animation class */}
      <FiFrown className="text-danger fs-2 mb-4 not-found-icon animate-spin-slow" /> {/* Custom class for size/animation */}
      
      {/* Heading with Bootstrap display classes and text color */}
      <h1 className="display-1 fw-bold text-danger mb-3">404</h1>
      
      {/* Subtitle with Bootstrap heading class and text alignment */}
      <h3 className="fw-semibold mb-4 text-center">Page Not Found</h3>
      
      {/* Description with Bootstrap lead class for larger text and responsive column for max-width */}
      <Container>
        <Row className="justify-content-center">
          <Col lg={8} xl={6}> {/* Constrain width on larger screens */}
            <p className="lead text-center mb-5">
              The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
          </Col>
        </Row>
      </Container>
      
      {/* Button with Bootstrap styling */}
      <Button
        onClick={handleGoHome} // Use onClick to trigger the logout and then navigate
        variant="primary" // Bootstrap primary button style (blue)
        size="lg" // Large button size
        className="shadow-sm rounded-pill px-5 py-3 transition-transform-scale" // Custom classes for shadow, rounded, and hover effect
      >
        Go to Home
      </Button>
    </div>
  );
};

export default NotFoundPage;
