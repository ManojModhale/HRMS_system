// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Link, useNavigate } from 'react-router-dom'; // Ensure Link is imported
import Swal from 'sweetalert2';
import authService from '../services/auth.service'; // Use your existing authService
import loggingService from '../services/logging.service'; // Use your existing loggingService
import { useAuth } from '../context/AuthContext'; // Import useAuth hook
import '../styles/LoginForm.css'; // New CSS file for this component

// Reusable FloatingInput Component (similar to RegisterForm for consistency)
const FloatingInput = ({ id, label, type = "text", value, onChange, toggleVisibility, error }) => {
    return (
        <div className="floating-label-wrapper">
            <input
                id={id} // Unique ID for this form
                type={type} // Keep original type for password field to let browser handle auto-fill correctly before JavaScript
                placeholder=" " // Important for floating label to work with :placeholder-shown
                className={`input-field-new ${error ? 'input-error' : ''}`}
                value={value}
                onChange={onChange}
                autoComplete={id === "login-password" ? "current-password" : "off"} // Hint browser for auto-fill
            />
            <label
                htmlFor={id} // Link label to the unique ID
                className="label-new"
            >
                {label}
            </label>
            {id === "login-password" && ( // Only show toggle for password field
                <button
                    type="button"
                    className="toggle-visibility-button"
                    onClick={toggleVisibility}
                >
                    {type === "password" ? (
                        <i className="ri-eye-line"></i>
                    ) : (
                        <i className="ri-eye-off-line"></i>
                    )}
                </button>
            )}
            {error && <p className="error-text">{error}</p>}
        </div>
    );
};

const LoginForm = ({ setIsLogin }) => { // Added setIsLogin prop to toggle forms
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false); // State for password visibility
    const navigate = useNavigate();
    const { login } = useAuth(); // Get the login function from AuthContext


    const isValidUsername = (inputUsername) => inputUsername.trim() !== '';

    const validatePassword = (inputPassword) => {
        let newError = "";
        let valid = true;

        if (!inputPassword.trim()) {
            newError = "Password is required";
            valid = false;
        } else if (inputPassword.length < 6) {
            newError = "Password must be at least 6 characters";
            valid = false;
        } else if (!/(?=.*[a-z])/.test(inputPassword)) {
            newError = "Password must contain at least one lowercase letter";
            valid = false;
        } else if (!/(?=.*[A-Z])/.test(inputPassword)) {
            newError = "Password must contain at least one uppercase letter";
            valid = false;
        } else if (!/(?=.*\d)/.test(inputPassword)) {
            newError = "Password must contain at least one number";
            valid = false;
        } else if (!/(?=.*[@$!%*?&])/.test(inputPassword)) {
            newError = "Password must contain at least one symbol (@$!%*?&)";
            valid = false;
        }
        return { valid, error: newError };
    };

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
        if (usernameError) setUsernameError(''); // Clear error on change
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        if (passwordError) setPasswordError(''); // Clear error on change
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setUsernameError('');
        setPasswordError('');

        let formValid = true;

        if (!isValidUsername(username)) {
            setUsernameError('Username is required.');
            formValid = false;
        }

        const passwordValidationResult = validatePassword(password);
        if (!passwordValidationResult.valid) {
            setPasswordError(passwordValidationResult.error);
            formValid = false;
        }

        if (!formValid) {
            return;
        }

        setLoading(true);
        try {

            loggingService.info('LoginPage: Login form submitted', { username });
            console.log('login form submitted', username, password);
            // Using your existing authService for login
            //const user = await authService.login(username, password);
            // FIX: Call the login function from AuthContext
            const user = await login(username, password); 

            Swal.fire({
                icon: 'success',
                title: 'Login Successful!',
                text: `Welcome, ${user.username}!`,
                timer: 1500,
                showConfirmButton: false,
            }).then(() => {
                if (user.role === 'ADMIN') {
                    loggingService.info('LoginPage: Redirecting to Admin Dashboard', { username });
                    navigate('/admin/dashboard');
                } else if (user.role === 'EMPLOYEE') {
                    console.log('inside else if before for employee dashboard');
                    loggingService.info('LoginPage: Redirecting to Employee Dashboard', { username });
                    console.log('inside else if after for employee dashboard');
                    navigate('/employee');
                } else {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Unknown Role',
                        text: 'Login successful but unknown role detected. Please contact support.',
                    });
                    loggingService.warn('LoginPage: Login successful but unknown role detected', { username, role: user.role });
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            const resMessage = error.message || 'Login failed. Please check your credentials.';
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: resMessage,
                timer: 3000,
                showConfirmButton: false,
            });

            // Set specific errors based on the message
            if (resMessage.toLowerCase().includes('username')) {
                setUsernameError(resMessage);
            } else if (resMessage.toLowerCase().includes('password')) {
                setPasswordError(resMessage);
            } else {
                // For general errors, you might want a state for a general form error
                // For now, we'll just let Swal handle it.
            }

            loggingService.error('LoginPage: Login failed', { username, errorMessage: resMessage, errorStack: error.stack });

        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="form-container-new login-form-container" // Reusing form-container-new and adding specific class
        >
            <div className="text-center">
                <h1 className="title-new">HRMS</h1> {/* Changed from TaskFlow to HRMS */}
                <p className="subtitle-new">
                    Welcome back to your Human Resource Management System
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="form-heading-new">
                    Sign in to your workspace
                </h2>

                <FloatingInput
                    id="login-username" // Unique ID
                    label="Username"
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    error={usernameError}
                />

                <FloatingInput
                    id="login-password" // Unique ID
                    label="Password"
                    type={passwordVisible ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    toggleVisibility={togglePasswordVisibility}
                    error={passwordError}
                />

                <div className="d-flex justify-content-end align-items-center"> {/* Using Bootstrap classes */}
                    <Link to="/forgot-password" className="link-new">Forgot password?</Link>
                </div>

                <button
                    type="submit"
                    className="submit-button-new" // Using the same button style as RegisterForm
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <svg
                                className="animate-spin h-5 w-5 me-3" // Using Bootstrap me-3 for margin-right
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            Processing...
                        </>
                    ) : (
                        "Sign in"
                    )}
                </button>

                <div className="text-center mt-4"> {/* Using Bootstrap mt-4 for margin-top */}
                    <p className="text-muted"> {/* Using Bootstrap text-muted for gray text */}
                        Don't have an account? <span onClick={() => setIsLogin(false)} className="link-new cursor-pointer">Register Here</span>
                    </p>
                </div>
            </form>
        </motion.div>
    );
};
export default LoginForm;