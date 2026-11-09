import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import PortfolioCard from './portfoliocard';
import { CMSStorage, PortfolioItem, Role } from '../../cms/apiStorage';

interface Props {
  limit?: number;
}

const ROLE_COLOR_STYLES: Record<string, { active: string; inactive: string }> = {
  primary: {
    active: 'btn-primary text-primary-content shadow-sm font-semibold',
    inactive: 'btn-outline btn-primary hover:bg-primary hover:text-primary-content'
  },
  secondary: {
    active: 'btn-secondary text-secondary-content shadow-sm font-semibold',
    inactive: 'btn-outline btn-secondary hover:bg-secondary hover:text-secondary-content'
  },
  accent: {
    active: 'btn-accent text-accent-content shadow-sm font-semibold',
    inactive: 'btn-outline btn-accent hover:bg-accent hover:text-accent-content'
  },
  info: {
    active: 'bg-[#00BAFE] text-white border-[#00BAFE] hover:bg-[#00BAFE]/90 shadow-sm font-semibold',
    inactive: 'border-[#00BAFE] text-[#00BAFE] hover:bg-[#00BAFE] hover:text-white'
  },
  success: {
    active: 'btn-success text-success-content shadow-sm font-semibold',
    inactive: 'btn-outline btn-success hover:bg-success hover:text-success-content'
  },
  warning: {
    active: 'btn-warning text-warning-content shadow-sm font-semibold',
    inactive: 'btn-outline btn-warning hover:bg-warning hover:text-warning-content'
  },
  error: {
    active: 'btn-error text-error-content shadow-sm font-semibold',
    inactive: 'btn-outline btn-error hover:bg-error hover:text-error-content'
  },
  neutral: {
    active: 'btn-neutral text-neutral-content shadow-sm font-semibold',
    inactive: 'btn-outline btn-neutral hover:bg-neutral hover:text-neutral-content'
  }
};

const Portfolio: React.FC<Props> = ({ limit }) => {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<PortfolioItem[]>([]);
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [availableTechs, setAvailableTechs] = useState<string[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [allRoleNames, setAllRoleNames] = useState<string[]>([]);
  const [techDropdownOpen, setTechDropdownOpen] = useState(false);
  const techDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        const [portfolioData, rolesData] = await Promise.all([
          CMSStorage.getPortfolios(true),
          CMSStorage.getRoles()
        ]);
        
        // Defensive filter: exclude items where isPublished is explicitly false
        const publishedItems = portfolioData.filter(item => item.isPublished !== false);

        setPortfolioItems(publishedItems);
        setFilteredItems(publishedItems);
        setAvailableRoles(rolesData);
        
        // Extract unique technologies strictly from published items
        const allTechs = publishedItems.reduce<string[]>((techs, item) => {
          return [...techs, ...item.tech.filter(tech => !techs.includes(tech))];
        }, []).sort();
        
        // Extract unique role names strictly from published items
        const allRoles = publishedItems.reduce<string[]>((roles, item) => {
          const itemRoles = item.roles || [];
          return [...roles, ...itemRoles.filter(role => !roles.includes(role))];
        }, []).sort();
        
        setAvailableTechs(allTechs);
        setAllRoleNames(allRoles);
      } catch (error) {
        console.error('Error fetching portfolio data:', error);
        setPortfolioItems([]);
        setFilteredItems([]);
      }
    };
    
    fetchPortfolioData();
  }, []);

  // Close tech dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (techDropdownRef.current && !techDropdownRef.current.contains(event.target as Node)) {
        setTechDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter items based on selected technologies, role, year, and search query
  useEffect(() => {
    let filtered = portfolioItems;
    const q = searchQuery.toLowerCase().trim();

    if (q) {
      filtered = filtered.filter(item => {
        const titleMatch = (item.title || '').toLowerCase().includes(q);
        const descMatch = (item.desc || '').toLowerCase().includes(q);
        const techMatch = Array.isArray(item.tech) && item.tech.some(t => t.toLowerCase().includes(q));
        const roleMatch = Array.isArray(item.roles) && item.roles.some(r => r.toLowerCase().includes(q));
        return titleMatch || descMatch || techMatch || roleMatch;
      });
    }

    // Filter by technologies (any tech selected must be included)
    if (selectedTechs.length > 0) {
      filtered = filtered.filter(item => 
        selectedTechs.some(tech => item.tech && item.tech.includes(tech))
      );
    }

    // Filter by role
    if (selectedRole !== 'All') {
      filtered = filtered.filter(item => 
        item.roles && item.roles.includes(selectedRole)
      );
    }

    // Filter by year
    if (selectedYear !== 'All') {
      filtered = filtered.filter(item => item.year === selectedYear);
    }

    setFilteredItems(filtered);
  }, [selectedTechs, selectedRole, selectedYear, searchQuery, portfolioItems]);

  // Extract all unique years sorted descending
  const allYears = Array.from(
    new Set(portfolioItems.map(item => item.year).filter((y): y is string => Boolean(y && y.trim())))
  ).sort((a, b) => b.localeCompare(a));

  // For homepage (when limit is set), prioritize pinned items
  const items = limit ? (() => {
    const pinnedItems = filteredItems.filter(item => item.isPinned);
    const regularItems = filteredItems.filter(item => !item.isPinned);
    
    // Show pinned items first, then fill remaining slots with regular items
    const combinedItems = [...pinnedItems, ...regularItems];
    return combinedItems.slice(0, limit);
  })() : filteredItems;

  const handleTechToggle = (tech: string) => {
    setSelectedTechs(prev => 
      prev.includes(tech)
        ? prev.filter(t => t !== tech)
        : [...prev, tech]
    );
  };

  const handleRoleFilter = (role: string) => {
    setSelectedRole(role);
  };

  const clearAllFilters = () => {
    setSelectedTechs([]);
    setSelectedRole('All');
    setSelectedYear('All');
    setSearchQuery('');
  };
  const handleClearFilters = clearAllFilters;

  return (
    <div className="text-center">
      <h3 className="mt-12 mb-4 text-3xl md:text-6xl font-bold text-gray-900 text-center">
        My <span className="text-info">Works</span>
      </h3>
      <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
        These are my works, from my university assignments to my work projects.
      </p>

      {/* Filters - Modern Two-Row Partitioned Bar */}
      {!limit && (availableTechs.length > 0 || allRoleNames.length > 0 || allYears.length > 0) && (
        <div className="portfolio-filter relative z-30 mb-8 sm:mb-10 max-w-5xl mx-auto px-4 mt-8">
          <div className="relative z-30 bg-base-200/60 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-base-300 shadow-sm space-y-4 text-left">
            {/* Row 1: Role Pills & Keyword Search */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-1.5" data-testid="portfolio-role-filter">
                <span className="text-xs font-semibold text-base-content/60 mr-1 hidden sm:inline">Roles:</span>
                <button
                  type="button"
                  onClick={() => handleRoleFilter('All')}
                  className={`btn btn-xs sm:btn-sm gap-1.5 rounded-full transition-all ${
                    selectedRole === 'All'
                      ? 'bg-[#00BAFE] text-white border-[#00BAFE] hover:bg-[#00BAFE]/90 shadow-sm font-semibold'
                      : 'border-[#00BAFE] text-[#00BAFE] hover:bg-[#00BAFE] hover:text-white'
                  }`}
                  data-testid="role-filter-All"
                >
                  <span>All</span>
                  <span className={`badge badge-xs ${selectedRole === 'All' ? 'badge-neutral text-neutral-content' : 'badge-ghost'}`}>
                    {portfolioItems.length}
                  </span>
                </button>
                {allRoleNames.map((roleName) => {
                  const count = portfolioItems.filter(item => item.roles && item.roles.includes(roleName)).length;
                  const isSelected = selectedRole === roleName;
                  const roleObj = availableRoles.find(r => r.title === roleName);
                  const colorKey = roleObj?.color || 'info';
                  const styleConfig = ROLE_COLOR_STYLES[colorKey] || ROLE_COLOR_STYLES.info;

                  return (
                    <button
                      key={roleName}
                      type="button"
                      onClick={() => handleRoleFilter(roleName)}
                      className={`btn btn-xs sm:btn-sm gap-1.5 rounded-full transition-all ${
                        isSelected ? styleConfig.active : styleConfig.inactive
                      }`}
                      data-testid={`role-filter-${roleName}`}
                    >
                      <span>{roleName}</span>
                      <span className={`badge badge-xs ${isSelected ? 'badge-neutral text-neutral-content' : 'badge-ghost'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search Box */}
              <div className="w-full md:w-64 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects and technologies..."
                  className="input input-bordered input-sm w-full pl-8 text-xs rounded-full bg-base-100"
                  data-testid="portfolio-search-input"
                />
                <svg
                  className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-base-content/40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Row 2: Year Selector, Tech Dropdown, and Clear All */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-base-300/60">
              <div className="flex flex-wrap items-center gap-3">
                {/* Year Selector */}
                {allYears.length > 0 && (
                  <div className="flex items-center gap-1.5" data-testid="portfolio-year-filter">
                    <span className="text-xs font-semibold text-base-content/60 mr-1">Year:</span>
                    <button
                      type="button"
                      onClick={() => setSelectedYear('All')}
                      className={`btn btn-xs rounded-full transition-all ${
                        selectedYear === 'All'
                          ? 'bg-[#00BAFE] text-white border-[#00BAFE] hover:bg-[#00BAFE]/90 font-semibold shadow-sm'
                          : 'btn-ghost hover:bg-base-300'
                      }`}
                      data-testid="year-filter-All"
                    >
                      All
                    </button>
                    {allYears.map((year) => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => setSelectedYear(year)}
                        className={`btn btn-xs rounded-full transition-all ${
                          selectedYear === year
                            ? 'bg-[#00BAFE] text-white border-[#00BAFE] hover:bg-[#00BAFE]/90 font-semibold shadow-sm'
                            : 'btn-ghost hover:bg-base-300'
                        }`}
                        data-testid={`year-filter-${year}`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                )}

                {/* Tech Dropdown */}
                {availableTechs.length > 0 && (
                  <div className="relative inline-block z-40" ref={techDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setTechDropdownOpen(!techDropdownOpen)}
                      className={`btn btn-xs rounded-full gap-1 border-base-300 ${
                        selectedTechs.length > 0 ? 'btn-accent' : 'btn-outline'
                      }`}
                      data-testid="portfolio-tech-dropdown-btn"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span>{selectedTechs.length === 0 ? `Filter by Tech (${availableTechs.length})` : `${selectedTechs.length} Selected`}</span>
                      <svg className={`w-3 h-3 transition-transform ${techDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {techDropdownOpen && (
                      <div
                        className="absolute left-0 mt-1 w-64 max-h-64 overflow-y-auto bg-base-100 rounded-xl shadow-xl border border-base-300 z-50 p-2 text-xs"
                        data-testid="portfolio-tech-menu"
                      >
                        {availableTechs.map((tech) => {
                          const count = portfolioItems.filter(item => item.tech.includes(tech)).length;
                          const isSelected = selectedTechs.includes(tech);
                          return (
                            <button
                              key={tech}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTechToggle(tech);
                              }}
                              className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                                isSelected ? 'bg-primary text-primary-content font-bold' : 'hover:bg-base-200 text-base-content'
                              }`}
                              data-testid={`tech-option-${tech}`}
                            >
                              <span className="flex items-center gap-2">
                                {isSelected && <span>✓</span>}
                                <span>{tech}</span>
                              </span>
                              <span className={`badge badge-xs ${isSelected ? 'badge-neutral' : 'badge-ghost'}`}>
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Selected Tech Pills */}
                {selectedTechs.map((tech) => (
                  <div key={tech} className="badge badge-info badge-sm gap-1.5 py-2">
                    <span>{tech}</span>
                    <button
                      type="button"
                      onClick={() => handleTechToggle(tech)}
                      className="btn btn-xs btn-circle btn-ghost h-4 w-4 min-h-0 hover:btn-error"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Clear All Button */}
              {(selectedTechs.length > 0 || selectedRole !== 'All' || selectedYear !== 'All' || searchQuery.trim() !== '') && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="btn btn-ghost btn-xs text-error gap-1 hover:bg-error/10"
                  aria-label="Clear All"
                  data-testid="clear-portfolio-filters"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>

          {/* Results summary */}
          <div className="text-center mt-3 text-xs text-base-content/60">
            Showing {filteredItems.length} of {portfolioItems.length} projects
          </div>
        </div>
      )}

      {/* Grid of Projects or Empty State */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-base-200/40 rounded-2xl border border-base-300 max-w-2xl mx-auto my-8 p-6">
          <p className="text-base text-base-content/70 mb-3">
            No projects match your current filter and search criteria.
          </p>
          <button
            type="button"
            onClick={clearAllFilters}
            className="btn btn-primary btn-sm rounded-full"
            data-testid="reset-empty-portfolio-filters"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 justify-items-center mt-4 sm:mt-8 lg:mt-12 py-6 px-4 sm:py-8 sm:px-6 lg:py-2 lg:px-2 max-w-7xl mx-auto">
          <PortfolioCard items={items} />
        </div>
      )}

      {limit && (
        <div className="text-center mt-8 sm:mt-10 lg:mt-12">
          <Link to="/portfolio" className="btn btn-outline btn-info btn-sm sm:btn-md">
            See More Projects
          </Link>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
