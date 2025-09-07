import React, { useState, useEffect } from 'react';
import CMSLayout from '../components/CMSLayout';
import { CMSStorage, Experience } from '../apiStorage';

const ExperienceManagement: React.FC = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);

  const statusOptions = [
    { value: 'Current', label: 'Current', color: 'badge-success' },
    { value: 'Past', label: 'Past', color: 'badge-neutral' },
    { value: 'Contract', label: 'Contract', color: 'badge-info' },
    { value: 'Internship', label: 'Internship', color: 'badge-warning' },
    { value: 'Freelance', label: 'Freelance', color: 'badge-accent' },
    { value: 'Volunteer', label: 'Volunteer', color: 'badge-secondary' }
  ];

  useEffect(() => {
    loadExperiences();
  }, []);

  const loadExperiences = async () => {
    try {
      const items = await CMSStorage.getExperiences();
      setExperiences(items);
    } catch (error) {
      console.error('Error loading experiences:', error);
      setMessage({
        type: 'error',
        text: 'Failed to load experiences. Please refresh the page.'
      });
    }
  };

  const saveExperience = async (experience: Experience, isNew: boolean = false) => {
    setLoading(true);
    try {
      let savedExperience;
      if (isNew) {
        savedExperience = await CMSStorage.addExperience(experience);
        setExperiences(prev => [savedExperience, ...prev]);
      } else {
        savedExperience = await CMSStorage.updateExperience(experience.id, experience);
        setExperiences(prev => prev.map(exp => exp.id === experience.id ? savedExperience : exp));
      }
      setMessage({
        type: 'success',
        text: `Experience ${isNew ? 'added' : 'updated'} successfully!`
      });
      return savedExperience;
    } catch (error) {
      console.error('Save error:', error);
      setMessage({
        type: 'error',
        text: `Failed to ${isNew ? 'add' : 'update'} experience. Please try again.`
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    const newExperience: Experience = {
      id: 'temp-new',
      title: '',
      status: 'Past',
      companyName: '',
      startDate: '',
      endDate: '',
      duration: '', // Keep for backward compatibility
      description: '',
      logoURL: '',
      order: 0,
      isPublished: true
    };
    setEditingExperience(newExperience);
    setIsAddingNew(true);
  };

  const handleEdit = (experience: Experience) => {
    setEditingExperience(experience);
    setIsAddingNew(false);
  };

  const handleSave = async () => {
    if (!editingExperience || !editingExperience.title.trim() || 
        !editingExperience.companyName.trim() || !editingExperience.startDate.trim() || 
        !editingExperience.description.trim()) {
      setMessage({
        type: 'error',
        text: 'Please fill in all required fields (title, company, start date, description).'
      });
      return;
    }

    try {
      await saveExperience(editingExperience, isAddingNew);
      setEditingExperience(null);
      setIsAddingNew(false);
    } catch (error) {
      // Error already handled in saveExperience
    }
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Are you sure you want to delete this experience?')) {
      try {
        await CMSStorage.deleteExperience(id);
        setExperiences(prev => prev.filter(exp => exp.id !== id));
        setMessage({
          type: 'success',
          text: 'Experience deleted successfully!'
        });
      } catch (error) {
        console.error('Delete error:', error);
        setMessage({
          type: 'error',
          text: 'Failed to delete experience. Please try again.'
        });
      }
    }
  };

  const handleCancel = () => {
    setEditingExperience(null);
    setIsAddingNew(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingExperience) {
      setLogoUploading(true);
      try {
        const uploadResult = await CMSStorage.uploadExperienceLogo(file);
        setEditingExperience({
          ...editingExperience,
          logoURL: uploadResult.imageURL,
          logoCloudinaryId: uploadResult.imageCloudinaryId
        });
        setMessage({
          type: 'success',
          text: 'Logo uploaded successfully!'
        });
      } catch (error) {
        console.error('Logo upload error:', error);
        setMessage({
          type: 'error',
          text: 'Failed to upload logo. Please try again.'
        });
      } finally {
        setLogoUploading(false);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.color : 'badge-neutral';
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Present';
    // Handle both full date and month-year formats
    const date = dateString.includes('-') && dateString.split('-').length === 2 
      ? new Date(dateString + '-01')  // Add day for month-year format (YYYY-MM)
      : new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <CMSLayout>
      <div className="container mx-auto max-w-7xl p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Experience Management</h1>
            <p className="text-base-content/70 mt-2">Manage your work and other professional experiences</p>
          </div>
          <button
            onClick={handleAdd}
            className="btn btn-primary"
            disabled={editingExperience !== null}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Experience
          </button>
        </div>

        {/* Messages */}
        {message.text && (
          <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d={message.type === 'success' ? 
                  "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" :
                  "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                } 
              />
            </svg>
            <span>{message.text}</span>
          </div>
        )}

        {/* Edit/Add Form */}
        {editingExperience && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-xl mb-6">
                {isAddingNew ? 'Add New Experience' : 'Edit Experience'}
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Job Title *</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      placeholder="e.g., Senior Software Developer"
                      value={editingExperience.title}
                      onChange={(e) => setEditingExperience({ 
                        ...editingExperience, 
                        title: e.target.value 
                      })}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Company Name *</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      placeholder="e.g., Tech Company Inc."
                      value={editingExperience.companyName}
                      onChange={(e) => setEditingExperience({ 
                        ...editingExperience, 
                        companyName: e.target.value 
                      })}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Status *</span>
                    </label>
                    <select
                      className="select select-bordered w-full"
                      value={editingExperience.status}
                      onChange={(e) => setEditingExperience({ 
                        ...editingExperience, 
                        status: e.target.value as Experience['status']
                      })}
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">Start Date *</span>
                      </label>
                      <input
                        type="month"
                        className="input input-bordered w-full"
                        value={editingExperience.startDate}
                        onChange={(e) => setEditingExperience({ 
                          ...editingExperience, 
                          startDate: e.target.value 
                        })}
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">End Date</span>
                      </label>
                      <input
                        type="month"
                        className="input input-bordered w-full"
                        value={editingExperience.endDate || ''}
                        onChange={(e) => setEditingExperience({ 
                          ...editingExperience, 
                          endDate: e.target.value 
                        })}
                      />
                      <label className="label">
                        <span className="label-text-alt">Leave empty if ongoing</span>
                      </label>
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Company Logo</span>
                    </label>
                    
                    {editingExperience.logoURL && (
                      <div className="mb-4">
                        <img
                          src={editingExperience.logoURL}
                          alt="Company logo preview"
                          className="w-20 h-20 object-contain rounded-lg border border-base-300 bg-base-200"
                        />
                        <p className="text-sm text-base-content/70 mt-1">Current logo</p>
                      </div>
                    )}
                    
                    <input
                      type="file"
                      accept="image/*"
                      className={`file-input file-input-bordered w-full ${logoUploading ? 'loading' : ''}`}
                      onChange={handleLogoUpload}
                      disabled={logoUploading}
                    />
                    <label className="label">
                      <span className="label-text-alt">Upload company logo (PNG, JPG, GIF)</span>
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Order</span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered w-full"
                      placeholder="0"
                      value={editingExperience.order || 0}
                      onChange={(e) => setEditingExperience({ 
                        ...editingExperience, 
                        order: parseInt(e.target.value) || 0
                      })}
                    />
                    <label className="label">
                      <span className="label-text-alt">Lower numbers appear first</span>
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text font-medium">Published</span>
                      <input
                        type="checkbox"
                        className="toggle toggle-success"
                        checked={editingExperience.isPublished}
                        onChange={(e) => setEditingExperience({ 
                          ...editingExperience, 
                          isPublished: e.target.checked 
                        })}
                      />
                    </label>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Description *</span>
                    </label>
                    <textarea
                      rows={12}
                      className="textarea textarea-bordered w-full resize-none"
                      placeholder="Describe your role, responsibilities, achievements, and key contributions. Be specific about technologies used and impact made."
                      value={editingExperience.description}
                      onChange={(e) => setEditingExperience({ 
                        ...editingExperience, 
                        description: e.target.value 
                      })}
                    />
                    <label className="label">
                      <span className="label-text-alt">
                        {editingExperience.description.length}/1000 characters
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="card-actions justify-end mt-6 gap-3">
                <button
                  onClick={handleCancel}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading || logoUploading}
                  className={`btn btn-primary ${loading ? 'loading' : ''}`}
                >
                  {loading ? 'Saving...' : (isAddingNew ? 'Add Experience' : 'Save Changes')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Experience List */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-xl mb-4">
              Your Experiences ({experiences.length})
            </h2>
            
            {experiences.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-base-content/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6z" />
                </svg>
                <p className="text-base-content/70">No experiences added yet.</p>
                <button
                  onClick={handleAdd}
                  className="btn btn-primary mt-4"
                >
                  Add Your First Experience
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {experiences.map((experience) => (
                  <div
                    key={experience.id}
                    className="card bg-base-200/50 border border-base-300 hover:shadow-md transition-shadow"
                  >
                    <div className="card-body p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                          {experience.logoURL ? (
                            <img
                              src={experience.logoURL}
                              alt={`${experience.companyName} logo`}
                              className="w-16 h-16 object-contain rounded-lg border border-base-300 bg-base-100"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-base-300 rounded-lg flex items-center justify-center">
                              <svg className="w-8 h-8 text-base-content/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-grow">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                            <div>
                              <h3 className="text-lg font-semibold">{experience.title}</h3>
                              <p className="text-base-content/70 font-medium">{experience.companyName}</p>
                              <p className="text-sm text-base-content/60">
                                {formatDate(experience.startDate)} - {formatDate(experience.endDate)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`badge ${getStatusBadge(experience.status)}`}>
                                {experience.status}
                              </div>
                              {!experience.isPublished && (
                                <div className="badge badge-outline">Draft</div>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm text-base-content/80 line-clamp-3 mb-4">
                            {experience.description}
                          </p>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(experience)}
                              className="btn btn-sm btn-outline"
                              disabled={editingExperience !== null}
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(experience.id)}
                              className="btn btn-sm btn-outline btn-error"
                              disabled={editingExperience !== null}
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="alert alert-info">
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-bold">💼 Experience Management Tips</h3>
            <div className="text-sm mt-1 space-y-1">
              <p>• Add all your work experiences, internships, freelance, and volunteer work</p>
              <p>• Use clear, specific job titles and company names</p>
              <p>• Include quantifiable achievements and impact in descriptions</p>
              <p>• Upload company logos for a professional appearance</p>
              <p>• Set order to control display sequence (lower numbers first)</p>
            </div>
          </div>
        </div>
      </div>
    </CMSLayout>
  );
};

export default ExperienceManagement;
