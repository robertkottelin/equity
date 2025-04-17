import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './contexts/AuthContext';

// Create directory structure if not exists
// - src/
//   - components/
//     - AssetTable.js
//     - AssetTable.css
//     - AssetForm.js
//     - AssetForm.css
//     - Summary.js
//     - Summary.css
//   - components/auth/
//     - LoginForm.js
//     - RegisterForm.js
//     - SubscriptionForm.js
//     - AuthModal.js
//     - AuthForms.css
//     - AuthModal.css
//   - contexts/
//     - AuthContext.js
//   - services/
//     - api.js
//     - assetService.js

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();