// src/pages/admin/AdminDashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { Users, UserPlus, FileText, CalendarCheck, DollarSign, IndianRupee, BellRing } from 'lucide-react';
import { motion } from 'framer-motion';
import employeeService from '../../services/employee.service'; // To fetch pending users
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import adminService from '../../services/admin.service';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loadingPendingUsers, setLoadingPendingUsers] = useState(true);
  const [errorPendingUsers, setErrorPendingUsers] = useState(null);

  useEffect(() => {
    const fetchPendingUsers = async () => {
      setLoadingPendingUsers(true);
      setErrorPendingUsers(null);
      try {
        const data = await adminService.getPendingUsers();
        setPendingUsers(data);
      } catch (err) {
        console.error("Failed to fetch pending users:", err);
        setErrorPendingUsers("Failed to load pending users.");
        toast.error("Failed to load pending users.");
      } finally {
        setLoadingPendingUsers(false);
      }
    };

    fetchPendingUsers();
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
    >
      <h1 className="mb-4">Admin Dashboard</h1>

      {loadingPendingUsers ? (
        <div className="d-flex justify-content-center my-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading pending users...</span>
          </Spinner>
        </div>
      ) : errorPendingUsers ? (
        <div className="alert alert-danger" role="alert">
          {errorPendingUsers}
        </div>
      ) : pendingUsers.length > 0 ? (
        <motion.div variants={cardVariants} className="mb-4">
          <Card className="border-warning shadow-sm">
            <Card.Header className="bg-warning text-dark fw-bold d-flex align-items-center gap-2">
              <BellRing size={20} /> New User Registrations Pending!
            </Card.Header>
            <Card.Body>
              <Card.Text>
                There are {pendingUsers.length} new user(s) awaiting your review to be converted into employees.
              </Card.Text>
              <ul className="list-unstyled">
                {pendingUsers.map(user => (
                  <li key={user.id}>
                    <strong>User ID:</strong> {user.id}, <strong>Username:</strong> {user.username}
                  </li>
                ))}
              </ul>
              <Link to="/admin/employees" className="btn btn-warning mt-3">
                Review & Create Employees <UserPlus size={16} className="ms-2" />
              </Link>
            </Card.Body>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={cardVariants} className="mb-4">
          <Card className="border-success shadow-sm">
            <Card.Body className="d-flex align-items-center gap-3">
              <BellRing size={24} className="text-success" />
              <Card.Text className="mb-0">
                No new user registrations pending. All clear!
              </Card.Text>
            </Card.Body>
          </Card>
        </motion.div>
      )}

      <Row>
        <Col md={6} lg={4} className="mb-4">
          <motion.div variants={cardVariants}>
            <Card className="text-center p-3 shadow-sm h-100">
              <Card.Body>
                <Users size={48} className="mb-3 text-primary" />
                <Card.Title>Users List</Card.Title>
                <Card.Text>View all registered users (Admins, HRs, Employees).</Card.Text>
                <Link to="/admin/users" className="btn btn-outline-primary mt-3">Go to Users</Link>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
        <Col md={6} lg={4} className="mb-4">
          <motion.div variants={cardVariants}>
            <Card className="text-center p-3 shadow-sm h-100">
              <Card.Body>
                <UserPlus size={48} className="mb-3 text-success" />
                <Card.Title>Employee Management</Card.Title>
                <Card.Text>Manage employee records and convert pending users.</Card.Text>
                <Link to="/admin/employees" className="btn btn-outline-success mt-3">Manage Employees</Link>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
        <Col md={6} lg={4} className="mb-4">
          <motion.div variants={cardVariants}>
            <Card className="text-center p-3 shadow-sm h-100">
              <Card.Body>
                <FileText size={48} className="mb-3 text-info" />
                <Card.Title>Leave Applications</Card.Title>
                <Card.Text>Review and approve/reject employee leave requests.</Card.Text>
                <Link to="/admin/leave-approval" className="btn btn-outline-info mt-3">Review Leaves</Link>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
        <Col md={6} lg={4} className="mb-4">
          <motion.div variants={cardVariants}>
            <Card className="text-center p-3 shadow-sm h-100">
              <Card.Body>
                <CalendarCheck size={48} className="mb-3 text-secondary" />
                <Card.Title>Attendance Management</Card.Title>
                <Card.Text>View and mark employee attendance records.</Card.Text>
                <Link to="/admin/attendance" className="btn btn-outline-secondary mt-3">Manage Attendance</Link>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
        <Col md={6} lg={4} className="mb-4">
          <motion.div variants={cardVariants}>
            <Card className="text-center p-3 shadow-sm h-100">
              <Card.Body>
                <IndianRupee size={48} className="mb-3 text-warning" />
                <Card.Title>Payroll</Card.Title>
                <Card.Text>Calculate and view employee payslips.</Card.Text>
                <Link to="/admin/payroll" className="btn btn-outline-warning mt-3">View Payroll</Link>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </motion.div>
  );
};

export default AdminDashboardPage;