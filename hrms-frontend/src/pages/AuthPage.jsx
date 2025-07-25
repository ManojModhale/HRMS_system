// src/pages/AuthPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams, Link } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout.jsx';
import '../styles/AuthPage.css';
import LoginForm from './LoginPage.jsx';
import RegisterForm from './RegisterPage.jsx';
import { ArrowLeft } from 'lucide-react'; // Import ArrowLeft icon

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [searchParams] = useSearchParams();
  const formType = searchParams.get('form');

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const formType = queryParams.get('form');
    if (formType === 'register') {
      setIsLogin(false);
    } else {
      setIsLogin(true); // Default to login if no query or invalid
    }
  }, [location.search]);

  // Function to switch between forms and update URL
  const toggleForm = (toLoginForm) => {
    setIsLogin(toLoginForm);
    navigate(`/auth?form=${toLoginForm ? 'login' : 'register'}`, { replace: true });
  };

  return (
    <AuthLayout> {/* AuthLayout provides the full-screen gradient background */}
      <div className="auth-page-container">
        {/* Back Button - Changed to btn-outline-light and text-white */}
        <Link to="/" className="position-absolute top-0 start-0 m-4 text-decoration-none">
          <button className="btn btn-outline-light text-black d-flex align-items-center gap-2 rounded-pill px-3 py-2 shadow-sm">
            <ArrowLeft size={18} /> Back to Home
          </button>
        </Link>

        <div className="auth-form-wrapper-outer">
          <div className={`form-slider ${isLogin ? 'show-login' : 'show-register'}`}>
            <div className="form-slide login-slide">
              {/* Pass setIsLogin to LoginForm so it can toggle to register */}
              <LoginForm setIsLogin={() => toggleForm(false)} />
              
            </div>
            <div className="form-slide register-slide">
              {/* Pass setIsLogin to RegisterForm so it can toggle back to login */}
              <RegisterForm setIsLogin={() => toggleForm(true)} />
                
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default AuthPage;
