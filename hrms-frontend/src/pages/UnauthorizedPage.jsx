// src/pages/UnauthorizedPage.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import loggingService from '../services/logging.service';
import { FiAlertTriangle } from 'react-icons/fi'; // Import an icon
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from 'react-bootstrap';

const UnauthorizedPage = () => {
  const { logout, isAuthenticated } = useAuth(); // Get logout and isAuthenticated from AuthContext
  const navigate = useNavigate(); // Get navigate hook

  useEffect(() => {
    loggingService.warn('UnauthorizedPage: Unauthorized page accessed', { path: window.location.pathname });
  }, []);

  const handleGoHome = useCallback(() => {
    if (isAuthenticated()) {
      loggingService.info('UnauthorizedPage: User was authenticated, logging out before redirecting to home.');
      logout(); // Call logout to clear session
    }
    navigate('/'); // Redirect to home page
  }, [logout, isAuthenticated, navigate]);

  return (
    // The original styling uses Tailwind-like classes. I'll preserve them.
    // Ensure your project has Tailwind CSS set up, or replace these with equivalent Bootstrap classes if needed.
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-800 p-4">
      <FiAlertTriangle className="text-yellow-500 text-8xl mb-6 animate-pulse" />
      <h1 className="text-5xl md:text-6xl font-bold text-yellow-600 mb-4">403</h1>
      <p className="text-2xl md:text-3xl font-semibold mb-8 text-center">Access Denied</p>
      <p className="text-lg md:text-xl text-center mb-8 max-w-xl">
        You do not have the necessary permissions to view this page.
        Please contact your administrator if you believe this is an error.
      </p>
      {/* Changed from Link to Button with onClick for logout logic */}
      <Button
        onClick={handleGoHome}
        // Retaining original Tailwind-like classes, convert to Bootstrap if not using Tailwind.
        // Example Bootstrap equivalent: variant="primary" size="lg" className="rounded-md shadow-md"
        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150 ease-in-out text-lg shadow-md transform hover:scale-105"
      >
        Go to Home
      </Button>
    </div>
  );
};
export default UnauthorizedPage;