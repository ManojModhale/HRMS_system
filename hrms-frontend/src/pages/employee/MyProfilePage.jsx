// src/pages/employee/MyProfilePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Form, Button, Card, Row, Col, Spinner, Alert, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { User, Mail, Briefcase, IndianRupee, DollarSign, Calendar, IdCard, Edit, Save } from 'lucide-react'; // Icons for profile fields
import Swal from 'sweetalert2'; // For success/error messages

import { useAuth } from '../../context/AuthContext';
import employeeService from '../../services/employee.service'; // Service for employee data
import loggingService from '../../services/logging.service';

const MyProfilePage = () => {
  const { user, loading: authLoading } = useAuth(); // Get user from AuthContext
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state for profile data
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const fetchProfile = useCallback(async () => {
    // Only fetch if user is available and auth is not loading
    if (!user || authLoading) {
      loggingService.warn('MyProfilePage: User not available or auth still loading, skipping profile fetch.');
      // If auth is still loading, we display a spinner.
      // If user is null after authLoading is false, it means no authenticated user.
      if (!authLoading && !user) {
        setError("User not authenticated. Please log in.");
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Fetch the specific employee profile. The backend uses the JWT token to identify the user.
      const data = await employeeService.getMyProfile(); // This returns a UserDto
      setProfile(data);
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
      });
      loggingService.info('MyProfilePage: Profile fetched successfully', { userId: user.id });
    } catch (err) {
      loggingService.error('MyProfilePage: Failed to fetch profile', { error: err.message, userId: user.id });
      setError(err.message || 'Failed to load profile.');
      Swal.fire('Error', err.message || 'Failed to load profile.', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]); // Re-run if user or authLoading changes

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormErrors({ ...formErrors, [e.target.name]: '' }); // Clear error on change
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First Name is required.';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last Name is required.';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format.';
    }
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) {
      Swal.fire('Validation Error', 'Please correct the errors in the form.', 'error');
      return;
    }

    setLoading(true); // Set loading for the save operation
    setError(null);
    try {
      // Construct the payload as a UserDto, including the user's ID and non-editable fields
      // The backend will use the ID from the JWT, but sending it in the DTO is good practice
      // and aligns with the backend controller's validation.
      const dataToUpdate = {
        id: user.id, // IMPORTANT: Send the user's ID from AuthContext for backend validation
        username: profile.username, // Keep non-editable fields from current profile
        role: user.role, // Keep role from AuthContext
        employeeIdNumber: profile.employeeIdNumber,
        department: profile.department,
        designation: profile.designation,
        salary: profile.salary, // Send the existing salary
        joinDate: profile.joinDate,
        ...formData // Override with editable fields (firstName, lastName, email)
      };

      const updatedData = await employeeService.updateMyProfile(dataToUpdate);
      setProfile(updatedData); // Update local state with the new data
      setIsEditing(false); // Exit editing mode
      Swal.fire('Success', 'Profile updated successfully!', 'success');
      loggingService.info('MyProfilePage: Profile updated successfully', { userId: user.id });
    } catch (err) {
      loggingService.error('MyProfilePage: Failed to update profile', { error: err.message, userId: user.id });
      setError(err.message || 'Failed to update profile.');
      Swal.fire('Error', err.message || 'Failed to update profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const pageVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeInOut" } },
  };

  // Helper function to render tooltip for non-editable fields
  const renderAdminEditTooltip = (props) => (
    <Tooltip id="admin-edit-tooltip" {...props}>
      Only admin can edit this field.
    </Tooltip>
  );

  // Display loading spinner while auth is loading OR profile data is loading
  if (authLoading || loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <Spinner animation="border" role="status" className="text-primary">
          <span className="visually-hidden">Loading profile...</span>
        </Spinner>
      </div>
    );
  }

  // Display error if fetching failed
  if (error) {
    return (
      <Alert variant="danger" className="text-center">
        {error}
      </Alert>
    );
  }

  // Display message if no profile data is available after loading
  if (!profile) {
    return (
      <Alert variant="info" className="text-center">
        No profile data available for this user.
      </Alert>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="container-fluid py-4"
    >
      <Card className="shadow-sm rounded-4">
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center rounded-top-4">
          <h4 className="mb-0">
            <User size={24} className="me-2" />My Profile
          </h4>
          {!isEditing ? (
            <Button variant="outline-light" onClick={() => setIsEditing(true)}>
              <Edit size={18} className="me-2" /> Edit Profile
            </Button>
          ) : (
            <Button variant="outline-light" onClick={handleSaveProfile} disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : <Save size={18} className="me-2" />} Save Changes
            </Button>
          )}
        </Card.Header>
        <Card.Body>
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="username">
                  <Form.Label className="fw-semibold">Username</Form.Label>
                  <OverlayTrigger
                    placement="top"
                    delay={{ show: 250, hide: 400 }}
                    overlay={renderAdminEditTooltip}
                  >
                    <div className="form-control-plaintext border rounded p-2 bg-light d-flex align-items-center">
                      <User size={16} className="me-2 text-muted" />{profile.username}
                    </div>
                  </OverlayTrigger>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="employeeIdNumber">
                  <Form.Label className="fw-semibold">Employee ID Number</Form.Label>
                  <OverlayTrigger
                    placement="top"
                    delay={{ show: 250, hide: 400 }}
                    overlay={renderAdminEditTooltip}
                  >
                    <div className="form-control-plaintext border rounded p-2 bg-light d-flex align-items-center">
                      <IdCard size={16} className="me-2 text-muted" />{profile.employeeIdNumber}
                    </div>
                  </OverlayTrigger>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="firstName">
                  <Form.Label className="fw-semibold">First Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    isInvalid={!!formErrors.firstName}
                    placeholder="Enter first name"
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.firstName}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="lastName">
                  <Form.Label className="fw-semibold">Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    isInvalid={!!formErrors.lastName}
                    placeholder="Enter last name"
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.lastName}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="email">
                  <Form.Label className="fw-semibold">Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    isInvalid={!!formErrors.email}
                    placeholder="Enter email"
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.email}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="department">
                  <Form.Label className="fw-semibold">Department</Form.Label>
                  <OverlayTrigger
                    placement="top"
                    delay={{ show: 250, hide: 400 }}
                    overlay={renderAdminEditTooltip}
                  >
                    <div className="form-control-plaintext border rounded p-2 bg-light d-flex align-items-center">
                      <Briefcase size={16} className="me-2 text-muted" />{profile.department}
                    </div>
                  </OverlayTrigger>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="designation">
                  <Form.Label className="fw-semibold">Designation</Form.Label>
                  <OverlayTrigger
                    placement="top"
                    delay={{ show: 250, hide: 400 }}
                    overlay={renderAdminEditTooltip}
                  >
                    <div className="form-control-plaintext border rounded p-2 bg-light d-flex align-items-center">
                      <Briefcase size={16} className="me-2 text-muted" />{profile.designation}
                    </div>
                  </OverlayTrigger>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="salary">
                  <Form.Label className="fw-semibold">Salary</Form.Label>
                  <OverlayTrigger
                    placement="top"
                    delay={{ show: 250, hide: 400 }}
                    overlay={renderAdminEditTooltip}
                  >
                    <div className="form-control-plaintext border rounded p-2 bg-light d-flex align-items-center">
                      <IndianRupee size={16} className="me-2 text-muted" />{profile.salary ? `${profile.salary.toLocaleString()}` : 'N/A'}
                    </div>
                  </OverlayTrigger>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="joinDate">
                  <Form.Label className="fw-semibold">Join Date</Form.Label>
                  <OverlayTrigger
                    placement="top"
                    delay={{ show: 250, hide: 400 }}
                    overlay={renderAdminEditTooltip}
                  >
                    <div className="form-control-plaintext border rounded p-2 bg-light d-flex align-items-center">
                      <Calendar size={16} className="me-2 text-muted" />{profile.joinDate ? new Date(profile.joinDate).toLocaleDateString() : 'N/A'}
                    </div>
                  </OverlayTrigger>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default MyProfilePage;