// hrms-frontend/src/components/EditAttendanceModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import Swal from 'sweetalert2';

import adminService from '../../services/admin.service';
import loggingService from '../../services/logging.service';

const EditAttendanceModal = ({ show, onHide, onSuccess, attendanceRecord }) => {
  const [formData, setFormData] = useState({
    status: attendanceRecord?.status || 'PRESENT',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (attendanceRecord) {
      setFormData({
        status: attendanceRecord.status || 'PRESENT',
      });
    }
  }, [attendanceRecord]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormErrors({ ...formErrors, [e.target.name]: '' }); // Clear error on change
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.status) newErrors.status = 'Status is required.';
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      Swal.fire('Validation Error', 'Please select a status.', 'error');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await adminService.updateAttendance(attendanceRecord.id, { status: formData.status });
      Swal.fire('Success', 'Attendance updated successfully!', 'success');
      loggingService.info('EditAttendanceModal: Attendance updated successfully.', { attendanceId: attendanceRecord.id });
      onSuccess(); // Callback to parent to close modal and refresh data
    } catch (err) {
      loggingService.error('EditAttendanceModal: Failed to update attendance', { error: err.message, attendanceId: attendanceRecord.id });
      setError(err.message || 'Failed to update attendance.');
      Swal.fire('Error', err.message || 'Failed to update attendance.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>Edit Attendance</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {attendanceRecord && (
          <div className="mb-3">
            <p><strong>Employee:</strong> {attendanceRecord.employeeName}</p>
            <p><strong>Date:</strong> {attendanceRecord.attendanceDate}</p>
            <p><strong>Current Status:</strong> {attendanceRecord.status}</p>
          </div>
        )}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="status">
            <Form.Label>New Status</Form.Label>
            <Form.Select
              name="status"
              value={formData.status}
              onChange={handleChange}
              isInvalid={!!formErrors.status}
              disabled={loading}
            >
              <option value="PRESENT">PRESENT</option>
              <option value="ABSENT">ABSENT</option>
              <option value="HALF_DAY">HALF_DAY</option>
              <option value="ON_LEAVE">ON_LEAVE</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {formErrors.status}
            </Form.Control.Feedback>
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100" disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : 'Save Changes'}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditAttendanceModal;