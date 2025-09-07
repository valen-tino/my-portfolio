import React from 'react';
import Navbar from '../sections/nav/nav';
import Footer from '../sections/footer/footer';
import Portfolio from '../sections/portfolios/portfolio';

const PortfolioPage: React.FC = () => {
  return (
    <div className="App">
      <Navbar />
      
      {/* Portfolio Section */}
      <section className="section bg-base-100 pt-24 pb-24 px-8 sm:px-16 lg:px-32">
        <div className="section-container">
          <Portfolio />
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default PortfolioPage;
