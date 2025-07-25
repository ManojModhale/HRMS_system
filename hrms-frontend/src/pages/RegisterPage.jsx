// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import authService from '../services/auth.service';
import loggingService from '../services/logging.service';
import '../styles/RegisterForm.css'; // Import the custom CSS

// Reusable FloatingInput Component
// Added 'name' prop to correctly map to formData keys
const FloatingInput = ({ id, name, label, type = "text", value, onChange, toggleVisibility, error }) => (
    <div className="floating-label-wrapper">
        <input
            id={id} // Unique ID for this form (still useful for label 'htmlFor')
            name={name} // IMPORTANT: Added name prop for handleChange
            type={type}
            placeholder=" " // Important for floating label to work with :placeholder-shown
            className={`input-field-new ${error ? 'input-error' : ''}`}
            style={{ color: 'black' }} // Ensure text is visible
            value={value}
            onChange={onChange}
            autoComplete={name === "password" || name === "confirmPassword" ? "new-password" : "off"}
        />
        <label
            htmlFor={id} // Link label to the unique ID
            className="label-new"
        >
            {label}
        </label>
        {(name === "password" || name === "confirmPassword") && ( // Only show toggle for password fields
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

const RegisterForm = ({ setIsLogin }) => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const toggleVisibility = (field) => {
        if (field === "password") setPasswordVisible(!passwordVisible);
        if (field === "confirmPassword")
            setConfirmPasswordVisible(!confirmPasswordVisible);
    };

    // MODIFIED: Use e.target.name instead of e.target.id
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value, // Use 'name' to update the correct state key
        }));
        setErrors((prevErrors) => ({ ...prevErrors, [name]: "" })); // Clear specific error on change
    };

    const validateForm = () => {
        let valid = true;
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = "Username is required";
            valid = false;
        }
        if (!formData.password.trim()) {
            newErrors.password = "Password is required";
            valid = false;
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
            valid = false;
        } else if (!/(?=.*[a-z])/.test(formData.password)) {
            newErrors.password = "Password must contain at least one lowercase letter";
            valid = false;
        } else if (!/(?=.*[A-Z])/.test(formData.password)) {
            newErrors.password = "Password must contain at least one uppercase letter";
            valid = false;
        } else if (!/(?=.*\d)/.test(formData.password)) {
            newErrors.password = "Password must contain at least one number";
            valid = false;
        } else if (!/(?=.*[@$!%*?&])/.test(formData.password)) {
            newErrors.password = "Password must contain at least one symbol (@$!%*?&)";
            valid = false;
        }

        if (!formData.confirmPassword.trim()) {
            newErrors.confirmPassword = "Confirm Password is required";
            valid = false;
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const roleToRegister = 'PENDING'; // Changed to PENDING as per recent discussion
            loggingService.info('RegisterPage: Attempting user registration', { ...formData, role: roleToRegister });

            console.log('registration trying ', formData);
            const response = await authService.register(
                formData.username,
                formData.password,
                roleToRegister
            );

            Swal.fire({
                icon: 'success',
                title: 'Registration Successful!',
                text: response.message || 'You have been successfully registered. Please login.',
                timer: 3000,
                showConfirmButton: false,
            }).then(() => {
                setIsLogin(true); // Switch to login form after successful registration
                loggingService.info('RegisterPage: User registered successfully, navigating to login', { username: formData.username, userId: response.userId });
                navigate('/auth?form=login', { replace: true }); // Update URL
            });

            setFormData({
                username: "",
                password: "",
                confirmPassword: "",
            });

        } catch (error) {
            console.error("Registration Failed", error);
            const errorMessage = error.response?.data?.message || error.message || "Registration failed due to network or server error.";
            Swal.fire({
                title: "Registration Failed",
                text: errorMessage,
                icon: "error",
                timer: 3000,
                showConfirmButton: false,
                confirmButtonText: "Try Again",
            });
            loggingService.error('RegisterPage: Registration failed', { username: formData.username, errorMessage: errorMessage, errorStack: error.stack });
            setErrors({ form: errorMessage });

        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="form-container-new"
        >
            <div className="text-center">
                <h1 className="title-new">HRMS</h1>
                <p className="subtitle-new">
                    Create your account for Human Resource Management System
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="form-heading-new">
                    Create your account
                </h2>

                <FloatingInput
                    id="register-username" // Unique ID for label
                    name="username" // Corresponds to formData.username
                    label="Username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    error={errors.username}
                />

                <FloatingInput
                    id="register-password" // Unique ID for label
                    name="password" // Corresponds to formData.password
                    label="Password"
                    type={passwordVisible ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    toggleVisibility={() => toggleVisibility("password")}
                    error={errors.password}
                />

                <FloatingInput
                    id="register-confirmPassword" // Unique ID for label
                    name="confirmPassword" // Corresponds to formData.confirmPassword
                    label="Confirm Password"
                    type={confirmPasswordVisible ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    toggleVisibility={() => toggleVisibility("confirmPassword")}
                    error={errors.confirmPassword}
                />
                {errors.form && (
                    <p className="error-text">{errors.form}</p>
                )}

                <button
                    type="submit"
                    className="submit-button-new"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <svg
                                className="animate-spin h-5 w-5 me-3"
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
                        "Create Account"
                    )}
                </button>
                <div className="text-center mt-4">
                    <p className="text-muted">
                        Already have an account? <span onClick={() => setIsLogin(true)} className="link-new cursor-pointer">Login Here</span>
                    </p>
                </div>
            </form>
        </motion.div>
    );
};
export default RegisterForm;
