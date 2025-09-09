import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PortfolioItem } from '../../cms/apiStorage';
import PasswordProtectionModal from '../../components/PasswordProtectionModal';

interface Props {
  items: PortfolioItem[];
}

const PortfolioCard: React.FC<Props> = ({ items }) => {
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioItem | null>(null);
  const [passwordError, setPasswordError] = useState('');
  const [unlockedItems, setUnlockedItems] = useState<Set<string | number>>(new Set());

  const handlePasswordSubmit = (password: string) => {
    if (!selectedPortfolio) return;
    
    // Simple password check - in a real app, this should be done server-side
    if (password === selectedPortfolio.password) {
      setUnlockedItems(prev => new Set(prev).add(selectedPortfolio.id));
      setPasswordError('');
      setSelectedPortfolio(null);
    } else {
      setPasswordError('Incorrect password. Please try again.');
    }
  };

  const handleProtectedClick = (item: PortfolioItem) => {
    if (item.isPasswordProtected && !unlockedItems.has(item.id)) {
      setSelectedPortfolio(item);
      setPasswordError('');
    }
  };

  return (
    <>
      {items.map((item) => {
        const isProtected = item.isPasswordProtected && !unlockedItems.has(item.id);
        const isPinned = item.isPinned;
        
        return (
          <div 
            className={`card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 w-full max-w-sm mx-auto relative ${isProtected ? 'cursor-pointer' : ''}`} 
            key={item.id}
            onClick={() => handleProtectedClick(item)}
          >
            {/* Pinned Badge */}
            {isPinned && (
              <div className="absolute top-2 left-2 z-10">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500 text-white shadow-lg">
                  📌 Pinned
                </span>
              </div>
            )}
            
            {/* Protected Overlay */}
            {isProtected && (
              <div className="absolute top-2 right-2 z-10">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500 text-white shadow-lg">
                  🔒 Protected
                </span>
              </div>
            )}
            
            <figure className="aspect-video overflow-hidden">
              <img 
                src={item.imageURL.startsWith('http') ? item.imageURL : "images/portfolios/" + item.imageURL} 
                alt={item.title} 
                className={`w-full h-full object-cover transition-transform duration-300 hover:scale-110 ${
                  isProtected ? 'blur-sm' : ''
                }`}
              />
              {isProtected && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="text-white text-center">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium">Click to unlock</p>
                  </div>
                </div>
              )}
            </figure>
            
            <div className={`card-body p-4 sm:p-6 ${isProtected ? 'blur-sm' : ''}`}>
              <h2 className="card-title text-base sm:text-lg font-bold line-clamp-2">
                {isProtected ? '••••••••••••••••' : item.title}
              </h2>
              <p className='text-xs sm:text-sm text-left text-base-content/70 line-clamp-2 leading-relaxed'>
                {isProtected ? 'This portfolio is password protected. Click to enter password and view details.' : item.desc}
              </p>
              <div className="my-2 flex flex-wrap gap-1">
                {isProtected ? (
                  <div className="badge badge-outline badge-sm">Protected Content</div>
                ) : (
                  item.tech.map((tech, index) => (
                    <div key={index} className="badge badge-outline badge-sm">
                      {tech}
                    </div>
                  ))
                )}
              </div>
              <div className="card-actions justify-end gap-2 flex-wrap">
                {isProtected ? (
                  <button className="btn btn-outline btn-error btn-sm flex-1">
                    🔒 Enter Password
                  </button>
                ) : (
                  <>
                    <Link 
                      to={`/portfolio/${item.id}`} 
                      className="btn btn-outline btn-info btn-sm flex-1 sm:flex-none"
                    >
                      Details
                    </Link>
                    {item.linkTo && (
                      <a href={item.linkTo} target="_blank" rel="noreferrer" className="flex-1 sm:flex-none">
                        <button className="btn btn-info btn-sm w-full">
                          Visit
                        </button>
                      </a>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Password Protection Modal */}
      <PasswordProtectionModal
        isOpen={selectedPortfolio !== null}
        onClose={() => {
          setSelectedPortfolio(null);
          setPasswordError('');
        }}
        onSubmit={handlePasswordSubmit}
        portfolioTitle={selectedPortfolio?.title || ''}
        error={passwordError}
      />
    </>
  );
};

export default PortfolioCard;
