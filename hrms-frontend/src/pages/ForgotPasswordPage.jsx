// src/pages/ForgotPasswordPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Form, Button, Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap'; // Import React-Bootstrap components
import { motion } from "framer-motion"; // For animations
import { Lock, Mail, KeyRound } from 'lucide-react'; // Lucide icons for visual appeal

import authService from "../services/auth.service";

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [generatedOTP, setGeneratedOTP] = useState(null); // To store OTP received from backend
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // Clear error on input change
  };

  const validateFields = () => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.username.trim()) newErrors.username = "Username is required.";
      if (!formData.email.trim()) {
        newErrors.email = "Email is required.";
      } else if (!/^[^\s@]+@[^\s@]+\.\S+$/.test(formData.email)) { // More robust email regex
        newErrors.email = "Invalid email format.";
      }
    } else if (step === 2) {
      if (!formData.otp.trim()) newErrors.otp = "OTP is required.";
      if (formData.otp.trim() && isNaN(Number(formData.otp))) {
        newErrors.otp = "OTP must be a number.";
      }
    } else if (step === 3) {
      if (!formData.newPassword.trim()) {
        newErrors.newPassword = "New password is required.";
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = "Password must be at least 6 characters.";
      } else if (!/(?=.*[a-z])/.test(formData.newPassword)) {
        newErrors.newPassword = "Password must contain at least one lowercase letter.";
      } else if (!/(?=.*[A-Z])/.test(formData.newPassword)) {
        newErrors.newPassword = "Password must contain at least one uppercase letter.";
      } else if (!/(?=.*\d)/.test(formData.newPassword)) {
        newErrors.newPassword = "Password must contain at least one number.";
      } else if (!/(?=.*[@$!%*?&])/.test(formData.newPassword)) {
        newErrors.newPassword = "Password must contain at least one symbol (@$!%*?&).";
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match.";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;

    setIsLoading(true);

    try {
      if (step === 1) {
        const response = await authService.verifyUserForForgotPassword(
          formData.username,
          formData.email
        );

        if (response && response.otp) {
          Swal.fire("OTP Sent", response.message, "success");
          setGeneratedOTP(response.otp);
          setStep(2);
        } else {
          Swal.fire("Error", response?.message || "User not found or email mismatch.", "error");
          if (response?.redirect) {
            navigate("/register");
          }
        }
      } else if (step === 2) {
        if (Number(formData.otp) === generatedOTP) {
          Swal.fire("Success", "OTP verified!", "success");
          setStep(3);
        } else {
          Swal.fire("Error", "Invalid OTP. Please try again.", "error");
          setErrors({ otp: "Invalid OTP." });
        }
      } else if (step === 3) {
        const response = await authService.resetPassword(formData.username, formData.newPassword);

        if (response && response.message) {
          Swal.fire("Password Reset", response.message, "success");
          navigate("/auth"); // Redirect to login page
        } else {
          Swal.fire("Error", response?.message || "Password reset failed.", "error");
        }
      }
    } catch (error) {
      console.error("Forgot Password Process Failed:", error);
      const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred.";
      Swal.fire("Error", errorMessage, "error");
      if (errorMessage.includes("register")) {
        navigate("/register");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const pageVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeInOut" } },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #007bff, #5cdb95)', // Background similar to your CSS
        padding: '20px', // Add some padding
      }}
    >
      <Card className="p-4 shadow-lg rounded-4" style={{ maxWidth: '500px', width: '90%' }}>
        <Card.Body>
          <h2 className="text-center mb-4 text-primary fw-bold">
            <Lock size={32} className="me-2" />Forgot Password
          </h2>
          <Form onSubmit={handleSubmit}>
            {step === 1 && (
              <>
                <Form.Group className="mb-3" controlId="username">
                  <Form.Label className="fw-semibold">Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    isInvalid={!!errors.username}
                    placeholder="Enter your username"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.username}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label className="fw-semibold">Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    isInvalid={!!errors.email}
                    placeholder="Enter your email"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>
              </>
            )}
            {step === 2 && (
              <Form.Group className="mb-3" controlId="otp">
                <Form.Label className="fw-semibold">Enter OTP</Form.Label>
                <Form.Control
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  isInvalid={!!errors.otp}
                  placeholder="Enter the OTP sent to your email"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.otp}
                </Form.Control.Feedback>
              </Form.Group>
            )}
            {step === 3 && (
              <>
                <Form.Group className="mb-3" controlId="newPassword">
                  <Form.Label className="fw-semibold">New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    isInvalid={!!errors.newPassword}
                    placeholder="Enter your new password"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.newPassword}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="confirmPassword">
                  <Form.Label className="fw-semibold">Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    isInvalid={!!errors.confirmPassword}
                    placeholder="Confirm your new password"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.confirmPassword}
                  </Form.Control.Feedback>
                </Form.Group>
              </>
            )}
            <Button
              variant="primary"
              type="submit"
              className="w-100 mt-3 d-flex align-items-center justify-content-center gap-2 py-2 fw-bold"
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <>
                  {step === 1 && <Mail size={20} />}
                  {step === 2 && <KeyRound size={20} />}
                  {step === 3 && <Lock size={20} />}
                  {step === 1 ? "Send OTP" : step === 2 ? "Verify OTP" : "Reset Password"}
                </>
              )}
            </Button>
          </Form>
          <div className="text-center mt-4">
            <Button variant="link" onClick={() => navigate('/auth')} className="text-decoration-none">
              Back to Login
            </Button>
          </div>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default ForgotPasswordPage;