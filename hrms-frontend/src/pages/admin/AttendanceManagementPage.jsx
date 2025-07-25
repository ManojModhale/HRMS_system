// hrms-frontend/src/pages/admin/AttendanceManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Button, Table, Spinner, Alert, Form, Card, Row, Col } from 'react-bootstrap'; // Removed Modal as it's now imported from component
import { motion } from 'framer-motion';
import { CalendarCheck, User, CheckCircle, XCircle, Clock } from 'lucide-react';
import Swal from 'sweetalert2';

import adminService from '../../services/admin.service';
import loggingService from '../../services/logging.service';
import EditAttendanceModal from './EditAttendanceModal'; // Import the separate modal component
import MarkAttendanceModal from './MarkAttendanceModal'; // Assuming you'll add a button to open this

const AttendanceManagementPage = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterDate, setFilterDate] = useState(''); // For filtering by date
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [showMarkModal, setShowMarkModal] = useState(false); // State for Mark Attendance Modal

  const fetchAttendanceRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Adjusted to call getAllAttendanceByDate
      const records = await adminService.getAllAttendanceByDate(filterDate);
      setAttendanceRecords(records);
      loggingService.info('AttendanceManagementPage: Fetched all attendance records successfully.');
    } catch (err) {
      loggingService.error('AttendanceManagementPage: Failed to fetch attendance records', { error: err.message });
      setError(err.message || 'Failed to load attendance records.');
      Swal.fire('Error', err.message || 'Failed to load attendance records.', 'error');
    } finally {
      setLoading(false);
    }
  }, [filterDate]); // Depend on filterDate

  useEffect(() => {
    fetchAttendanceRecords();
  }, [fetchAttendanceRecords]);

  const handleEditClick = (record) => {
    setEditingRecord(record);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setEditingRecord(null);
    fetchAttendanceRecords(); // Re-fetch data after successful edit
  };

  const handleMarkSuccess = () => {
    setShowMarkModal(false);
    fetchAttendanceRecords(); // Re-fetch data after successful mark
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PRESENT':
        return <span className="badge bg-success d-flex align-items-center justify-content-center"><CheckCircle size={14} className="me-1" /> PRESENT</span>;
      case 'ABSENT':
        return <span className="badge bg-danger d-flex align-items-center justify-content-center"><XCircle size={14} className="me-1" /> ABSENT</span>;
      case 'LEAVE':
        return <span className="badge bg-info text-dark d-flex align-items-center justify-content-center"><Clock size={14} className="me-1" /> LEAVE</span>;
      case 'HALF_DAY': // Add HALF_DAY status
        return <span className="badge bg-warning text-dark d-flex align-items-center justify-content-center"><Clock size={14} className="me-1" /> HALF_DAY</span>;
      case 'ON_LEAVE': // Add ON_LEAVE status
        return <span className="badge bg-primary d-flex align-items-center justify-content-center"><CalendarCheck size={14} className="me-1" /> ON_LEAVE</span>;
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
          <span className="visually-hidden">Loading attendance records...</span>
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
            <CalendarCheck size={24} className="me-2" />Attendance Management
          </h4>
          <Button variant="light" onClick={() => setShowMarkModal(true)}>
            Mark New Attendance
          </Button>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group controlId="filterDate">
                <Form.Label>Filter by Date:</Form.Label>
                <Form.Control
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          {attendanceRecords.length === 0 ? (
            <Alert variant="info" className="text-center">
              No attendance records found for the selected criteria.
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover className="text-center align-middle">
                <thead className="bg-light">
                  <tr>
                    <th>Employee Name</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Marked By</th>
                    <th>Timestamp</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record) => (
                    <tr key={record.id}>
                      <td>{record.employeeName}</td>
                      <td>{record.attendanceDate}</td>
                      <td>{getStatusBadge(record.status)}</td>
                      <td>{record.markedByUsername || 'Self'}</td>
                      <td>{new Date(record.timestamp).toLocaleString()}</td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEditClick(record)}
                        >
                          Edit
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

      {/* Edit Attendance Modal */}
      {editingRecord && (
        <EditAttendanceModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
          attendanceRecord={editingRecord}
        />
      )}

      {/* Mark New Attendance Modal */}
      <MarkAttendanceModal
        show={showMarkModal}
        onHide={() => setShowMarkModal(false)}
        onSuccess={handleMarkSuccess}
      />
    </motion.div>
  );
};

export default AttendanceManagementPage;