import React, { useState, useEffect } from 'react';
import CMSLayout from '../components/CMSLayout';
import { CMSStorage, EducationItem } from '../apiStorage';

const EducationManagement: React.FC = () => {
  const [educationItems, setEducationItems] = useState<EducationItem[]>([]);
  const [editingItem, setEditingItem] = useState<EducationItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEducationItems();
  }, []);

  const loadEducationItems = async () => {
    try {
      const items = await CMSStorage.getEducation();
      setEducationItems(items);
    } catch (error) {
      console.error('Error loading education items:', error);
      setMessage({
        type: 'error',
        text: 'Failed to load education items. Please refresh the page.'
      });
    }
  };

  const saveEducationItem = async (item: EducationItem, isNew: boolean = false): Promise<EducationItem> => {
    setLoading(true);
    try {
      let savedItem: EducationItem;
      if (isNew) {
        savedItem = await CMSStorage.addEducation(item);
        setEducationItems(prev => {
          const updated = [...prev, savedItem];
          return updated.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        });
      } else {
        savedItem = await CMSStorage.updateEducation(item.id, item);
        setEducationItems(prev => {
          const updated = prev.map(e => e.id === item.id ? savedItem : e);
          return updated.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        });
      }
      setMessage({
        type: 'success',
        text: `Education item ${isNew ? 'added' : 'updated'} successfully!`
      });
      return savedItem;
    } catch (error) {
      console.error('Save error:', error);
      setMessage({
        type: 'error',
        text: `Failed to ${isNew ? 'add' : 'update'} education item. Please try again.`
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
  };

  const handleEdit = (item: EducationItem) => {
    setEditingItem(item);
    setIsAddingNew(false);
  };

  const handleSave = async () => {
    if (!editingItem || !editingItem.title.trim() || !editingItem.institution.trim()) {
      setMessage({
        type: 'error',
        text: 'Please provide at least title and institution.'
      });
      return;
    }

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
        setMessage({
          type: 'error',
          text: 'Failed to delete education item. Please try again.'
        });
      }
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setIsAddingNew(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Present';
    // Handle both full date and month-year formats
    const date = dateString.includes('-') && dateString.split('-').length === 2 
      ? new Date(dateString + '-01')  // Add day for month-year format (YYYY-MM)
      : new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <CMSLayout>
      <div className="container mx-auto max-w-6xl p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Education & Certificates</h1>
            <p className="text-base-content/70 mt-2">Manage your educational background and certifications.</p>
          </div>
          <button
            onClick={handleAdd}
            className="btn btn-primary"
            disabled={editingItem !== null}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Item
          </button>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`alert ${
            message.type === 'success' ? 'alert-success' : 'alert-error'
          }`}>
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
        {editingItem && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-xl mb-6">
                {isAddingNew ? 'Add New Education Item' : 'Edit Education Item'}
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Title / Degree *</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      placeholder="e.g., Bachelor of Computer Science, React Certificate"
                      value={editingItem.title}
                      onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Institution / Provider *</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      placeholder="e.g., University of Technology, Coursera"
                      value={editingItem.institution}
                      onChange={(e) => setEditingItem({ ...editingItem, institution: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">Start Date</span>
                      </label>
                      <input
                        type="month"
                        className="input input-bordered w-full"
                        value={editingItem.startDate}
                        onChange={(e) => setEditingItem({ ...editingItem, startDate: e.target.value })}
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">End Date</span>
                      </label>
                      <input
                        type="month"
                        className="input input-bordered w-full"
                        value={editingItem.endDate}
                        onChange={(e) => setEditingItem({ ...editingItem, endDate: e.target.value })}
                      />
                      <label className="label">
                        <span className="label-text-alt">Leave empty if ongoing</span>
                      </label>
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Certificate/Credential Link (optional)</span>
                    </label>
                    <input
                      type="url"
                      className="input input-bordered w-full"
                      placeholder="https://example.com/certificate"
                      value={editingItem.link || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, link: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Description</span>
                    </label>
                    <textarea
                      rows={8}
                      className="textarea textarea-bordered w-full"
                      placeholder="Describe what you learned, achievements, relevant coursework, etc."
                      value={editingItem.description}
                      onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    />
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
                  disabled={loading}
                  className={`btn btn-primary ${loading ? 'loading' : ''}`}
                >
                  {loading ? 'Saving...' : (isAddingNew ? 'Add Item' : 'Save Changes')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Education Items List */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-xl mb-4">
              Current Education Items ({educationItems.length})
            </h2>
            
            {educationItems.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-base-content/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
                <p className="text-base-content/70">No education items added yet.</p>
                <button
                  onClick={handleAdd}
                  className="btn btn-primary mt-4"
                >
                  Add Your First Item
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {educationItems.map((item) => (
                  <div
                    key={item.id}
                    className="card bg-base-200/50 border border-base-300 hover:shadow-md transition-shadow"
                  >
                    <div className="card-body p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-base font-semibold">{item.title}</h3>
                              <p className="text-primary font-medium text-sm">{item.institution}</p>
                            </div>
                            <p className="text-base-content/60 text-xs whitespace-nowrap ml-4">
                              {formatDate(item.startDate)} - {formatDate(item.endDate || '')}
                            </p>
                          </div>
                          {item.description && (
                            <p className="text-base-content/80 text-sm leading-relaxed mb-2 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                          {item.link && (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center text-primary hover:text-primary/80 text-xs"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              Certificate
                            </a>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="btn btn-sm btn-outline"
                            disabled={editingItem !== null}
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="btn btn-sm btn-outline btn-error"
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
