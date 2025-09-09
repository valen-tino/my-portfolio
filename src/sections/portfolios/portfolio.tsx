import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import PortfolioCard from './portfoliocard';
import { CMSStorage, PortfolioItem, Role } from '../../cms/apiStorage';

interface Props {
  limit?: number;
}

const Portfolio: React.FC<Props> = ({ limit }) => {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<PortfolioItem[]>([]);
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [availableTechs, setAvailableTechs] = useState<string[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [allRoleNames, setAllRoleNames] = useState<string[]>([]);
  const [techDropdownOpen, setTechDropdownOpen] = useState(false);
  const techDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        const [portfolioData, rolesData] = await Promise.all([
          CMSStorage.getPortfolios(),
          CMSStorage.getRoles()
        ]);
        
        setPortfolioItems(portfolioData);
        setFilteredItems(portfolioData);
        setAvailableRoles(rolesData);
        
        // Extract all unique technologies
        const allTechs = portfolioData.reduce<string[]>((techs, item) => {
          return [...techs, ...item.tech.filter(tech => !techs.includes(tech))];
        }, []).sort();
        
        // Extract all unique role names from portfolio items
        const allRoles = portfolioData.reduce<string[]>((roles, item) => {
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

  // Filter items based on selected technologies and role
  useEffect(() => {
    let filtered = portfolioItems;
    
    // Filter by technologies (any tech selected must be included)
    if (selectedTechs.length > 0) {
      filtered = filtered.filter(item => 
        selectedTechs.some(tech => item.tech.includes(tech))
      );
    }
    
    // Filter by role
    if (selectedRole !== 'All') {
      filtered = filtered.filter(item => 
        item.roles && item.roles.includes(selectedRole)
      );
    }
    
    setFilteredItems(filtered);
  }, [selectedTechs, selectedRole, portfolioItems]);

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
  };

  return (
    <div className="text-center">
      <h3 className="mt-12 mb-4 text-3xl md:text-6xl font-bold  text-gray-900 text-center">
        My <span className='text-info'>Works</span>
      </h3>
      <p className="text-xl text-base-content/70 max-w-2xl mx-auto">These are my works, from my university assignments to my work projects.</p>
      
      {/* Filters - Horizontal Bar */}
      {!limit && (availableTechs.length > 0 || allRoleNames.length > 0) && (
        <div className="mb-8 flex justify-center mx-6">
          <div className="inline-block">
            {/* Filter Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Filters</h3>
              {(selectedTechs.length > 0 || selectedRole !== 'All') && (
                <button 
                  onClick={clearAllFilters}
                  className="btn btn-sm btn-outline btn-error ml-4"
                >
                  Clear All
                </button>
              )}
            </div>
            
            {/* Horizontal Filter Bar */}
            <div className="bg-base-200 rounded-lg p-4 w-fit max-w-4xl">
              <div className="flex items-center gap-4 flex-wrap justify-start">
                {/* Role Filters */}
                {allRoleNames.length > 0 && (
                  <>
                    <span className="text-sm font-medium text-base-content/70 whitespace-nowrap">Roles:</span>
                    <button
                      onClick={() => handleRoleFilter('All')}
                      className={`badge badge-lg cursor-pointer transition-all inline-flex items-center whitespace-nowrap ${
                        selectedRole === 'All'
                          ? 'badge-info shadow-lg'
                          : 'badge-outline badge-info hover:badge-info hover:shadow-md'
                      }`}
                    >
                      <span className="whitespace-nowrap">All</span>
                      <span className="badge badge-xs ml-1 badge-neutral">
                        {portfolioItems.length}
                      </span>
                    </button>
                    {allRoleNames.map((roleName) => {
                      const role = availableRoles.find(r => r.title === roleName);
                      const isSelected = selectedRole === roleName;
                      const count = portfolioItems.filter(item => item.roles && item.roles.includes(roleName)).length;
                      
                      return (
                        <button
                          key={roleName}
                          onClick={() => handleRoleFilter(roleName)}
                          className={`badge badge-lg cursor-pointer transition-all inline-flex items-center whitespace-nowrap ${
                            isSelected
                              ? `badge-${role?.color || 'info'} shadow-lg`
                              : `badge-outline badge-${role?.color || 'info'} hover:badge-${role?.color || 'info'} hover:shadow-md`
                          }`}
                        >
                          <span className="whitespace-nowrap">{roleName}</span>
                          <span className={`badge badge-xs ml-1 ${
                            isSelected ? 'badge-neutral' : 'badge-ghost'
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </>
                )}
                
                {/* Tech Filters */}
                {availableTechs.length > 0 && (
                  <>
                    <span className="text-sm font-medium text-base-content/70 whitespace-nowrap">Tech:</span>
                    
                    {/* Tech Dropdown */}
                    <div className="relative" ref={techDropdownRef}>
                      <button 
                        className="btn btn-sm btn-outline btn-info"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTechDropdownOpen(!techDropdownOpen);
                        }}
                      >
                        Add Technology ({availableTechs.length})
                        <svg className={`w-4 h-4 ml-1 transition-transform ${
                          techDropdownOpen ? 'rotate-180' : ''
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {techDropdownOpen && (
                        <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999] max-h-64 overflow-y-auto">
                          <div className="p-2">
                            {availableTechs.length > 0 ? (
                              availableTechs.map((tech) => {
                                const count = portfolioItems.filter(item => item.tech.includes(tech)).length;
                                const isSelected = selectedTechs.includes(tech);
                                return (
                                  <button
                                    key={tech}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTechToggle(tech);
                                      // Keep dropdown open for multiple selections
                                    }}
                                    className={`w-full flex items-center justify-between p-2 rounded hover:bg-gray-100 text-left transition-colors ${
                                      isSelected ? 'bg-blue-500 text-white' : 'text-gray-700'
                                    }`}
                                  >
                                    <span className="flex items-center gap-2">
                                      {isSelected && (
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      )}
                                      {tech}
                                    </span>
                                    <span className={`badge badge-xs ${
                                      isSelected ? 'badge-neutral' : 'badge-ghost'
                                    }`}>
                                      {count}
                                    </span>
                                  </button>
                                );
                              })
                            ) : (
                              <div className="p-4 text-center text-gray-500">
                                No technologies available
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Selected Tech Pills */}
                    {selectedTechs.map((tech) => (
                      <div key={tech} className="badge badge-info gap-2">
                        {tech}
                        <button
                          onClick={() => handleTechToggle(tech)}
                          className="btn btn-xs btn-circle btn-ghost hover:btn-error"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
            
            {/* Results summary */}
            <div className="text-center mt-4">
              <div className="text-sm text-base-content/60">
                Showing {items.length} of {portfolioItems.length} projects
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 justify-items-center mt-4 sm:mt-8 lg:mt-12 py-6 px-4 sm:py-8 sm:px-6 lg:py-2 lg:px-2 max-w-7xl mx-auto">
        <PortfolioCard items={items} />
      </div>
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
