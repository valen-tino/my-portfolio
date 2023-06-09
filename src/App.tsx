import { useState } from 'react';
import { inject } from '@vercel/analytics';

import './App.css';
import AboutMe from './sections/aboutme/aboutme';
import Contact from './sections/contact/contact';
import Footer from './sections/footer/footer';
import Hero from './sections/hero/hero';
import Navbar from './sections/nav/nav';
import Portfolio from './sections/portfolios/portfolio';


function App() {
  return (
    <div className="App">
        <div className='start'>
          <Navbar/>
          <Hero/>
        </div>
        <div className='about-me'>
          <AboutMe/>
        </div>
        <div className='portfolio'>
          <Portfolio/>
        </div>
        <div className='end'>
          <Contact/>
          <Footer/>
        </div>

    </div>
  );
}

inject();

export default App;

