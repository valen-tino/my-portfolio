import React from 'react';
import AboutMe from '../sections/aboutme/aboutme';
import Skills from '../sections/skills/skills';
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
      
      {/* Tools Section */}
      <section id="tools" className="tools-section py-8 sm:py-12 md:py-16 lg:py-24">
        <div className="section-container">
          <div className="bg-blue-800 rounded-2xl py-6 px-4 sm:py-12 sm:px-6 lg:py-12 lg:px-12 max-w-7xl mx-auto">
            <Skills />
          </div>
        </div>
      </section>
      
      {/* Portfolio (My Works) Section */}
      <section id="portfolio" className="portfolio-section">
        <div className="section-container">
          <Portfolio limit={3} />
        </div>
      </section>
      
      {/* Experience Section */}
      <ExperienceSection />
      
      {/* Education Section */}
      <EducationSection />
      
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
