// src/layouts/EmployeeLayout.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Nav, Button, Offcanvas, Navbar, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext.jsx';
import loggingService from '../services/logging.service';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import {
  User, FileText, CalendarCheck, DollarSign, LogOut, Menu, BellRing, LayoutDashboard,
  Briefcase, Home, ListTodo, ClipboardList, Wallet, BarChart2, CalendarDays, BookOpen
} from 'lucide-react';

const EmployeeLayout = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      loggingService.info('EmployeeLayout mounted and user data available', { username: user?.username, role: user?.role });
      console.log('EmployeeLayout mounted and user data available', { username: user?.username, role: user?.role });
    }
  }, [user, authLoading]);

  const handleLogout = useCallback(() => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of the system.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, log me out!"
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        loggingService.info('Employee user initiated logout from EmployeeLayout', { username: user?.username });
        Swal.fire(
          'Logged Out!',
          'You have been successfully logged out.',
          'success'
        );
        navigate('/auth?form=login');
      }
    });
  }, [logout, navigate, user]);

  const handleCloseOffcanvas = () => setShowOffcanvas(false);
  const handleShowOffcanvas = () => setShowOffcanvas(true);

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      {/* Mobile/Tablet Navbar Toggle - Only visible on screens smaller than lg */}
      <Button
        variant="primary"
        className="d-lg-none position-fixed top-0 start-0 m-3 z-1000"
        onClick={handleShowOffcanvas}
      >
        <Menu size={20} />
      </Button>

      {/* Sidebar for larger screens - Hidden on screens smaller than lg */}
      <div className="d-none d-lg-flex flex-column p-3 text-white bg-dark" style={{ width: '280px' }}>
        <Link to="/employee/profile" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
          <Briefcase size={30} className="me-2" />
          <span className="fs-5 fw-bold">HRMS Employee</span>
        </Link>
        <hr className="border-secondary" />
        <Nav className="flex-column w-100">
          <Nav.Item className="mb-2">
            <Nav.Link as={Link} to="/employee/my-profile" className={`text-white d-flex align-items-center gap-2 ${isActive('/employee/my-profile') ? 'active bg-primary rounded' : ''}`} onClick={handleCloseOffcanvas}>
              <User size={18} /> My Profile
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className="mb-2">
            <Nav.Link as={Link} to="/employee/attendance" className={`text-white d-flex align-items-center gap-2 ${isActive('/employee/attendance') ? 'active bg-primary rounded' : ''}`} onClick={handleCloseOffcanvas}>
              <CalendarCheck size={18} /> My Attendance
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className="mb-2">
            <Nav.Link as={Link} to="/employee/leaves" className={`text-white d-flex align-items-center gap-2 ${isActive('/employee/leaves') ? 'active bg-primary rounded' : ''}`} onClick={handleCloseOffcanvas}>
              <BookOpen size={18} /> My Leaves
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className="mb-2">
            <Nav.Link as={Link} to="/employee/salary-slips" className={`text-white d-flex align-items-center gap-2 ${isActive('/employee/salary-slips') ? 'active bg-primary rounded' : ''}`} onClick={handleCloseOffcanvas}>
              <DollarSign size={18} /> My Salary Slips
            </Nav.Link>
          </Nav.Item>
        </Nav>
        <hr className="border-secondary" />
        <Button variant="outline-light" className="mt-2 w-100" onClick={handleLogout}>
          <LogOut size={16} className="me-2" /> Sign out
        </Button>
      </div>

      {/* Offcanvas for mobile/tablet sidebar - No 'responsive' prop */}
      <Offcanvas show={showOffcanvas} onHide={handleCloseOffcanvas} placement="start" className="bg-dark text-white">
        <Offcanvas.Header closeButton closeVariant="white">
          <Offcanvas.Title className="d-flex align-items-center">
            <Briefcase size={24} className="me-2" /> HRMS Employee
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="d-flex flex-column">
          <Nav className="flex-column flex-grow-1">
            <Nav.Item className="mb-2">
              <Nav.Link as={Link} to="/employee/my-profile" className={`text-white d-flex align-items-center gap-2 ${isActive('/employee/my-profile') ? 'active bg-primary rounded' : ''}`} onClick={handleCloseOffcanvas}>
                <User size={18} /> My Profile
              </Nav.Link>
            </Nav.Item>
            <Nav.Item className="mb-2">
              <Nav.Link as={Link} to="/employee/attendance" className={`text-white d-flex align-items-center gap-2 ${isActive('/employee/attendance') ? 'active bg-primary rounded' : ''}`} onClick={handleCloseOffcanvas}>
                <CalendarCheck size={18} /> My Attendance
              </Nav.Link>
            </Nav.Item>
            <Nav.Item className="mb-2">
              <Nav.Link as={Link} to="/employee/leaves" className={`text-white d-flex align-items-center gap-2 ${isActive('/employee/leaves') ? 'active bg-primary rounded' : ''}`} onClick={handleCloseOffcanvas}>
                <BookOpen size={18} /> My Leaves
              </Nav.Link>
            </Nav.Item>
            <Nav.Item className="mb-2">
              <Nav.Link as={Link} to="/employee/salary-slips" className={`text-white d-flex align-items-center gap-2 ${isActive('/employee/salary-slips') ? 'active bg-primary rounded' : ''}`} onClick={handleCloseOffcanvas}>
                <DollarSign size={18} /> My Salary Slips
              </Nav.Link>
            </Nav.Item>
          </Nav>
          <hr className="border-secondary" />
          <Button variant="outline-light" className="mt-2 w-100" onClick={handleLogout}>
            <LogOut size={16} className="me-2" /> Sign out
          </Button>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Main Content Area */}
      <main className="flex-grow-1 p-3 p-md-4">
        <Navbar bg="white" expand="lg" className="shadow-sm rounded mb-4 p-3">
          <Container fluid>
            <Navbar.Brand className="fs-3 fw-semibold text-dark">
              Welcome, {user?.username} ({user?.role})!
            </Navbar.Brand>
            <Navbar.Text className="text-muted">Employee Panel</Navbar.Text>
          </Container>
        </Navbar>
        <div className="bg-white p-4 rounded shadow-sm min-vh-100">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default EmployeeLayout;