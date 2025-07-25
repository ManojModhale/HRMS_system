import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App.jsx';
import './index.css'; // Import your global CSS with Tailwind directives
import loggingService from './services/logging.service'; // Ensure loggingService is imported
import axios from 'axios'; // Import axios
import authService from './services/auth.service'; // Import authService

// Configure Axios Interceptor to attach JWT token to requests
axios.interceptors.request.use(
  (config) => {
    const token = authService.getJwtToken();
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  (error) => {
    // Log Axios request errors
    loggingService.error('main.jsx: Axios request error', {
      method: error.config.method,
      url: error.config.url,
      errorMessage: error.message,
      errorStack: error.stack, // Capture stack for Axios errors
    });
    return Promise.reject(error);
  }
);

// Configure Axios Interceptor for response errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log Axios response errors (e.g., 4xx, 5xx from backend)
    const errorMessage = error.response?.data?.message || error.message;
    const statusCode = error.response?.status;
    const requestUrl = error.config?.url;

    loggingService.error('main.jsx: Axios response error', {
      statusCode: statusCode,
      requestUrl: requestUrl,
      errorMessage: errorMessage,
      errorStack: error.stack, // Capture stack for Axios response errors
      responseData: error.response?.data, // Include response data if available
    });
    return Promise.reject(error);
  }
);


// Global error handler for unhandled JavaScript errors (e.g., syntax errors, runtime errors)
window.addEventListener('error', (event) => {
  // Prevent default browser error logging to avoid duplicate console output if you prefer
  // event.preventDefault(); 
  loggingService.error('main.jsx: Unhandled browser error', {
    errorMessage: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error ? event.error.stack : 'No stack available', // Crucial for capturing stack trace
    type: 'Uncaught JavaScript Error'
  });
});

// Global error handler for unhandled promise rejections (e.g., fetch errors without .catch)
window.addEventListener('unhandledrejection', (event) => {
  // Prevent default browser error logging
  // event.preventDefault();
  loggingService.error('main.jsx: Unhandled promise rejection', {
    reason: event.reason, // The rejected value (often an Error object)
    stack: event.reason instanceof Error ? event.reason.stack : 'No stack available (reason not an Error object)', // Capture stack if reason is an Error
    type: 'Unhandled Promise Rejection'
  });
});


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
/*
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)*/
