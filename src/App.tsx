import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './components/AuthPage';
import AdminPanel from './components/AdminPanel';
import Dashboard from './components/Dashboard';
import NotesApp from './components/NotesApp';
import WebsitesApp from './components/WebsitesApp';
import TodosApp from './components/TodosApp';
import ContactsApp from './components/ContactsApp';
import DiscordApp from './components/DiscordApp';
import InstagramApp from './components/InstagramApp';
import YouTubeApp from './components/YouTubeApp';
import PhotoGalleryApp from './components/PhotoGalleryApp';
import OSINTApp from './components/OSINTApp';
import PDFToolsApp from './components/PDFToolsApp';
import DitherBackground from './components/DitherBackground';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <AuthPage />;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
      <Route path="/notes" element={<ProtectedRoute><NotesApp /></ProtectedRoute>} />
      <Route path="/websites" element={<ProtectedRoute><WebsitesApp /></ProtectedRoute>} />
      <Route path="/todos" element={<ProtectedRoute><TodosApp /></ProtectedRoute>} />
      <Route path="/contacts" element={<ProtectedRoute><ContactsApp /></ProtectedRoute>} />
      <Route path="/discord" element={<ProtectedRoute><DiscordApp /></ProtectedRoute>} />
      <Route path="/instagram" element={<ProtectedRoute><InstagramApp /></ProtectedRoute>} />
      <Route path="/youtube" element={<ProtectedRoute><YouTubeApp /></ProtectedRoute>} />
      <Route path="/photos" element={<ProtectedRoute><PhotoGalleryApp /></ProtectedRoute>} />
      <Route path="/osint" element={<ProtectedRoute><OSINTApp /></ProtectedRoute>} />
      <Route path="/pdf-tools" element={<ProtectedRoute><PDFToolsApp /></ProtectedRoute>} />
      <Route path="/pdf-tools" element={<PDFToolsApp />} />
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