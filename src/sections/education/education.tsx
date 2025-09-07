import React, { useEffect, useState } from 'react';
import { CMSStorage, EducationItem } from '../../cms/apiStorage';
import EducationCard from './educationcard';

const EducationSection: React.FC = () => {
  const [educationItems, setEducationItems] = useState<EducationItem[]>([]);

  useEffect(() => {
    const fetchEducationData = async () => {
      try {
        const data = await CMSStorage.getEducation();
        setEducationItems(data);
      } catch (error) {
        console.error('Error fetching education data:', error);
        setEducationItems([]);
      }
    };
    
    fetchEducationData();
  }, []);

  return (
    <div className='mt-8 rounded-2xl py-8 px-4 sm:py-12 sm:px-8 lg:py-16 lg:px-12 max-w-7xl mx-auto'>
      <div className="text-center">
        <h3 className="mt-8 mb-12 text-3xl md:text-6xl font-bold text-gray-900 text-center">
          My Educational <span className='text-info'>Background</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 justify-items-center">
          {educationItems.map(item => (
            <EducationCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EducationSection;
