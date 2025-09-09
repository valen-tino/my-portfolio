import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import HorizontalScrollContainer from '../../hook/useHorizontalScroll';

interface ExperienceData {
  id: string;
  title: string;
  status: 'Current' | 'Past' | 'Contract' | 'Internship' | 'Freelance' | 'Volunteer';
  companyName: string;
  startDate: string;
  endDate?: string;
  duration?: string; // Keep for backward compatibility
  description: string;
  logoURL: string;
  order?: number;
}

const ExperienceSection: React.FC = () => {
  const [experiences, setExperiences] = useState<ExperienceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadExperiences();
  }, []);

  const loadExperiences = async () => {
    try {
      setLoading(true);
      const response = await apiService.getExperiences(true); // Only published experiences
      if (response.success) {
        setExperiences(response.data);
      } else {
        setError('Failed to load experiences');
      }
    } catch (error) {
      console.error('Error loading experiences:', error);
      setError('Failed to load experiences');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Current': 'badge-success',
      'Past': 'badge-neutral',
      'Contract': 'badge-info',
      'Internship': 'badge-warning',
      'Freelance': 'badge-accent',
      'Volunteer': 'badge-secondary'
    };
    return colors[status as keyof typeof colors] || 'badge-neutral';
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Present';
    // Handle both full date and month-year formats
    const date = dateString.includes('-') && dateString.split('-').length === 2 
      ? new Date(dateString + '-01')  // Add day for month-year format (YYYY-MM)
      : new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <section className="py-20 bg-base-100" id="experience">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <span className="loading loading-spinner loading-lg"></span>
            <p className="mt-4 text-base-content/70">Loading experiences...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || experiences.length === 0) {
    return null; // Don't show the section if there are no experiences
  }

  return (
    <section className="py-20 bg-base-200/50" id="experience">
      {/* Static Header */}
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          My
          <span className="text-info"> Experiences</span>
        </h2>
        <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
          My journey through various roles and organizations, building expertise and making impact
        </p>
      </div>

      {/* Horizontal Scroll Section */}
      <HorizontalScrollContainer>
        <div className="flex gap-8 items-center h-full px-32">
          {experiences.map((experience) => (
            <div key={experience.id} className="flex-none w-96">
              <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 h-full">
                <div className="card-body p-6">
                  {/* Header with Logo and Status */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0">
                      {experience.logoURL ? (
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-base-200 border border-base-300">
                          <img
                            src={experience.logoURL}
                            alt={`${experience.companyName} logo`}
                            className="w-full h-full object-contain"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-base-200 border border-base-300 flex items-center justify-center">
                          <svg className="w-8 h-8 text-base-content/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="flex-grow">
                      <div className="flex flex-col gap-2 mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-base-content leading-tight">{experience.title}</h3>
                          <p className="text-info font-semibold">{experience.companyName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`badge ${getStatusColor(experience.status)} badge-sm`}>
                            {experience.status}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-base-content/60 font-medium mb-3">
                        {formatDate(experience.startDate)} - {formatDate(experience.endDate)}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="prose prose-sm max-w-none flex-grow">
                    <p className="text-base-content/80 leading-relaxed">
                      {experience.description}
                    </p>
                  </div>

                  {/* Current badge for active positions */}
                  {experience.status === 'Current' && (
                    <div className="mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                        <span className="text-sm text-success font-medium">Currently Active</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </HorizontalScrollContainer>
    </section>
  );
};

export default ExperienceSection;
