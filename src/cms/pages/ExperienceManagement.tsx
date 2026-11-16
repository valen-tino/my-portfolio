import React, { useState, useEffect } from 'react';
import CMSLayout from '../components/CMSLayout';
import { CMSStorage, Experience } from '../apiStorage';
import WYSIWYGEditor from '../components/WYSIWYGEditor';
import { formatMonthYear } from '../../utils/dateFormat';
import {
  CMSStatusBanner,
  CMSFieldError,
  getCMSInputErrorClasses,
  type CMSMessage,
} from '../components/CMSStatusBanner';
import { parseCMSError, stripHtmlContent } from '../utils/errorUtils';

const MAX_EXPERIENCE_DESCRIPTION_LENGTH = 20000;

const ExperienceManagement: React.FC = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [message, setMessage] = useState<CMSMessage>({ type: '', text: '' });
  const [loadFailed, setLoadFailed] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);

  const statusOptions = [
    { value: 'Current', label: 'Current', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    { value: 'Past', label: 'Past', color: 'bg-gray-100 text-gray-800 border-gray-300' },
    { value: 'Contract', label: 'Contract', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { value: 'Internship', label: 'Internship', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    { value: 'Freelance', label: 'Freelance', color: 'bg-teal-100 text-teal-800 border-teal-200' },
    { value: 'Volunteer', label: 'Volunteer', color: 'bg-purple-100 text-purple-800 border-purple-200' }
  ];

  useEffect(() => {
    loadExperiences();
  }, []);

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const loadExperiences = async () => {
    try {
      setLoadFailed(false);
      const items = await CMSStorage.getExperiences();
      setExperiences(items);
    } catch (error) {
      console.error('Error loading experiences:', error);
      const parsed = parseCMSError(error, 'Failed to load experiences. Please refresh the page.');
      setLoadFailed(true);
      setMessage({
        type: 'error',
        text: parsed.message,
        details: parsed.details,
      });
    }
  };

  const saveExperience = async (experience: Experience, isNew: boolean = false): Promise<Experience> => {
    setLoading(true);
    try {
      let savedExperience: Experience;
      if (isNew) {
        savedExperience = await CMSStorage.addExperience(experience);
        setExperiences(prev => [savedExperience, ...prev]);
      } else {
        savedExperience = await CMSStorage.updateExperience(experience.id, experience);
        setExperiences(prev => prev.map(exp => exp.id === experience.id ? savedExperience : exp));
      }
      setFieldErrors({});
      setLoadFailed(false);
      setMessage({
        type: 'success',
        text: `Experience ${isNew ? 'added' : 'updated'} successfully!`
      });
      return savedExperience;
    } catch (error) {
      console.error('Save error:', error);
      const parsed = parseCMSError(
        error,
        `Failed to ${isNew ? 'add' : 'update'} experience. Please try again.`
      );
      if (Object.keys(parsed.fieldErrors).length > 0) {
        setFieldErrors((prev) => ({ ...prev, ...parsed.fieldErrors }));
      }
      setMessage({
        type: 'error',
        text: parsed.message,
        details: parsed.details,
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
    setFieldErrors({});
    setMessage({ type: '', text: '' });
  };

  const handleEdit = (experience: Experience) => {
    setEditingExperience(experience);
    setIsAddingNew(false);
    setFieldErrors({});
    setMessage({ type: '', text: '' });
  };

  const handleSave = async () => {
    if (!editingExperience) return;

    const nextFieldErrors: Record<string, string> = {};
    if (!editingExperience.title.trim()) {
      nextFieldErrors.title = 'Job title is required.';
    } else if (editingExperience.title.trim().length > 200) {
      nextFieldErrors.title = 'Job title cannot exceed 200 characters.';
    }

    if (!editingExperience.companyName.trim()) {
      nextFieldErrors.companyName = 'Company name is required.';
    } else if (editingExperience.companyName.trim().length > 200) {
      nextFieldErrors.companyName = 'Company name cannot exceed 200 characters.';
    }

    if (!editingExperience.startDate.trim()) {
      nextFieldErrors.startDate = 'Start date is required.';
    }

    const plainDesc = stripHtmlContent(editingExperience.description);
    if (!plainDesc) {
      nextFieldErrors.description = 'Description is required.';
    } else if (editingExperience.description.length > MAX_EXPERIENCE_DESCRIPTION_LENGTH) {
      nextFieldErrors.description = `Description cannot exceed ${MAX_EXPERIENCE_DESCRIPTION_LENGTH.toLocaleString()} characters.`;
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setMessage({
        type: 'error',
        text: 'Please fix the highlighted validation errors before saving.',
      });
      return;
    }

    setFieldErrors({});
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
        const parsed = parseCMSError(error, 'Failed to delete experience. Please try again.');
        setMessage({
          type: 'error',
          text: parsed.message,
          details: parsed.details,
        });
      }
    }
  };

  const handleCancel = () => {
    setEditingExperience(null);
    setIsAddingNew(false);
    setFieldErrors({});
    setMessage({ type: '', text: '' });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingExperience) {
      setLogoUploading(true);
      clearFieldError('logoURL');
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
        const parsed = parseCMSError(error, 'Failed to upload logo. Please try again.');
        setFieldErrors((prev) => ({ ...prev, logoURL: parsed.message }));
        setMessage({
          type: 'error',
          text: parsed.message,
          details: parsed.details,
        });
      } finally {
        setLogoUploading(false);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.color : 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Present';
    return formatMonthYear(dateString) || dateString;
  };

  return (
    <CMSLayout>
      <div className="container mx-auto max-w-7xl p-4 space-y-6 text-gray-900">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Experience Management</h1>
            <p className="text-gray-600 mt-2">Manage your work and other professional experiences</p>
          </div>
          <button
            onClick={handleAdd}
            className="btn btn-primary text-white"
            disabled={editingExperience !== null}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Experience
          </button>
        </div>

        {/* Messages when form is closed */}
        {!editingExperience && (
          <CMSStatusBanner
            message={message}
            onDismiss={() => {
              setMessage({ type: '', text: '' });
              setLoadFailed(false);
            }}
            onRetry={loadFailed ? loadExperiences : undefined}
          />
        )}

        {/* Edit/Add Form */}
        {editingExperience && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {isAddingNew ? 'Add New Experience' : 'Edit Experience'}
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-gray-700">Job Title *</span>
                    </label>
                    <input
                      type="text"
                      aria-invalid={Boolean(fieldErrors.title)}
                      className={`input input-bordered bg-white text-gray-900 placeholder:text-gray-400 w-full ${getCMSInputErrorClasses(Boolean(fieldErrors.title))}`}
                      placeholder="e.g., Senior Software Developer"
                      value={editingExperience.title}
                      onChange={(e) => {
                        clearFieldError('title');
                        setEditingExperience({ 
                          ...editingExperience, 
                          title: e.target.value 
                        });
                      }}
                    />
                    <CMSFieldError error={fieldErrors.title} />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-gray-700">Company Name *</span>
                    </label>
                    <input
                      type="text"
                      aria-invalid={Boolean(fieldErrors.companyName)}
                      className={`input input-bordered bg-white text-gray-900 placeholder:text-gray-400 w-full ${getCMSInputErrorClasses(Boolean(fieldErrors.companyName))}`}
                      placeholder="e.g., Tech Company Inc."
                      value={editingExperience.companyName}
                      onChange={(e) => {
                        clearFieldError('companyName');
                        setEditingExperience({ 
                          ...editingExperience, 
                          companyName: e.target.value 
                        });
                      }}
                    />
                    <CMSFieldError error={fieldErrors.companyName} />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-gray-700">Status *</span>
                    </label>
                    <select
                      className="select select-bordered bg-white text-gray-900 border-gray-300 w-full"
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
                        <span className="label-text font-medium text-gray-700">Start Date *</span>
                      </label>
                      <input
                        type="month"
                        aria-invalid={Boolean(fieldErrors.startDate)}
                        className={`input input-bordered bg-white text-gray-900 w-full ${getCMSInputErrorClasses(Boolean(fieldErrors.startDate))}`}
                        value={editingExperience.startDate}
                        onChange={(e) => {
                          clearFieldError('startDate');
                          setEditingExperience({ 
                            ...editingExperience, 
                            startDate: e.target.value 
                          });
                        }}
                      />
                      <CMSFieldError error={fieldErrors.startDate} />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium text-gray-700">End Date</span>
                      </label>
                      <input
                        type="month"
                        className="input input-bordered bg-white text-gray-900 border-gray-300 w-full"
                        value={editingExperience.endDate || ''}
                        onChange={(e) => setEditingExperience({ 
                          ...editingExperience, 
                          endDate: e.target.value 
                        })}
                      />
                      <label className="label">
                        <span className="label-text-alt text-gray-500">Leave empty if ongoing</span>
                      </label>
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-gray-700">Company Logo</span>
                    </label>
                    
                    {editingExperience.logoURL && (
                      <div className="mb-4">
                        <img
                          src={editingExperience.logoURL}
                          alt="Company logo preview"
                          className="w-20 h-20 object-contain rounded-lg border border-gray-200 bg-gray-50"
                        />
                        <p className="text-sm text-gray-600 mt-1">Current logo</p>
                      </div>
                    )}
                    
                    <input
                      type="file"
                      accept="image/*"
                      className={`file-input file-input-bordered bg-white text-gray-800 w-full ${getCMSInputErrorClasses(Boolean(fieldErrors.logoURL))} ${logoUploading ? 'loading' : ''}`}
                      onChange={handleLogoUpload}
                      disabled={logoUploading}
                    />
                    <CMSFieldError error={fieldErrors.logoURL} />
                    <label className="label">
                      <span className="label-text-alt text-gray-500">Upload company logo (PNG, JPG, GIF)</span>
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-gray-700">Order</span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered bg-white text-gray-900 border-gray-300 w-full"
                      placeholder="0"
                      value={editingExperience.order || 0}
                      onChange={(e) => setEditingExperience({ 
                        ...editingExperience, 
                        order: parseInt(e.target.value) || 0
                      })}
                    />
                    <label className="label">
                      <span className="label-text-alt text-gray-500">Lower numbers appear first</span>
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text font-medium text-gray-700">Published</span>
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
                      <span className="label-text font-medium text-gray-700">Description *</span>
                    </label>
                    <div
                      className={`rounded-lg ${
                        fieldErrors.description ? 'ring-2 ring-red-500 border border-red-500' : ''
                      }`}
                    >
                      <WYSIWYGEditor
                        value={editingExperience.description}
                        onChange={(html) => {
                          clearFieldError('description');
                          setEditingExperience({ 
                            ...editingExperience, 
                            description: html 
                          });
                        }}
                        placeholder="Describe your role, responsibilities, achievements, and key contributions. Be specific about technologies used and impact made."
                        enableSectionPresets={false}
                        enableGalleries={false}
                        minHeight="220px"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <CMSFieldError error={fieldErrors.description} />
                      <span
                        className={`text-xs ml-auto ${
                          editingExperience.description.length > MAX_EXPERIENCE_DESCRIPTION_LENGTH
                            ? 'text-red-600 font-semibold'
                            : 'text-gray-500'
                        }`}
                      >
                        {(editingExperience.description || '').length.toLocaleString()} /{' '}
                        {MAX_EXPERIENCE_DESCRIPTION_LENGTH.toLocaleString()} characters
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <CMSStatusBanner
                message={message}
                onDismiss={() => setMessage({ type: '', text: '' })}
                className="mt-6"
              />

              <div className="flex justify-end mt-6 gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading || logoUploading}
                  className={`btn btn-primary text-white ${loading ? 'loading' : ''}`}
                >
                  {loading ? 'Saving...' : (isAddingNew ? 'Add Experience' : 'Save Changes')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Experience List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Your Experiences ({experiences.length})
            </h2>
            
            {experiences.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6z" />
                </svg>
                <p className="text-gray-600">No experiences added yet.</p>
                <button
                  onClick={handleAdd}
                  className="btn btn-primary text-white mt-4"
                >
                  Add Your First Experience
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {experiences.map((experience) => (
                  <div
                    key={experience.id}
                    className="rounded-xl bg-gray-50/70 border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                          {experience.logoURL ? (
                            <img
                              src={experience.logoURL}
                              alt={`${experience.companyName} logo`}
                              className="w-16 h-16 object-contain rounded-lg border border-gray-200 bg-white p-1"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-grow">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{experience.title}</h3>
                              <p className="text-gray-700 font-medium">{experience.companyName}</p>
                              <p className="text-sm text-gray-500">
                                {formatDate(experience.startDate)} - {formatDate(experience.endDate)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(experience.status)}`}>
                                {experience.status}
                              </span>
                              {!experience.isPublished && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-gray-700 border border-gray-300">
                                  Draft
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-700 line-clamp-3 mb-4">
                            {experience.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}
                          </p>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(experience)}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50"
                              disabled={editingExperience !== null}
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(experience.id)}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 disabled:opacity-50"
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
        <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-6 h-6 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
