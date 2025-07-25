// hrms-frontend/src/components/ProcessLeaveModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import Swal from 'sweetalert2';

import adminService from '../../services/admin.service';
import loggingService from '../../services/logging.service';

const ProcessLeaveModal = ({ show, onHide, onSuccess, leaveApplication }) => {
  const [formData, setFormData] = useState({
    status: 'APPROVED', // Default to approved
    adminNotes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (leaveApplication) {
      setFormData({
        status: 'APPROVED', // Reset to default when modal opens for a new leave
        adminNotes: leaveApplication.adminNotes || '', // Pre-fill if notes exist
      });
    }
  }, [leaveApplication]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormErrors({ ...formErrors, [e.target.name]: '' }); // Clear error on change
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.status) newErrors.status = 'Status is required.';
    if (formData.status === 'REJECTED' && !formData.adminNotes.trim()) {
      newErrors.adminNotes = 'Admin notes are required when rejecting a leave.';
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
      const payload = {
        leaveApplicationId: leaveApplication.id,
        status: formData.status,
        adminNotes: formData.adminNotes,
      };
      await adminService.processLeaveApplication(payload);
      Swal.fire('Success', `Leave application ${formData.status.toLowerCase()} successfully!`, 'success');
      loggingService.info('ProcessLeaveModal: Leave application processed successfully.', { leaveId: leaveApplication.id, status: formData.status });
      onSuccess(); // Callback to parent to close modal and refresh data
    } catch (err) {
      loggingService.error('ProcessLeaveModal: Failed to process leave application', { error: err.message, leaveId: leaveApplication.id });
      setError(err.message || 'Failed to process leave application.');
      Swal.fire('Error', err.message || 'Failed to process leave application.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>Process Leave Application</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {leaveApplication && (
          <div className="mb-3 p-3 border rounded bg-light">
            <p className="mb-1"><strong>Employee:</strong> {leaveApplication.employeeName}</p>
            <p className="mb-1"><strong>Applied Date:</strong> {leaveApplication.appliedDate}</p>
            <p className="mb-1"><strong>Leave Period:</strong> {leaveApplication.startDate} to {leaveApplication.endDate}</p>
            <p className="mb-0"><strong>Reason:</strong> {leaveApplication.reason}</p>
          </div>
        )}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="status">
            <Form.Label>Status</Form.Label>
            <Form.Select
              name="status"
              value={formData.status}
              onChange={handleChange}
              isInvalid={!!formErrors.status}
              disabled={loading}
            >
              <option value="APPROVED">APPROVE</option>
              <option value="REJECTED">REJECT</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {formErrors.status}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="adminNotes">
            <Form.Label>Admin Notes (Required for Rejection)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="adminNotes"
              value={formData.adminNotes}
              onChange={handleChange}
              isInvalid={!!formErrors.adminNotes}
              placeholder="Add notes for approval or rejection"
              disabled={loading}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.adminNotes}
            </Form.Control.Feedback>
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100" disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : 'Submit Decision'}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ProcessLeaveModal;