import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import { AuthProvider } from './context/AuthContext';
import { ToastContextProvider } from './context/ToastContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const { isDark } = useTheme();

  return (
    <Theme appearance={isDark ? 'dark' : 'light'} accentColor="blue" grayColor="slate" scaling="100%">
      <AuthProvider>
        <ToastContextProvider>
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
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastContextProvider>
      </AuthProvider>
    </Theme>
  );
}

function App() {
  return (
    <Router basename="/admin">
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </Router>
  );
}

export default App;