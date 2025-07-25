// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import authService from '../services/auth.service';
import loggingService from '../services/logging.service';

// Create the Auth Context
const AuthContext = createContext(null);

/**
 * Provides authentication context to its children components.
 * Manages user login/logout state and makes auth functions available.
 */
export const AuthProvider = ({ children }) => {
  //const [currentUser, setCurrentUser] = useState(null); // Stores user object (id, username, role, jwtToken)
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // To indicate if initial loading of user from localStorage is complete
  //const [userRole, setUserRole] = useState(null); // Initialize as null, let loadUserFromLocalStorage set it

  //console.log('AuthContext Render: Initial state -> currentUser:', currentUser?.username, 'userRole:', userRole, 'loading:', loading);
  console.log('AuthContext Render: Initial state -> user:', user?.username, 'loading:', loading);

  // Function to load user from localStorage
  const loadUserFromLocalStorage = useCallback(() => {
    console.log('AuthContext: loadUserFromLocalStorage called');
    try {
      //const user = authService.getCurrentUser(); // This reads user object from localStorage
      //const role = authService.getCurrentUserRole(); // This reads userRole from localStorage
      const storedUser = authService.getCurrentUser(); // This reads the full user object from localStorage
      //console.log('AuthContext: User from localStorage:', user?.username, 'Role from localStorage:', role);
      console.log('AuthContext: Raw user object from localStorage (authService.getCurrentUser()):', storedUser);
      if (storedUser && storedUser.username && storedUser.role) { // Ensure properties exist
        console.log('AuthContext: Stored User -> ID:', storedUser.id, 'Username:', storedUser.username, 'Role:', storedUser.role, 'JWT:', storedUser.jwtToken ? 'Present' : 'Missing');
        setUser(storedUser); // Set the full user object
        loggingService.info('AuthContext: User loaded from localStorage', { username: storedUser.username, role: storedUser.role });
      } else {
        console.log('AuthContext: No valid user found in localStorage or missing properties.');
        setUser(null); // Clear user if invalid or not found
        // No need to set userRole separately, it's part of the user object
        loggingService.info('AuthContext: No user found in localStorage');
      }
    } catch (error) {
      loggingService.error('AuthContext: Error loading user from localStorage', { error: error.message });
      console.error('AuthContext: Error loading user from localStorage:', error);
      setUser(null); // Clear user if there's an error
    } finally {
      setLoading(false); // Set loading to false after attempting to load user
      console.log('AuthContext: setLoading(false) after loadUserFromLocalStorage. Current loading:', false);
    }
  }, []); // Empty dependency array means this function is created once

  // Effect to load user on initial mount
  useEffect(() => {
    console.log('AuthContext: useEffect for loadUserFromLocalStorage running');
    loadUserFromLocalStorage();
  }, [loadUserFromLocalStorage]);


  /**
   * Handles user login.
   * @param {string} username
   * @param {string} password
   * @returns {Promise<object>} The user data after successful login.
   * @throws {Error} If login fails.
   */
  const login = async (username, password) => {
    console.log('AuthContext: login function called for username:', username);
    try {
      setLoading(true); // Set loading true during login
      const userDataFromService = await authService.login(username, password); // This writes to localStorage
      //console.log('AuthContext: authService.login returned user:', user?.username, 'role:', user?.role);
      console.log('AuthContext: authService.login returned userDataFromService:', userDataFromService);


      if (userDataFromService && userDataFromService.username && userDataFromService.role) {
        // Verify the structure of userDataFromService before setting state
        console.log('AuthContext: Login successful. User data from service -> ID:', userDataFromService.id, 'Username:', userDataFromService.username, 'Role:', userDataFromService.role, 'JWT:', userDataFromService.jwtToken ? 'Present' : 'Missing');
        setUser(userDataFromService); // Update context state with the full user object
        loggingService.info('AuthContext: Login successful via AuthContext', { username: userDataFromService.username });
      } else {
        console.warn('AuthContext: authService.login returned null or incomplete user data.');
        setUser(null);
      }
      return userDataFromService;
    } catch (error) {
      loggingService.error('AuthContext: Login failed via AuthContext', { username, errorMessage: error.message });
      console.error('AuthContext: Login failed via AuthContext:', error);
      setUser(null); // Ensure no stale user data
      throw error; // Re-throw to be handled by the component
    } finally {
      setLoading(false); // Set loading false after login attempt
      console.log('AuthContext: setLoading(false) after login. Current loading:', false);
    }
  };

  /**
   * Handles user logout.
   */
  /*const logout = () => { // MOVED THIS FUNCTION DECLARATION UP
    console.log('AuthContext: logout function called');
    authService.logout(); // This clears local storage
    setCurrentUser(null);
    setUserRole(null);
    loggingService.info('AuthContext: Logout successful via AuthContext');
  };*/
  const logout = useCallback(() => {
    console.log('AuthContext: logout function called');
    authService.logout(); // This clears local storage
    setUser(null); // Clear the user object
    loggingService.info('AuthContext: Logout successful via AuthContext');
  }, []); // Empty dependency array for useCallback

  /**
   * Checks if the current user has a specific role.
   * @param {string} roleName The role to check for (e.g., "ADMIN", "EMPLOYEE").
   * @returns {boolean} True if the user has the role, false otherwise.
   */
  /*const hasRole = (roleName) => {
    return currentUser && currentUser.role && currentUser.role.toUpperCase() === roleName.toUpperCase();
  };*/
  const hasRole = useCallback((roleName) => {
    return user && user.role && user.role.toUpperCase() === roleName.toUpperCase();
  }, [user]); // Depend on user for useCallback

  /**
   * Returns true if a user is currently logged in.
   * This is explicitly a function.
   */
  /*const isAuthenticated = () => {
    return !!currentUser;
  };*/
  const isAuthenticated = useCallback(() => {
    return !!user;
  }, [user]); // Depend on user for useCallback


  const value = {
    user,   //currentUser, userRole,
    isAuthenticated,
    hasRole,
    login,
    logout,
    loading, // Provide loading state
  };

  //console.log('AuthContext Render: Value being provided -> currentUser:', value.currentUser?.username, 'userRole:', value.userRole, 'isAuthenticated:', value.isAuthenticated(), 'loading:', value.loading);
  console.log('AuthContext Render: Value being provided -> user:', value.user?.username, 'isAuthenticated:', value.isAuthenticated(), 'loading:', value.loading);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use the AuthContext.
 * @returns {object} The authentication context value.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
