import React from 'react';
import { Link } from 'react-router-dom';
import { PortfolioItem } from '../../cms/portfolio';

interface Props {
  items: PortfolioItem[];
}

const PortfolioCard: React.FC<Props> = ({ items }) => {
  return (
    <>
      {items.map((item) => (
        <div className="card bg-base-100 shadow-xl transform transition duration-500 hover:scale-90" key={item.id}>
          <figure>
            <img src={"images/portfolios/" + item.imageURL} alt={item.title} />
          </figure>
          <div className="card-body">
            <h2 className="card-title">{item.title}</h2>
            <p className='text-sm text-left'>{item.desc}</p>
            <div className="badge">{item.tech.join(', ')}</div>
            <div className="card-actions justify-end gap-2">
              <Link to={`/portfolio/${item.id}`} className="btn btn-secondary">Details</Link>
              {item.linkTo && (
                <a href={item.linkTo} target="_blank" rel="noreferrer">
                  <button className="btn btn-primary">Visit</button>
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
