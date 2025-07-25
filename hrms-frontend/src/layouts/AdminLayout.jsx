// src/layouts/AdminLayout.jsx
import React, { useState, useCallback } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Nav, Button, Offcanvas, Navbar } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext.jsx';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { Users, UserPlus, FileText, CalendarCheck, DollarSign, IndianRupee, LogOut, Menu, BellRing, LayoutDashboard, ClipboardList, BookOpen, Mail } from 'lucide-react'; // Lucide icons
import loggingService from '../services/logging.service';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showOffcanvas, setShowOffcanvas] = useState(false);

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
          logout(); // Call the logout function from AuthContext
          loggingService.info('Admin user initiated logout from AdminLayout', { username: user?.username });
          Swal.fire(
            'Logged Out!',
            'You have been successfully logged out.',
            'success'
          );
          navigate('/admin-login'); // Redirect to login after logout
        }
      });
    }, [logout, navigate]); // Dependencies for useCallback

  const handleCloseOffcanvas = () => setShowOffcanvas(false);
  const handleShowOffcanvas = () => setShowOffcanvas(true);

  // ADD THIS LINE: Determine if the current path matches a given link for active styling
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      {/* Mobile/Tablet Navbar Toggle */}
      <Button
        variant="primary"
        className="d-lg-none position-fixed top-0 start-0 m-3 z-1000"
        onClick={handleShowOffcanvas}
      >
        <Menu size={20} />
      </Button>

      {/* Vertical Sidebar for Desktop */}
      <motion.div
        className="d-none d-lg-flex flex-column p-3 text-white bg-dark shadow-sm"
        style={{ width: '280px', flexShrink: 0 }}
        initial={{ x: -200 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link to="/admin/dashboard" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
          <span className="fs-4 fw-bold">HRMS Admin</span>
        </Link>
        <hr className="border-secondary" />
        <Nav className="flex-column mb-auto">
          <Nav.Item className="mb-2">
            <Nav.Link as={Link} to="/admin/dashboard" className={`text-white d-flex align-items-center gap-2 ${location.pathname === '/admin' || location.pathname === '/admin/dashboard' ? 'active bg-primary rounded' : ''}`}>
              <LayoutDashboard size={18} /> Dashboard
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className="mb-2">
            <Nav.Link as={Link} to="/admin/users" className={`text-white d-flex align-items-center gap-2 ${location.pathname.startsWith('/admin/users') ? 'active bg-primary rounded' : ''}`}>
              <Users size={18} /> Users List
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className="mb-2">
            <Nav.Link as={Link} to="/admin/employees" className={`text-white d-flex align-items-center gap-2 ${location.pathname.startsWith('/admin/employees') ? 'active bg-primary rounded' : ''}`}>
              <UserPlus size={18} /> Employee Management
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className="mb-2">
            <Nav.Link as={Link} to="/admin/leave-approval" className={`text-white d-flex align-items-center gap-2 ${isActive('/admin/leave-approval') ? 'active bg-primary rounded' : ''}`} onClick={handleCloseOffcanvas}>
              <ClipboardList size={18} /> Leave Approval
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className="mb-2">
            <Nav.Link as={Link} to="/admin/attendance" className={`text-white d-flex align-items-center gap-2 ${location.pathname.startsWith('/admin/attendance') ? 'active bg-primary rounded' : ''}`}>
              <CalendarCheck size={18} /> Attendance
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className="mb-2">
            <Nav.Link as={Link} to="/admin/payroll" className={`text-white d-flex align-items-center gap-2 ${location.pathname.startsWith('/admin/payroll') ? 'active bg-primary rounded' : ''}`}>
              <IndianRupee size={18} /> Payroll
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className="mb-2">
            <Nav.Link as={Link} to="/admin/contact-messages" className={`text-white d-flex align-items-center gap-2 ${isActive('/admin/contact-messages') ? 'active bg-primary rounded' : ''}`} onClick={handleCloseOffcanvas}>
              <Mail size={18} /> Contact Messages
            </Nav.Link>
          </Nav.Item>
        </Nav>
        <hr className="border-secondary" />
        <div className="dropdown">
          <Button
            variant="dark"
            className="d-flex align-items-center text-white text-decoration-none dropdown-toggle w-100"
            onClick={() => { /* Toggle dropdown manually if needed or use react-bootstrap Dropdown */ }}
          >
            <strong>{user?.username || 'Admin'}</strong>
          </Button>
          <Button variant="outline-light" className="mt-2 w-100" onClick={handleLogout}>
            <LogOut size={16} className="me-2" /> Sign out
          </Button>
        </div>
      </motion.div>

      {/* Offcanvas for Mobile/Tablet */}
      <Offcanvas show={showOffcanvas} onHide={handleCloseOffcanvas} placement="start" className="bg-dark text-white">
        <Offcanvas.Header closeButton closeVariant="white">
          <Offcanvas.Title className="fw-bold">HRMS Admin</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="d-flex flex-column">
          <Nav className="flex-column mb-auto">
            <Nav.Item className="mb-2">
              <Nav.Link as={Link} to="/admin/dashboard" className={`text-white d-flex align-items-center gap-2 ${location.pathname === '/admin' || location.pathname === '/admin/dashboard' ? 'active bg-primary rounded' : ''}`} onClick={handleCloseOffcanvas}>
                <LayoutDashboard size={18} /> Dashboard
              </Nav.Link>
            </Nav.Item>
            <Nav.Item className="mb-2">
              <Nav.Link as={Link} to="/admin/users" className={`text-white d-flex align-items-center gap-2 ${location.pathname.startsWith('/admin/users') ? 'active bg-primary rounded' : ''}`} onClick={handleCloseOffcanvas}>
                <Users size={18} /> Users List
              </Nav.Link>
            </Nav.Item>
            <Nav.Item className="mb-2">
              <Nav.Link as={Link} to="/admin/employees" className={`text-white d-flex align-items-center gap-2 ${location.pathname.startsWith('/admin/employees') ? 'active bg-primary rounded' : ''}`} onClick={handleCloseOffcanvas}>
                <UserPlus size={18} /> Employee Management
              </Nav.Link>
            </Nav.Item>
            <Nav.Item className="mb-2">
              <Nav.Link as={Link} to="/admin/leave-approval" className={`text-white d-flex align-items-center gap-2 ${isActive('/admin/leave-approval') ? 'active bg-primary rounded' : ''}`} onClick={handleCloseOffcanvas}>
                <ClipboardList size={18} /> Leave Approval
              </Nav.Link>
            </Nav.Item>
            <Nav.Item className="mb-2">
              <Nav.Link as={Link} to="/admin/attendance" className={`text-white d-flex align-items-center gap-2 ${location.pathname.startsWith('/admin/attendance') ? 'active bg-primary rounded' : ''}`} onClick={handleCloseOffcanvas}>
                <CalendarCheck size={18} /> Attendance
              </Nav.Link>
            </Nav.Item>
            <Nav.Item className="mb-2">
              <Nav.Link as={Link} to="/admin/payroll" className={`text-white d-flex align-items-center gap-2 ${location.pathname.startsWith('/admin/payroll') ? 'active bg-primary rounded' : ''}`} onClick={handleCloseOffcanvas}>
                <IndianRupee size={18} /> Payroll
              </Nav.Link>
            </Nav.Item>
            <Nav.Item className="mb-2">
              <Nav.Link as={Link} to="/admin/contact-messages" className={`text-white d-flex align-items-center gap-2 ${isActive('/admin/contact-messages') ? 'active bg-primary rounded' : ''}`} onClick={handleCloseOffcanvas}>
                <Mail size={18} /> Contact Messages
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
            <Navbar.Text className="text-muted">Admin Panel</Navbar.Text>
          </Container>
        </Navbar>
        <div className="bg-white p-4 rounded shadow-sm min-vh-100-minus-header"> {/* Custom class for dynamic height */}
          <Outlet /> {/* Renders the specific admin page content */}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;