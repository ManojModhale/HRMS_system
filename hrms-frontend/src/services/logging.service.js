// src/services/logging.service.js
import axios from 'axios';

// IMPORTANT: Replace with the actual URL of your Spring Boot backend's logging endpoint
//const LOGGING_API_URL = 'http://localhost:8183/api/frontend-logs';
const LOGGING_API_URL = 'https://hrms-system-backend.onrender.com/api/frontend-logs'

const log = async (level, message, context = {}) => {
  try {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      context: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        ...context, // Allow additional custom context (e.g., component name, user ID)
      },
    };

    // Send the log entry to the backend
    await axios.post(LOGGING_API_URL, logEntry);

    // Optionally log to console for debugging during development
    console[level](`[${level.toUpperCase()}] ${message}`, context);

  } catch (error) {
    // If sending to backend fails, fall back to console logging and log the failure
    console.error('Failed to send log to backend:', error);
    console.error(`[${level.toUpperCase()}] ${message}`, context);
  }
};

const loggingService = {
  debug: (message, context) => log('debug', message, context),
  info: (message, context) => log('info', message, context),
  warn: (message, context) => log('warn', message, context),
  error: (message, context) => log('error', message, context),
};

export default loggingService;