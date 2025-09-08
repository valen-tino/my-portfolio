import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CMSStorage, PortfolioItem, Role } from '../cms/apiStorage';
import Navbar from '../sections/nav/nav';
import Footer from '../sections/footer/footer';
import MDEditor from '@uiw/react-md-editor';

const PortfolioDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [portfolio, setPortfolio] = useState<PortfolioItem | null>(null);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (id) {
        try {
          const [portfolioData, rolesData] = await Promise.all([
            CMSStorage.getPortfolios(),
            CMSStorage.getRoles()
          ]);
          const foundPortfolio = portfolioData.find(p => p.id === id || p._id === id);
          setPortfolio(foundPortfolio || null);
          setAvailableRoles(rolesData);
        } catch (error) {
          console.error('Error fetching portfolio:', error);
          setPortfolio(null);
        }
      }
      setLoading(false);
    };
    
    fetchPortfolio();
  }, [id]);

  if (loading) {
    return (
      <div className="App">
        <Navbar />
        <section className="section pt-24 min-h-screen">
          <div className="section-container">
            <div className="text-center">
              <div className="loading loading-spinner loading-lg"></div>
              <p className="mt-4">Loading portfolio...</p>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="App">
        <Navbar />
        <section className="section pt-24 min-h-screen">
          <div className="section-container">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">Portfolio Not Found</h1>
              <p className="text-base-content/70 mb-8">The portfolio item you're looking for doesn't exist.</p>
              <Link to="/portfolio" className="btn btn-info">
                Back to Portfolio
              </Link>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="App">
      <Navbar />
      
      <section className="pt-24 pb-24 min-h-screen">
        {/* Mobile Layout */}
        <div className="block lg:hidden">
          <div className="section-container">
            <div className="max-w-4xl mx-auto px-4 sm:px-16">
              {/* Breadcrumb */}
              <div className="breadcrumbs text-sm mb-8">
                <ul>
                  <li><Link to="/">Home</Link></li>
                  <li><Link to="/portfolio">Portfolio</Link></li>
                  <li>{portfolio.title}</li>
                </ul>
              </div>
              
              {/* Project Header */}
              <div className="text-center mb-12">
                <h1 className="text-3xl md:text-5xl font-bold mb-4">{portfolio.title}</h1>
              </div>
              
              {/* Project Image */}
              <div className="mb-8">
                <img 
                  src={portfolio.imageURL.startsWith('http') ? portfolio.imageURL : "/images/portfolios/" + portfolio.imageURL} 
                  alt={portfolio.title} 
                  className="w-full rounded-2xl shadow-2xl"
                />
              </div>
              
              {/* Roles */}
              {portfolio.roles && portfolio.roles.length > 0 && (
                <div className="mb-8 text-center">
                  <h3 className="text-xl font-semibold mb-4">Project Roles</h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {portfolio.roles.map((roleTitle, index) => {
                      const role = availableRoles.find(r => r.title === roleTitle);
                      return (
                        <div
                          key={index}
                          className={`badge badge-${role?.color || 'info'} badge-lg`}
                        >
                          {roleTitle}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Technologies Used */}
              {portfolio.tech.length > 0 && (
                <div className="mb-8 text-center">
                  <h3 className="text-xl font-semibold mb-4">Technologies Used</h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {portfolio.tech.map((tech, index) => (
                      <div key={index} className="badge badge-outline badge-lg">
                        {tech}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Project Description */}
              <div className="prose lg:prose-xl mx-auto mb-8 portfolio-markdown">
                <p className="text-lg leading-relaxed">
                  {portfolio.desc}
                </p>
              </div>
              
              {/* Project Details (Markdown) */}
              {portfolio.projectDetails && (
                <div className="prose lg:prose-xl mx-auto mb-12 portfolio-markdown" data-color-mode="light">
                  <MDEditor.Markdown source={portfolio.projectDetails} />
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 justify-center">
                {portfolio.linkTo && (
                  <a 
                    href={portfolio.linkTo} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="btn btn-outline btn-lg gap-2 text-white"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Visit Project
                  </a>
                )}
                <Link to="/portfolio" className="btn btn-outline btn-info btn-lg hover:text-white">
                  Back to Portfolio
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout - Split Screen */}
        <div className="hidden lg:flex h-screen">
          {/* Left Side - Sticky Content */}
          <div className="w-2/5 sticky top-0 h-screen overflow-y-auto">
            <div className="p-8 pr-4 h-full flex flex-col">
              {/* Breadcrumb */}
              <div className="breadcrumbs text-sm mb-6">
                <ul>
                  <li><Link to="/">Home</Link></li>
                  <li><Link to="/portfolio">Portfolio</Link></li>
                  <li>{portfolio.title}</li>
                </ul>
              </div>
              
              {/* Project Header */}
              <div className="mb-8">
                <h1 className="text-3xl xl:text-4xl font-bold mb-4">{portfolio.title}</h1>
              </div>
              
              {/* Project Image */}
              <div className="mb-8 flex-shrink-0">
                <img 
                  src={portfolio.imageURL.startsWith('http') ? portfolio.imageURL : "/images/portfolios/" + portfolio.imageURL} 
                  alt={portfolio.title} 
                  className="w-full md:w-10/12 rounded-2xl shadow-2xl"
                />
              </div>
              
              {/* Roles */}
              {portfolio.roles && portfolio.roles.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">Project Roles</h3>
                  <div className="flex flex-wrap gap-2">
                    {portfolio.roles.map((roleTitle, index) => {
                      const role = availableRoles.find(r => r.title === roleTitle);
                      return (
                        <div
                          key={index}
                          className={`badge badge-${role?.color || 'info'} badge-lg`}
                        >
                          {roleTitle}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Technologies Used */}
              {portfolio.tech.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">Technologies Used</h3>
                  <div className="flex flex-wrap gap-2">
                    {portfolio.tech.map((tech, index) => (
                      <div key={index} className="badge badge-outline badge-lg">
                        {tech}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mt-auto">
                {portfolio.linkTo && (
                  <a 
                    href={portfolio.linkTo} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="btn btn-info btn-lg gap-2 text-white"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Visit Project
                  </a>
                )}
                <Link to="/portfolio" className="btn btn-outline btn-info btn-lg hover:text-white">
                  Back to Portfolio
                </Link>
              </div>
            </div>
          </div>
          
          {/* Right Side - Scrollable Content */}
          <div className="w-3/5 overflow-y-auto h-screen">
            <div className="p-8 pl-4">
              {/* Project Description */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-6">Project Overview</h2>
                <div className="prose lg:prose-lg max-w-none portfolio-markdown">
                  <p className="text-lg leading-relaxed text-base-content/80">
                    {portfolio.desc}
                  </p>
                </div>
              </div>
              
              {/* Project Details (Markdown) */}
              {portfolio.projectDetails && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold mb-6">Project Details</h2>
                  <div className="prose lg:prose-lg max-w-none portfolio-markdown" data-color-mode="light">
                    <MDEditor.Markdown source={portfolio.projectDetails} />
                  </div>
                </div>
              )}
              
              {/* Extra spacing at bottom for better scroll experience */}
              <div className="h-24"></div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default PortfolioDetail;
