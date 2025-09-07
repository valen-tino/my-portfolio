import React from 'react';
import AboutMe from '../sections/aboutme/aboutme';
import Contact from '../sections/contact/contact';
import Footer from '../sections/footer/footer';
import Hero from '../sections/hero/hero';
import Navbar from '../sections/nav/nav';
import Portfolio from '../sections/portfolios/portfolio';
import EducationSection from '../sections/education/education';
import ExperienceSection from '../sections/experience/experience';

const Home: React.FC = () => {
  return (
    <div className="App">
      <Navbar />
      
      {/* Hero Section */}
      <Hero />
      
      {/* About Me Section */}
      <section id="aboutme" className="about-section">
        <div className="section-container">
          <AboutMe />
        </div>
      </section>
      
      {/* Education Section */}
      <section id="education" className="education-section">
        <div className="section-container">
          <EducationSection />
        </div>
      </section>
      
      {/* Portfolio Section */}
      <section id="portfolio" className="portfolio-section">
        <div className="section-container">
          <Portfolio limit={3} />
        </div>
      </section>
      
      {/* Experience Section */}
      <ExperienceSection />
      
      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="section-container">
          <Contact />
        </div>
      </section>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
