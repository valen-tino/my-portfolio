import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import PortfolioPage from './pages/PortfolioPage';
import PortfolioDetail from './pages/PortfolioDetail';

// CMS imports
import Login from './cms/pages/Login';
import Dashboard from './cms/pages/Dashboard';
import AboutManagement from './cms/pages/AboutManagement';
import TechToolsManagement from './cms/pages/TechToolsManagement';
import RolesManagement from './cms/pages/RolesManagement';
import EducationManagement from './cms/pages/EducationManagement';
import PortfolioManagement from './cms/pages/PortfolioManagement';
import ContactEntries from './cms/pages/ContactEntries';
import AITest from './cms/pages/AITest';
import ExperienceManagement from './cms/pages/ExperienceManagement';
import ProtectedRoute from './cms/components/ProtectedRoute';

// Cursor Inverter Effect
import CursorInverter from './components/CursorInverter/CursorInverter';
import CursorToggle from './components/CursorInverter/CursorToggle';

function App() {
  const location = useLocation();
  
  // Check if current route is a CMS route
  const isCMSRoute = location.pathname.startsWith('/cms');
  
  // State for cursor inverter
  const [cursorEnabled, setCursorEnabled] = useState(() => {
    // Get initial state from localStorage or default to true
    const saved = localStorage.getItem('cursorInverterEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Save cursor preference to localStorage
  useEffect(() => {
    localStorage.setItem('cursorInverterEnabled', JSON.stringify(cursorEnabled));
  }, [cursorEnabled]);

  return (
    <>
      {/* Global Cursor Inverter Effect - Only show on main site, not CMS */}
      {!isCMSRoute && (
        <CursorInverter 
          enabled={cursorEnabled} 
          size={128} 
          blendMode="difference" 
          performanceMode="eco"
        />
      )}
      
      {/* Toggle for cursor effect - only show on non-CMS pages */}
      {!isCMSRoute && (
        <CursorToggle enabled={cursorEnabled} onToggle={setCursorEnabled} />
      )}
      
      <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/portfolio" element={<PortfolioPage />} />
      <Route path="/portfolio/:id" element={<PortfolioDetail />} />
      
      {/* CMS Routes */}
      <Route path="/cms/login" element={<Login />} />
      <Route 
        path="/cms/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/cms/ai-test" 
        element={
          <ProtectedRoute>
            <AITest />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/cms/experiences" 
        element={
          <ProtectedRoute>
            <ExperienceManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/cms/tech-tools" 
        element={
          <ProtectedRoute>
            <TechToolsManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/cms/roles" 
        element={
          <ProtectedRoute>
            <RolesManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/cms/education" 
        element={
          <ProtectedRoute>
            <EducationManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/cms/portfolios" 
        element={
          <ProtectedRoute>
            <PortfolioManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/cms/about" 
        element={
          <ProtectedRoute>
            <AboutManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/cms/contacts" 
        element={
          <ProtectedRoute>
            <ContactEntries />
          </ProtectedRoute>
        } 
      />

      {/* Only Enable this when you want to test AI features in CMS */}
      {/* <Route 
        path="/cms/ai-test" 
        element={
          <ProtectedRoute>
            <AITest />
          </ProtectedRoute>
        } 
      /> */}
      </Routes>

    </>
  );
}

export default App;
