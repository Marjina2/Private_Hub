import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import SecurityWrapper from './components/SecurityWrapper';
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
import DitherBackground from './components/DitherBackground';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/notes" element={<NotesApp />} />
      <Route path="/websites" element={<WebsitesApp />} />
      <Route path="/todos" element={<TodosApp />} />
      <Route path="/contacts" element={<ContactsApp />} />
      <Route path="/discord" element={<DiscordApp />} />
      <Route path="/instagram" element={<InstagramApp />} />
      <Route path="/youtube" element={<YouTubeApp />} />
      <Route path="/photos" element={<PhotoGalleryApp />} />
      <Route path="/osint" element={<OSINTApp />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <SecurityWrapper>
      <ThemeProvider>
        <Router>
          <div className="min-h-screen relative transition-colors duration-300 bg-slate-900 dark:bg-slate-950">
            <DitherBackground />
            <div className="relative z-10">
              <AppRoutes />
            </div>
          </div>
        </Router>
      </ThemeProvider>
    </SecurityWrapper>
  );
}

export default App;