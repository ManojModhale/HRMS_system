// hrms-frontend/src/pages/employee/MyLeaveHistoryPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Button, Table, Spinner, Alert, Card } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { BookOpen, PlusCircle, CheckCircle, XCircle, Clock } from 'lucide-react'; // Icons
import Swal from 'sweetalert2'; // For notifications

import employeeService from '../../services/employee.service';
import loggingService from '../../services/logging.service';
import ApplyLeaveModal from './ApplyLeaveModal'; // New modal component

const MyLeaveHistoryPage = () => {
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const fetchLeaveHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const history = await employeeService.getMyLeaveHistory();
      setLeaveHistory(history);
      loggingService.info('MyLeaveHistoryPage: Fetched leave history successfully.');
    } catch (err) {
      loggingService.error('MyLeaveHistoryPage: Failed to fetch leave history', { error: err.message });
      setError(err.message || 'Failed to load leave history.');
      Swal.fire('Error', err.message || 'Failed to load leave history.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaveHistory();
  }, [fetchLeaveHistory]);

  const handleApplySuccess = () => {
    setShowApplyModal(false);
    fetchLeaveHistory(); // Re-fetch to update the list
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="badge bg-warning text-dark d-flex align-items-center justify-content-center"><Clock size={14} className="me-1" /> PENDING</span>;
      case 'APPROVED':
        return <span className="badge bg-success d-flex align-items-center justify-content-center"><CheckCircle size={14} className="me-1" /> APPROVED</span>;
      case 'REJECTED':
        return <span className="badge bg-danger d-flex align-items-center justify-content-center"><XCircle size={14} className="me-1" /> REJECTED</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const pageVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeInOut" } },
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <Spinner animation="border" role="status" className="text-primary">
          <span className="visually-hidden">Loading leave history...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="text-center">
        {error}
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
      <Card className="shadow-sm rounded-4 mb-4">
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center rounded-top-4">
          <h4 className="mb-0">
            <BookOpen size={24} className="me-2" />My Leave History
          </h4>
          <Button variant="outline-light" onClick={() => setShowApplyModal(true)}>
            <PlusCircle size={18} className="me-2" /> Apply for Leave
          </Button>
        </Card.Header>
        <Card.Body>
          {leaveHistory.length === 0 ? (
            <Alert variant="info" className="text-center">
              No leave applications found.
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover className="text-center align-middle">
                <thead className="bg-light">
                  <tr>
                    <th>Applied Date</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Admin Notes</th>
                    <th>Processed By</th>
                    <th>Processed Date</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveHistory.map((leave) => (
                    <tr key={leave.id}>
                      <td>{leave.appliedDate}</td>
                      <td>{leave.startDate}</td>
                      <td>{leave.endDate}</td>
                      <td className="text-start">{leave.reason}</td>
                      <td>{getStatusBadge(leave.status)}</td>
                      <td className="text-start">{leave.adminNotes || 'N/A'}</td>
                      <td>{leave.processedByUsername || 'ADMIN'}</td>
                      <td>{leave.processedDate || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Apply Leave Modal */}
      <ApplyLeaveModal
        show={showApplyModal}
        onHide={() => setShowApplyModal(false)}
        onSuccess={handleApplySuccess}
      />
    </motion.div>
  );
};

export default MyLeaveHistoryPage;