// hrms-frontend/src/services/employee.service.js
import axios from 'axios';
import authService from './auth.service'; // To get the current user's token and auth header
import loggingService from './logging.service'; // Import your logging service

const API_BASE_URL = 'http://localhost:8183/api/'; // Your Spring Boot backend base URL
// Base URL for employee endpoints (existing)
const EMPLOYEE_API_URL = 'http://localhost:8183/api/employee/';
// Base URL for admin endpoints (existing, will be moved to admin.service.js later)
const ADMIN_API_URL = 'http://localhost:8183/api/admin/';

class EmployeeService {

  // Helper to get auth header from authService
  // Note: authService.getAuthHeader() already returns { Authorization: 'Bearer TOKEN' } or {}
  getAuthHeader() {
    return authService.getAuthHeader();
  }

  // --- Admin Endpoints ---

  /**
   * Fetches users with a PENDING role.
   * @returns {Promise<Array>} List of pending user objects.
   */
  async getPendingUsers() {
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
  }

  /**
   * Fetches all employees (users with EMPLOYEE role and associated employee details).
   * @returns {Promise<Array>} List of employee objects.
   */
  /*async getAllEmployees() {
    try {
      loggingService.info('employee.service: Fetching all employees');
      const response = await axios.get(API_BASE_URL + 'admin/employees', { headers: this.getAuthHeader() });
      loggingService.info('employee.service: Successfully fetched all employees', { count: response.data.length });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      loggingService.error('employee.service: Error fetching all employees', { errorMessage, errorStack: error.stack });
      throw error;
    }
  }

  /**
   * Creates a new employee or converts an existing PENDING user to an employee.
   * @param {object} employeeData Data for the new employee.
   * @param {number} [employeeData.existingUserId] Optional: ID of an existing PENDING user to convert.
   * @param {string} employeeData.username
   * @param {string} employeeData.password
   * @param {string} employeeData.employeeIdNumber
   * @param {string} employeeData.firstName
   * @param {string} employeeData.lastName
   * @param {string} employeeData.email
   * @param {string} employeeData.department
   * @param {string} employeeData.designation
   * @param {number} employeeData.salary
   * @returns {Promise<object>} The response from the backend.
   */
  /*async createEmployee(employeeData) {
    try {
      loggingService.info('employee.service: Attempting to create/convert employee', { username: employeeData.username, existingUserId: employeeData.existingUserId });
      const response = await axios.post(API_BASE_URL + 'admin/create-employee', employeeData, { headers: this.getAuthHeader() });
      loggingService.info('employee.service: Employee created/converted successfully', { responseData: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      loggingService.error('employee.service: Error creating/converting employee', { username: employeeData.username, errorMessage, errorStack: error.stack });
      throw error;
    }
  }*/






  //Employee related methods for Employee Endpoints
  /**
   * Fetches the profile of the currently logged-in employee.
   * The backend will identify the user from the JWT token.
   * @returns {Promise<object>} UserDto containing employee profile data.
   */
  // --- Employee Profile Methods (Existing) ---
  async getMyProfile() {
    try {
      loggingService.info('employee.service: Fetching my profile');
      const headers = authService.getAuthHeader();
      if (!headers.Authorization) {
        throw new Error("Authorization token not found. User not logged in.");
      }
      const response = await axios.get(EMPLOYEE_API_URL+ 'my-details', { headers });
      loggingService.info('employee.service: My profile fetched successfully', { profile: response.data });
      return response.data; // This should be the UserDto
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      loggingService.error('employee.service: Failed to fetch my profile', { errorMessage, errorStack: error.stack });
      throw new Error(errorMessage);
    }
  }

  async updateMyProfile(profileData) {
    try {
      loggingService.info('employee.service: Updating my profile', { profileData });
      const headers = authService.getAuthHeader();
      if (!headers.Authorization) {
        throw new Error("Authorization token not found. User not logged in.");
      }
      const response = await axios.put(EMPLOYEE_API_URL+ 'update-details', profileData, { headers });
      loggingService.info('employee.service: My profile updated successfully', { updatedProfile: response.data });
      return response.data; // This should be the updated UserDto
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      loggingService.error('employee.service: Failed to update my profile', { errorMessage, errorStack: error.stack });
      throw new Error(errorMessage);
    }
  }

  // --- Employee Attendance Methods (NEW) ---

  /**
   * Marks the currently logged-in employee's attendance for today.
   * @param {string} status The attendance status (e.g., "PRESENT", "HALF_DAY").
   * @returns {Promise<object>} The created attendance record.
   */
  async markMyAttendance(status) {
    try {
      loggingService.info('employee.service: Marking my attendance with status:', status);
      const headers = authService.getAuthHeader();
      if (!headers.Authorization) {
        throw new Error("Authorization token not found. User not logged in.");
      }
      // The backend derives employeeId and attendanceDate from the token and current date
      const response = await axios.post(EMPLOYEE_API_URL + 'attendance/mark', { status }, { headers });
      loggingService.info('employee.service: My attendance marked successfully', { attendance: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      loggingService.error('employee.service: Failed to mark my attendance', { errorMessage, errorStack: error.stack });
      throw new Error(errorMessage);
    }
  }

  /**
   * Fetches the attendance history for the currently logged-in employee.
   * @returns {Promise<Array<object>>} List of attendance records.
   */
  async getMyAttendanceHistory() {
    try {
      loggingService.info('employee.service: Fetching my attendance history');
      const headers = authService.getAuthHeader();
      if (!headers.Authorization) {
        throw new Error("Authorization token not found. User not logged in.");
      }
      const response = await axios.get(EMPLOYEE_API_URL + 'attendance/my-history', { headers });
      loggingService.info('employee.service: My attendance history fetched successfully', { history: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      loggingService.error('employee.service: Failed to fetch my attendance history', { errorMessage, errorStack: error.stack });
      throw new Error(errorMessage);
    }
  }

  // --- Employee Leave Methods (NEW) ---

  /**
   * Employee applies for a new leave.
   * @param {object} leaveData { startDate: string (YYYY-MM-DD), endDate: string (YYYY-MM-DD), reason: string }
   * @returns {Promise<object>} The created leave application record.
   */
  async applyLeave(leaveData) {
    try {
      loggingService.info('employee.service: Applying for leave', { leaveData });
      const headers = authService.getAuthHeader();
      if (!headers.Authorization) {
        throw new Error("Authorization token not found. User not logged in.");
      }
      const response = await axios.post(EMPLOYEE_API_URL + 'leaves/apply', leaveData, { headers });
      loggingService.info('employee.service: Leave applied successfully', { leaveApplication: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      loggingService.error('employee.service: Failed to apply for leave', { errorMessage, errorStack: error.stack });
      throw new Error(errorMessage);
    }
  }

  /**
   * Fetches the leave history for the currently logged-in employee.
   * @returns {Promise<Array<object>>} List of leave application records.
   */
  async getMyLeaveHistory() {
    try {
      loggingService.info('employee.service: Fetching my leave history');
      const headers = authService.getAuthHeader();
      if (!headers.Authorization) {
        throw new Error("Authorization token not found. User not logged in.");
      }
      const response = await axios.get(EMPLOYEE_API_URL + 'leaves/my-history', { headers });
      loggingService.info('employee.service: My leave history fetched successfully', { history: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      loggingService.error('employee.service: Failed to fetch my leave history', { errorMessage, errorStack: error.stack });
      throw new Error(errorMessage);
    }
  }

  // --- Payslip Methods ---

  /**
   * Fetches a specific payslip for the authenticated employee by month and year.
   * @param {number} month - The month (1-12).
   * @param {number} year - The year.
   * @returns {Promise<object>} PayslipDto object.
   */
  async getMyPayslip(month, year) {
    try {
      loggingService.info('employee.service: Fetching my payslip for month/year', { month, year });
      const headers = this.getAuthHeader();
      if (!headers.Authorization) {
        throw new Error("Authorization token not found. Employee not logged in.");
      }
      const response = await axios.get(`${EMPLOYEE_API_URL}payslips/${year}/${month}`, { headers });
      loggingService.info('employee.service: My payslip fetched successfully', { responseData: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      loggingService.error('employee.service: Failed to fetch my payslip', { errorMessage, errorStack: error.stack });
      throw new Error(errorMessage);
    }
  }

  /**
   * Fetches all payslips for the authenticated employee.
   * @returns {Promise<Array<object>>} List of PayslipDto objects.
   */
  async getAllMyPayslips() {
    try {
      loggingService.info('employee.service: Fetching all my payslips.');
      const headers = this.getAuthHeader();
      if (!headers.Authorization) {
        throw new Error("Authorization token not found. Employee not logged in.");
      }
      const response = await axios.get(`${EMPLOYEE_API_URL}payslips/my-all`, { headers });
      loggingService.info('employee.service: All my payslips fetched successfully.', { count: response.data.length });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      loggingService.error('employee.service: Failed to fetch all my payslips.', { errorMessage, errorStack: error.stack });
      throw new Error(errorMessage);
    }
  }







/*
  // --- Admin-specific methods (Existing, will be moved to admin.service.js in next step) ---
  // Keeping them here for now to avoid breaking existing admin pages immediately.
  async getAllEmployees() {
    try {
      loggingService.info('employee.service: Fetching all employees (admin)');
      const headers = authService.getAuthHeader();
      if (!headers.Authorization) {
        throw new Error("Authorization token not found. User not logged in.");
      }
      const response = await axios.get(ADMIN_API_URL + 'employees', { headers });
      loggingService.info('employee.service: All employees fetched successfully (admin)');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      loggingService.error('employee.service: Failed to fetch all employees (admin)', { errorMessage, errorStack: error.stack });
      throw new Error(errorMessage);
    }
  }

  /**
   * Fetches employee details by username (Admin-only endpoint).
   * @param {string} username The username of the employee.
   * @returns {Promise<object>} Employee details.
   *//*
  async getEmployeeDetailsByUsernameForAdmin(username) {
    try {
      loggingService.info('employee.service: Admin fetching employee details by username', { username });
      const response = await axios.get(API_BASE_URL + `employee/details-by-username/${username}`, { headers: this.getAuthHeader() });
      loggingService.info('employee.service: Successfully fetched employee details for admin', { username, data: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      loggingService.error('employee.service: Error fetching employee details for admin', { username, errorMessage, errorStack: error.stack });
      throw error;
    }
  }
*/
  // --- Employee Endpoints (for employee's own actions) ---

  /**
   * Fetches the currently authenticated employee's own details.
   * @returns {Promise<object>} Current employee's details.
   */
  /*async getMyEmployeeDetails() {
    try {
      loggingService.info('employee.service: Fetching current user\'s employee details');
      const response = await axios.get(API_BASE_URL + 'employee/my-details', { headers: this.getAuthHeader() });
      loggingService.info('employee.service: Successfully fetched current user\'s employee details', { data: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      loggingService.error('employee.service: Error fetching current user\'s employee details', { errorMessage, errorStack: error.stack });
      throw error;
    }
  }*/



  // You can add more employee-related service methods here as needed for other pages
  // e.g., applyLeave, markAttendance, getMyPayslip, etc.
}

export default new EmployeeService();