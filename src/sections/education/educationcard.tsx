import React from 'react';
import { EducationItem } from '../../cms/apiStorage';

interface Props {
  item: EducationItem;
}

const EducationCard: React.FC<Props> = ({ item }) => {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Present';
    // Handle both full date and month-year formats
    const date = dateString.includes('-') && dateString.split('-').length === 2 
      ? new Date(dateString + '-01')  // Add day for month-year format (YYYY-MM)
      : new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="max-w-sm p-6 bg-base-100 border border-base-200 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 w-full h-full text-center">
      {/* Title with Link */}
      <div className="mb-4">
        {item.link ? (
          <a href={item.link} target="_blank" rel="noreferrer">
            <h5 className="mb-2 text-xl font-semibold tracking-tight hover:text-info transition-colors text-secondary">
              {item.title}
            </h5>
          </a>
        ) : (
          <h5 className="mb-2 text-xl font-semibold tracking-tight text-info">
            {item.title}
          </h5>
        )}
      </div>

      {/* Institution Badge */}
      <div className="mb-3 flex justify-center">
        <div className="badge badge-outline badge-sm">
          {item.institution}
        </div>
      </div>

      {/* Date Range */}
      <div className="mb-3 flex items-center justify-center gap-2 text-base-content/60">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <span className="text-sm font-medium">
          {formatDate(item.startDate)} - {formatDate(item.endDate)}
        </span>
      </div>

      {/* Description */}
      {item.description && (
        <p className="mb-4 font-normal text-base-content/70 text-sm leading-relaxed">
          {item.description}
        </p>
      )}

      {/* Link Action */}
      {item.link && (
        <div className="flex justify-center">
          <a 
            href={item.link} 
            target="_blank" 
            rel="noreferrer" 
            className="inline-flex font-medium items-center text-info hover:underline transition-all duration-200"
          >
            View Certificate
            <svg 
              className="w-3 h-3 ms-2.5" 
              aria-hidden="true" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 18 18"
            >
              <path 
                stroke="currentColor" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M15 11v4.833A1.166 1.166 0 0 1 13.833 17H2.167A1.167 1.167 0 0 1 1 15.833V4.167A1.166 1.166 0 0 1 2.167 3h4.618m4.447-2H17v5.768M9.111 8.889l7.778-7.778"
              />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
};

export default EducationCard;
