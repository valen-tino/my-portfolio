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
    <div className="card bg-base-100 shadow-lg hover:shadow-2xl transition-all duration-300 border border-base-200 hover:border-info/20 w-full h-full">
      <div className="card-body p-6">
        {/* Header */}
        <div className="flex flex-col mb-4">
          <h3 className="card-title text-lg font-bold text-base-content mb-2 line-clamp-2">
            {item.title}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <div className="badge badge-info badge-outline text-xs">
              {item.institution}
            </div>
          </div>
          <div className="flex items-center gap-2 text-base-content/60">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium">
              {formatDate(item.startDate)} - {formatDate(item.endDate)}
            </span>
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <div className="flex-grow">
            <p className="text-base-content/70 text-sm leading-relaxed">
              {item.description}
            </p>
          </div>
        )}

        {/* Actions */}
        {item.link && (
          <div className="card-actions justify-end mt-4 pt-4 border-t border-base-200">
            <a 
              href={item.link} 
              target="_blank" 
              rel="noreferrer" 
              className="btn btn-info btn-sm gap-2 hover:btn-info-focus"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View Certificate
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default EducationCard;
