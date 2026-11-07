import React from 'react';
import { Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <>
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
