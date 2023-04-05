  import Download from '../../assets/download.svg'

import useScrollPosition from '../../hook/useScrollPosition'
import { Link } from "react-scroll";

const Navbar = () => {
  const scrollPosition = useScrollPosition()
  
  function classFunc(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
  }

  return (
    <nav>
        <div className={classFunc(scrollPosition > 0 ? 'bg-white text-gray-900 rounded-b-2xl' : 'text-gray-50','fixed navbar w-screen justify-center md:py-5 z-50 shadow-2xl')}>
          
          <div className="justify-start w-1/2 md:w-2/6">
            <div className="dropdown ">
              <label tabIndex={0} className="btn btn-ghost lg:hidden">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
              </label>
              <ul tabIndex={0} className={classFunc(scrollPosition > 0 ? 'bg-gray-900 text-gray-100' : 'bg-gray-100  text-gray-900','menu menu-compact dropdown-content mt-3 p-2 shadow rounded-box w-52')}  >
                <li><Link activeClass="active" to="home" spy={true} smooth={true} offset={-100} duration={500}>Home</Link></li>
                <li><Link activeClass="active" to="aboutme" spy={true} smooth={true} offset={-100} duration={500}>About Me</Link></li>
                <li><Link activeClass="active" to="portfolio" spy={true} smooth={true} offset={-100} duration={500}>Portfolio</Link></li>
                <li><Link activeClass="active" to="contact" spy={true} smooth={true} offset={-100} duration={500}>Contact</Link></li>
              </ul>
            </div>
            <a className="btn btn-ghost">
              <svg width="136" className='w-8 -mt-8 md:w-10 md:-mt-9' height="100" viewBox="0 0 136 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 10V137L126 10V137H71.2973V101.639" stroke={classFunc(scrollPosition > 0 ? 'black' : 'white')} stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </a>
          </div>
          <div className="justify-end w-1/2 md:w-3/6">
            <div className='hidden lg:flex'>
                <ul className="p-0 menu menu-horizontal">
                  <li><Link activeClass="active" to="home" spy={true} smooth={true} offset={-100} duration={500}>Home</Link></li>
                  <li><Link activeClass="active" to="aboutme" spy={true} smooth={true} offset={-100} duration={500}>About Me</Link></li>
                  <li><Link activeClass="active" to="portfolio" spy={true} smooth={true} offset={-100} duration={500}>Portfolio</Link></li>
                  <li><Link activeClass="active" to="contact" spy={true} smooth={true} offset={-100} duration={500}>Contact</Link></li>
                </ul>
                &nbsp;
            </div>
            <a className="text-xs rounded-full btn btn-warning animate-headShake md:text-md" target="_self" rel="noreferrer" href='/Valen-Jehaut.pdf'>
              <img src={Download} alt='Down' className='w-8'/>&nbsp;Download CV
            </a>
          </div>
        </div>
      </nav>
  )
}

export default Navbar
