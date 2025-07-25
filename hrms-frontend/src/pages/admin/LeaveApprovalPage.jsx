// hrms-frontend/src/pages/admin/LeaveApprovalPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Button, Table, Spinner, Alert, Card } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { ClipboardList, CheckCircle, XCircle, Clock } from 'lucide-react'; // Icons
import Swal from 'sweetalert2'; // For notifications

import adminService from '../../services/admin.service'; // Use admin service
import loggingService from '../../services/logging.service';
import ProcessLeaveModal from './ProcessLeaveModal'; // New modal component

const LeaveApprovalPage = () => {
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  const fetchPendingLeaves = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const leaves = await adminService.getAllPendingLeaveApplications();
      setPendingLeaves(leaves);
      loggingService.info('LeaveApprovalPage: Fetched pending leave applications successfully.');
    } catch (err) {
      loggingService.error('LeaveApprovalPage: Failed to fetch pending leave applications', { error: err.message });
      setError(err.message || 'Failed to load pending leave applications.');
      Swal.fire('Error', err.message || 'Failed to load pending leave applications.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingLeaves();
  }, [fetchPendingLeaves]);

  const handleProcessClick = (leave) => {
    setSelectedLeave(leave);
    setShowProcessModal(true);
  };

  const handleProcessSuccess = () => {
    setShowProcessModal(false);
    setSelectedLeave(null);
    fetchPendingLeaves(); // Re-fetch data after successful processing
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
          <span className="visually-hidden">Loading pending leaves...</span>
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
            <ClipboardList size={24} className="me-2" />Leave Approval
          </h4>
        </Card.Header>
        <Card.Body>
          {pendingLeaves.length === 0 ? (
            <Alert variant="info" className="text-center">
              No pending leave applications found.
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover className="text-center align-middle">
                <thead className="bg-light">
                  <tr>
                    <th>Employee Name</th>
                    <th>Applied Date</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingLeaves.map((leave) => (
                    <tr key={leave.id}>
                      <td>{leave.employeeName}</td>
                      <td>{leave.appliedDate}</td>
                      <td>{leave.startDate}</td>
                      <td>{leave.endDate}</td>
                      <td className="text-start">{leave.reason}</td>
                      <td>{getStatusBadge(leave.status)}</td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleProcessClick(leave)}
                          disabled={leave.status !== 'PENDING'} // Only allow processing pending leaves
                        >
                          Process
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Process Leave Modal */}
      {selectedLeave && (
        <ProcessLeaveModal
          show={showProcessModal}
          onHide={() => setShowProcessModal(false)}
          onSuccess={handleProcessSuccess}
          leaveApplication={selectedLeave}
        />
      )}
    </motion.div>
  );
};

export default LeaveApprovalPage;