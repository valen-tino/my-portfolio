import Me from '../../assets/myface.jpeg'
import Down from '../../assets/down.svg'
import Download from '../../assets/download.svg'
import Pink from '../../assets/Party.svg'
import Skills from '../skills/skills'
import { Link } from 'react-scroll'

const AboutMe = () => {
  return (
    <section id='aboutme'>
        <img src={Pink} alt="spin me ight round baby right round" className='absolute motion-safe:animate-spin'/>
            <div className="hero pt-10 bg-base">
                <div className="hero-content flex-col md:gap-10 lg:flex-row-reverse">
                            <img src={Me} className="max-w-xs md:max-w-4xl rounded-lg shadow-2xl mask mask-hexagon-2" />
                            <div className="hero-content text-left text-gray-900">
                                <div className="max-w-2xl">
                                    <h1 className="mb-10 text-5xl md:text-8xl font-bold underline underline-offset-8 decoration-wavy decoration-sky-400">About Me</h1>
                                    <p className="text-md md:text-xl font-regular">
                                        Well, name’s Valentino Yudhistira Jehaut (A.k.a Valen) and nice to know you! <br/><br/>
                                        I’m 19 years old now and currently living in Bali, Indonesia. I just graduated from SMK TI Bali Global Denpasar majoring in Software Engineering and currently pursuing Double Bachelor's Degree in Information Systems (ITB Stikom Bali) & Information Technology (HELP University)<br/><br/>
                                        I’ve had experience as a web developer for more than 2 years now and as a UI/UX Designer for more than a year. At that time, i'm always curious and open to trying new technologies just to enhance my skills so that i didn't miss out on the current trends.<br/><br/>
                                        Now, i'm currently as a UI/UX Designer & Part-time Web Developer at &nbsp;
                                        <span className='underline underline-offset-2 decoration-red-600 tooltip' data-tip="Click to Open">
                                            <a href='https://www.bendega.id' target="_blank" rel="noreferrer">Bendega.id</a>
                                        </span> and also as a Web Developer at &nbsp;
                                        <span className='underline underline-offset-2 decoration-red-600 tooltip' data-tip="Click to Open">
                                            <a href='https://www.balimountainretreat.com' target="_blank" rel="noreferrer">Bali Mountain Retreat</a>
                                        </span>.<br/><br/>
                                    </p>
                                    <div className="row">
                                        <Link className="btn btn-primary shadow-2xl mb-2" activeClass="active" to="portfolio" spy={true} smooth={true} offset={-100} duration={500}>
                                            <img src={Down} alt='Down' className='w-8'/> &nbsp; See My Portfolios! 
                                        </Link>
                                        &nbsp;
                                        <a href="/Valen-Jehaut.pdf" target="_self" rel="noreferrer" className="btn btn-warning shadow-2xl">
                                            <img src={Download} alt='Down' className='w-8'/> &nbsp; Download CV 
                                        </a>
                                    </div>
                                
                                </div>
                    </div>
                </div>
            </div> &nbsp;
        <Skills/>
    </section>
  )
}

export default AboutMe
