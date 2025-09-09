import React, { useEffect, useState } from 'react';
import { CMSStorage, EducationItem } from '../../cms/apiStorage';
import EducationCard from './educationcard';
import HorizontalScrollContainer from '../../hook/useHorizontalScroll';

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
    <section className='py-20 bg-base-100'>
      {/* Static Header */}
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          My Educational <span className='text-yellow-600'>Background</span>
        </h2>
        <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
          Here are some of the <span className='text-yellow-600'>institutions</span> and <span className='text-secondary'>courses</span> that have shaped my knowledge and skills.
        </p>
      </div>

      {/* Horizontal Scroll Section */}
      {educationItems.length > 0 ? (
        <HorizontalScrollContainer>
          <div className="flex gap-8 items-center h-full px-32">
            {educationItems.map(item => (
              <div key={item.id} className="flex-none w-80">
                <EducationCard item={item} />
              </div>
            ))}
          </div>
        </HorizontalScrollContainer>
      ) : (
        // Empty State
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
    </section>
  );
};

export default EducationSection;
