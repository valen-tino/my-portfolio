import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { CVModal } from './components/CVModal';
import { FloatingNavigation } from './components/FloatingNavigation';
import BlogDetail from './pages/BlogDetail';
import BlogPage from './pages/BlogPage';
import DesignSystemPage from './pages/DesignSystemPage';
import Home from './pages/Home';
import PortfolioDetail from './pages/PortfolioDetail';
import PortfolioPage from './pages/PortfolioPage';

// CMS imports
import ProtectedRoute from './cms/components/ProtectedRoute';
import AboutManagement from './cms/pages/AboutManagement';
import AITest from './cms/pages/AITest';
import BlogManagement from './cms/pages/BlogManagement';
import ContactEntries from './cms/pages/ContactEntries';
import Dashboard from './cms/pages/Dashboard';
import EducationManagement from './cms/pages/EducationManagement';
import ExperienceManagement from './cms/pages/ExperienceManagement';
import Login from './cms/pages/Login';
import PortfolioManagement from './cms/pages/PortfolioManagement';
import RolesManagement from './cms/pages/RolesManagement';
import TechToolsManagement from './cms/pages/TechToolsManagement';
import WorkProcessManagement from './cms/pages/WorkProcessManagement';
import { CMSStorage, type AboutData } from './cms/apiStorage';
import {
  EDUCATION_LIST,
  EXPERIENCES,
  mapCMSEducationToView,
  mapCMSExperienceToView,
} from './data/portfolioData';
import apiService from './services/api';
import type { Education, Experience } from './types/portfolio';
import { sortByLatestEndDate } from './utils/dateFormat';

function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/cms')) return "Valen's Portfolio CMS";
  if (pathname.startsWith('/portfolio/')) return 'Case Study | Valentino Jehaut';
  if (pathname.startsWith('/portfolio')) return 'Portfolio | Valentino Jehaut';
  if (pathname.startsWith('/blogs') || pathname.startsWith('/blog'))
    return 'Journal | Valentino Jehaut';
  if (pathname.startsWith('/design-system')) return 'Design System | Valentino Jehaut';
  return 'Valentino Jehaut — Digital Product Designer & Full-Stack Engineer';
}

function App() {
  const location = useLocation();
  const isCMSRoute = location.pathname.startsWith('/cms');
  const [cvModalOpen, setCvModalOpen] = useState(false);
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>(() => sortByLatestEndDate(EXPERIENCES));
  const [educationList, setEducationList] = useState<Education[]>(() =>
    sortByLatestEndDate(EDUCATION_LIST),
  );

  useEffect(() => {
    document.title = getPageTitle(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    if (isCMSRoute) return;
    let active = true;

    async function loadCVContext() {
      const [aboutRes, eduRes, expRes] = await Promise.allSettled([
        CMSStorage.getAbout(),
        CMSStorage.getEducation(),
        apiService.getExperiences(true),
      ]);
      if (!active) return;

      if (aboutRes.status === 'fulfilled' && aboutRes.value) {
        setAboutData(aboutRes.value);
      }
      if (eduRes.status === 'fulfilled' && Array.isArray(eduRes.value) && eduRes.value.length > 0) {
        setEducationList(sortByLatestEndDate(eduRes.value.map(mapCMSEducationToView)));
      }
      if (
        expRes.status === 'fulfilled' &&
        expRes.value?.success &&
        Array.isArray(expRes.value.data) &&
        expRes.value.data.length > 0
      ) {
        setExperiences(sortByLatestEndDate(expRes.value.data.map(mapCMSExperienceToView)));
      }
    }

    loadCVContext();
    return () => {
      active = false;
    };
  }, [isCMSRoute]);

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home onOpenCVModal={() => setCvModalOpen(true)} />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/portfolio/:id" element={<PortfolioDetail />} />
        <Route path="/blogs" element={<BlogPage />} />
        <Route path="/blog" element={<Navigate to="/blogs" replace />} />
        <Route path="/blogs/:id" element={<BlogDetail />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route
          path="/design-system"
          element={<DesignSystemPage onOpenCVModal={() => setCvModalOpen(true)} />}
        />

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
          path="/cms/blogs"
          element={
            <ProtectedRoute>
              <BlogManagement />
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
        <Route
          path="/cms/work-process"
          element={
            <ProtectedRoute>
              <WorkProcessManagement />
            </ProtectedRoute>
          }
        />
      </Routes>

      {!isCMSRoute && (
        <>
          <FloatingNavigation onOpenCVModal={() => setCvModalOpen(true)} />
          <CVModal
            isOpen={cvModalOpen}
            onClose={() => setCvModalOpen(false)}
            experiences={experiences}
            educationList={educationList}
            cvURL={aboutData?.cvURL}
          />
        </>
      )}
    </>
  );
}

export default App;
