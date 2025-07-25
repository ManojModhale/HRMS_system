// hrms-frontend/src/pages/admin/AdminLoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link
import Swal from 'sweetalert2';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { FaUserShield, FaLock, FaEye, FaEyeSlash, FaBuilding } from 'react-icons/fa';
import { motion } from 'framer-motion';
import authService from '../../services/auth.service';
import loggingService from '../../services/logging.service';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/AdminLoginPage.module.css';
import { ArrowLeft } from 'lucide-react'; // Import ArrowLeft icon

const AdminLoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const authenticateAdmin = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            setError('Please enter both username and password.');
            return;
        }

        setError('');
        setLoading(true);
        loggingService.info('AdminLoginPage: Attempting admin login', { username });

        try {
            const user = await login(username, password); 

            if (user && user.role === 'ADMIN') {
                loggingService.info('AdminLoginPage: Admin Login successful', { username });
                Swal.fire({
                    icon: 'success',
                    title: 'Login Successful!',
                    text: 'Welcome back, Admin!',
                    timer: 1500,
                    showConfirmButton: false,
                }).then(() => {
                    navigate('/admin');
                });
            } else {
                loggingService.warn('AdminLoginPage: Login successful but not an Admin role', { username, role: user?.role });
                authService.logout();
                setError('Access Denied: You are not authorized as an Admin.');
                Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: 'Access Denied: You are not authorized as an Admin.',
                });
            }
        } catch (err) {
            console.error('Admin Login error:', err);
            const errorMessage = err.message || 'An error occurred during login. Please try again.';
            setError(errorMessage);
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: errorMessage,
            });
            loggingService.error('AdminLoginPage: Admin login failed', { username, errorMessage: errorMessage, errorStack: err.stack });
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            className={styles.loginPageWrapper}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <Container fluid className="d-flex justify-content-center align-items-center min-vh-100 p-3">
                {/* Back Button */}
                <Link to="/" className="position-absolute top-0 start-0 m-4 text-decoration-none">
                    <button className="btn btn-outline-secondary d-flex align-items-center gap-2 rounded-pill px-3 py-2 shadow-sm">
                        <ArrowLeft size={18} /> Back to Home
                    </button>
                </Link>

                <Card className={`${styles.loginCard} shadow-lg rounded-4`}>
                    <Row className="g-0">
                        {/* Left Card: Login Form */}
                        <Col lg={6} className="d-flex align-items-center justify-content-center p-4">
                            <div className="w-100 p-md-4">
                                <div className="text-center mb-4">
                                    <FaBuilding className={styles.logoIcon} />
                                    <h1 className={styles.logoText}>HRMS Admin</h1>
                                </div>
                                <h2 className="text-center mb-4 text-primary fw-bold">Admin Login</h2>

                                <Form onSubmit={authenticateAdmin}>
                                    <Form.Group className="mb-3" controlId="formUsername">
                                        <Form.Label className="fw-bold text-secondary">Username</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text className={styles.inputIconBg}>
                                                <FaUserShield className={styles.inputIcon} />
                                            </InputGroup.Text>
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter admin username"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                required
                                                className={styles.formControlCustom}
                                            />
                                        </InputGroup>
                                    </Form.Group>

                                    <Form.Group className="mb-4" controlId="formPassword">
                                        <Form.Label className="fw-bold text-secondary">Password</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text className={styles.inputIconBg}>
                                                <FaLock className={styles.inputIcon} />
                                            </InputGroup.Text>
                                            <Form.Control
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Enter admin password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                className={styles.formControlCustom}
                                            />
                                            <Button
                                                variant="outline-secondary"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className={styles.passwordToggleBtn}
                                            >
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </Button>
                                        </InputGroup>
                                    </Form.Group>

                                    {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

                                    <Button
                                        variant="primary"
                                        type="submit"
                                        className={`${styles.loginButton} w-100 py-2 mt-4`}
                                        disabled={!username || !password || loading}
                                    >
                                        {loading ? 'Logging In...' : 'Login'}
                                    </Button>
                                </Form>
                            </div>
                        </Col>

                        {/* Right Card: Welcome Message */}
                        <Col lg={6} className={`${styles.welcomeCard} d-none d-lg-flex flex-column justify-content-center align-items-center p-5 text-center`}>
                            <motion.h1
                                className="text-white mb-4"
                                initial={{ y: -50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                            >
                                Welcome, Administrator!
                            </motion.h1>
                            <motion.p
                                className="text-white-50"
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                            >
                                Your portal to manage all aspects of the Human Resources system.
                                Securely log in to access employee records, leave approvals, payroll, and more.
                            </motion.p>
                        </Col>
                    </Row>
                </Card>
            </Container>
        </motion.div>
    );
};

export default AdminLoginPage;