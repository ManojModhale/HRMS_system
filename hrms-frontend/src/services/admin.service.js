// hrms-frontend/src/services/admin.service.js
import axios from 'axios';
import authService from './auth.service';
import loggingService from './logging.service';

const ADMIN_BASE_API_URL = 'http://localhost:8183/api/admin/';
//const ADMIN_ATTENDANCE_API_URL = ADMIN_BASE_API_URL + 'attendance/';
// Add other admin-specific API URLs here as needed

class AdminService {
  // Helper to get auth header from authService
  getAuthHeader() {
    return authService.getAuthHeader();
  }

  // --- User Management Methods ---
  /**
   * Fetches all users from the backend. Requires ADMIN role.
   * @returns {Promise<Array<object>>} List of user objects (UserDto).
   */
  async getAllUsers() {
    try {
      loggingService.info('admin.service: Fetching all users.');
      const headers = authService.getAuthHeader();
      if (!headers.Authorization) {
        throw new Error("Authorization token not found. Admin not logged in.");
      }
      const response = await axios.get(ADMIN_BASE_API_URL + 'users/all', { headers });
      loggingService.info('admin.service: All users fetched successfully.', { usersCount: response.data.length });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      loggingService.error('admin.service: Failed to fetch all users.', { errorMessage, errorStack: error.stack });
      throw new Error(errorMessage);
    }
  }

  /**
   * Fetches users with a PENDING role.
   * @returns {Promise<Array<object>>} List of pending user objects (UserDto).
   */
  async getPendingUsers() {
    try {
      loggingService.info('admin.service: Fetching pending users.');
      const headers = this.getAuthHeader();
      if (!headers.Authorization) {
        throw new Error("Authorization token not found. Admin not logged in.");
      }
      // Diagnostic log: Check headers right before sending the request
      console.log('admin.service: Sending request to /pending-users with headers:', headers);

      const response = await axios.get(ADMIN_BASE_API_URL + 'pending-users', { headers });
      loggingService.info('admin.service: Successfully fetched pending users.', { count: response.data.length });
      return response.data; // Expecting List<UserDto>
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      loggingService.error('admin.service: Error fetching pending users.', { errorMessage, errorStack: error.stack });
      throw new Error(errorMessage);
    }
  }
  /**
   * Fetches users with a PENDING role.
   * @returns {Promise<Array>} List of pending user objects.
   */
  /*async getPendingUsers() {
    try {
      loggingService.info('employee.service: Fetching pending users');
      const response = await axios.get(API_BASE_URL + 'admin/pending-users', { headers: this.getAuthHeader() });
      loggingService.info('employee.service: Successfully fetched pending users', { count: response.data.length });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      loggingService.error('employee.service: Error fetching pending users', { errorMessage, errorStack: error.stack });
      throw error;
    }
  }*/

  /**
   * Updates a user's role. Requires ADMIN role.
   * @param {Long} userId The ID of the user to update.
   * @param {string} newRole The new role for the user (e.g., "ADMIN", "EMPLOYEE", "HR").
   * @returns {Promise<object>} The updated user object (UserDto).
   */
  async updateUserRole(userId, newRole) {
    try {
      loggingService.info('admin.service: Updating user role.', { userId, newRole });
      const headers = authService.getAuthHeader();
      if (!headers.Authorization) {
        throw new Error("Authorization token not found. Admin not logged in.");
      }
      const response = await axios.put(`${ADMIN_BASE_API_URL}users/${userId}/role`, { role: newRole }, { headers });
      loggingService.info('admin.service: User role updated successfully.', { updatedUser: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      loggingService.error('admin.service: Failed to update user role.', { errorMessage, errorStack: error.stack });
      throw new Error(errorMessage);
    }
  }

  /**
   * Deletes a user by ID. Requires ADMIN role.
   * @param {Long} userId The ID of the user to delete.
   * @returns {Promise<void>}
   */
  async deleteUser(userId) {
    try {
      loggingService.info('admin.service: Deleting user.', { userId });
      const headers = authService.getAuthHeader();
      if (!headers.Authorization) {
        throw new Error("Authorization token not found. Admin not logged in.");
      }
      await axios.delete(`${ADMIN_BASE_API_URL}users/${userId}`, { headers });
      loggingService.info('admin.service: User deleted successfully.', { userId });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      loggingService.error('admin.service: Failed to delete user.', { errorMessage, errorStack: error.stack });
      throw new Error(errorMessage);
    }
  }

  // --- Employee Management Methods ---
  /**
   * Fetches all employee records. Requires ADMIN or HR role.
   * @returns {Promise<Array<object>>} List of employee objects (EmployeeDetailsDto).
   */
  async getAllEmployees() {
    try {
      loggingService.info('admin.service: Fetching all employees.');
      const headers = this.getAuthHeader();
      if (!headers.Authorization) {
        throw new Error("Authorization token not found. Admin not logged in.");
      }
      const response = await axios.get(ADMIN_BASE_API_URL + 'employees/all', { headers });
      loggingService.info('admin.service: All employees fetched successfully.', { employeesCount: response.data.length });
      return response.data; // Expecting List<EmployeeDetailsDto>
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      loggingService.error('admin.service: Failed to fetch all employees.', { errorMessage, errorStack: error.stack });
      throw new Error(errorMessage);
    }
  }

  /**
   * Creates a new employee record and optionally links to an existing user.
   * @param {object} employeeCreationRequest EmployeeCreationRequest containing employee details.
   * @returns {Promise<object>} The created employee object (EmployeeDetailsDto).
   */
  async createEmployee(employeeCreationRequest) { // Accepts EmployeeCreationRequest
    try {
      loggingService.info('admin.service: Creating new employee.', { username: employeeCreationRequest.username, existingUserId: employeeCreationRequest.existingUserId });
      const headers = this.getAuthHeader();
      if (!headers.Authorization) {
        throw new Error("Authorization token not found. Admin not logged in.");
      }
      const response = await axios.post(ADMIN_BASE_API_URL + 'employees', employeeCreationRequest, { headers });
      loggingService.info('admin.service: Employee created successfully.', { employee: response.data });
      return response.data; // Expecting EmployeeDetailsDto
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      loggingService.error('admin.service: Failed to create employee.', { errorMessage, errorStack: error.stack });
      throw new Error(errorMessage);
    }
  }

  /**
   * Updates an existing employee record.
   * @param {Long} employeeId The ID of the employee to update.
   * @param {object} updateData EmployeeDetailsDto containing employee data to update.
   * @returns {Promise<object>} The updated employee object (EmployeeDetailsDto).
   */
  async updateEmployee(employeeId, updateData) { // Accepts EmployeeDetailsDto
    try {
      loggingService.info('admin.service: Updating employee record.', { employeeId, updateData });
      const headers = this.getAuthHeader();
      if (!headers.Authorization) {
        throw new Error("Authorization token not found. Admin not logged in.");
      }
      const response = await axios.put(`${ADMIN_BASE_API_URL}employees/${employeeId}`, updateData, { headers });
      loggingService.info('admin.service: Employee record updated successfully.', { updatedEmployee: response.data });
      return response.data; // Expecting EmployeeDetailsDto
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      loggingService.error('admin.service: Failed to update employee record.', { errorMessage, errorStack: error.stack });
      throw new Error(errorMessage);
    }
  }

  /**
   * Deletes an employee record.
   * @param {Long} employeeId The ID of the employee to delete.
   * @returns {Promise<void>}
   */
  async deleteEmployee(employeeId) {
    try {
      loggingService.info('admin.service: Deleting employee record.', { employeeId });
      const headers = this.getAuthHeader();
      if (!headers.Authorization) {
        throw new Error("Authorization token not found. Admin not logged in.");
      }
      await axios.delete(`${ADMIN_BASE_API_URL}employees/${employeeId}`, { headers });
      loggingService.info('admin.service: Employee record deleted successfully.', { employeeId });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      loggingService.error('admin.service: Failed to delete employee record.', { errorMessage, errorStack: error.stack });
      throw new Error(errorMessage);
    }
  }

  // --- Admin Attendance Methods ---
  /**
   * Admin marks attendance for a specific employee on a specific date.
   * @param {object} attendanceData { employeeId: Long, attendanceDate: string (YYYY-MM-DD), status: string }
   * @returns {Promise<object>} The created attendance record.
   */
  async markAttendance(attendanceData) {
    try {
      loggingService.info('admin.service: Marking attendance for employee', { attendanceData });
      const headers = authService.getAuthHeader();
      if (!headers.Authorization) {
        throw new Error("Authorization token not found. Admin not logged in.");
      }
      const response = await axios.post(ADMIN_BASE_API_URL + 'attendance/mark', attendanceData, { headers });
      loggingService.info('admin.service: Attendance marked successfully', { attendance: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      loggingService.error('admin.service: Failed to mark attendance', { errorMessage, errorStack: error.stack });
      throw new Error(errorMessage);
    }
  }

  /**
   * Admin fetches all attendance records, optionally filtered by a single date.
   * This maps to the backend's `getAllAttendanceByDate` method.
   * @param {string} [date] YYYY-MM-DD format.
   * @returns {Promise<Array<object>>} List of all attendance records.
   */
  async getAllAttendanceByDate(date = null) {
    try {
      loggingService.info('admin.service: Fetching all attendance records by date', { date });
      const headers = authService.getAuthHeader();
      if (!headers.Authorization) {
        throw new Error("Authorization token not found. Admin not logged in.");
      }
      const params = {};
      if (date) params.date = date; // Parameter name matches backend @RequestParam
      const response = await axios.get(ADMIN_BASE_API_URL + 'attendance/all-by-date', { headers, params }); // New endpoint
      loggingService.info('admin.service: All attendance records fetched successfully by date', { records: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      loggingService.error('admin.service: Failed to fetch all attendance records by date', { errorMessage, errorStack: error.stack });
      throw new Error(errorMessage);
    }
  }

  /**
   * Admin fetches all attendance records, optionally filtered by a date range.
   * This maps to the backend's `getAllAttendance` method.
   * @param {string} [startDate] YYYY-MM-DD format.
   * @param {string} [endDate] YYYY-MM-DD format.
   * @returns {Promise<Array<object>>} List of all attendance records.
   */
  async getAllAttendance(startDate = null, endDate = null) {
    try {
      loggingService.info('admin.service: Fetching all attendance records by date range', { startDate, endDate });
      const headers = authService.getAuthHeader();
      if (!headers.Authorization) {
        throw new Error("Authorization token not found. Admin not logged in.");
      }
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axios.get(ADMIN_BASE_API_URL + 'attendance/all', { headers, params });
      loggingService.info('admin.service: All attendance records fetched successfully by date range', { records: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      loggingService.error('admin.service: Failed to fetch all attendance records by date range', { errorMessage, errorStack: error.stack });
      throw new Error(errorMessage);
    }
  }

  /**
   * Admin updates an existing attendance record.
   * @param {Long} attendanceId The ID of the attendance record to update.
   * @param {object} updateData { status: string } (e.g., "PRESENT", "ABSENT")
   * @returns {Promise<object>} The updated attendance record.
   */
  async updateAttendance(attendanceId, updateData) {
    try {
      loggingService.info('admin.service: Updating attendance record', { attendanceId, updateData });
      const headers = authService.getAuthHeader();
      if (!headers.Authorization) {
        throw new Error("Authorization token not found. Admin not logged in.");
      }
      const response = await axios.put(`${ADMIN_BASE_API_URL}attendance/${attendanceId}`, updateData, { headers });
      loggingService.info('admin.service: Attendance record updated successfully', { updatedRecord: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      loggingService.error('admin.service: Failed to update attendance record', { errorMessage, errorStack: error.stack });
      throw new Error(errorMessage);
    }
  }

  // --- Admin Leave Methods (NEW) ---

  /**
   * Admin fetches all pending leave applications.
   * @returns {Promise<Array<object>>} List of pending leave applications.
   */
  async getAllPendingLeaveApplications() {
    try {
      loggingService.info('admin.service: Fetching all pending leave applications');
      const headers = authService.getAuthHeader();
      if (!headers.Authorization) {
        throw new Error("Authorization token not found. Admin not logged in.");
      }
      const response = await axios.get(ADMIN_BASE_API_URL + 'leaves/pending', { headers });
      loggingService.info('admin.service: All pending leave applications fetched successfully', { applications: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      loggingService.error('admin.service: Failed to fetch pending leave applications', { errorMessage, errorStack: error.stack });
      throw new Error(errorMessage);
    }
  }

  /**
   * Admin processes a leave application (approves or rejects).
   * @param {object} processData { leaveApplicationId: Long, status: string ("APPROVED"|"REJECTED"), adminNotes: string }
   * @returns {Promise<object>} The updated leave application record.
   */
  async processLeaveApplication(processData) {
    try {
      loggingService.info('admin.service: Processing leave application', { processData });
      const headers = authService.getAuthHeader();
      if (!headers.Authorization) {
        throw new Error("Authorization token not found. Admin not logged in.");
      }
      const response = await axios.put(ADMIN_BASE_API_URL + 'leaves/process', processData, { headers });
      loggingService.info('admin.service: Leave application processed successfully', { updatedApplication: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      loggingService.error('admin.service: Failed to process leave application', { errorMessage, errorStack: error.stack });
      throw new Error(errorMessage);
    }
  }

  // --- Payroll Management Methods ---

  /**
   * Initiates the monthly payroll processing for all employees.
   * @param {number} month - The month for which to process payroll (1-12).
   * @param {number} year - The year for which to process payroll.
   * @returns {Promise<string>} Success message from the backend.
   */
  async processPayroll(month, year) {
    try {
      loggingService.info('admin.service: Processing payroll', { month, year });
      const headers = this.getAuthHeader();
      if (!headers.Authorization) {
        throw new Error("Authorization token not found. Admin not logged in.");
      }
      const response = await axios.post(`${ADMIN_BASE_API_URL}payroll/process`, { month, year }, { headers });
      loggingService.info('admin.service: Payroll processing initiated successfully', { responseData: response.data });
      return response.data.message;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      loggingService.error('admin.service: Failed to process payroll', { errorMessage, errorStack: error.stack });
      throw new Error(errorMessage);
    }
  }

  /**
   * Adds a bonus to a specific employee for a given month/year.
   * @param {object} bonusData - Object containing employeeId, amount, month, year, description.
   * @returns {Promise<string>} Success message from the backend.
   */
  async addBonus(bonusData) {
    try {
      loggingService.info('admin.service: Adding bonus', { employeeId: bonusData.employeeId, month: bonusData.month, year: bonusData.year });
      const headers = this.getAuthHeader();
      if (!headers.Authorization) {
        throw new Error("Authorization token not found. Admin not logged in.");
      }
      const response = await axios.post(`${ADMIN_BASE_API_URL}bonuses`, bonusData, { headers });
      loggingService.info('admin.service: Bonus added successfully', { responseData: response.data });
      return response.data.message;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      loggingService.error('admin.service: Failed to add bonus', { errorMessage, errorStack: error.stack });
      throw new Error(errorMessage);
    }
  }

  /**
   * Fetches all generated payslips for a specific month and year.
   * @param {number} month - The month (1-12).
   * @param {number} year - The year.
   * @returns {Promise<Array<object>>} List of PayslipDto objects.
   */
  async getPayslipsForMonth(month, year) {
    try {
      loggingService.info('admin.service: Fetching payslips for month/year', { month, year });
      const headers = this.getAuthHeader();
      if (!headers.Authorization) {
        throw new Error("Authorization token not found. Admin not logged in.");
      }
      const response = await axios.get(`${ADMIN_BASE_API_URL}payslips/${year}/${month}`, { headers });
      loggingService.info('admin.service: Payslips fetched successfully', { count: response.data.length });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      loggingService.error('admin.service: Failed to fetch payslips for month/year', { errorMessage, errorStack: error.stack });
      throw new Error(errorMessage);
    }
  }

  /**
   * Fetches details of a specific payslip by its ID.
   * @param {number} payslipId - The ID of the payslip.
   * @returns {Promise<object>} PayslipDto object.
   */
  async getPayslipDetails(payslipId) {
    try {
      loggingService.info('admin.service: Fetching payslip details', { payslipId });
      const headers = this.getAuthHeader();
      if (!headers.Authorization) {
        throw new Error("Authorization token not found. Admin not logged in.");
      }
      const response = await axios.get(`${ADMIN_BASE_API_URL}payslips/${payslipId}`, { headers });
      loggingService.info('admin.service: Payslip details fetched successfully', { responseData: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      loggingService.error('admin.service: Failed to fetch payslip details', { errorMessage, errorStack: error.stack });
      throw new Error(errorMessage);
    }
  }

  // --- Contact Messages Management ---
  /**
   * Fetches all contact messages from the backend. Requires ADMIN role.
   * @returns {Promise<Array<object>>} List of contact message objects.
   */
  async getAllContacts() {
    try {
      loggingService.info('admin.service: Fetching all contact messages.');
      const headers = authService.getAuthHeader();
      if (!headers.Authorization) {
        throw new Error("Authorization token not found. Admin not logged in.");
      }
      const response = await axios.get(ADMIN_BASE_API_URL + 'get-contacts', { headers }); // Match your backend endpoint
      loggingService.info('admin.service: All contact messages fetched successfully.', { messagesCount: response.data.length });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      loggingService.error('admin.service: Failed to fetch contact messages', { errorMessage, errorStack: error.stack });
      throw new Error(errorMessage);
    }
  }










  // --- Admin User/Employee Management Methods (Moved from employee.service.js) ---
  /*async getAllEmployees() {
    try {
      loggingService.info('admin.service: Fetching all employees');
      const headers = authService.getAuthHeader();
      if (!headers.Authorization) {
        throw new Error("Authorization token not found. Admin not logged in.");
      }
      const response = await axios.get(ADMIN_BASE_API_URL + 'employees', { headers });
      loggingService.info('admin.service: All employees fetched successfully');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      loggingService.error('admin.service: Failed to fetch all employees', { errorMessage, errorStack: error.stack });
      throw new Error(errorMessage);
    }
  }*/

  /*async getPendingUsers() {
    try {
      loggingService.info('admin.service: Fetching pending users');
      const headers = authService.getAuthHeader();
      if (!headers.Authorization) {
        throw new Error("Authorization token not found. Admin not logged in.");
      }
      const response = await axios.get(ADMIN_BASE_API_URL + 'users/pending', { headers });
      loggingService.info('admin.service: Pending users fetched successfully');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      loggingService.error('admin.service: Failed to fetch pending users', { errorMessage, errorStack: error.stack });
      throw new Error(errorMessage);
    }
  }

  async createEmployee(employeeData) {
    try {
      loggingService.info('admin.service: Creating employee', { employeeData });
      const headers = authService.getAuthHeader();
      if (!headers.Authorization) {
        throw new Error("Authorization token not found. Admin not logged in.");
      }
      const response = await axios.post(ADMIN_BASE_API_URL + 'employees', employeeData, { headers });
      loggingService.info('admin.service: Employee created successfully', { responseData: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      loggingService.error('admin.service: Failed to create employee', { errorMessage, errorStack: error.stack });
      throw new Error(errorMessage);
    }
  }

  async updateEmployee(employeeId, employeeData) {
    try {
      loggingService.info('admin.service: Updating employee', { employeeId, employeeData });
      const headers = authService.getAuthHeader();
      if (!headers.Authorization) {
        throw new Error("Authorization token not found. Admin not logged in.");
      }
      const response = await axios.put(`${ADMIN_BASE_API_URL}employees/${employeeId}`, employeeData, { headers });
      loggingService.info('admin.service: Employee updated successfully', { responseData: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      loggingService.error('admin.service: Failed to update employee', { errorMessage, errorStack: error.stack });
      throw new Error(errorMessage);
    }
  }

  async deleteEmployee(employeeId) {
    try {
      loggingService.info('admin.service: Deleting employee', { employeeId });
      const headers = authService.getAuthHeader();
      if (!headers.Authorization) {
        throw new Error("Authorization token not found. Admin not logged in.");
      }
      const response = await axios.delete(`${ADMIN_BASE_API_URL}employees/${employeeId}`, { headers });
      loggingService.info('admin.service: Employee deleted successfully', { responseData: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      loggingService.error('admin.service: Failed to delete employee', { errorMessage, errorStack: error.stack });
      throw new Error(errorMessage);
    }
  }*/
}


export default new AdminService();