// src/services/auth.service.js
import axios from 'axios';
import loggingService from './logging.service'; // Import your logging service
//import { jwtDecode } from 'jwt-decode'; // Ensure 'jwt-decode' is installed: npm install jwt-decode

// IMPORTANT: Replace with the actual URL of your Spring Boot backend's auth endpoint
const API_URL = 'http://localhost:8183/api/auth/';

const USER_KEY = 'user'; // Key for storing user data in localStorage

class AuthService {
  /**
   * Registers a new user.
   * @param {string} username The username for registration.
   * @param {string} password The password for registration.
   * @param {string} role The role for the new user (e.g., "employee" or "admin").
   * @returns {Promise<object>} The registration response from the backend.
   */
  async register(username, password, role) {
    try {
      loggingService.info('auth.service: Attempting user registration', { username, role });
      const response = await axios.post(API_URL + 'register', {
        username,
        password,
        role,
      });
      loggingService.info('auth.service: User registered successfully', { userId: response.data.userId });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      loggingService.error('auth.service: User registration failed', { username, errorMessage, errorStack: error.stack });
      throw new Error(errorMessage);
    }
  }

  /**
   * Logs in a user and stores JWT token and user info in local storage.
   * @param {string} username The username for login.
   * @param {string} password The password for login.
   * @returns {Promise<object>} The login response containing JWT and user details.
   */
  async login(username, password) {
    try {
      loggingService.info('auth.service: Attempting user login', { username });
      const response = await axios.post(API_URL + 'login', {
        username,
        password,
      });
      console.log('AuthService: Backend login response.data (raw):', response.data); // IMPORTANT LOG: See raw backend response

      if (response.data.jwtToken) {
        // Store the full user object (which contains token, id, username, role)
        //localStorage.setItem('user', JSON.stringify(response.data));
        localStorage.setItem(USER_KEY, JSON.stringify(response.data));
        // FIX: Use response.data.jwtToken instead of response.data.token
        //localStorage.setItem('jwtToken', response.data.jwtToken);
        
        loggingService.info('auth.service: Login successful, user data stored:', response.data);

        // Decode token to get ID, username, and role directly from claims
        // FIX: Use response.data.jwtToken instead of response.data.token
        /*const decodedToken = jwtDecode(response.data.jwtToken);
        localStorage.setItem('userId', decodedToken.id);
        localStorage.setItem('username', decodedToken.sub); // 'sub' is typically the username
        localStorage.setItem('userRole', decodedToken.role); // Store the role without "ROLE_" prefix*/

        console.log('Login successful, user data stored:', response.data);
      }
      return response.data; // Return the full response data including role
    } catch (error) {
      console.error('AuthService login error:', error.response || error);
      const errorMessage = error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : error.message || 'Login failed due to an unexpected error.';
      loggingService.error('auth.service: User login failed', { username, errorMessage, errorStack: error.stack });
      throw new Error(errorMessage);
    }
  }

  /**
   * Logs out the current user by removing token and user info from local storage.
   */
  logout() {
    //loggingService.info('auth.service: User logged out', { user: this.getCurrentUser()?.username });
    //localStorage.removeItem('user');
    localStorage.removeItem(USER_KEY);
    /*localStorage.removeItem('jwtToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');*/
    const loggedOutUser = this.getCurrentUser();
    loggingService.info('auth.service: User logged out', { username: loggedOutUser?.username });
    console.log('User logged out, local storage cleared.');
  }

  /**
   * Forgot Password - Step 1: Verify User (username and email) and request OTP.
   * @param {string} username
   * @param {string} email
   * @returns {Promise<object>} Response containing message and potentially OTP (for dev/testing).
   */
  async verifyUserForForgotPassword(username, email) {
    try {
      loggingService.info('auth.service: Requesting OTP for forgot password', { username, email });
      const response = await axios.post(API_URL + 'verify-forgotpass-user', { username, email });
      loggingService.info('auth.service: OTP request successful', { username, responseData: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      loggingService.error('auth.service: OTP request failed', { username, errorMessage, errorStack: error.stack });
      throw new Error(errorMessage);
    }
  }

  /**
   * Forgot Password - Step 2: Verify the OTP provided by the user.
   * @param {string} username
   * @param {number} otp The OTP entered by the user.
   * @returns {Promise<object>} Response indicating OTP verification status.
   *//*
  async verifyOtp(username, otp) {
    try {
      loggingService.info('auth.service: Verifying OTP', { username });
      const response = await axios.post(API_URL + 'verify-otp', { username, otp });
      loggingService.info('auth.service: OTP verification successful', { username, responseData: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      loggingService.error('auth.service: OTP verification failed', { username, errorMessage, errorStack: error.stack });
      throw new Error(errorMessage);
    }
  }*/

  /**
   * Forgot Password - Step 3: Reset the user's password.
   * @param {string} username
   * @param {string} newPassword
   * @returns {Promise<object>} Response indicating password reset status.
   */
  async resetPassword(username, newPassword) {
    try {
      loggingService.info('auth.service: Resetting password', { username });
      const response = await axios.post(API_URL + 'reset-password', { username, newPassword });
      loggingService.info('auth.service: Password reset successful', { username, responseData: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      loggingService.error('auth.service: Password reset failed', { username, errorMessage, errorStack: error.stack });
      throw new Error(errorMessage);
    }
  }

  

  /**
   * Retrieves the current user's information from local storage.
   * @returns {object | null} The user object (id, username, role, jwtToken) or null if not logged in.
   */
  /*getCurrentUser() {
    try {
      //const user = localStorage.getItem('user');
      //const user = JSON.parse(localStorage.getItem(USER_KEY));
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (e) {
      //loggingService.error('auth.service: Error parsing user from localStorage', { error: error.message });
      console.error("Failed to parse user from localStorage:", e);
      return null;
    }
  }*/
  getCurrentUser() {
    try {
      const userString = localStorage.getItem(USER_KEY);
      console.log('AuthService: Raw string from localStorage (USER_KEY):', userString); // IMPORTANT LOG: See raw string
      if (userString) {
        const user = JSON.parse(userString);
        console.log('AuthService: Parsed user object from localStorage:', user); // IMPORTANT LOG: See parsed object
        return user;
      }
      return null;
    } catch (e) {
      console.error("AuthService: Failed to parse user from localStorage:", e);
      loggingService.error('auth.service: Error parsing user from localStorage', { error: e.message });
      return null;
    }
  }

  /**
   * Retrieves the JWT token from local storage.
   * @returns {string | null} The JWT token string or null if not available.
   */
  getJwtToken() {
    const user = this.getCurrentUser();
    return user ? user.jwtToken : null;
  }

  getCurrentUserRole() {
    //return localStorage.getItem('userRole');
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  getAuthHeader() {
    //const token = localStorage.getItem('jwtToken');
    const token = this.getJwtToken();
    if (token) {
      return { Authorization: 'Bearer ' + token };
    } else {
      return {};
    }
  }
}
export default new AuthService();