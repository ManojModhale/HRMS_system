// src/pages/HomePage.jsx
import React, { useEffect, useState, useCallback } from 'react'; // Import useState and useCallback
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import loggingService from '../services/logging.service';
import { Navbar, Nav, Button, Container, Row, Col, Card, Form, Spinner } from 'react-bootstrap'; // Import Spinner
import { Link } from 'react-router-dom';
// Importing HR-specific icons from react-icons/fa
import {
    FaBuilding, FaUserPlus, FaCalendarAlt, FaMoneyBillWave, FaClipboardCheck, FaQuoteLeft,
    FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaUsers, FaClipboardList, FaClock, FaDollarSign,
    FaChartLine, FaShieldAlt, FaHandshake
} from 'react-icons/fa'; // Added new icons for benefits/security
import { motion } from 'framer-motion'; // For animations
import Swal from 'sweetalert2'; // For notifications

import '../styles/HomePage.css'; // Link to the external CSS file

const HomePage = () => {
    const { isAuthenticated, currentUser, loading } = useAuth();
    const navigate = useNavigate();

    // State for Contact Us form - CORRECTED: only mobile, no subject
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '', // This is now explicitly for the mobile number
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false); // State for form submission loading

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        loggingService.info('HomePage: Contact form submission initiated', { formData });

        try {
            // Ensure the payload matches backend Contact entity: name, email, mobile, message
            const payload = {
                name: formData.name,
                email: formData.email,
                mobile: formData.mobile, // Sending mobile number
                message: formData.message
            };

            const response = await fetch('http://localhost:8183/api/auth/contact-us', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload), // Send the corrected payload
            });

            if (response.ok) {
                Swal.fire({
                    title: "Success!",
                    text: "Your message has been sent successfully. We will get back to you soon!",
                    icon: "success",
                    timer: 3000,
                    showConfirmButton: false,
                });
                setFormData({ name: '', email: '', mobile: '', message: '' }); // Clear form
                loggingService.info('HomePage: Contact message sent successfully');
            } else {
                const errorData = await response.json();
                const errorMessage = errorData.message || "Failed to send message. Please try again.";
                Swal.fire({
                    title: "Error!",
                    text: errorMessage,
                    icon: "error",
                    confirmButtonText: "Okay",
                });
                loggingService.error('HomePage: Failed to send contact message', { errorMessage, status: response.status });
            }
        } catch (error) {
            console.error('Error submitting contact form:', error);
            const errorMessage = error.message || "An unexpected error occurred. Please check your network.";
            Swal.fire({
                title: "Network Error!",
                text: errorMessage,
                icon: "error",
                confirmButtonText: "Okay",
            });
            loggingService.error('HomePage: Network error during contact form submission', { errorMessage, errorStack: error.stack });
        } finally {
            setIsSubmitting(false);
        }
    };


    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light-custom">
                <div className="spinner-border text-primary-custom" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="ms-3 text-secondary-custom">Checking authentication status...</p>
            </div>
        );
    }

    // Animation variants for the SVG illustration
    const svgVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.8,
                ease: "easeOut",
                when: "beforeChildren",
                staggerChildren: 0.2
            }
        }
    };

    const pathVariants = {
        hidden: { opacity: 0, pathLength: 0 },
        visible: {
            opacity: 1,
            pathLength: 1,
            transition: {
                duration: 1.5,
                ease: "easeInOut"
            }
        }
    };

    const circleVariants = {
        hidden: { opacity: 0, scale: 0 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    return (
        <div className="hrms-landing-page" id="top">
            {/* Navbar Section - Kept as is, using Bootstrap classes and custom CSS classes */}
            <Navbar expand="lg" variant="dark" className="hrms-navbar">
                <Container>
                    <Navbar.Brand as={Link} to="/" className="navbar-brand-custom">
                        <FaBuilding className="brand-icon me-2" /> HRMS
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto">
                            <Nav.Link href="#features" className="nav-link-custom">Features</Nav.Link>
                            <Nav.Link href="#how-it-works" className="nav-link-custom">How It Works</Nav.Link>
                            <Nav.Link href="#contact-us" className="nav-link-custom">Contact Us</Nav.Link>
                            <Nav.Link as={Link} to="/auth?form=login" className="nav-link-custom">Login</Nav.Link>
                            <Button as={Link} to="/auth?form=register" variant="light" className="ms-lg-3 signup-button">
                                Register as Employee
                            </Button>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Hero Section - Redesigned, using custom CSS classes */}
            <section className="hero-section text-center d-flex align-items-center justify-content-center">
                <Container>
                    <Row className="justify-content-center align-items-center">
                        <Col lg={7} className="text-lg-start text-center mb-4 mb-lg-0">
                            <h1 className="hero-title">Empower Your Workforce, Simplify HR</h1>
                            <p className="hero-subtitle lead">
                                HRMS is your all-in-one solution for efficient employee management, accurate payroll, seamless leave tracking, and precise attendance.
                            </p>
                            <div className="d-flex justify-content-center justify-content-lg-start flex-wrap gap-3 mt-4">
                                <Button as={Link} to="/auth?form=register"
                                    onClick={() => { setTimeout(() => { window.scrollTo(0, 0); }, 800); }}
                                    variant="primary" size="lg" className="hero-cta-button">
                                    Get Started Free
                                </Button>
                                <Button as={Link} to="#features" variant="outline-light" size="lg" className="hero-learn-more-button">
                                    Learn More
                                </Button>
                            </div>
                        </Col>
                        <Col lg={5} className="d-none d-lg-block">
                            {/* Custom SVG Illustration for HRMS */}
                            <motion.svg
                                width="100%"
                                height="auto"
                                viewBox="0 0 500 350"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="img-fluid rounded shadow-lg"
                                variants={svgVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                {/* Background shape */}
                                <motion.rect
                                    x="0" y="0" width="500" height="350" rx="15" fill="#FFFFFF"
                                    variants={pathVariants}
                                    style={{ originX: 0.5, originY: 0.5 }}
                                />

                                {/* Main HR figure */}
                                <motion.circle cx="250" cy="100" r="40" fill="#1976D2" variants={circleVariants} /> {/* Head */}
                                <motion.rect x="220" y="150" width="60" height="100" rx="10" fill="#1976D2" variants={pathVariants} /> {/* Body */}
                                <motion.rect x="190" y="160" width="30" height="80" rx="5" fill="#1976D2" variants={pathVariants} /> {/* Arm Left */}
                                <motion.rect x="280" y="160" width="30" height="80" rx="5" fill="#1976D2" variants={pathVariants} /> {/* Arm Right */}
                                <motion.rect x="230" y="250" width="20" height="50" rx="5" fill="#1976D2" variants={pathVariants} /> {/* Leg Left */}
                                <motion.rect x="250" y="250" width="20" height="50" rx="5" fill="#1976D2" variants={pathVariants} /> {/* Leg Right */}

                                {/* Data/Chart elements */}
                                <motion.rect x="350" y="80" width="100" height="15" rx="5" fill="#FFEB3B" variants={pathVariants} />
                                <motion.rect x="350" y="100" width="80" height="15" rx="5" fill="#FFEB3B" variants={pathVariants} />
                                <motion.rect x="350" y="120" width="120" height="15" rx="5" fill="#FFEB3B" variants={pathVariants} />

                                {/* Gears/Process elements */}
                                <motion.circle cx="100" cy="280" r="30" fill="#343A40" variants={circleVariants} />
                                <motion.circle cx="100" cy="280" r="10" fill="#FFFFFF" variants={circleVariants} />
                                <motion.path
                                    d="M100 250 L115 260 L110 280 L115 300 L100 310 L85 300 L90 280 L85 260 Z"
                                    fill="#343A40"
                                    variants={pathVariants}
                                /> {/* Gear tooth */}

                                <motion.circle cx="150" cy="200" r="20" fill="#1976D2" variants={circleVariants} />
                                <motion.circle cx="150" cy="200" r="7" fill="#FFFFFF" variants={circleVariants} />
                                <motion.path
                                    d="M150 180 L160 185 L158 200 L160 215 L150 220 L140 215 L142 200 L140 185 Z"
                                    fill="#1976D2"
                                    variants={pathVariants}
                                /> {/* Smaller gear tooth */}

                            </motion.svg>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Features Section - Redesigned, using custom CSS classes */}
            <section id="features" className="features-section py-5">
                <Container>
                    <h2 className="section-title text-center">
                        Comprehensive HR Modules
                        <div className="section-title-underline"></div> {/* Custom underline */}
                    </h2>
                    <Row className="g-4 justify-content-center">
                        {[
                            { icon: FaUsers, title: "Employee Management", text: "Manage employee profiles, departments, designations, and contact details with ease." },
                            { icon: FaClipboardList, title: "Leave Management", text: "Automate leave requests, approvals, and balance tracking for all employees." },
                            { icon: FaClock, title: "Attendance Tracking", text: "Monitor daily attendance, track working hours, and generate detailed attendance reports." },
                            { icon: FaDollarSign, title: "Payroll Processing", text: "Ensure accurate and timely salary calculations, deductions, and payslip generation." },
                            { icon: FaChartLine, title: "Performance Management", text: "Set goals, track performance, and conduct appraisals to foster employee growth." },
                            { icon: FaUserPlus, title: "Recruitment & Onboarding", text: "Streamline hiring processes from application to smooth new employee onboarding." },
                        ].map((feature, index) => (
                            <Col key={index} xs={12} md={6} lg={4}>
                                <motion.div
                                    whileHover={{ translateY: -10, boxShadow: '0 15px 35px rgba(0, 0, 0, 0.15)', backgroundColor: '#e9f0f7' }}
                                    transition={{ duration: 0.3 }}
                                    className="feature-card-new h-100 d-flex flex-column justify-content-center align-items-center text-center p-4 rounded-3 shadow-sm"
                                >
                                    <feature.icon className="feature-icon-new mb-4" />
                                    <h4 className="feature-title-new fw-bold mb-3">{feature.title}</h4>
                                    <p className="feature-text-new">{feature.text}</p>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* New Section: Benefits - Using custom CSS classes */}
            <section id="benefits" className="benefits-section py-5">
                <Container>
                    <h2 className="section-title text-center text-white">
                        Why Choose Our HRMS?
                        <div className="section-title-underline-yellow"></div> {/* Yellow underline */}
                    </h2>
                    <Row className="g-4 justify-content-center">
                        {[
                            { icon: FaHandshake, title: "Enhanced Collaboration", text: "Foster better communication and collaboration across departments." },
                            { icon: FaChartLine, title: "Data-Driven Insights", text: "Gain valuable insights into HR metrics with comprehensive reporting." },
                            { icon: FaShieldAlt, title: "Secure & Compliant", text: "Ensure data security and compliance with industry standards." },
                        ].map((benefit, index) => (
                            <Col key={index} md={6} lg={4}>
                                <motion.div
                                    whileHover={{ translateY: -10, boxShadow: '0 12px 30px rgba(0, 0, 0, 0.2)', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                    transition={{ duration: 0.3 }}
                                    className="benefit-item text-center p-4 rounded-3 shadow-sm h-100"
                                >
                                    <benefit.icon className="benefit-icon mb-3" />
                                    <h4 className="benefit-title fw-bold mb-3">{benefit.title}</h4>
                                    <p className="benefit-text">{benefit.text}</p>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* How It Works Section - Redesigned, using custom CSS classes */}
            <section id="how-it-works" className="how-it-works-section py-5">
                <Container>
                    <h2 className="section-title text-center">
                        Simple Steps to HR Excellence
                        <div className="section-title-underline"></div> {/* Custom underline */}
                    </h2>
                    <Row className="justify-content-center g-4">
                        {[
                            { number: 1, title: "Set Up Your Organization", text: "Quickly configure company details, departments, and roles." },
                            { number: 2, title: "Add Employees & Users", text: "Import existing employee data or add new users with ease." },
                            { number: 3, title: "Automate HR Tasks", text: "Let HRMS handle attendance, leaves, and payroll automatically." },
                        ].map((step, index) => (
                            <Col key={index} md={6} lg={4}>
                                <motion.div
                                    whileHover={{ translateY: -10, boxShadow: '0 15px 35px rgba(0, 0, 0, 0.12)' }}
                                    transition={{ duration: 0.3 }}
                                    className="step-item h-100 d-flex flex-column justify-content-center align-items-center text-center p-4 rounded-3 shadow-sm"
                                >
                                    <div className="step-number d-flex align-items-center justify-content-center rounded-circle mb-4 shadow">
                                        {step.number}
                                    </div>
                                    <h4 className="step-title-new fw-bold mb-3">{step.title}</h4>
                                    <p className="step-text-new">{step.text}</p>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* Testimonials Section - Redesigned, using custom CSS classes 
            <section id="testimonials" className="testimonials-section py-5">
                <Container>
                    <h2 className="section-title text-center">
                        What Our Clients Say
                        <div className="section-title-underline"></div> 
                    </h2>
                    <Row className="justify-content-center g-4">
                        {[
                            { author: "Jane Doe", role: "HR Manager, Tech Solutions", text: "HRMS has revolutionized our HR operations. The ease of use and comprehensive features are outstanding. Highly recommended!" },
                            { author: "John Smith", role: "Operations Director, Global Corp", text: "Our payroll processing used to be a nightmare. With HRMS, it's seamless, accurate, and saves us so much time every month." },
                            { author: "Emily White", role: "Employee Relations, Creative Agency", text: "The attendance and leave management modules are incredibly intuitive. Our employees love the self-service options." },
                        ].map((testimonial, index) => (
                            <Col key={index} md={6} lg={4}>
                                <motion.div
                                    whileHover={{ translateY: -10, boxShadow: '0 15px 35px rgba(0, 0, 0, 0.15)' }}
                                    transition={{ duration: 0.3 }}
                                    className="testimonial-card h-100 p-4 rounded-3 shadow-sm d-flex flex-column justify-content-between"
                                >
                                    <div>
                                        <FaQuoteLeft className="testimonial-quote-icon mb-3" />
                                        <p className="testimonial-text fst-italic mb-3">"{testimonial.text}"</p>
                                    </div>
                                    <div className="testimonial-author text-end mt-3">
                                        <p className="mb-0 fw-bold">- {testimonial.author}</p>
                                        <small className="text-muted">{testimonial.role}</small>
                                    </div>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>*/}

            {/* Contact Us Section - Corrected form fields */}
            <section id="contact-us" className="contact-us-section py-5">
                <Container>
                    <h2 className="section-title text-center">
                        Get in Touch
                        <div className="section-title-underline"></div> {/* Custom underline */}
                    </h2>
                    <Row className="justify-content-center">
                        <Col lg={8}>
                            <p className="lead text-center mb-5 contact-intro-text">
                                Have questions about HRMS, need a demo, or require support? Our team is ready to assist you! Reach out to us using the form below or through our contact details.
                            </p>
                            <Row className="mb-5 text-center contact-details">
                                <Col md={4} className="mb-4 mb-md-0">
                                    <FaEnvelope className="contact-detail-icon mb-2" />
                                    <h5 className="contact-detail-title fw-bold mb-2">Email Us</h5>
                                    <p className="contact-detail-text">support@hrms.com</p>
                                </Col>
                                <Col md={4} className="mb-4 mb-md-0">
                                    <FaPhoneAlt className="contact-detail-icon mb-2" />
                                    <h5 className="contact-detail-title fw-bold mb-2">Call Us</h5>
                                    <p className="contact-detail-text">+91 9087564321</p>
                                </Col>
                                <Col md={4}>
                                    <FaMapMarkerAlt className="contact-detail-icon mb-2" />
                                    <h5 className="contact-detail-title fw-bold mb-2">Visit Us</h5>
                                    <p className="contact-detail-text">Katraj, Pune City, MH 411037</p>
                                </Col>
                            </Row>
                            <div className="contact-form-container p-4 p-md-5 rounded shadow-sm">
                                <h3 className="text-center mb-4">Send Us a Message</h3>
                                <Form onSubmit={handleSubmit}>
                                    <Row className="mb-3">
                                        <Form.Group as={Col} controlId="formGridName">
                                            <Form.Label className="form-label-custom">Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter your name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>

                                        <Form.Group as={Col} controlId="formGridEmail">
                                            <Form.Label className="form-label-custom">Email</Form.Label>
                                            <Form.Control
                                                type="email"
                                                placeholder="Enter your email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Row>

                                    {/* CORRECTED: Mobile Number field */}
                                    <Form.Group className="mb-3" controlId="formGridMobile">
                                        <Form.Label className="form-label-custom">Mobile Number</Form.Label>
                                        <Form.Control
                                            type="tel" // Use type="tel" for phone numbers
                                            placeholder="Enter your mobile number"
                                            name="mobile"
                                            value={formData.mobile}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-4" controlId="formGridMessage">
                                        <Form.Label className="form-label-custom">Message</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={5}
                                            placeholder="Your message..."
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>

                                    <Button variant="primary" type="submit" className="w-100 send-message-button" disabled={isSubmitting}>
                                        {isSubmitting ? <Spinner animation="border" size="sm" /> : 'Send Message'}
                                    </Button>
                                </Form>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Footer Section - Kept as is, using Bootstrap classes and custom CSS classes */}
            <footer className="hrms-footer py-4">
                <Container>
                    <Row className="align-items-center">
                        <Col md={6} className="text-md-start text-center mb-2 mb-md-0">
                            <span className="footer-brand">HRMS</span> &copy; {new Date().getFullYear()} All rights reserved.
                        </Col>
                        <Col md={6} className="text-md-end text-center">
                            <Nav className="justify-content-md-end justify-content-center">
                                <Nav.Link href="#top" className="footer-link">Home</Nav.Link>
                                <Nav.Link as={Link} to="/admin-login" className="nav-link-custom">Admin</Nav.Link>
                                <Nav.Link href="#features" className="footer-link">Features</Nav.Link>
                                <Nav.Link href="#how-it-works" className="footer-link">How It Works</Nav.Link>
                                <Nav.Link href="#contact-us" className="footer-link">Contact Us</Nav.Link>
                            </Nav>
                        </Col>
                    </Row>
                </Container>
            </footer>
        </div>
    );
};

export default HomePage;
