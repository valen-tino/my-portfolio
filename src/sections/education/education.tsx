import React, { useEffect, useState } from 'react';
import { CMSStorage, EducationItem } from '../../cms/apiStorage';
import EducationCard from './educationcard';

const EducationSection: React.FC = () => {
  const [educationItems, setEducationItems] = useState<EducationItem[]>([]);

  useEffect(() => {
    const fetchEducationData = async () => {
      try {
        const data = await CMSStorage.getEducation();
        // Sort education items by date (most recent first)
        const sortedData = [...data].sort((a, b) => {
          // Get dates for comparison, using startDate as fallback for endDate
          const dateA = a.endDate || a.startDate;
          const dateB = b.endDate || b.startDate;
          // Compare dates in descending order (newest first)
          return dateB.localeCompare(dateA);
        });
        setEducationItems(sortedData);
      } catch (error) {
        console.error('Error fetching education data:', error);
        setEducationItems([]);
      }
    };
    
    fetchEducationData();
  }, []);

  return (
    <div className='mt-8 rounded-2xl py-8 px-4 sm:py-12 sm:px-8 lg:py-8 lg:px-2 max-w-7xl mx-auto '>
      <div className="text-center">
        <h2 className="mt-8 mb-4 text-3xl md:text-6xl font-bold text-gray-900 text-center">
          My Educational Background
        </h2>
        <p className="text-xl text-base-content/70 max-w-2xl mx-auto mb-4">
          Here are some of the <span className='text-accent'>institutions</span> and <span className='text-secondary'>courses</span> that have shaped my knowledge and skills.
          </p>
        
        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {educationItems.map(item => (
            <div key={item.id} className="flex">
              <EducationCard item={item} />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {educationItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 mb-4 text-base-content/30">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-base-content/70 mb-2">
              No Education Records
            </h3>
            <p className="text-base-content/50 text-sm">
              Education information will appear here when available.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EducationSection;
