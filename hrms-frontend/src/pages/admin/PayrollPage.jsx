// src/pages/admin/PayrollPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, Spinner, Alert, Table, Row, Col, Form } from 'react-bootstrap';
import { DollarSign, FileText, PlusCircle, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import adminService from '../../services/admin.service';
import loggingService from '../../services/logging.service';
import AddBonusModal from './AddBonusModal'; // Import the new modal

const PayrollPage = () => {
  const [payslips, setPayslips] = useState([]);
  const [employees, setEmployees] = useState([]); // To pass to AddBonusModal
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isProcessingPayroll, setIsProcessingPayroll] = useState(false);
  const [showAddBonusModal, setShowAddBonusModal] = useState(false);

  const fetchPayslipsAndEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      loggingService.info('PayrollPage: Fetching payslips and employees.');
      const fetchedPayslips = await adminService.getPayslipsForMonth(currentMonth, currentYear);
      setPayslips(fetchedPayslips);

      // Also fetch employees for the AddBonusModal dropdown
      const fetchedEmployees = await adminService.getAllEmployees();
      setEmployees(fetchedEmployees);

      loggingService.info('PayrollPage: Payslips and employees data loaded successfully.');
    } catch (err) {
      console.error("Failed to fetch payroll data:", err);
      loggingService.error('PayrollPage: Failed to fetch payroll data.', { error: err.message });
      setError("Failed to load payroll data: " + (err.message || 'Unknown error.'));
      Swal.fire('Error', err.message || 'Failed to load payroll data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentMonth, currentYear]);

  useEffect(() => {
    fetchPayslipsAndEmployees();
  }, [fetchPayslipsAndEmployees]);

  const handleProcessPayroll = async () => {
    Swal.fire({
      title: "Confirm Payroll Processing",
      text: `Are you sure you want to process payroll for ${new Date(0, currentMonth - 1).toLocaleString('default', { month: 'long' })} ${currentYear}? This will generate/update payslips.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Process Payroll!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsProcessingPayroll(true);
        try {
          const message = await adminService.processPayroll(currentMonth, currentYear);
          Swal.fire('Success', message, 'success');
          loggingService.info('PayrollPage: Payroll processed successfully.', { month: currentMonth, year: currentYear });
          await fetchPayslipsAndEmployees(); // Refresh data after processing
        } catch (err) {
          console.error('Error processing payroll:', err);
          loggingService.error('PayrollPage: Failed to process payroll.', { error: err.message, month: currentMonth, year: currentYear });
          const errorMessage = err.message || 'Failed to process payroll.';
          Swal.fire('Error', errorMessage, 'error');
        } finally {
          setIsProcessingPayroll(false);
        }
      }
    });
  };

  const handleOpenAddBonusModal = () => {
    setShowAddBonusModal(true);
    loggingService.info('PayrollPage: Opening Add Bonus modal.');
  };

  const handleCloseAddBonusModal = () => {
    setShowAddBonusModal(false);
    loggingService.info('PayrollPage: Closing Add Bonus modal.');
  };

  const handleBonusAdded = () => {
    // Refresh payslips after a bonus is added, as it triggers payslip recalculation on backend
    fetchPayslipsAndEmployees();
  };

  const handleViewPayslipDetails = (payslipId) => {
    // Implement logic to show detailed payslip, e.g., in a new modal or navigate to a dedicated page
    loggingService.info('PayrollPage: Viewing payslip details for ID:', { payslipId });
    Swal.fire({
      title: 'Payslip Details',
      html: `<p>Fetching details for Payslip ID: <strong>${payslipId}</strong>...</p>`,
      didOpen: async () => {
        Swal.showLoading();
        try {
          const payslipDetails = await adminService.getPayslipDetails(payslipId);
          let detailsHtml = `
            <div style="text-align: left; font-size: 0.9em;">
              <p><strong>Employee:</strong> ${payslipDetails.employeeName} (${payslipDetails.employeeIdNumber})</p>
              <p><strong>Period:</strong> ${new Date(0, payslipDetails.payPeriodMonth - 1).toLocaleString('default', { month: 'long' })} ${payslipDetails.payPeriodYear}</p>
              <hr/>
              <p><strong>Base Monthly Salary:</strong> ₹${payslipDetails.baseMonthlySalary.toFixed(2)}</p>
              <p><strong>Bonus Amount:</strong> ₹${payslipDetails.bonusAmount.toFixed(2)}</p>
              <p><strong>Gross Salary:</strong> ₹${payslipDetails.grossSalary.toFixed(2)}</p>
              <hr/>
              <p><strong>Days Present:</strong> ${payslipDetails.daysPresent}</p>
              <p><strong>Days Absent:</strong> ${payslipDetails.daysAbsent}</p>
              <p><strong>Days Half-Day:</strong> ${payslipDetails.daysHalfDay}</p>
              <p><strong>Days on Approved Leave:</strong> ${payslipDetails.daysOnApprovedLeave}</p>
              <p><strong>Attendance Deduction:</strong> -₹${payslipDetails.attendanceDeduction.toFixed(2)}</p>
              <p><strong>Tax Deduction:</strong> -₹${payslipDetails.taxDeduction.toFixed(2)}</p>
              <p><strong>PF Deduction:</strong> -₹${payslipDetails.pfDeduction.toFixed(2)}</p>
              ${payslipDetails.otherDeductions > 0 ? `<p><strong>Other Deductions:</strong> -₹${payslipDetails.otherDeductions.toFixed(2)}</p>` : ''}
              <hr/>
              <h3><strong>Net Salary:</strong> ₹${payslipDetails.netSalary.toFixed(2)}</h3>
              <p style="font-size: 0.8em; color: #666;">Generated on: ${new Date(payslipDetails.generationDate).toLocaleString()}</p>
              <p style="font-size: 0.8em; color: #666;">Generated by: ${payslipDetails.generatedBy}</p>
            </div>
          `;
          Swal.update({
            title: `Payslip for ${payslipDetails.employeeName}`,
            html: detailsHtml,
            icon: 'info',
            showConfirmButton: true,
            showCancelButton: false,
            showLoaderOnConfirm: false
          });
        } catch (error) {
          console.error('Failed to fetch payslip details:', error);
          loggingService.error('PayrollPage: Failed to fetch payslip details.', { error: error.message, payslipId });
          Swal.update({
            title: 'Error',
            html: `Failed to load payslip details: ${error.message || 'Unknown error.'}`,
            icon: 'error',
            showConfirmButton: true
          });
        }
      }
    });
  };

  // Generate month and year options for filters
  const currentYearOptions = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYearOptions - 5 + i); // 5 years back, 4 years forward
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={pageVariants}>
      <h1 className="mb-4 d-flex align-items-center gap-2">
        <DollarSign size={32} /> Payroll Management
      </h1>

      <Card className="p-4 shadow-sm mb-4" data-aos="fade-up">
        <Card.Body>
          <Card.Title className="mb-3">Process Payroll</Card.Title>
          <Row className="align-items-end mb-4">
            <Col md={3}>
              <Form.Group controlId="payrollMonth">
                <Form.Label>Select Month</Form.Label>
                <Form.Control
                  as="select"
                  value={currentMonth}
                  onChange={(e) => setCurrentMonth(parseInt(e.target.value, 10))}
                  disabled={isProcessingPayroll || loading}
                >
                  {months.map((m) => (
                    <option key={m} value={m}>
                      {new Date(0, m - 1).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="payrollYear">
                <Form.Label>Select Year</Form.Label>
                <Form.Control
                  as="select"
                  value={currentYear}
                  onChange={(e) => setCurrentYear(parseInt(e.target.value, 10))}
                  disabled={isProcessingPayroll || loading}
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
            <Col md={6} className="d-flex justify-content-end align-items-end gap-2 mt-3 mt-md-0">
              <Button
                variant="success"
                onClick={handleProcessPayroll}
                disabled={isProcessingPayroll || loading}
                className="d-flex align-items-center gap-2"
              >
                {isProcessingPayroll ? <Spinner animation="border" size="sm" /> : <RefreshCw size={18} />}
                {isProcessingPayroll ? 'Processing...' : 'Process Monthly Payroll'}
              </Button>
              <Button
                variant="info"
                onClick={handleOpenAddBonusModal}
                disabled={loading || isProcessingPayroll}
                className="d-flex align-items-center gap-2"
              >
                <PlusCircle size={18} /> Add Bonus
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="p-4 shadow-sm mb-4" data-aos="fade-up">
        <Card.Body>
          <Card.Title className="mb-3">Generated Payslips for {new Date(0, currentMonth - 1).toLocaleString('default', { month: 'long' })} {currentYear}</Card.Title>
          <Card.Text className="text-muted mb-4">
            Review the generated payslips for the selected period.
          </Card.Text>

          {loading ? (
            <div className="d-flex justify-content-center my-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading payslips...</span>
              </Spinner>
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover className="mb-0">
                <thead>
                  <tr>
                    <th>Emp ID</th>
                    <th>Employee Name</th>
                    <th>Gross Salary</th>
                    <th>Deductions</th>
                    <th>Bonus</th>
                    <th>Net Salary</th>
                    <th>Generated Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payslips.length > 0 ? (
                    payslips.map((payslip) => (
                      <tr key={payslip.id}>
                        <td>{payslip.employeeIdNumber}</td>
                        <td>{payslip.employeeName}</td>
                        <td>₹{payslip.grossSalary.toFixed(2)}</td>
                        <td>-₹{(payslip.attendanceDeduction + payslip.taxDeduction + payslip.pfDeduction + payslip.otherDeductions).toFixed(2)}</td>
                        <td>₹{payslip.bonusAmount.toFixed(2)}</td>
                        <td>₹{payslip.netSalary.toFixed(2)}</td>
                        <td>{new Date(payslip.generationDate).toLocaleDateString()}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="d-flex align-items-center gap-1"
                            onClick={() => handleViewPayslipDetails(payslip.id)}
                            disabled={loading || isProcessingPayroll}
                          >
                            <FileText size={16} /> View
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center text-muted">No payslips found for this period.</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <AddBonusModal
        isOpen={showAddBonusModal}
        onClose={handleCloseAddBonusModal}
        onBonusAdded={handleBonusAdded}
        employees={employees} // Pass the fetched employees to the modal
        isLoading={loading || isProcessingPayroll} // Pass overall loading state
      />
    </motion.div>
  );
};

export default PayrollPage;