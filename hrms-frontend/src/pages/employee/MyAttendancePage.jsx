// src/pages/employee/MyAttendancePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Button, Table, Spinner, Alert, Card, Form, Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { CalendarCheck, CheckCircle, XCircle, Clock, PlusCircle } from 'lucide-react'; // Icons
import Swal from 'sweetalert2'; // For notifications

import employeeService from '../../services/employee.service';
import loggingService from '../../services/logging.service';

const MyAttendancePage = () => {
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMarking, setIsMarking] = useState(false);
  const [todayAttendanceStatus, setTodayAttendanceStatus] = useState(null); // To check if today's attendance is marked
  const [selectedStatus, setSelectedStatus] = useState('PRESENT'); // Default status for marking

  const fetchAttendanceHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const history = await employeeService.getMyAttendanceHistory();
      setAttendanceHistory(history);

      // Check if today's attendance is already marked
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const markedToday = history.find(
        (record) => record.attendanceDate === today
      );
      setTodayAttendanceStatus(markedToday ? markedToday.status : null);

      loggingService.info('MyAttendancePage: Fetched attendance history successfully.');
    } catch (err) {
      loggingService.error('MyAttendancePage: Failed to fetch attendance history', { error: err.message });
      setError(err.message || 'Failed to load attendance history.');
      Swal.fire('Error', err.message || 'Failed to load attendance history.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendanceHistory();
  }, [fetchAttendanceHistory]);

  const handleMarkAttendance = async () => {
    setIsMarking(true);
    setError(null);
    try {
      await employeeService.markMyAttendance(selectedStatus);
      Swal.fire('Success', `Attendance marked as ${selectedStatus} for today!`, 'success');
      loggingService.info(`MyAttendancePage: Attendance marked as ${selectedStatus} for today.`);
      fetchAttendanceHistory(); // Re-fetch to update the list and status
    } catch (err) {
      loggingService.error('MyAttendancePage: Failed to mark attendance', { error: err.message });
      setError(err.message || 'Failed to mark attendance.');
      Swal.fire('Error', err.message || 'Failed to mark attendance.', 'error');
    } finally {
      setIsMarking(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PRESENT':
        return <CheckCircle size={18} className="text-success me-1" />;
      case 'ABSENT':
        return <XCircle size={18} className="text-danger me-1" />;
      case 'HALF_DAY':
        return <Clock size={18} className="text-warning me-1" />;
      case 'ON_LEAVE':
        return <CalendarCheck size={18} className="text-info me-1" />;
      default:
        return null;
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
          <span className="visually-hidden">Loading attendance...</span>
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
            <CalendarCheck size={24} className="me-2" />My Attendance
          </h4>
        </Card.Header>
        <Card.Body>
          <Row className="mb-4 align-items-center">
            <Col md={6}>
              {todayAttendanceStatus ? (
                <Alert variant="info" className="mb-0 d-flex align-items-center">
                  Today's attendance is already marked as:
                  <span className="ms-2 fw-bold">
                    {getStatusIcon(todayAttendanceStatus)} {todayAttendanceStatus}
                  </span>
                </Alert>
              ) : (
                <Alert variant="warning" className="mb-0">
                  Today's attendance is not yet marked.
                </Alert>
              )}
            </Col>
            <Col md={6} className="d-flex justify-content-end align-items-center">
              {!todayAttendanceStatus && ( // Only show if not marked
                <>
                  <Form.Select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="me-2 w-auto"
                    aria-label="Select attendance status"
                  >
                    <option value="PRESENT">Present</option>
                    <option value="HALF_DAY">Half Day</option>
                    {/* Employees cannot mark themselves ABSENT or ON_LEAVE directly */}
                  </Form.Select>
                  <Button
                    variant="success"
                    onClick={handleMarkAttendance}
                    disabled={isMarking || !!todayAttendanceStatus}
                  >
                    {isMarking ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      <>
                        <PlusCircle size={18} className="me-2" /> Mark Attendance
                      </>
                    )}
                  </Button>
                </>
              )}
            </Col>
          </Row>

          <h5 className="mb-3">Attendance History</h5>
          {attendanceHistory.length === 0 ? (
            <Alert variant="info" className="text-center">
              No attendance records found.
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover className="text-center align-middle">
                <thead className="bg-light">
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Marked By</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceHistory.map((record) => (
                    <tr key={record.id}>
                      <td>{record.attendanceDate}</td>
                      <td>
                        <span className="d-flex align-items-center justify-content-center">
                          {getStatusIcon(record.status)}
                          {record.status}
                        </span>
                      </td>
                      <td>{record.markedByUsername}</td>
                      <td>{new Date(record.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default MyAttendancePage;