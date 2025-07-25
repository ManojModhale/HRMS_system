// src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './index.css'; // Global CSS (now includes Bootstrap)
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import loggingService from './services/logging.service';

// Import Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';
import AuthPage from './pages/AuthPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';

// Import Context Provider
import { AuthProvider } from './context/AuthContext.jsx';

// Import Protected Route Component
import PrivateRoute from './components/PrivateRoute';

// Import Layouts
import AdminLayout from './layouts/AdminLayout';
import EmployeeLayout from './layouts/EmployeeLayout';

// Example Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage.jsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import UserManagementPage from './pages/admin/UserManagementPage.jsx';
import EmployeeManagementPage from './pages/admin/EmployeeManagementPage.jsx';
import LeaveApprovalPage from './pages/admin/LeaveApprovalPage.jsx';
import AttendanceManagementPage from './pages/admin/AttendanceManagementPage.jsx';
import PayrollPage from './pages/admin/PayrollPage.jsx';
import ContactMessagesPage from './pages/admin/ContactMessagesPage.jsx';


// Example Employee Pages
import MyLeaveHistoryPage from './pages/employee/MyLeaveHistoryPage';
import MyProfilePage from './pages/employee/MyProfilePage.jsx';
import MyAttendancePage from './pages/employee/MyAttendancePage.jsx';
import MySalarySlipsPage from './pages/employee/MySalarySlipsPage.jsx';







function App() {
  useEffect(() => {
    loggingService.info('App component mounted', { component: 'App' });
    return () => {
      loggingService.info('App component unmounted', { component: 'App' });
    };
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes wrapped with AuthLayout for consistent styling */}
          {/* <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} /> */}

          {/* HomePage - This route will render its own full-screen content */}
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          {/* Catch-all for undefined routes */}
          <Route path="*" element={<NotFoundPage />} />


          {/* Protected Routes - Employee */}
          {/* <Route element={<PrivateRoute allowedRoles={['EMPLOYEE', 'ADMIN']} />}> */}
          <Route element={<PrivateRoute allowedRoles={['EMPLOYEE', 'ADMIN']} redirectTo="/auth?form=login" />}>
            <Route path="/employee" element={<EmployeeLayout />}>
              <Route index element={<MyProfilePage />} />
              <Route path="my-profile" element={<MyProfilePage />} />
              {/* <Route path="dashboard" element={<MyLeaveHistoryPage />} /> */}
              <Route path="attendance" element={<MyAttendancePage />} /> 
              <Route path="leaves" element={<MyLeaveHistoryPage />} /> 
              <Route path="salary-slips" element={<MySalarySlipsPage />} />
            </Route>
          </Route>

          {/* <Route index element={<EmployeeManagementPage />} />
                <Route path="dashboard" element={<EmployeeManagementPage />} />
                <Route path="employees" element={<EmployeeManagementPage />} />
                <Route path="leave-approvals" element={<LeaveApprovalPage />} /> */}

          {/* Protected Routes - Admin */}
          <Route path='/admin-login' element={<AdminLoginPage />} />

          {/* <Route element={<PrivateRoute allowedRoles={['ADMIN']} />}> */}
            <Route element={<PrivateRoute allowedRoles={['ADMIN']} redirectTo="/admin-login" />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} /> {/* Redirect to dashboard */}
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="users" element={<UserManagementPage />} /> {/* New: All Users & Pending Notifications */}
              <Route path="employees" element={<EmployeeManagementPage />} /> {/* New: Employees List & Add Employee */}
              <Route path="leave-approval" element={<LeaveApprovalPage />} /> 
              <Route path="attendance" element={<AttendanceManagementPage />} />
              <Route path="payroll" element={<PayrollPage />} />
              <Route path="contact-messages" element={<ContactMessagesPage />} />

              <Route path="logs" />
            </Route>
          </Route>

          
        </Routes>
      </Router>
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </AuthProvider>
  );
}

export default App;