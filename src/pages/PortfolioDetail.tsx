import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPortfolioById } from '../cms/portfolio';
import Navbar from '../sections/nav/nav';
import Footer from '../sections/footer/footer';

const PortfolioDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const portfolio = getPortfolioById(Number(id));

  if (!portfolio) {
    return <div>Portfolio not found</div>;
  }

  return (
    <div className="App">
      <Navbar/>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">{portfolio.title}</h1>
        <img src={"/images/portfolios/" + portfolio.imageURL} alt={portfolio.title} className="mb-4"/>
        <p className="mb-4 whitespace-pre-line">{portfolio.desc}</p>
        {portfolio.linkTo && (
          <a href={portfolio.linkTo} target="_blank" rel="noreferrer" className="btn btn-primary mr-2">Visit</a>
        )}
        <Link to="/portfolio" className="btn">Back</Link>
      </div>
      <Footer/>
    </div>
  );
};

export default PortfolioDetail;
