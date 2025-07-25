// hrms-frontend/src/components/ApplyLeaveModal.jsx
import React, { useState } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import Swal from 'sweetalert2';
import moment from 'moment'; // For date validation

import employeeService from '../../services/employee.service';
import loggingService from '../../services/logging.service';

const ApplyLeaveModal = ({ show, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormErrors({ ...formErrors, [e.target.name]: '' }); // Clear error on change
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.startDate) newErrors.startDate = 'Start date is required.';
    if (!formData.endDate) newErrors.endDate = 'End date is required.';
    if (!formData.reason.trim()) newErrors.reason = 'Reason is required.';

    // Date validation
    const start = moment(formData.startDate);
    const end = moment(formData.endDate);
    const today = moment().startOf('day');

    if (start.isBefore(today)) {
      newErrors.startDate = 'Start date cannot be in the past.';
    }
    if (end.isBefore(start)) {
      newErrors.endDate = 'End date cannot be before start date.';
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      Swal.fire('Validation Error', 'Please correct the errors in the form.', 'error');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await employeeService.applyLeave(formData);
      Swal.fire('Success', 'Leave application submitted successfully!', 'success');
      loggingService.info('ApplyLeaveModal: Leave application submitted successfully.');
      onSuccess(); // Callback to parent to close modal and refresh data
      setFormData({ // Reset form after successful submission
        startDate: '',
        endDate: '',
        reason: '',
      });
    } catch (err) {
      loggingService.error('ApplyLeaveModal: Failed to apply for leave', { error: err.message });
      setError(err.message || 'Failed to apply for leave.');
      Swal.fire('Error', err.message || 'Failed to apply for leave.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>Apply for Leave</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="startDate">
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              isInvalid={!!formErrors.startDate}
              disabled={loading}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.startDate}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="endDate">
            <Form.Label>End Date</Form.Label>
            <Form.Control
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              isInvalid={!!formErrors.endDate}
              disabled={loading}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.endDate}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="reason">
            <Form.Label>Reason</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              isInvalid={!!formErrors.reason}
              placeholder="Enter reason for leave"
              disabled={loading}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.reason}
            </Form.Control.Feedback>
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100" disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : 'Submit Application'}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ApplyLeaveModal;