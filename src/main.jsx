import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/authContext.jsx'; 
import { NotificationProvider } from './context/NotificationContext.jsx';


ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
    <NotificationProvider>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
    </NotificationProvider>
  </React.StrictMode>
);
