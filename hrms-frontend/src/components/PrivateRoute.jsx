// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import loggingService from '../services/logging.service';
import Loader from './Loader'; // Import the Loader component


/**
 * A component that protects routes based on authentication status and user roles.
 *
 * @param {object} props
 * @param {string[]} props.allowedRoles - An array of roles that are allowed to access this route (e.g., ['ADMIN', 'EMPLOYEE']).
 * @param {string} [props.redirectTo='/auth?form=login'] - The path to redirect to if the user is not authenticated.
 * Defaults to the general login page.
 */
const PrivateRoute = ({ allowedRoles, redirectTo = '/auth?form=login' }) => {
  const { user, isAuthenticated, loading, hasRole } = useAuth();
  const location = useLocation();

  console.log('PrivateRoute Render: path:', window.location.pathname, 'loading:', loading, 'isAuthenticated():', isAuthenticated(), 'user:', user?.username, 'userRole:', user?.role);

  // Show a loader while the authentication status is being determined
  if (loading) {
    return <Loader />;
  }

  // 1. Check if user is authenticated
  if (!isAuthenticated()) {
    loggingService.warn('PrivateRoute: User not authenticated, redirecting to login.', { path: window.location.pathname, redirectTo });
    // Redirect to the specified login page, passing current location for potential post-login redirect
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // 2. If authenticated, check for role-based access if allowedRoles are specified
  if (allowedRoles && allowedRoles.length > 0) {
    // Check if the user's current role is included in the allowedRoles array
    const userHasRequiredRole = allowedRoles.some(role => hasRole(role));

    if (!userHasRequiredRole) {
      console.warn(`PrivateRoute: Unauthorized access attempt. User role: ${user?.role}, Required roles: ${allowedRoles.join(', ')}`);
      loggingService.warn('PrivateRoute: User authenticated but lacks required role(s).', {
        path: window.location.pathname,
        userId: user?.id,
        userRole: user?.role,
        allowedRoles: allowedRoles,
      });
      // Redirect to a general unauthorized page for all role-based access denials
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // If authenticated and authorized by role, render the nested routes
  console.log('PrivateRoute: User is authenticated and authorized. Rendering Outlet.');
  return <Outlet />;
};

export default PrivateRoute;
