import React from 'react'
import "../hero/hero.module.css"
import Me from '../../assets/me.png'
import Down from '../../assets/down.svg'
import { Greeting } from '../../others/greeting'
import { Link } from 'react-scroll'


const Hero = () => {
  return (
    <section id='home'>
        <div className="hero max-h-screen md:h-screen pt-10 md:p-0">
            <div className="hero-content flex-col lg:flex-row-reverse">
                <img src={Me} className="max-w-xs md:max-w-2xl rounded-lg animate-wiggle" />
                        <div className="hero-content text-left text-gray-100">
                            <div className="max-w-md">
                                <Greeting/>
                                <p className="mb-5 text-xl md:text-5xl font-semibold">I'm <span>Valentino Jehaut</span></p>
                                <p className="mb-5 text-xl md:text-3xl font-semibold"><span>UI / UX Designer & Web Developer</span></p>
                                <Link className="btn btn-primary shadow-2xl animate-headShake" activeClass="active" to="aboutme" spy={true} smooth={true} offset={-100} duration={500}>
                                    <img src={Down} alt='' className='w-8'/> &nbsp; About Me  
                                </Link>
                            </div>
                </div>
            </div>
        </div>
    </section>

  )
}

export default Hero
