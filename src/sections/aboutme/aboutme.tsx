import Me from '../../assets/myface.jpeg'
import Down from '../../assets/down.svg'
import Download from '../../assets/download.svg'
import Pink from '../../assets/Party.svg'
import Skills from '../skills/skills'
import { Link } from 'react-scroll'
import { useEffect, useState } from 'react'
import { CMSStorage, AboutData } from '../../cms/apiStorage'

const AboutMe = () => {
  const [aboutData, setAboutData] = useState<AboutData>({
    description: '',
    imageURL: 'myface.jpeg'
  });

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const data = await CMSStorage.getAbout();
        setAboutData(data);
      } catch (error) {
        console.error('Error fetching about data:', error);
        // Fallback to default data
        setAboutData({
          description: 'Loading...',
          imageURL: 'myface.jpeg'
        });
      }
    };
    
    fetchAboutData();
  }, []);

  return (
    <div>
      <img src={Pink} alt="decorative spin animation" className='absolute top-4 right-4 w-6 h-6 sm:w-8 sm:h-8 motion-safe:animate-spin z-10'/>
      <div className="mt-8 sm:mt-12 lg:mt-16 py-6 px-4 sm:py-12 sm:px-6 lg:py-12 lg:px-12 max-w-7xl mx-auto">
        <div className="hero-content flex-col gap-6 lg:gap-10 lg:flex-row-reverse">
          <div className="flex-1 md:grid md:place-items-center">
            <img 
              src={aboutData.imageURL.startsWith('http') ? aboutData.imageURL : (aboutData.imageURL.startsWith('/') ? aboutData.imageURL : `/src/assets/${aboutData.imageURL}`)}
              className="w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-80 lg:w-full lg:h-96            object-cover rounded-2xl shadow-2xl mask mask-hexagon-2            mx-auto md:mx-0" 
              alt="Valentino Jehaut"
              onError={(e) => { e.currentTarget.src = Me; }}
            />
          </div>
          <div className="flex-1 text-left">
            <div className="max-w-2xl">
              <h1 className="mb-6 sm:mb-8 lg:mb-10 text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-bold underline underline-offset-4 sm:underline-offset-8 decoration-wavy decoration-info">
                About Me
              </h1>
              <div className="text-sm sm:text-base md:text-md lg:text-xl font-regular mb-4 sm:mb-6 leading-relaxed">
                {aboutData.description.split('\n').map((paragraph, index) => (
                  paragraph.trim() && (
                    <p key={index} className="mb-4">
                      {paragraph}
                    </p>
                  )
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link 
                  className="btn btn-info btn-sm sm:btn-md shadow-xl gap-2" 
                  activeClass="active" 
                  to="portfolio" 
                  spy={true} 
                  smooth={true} 
                  offset={-100} 
                  duration={500}
                >
                  <img src={Down} alt='Down' className='w-4 h-4 sm:w-5 sm:h-5'/>
                  See My Portfolios!
                </Link>
                <a 
                  href="/Valen-Jehaut.pdf" 
                  target="_self" 
                  rel="noreferrer" 
                  className="btn btn-outline btn-warning btn-sm sm:btn-md shadow-xl gap-2"
                >
                  <img src={Download} alt='Download' className='w-4 h-4 sm:w-5 sm:h-5'/>
                  Download CV
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 sm:mt-12 lg:mt-16 bg-blue-800 rounded-2xl py-6 px-4 sm:py-12 sm:px-6 lg:py-12 lg:px-12 max-w-7xl mx-auto">
        <Skills/>
      </div>
    </div>
  )
}

export default AboutMe
