import React from 'react';
import AboutMe from '../sections/aboutme/aboutme';
import Contact from '../sections/contact/contact';
import Footer from '../sections/footer/footer';
import Hero from '../sections/hero/hero';
import Navbar from '../sections/nav/nav';
import Portfolio from '../sections/portfolios/portfolio';
import EducationSection from '../sections/education/education';

const Home: React.FC = () => {
  return (
    <div className="App">
      <div className='start'>
        <Navbar/>
        <Hero/>
      </div>
      <div className='about-me'>
        <AboutMe/>
      </div>
      <div className='education'>
        <EducationSection/>
      </div>
      <div className='portfolio'>
        <Portfolio limit={4}/>
      </div>
      <div className='end'>
        <Contact/>
        <Footer/>
      </div>
    </div>
  );
};

export default Home;
