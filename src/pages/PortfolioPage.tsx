import React from 'react';
import Navbar from '../sections/nav/nav';
import Footer from '../sections/footer/footer';
import Portfolio from '../sections/portfolios/portfolio';

const PortfolioPage: React.FC = () => {
  return (
    <div className="App">
      <Navbar/>
      <Portfolio/>
      <Footer/>
    </div>
  );
};

export default PortfolioPage;
