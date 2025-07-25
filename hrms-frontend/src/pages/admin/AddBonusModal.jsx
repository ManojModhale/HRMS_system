// src/components/AddBonusModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';
import loggingService from '../../services/logging.service';
import adminService from '../../services/admin.service'; // To fetch employees and add bonus

const AddBonusModal = ({ isOpen, onClose, onBonusAdded, employees, isLoading }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    amount: '',
    month: new Date().getMonth() + 1, // Current month (1-12)
    year: new Date().getFullYear(),   // Current year
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset form data and errors when modal opens
      setFormData({
        employeeId: '',
        amount: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        description: ''
      });
      setFormErrors({});
      setIsSubmitting(false);
      loggingService.info('AddBonusModal: Modal opened.');
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' })); // Clear error for this field on change
  };

  const validateForm = () => {
    let errors = {};
    let isValid = true;

    if (!formData.employeeId) {
      errors.employeeId = 'Employee is required.';
      isValid = false;
    }
    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Valid amount is required.';
      isValid = false;
    }
    if (!formData.month || isNaN(formData.month) || parseInt(formData.month) < 1 || parseInt(formData.month) > 12) {
      errors.month = 'Valid month (1-12) is required.';
      isValid = false;
    }
    if (!formData.year || isNaN(formData.year) || parseInt(formData.year) < 2000) { // Adjust min year as needed
      errors.year = 'Valid year is required.';
      isValid = false;
    }
    // Description is optional, so no validation needed unless it has specific length constraints

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      Swal.fire('Validation Error', 'Please correct the errors in the form.', 'error');
      loggingService.warn('AddBonusModal: Form validation failed.', { errors: formErrors });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        employeeId: parseInt(formData.employeeId, 10),
        amount: parseFloat(formData.amount),
        month: parseInt(formData.month, 10),
        year: parseInt(formData.year, 10),
        description: formData.description.trim() // Trim whitespace
      };
      
      const message = await adminService.addBonus(payload);
      Swal.fire('Success', message, 'success');
      loggingService.info('AddBonusModal: Bonus added successfully.', { payload });
      onBonusAdded(); // Notify parent to refresh payslips
      onClose(); // Close the modal
    } catch (error) {
      console.error('Error adding bonus:', error);
      loggingService.error('AddBonusModal: Failed to add bonus.', { error: error.message, payload: formData });
      const errorMessage = error.message || 'Failed to add bonus.';
      Swal.fire('Error', errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate month and year options
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i); // 5 years back, 4 years forward
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <Modal show={isOpen} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Add Bonus to Employee</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="employeeId">
                <Form.Label>Select Employee</Form.Label>
                <Form.Control
                  as="select"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  isInvalid={!!formErrors.employeeId}
                  disabled={isLoading || isSubmitting}
                >
                  <option value="">-- Select an employee --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeIdNumber})
                    </option>
                  ))}
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  {formErrors.employeeId}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="amount">
                <Form.Label>Bonus Amount</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  placeholder="e.g., 5000.00"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  isInvalid={!!formErrors.amount}
                  disabled={isLoading || isSubmitting}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.amount}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="month">
                <Form.Label>Month</Form.Label>
                <Form.Control
                  as="select"
                  name="month"
                  value={formData.month}
                  onChange={handleChange}
                  isInvalid={!!formErrors.month}
                  disabled={isLoading || isSubmitting}
                >
                  {months.map((m) => (
                    <option key={m} value={m}>
                      {new Date(0, m - 1).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  {formErrors.month}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="year">
                <Form.Label>Year</Form.Label>
                <Form.Control
                  as="select"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  isInvalid={!!formErrors.year}
                  disabled={isLoading || isSubmitting}
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  {formErrors.year}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group controlId="description" className="mb-3">
            <Form.Label>Description (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="e.g., Performance bonus for Q2, Festival bonus"
              name="description"
              value={formData.description}
              onChange={handleChange}
              isInvalid={!!formErrors.description}
              disabled={isLoading || isSubmitting}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.description}
            </Form.Control.Feedback>
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100 mt-3" disabled={isLoading || isSubmitting}>
            {isSubmitting ? <Spinner animation="border" size="sm" /> : 'Add Bonus'}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddBonusModal;