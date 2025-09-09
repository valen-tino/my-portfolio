import React from 'react'
import Me from '../../assets/me.png'
import Down from '../../assets/down.svg'
import { Greeting } from '../../others/greeting'
import { Link } from 'react-scroll'

const Hero = () => {
  return (
    <section 
      id="home" 
      className="min-h-[48vh] bg-cover bg-center bg-no-repeat relative lg:mx-0 xl:mx-8 rounded-b-3xl shadow-2xl"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url('/pexels.jpg')`,
      }}
    >
      <div className="hero pt-16 sm:pt-24 lg:pt-32 pb-16 sm:pb-24 lg:pb-32">
        <div className="hero-content flex-col lg:flex-row-reverse max-w-6xl mx-auto px-4 py-8 relative z-10">          
          <div className="text-white center">
        <div className="mb-4 sm:mb-6">
          <Greeting />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight text-white text-center">
          I'm <span className="text-info">Valentino Jehaut</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold mb-6 sm:mb-8 text-white/90 leading-relaxed text-center">
          <span className="text-warning block sm:inline">Lifetime Learner, I design and develop websites.</span>
        </p>
        <div className="flex justify-center">
          <Link 
            className="btn btn-info btn-sm sm:btn-md lg:btn-lg gap-2 sm:gap-3 shadow-xl hover:shadow-2xl transition-all duration-300" 
            activeClass="active" 
            to="aboutme" 
            spy={true} 
            smooth={true} 
            offset={-100} 
            duration={500}
          >
            <img src={Down} alt="" className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            <span className="text-sm sm:text-base lg:text-lg">About Me</span>
          </Link>
        </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
