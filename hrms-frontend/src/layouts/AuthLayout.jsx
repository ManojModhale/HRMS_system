// src/layouts/AuthLayout.jsx
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
//import '../styles/AuthLayout.css';

const AuthLayout = ({ children }) => {
  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100" style={{
      background: 'linear-gradient(to bottom right, #3b82f6, #8b5cf6)', // Blue to Purple gradient
      padding: '1rem' // Add some padding for smaller screens
    }}>
      {/* Bootstrap Container for responsive padding and max-width */}
      <Container className="my-auto">
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6} xl={5}> {/* Responsive column sizing */}
            {children}
          </Col>
      </Row>
    </Container>
  </div>
);
};

export default AuthLayout;