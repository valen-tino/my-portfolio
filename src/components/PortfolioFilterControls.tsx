import type { RefObject } from 'react';
import type { Project } from '../types/portfolio';
import { ChevronDownIcon, CloseIcon, SearchIcon } from './Icons';

export interface PortfolioFilterControlsProps {
  variant: 'inline' | 'modal';
  projects: Project[];
  roles: string[];
  role: string;
  onRoleChange: (role: string) => void;
  years: string[];
  year: string;
  onYearChange: (year: string) => void;
  technologies: string[];
  selectedTechs: string[];
  onToggleTech: (tech: string) => void;
  query: string;
  onQueryChange: (query: string) => void;
  techDropdownOpen: boolean;
  onToggleTechDropdown: () => void;
  techDropdownRef: RefObject<HTMLDivElement | null>;
  autoFocusSearch?: boolean;
}

const pillClass = (active: boolean, compact = false) =>
  `inline-flex min-h-11 items-center gap-2 rounded-full border ${
    compact ? 'px-3.5 py-1.5 text-xs font-medium' : 'px-3.5 py-1.5 text-sm'
  } focus-visible:outline-brand ${
    active
      ? 'border-brand bg-brand text-white'
      : 'border-muted-400 bg-white text-ink hover:border-ink'
  }`;

/**
 * Shared filter controls rendered inline on desktop/tablet and stacked inside MobileFilterDialog on mobile.
 */
export function PortfolioFilterControls({
  variant,
  projects,
  roles,
  role,
  onRoleChange,
  years,
  year,
  onYearChange,
  technologies,
  selectedTechs,
  onToggleTech,
  query,
  onQueryChange,
  techDropdownOpen,
  onToggleTechDropdown,
  techDropdownRef,
  autoFocusSearch = false,
}: PortfolioFilterControlsProps) {
  const isModal = variant === 'modal';

  const roleCounts = roles.map((item) => ({
    item,
    count:
      item === 'All'
        ? projects.length
        : projects.filter((project) => project.roles.includes(item)).length,
  }));

  const searchControl = (
    <div className={isModal ? 'w-full' : 'w-full shrink-0 lg:w-72'}>
      <label
        htmlFor="project-search"
        className={isModal ? 'mb-2 block text-xs font-medium text-muted-600' : 'sr-only'}
      >
        Search projects
      </label>
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-muted-600" />
        <input
          id="project-search"
          name="q"
          type="search"
          autoFocus={autoFocusSearch}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          enterKeyHint="search"
          className="field min-h-11 bg-white py-2 pl-10 pr-11 text-sm"
          placeholder="Project name, role, or tech"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            aria-label="Clear project search"
            className="absolute right-0 top-0 flex size-11 items-center justify-center rounded-full"
          >
            <CloseIcon className="size-4" />
          </button>
        )}
      </div>
    </div>
  );

  const roleGroup = (
    <div className={isModal ? 'space-y-2' : undefined}>
      {isModal && <p className="text-xs font-medium text-muted-600">Role</p>}
      <div role="group" aria-label="Filter by role" className="flex flex-wrap gap-2">
        {roleCounts.map(({ item, count }) => (
          <button
            key={item}
            type="button"
            aria-pressed={role === item}
            data-testid={`role-filter-${item}`}
            onClick={() => onRoleChange(item)}
            className={pillClass(role === item)}
          >
            <span>{item}</span>
            <span className="text-xs tabular-nums opacity-80">{count}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const yearGroup = years.length > 0 && (
    <div className={isModal ? 'space-y-2' : undefined}>
      {isModal && <p className="text-xs font-medium text-muted-600">Year</p>}
      <div
        role="group"
        aria-label="Filter by year"
        data-testid="portfolio-year-filter"
        className="flex flex-wrap items-center gap-1.5"
      >
        {!isModal && <span className="mr-1 text-xs font-medium text-muted-600">Year:</span>}
        <button
          type="button"
          aria-pressed={year === 'All'}
          data-testid="year-filter-All"
          onClick={() => onYearChange('All')}
          className={pillClass(year === 'All', true)}
        >
          All
        </button>
        {years.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={year === item}
            data-testid={`year-filter-${item}`}
            onClick={() => onYearChange(item)}
            className={`${pillClass(year === item, true)} tabular-nums`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <search aria-label="Filter projects" className="block space-y-6">
        {searchControl}
        {roleGroup}
        {yearGroup}
        {technologies.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-600">
              Tech ({technologies.length})
              {selectedTechs.length > 0 ? ` · ${selectedTechs.length} selected` : ''}
            </p>
            <div
              role="group"
              aria-label="Filter by technology"
              className="flex max-h-48 flex-wrap gap-1.5 overflow-y-auto overscroll-contain pr-1"
            >
              {technologies.map((item) => {
                const count = projects.filter((project) => project.tags.includes(item)).length;
                const isSelected = selectedTechs.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={isSelected}
                    data-testid={`tech-option-${item}`}
                    onClick={() => onToggleTech(item)}
                    className={pillClass(isSelected, true)}
                  >
                    <span>{item}</span>
                    <span className="tabular-nums opacity-75">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </search>
    );
  }

  return (
    <search
      aria-label="Filter projects"
      data-gsap="hero-item"
      className="relative z-20 mb-7 hidden bg-paper p-4 sm:p-5 md:block"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {roleGroup}
        {searchControl}
      </div>

      {(years.length > 0 || technologies.length > 0) && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-muted-300 pt-3">
          {yearGroup}

          {years.length > 0 && technologies.length > 0 && (
            <span aria-hidden="true" className="mx-1 hidden h-5 w-px bg-muted-300 sm:block" />
          )}

          {technologies.length > 0 && (
            <div className="relative z-30" ref={techDropdownRef}>
              <button
                type="button"
                aria-expanded={techDropdownOpen}
                aria-haspopup="listbox"
                data-testid="portfolio-tech-dropdown-btn"
                onClick={onToggleTechDropdown}
                className={pillClass(selectedTechs.length > 0, true)}
              >
                <span>
                  {selectedTechs.length === 0
                    ? `Tech (${technologies.length})`
                    : `${selectedTechs.length} Tech Selected`}
                </span>
                <ChevronDownIcon
                  className={`size-4 transition-transform ${techDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {techDropdownOpen && (
                <div
                  role="listbox"
                  aria-label="Select multiple technologies"
                  aria-multiselectable="true"
                  data-testid="portfolio-tech-menu"
                  className="absolute left-0 z-40 mt-2 max-h-64 w-72 overflow-y-auto overscroll-contain border border-muted-300 bg-white p-2 shadow-xl"
                >
                  {technologies.map((item) => {
                    const count = projects.filter((project) => project.tags.includes(item)).length;
                    const isSelected = selectedTechs.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        data-testid={`tech-option-${item}`}
                        onClick={() => onToggleTech(item)}
                        className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                          isSelected
                            ? 'bg-brand font-semibold text-white'
                            : 'text-ink hover:bg-paper'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span aria-hidden="true" className="w-3 text-center">
                            {isSelected ? '✓' : ''}
                          </span>
                          <span>{item}</span>
                        </span>
                        <span className="tabular-nums opacity-80">{count}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {selectedTechs.map((item) => (
            <span
              key={item}
              data-testid={`selected-tech-pill-${item}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-brand bg-brand-tint px-3.5 py-1 text-xs font-medium text-brand"
            >
              <span>{item}</span>
              <button
                type="button"
                onClick={() => onToggleTech(item)}
                aria-label={`Remove ${item} filter`}
                className="inline-flex size-6 items-center justify-center rounded-full hover:bg-brand hover:text-white"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </search>
  );
}

