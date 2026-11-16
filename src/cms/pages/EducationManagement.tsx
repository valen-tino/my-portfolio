import React, { useState, useEffect } from 'react';
import CMSLayout from '../components/CMSLayout';
import { CMSStorage, EducationItem } from '../apiStorage';
import WYSIWYGEditor from '../components/WYSIWYGEditor';
import { formatMonthYear, sortByLatestEndDate } from '../../utils/dateFormat';
import {
  CMSStatusBanner,
  CMSFieldError,
  getCMSInputErrorClasses,
  type CMSMessage,
} from '../components/CMSStatusBanner';
import { parseCMSError } from '../utils/errorUtils';

const sortEducationByLatestEnd = (items: EducationItem[]): EducationItem[] =>
  sortByLatestEndDate(
    items.map((item) => ({
      item,
      startDate: item.startDate,
      endDate: item.endDate || 'Present',
    })),
  ).map((entry) => entry.item);

const EducationManagement: React.FC = () => {
  const [educationItems, setEducationItems] = useState<EducationItem[]>([]);
  const [editingItem, setEditingItem] = useState<EducationItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [message, setMessage] = useState<CMSMessage>({ type: '', text: '' });
  const [loadFailed, setLoadFailed] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEducationItems();
  }, []);

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const loadEducationItems = async () => {
    try {
      setLoadFailed(false);
      const items = await CMSStorage.getEducation();
      setEducationItems(sortEducationByLatestEnd(items));
    } catch (error) {
      console.error('Error loading education items:', error);
      const parsed = parseCMSError(error, 'Failed to load education items. Please refresh the page.');
      setLoadFailed(true);
      setMessage({
        type: 'error',
        text: parsed.message,
        details: parsed.details,
      });
    }
  };

  const saveEducationItem = async (item: EducationItem, isNew: boolean = false): Promise<EducationItem> => {
    setLoading(true);
    try {
      let savedItem: EducationItem;
      if (isNew) {
        savedItem = await CMSStorage.addEducation(item);
        setEducationItems((prev) => sortEducationByLatestEnd([...prev, savedItem]));
      } else {
        savedItem = await CMSStorage.updateEducation(item.id, item);
        setEducationItems((prev) =>
          sortEducationByLatestEnd(prev.map((e) => (e.id === item.id ? savedItem : e))),
        );
      }
      setFieldErrors({});
      setLoadFailed(false);
      setMessage({
        type: 'success',
        text: `Education item ${isNew ? 'added' : 'updated'} successfully!`
      });
      return savedItem;
    } catch (error) {
      console.error('Save error:', error);
      const parsed = parseCMSError(
        error,
        `Failed to ${isNew ? 'add' : 'update'} education item. Please try again.`
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
    const newItem: EducationItem = {
      id: 'temp-new', // Will be assigned by backend
      title: '',
      institution: '',
      startDate: '',
      endDate: '',
      description: '',
      link: ''
    };
    setEditingItem(newItem);
    setIsAddingNew(true);
    setFieldErrors({});
    setMessage({ type: '', text: '' });
  };

  const handleEdit = (item: EducationItem) => {
    setEditingItem(item);
    setIsAddingNew(false);
    setFieldErrors({});
    setMessage({ type: '', text: '' });
  };

  const handleSave = async () => {
    if (!editingItem) return;

    const nextFieldErrors: Record<string, string> = {};
    if (!editingItem.title.trim()) {
      nextFieldErrors.title = 'Title / Degree is required.';
    }
    if (!editingItem.institution.trim()) {
      nextFieldErrors.institution = 'Institution / Provider is required.';
    }
    if (!editingItem.startDate.trim()) {
      nextFieldErrors.startDate = 'Start date is required.';
    }
    if (
      editingItem.link &&
      editingItem.link.trim() &&
      !/^(https?:\/\/|\/)/i.test(editingItem.link.trim())
    ) {
      nextFieldErrors.link = 'Certificate link must start with https://, http://, or /.';
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
      await saveEducationItem(editingItem, isAddingNew);
      setEditingItem(null);
      setIsAddingNew(false);
    } catch (error) {
      // Error already handled in saveEducationItem
    }
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Are you sure you want to delete this education item?')) {
      try {
        await CMSStorage.deleteEducation(id);
        setEducationItems(prev => prev.filter(item => item.id !== id));
        setMessage({
          type: 'success',
          text: 'Education item deleted successfully!'
        });
      } catch (error) {
        console.error('Delete error:', error);
        const parsed = parseCMSError(error, 'Failed to delete education item. Please try again.');
        setMessage({
          type: 'error',
          text: parsed.message,
          details: parsed.details,
        });
      }
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setIsAddingNew(false);
    setFieldErrors({});
    setMessage({ type: '', text: '' });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Present';
    return formatMonthYear(dateString) || dateString;
  };

  return (
    <CMSLayout>
      <div className="container mx-auto max-w-6xl p-4 space-y-6 text-gray-900">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Education &amp; Certificates</h1>
            <p className="text-gray-600 mt-2">Manage your educational background and certifications.</p>
          </div>
          <button
            onClick={handleAdd}
            className="btn btn-primary text-white"
            disabled={editingItem !== null}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Item
          </button>
        </div>

        {/* Message when form is closed */}
        {!editingItem && (
          <CMSStatusBanner
            message={message}
            onDismiss={() => {
              setMessage({ type: '', text: '' });
              setLoadFailed(false);
            }}
            onRetry={loadFailed ? loadEducationItems : undefined}
          />
        )}

        {/* Edit/Add Form */}
        {editingItem && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {isAddingNew ? 'Add New Education Item' : 'Edit Education Item'}
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-gray-700">Title / Degree *</span>
                    </label>
                    <input
                      type="text"
                      aria-invalid={Boolean(fieldErrors.title)}
                      className={`input input-bordered bg-white text-gray-900 placeholder:text-gray-400 w-full ${getCMSInputErrorClasses(Boolean(fieldErrors.title))}`}
                      placeholder="e.g., Bachelor of Computer Science, React Certificate"
                      value={editingItem.title}
                      onChange={(e) => {
                        clearFieldError('title');
                        setEditingItem({ ...editingItem, title: e.target.value });
                      }}
                    />
                    <CMSFieldError error={fieldErrors.title} />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-gray-700">Institution / Provider *</span>
                    </label>
                    <input
                      type="text"
                      aria-invalid={Boolean(fieldErrors.institution)}
                      className={`input input-bordered bg-white text-gray-900 placeholder:text-gray-400 w-full ${getCMSInputErrorClasses(Boolean(fieldErrors.institution))}`}
                      placeholder="e.g., University of Technology, Coursera"
                      value={editingItem.institution}
                      onChange={(e) => {
                        clearFieldError('institution');
                        setEditingItem({ ...editingItem, institution: e.target.value });
                      }}
                    />
                    <CMSFieldError error={fieldErrors.institution} />
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
                        value={editingItem.startDate}
                        onChange={(e) => {
                          clearFieldError('startDate');
                          setEditingItem({ ...editingItem, startDate: e.target.value });
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
                        value={editingItem.endDate}
                        onChange={(e) => setEditingItem({ ...editingItem, endDate: e.target.value })}
                      />
                      <label className="label">
                        <span className="label-text-alt text-gray-500">Leave empty if ongoing</span>
                      </label>
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-gray-700">Certificate/Credential Link (optional)</span>
                    </label>
                    <input
                      type="url"
                      aria-invalid={Boolean(fieldErrors.link)}
                      className={`input input-bordered bg-white text-gray-900 placeholder:text-gray-400 w-full ${getCMSInputErrorClasses(Boolean(fieldErrors.link))}`}
                      placeholder="https://example.com/certificate"
                      value={editingItem.link || ''}
                      onChange={(e) => {
                        clearFieldError('link');
                        setEditingItem({ ...editingItem, link: e.target.value });
                      }}
                    />
                    <CMSFieldError error={fieldErrors.link} />
                  </div>
                </div>

                <div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-gray-700">Description</span>
                    </label>
                    <div
                      className={`rounded-lg ${
                        fieldErrors.description ? 'ring-2 ring-red-500 border border-red-500' : ''
                      }`}
                    >
                      <WYSIWYGEditor
                        value={editingItem.description}
                        onChange={(html) => {
                          clearFieldError('description');
                          setEditingItem({ ...editingItem, description: html });
                        }}
                        placeholder="Describe what you learned, achievements, relevant coursework, etc."
                        enableSectionPresets={false}
                        enableGalleries={false}
                        minHeight="200px"
                      />
                    </div>
                    <CMSFieldError error={fieldErrors.description} />
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
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className={`btn btn-primary text-white ${loading ? 'loading' : ''}`}
                >
                  {loading ? 'Saving...' : (isAddingNew ? 'Add Item' : 'Save Changes')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Education Items List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Current Education Items ({educationItems.length})
            </h2>
            
            {educationItems.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
                <p className="text-gray-600">No education items added yet.</p>
                <button
                  onClick={handleAdd}
                  className="btn btn-primary text-white mt-4"
                >
                  Add Your First Item
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {educationItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl bg-gray-50/70 border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
                              <p className="text-blue-600 font-medium text-sm">{item.institution}</p>
                            </div>
                            <p className="text-gray-500 text-xs whitespace-nowrap ml-4">
                              {formatDate(item.startDate)} - {formatDate(item.endDate || '')}
                            </p>
                          </div>
                          {item.description && (
                            <p className="text-gray-700 text-sm leading-relaxed mb-2 line-clamp-2">
                              {item.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}
                            </p>
                          )}
                          {item.link && (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center text-blue-600 hover:text-blue-700 text-xs"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              Certificate
                            </a>
                          )}
                        </div>
                        
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleEdit(item)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50"
                            disabled={editingItem !== null}
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 disabled:opacity-50"
                            disabled={editingItem !== null}
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
            <h3 className="font-bold">📚 Education Management Tips</h3>
            <div className="text-sm mt-1 space-y-1">
              <p>• Add both formal education (degrees) and certifications</p>
              <p>• Items are automatically sorted by start date (most recent first)</p>
              <p>• Leave end date empty for ongoing education</p>
              <p>• Include links to certificates or credentials when available</p>
              <p>• Use the description to highlight key achievements or relevant coursework</p>
              <p>• All data is automatically saved to your secure database</p>
            </div>
          </div>
        </div>
      </div>
    </CMSLayout>
  );
};

export default EducationManagement;
