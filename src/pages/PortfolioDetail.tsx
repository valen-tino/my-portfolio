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
        <section className="section pt-24">
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
        <section className="section pt-24">
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
      
      <section className="section pt-24 pb-24">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
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
            
            <div>
            
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
                    <div key={index} className="badge badge-info badge-lg">
                      {tech}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Project Description */}
            <div className="prose lg:prose-xl mx-auto mb-8">
              <p className="text-lg leading-relaxed">
                {portfolio.desc}
              </p>
            </div>
            
            {/* Project Details (Markdown) */}
            {portfolio.projectDetails && (
              <div className="prose lg:prose-xl mx-auto mb-12" data-color-mode="light">
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
                  className="btn btn-info btn-lg gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Visit Project
                </a>
              )}
              <Link to="/portfolio" className="btn btn-outline btn-info btn-lg">
                Back to Portfolio
              </Link>
            </div>
            </div>
          </div>
          </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default PortfolioDetail;
