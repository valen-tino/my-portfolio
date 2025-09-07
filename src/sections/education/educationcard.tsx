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
    <div className="card card-sm bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 w-full max-w-sm">
      <div className="card-body">
        <p className="card-title text-lg font-bold">{item.title}</p>
        <p className="text-blue-600 font-medium mb-1">{item.institution}</p>
        <p className="text-gray-500 text-sm mb-3">
          {formatDate(item.startDate)} - {formatDate(item.endDate)}
        </p>
        {item.description && (
          <p className="text-base-content/70 text-sm mb-4">{item.description}</p>
        )}
        {item.link && (
          <div className="card-actions justify-end">
            <a href={item.link} target="_blank" rel="noreferrer" className="btn btn-info btn-sm">
              View Certificate
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default EducationCard;
