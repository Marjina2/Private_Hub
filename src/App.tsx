import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import NotesApp from './components/NotesApp';
import WebsitesApp from './components/WebsitesApp';
import DitherBackground from './components/DitherBackground';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/notes" element={<NotesApp />} />
      <Route path="/websites" element={<WebsitesApp />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen relative transition-colors duration-300 bg-slate-900 dark:bg-slate-950">
            <DitherBackground />
            <div className="relative z-10">
              <AppRoutes />
            </div>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;