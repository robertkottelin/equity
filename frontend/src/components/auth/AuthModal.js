import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose }) => {
  const [showLoginForm, setShowLoginForm] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-container">
        <button className="auth-modal-close" onClick={onClose}>
          &times;
        </button>
        <div className="auth-modal-content">
          {showLoginForm ? (
            <LoginForm 
              toggleForm={() => setShowLoginForm(false)} 
              onAuthSuccess={onClose}
            />
          ) : (
            <RegisterForm 
              toggleForm={() => setShowLoginForm(true)} 
              onAuthSuccess={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;