import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CMSStorage, type Role } from '../cms/apiStorage';
import { Footer } from '../components/Footer';
import { FilterIcon, GridViewIcon, TableRowsIcon } from '../components/Icons';
import { MobileFilterDialog } from '../components/MobileFilterDialog';
import PasswordProtectionModal from '../components/PasswordProtectionModal';
import { PortfolioFilterControls } from '../components/PortfolioFilterControls';
import { PortfolioTable } from '../components/PortfolioTable';
import { ProjectCard } from '../components/ProjectCard';
import {
  FilterBarSkeleton,
  PortfolioTableSkeleton,
  ProjectCardSkeletonGrid,
} from '../components/Skeleton';
import { PROJECTS, mapPortfolioItemToProject } from '../data/portfolioData';
import type { Project } from '../types/portfolio';
import { useGSAPPageEntrance } from '../utils/gsapAnimations';
import { navigateWithTransition } from '../utils/viewTransitions';

type PortfolioViewMode = 'grid' | 'table';

export default function PortfolioPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const rootRef = useRef<HTMLDivElement>(null);
  const techDropdownRef = useRef<HTMLDivElement>(null);
  const gridToggleRef = useRef<HTMLButtonElement>(null);
  const tableToggleRef = useRef<HTMLButtonElement>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [cmsRoles, setCmsRoles] = useState<Role[]>([]);
  const [role, setRole] = useState('All');
  const [year, setYear] = useState('All');
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [techDropdownOpen, setTechDropdownOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [protectedProject, setProtectedProject] = useState<Project | null>(null);
  const [passwordError, setPasswordError] = useState('');

  const viewMode: PortfolioViewMode = searchParams.get('view') === 'table' ? 'table' : 'grid';

  useGSAPPageEntrance(rootRef, [projects.length]);

  useEffect(() => {
    let active = true;
    async function loadProjects() {
      try {
        const [items, rolesData] = await Promise.all([
          CMSStorage.getPortfolios(true),
          typeof CMSStorage.getRoles === 'function'
            ? CMSStorage.getRoles().catch(() => [])
            : Promise.resolve([]),
        ]);
        if (!active) return;
        const published = items
          .filter((item) => item.isPublished !== false)
          .map(mapPortfolioItemToProject);
        if (published.length > 0) {
          setProjects(published);
        }
        if (Array.isArray(rolesData)) {
          setCmsRoles(rolesData);
        }
      } catch {
        if (active) {
          setProjects(PROJECTS);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    loadProjects();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!techDropdownOpen) return;
    const handleOutside = (event: MouseEvent) => {
      if (techDropdownRef.current && !techDropdownRef.current.contains(event.target as Node)) {
        setTechDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setTechDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [techDropdownOpen]);

  useEffect(() => {
    if (!mobileFilterOpen || typeof window.matchMedia !== 'function') return;
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const handleBreakpointChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setMobileFilterOpen(false);
      }
    };
    mediaQuery.addEventListener('change', handleBreakpointChange);
    return () => mediaQuery.removeEventListener('change', handleBreakpointChange);
  }, [mobileFilterOpen]);

  const setViewMode = (nextMode: PortfolioViewMode) => {
    const next = new URLSearchParams(searchParams);
    if (nextMode === 'table') {
      next.set('view', 'table');
    } else {
      next.delete('view');
    }
    setSearchParams(next, { replace: true });
  };

  const handleViewToggleKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    current: PortfolioViewMode,
  ) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const targetMode: PortfolioViewMode = current === 'grid' ? 'table' : 'grid';
      setViewMode(targetMode);
      (targetMode === 'grid' ? gridToggleRef : tableToggleRef).current?.focus();
    } else if (event.key === 'Home') {
      event.preventDefault();
      setViewMode('grid');
      gridToggleRef.current?.focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      setViewMode('table');
      tableToggleRef.current?.focus();
    }
  };

  const visibleYearsProjects = useMemo(
    () => projects.filter((p) => !p.isPasswordProtected && p.year),
    [projects],
  );

  const technologies = useMemo(
    () => [...new Set(projects.flatMap((project) => project.tags))].sort(),
    [projects],
  );

  const years = useMemo(
    () => [...new Set(visibleYearsProjects.map((project) => project.year))].sort().reverse(),
    [visibleYearsProjects],
  );

  const roles = useMemo(() => {
    const projectRoleNames = [...new Set(projects.flatMap((project) => project.roles))];
    const cmsOrdered = cmsRoles
      .map((r) => r.title)
      .filter((title) => projectRoleNames.includes(title));
    const remaining = projectRoleNames.filter((title) => !cmsOrdered.includes(title));
    return ['All', ...cmsOrdered, ...remaining];
  }, [projects, cmsRoles]);

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesRole = role === 'All' || project.roles.includes(role);
      const matchesYear =
        year === 'All' || (!project.isPasswordProtected && project.year === year);
      const matchesTech =
        selectedTechs.length === 0 ||
        selectedTechs.some((selected) => project.tags.includes(selected));
      const matchesQuery =
        !normalizedQuery ||
        `${project.title} ${project.description} ${project.tags.join(' ')} ${project.roles.join(' ')}`
          .toLowerCase()
          .includes(normalizedQuery);
      return matchesRole && matchesYear && matchesTech && matchesQuery;
    });
  }, [projects, role, year, selectedTechs, query]);

  const activeFilterCount =
    (role !== 'All' ? 1 : 0) +
    (year !== 'All' ? 1 : 0) +
    (query.trim() !== '' ? 1 : 0) +
    selectedTechs.length;

  const activeFilters = activeFilterCount > 0 || query !== '';

  const toggleTech = (techItem: string) => {
    setSelectedTechs((prev) =>
      prev.includes(techItem) ? prev.filter((t) => t !== techItem) : [...prev, techItem],
    );
  };

  const reset = () => {
    setRole('All');
    setYear('All');
    setSelectedTechs([]);
    setTechDropdownOpen(false);
    setQuery('');
  };

  const handleSelectProject = (project: Project) => {
    if (project.isPasswordProtected) {
      setProtectedProject(project);
      setPasswordError('');
      return;
    }
    navigateWithTransition(navigate, `/portfolio/${project.id || project.slug}`);
  };

  const handlePasswordSubmit = (enteredPassword: string) => {
    if (!protectedProject) return;
    if (enteredPassword === protectedProject.password) {
      const targetId = protectedProject.id || protectedProject.slug;
      setProtectedProject(null);
      setPasswordError('');
      navigateWithTransition(navigate, `/portfolio/${targetId}`);
    } else {
      setPasswordError('Incorrect password. Please try again.');
    }
  };

  const filterControlProps = {
    projects,
    roles,
    role,
    onRoleChange: setRole,
    years,
    year,
    onYearChange: setYear,
    technologies,
    selectedTechs,
    onToggleTech: toggleTech,
    query,
    onQueryChange: setQuery,
    techDropdownOpen,
    onToggleTechDropdown: () => setTechDropdownOpen((open) => !open),
    techDropdownRef,
  };

  return (
    <div ref={rootRef} className="min-h-screen bg-white text-ink">
      <main className="page-shell py-14 sm:py-20">
        <div data-gsap="hero-item" className="mb-10 space-y-4">
          <h1 className="text-6xl font-medium leading-[1.02] tracking-[-0.065em] sm:text-8xl">
            Selected <span className="text-brand">projects</span>
          </h1>
          <p className="max-w-sm text-base leading-relaxed text-muted-600">
            These projects include my university assignments and work for clients.
          </p>
        </div>

        {loading ? (
          <FilterBarSkeleton />
        ) : (
          !mobileFilterOpen && <PortfolioFilterControls variant="inline" {...filterControlProps} />
        )}

        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <p role="status" className="text-xs tabular-nums text-muted-600">
              {loading ? 'Loading projects...' : `Showing ${results.length} of ${projects.length} projects`}
            </p>
            {activeFilters && (
              <button
                type="button"
                data-testid="clear-portfolio-filters"
                className="text-link min-h-11 px-4 py-1.5 text-xs"
                onClick={reset}
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              data-testid="mobile-filter-button"
              aria-haspopup="dialog"
              aria-expanded={mobileFilterOpen}
              onClick={() => setMobileFilterOpen(true)}
              className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium focus-visible:outline-brand md:hidden ${activeFilterCount > 0
                  ? 'border-brand bg-brand text-white'
                  : 'border-muted-300 bg-white text-ink hover:border-ink'
                }`}
            >
              <FilterIcon className="size-4" />
              <span>Filter</span>
              {activeFilterCount > 0 && (
                <span
                  data-testid="mobile-filter-badge"
                  className="inline-flex size-5 items-center justify-center rounded-full bg-white text-[11px] font-semibold tabular-nums text-brand"
                >
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div role="toolbar" aria-label="View options">
              <div role="group" aria-label="Layout view" className="view-toggle-group">
                <button
                  ref={gridToggleRef}
                  type="button"
                  aria-label="Grid view"
                  title="Grid view"
                  aria-pressed={viewMode === 'grid'}
                  tabIndex={viewMode === 'grid' ? 0 : -1}
                  data-testid="view-mode-grid"
                  onClick={() => setViewMode('grid')}
                  onKeyDown={(event) => handleViewToggleKeyDown(event, 'grid')}
                  className="view-toggle-btn"
                >
                  <GridViewIcon className="size-4" />
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  ref={tableToggleRef}
                  type="button"
                  aria-label="Table view"
                  title="Table view"
                  aria-pressed={viewMode === 'table'}
                  tabIndex={viewMode === 'table' ? 0 : -1}
                  data-testid="view-mode-table"
                  onClick={() => setViewMode('table')}
                  onKeyDown={(event) => handleViewToggleKeyDown(event, 'table')}
                  className="view-toggle-btn"
                >
                  <TableRowsIcon className="size-4" />
                  <span className="hidden sm:inline">Table</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          viewMode === 'table' ? (
            <PortfolioTableSkeleton />
          ) : (
            <ProjectCardSkeletonGrid count={6} />
          )
        ) : results.length ? (
          viewMode === 'table' ? (
            <PortfolioTable projects={results} onSelectProject={handleSelectProject} />
          ) : (
            <div
              data-testid="portfolio-grid-view"
              className="grid gap-x-7 gap-y-14 md:grid-cols-2 xl:grid-cols-3"
            >
              {results.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onSelectProject={handleSelectProject}
                />
              ))}
            </div>
          )
        ) : (
          <div className="bg-paper px-6 py-16">
            <h2 className="text-2xl font-medium">
              No projects {query ? `for “${query}”` : 'match these filters'}.
            </h2>
            <p className="mt-3 text-sm text-muted-600">
              Try another keyword or clear your filters to see all work.
            </p>
            <button type="button" className="flat-button flat-button-blue mt-6" onClick={reset}>
              Show all projects
            </button>
          </div>
        )}
      </main>

      <Footer />

      <MobileFilterDialog
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        onClearAll={reset}
        resultCount={results.length}
        activeFilterCount={activeFilterCount}
      >
        <PortfolioFilterControls variant="modal" autoFocusSearch {...filterControlProps} />
      </MobileFilterDialog>

      <PasswordProtectionModal
        isOpen={Boolean(protectedProject)}
        onClose={() => {
          setProtectedProject(null);
          setPasswordError('');
        }}
        onSubmit={handlePasswordSubmit}
        portfolioTitle={protectedProject?.title || ''}
        error={passwordError}
      />
    </div>
  );
}
