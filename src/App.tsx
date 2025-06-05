import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import { AuthProvider } from './context/AuthContext';
import { ToastContextProvider } from './context/ToastContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <ToastContextProvider>
          <AuthProvider>
            <WebSocketProvider>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/" element={<Navigate to="/dashboard\" replace />} />
                <Route path="*" element={<Navigate to="/dashboard\" replace />} />
              </Routes>
            </WebSocketProvider>
          </AuthProvider>
        </ToastContextProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App