// src/pages/admin/EmployeeManagementPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Button, Modal, Form, Table, Card, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { UserPlus, Edit, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2'; // For confirmation dialogs and notifications

import adminService from '../../services/admin.service'; // Use adminService for all admin actions
import loggingService from '../../services/logging.service'; // Import logging service
import { useAuth } from '../../context/AuthContext.jsx'; // Import useAuth
import { motion } from 'framer-motion';

// EmployeeFormModal component (reused for Add/Edit)
const EmployeeFormModal = ({
  isOpen,
  onClose,
  onSave,
  initialEmployeeData, // This will be an EmployeeDetailsDto for editing
  initialConvertUserData, // This will be a basic UserDto (id, username, role)
  pendingUsers, // List of basic UserDtos
  isLoading // Prop to show loading state on the form button
}) => {
  const [formData, setFormData] = useState({
    id: null, // Employee ID (for editing EmployeeDetailsDto)
    userId: null, // User ID (for EmployeeDetailsDto)
    existingUserId: null, // User ID to convert (for EmployeeCreationRequest)
    username: '',
    password: '', // Only for new user creation or setting temp password for converted users
    employeeIdNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    designation: '',
    salary: '',
    // joinDate is set on backend
  });
  const [formErrors, setFormErrors] = useState({});
  const [isConvertingExistingUser, setIsConvertingExistingUser] = useState(false);
  const [isEditingExistingEmployee, setIsEditingExistingEmployee] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormErrors({}); // Clear errors on open
      console.log('EmployeeFormModal: Modal opened. initialConvertUserData:', initialConvertUserData);

      if (initialConvertUserData) {
        // Scenario 1: Converting a pending user
        // Use initialConvertUserData.existingUserId instead of .id
        const userIdAsNumber = parseInt(initialConvertUserData.existingUserId, 10); 
        
        if (isNaN(userIdAsNumber)) {
            console.error("EmployeeFormModal: initialConvertUserData.existingUserId is not a valid number:", initialConvertUserData.existingUserId);
            Swal.fire('Error', 'Invalid user ID received for conversion. Please try again.', 'error');
            // Optionally, close the modal or reset state to prevent further issues
            onClose(); 
            return; 
        }

        setFormData({
          id: null, // No employee ID yet
          userId: null, // No employee userId yet
          existingUserId: userIdAsNumber, // Use the parsed number here
          username: initialConvertUserData.username,
          password: '', // Admin sets a temporary password
          employeeIdNumber: '', // Admin fills this
          firstName: '',
          lastName: '',
          email: '',
          department: '',
          designation: '',
          salary: '',
        });
        setIsConvertingExistingUser(true);
        setIsEditingExistingEmployee(false);
        loggingService.info('EmployeeFormModal: Initializing for user conversion.', { user: initialConvertUserData.username, id: userIdAsNumber });
      } else if (initialEmployeeData) {
        // Scenario 2: Editing an existing employee (initialEmployeeData is an EmployeeDetailsDto)
        setFormData({
          id: initialEmployeeData.id, // Employee's ID
          userId: initialEmployeeData.userId, // User's ID associated with employee
          existingUserId: null, // Not applicable for editing
          username: initialEmployeeData.username,
          password: '', // Password is not displayed/edited here for security.
          employeeIdNumber: initialEmployeeData.employeeIdNumber,
          firstName: initialEmployeeData.firstName,
          lastName: initialEmployeeData.lastName,
          email: initialEmployeeData.email,
          department: initialEmployeeData.department,
          designation: initialEmployeeData.designation,
          salary: initialEmployeeData.salary,
        });
        setIsConvertingExistingUser(false);
        setIsEditingExistingEmployee(true);
        loggingService.info('EmployeeFormModal: Initializing for employee edit.', { employeeId: initialEmployeeData.id });
      } else {
        // Scenario 3: Adding a brand new employee (direct from EmployeeManagementPage)
        setFormData({
          id: null,
          userId: null,
          existingUserId: null,
          username: '',
          password: '',
          employeeIdNumber: '',
          firstName: '',
          lastName: '',
          email: '',
          department: '',
          designation: '',
          salary: '',
        });
        setIsConvertingExistingUser(false);
        setIsEditingExistingEmployee(false);
        loggingService.info('EmployeeFormModal: Initializing for new employee creation (direct).');
      }
    }
  }, [isOpen, initialEmployeeData, initialConvertUserData, onClose]); // Added onClose to dependency array

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleExistingUserSelect = (e) => {
    const selectedUserId = e.target.value;
    const selectedUser = pendingUsers.find(user => user.id === parseInt(selectedUserId));
    if (selectedUser) {
      setFormData(prev => ({
        ...prev,
        existingUserId: parseInt(selectedUserId, 10), // Ensure it's a number
        username: selectedUser.username,
        password: '', // Admin sets a new password for the employee
      }));
      setIsConvertingExistingUser(true);
      loggingService.info('EmployeeFormModal: Selected pending user for conversion.', { userId: selectedUserId });
    } else {
      // When the "Select a pending user to convert" option is chosen (value is empty string)
      setFormData(prev => ({
        ...prev,
        existingUserId: null, // Set to null when nothing is selected
        username: '',
        password: '',
      }));
      setIsConvertingExistingUser(false);
      loggingService.info('EmployeeFormModal: Cleared pending user selection.');
    }
    setFormErrors((prev) => ({ ...prev, existingUserId: '' }));
  };

  // Modified validateForm to accept formData as an argument
  const validateForm = (currentFormData) => { 
    let errors = {};
    let isValid = true;

    if (isConvertingExistingUser) {
      // Use currentFormData instead of formData from closure
      console.log('Validation Check: isConvertingExistingUser:', isConvertingExistingUser, 'currentFormData.existingUserId:', currentFormData.existingUserId, 'type:', typeof currentFormData.existingUserId);

      // Check if existingUserId is null or not a positive number
      if (currentFormData.existingUserId === null || typeof currentFormData.existingUserId !== 'number' || currentFormData.existingUserId <= 0) {
        errors.existingUserId = 'Please select an existing user.';
        isValid = false;
      }
      if (!currentFormData.password.trim()) {
        errors.password = 'Temporary password for employee is required.';
        isValid = false;
      } else if (currentFormData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters.';
        isValid = false;
      }
    } else if (!isEditingExistingEmployee) { // Only require username/password for brand new employee creation
      if (!currentFormData.username.trim()) {
        errors.username = 'Username is required.';
        isValid = false;
      }
      if (!currentFormData.password.trim()) {
        errors.password = 'Password is required.';
        isValid = false;
      } else if (currentFormData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters.';
        isValid = false;
      }
    }

    if (!currentFormData.employeeIdNumber.trim()) {
      errors.employeeIdNumber = 'Employee ID Number is required.';
      isValid = false;
    }
    if (!currentFormData.firstName.trim()) {
      errors.firstName = 'First Name is required.';
      isValid = false;
    }
    if (!currentFormData.lastName.trim()) {
      errors.lastName = 'Last Name is required.';
      isValid = false;
    }
    if (!currentFormData.email.trim()) {
      errors.email = 'Email is required.';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(currentFormData.email)) {
      errors.email = 'Email address is invalid.';
      isValid = false;
    }
    if (!currentFormData.department.trim()) {
      errors.department = 'Department is required.';
      isValid = false;
    }
    if (!currentFormData.designation.trim()) {
      errors.designation = 'Designation is required.';
      isValid = false;
    }
    if (!currentFormData.salary || isNaN(currentFormData.salary) || parseFloat(currentFormData.salary) <= 0) {
      errors.salary = 'Valid Salary is required.';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Pass the current formData state to validateForm
    if (validateForm(formData)) { 
      let payload;
      if (isEditingExistingEmployee) {
        // Payload for updating an existing employee (EmployeeDetailsDto structure)
        payload = {
          id: formData.id, // Employee ID
          userId: formData.userId, // User ID associated with the employee
          username: formData.username, // Username (read-only in this form)
          employeeIdNumber: formData.employeeIdNumber,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          department: formData.department,
          designation: formData.designation,
          salary: parseFloat(formData.salary),
          // joinDate is read-only
        };
      } else {
        // Payload for creating a new employee or converting (EmployeeCreationRequest structure)
        payload = {
          existingUserId: formData.existingUserId,
          username: formData.username,
          password: formData.password,
          employeeIdNumber: formData.employeeIdNumber,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          department: formData.department,
          designation: formData.designation,
          salary: parseFloat(formData.salary),
        };
      }
      // Call the onSave prop, passing the payload and the editing status
      onSave(payload, isEditingExistingEmployee);
    } else {
      Swal.fire('Validation Error', 'Please correct the errors in the form.', 'error');
      loggingService.warn('EmployeeFormModal: Form validation failed.', { errors: formErrors });
    }
  };

  return (
    <Modal show={isOpen} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {isConvertingExistingUser ? 'Convert User to Employee' : (isEditingExistingEmployee ? 'Edit Employee Details' : 'Add New Employee')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {!(isEditingExistingEmployee) && ( // Show user selection/creation fields only if not editing existing employee
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="existingUserId">
                  <Form.Label>Select Existing User (Optional)</Form.Label>
                  <Form.Select
                    name="existingUserId"
                    value={formData.existingUserId !== null ? formData.existingUserId : ''} 
                    onChange={handleExistingUserSelect}
                    isInvalid={!!formErrors.existingUserId}
                    disabled={isConvertingExistingUser} // Disable when a user is being converted
                  >
                     {/* Render the pre-selected user as the first option if converting */}
                     {isConvertingExistingUser && formData.existingUserId !== null && (
                       <option key={formData.existingUserId} value={formData.existingUserId}>
                         {pendingUsers.find(user => user.id === formData.existingUserId)?.username || `User ID: ${formData.existingUserId}`} (ID: {formData.existingUserId})
                       </option>
                     )}
                     {/* Render the default option only if not converting an existing user */}
                     {!isConvertingExistingUser && (
                       <option value="">-- Select a pending user to convert --</option>
                     )}
                     {/* Filter out the already selected user from the rest of the options */}
                     {pendingUsers
                       .filter(user => !(isConvertingExistingUser && user.id === formData.existingUserId))
                       .map(user => (
                         <option key={user.id} value={user.id}>
                           {user.username} (ID: {user.id})
                         </option>
                       ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Choose a user who has registered and is awaiting employee creation.
                  </Form.Text>
                  <Form.Control.Feedback type="invalid">
                    {formErrors.existingUserId}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="username">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    isInvalid={!!formErrors.username}
                    disabled={isConvertingExistingUser}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.username}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          )}

          {!(isEditingExistingEmployee) && ( // Show password field only if not editing existing employee
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="password">
                  <Form.Label>{isConvertingExistingUser ? 'Set Temporary Password' : 'Password'}</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder={isConvertingExistingUser ? "Set a temporary password for the employee" : "Enter password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    isInvalid={!!formErrors.password}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.password}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="employeeIdNumber">
                  <Form.Label>Employee ID Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., EMP001"
                    name="employeeIdNumber"
                    value={formData.employeeIdNumber}
                    onChange={handleChange}
                    isInvalid={!!formErrors.employeeIdNumber}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.employeeIdNumber}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          )}

          {isEditingExistingEmployee && ( // Show employee ID for editing mode
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="employeeIdNumber">
                  <Form.Label>Employee ID Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., EMP001"
                    name="employeeIdNumber"
                    value={formData.employeeIdNumber}
                    onChange={handleChange}
                    isInvalid={!!formErrors.employeeIdNumber}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.employeeIdNumber}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                   <Form.Group controlId="username">
                   <Form.Label>Username</Form.Label>
                   <Form.Control
                     type="text"
                     name="username"
                     value={formData.username}
                     disabled // Username cannot be changed directly from employee details
                   />
                 </Form.Group>
               </Col>
             </Row>
           )}

           <Row className="mb-3">
             <Col md={6}>
               <Form.Group controlId="firstName">
                 <Form.Label>First Name</Form.Label>
                 <Form.Control
                   type="text"
                   placeholder="Enter first name"
                   name="firstName"
                   value={formData.firstName}
                   onChange={handleChange}
                   isInvalid={!!formErrors.firstName}
                 />
                 <Form.Control.Feedback type="invalid">
                   {formErrors.firstName}
                 </Form.Control.Feedback>
               </Form.Group>
             </Col>
             <Col md={6}>
               <Form.Group controlId="lastName">
                 <Form.Label>Last Name</Form.Label>
                 <Form.Control
                   type="text"
                   placeholder="Enter last name"
                   name="lastName"
                   value={formData.lastName}
                   onChange={handleChange}
                   isInvalid={!!formErrors.lastName}
                 />
                 <Form.Control.Feedback type="invalid">
                   {formErrors.lastName}
                 </Form.Control.Feedback>
               </Form.Group>
             </Col>
           </Row>

           <Row className="mb-3">
             <Col md={6}>
               <Form.Group controlId="email">
                 <Form.Label>Email</Form.Label>
                 <Form.Control
                   type="email"
                   placeholder="Enter email"
                   name="email"
                   value={formData.email}
                   onChange={handleChange}
                   isInvalid={!!formErrors.email}
                 />
                 <Form.Control.Feedback type="invalid">
                   {formErrors.email}
                 </Form.Control.Feedback>
               </Form.Group>
             </Col>
             <Col md={6}>
               <Form.Group controlId="department">
                 <Form.Label>Department</Form.Label>
                 <Form.Control
                   type="text"
                   placeholder="e.g., HR, IT, Sales"
                   name="department"
                   value={formData.department}
                   onChange={handleChange}
                   isInvalid={!!formErrors.department}
                 />
                 <Form.Control.Feedback type="invalid">
                   {formErrors.department}
                 </Form.Control.Feedback>
               </Form.Group>
             </Col>
           </Row>

           <Row className="mb-3">
             <Col md={6}>
               <Form.Group controlId="designation">
                 <Form.Label>Designation</Form.Label>
                 <Form.Control
                   type="text"
                   placeholder="e.g., Software Engineer, Manager"
                   name="designation"
                   value={formData.designation}
                   onChange={handleChange}
                   isInvalid={!!formErrors.designation}
                 />
                 <Form.Control.Feedback type="invalid">
                   {formErrors.designation}
                 </Form.Control.Feedback>
               </Form.Group>
             </Col>
             <Col md={6}>
               <Form.Group controlId="salary">
                 <Form.Label>Salary</Form.Label>
                 <Form.Control
                   type="number"
                   step="0.01"
                   placeholder="Enter annual salary"
                   name="salary"
                   value={formData.salary}
                   onChange={handleChange}
                   isInvalid={!!formErrors.salary}
                 />
                 <Form.Control.Feedback type="invalid">
                   {formErrors.salary}
                 </Form.Control.Feedback>
               </Form.Group>
             </Col>
           </Row>

           <Button variant="primary" type="submit" className="w-100 mt-3" disabled={isLoading}>
             {isLoading ? <Spinner animation="border" size="sm" /> : (isEditingExistingEmployee ? 'Update Employee' : (isConvertingExistingUser ? 'Convert User & Create Employee' : 'Create New Employee'))}
           </Button>
         </Form>
       </Modal.Body>
     </Modal>
   );
 };


const EmployeeManagementPage = ({ showAddEmployeeModal, handleCloseAddEmployeeModal, initialConvertUserData }) => {
  const [employees, setEmployees] = useState([]); // This will store EmployeeDetailsDto objects
  const [pendingUsers, setPendingUsers] = useState([]); // This will store UserDto objects (basic user info)
  const [loading, setLoading] = useState(true); // Main loading state for the page
  const [error, setError] = useState(null);

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null); // This will be an EmployeeDetailsDto object

  const [userMgmtInitiatedModal, setUserMgmtInitiatedModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // New state for delete operation loading

  const { user, isAuthenticated } = useAuth(); // Destructure user and isAuthenticated from useAuth

  const fetchEmployeesAndPendingUsers = useCallback(async () => {
    setLoading(true); // Set loading true when fetching data
    setError(null);
    try {
      loggingService.info('EmployeeManagementPage: Fetching employees and pending users.');
      const employeesData = await adminService.getAllEmployees(); // Now returns List<EmployeeDetailsDto>
      setEmployees(employeesData);

      // Assuming adminService.getPendingUsers() returns basic UserDto list
      const pendingUsersData = await adminService.getPendingUsers();
      setPendingUsers(pendingUsersData);
      Swal.fire('Success', 'Employee and pending user data loaded.', 'success');
      loggingService.info('EmployeeManagementPage: Employee and pending user data loaded successfully.');
    } catch (err) {
      console.error("Failed to fetch data:", err);
      loggingService.error('EmployeeManagementPage: Failed to fetch data.', { error: err.message });
      if (err.response && err.response.status === 401) {
        setError("You are not authorized to view this page. Please log in as an administrator.");
        Swal.fire('Access Denied', 'Please log in as an administrator.', 'error');
      } else {
        setError("Failed to load employee and user data.");
        Swal.fire('Error', err.message || 'Failed to load employee and user data.', 'error');
      }
    } finally {
      setLoading(false); // Set loading false after fetch completes
    }
  }, []);

  useEffect(() => {
    // Only fetch data if the user is authenticated and has the correct role
    // Assuming 'ADMIN' or 'HR' can access this page
    if (isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'HR')) {
      fetchEmployeesAndPendingUsers();
    } else if (isAuthenticated && !(user?.role === 'ADMIN' || user?.role === 'HR')) {
      // User is authenticated but doesn't have the required role
      setError("You do not have the necessary permissions to view this page.");
      setLoading(false);
      Swal.fire('Permission Denied', 'You do not have the necessary permissions to view this page.', 'warning');
    } else {
      // Not authenticated yet or not logged in
      setLoading(false);
      setError("Please log in to view employee management data.");
    }
  }, [isAuthenticated, user, fetchEmployeesAndPendingUsers]); // Add isAuthenticated and user as dependencies

  useEffect(() => {
    if (showAddEmployeeModal && initialConvertUserData) {
      setShowFormModal(true);
      setUserMgmtInitiatedModal(true);
      setEditingEmployee(null); // Ensure no employee is being edited
      loggingService.info('EmployeeManagementPage: Modal opened by UserManagementPage for conversion.');
    } else if (!showAddEmployeeModal && userMgmtInitiatedModal) {
      setShowFormModal(false);
      setUserMgmtInitiatedModal(false);
      loggingService.info('EmployeeManagementPage: Modal closed by UserManagementPage.');
    }
  }, [showAddEmployeeModal, initialConvertUserData, userMgmtInitiatedModal]);

  const handleOpenEditModal = (employee) => {
    setEditingEmployee(employee); // employee is an EmployeeDetailsDto
    setShowFormModal(true);
    setUserMgmtInitiatedModal(false); // Ensure this is treated as an internal open
    loggingService.info('EmployeeManagementPage: Opening edit modal for employee.', { employeeId: employee.id });
  };

  const handleCloseFormModal = () => {
    setShowFormModal(false);
    setEditingEmployee(null);
    if (userMgmtInitiatedModal && handleCloseAddEmployeeModal) {
      handleCloseAddEmployeeModal();
    }
    loggingService.info('EmployeeManagementPage: Closing employee form modal.');
  };

  const handleSaveEmployee = async (payload, isEditing) => {
    setLoading(true); // Set loading true when saving/creating an employee
    try {
      let successMessage = '';
      if (isEditing) {
        await adminService.updateEmployee(payload.id, payload); // Execute update
        successMessage = 'Employee updated successfully!';
      } else {
        // This is the ONLY place createEmployee should be called for new/converted employees
        await adminService.createEmployee(payload); 
        successMessage = 'Employee created successfully!';
      }
      
      Swal.fire('Success', successMessage, 'success');
      loggingService.info(`EmployeeManagementPage: ${successMessage}`, { username: payload.username || payload.id });

      handleCloseFormModal();
      await fetchEmployeesAndPendingUsers(); // Await refresh to ensure data is up-to-date
    } catch (err) {
      console.error('Error saving employee:', err);
      loggingService.error('EmployeeManagementPage: Failed to save employee.', { error: err.message, payload });
      // More robust error message extraction
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save employee.';
      Swal.fire('Error', errorMessage, 'error');
    } finally {
      setLoading(false); // Set loading false after save completes (success or error)
    }
  };

  const handleDeleteEmployee = async (employeeId, username) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete employee ${username}? This action cannot be undone. This will also delete the associated user account.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsDeleting(true); // Set deleting state true
        try {
          // The backend response for successful deletion might not always have a 'message' field.
          // We will assume success if the call completes without throwing an error.
          await adminService.deleteEmployee(employeeId); 
          Swal.fire('Deleted!', 'Employee and associated user deleted successfully.', 'success'); // Provide a default success message
          loggingService.info('EmployeeManagementPage: Employee deleted successfully.', { employeeId });
          await fetchEmployeesAndPendingUsers(); // Await refresh to ensure data is up-to-date
        } catch (err) {
          console.error('Error deleting employee:', err);
          loggingService.error('EmployeeManagementPage: Failed to delete employee.', { error: err.message, employeeId });
          // More robust error message extraction
          const errorMessage = err.response?.data?.message || err.message || 'Failed to delete employee.';
          Swal.fire('Error', errorMessage, 'error');
        } finally {
          setIsDeleting(false); // Set deleting state false after delete completes
        }
      }
    });
  };

  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={pageVariants}>
      <h1 className="mb-4 d-flex align-items-center gap-2">
        <UserPlus size={32} /> Employee Management
      </h1>

      <Card className="p-4 shadow-sm mb-4" data-aos="fade-up">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Card.Title className="mb-0">Employee List</Card.Title>
            {/* Add New Employee Button - also disabled during any loading */}
            <Button 
              variant="primary" 
              onClick={() => { setShowFormModal(true); setEditingEmployee(null); setUserMgmtInitiatedModal(false); }}
              disabled={loading || isDeleting} // Disable if overall page loading or deleting
            >
              <UserPlus size={20} className="me-2" /> Add New Employee
            </Button>
          </div>

          <Card.Text className="text-muted mb-4">
            View and manage all active employee records. Use the User Management page to convert pending users into new employees.
          </Card.Text>

          {loading ? (
            <div className="d-flex justify-content-center my-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading employees...</span>
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
                    <th>Username</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Salary</th>
                    <th>Join Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.length > 0 ? (
                    employees.map((employee) => ( // employee is an EmployeeDetailsDto here
                      <tr key={employee.id}>
                        <td>{employee.employeeIdNumber}</td>
                        <td>{employee.username}</td>
                        <td>{employee.firstName}</td>
                        <td>{employee.lastName}</td>
                        <td>{employee.email}</td>
                        <td>{employee.department}</td>
                        <td>{employee.designation}</td>
                        <td>₹{employee.salary ? employee.salary.toFixed(2) : 'N/A'}</td>
                        <td>{employee.joinDate}</td>
                        <td>
                          <Button
                            variant="outline-info"
                            size="sm"
                            className="me-2 d-flex align-items-center gap-1"
                            onClick={() => handleOpenEditModal(employee)}
                            disabled={loading || isDeleting} // Disable during any loading/deleting
                          >
                            <Edit size={16} /> Edit
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="d-flex align-items-center gap-1"
                            onClick={() => handleDeleteEmployee(employee.id, employee.username)}
                            disabled={loading || isDeleting} // Disable during any loading/deleting
                          >
                            <Trash2 size={16} /> Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="text-center text-muted">No employees found.</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Employee Form Modal */}
      <EmployeeFormModal
        isOpen={showFormModal}
        onClose={handleCloseFormModal}
        onSave={handleSaveEmployee}
        initialEmployeeData={editingEmployee}
        initialConvertUserData={initialConvertUserData}
        pendingUsers={pendingUsers}
        isLoading={loading} // Pass the main page loading state to the modal's submit button
      />
    </motion.div>
  );
};
export default EmployeeManagementPage;
