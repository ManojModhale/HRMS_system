// hrms-frontend/src/components/MarkAttendanceModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import Swal from 'sweetalert2';

import adminService from '../../services/admin.service'; // Use admin service
import loggingService from '../../services/logging.service';

const MarkAttendanceModal = ({ show, onHide, onSuccess }) => {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employeeId: '',
    attendanceDate: new Date().toISOString().slice(0, 10), // Default to today
    status: 'PRESENT', // Default status
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (show) {
      const fetchEmployees = async () => {
        setLoading(true);
        setError(null);
        try {
          const allEmployees = await adminService.getAllEmployees(); // Fetch all employees for dropdown
          setEmployees(allEmployees);
          // Set default employee if available
          if (allEmployees.length > 0) {
            setFormData((prev) => ({ ...prev, employeeId: allEmployees[0].id }));
          }
          loggingService.info('MarkAttendanceModal: Employees fetched for dropdown.');
        } catch (err) {
          loggingService.error('MarkAttendanceModal: Failed to fetch employees', { error: err.message });
          setError(err.message || 'Failed to load employees for dropdown.');
        } finally {
          setLoading(false);
        }
      };
      fetchEmployees();
    }
  }, [show]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormErrors({ ...formErrors, [e.target.name]: '' }); // Clear error on change
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.employeeId) newErrors.employeeId = 'Employee is required.';
    if (!formData.attendanceDate) newErrors.attendanceDate = 'Date is required.';
    if (!formData.status) newErrors.status = 'Status is required.';
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      Swal.fire('Validation Error', 'Please fill in all required fields.', 'error');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await adminService.markAttendance(formData);
      Swal.fire('Success', 'Attendance marked successfully!', 'success');
      loggingService.info('MarkAttendanceModal: Attendance marked successfully.');
      onSuccess(); // Callback to parent to close modal and refresh data
    } catch (err) {
      loggingService.error('MarkAttendanceModal: Failed to mark attendance', { error: err.message });
      setError(err.message || 'Failed to mark attendance.');
      Swal.fire('Error', err.message || 'Failed to mark attendance.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>Mark Employee Attendance</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="employeeId">
            <Form.Label>Employee</Form.Label>
            <Form.Select
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              isInvalid={!!formErrors.employeeId}
              disabled={loading}
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeIdNumber})
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {formErrors.employeeId}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="attendanceDate">
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="date"
              name="attendanceDate"
              value={formData.attendanceDate}
              onChange={handleChange}
              isInvalid={!!formErrors.attendanceDate}
              disabled={loading}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.attendanceDate}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="status">
            <Form.Label>Status</Form.Label>
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
            {loading ? <Spinner animation="border" size="sm" /> : 'Mark Attendance'}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default MarkAttendanceModal;