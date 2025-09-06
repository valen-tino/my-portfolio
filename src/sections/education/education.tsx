import React from 'react';
import { education } from '../../cms/education';

const EducationSection: React.FC = () => {
  return (
    <section id='education'>
      <h1 className="mb-10 text-5xl md:text-8xl font-bold underline underline-offset-8 decoration-wavy text-gray-100 decoration-red-400">Education & Certificates</h1>
      <div className="w-fit mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {education.map(item => (
          <div key={item.id} className="card bg-base-100 shadow-xl p-4">
            <h2 className="card-title">{item.title}</h2>
            <p>{item.institution}</p>
            {item.link && (
              <div className="card-actions justify-end">
                <a href={item.link} target="_blank" rel="noreferrer" className="btn btn-primary">View Certificate</a>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default EducationSection;
