import React from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { Link as ScrollLink } from 'react-scroll'
import Download from '../../assets/download.svg'
import useScrollPosition from '../../hook/useScrollPosition'

const Navbar = () => {
  const scrollPosition = useScrollPosition()
  const location = useLocation()
  const isPortfolioPage = location.pathname.startsWith('/portfolio')
  
  function classFunc(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
  }

  // Navigation items for main site (scroll links) vs portfolio pages (router links)
  const NavItems = ({ isMobile = false }) => {
    if (isPortfolioPage) {
      // Portfolio page navigation - use router links back to main site
      return (
        <>
          <li><RouterLink to="/#home" className="hover:text-info transition-colors">Home</RouterLink></li>
          <li><RouterLink to="/#aboutme" className="hover:text-info transition-colors">About Me</RouterLink></li>
          <li><RouterLink to="/#portfolio" className="hover:text-info transition-colors">Portfolio</RouterLink></li>
          <li><RouterLink to="/#contact" className="hover:text-info transition-colors">Contact</RouterLink></li>
        </>
      )
    } else {
      // Main site navigation - use scroll links
      return (
        <>
          <li><ScrollLink activeClass="text-info" to="home" spy={true} smooth={true} offset={-100} duration={500} className="cursor-pointer hover:text-info transition-colors">Home</ScrollLink></li>
          <li><ScrollLink activeClass="text-info" to="aboutme" spy={true} smooth={true} offset={-100} duration={500} className="cursor-pointer hover:text-info transition-colors">About Me</ScrollLink></li>
          <li><ScrollLink activeClass="text-info" to="portfolio" spy={true} smooth={true} offset={-100} duration={500} className="cursor-pointer hover:text-info transition-colors">Portfolio</ScrollLink></li>
          <li><ScrollLink activeClass="text-info" to="contact" spy={true} smooth={true} offset={-100} duration={500} className="cursor-pointer hover:text-info transition-colors">Contact</ScrollLink></li>
        </>
      )
    }
  }

  return (
    <div className={classFunc(
      'navbar fixed top-0 z-50 min-h-16 sm:px-4 transition-all duration-300 px-2',
      scrollPosition > 0 || isPortfolioPage
        ? 'bg-base-100 shadow-lg border-b border-base-300 text-base-content w-full' 
        : 'bg-transparent text-base-100 xl:px-16'
    )}>
      <div className="navbar-start">
        {/* Mobile menu dropdown */}
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-sm lg:hidden p-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-lg bg-base-100 rounded-box w-52 text-base-content">
            <NavItems isMobile={true} />
          </ul>
        </div>
        
        {/* Logo */}
        <RouterLink to="/" className="btn btn-ghost btn-sm text-lg ml-1">
          <svg width="24" height="32" viewBox="0 0 136 100" fill="none">
            <path 
              d="M11 10V137L126 10V137H71.2973V101.639" 
              stroke="currentColor" 
              strokeWidth="16" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </RouterLink>
      </div>
      
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <NavItems />
        </ul>
      </div>
      
      <div className="navbar-end">
        {/* Mobile CV Button - Icon only */}
        <a 
          className="btn btn-warning btn-sm gap-2 sm:hidden" 
          href="/Valen-Jehaut.pdf" 
          target="_self" 
          rel="noreferrer"
          title="Download CV"
        >
          <img src={Download} alt="Download CV" className="w-3 h-3" />
          Download CV
        </a>
        
        {/* Desktop CV Button - Full text */}
        <a 
          className="btn btn-warning btn-sm gap-2 hidden sm:flex" 
          href="/Valen-Jehaut.pdf" 
          target="_self" 
          rel="noreferrer"
        >
          <img src={Download} alt="Download" className="w-4 h-4" />
          Download CV
        </a>
      </div>
    </div>
  )
}

export default Navbar
