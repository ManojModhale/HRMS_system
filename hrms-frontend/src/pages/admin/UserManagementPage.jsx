// src/pages/admin/UserManagementPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Button, Modal, Form, Table, Card, Spinner, Alert } from 'react-bootstrap';
import { UserPlus, UserX, CheckCircle, XCircle } from 'lucide-react';
import Swal from 'sweetalert2'; // Use Swal for notifications
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Import the EmployeeManagementPage component to reuse its modal
// We will pass props to control the modal's visibility and pre-fill data
import EmployeeManagementPage from './EmployeeManagementPage'; // Assuming it's in the same directory
import adminService from '../../services/admin.service';
import loggingService from '../../services/logging.service';
import { useAuth } from '../../context/AuthContext.jsx'; // Import useAuth

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false); // For delete confirmation
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState(''); // 'approve' or 'delete'

  // State for the Add/Convert Employee Modal (from EmployeeManagementPage)
  const [showAddEmployeeModalFromUserMgmt, setShowAddEmployeeModalFromUserMgmt] = useState(false);
  const [userToConvertData, setUserToConvertData] = useState(null); // Data for pre-filling the modal

  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth(); // Destructure user and isAuthenticated from useAuth

  // Memoize fetchUsers to prevent infinite loop
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      loggingService.info('UserManagementPage: Attempting to fetch all users.');
      const usersData = await adminService.getAllUsers();
      setUsers(usersData);
      loggingService.info('UserManagementPage: Users loaded successfully.', { usersCount: usersData.length });
      Swal.fire('Success', 'Users loaded successfully!', 'success'); // Use Swal
    } catch (err) {
      console.error("Failed to fetch users:", err);
      loggingService.error('UserManagementPage: Failed to fetch Users.', { error: err.message });
      if (err.response && err.response.status === 401) {
        setError("You are not authorized to view this page. Please log in as an administrator.");
        Swal.fire('Access Denied', 'Please log in as an administrator.', 'error'); // Use Swal
        navigate('/auth');
      } else {
        setError("Failed to load user data.");
        Swal.fire('Error', err.message || 'Failed to load user data.', 'error'); // Use Swal
      }
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array means this function reference is stable

  useEffect(() => {
    // Only fetch data if the user is authenticated and has the correct role
    if (isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'HR')) {
      fetchUsers();
    } else if (isAuthenticated && !(user?.role === 'ADMIN' || user?.role === 'HR')) {
      // User is authenticated but doesn't have the required role
      setError("You do not have the necessary permissions to view this page.");
      setLoading(false);
      Swal.fire('Permission Denied', 'You do not have the necessary permissions to view this page.', 'warning');
    } else {
      // Not authenticated yet or not logged in
      setLoading(false);
      setError("Please log in to view user management data.");
    }
  }, [isAuthenticated, user, fetchUsers]); // Add isAuthenticated, user, and fetchUsers as dependencies

  // Handler for showing the delete confirmation modal
  const handleShowConfirmModal = (user, type) => {
    setSelectedUser(user);
    setActionType(type);
    setShowConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
    setSelectedUser(null);
    setActionType('');
  };

  const handleConfirmAction = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      if (actionType === 'delete') {
        await adminService.deleteUser(selectedUser.id);
        loggingService.info(`UserManagementPage: User ${selectedUser.username} deleted successfully.`);
        Swal.fire('Deleted!', `User ${selectedUser.username} deleted successfully.`, 'success'); // Use Swal
        fetchUsers(); // Refresh list after deletion
      }
    } catch (err) {
      console.error(`Error performing ${actionType} action:`, err);
      loggingService.error(`UserManagementPage: Error performing ${actionType} action:`, { error: err.message });
      Swal.fire('Error', `Failed to ${actionType} user: ${err.response?.data?.message || err.message || 'An unexpected error occurred.'}`, 'error'); // Use Swal
    } finally {
      setLoading(false);
      handleCloseConfirmModal();
    }
  };

  // Handler for showing the Add/Convert Employee Modal for a pending user
  const handleConvertUserClick = (user) => {
    setUserToConvertData({
      existingUserId: user.id,
      username: user.username,
      // Other fields will be empty for admin to fill
    });
    setShowAddEmployeeModalFromUserMgmt(true);
    loggingService.info('UserManagementPage: Opening conversion modal for user.', { userId: user.id });
  };

  // Callback to refresh users after an employee is successfully created/converted
  const handleEmployeeModalCloseAndRefresh = () => {
    setShowAddEmployeeModalFromUserMgmt(false);
    setUserToConvertData(null);
    fetchUsers(); // Re-fetch all users to reflect role change
    loggingService.info('UserManagementPage: Employee conversion modal closed, refreshing user list.');
  };

  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={pageVariants}>
      <h1 className="mb-4 d-flex align-items-center gap-2">
        <UserPlus size={32} /> User Management
      </h1>

      <Card className="p-4 shadow-sm mb-4" data-aos="fade-up">
        <Card.Body>
          <Card.Title className="mb-4">All System Users</Card.Title>
          <Card.Text className="text-muted mb-4">
            View and manage all registered users. Pending users can be converted to employees.
          </Card.Text>

          {loading ? (
            <div className="d-flex justify-content-center my-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading users...</span>
              </Spinner>
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover className="mb-0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.username}</td>
                        <td>
                          <span className={`badge ${
                            user.role === 'ADMIN' ? 'bg-danger' :
                            user.role === 'EMPLOYEE' ? 'bg-success' :
                            user.role === 'HR' ? 'bg-info' :
                            'bg-warning text-dark'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          {user.role === 'PENDING' && (
                            <Button
                              variant="success"
                              size="sm"
                              className="me-2 d-flex align-items-center gap-1"
                              onClick={() => handleConvertUserClick(user)}
                            >
                              <CheckCircle size={16} /> Convert to Employee
                            </Button>
                          )}
                          {/* Disable delete if user is an EMPLOYEE or ADMIN/HR for safety */}
                          {user.role !== 'ADMIN' && user.role !== 'HR' && user.role !== 'EMPLOYEE' && (
                            <Button
                              variant="danger"
                              size="sm"
                              className="d-flex align-items-center gap-1"
                              onClick={() => handleShowConfirmModal(user, 'delete')}
                              // Disable if user is already an EMPLOYEE
                              disabled={user.role === 'EMPLOYEE'}
                            >
                              <XCircle size={16} /> Delete User
                            </Button>
                          )}
                            {/* If user is an EMPLOYEE, show a disabled delete button or no button */}
                          {user.role === 'EMPLOYEE' && (
                            <Button
                              variant="danger"
                              size="sm"
                              className="d-flex align-items-center gap-1"
                              disabled // Always disabled for employees as per your logic
                            >
                              <XCircle size={16} /> Cannot Delete Employee
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center text-muted">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Confirmation Modal (for delete) */}
      <Modal show={showConfirmModal} onHide={handleCloseConfirmModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Action</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && actionType === 'delete' && (
            <p>Are you sure you want to delete user <strong>{selectedUser.username}</strong> (ID: {selectedUser.id})? This action cannot be undone.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseConfirmModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmAction} disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : 'Confirm Delete'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Render the EmployeeManagementPage's modal, passing props to control it */}
      <EmployeeManagementPage
        showAddEmployeeModal={showAddEmployeeModalFromUserMgmt}
        handleCloseAddEmployeeModal={handleEmployeeModalCloseAndRefresh}
        initialConvertUserData={userToConvertData} // Pass the data to pre-fill
      />
    </motion.div>
  );
};
export default UserManagementPage;