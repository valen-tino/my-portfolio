import React, { useEffect, useState } from 'react'
import LogoCard from './logocard'
import { CMSStorage, TechTool } from '../../cms/apiStorage'

const Skills = () => {
  const [techTools, setTechTools] = useState<TechTool[]>([]);

  useEffect(() => {
    const fetchTechTools = async () => {
      try {
        const data = await CMSStorage.getTechTools();
        setTechTools(data);
      } catch (error) {
        console.error('Error fetching tech tools:', error);
        setTechTools([]);
      }
    };
    
    fetchTechTools();
  }, []);

  // Split tech tools into 2 rows
  const splitIntoRows = (tools: TechTool[]) => {
    const midpoint = Math.ceil(tools.length / 2);
    return [
      tools.slice(0, midpoint),
      tools.slice(midpoint)
    ];
  };

  const [row1, row2] = splitIntoRows(techTools);

  // Duplicate items for seamless infinite loop
  const duplicatedRow1 = [...row1, ...row1, ...row1];
  const duplicatedRow2 = [...row2, ...row2, ...row2];

  return (
    <div className="py-16">
      <h3 className="mb-20 text-3xl md:text-6xl font-bold text-white text-center">
        Tools that i'm currently using...
      </h3>
      
      <div className="relative overflow-hidden py-12 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto bg-white/10 backdrop-blur-sm rounded-2xl">
        {/* Row 1 - Moving Right to Left */}
        <div className="flex animate-marquee-left mb-8">
          {duplicatedRow1.map((item, index) => (
            <div key={`row1-${index}`} className="flex-shrink-0 mx-6">
              <LogoCard title={item.title} imageURL={item.imageURL} kunci={index} />
            </div>
          ))}
        </div>

        {/* Row 2 - Moving Left to Right */}
        <div className="flex animate-marquee-right">
          {duplicatedRow2.map((item, index) => (
            <div key={`row2-${index}`} className="flex-shrink-0 mx-6">
              <LogoCard title={item.title} imageURL={item.imageURL} kunci={index + row1.length} />
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

export default Skills
