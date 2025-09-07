import React from 'react';
import { Link } from 'react-router-dom';
import { PortfolioItem } from '../../cms/apiStorage';

interface Props {
  items: PortfolioItem[];
}

const PortfolioCard: React.FC<Props> = ({ items }) => {
  return (
    <>
      {items.map((item) => (
        <div 
          className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 w-full max-w-sm mx-auto" 
          key={item.id}
        >
          <figure className="aspect-video overflow-hidden">
            <img 
              src={item.imageURL.startsWith('http') ? item.imageURL : "images/portfolios/" + item.imageURL} 
              alt={item.title} 
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            />
          </figure>
          <div className="card-body p-4 sm:p-6">
            <h2 className="card-title text-base sm:text-lg font-bold line-clamp-2">
              {item.title}
            </h2>
            <p className='text-xs sm:text-sm text-left text-base-content/70 line-clamp-3 leading-relaxed'>
              {item.desc}
            </p>
            <div className="my-2 flex flex-wrap gap-1">
              {item.tech.map((tech, index) => (
                <div key={index} className="badge badge-outline badge-sm">
                  {tech}
                </div>
              ))}
            </div>
            <div className="card-actions justify-end gap-2 flex-wrap">
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
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default PortfolioCard;
