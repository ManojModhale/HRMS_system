// src/pages/employee/MySalarySlipsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Card, Spinner, Alert, Row, Col, Form, Button } from 'react-bootstrap';
import { DollarSign, FileText } from 'lucide-react';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import employeeService from '../../services/employee.service';
import loggingService from '../../services/logging.service';

const MySalarySlipsPage = () => {
  const [payslip, setPayslip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const fetchMyPayslip = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      loggingService.info('MySalarySlipsPage: Fetching my payslip.', { month: currentMonth, year: currentYear });
      const fetchedPayslip = await employeeService.getMyPayslip(currentMonth, currentYear);
      setPayslip(fetchedPayslip);
      loggingService.info('MySalarySlipsPage: My payslip fetched successfully.', { payslipId: fetchedPayslip.id });
    } catch (err) {
      console.error("Failed to fetch my payslip:", err);
      loggingService.error('MySalarySlipsPage: Failed to fetch my payslip.', { error: err.message, month: currentMonth, year: currentYear });
      setPayslip(null); // Clear previous payslip if fetching fails
      if (err.message.includes("Payslip not found")) {
        setError("Payslip not yet generated or found for this period.");
      } else {
        setError("Failed to load your payslip: " + (err.message || 'Unknown error.'));
      }
      // No Swal.fire here, as we display the error directly on the page
    } finally {
      setLoading(false);
    }
  }, [currentMonth, currentYear]);

  useEffect(() => {
    fetchMyPayslip();
  }, [fetchMyPayslip]);

  // Generate month and year options for filters
  const currentYearOptions = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYearOptions - 4 + i); // 4 years back, current year
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={pageVariants}>
      <h1 className="mb-4 d-flex align-items-center gap-2">
        <DollarSign size={32} /> My Salary Slips
      </h1>

      <Card className="p-4 shadow-sm mb-4" data-aos="fade-up">
        <Card.Body>
          <Card.Title className="mb-3">Select Payslip Period</Card.Title>
          <Row className="align-items-end mb-4">
            <Col md={4}>
              <Form.Group controlId="payslipMonth">
                <Form.Label>Month</Form.Label>
                <Form.Control
                  as="select"
                  value={currentMonth}
                  onChange={(e) => setCurrentMonth(parseInt(e.target.value, 10))}
                  disabled={loading}
                >
                  {months.map((m) => (
                    <option key={m} value={m}>
                      {new Date(0, m - 1).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="payslipYear">
                <Form.Label>Year</Form.Label>
                <Form.Control
                  as="select"
                  value={currentYear}
                  onChange={(e) => setCurrentYear(parseInt(e.target.value, 10))}
                  disabled={loading}
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
            <Col md={4} className="d-flex justify-content-end align-items-end mt-3 mt-md-0">
              <Button onClick={fetchMyPayslip} disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : 'View Payslip'}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="p-4 shadow-sm" data-aos="fade-up">
        <Card.Body>
          <Card.Title className="mb-3">Payslip Details</Card.Title>
          {loading ? (
            <div className="d-flex justify-content-center my-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading payslip...</span>
              </Spinner>
            </div>
          ) : error ? (
            <Alert variant="info">{error}</Alert> // Use info for "not found"
          ) : payslip ? (
            <div className="payslip-details">
              <Row className="mb-3">
                <Col md={6}>
                  <p><strong>Employee Name:</strong> {payslip.employeeName}</p>
                  <p><strong>Employee ID:</strong> {payslip.employeeIdNumber}</p>
                  <p><strong>Pay Period:</strong> {new Date(0, payslip.payPeriodMonth - 1).toLocaleString('default', { month: 'long' })} {payslip.payPeriodYear}</p>
                  <p><strong>Generation Date:</strong> {new Date(payslip.generationDate).toLocaleDateString()}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Base Monthly Salary:</strong> ₹{payslip.baseMonthlySalary.toFixed(2)}</p>
                  <p><strong>Bonus Amount:</strong> ₹{payslip.bonusAmount.toFixed(2)}</p>
                  <p><strong>Gross Salary:</strong> ₹{payslip.grossSalary.toFixed(2)}</p>
                </Col>
              </Row>
              <hr />
              <Row className="mb-3">
                <Col md={6}>
                  <h5>Attendance Summary</h5>
                  <p><strong>Total Working Days:</strong> {payslip.totalWorkingDaysInMonth}</p>
                  <p><strong>Days Present:</strong> {payslip.daysPresent}</p>
                  <p><strong>Days Absent:</strong> {payslip.daysAbsent}</p>
                  <p><strong>Days Half-Day:</strong> {payslip.daysHalfDay}</p>
                  <p><strong>Days on Approved Leave:</strong> {payslip.daysOnApprovedLeave}</p>
                </Col>
                <Col md={6}>
                  <h5>Deductions</h5>
                  <p><strong>Attendance Deduction:</strong> -₹{payslip.attendanceDeduction.toFixed(2)}</p>
                  <p><strong>Tax Deduction:</strong> -₹{payslip.taxDeduction.toFixed(2)}</p>
                  <p><strong>PF Deduction:</strong> -₹{payslip.pfDeduction.toFixed(2)}</p>
                  {payslip.otherDeductions && payslip.otherDeductions > 0 && (
                    <p><strong>Other Deductions:</strong> -₹{payslip.otherDeductions.toFixed(2)}</p>
                  )}
                </Col>
              </Row>
              <hr />
              <h4 className="text-end"><strong>Net Salary:</strong> ₹{payslip.netSalary.toFixed(2)}</h4>
            </div>
          ) : (
            <Alert variant="info">Select a month and year to view your payslip.</Alert>
          )}
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default MySalarySlipsPage;