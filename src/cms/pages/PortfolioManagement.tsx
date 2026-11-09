import React, { useState, useEffect, useRef } from 'react';
import CMSLayout from '../components/CMSLayout';
import WYSIWYGEditor from '../components/WYSIWYGEditor';
import { CMSStorage, PortfolioItem, TechTool, Role, Experience, EducationItem } from '../apiStorage';
import AIPortfolioModal from '../components/AIPortfolioModal';
import aiService from '../../services/ai';
import {
  validateProjectDetailsForRewriting,
  formatAIErrorMessage,
  isContentSignificantlyDifferent,
  sanitizeTextForAI
} from '../../utils/aiHelpers';
import { migrateContentToHtml, optimizeCloudinaryVideoUrl } from '../../utils/contentMigration';

/**
 * Normalizes incoming technology tokens:
 * - Trims whitespace and filters empty tokens.
 * - Matches case-insensitively against catalog tools and adopts canonical title.
 * - Prevents case-insensitive duplicates against existing technologies.
 */
export const normalizeAndDeduplicateTech = (
  incoming: string[],
  existing: string[],
  catalog: TechTool[]
): string[] => {
  const result = [...existing];
  for (const raw of incoming) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const matched = catalog.find(
      (tool) => tool.title.toLowerCase() === trimmed.toLowerCase()
    );
    const canonical = matched ? matched.title : trimmed;
    const alreadyExists = result.some(
      (t) => t.toLowerCase() === canonical.toLowerCase()
    );
    if (!alreadyExists) {
      result.push(canonical);
    }
  }
  return result;
};

const PortfolioManagement: React.FC = () => {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [techInput, setTechInput] = useState('');
  const techInputRef = useRef(techInput);
  useEffect(() => {
    techInputRef.current = techInput;
  }, [techInput]);
  const [techSearch, setTechSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [availableTechTools, setAvailableTechTools] = useState<TechTool[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [availableExperiences, setAvailableExperiences] = useState<Experience[]>([]);
  const [availableEducation, setAvailableEducation] = useState<EducationItem[]>([]);
  // AI-related state
  const [showAIModal, setShowAIModal] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    loadPortfolioItems();
    loadTechTools();
    loadRoles();
    loadExperiences();
    loadEducation();
  }, []);

  const loadPortfolioItems = async () => {
    try {
      const items = await CMSStorage.getPortfolios();
      setPortfolioItems(items);
    } catch (error) {
      console.error('Error loading portfolio items:', error);
      setMessage({
        type: 'error',
        text: 'Failed to load portfolio items. Please refresh the page.'
      });
    }
  };

  const loadTechTools = async () => {
    try {
      const tools = await CMSStorage.getTechTools();
      setAvailableTechTools(tools);
    } catch (error) {
      console.error('Error loading tech tools:', error);
    }
  };

  const loadRoles = async () => {
    try {
      const roles = await CMSStorage.getRoles();
      setAvailableRoles(roles);
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const loadExperiences = async () => {
    try {
      const experiences = await CMSStorage.getExperiences();
      setAvailableExperiences(experiences);
    } catch (error) {
      console.error('Error loading experiences:', error);
    }
  };

  const loadEducation = async () => {
    try {
      const education = await CMSStorage.getEducation();
      setAvailableEducation(education);
    } catch (error) {
      console.error('Error loading education:', error);
    }
  };

  // Keyboard shortcut listener: Cmd+S / Ctrl+S to save portfolio changes
  useEffect(() => {
    if (!editingItem) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingItem]);

  const savePortfolioItem = async (item: PortfolioItem, isNew: boolean = false) => {
    setLoading(true);
    try {
      let savedItem: PortfolioItem;
      if (isNew) {
        savedItem = await CMSStorage.addPortfolio(item);
        setPortfolioItems(prev => [...prev, savedItem]);
      } else {
        savedItem = await CMSStorage.updatePortfolio(item.id, item);
        setPortfolioItems(prev => prev.map(p => p.id === item.id ? savedItem : p));
      }
      setMessage({
        type: 'success',
        text: `Portfolio item ${isNew ? 'added' : 'updated'} successfully!`
      });
      // Refresh available tech tools so auto-provisioned draft skills are synced
      await loadTechTools();
      return savedItem;
    } catch (error) {
      console.error('Save error:', error);
      setMessage({
        type: 'error',
        text: `Failed to ${isNew ? 'add' : 'update'} portfolio item. Please try again.`
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    const newItem: PortfolioItem = {
      id: 'temp-new', // Will be assigned by backend
      title: '',
      desc: '',
      projectDetails: '',
      linkTo: '',
      imageURL: '',
      tech: [],
      roles: [],
      year: new Date().getFullYear().toString(),
      isPublished: true,
      relatedExperience: null,
      relatedExperienceCompany: null,
      relatedEducation: null,
      relatedEducationInstitution: null
    };
    setEditingItem(newItem);
    setIsAddingNew(true);
    setTechInput('');
    techInputRef.current = '';
    setTechSearch('');
  };

  const handleEdit = (item: PortfolioItem) => {
    const expId = typeof item.relatedExperience === 'object' && item.relatedExperience !== null
      ? (item.relatedExperience._id || item.relatedExperience.id || null)
      : (item.relatedExperience || null);

    const eduId = typeof item.relatedEducation === 'object' && item.relatedEducation !== null
      ? (item.relatedEducation._id || item.relatedEducation.id || null)
      : (item.relatedEducation || null);

    // Ensure all fields exist with proper defaults and migrate legacy markdown to WYSIWYG HTML
    const itemWithDefaults = {
      ...item,
      projectDetails: migrateContentToHtml(item.projectDetails || '', item.title),
      roles: item.roles || [],
      videoURL: item.videoURL || null,
      videoCloudinaryId: item.videoCloudinaryId || null,
      year: item.year || '',
      relatedExperience: expId,
      relatedExperienceCompany: item.relatedExperienceCompany || (typeof item.relatedExperience === 'object' && item.relatedExperience !== null ? item.relatedExperience.companyName : null) || null,
      relatedEducation: eduId,
      relatedEducationInstitution: item.relatedEducationInstitution || (typeof item.relatedEducation === 'object' && item.relatedEducation !== null ? item.relatedEducation.institution : null) || null,
      // Initialize new fields with defaults if they don't exist
      isPasswordProtected: item.isPasswordProtected || false,
      password: item.password || '',
      isPinned: item.isPinned || false,
      isPublished: item.isPublished !== undefined ? item.isPublished : true
    };
    setEditingItem(itemWithDefaults);
    setIsAddingNew(false);
    setTechInput(''); // Clear custom tech input when editing existing item
    techInputRef.current = '';
    setTechSearch('');
  };

  const handleAddCustomTech = (inputOverride?: string) => {
    if (!editingItem) return;
    const raw = inputOverride !== undefined ? inputOverride : techInput;
    if (!raw.trim()) return;
    const splitItems = raw.split(',').map((s) => s.trim()).filter(Boolean);
    if (splitItems.length === 0) return;

    setEditingItem((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        tech: normalizeAndDeduplicateTech(splitItems, prev.tech || [], availableTechTools)
      };
    });
    setTechInput('');
    techInputRef.current = '';
  };

  const handleSave = async () => {
    if (!editingItem || !editingItem.title.trim() || !editingItem.desc.trim()) {
      setMessage({
        type: 'error',
        text: 'Please provide at least title and description.'
      });
      return;
    }

    // Validate password protection
    if (editingItem.isPasswordProtected && (!editingItem.password || !editingItem.password.trim())) {
      setMessage({
        type: 'error',
        text: 'Please provide a password for password-protected portfolio.'
      });
      return;
    }

    // Reconcile any uncommitted text remaining in custom tech input buffer
    const pendingRaw = techInputRef.current.trim();
    const pendingList = pendingRaw ? pendingRaw.split(',').map((s) => s.trim()).filter(Boolean) : [];
    const allTechTools = normalizeAndDeduplicateTech(
      pendingList,
      editingItem.tech || [],
      availableTechTools
    );

    const updatedItem = {
      ...editingItem,
      projectDetails: migrateContentToHtml(editingItem.projectDetails || ''),
      tech: allTechTools,
      roles: editingItem.roles || [] // Ensure roles array exists
    };

    try {
      await savePortfolioItem(updatedItem, isAddingNew);
      setEditingItem(null);
      setIsAddingNew(false);
      setTechInput('');
      techInputRef.current = '';
    } catch (error) {
      // Error already handled in savePortfolioItem
    }
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Are you sure you want to delete this portfolio item?')) {
      try {
        await CMSStorage.deletePortfolio(id);
        setPortfolioItems(prev => prev.filter(item => item.id !== id));
        setMessage({
          type: 'success',
          text: 'Portfolio item deleted successfully!'
        });
      } catch (error) {
        console.error('Delete error:', error);
        setMessage({
          type: 'error',
          text: 'Failed to delete portfolio item. Please try again.'
        });
      }
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setIsAddingNew(false);
    setTechInput('');
    techInputRef.current = '';
    setAiError('');
  };

  const handleAIPortfolioGenerate = (portfolio: any) => {
    const rawCustom = Array.isArray(portfolio.customTech) ? portfolio.customTech : [];
    const rawMatched = Array.isArray(portfolio.tech) ? portfolio.tech : [];
    
    // Combine and deduplicate matched tools with custom tech directly into chips
    const mergedTech = normalizeAndDeduplicateTech(
      rawCustom,
      rawMatched,
      availableTechTools
    );

    const newItem: PortfolioItem = {
      ...portfolio,
      id: 'temp-ai-generated',
      roles: portfolio.roles || [],
      tech: mergedTech,
      year: portfolio.year || new Date().getFullYear().toString(),
      isPublished: portfolio.isPublished !== undefined ? portfolio.isPublished : true,
      relatedExperience: portfolio.relatedExperience || null,
      relatedExperienceCompany: portfolio.relatedExperienceCompany || null,
      relatedEducation: portfolio.relatedEducation || null,
      relatedEducationInstitution: portfolio.relatedEducationInstitution || null
    };
    
    setEditingItem(newItem);
    setIsAddingNew(true);
    setTechInput(''); // Clear input buffer
    techInputRef.current = '';
    setShowAIModal(false);
    
    const techMessage = rawCustom.length > 0 
      ? `AI-generated portfolio loaded! ${rawCustom.length} unmatched technologies added as tags.`
      : 'AI-generated portfolio loaded! Review and customize as needed, then save.';
    
    setMessage({
      type: 'success',
      text: techMessage
    });
  };

  const handleRewriteWithAI = async () => {
    if (!editingItem || !editingItem.projectDetails) {
      setAiError('No project details to rewrite');
      return;
    }

    // Validate content
    const validation = validateProjectDetailsForRewriting(editingItem.projectDetails);
    if (!validation.isValid) {
      setAiError(validation.message || 'Cannot rewrite content');
      return;
    }

    setIsRewriting(true);
    setAiError('');

    try {
      const sanitizedText = sanitizeTextForAI(editingItem.projectDetails);
      const response = await aiService.rewriteProjectDetails(
        sanitizedText,
        editingItem.title || 'Project'
      );

      if (!response.success || !response.data) {
        setAiError(formatAIErrorMessage(response.error || 'Unknown error'));
        return;
      }

      // Check if the content is significantly different
      if (!isContentSignificantlyDifferent(editingItem.projectDetails, response.data)) {
        setMessage({
          type: 'info',
          text: 'AI suggests the content is already well-written. No changes made.'
        });
        return;
      }

      // Update the project details with AI-rewritten content
      setEditingItem({
        ...editingItem,
        projectDetails: response.data
      });

      setMessage({
        type: 'success',
        text: 'Project details rewritten successfully! Review the changes and save when ready.'
      });

    } catch (error: any) {
      console.error('Error rewriting project details:', error);
      setAiError(formatAIErrorMessage(error.message || 'Unexpected error occurred'));
    } finally {
      setIsRewriting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingItem) {
      setImageUploading(true);
      try {
        const uploadResult = await CMSStorage.uploadPortfolioImage(file);
        setEditingItem({
          ...editingItem,
          imageURL: uploadResult.imageURL,
          imageCloudinaryId: uploadResult.imageCloudinaryId
        });
        setMessage({
          type: 'success',
          text: 'Image uploaded successfully!'
        });
      } catch (error) {
        console.error('Image upload error:', error);
        setMessage({
          type: 'error',
          text: 'Failed to upload image. Please try again.'
        });
      } finally {
        setImageUploading(false);
      }
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingItem) {
      const maxSizeBytes = 100 * 1024 * 1024; // 100MB limit
      if (file.size > maxSizeBytes) {
        setMessage({
          type: 'error',
          text: 'Video file is too large. Maximum file size is 100MB.'
        });
        e.target.value = '';
        return;
      }

      setVideoUploading(true);
      try {
        const uploadResult = await CMSStorage.uploadPortfolioVideo(file);
        setEditingItem({
          ...editingItem,
          videoURL: uploadResult.videoURL,
          videoCloudinaryId: uploadResult.videoCloudinaryId
        });
        setMessage({
          type: 'success',
          text: 'Portfolio video uploaded and web-optimized successfully!'
        });
      } catch (error: any) {
        console.error('Video upload error:', error);
        const status = error?.response?.status;
        const errorMessage =
          status === 413
            ? 'Video file is too large for the server. Maximum file size is 100MB.'
            : error?.response?.data?.error?.message ||
              error?.response?.data?.message ||
              'Failed to upload video. Please try again.';
        setMessage({
          type: 'error',
          text: errorMessage
        });
      } finally {
        setVideoUploading(false);
      }
    }
  };

  const handleRemoveVideo = () => {
    if (!editingItem) return;
    setEditingItem({
      ...editingItem,
      videoURL: null,
      videoCloudinaryId: null
    });
  };

  return (
    <CMSLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Portfolio Management</h1>
            <p className="mt-2 text-gray-600">Manage your project showcases and portfolio items.</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAIModal(true)}
              className="btn bg-purple-600 hover:bg-purple-700 text-white"
              disabled={editingItem !== null}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Add New Project using AI
            </button>
            <button
              onClick={handleAdd}
              className="btn btn-primary"
              disabled={editingItem !== null}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Project
            </button>
          </div>
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
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden" data-testid="portfolio-edit-card">
            {/* Sticky Action Header */}
            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-ghost btn-sm text-gray-600 hover:text-gray-900 gap-1"
                >
                  ← Back
                </button>
                <div className="h-4 w-px bg-gray-300" />
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    {isAddingNew ? 'Add New Portfolio Item' : `Editing: ${editingItem.title || 'Untitled Project'}`}
                    {editingItem.isPublished !== false ? (
                      <span className="badge badge-success badge-sm text-white">🌐 Public (Visible)</span>
                    ) : (
                      <span className="badge badge-neutral badge-sm">🚫 Hidden from Public</span>
                    )}
                    {editingItem.isPinned && (
                      <span className="badge badge-warning badge-sm">Pinned</span>
                    )}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-ghost btn-sm text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading || imageUploading || videoUploading}
                  className={`btn btn-primary btn-sm gap-2 shadow-sm ${
                    (loading || imageUploading || videoUploading) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title="Save changes (⌘S / Ctrl+S)"
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {isAddingNew ? 'Add Project' : 'Save Changes'}
                  <span className="text-[10px] opacity-70 hidden sm:inline">(⌘S)</span>
                </button>
              </div>
            </div>

            {/* Two-Column Layout: Left Column 40% & Right Column 60% */}
            <div className="p-6 lg:p-8 flex flex-col lg:flex-row gap-8 items-start">
              {/* Left Column (40% width): Project Metadata, Settings & Media */}
              <div className="w-full lg:w-[40%] flex-shrink-0 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
                    placeholder="e.g., E-commerce Website, Mobile App"
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                    Short Description *
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Brief description that appears on portfolio cards (2-3 sentences)"
                    value={editingItem.desc}
                    onChange={(e) => setEditingItem({ ...editingItem, desc: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                    Project Link (optional)
                  </label>
                  <input
                    type="url"
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="https://example.com"
                    value={editingItem.linkTo}
                    onChange={(e) => setEditingItem({ ...editingItem, linkTo: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                    Project Year (optional)
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    pattern="[0-9]{4}"
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="e.g., 2024"
                    value={editingItem.year || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, year: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Label indicating the year this project was created or delivered.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                    Related Experience or Education (optional)
                  </label>
                  <select
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                    value={(() => {
                      const expId = typeof editingItem.relatedExperience === 'object' && editingItem.relatedExperience !== null
                        ? (editingItem.relatedExperience._id || editingItem.relatedExperience.id)
                        : editingItem.relatedExperience;
                      if (expId) return `exp_${expId}`;

                      const eduId = typeof editingItem.relatedEducation === 'object' && editingItem.relatedEducation !== null
                        ? (editingItem.relatedEducation._id || editingItem.relatedEducation.id)
                        : editingItem.relatedEducation;
                      if (eduId) return `edu_${eduId}`;

                      return '';
                    })()}
                    onChange={(e) => {
                      const selected = e.target.value;
                      if (!selected) {
                        setEditingItem({
                          ...editingItem,
                          relatedExperience: null,
                          relatedExperienceCompany: null,
                          relatedEducation: null,
                          relatedEducationInstitution: null
                        });
                      } else if (selected.startsWith('exp_')) {
                        const id = selected.slice(4);
                        const exp = availableExperiences.find(item => String(item._id || item.id) === id);
                        setEditingItem({
                          ...editingItem,
                          relatedExperience: id,
                          relatedExperienceCompany: exp ? exp.companyName : null,
                          relatedEducation: null,
                          relatedEducationInstitution: null
                        });
                      } else if (selected.startsWith('edu_')) {
                        const id = selected.slice(4);
                        const edu = availableEducation.find(item => String(item._id || item.id) === id);
                        setEditingItem({
                          ...editingItem,
                          relatedEducation: id,
                          relatedEducationInstitution: edu ? edu.institution : null,
                          relatedExperience: null,
                          relatedExperienceCompany: null
                        });
                      }
                    }}
                  >
                    <option value="">None (Personal / Independent Project)</option>
                    <optgroup label="💼 Work Experiences">
                      {availableExperiences.map((exp) => (
                        <option key={exp._id || exp.id} value={`exp_${exp._id || exp.id}`}>
                          {exp.companyName} — {exp.title || 'Role'}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🎓 Educational Background">
                      {availableEducation.map((edu) => (
                        <option key={edu._id || edu.id} value={`edu_${edu._id || edu.id}`}>
                          {edu.institution} — {edu.title || 'Degree'}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Associate project with a company, university, or bootcamp (optional).
                  </p>
                </div>

                {/* Portfolio Settings Card */}
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
                  <h3 className="text-sm font-semibold text-gray-800">Portfolio Settings</h3>

                  {/* Pin Portfolio */}
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="pinned"
                      checked={editingItem.isPinned || false}
                      onChange={(e) => setEditingItem({ ...editingItem, isPinned: e.target.checked })}
                      className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <label htmlFor="pinned" className="text-sm font-medium text-gray-700 cursor-pointer">
                        📌 Pin to Landing Page
                      </label>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Show on homepage hero section (Max 3 pinned items).
                      </p>
                    </div>
                  </div>

                  {/* Password Protection */}
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="passwordProtected"
                        checked={editingItem.isPasswordProtected || false}
                        onChange={(e) => {
                          setEditingItem({
                            ...editingItem,
                            isPasswordProtected: e.target.checked,
                            password: e.target.checked ? (editingItem.password || '') : ''
                          });
                        }}
                        className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <label htmlFor="passwordProtected" className="text-sm font-medium text-gray-700 cursor-pointer">
                          🔒 Password Protection
                        </label>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Require a password to view this portfolio item
                        </p>
                      </div>
                    </div>

                    {editingItem.isPasswordProtected && (
                      <div className="ml-7 pt-1">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Portfolio Password *
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          placeholder="Enter password for this portfolio"
                          value={editingItem.password || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, password: e.target.value })}
                        />
                        <p className="text-xs text-orange-600 mt-1">
                          ⚠️ Visitors must enter this password to view details
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Public Visibility Toggle */}
                  <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                    <input
                      type="checkbox"
                      id="published"
                      checked={editingItem.isPublished !== false}
                      onChange={(e) => setEditingItem({ ...editingItem, isPublished: e.target.checked })}
                      className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <label htmlFor="published" className="text-sm font-semibold text-gray-800 cursor-pointer">
                        {editingItem.isPublished !== false ? '🌐 Visible on Public Website' : '🚫 Hidden from Public Website'}
                      </label>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {editingItem.isPublished !== false
                          ? 'This project is live and visible on the homepage and portfolio archive.'
                          : 'This project is hidden from public visitors. Only admins can view and edit it in this CMS panel.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Technologies Card */}
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-gray-800">
                      Technologies Used ({editingItem.tech?.length || 0})
                    </label>
                    {editingItem.tech && editingItem.tech.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItem({ ...editingItem, tech: [] });
                          setTechInput('');
                          techInputRef.current = '';
                        }}
                        className="text-xs text-red-600 hover:text-red-800 font-medium"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {/* Selected Tech Chips */}
                  {editingItem.tech && editingItem.tech.length > 0 && (
                    <div data-testid="selected-tech-chips" className="flex flex-wrap gap-1.5 p-2 bg-white border border-gray-200 rounded-lg max-h-24 overflow-y-auto">
                      {editingItem.tech.map((toolTitle) => (
                        <span key={toolTitle} className="badge badge-info badge-sm gap-1 text-white py-2">
                          {toolTitle}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingItem({
                                ...editingItem,
                                tech: (editingItem.tech || []).filter((t) => t !== toolTitle)
                              });
                            }}
                            className="hover:opacity-75 font-bold ml-0.5"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Search Filter for Technologies */}
                  <input
                    type="text"
                    value={techSearch}
                    onChange={(e) => setTechSearch(e.target.value)}
                    placeholder="Search technologies..."
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />

                  {/* Filtered Tool Checkboxes */}
                  {availableTechTools.length > 0 ? (
                    <div className="space-y-1 max-h-36 overflow-y-auto border border-gray-200 rounded-md p-2 bg-white">
                      {availableTechTools
                        .filter((tool) => tool.title.toLowerCase().includes(techSearch.toLowerCase()))
                        .map((tool) => {
                          const isChecked = (editingItem.tech || []).includes(tool.title);
                          return (
                            <label
                              key={tool.id}
                              className={`flex items-center space-x-2 text-xs p-1.5 rounded cursor-pointer transition-colors ${
                                isChecked ? 'bg-blue-50 text-blue-900 font-medium' : 'hover:bg-gray-50 text-gray-700'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  const currentTech = editingItem.tech || [];
                                  if (e.target.checked) {
                                    setEditingItem({
                                      ...editingItem,
                                      tech: [...currentTech, tool.title]
                                    });
                                  } else {
                                    setEditingItem({
                                      ...editingItem,
                                      tech: currentTech.filter((t) => t !== tool.title)
                                    });
                                  }
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <img src={tool.imageURL} alt={tool.title} className="w-4 h-4 object-contain" />
                              <span>{tool.title}</span>
                            </label>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-2 bg-white rounded border border-gray-200 text-xs text-gray-400">
                      No tech tools available
                    </div>
                  )}

                  {/* Custom tech input group */}
                  <div className="space-y-1">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        data-testid="custom-tech-input"
                        className={`flex-1 px-2.5 py-1.5 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                          techInput ? 'border-blue-400 bg-blue-50/30' : 'border-gray-300 bg-white'
                        }`}
                        placeholder="Custom tech (e.g. Three.js)..."
                        value={techInput}
                        onChange={(e) => setTechInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            handleAddCustomTech();
                          }
                        }}
                      />
                      <button
                        type="button"
                        data-testid="add-custom-tech-btn"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleAddCustomTech()}
                        disabled={!techInput.trim()}
                        className="btn btn-sm btn-outline text-xs px-3 shrink-0"
                      >
                        + Add
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      Type custom technologies separated by commas, then press Enter or click Add.
                    </p>
                  </div>
                </div>

                {/* Professional Roles Card */}
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                  <label className="block text-sm font-semibold text-gray-800">
                    Professional Roles ({editingItem.roles?.length || 0})
                  </label>
                  {availableRoles.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {availableRoles.map((role) => {
                        const isSelected = (editingItem.roles || []).includes(role.title);
                        return (
                          <button
                            key={role.id}
                            type="button"
                            onClick={() => {
                              const currentRoles = editingItem.roles || [];
                              if (isSelected) {
                                setEditingItem({
                                  ...editingItem,
                                  roles: currentRoles.filter((r) => r !== role.title)
                                });
                              } else {
                                setEditingItem({
                                  ...editingItem,
                                  roles: [...currentRoles, role.title]
                                });
                              }
                            }}
                            className={`badge badge-${role.color || 'info'} badge-md cursor-pointer transition-all ${
                              isSelected ? 'opacity-100 ring-2 ring-offset-1 ring-blue-500 shadow-xs' : 'badge-outline opacity-60 hover:opacity-100'
                            }`}
                          >
                            {isSelected ? '✓ ' : '+ '}
                            {role.title}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">No roles configured</p>
                  )}
                </div>

                {/* Card Thumbnail Image */}
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                  <label className="block text-sm font-semibold text-gray-800">
                    Project Card Image (Thumbnail)
                  </label>
                  {editingItem.imageURL && (
                    <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                      <img
                        src={editingItem.imageURL}
                        alt="Project preview"
                        className="w-full h-40 object-cover"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className={`w-full px-3 py-2 text-xs border border-gray-300 rounded-md bg-white focus:outline-none ${imageUploading ? 'opacity-50' : ''}`}
                    onChange={handleImageUpload}
                    disabled={imageUploading}
                  />
                  {imageUploading && (
                    <p className="text-xs text-blue-600 flex items-center gap-1">
                      <span className="loading loading-spinner loading-xs"></span> Uploading image...
                    </p>
                  )}
                </div>

                {/* Hero Video */}
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-gray-800">
                      Project Video
                    </label>
                    <span className="badge badge-primary badge-outline badge-xs">Web Optimized</span>
                  </div>
                  {editingItem.videoURL && (
                    <div className="space-y-1.5">
                      <video
                        src={optimizeCloudinaryVideoUrl(editingItem.videoURL)}
                        controls
                        playsInline
                        preload="metadata"
                        className="w-full aspect-video object-cover rounded-lg border border-gray-200 bg-black"
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">Cloudinary (f_auto, q_auto)</span>
                        <button
                          type="button"
                          onClick={handleRemoveVideo}
                          className="text-xs text-red-600 hover:text-red-800 font-medium"
                        >
                          Remove Video
                        </button>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/*"
                    className={`w-full px-3 py-2 text-xs border border-gray-300 rounded-md bg-white focus:outline-none ${videoUploading ? 'opacity-50' : ''}`}
                    onChange={handleVideoUpload}
                    disabled={videoUploading}
                  />
                  {videoUploading && (
                    <p className="text-xs text-blue-600 flex items-center gap-1">
                      <span className="loading loading-spinner loading-xs"></span> Uploading & optimizing video...
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column (60% width): Project Details WYSIWYG Editor Focus */}
              <div className="w-full lg:w-[60%] flex-grow min-w-0 flex flex-col space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border border-blue-100 rounded-xl">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <span>Project Details</span>
                      <span className="badge badge-primary badge-outline badge-xs">WYSIWYG</span>
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Case study narrative with section titles, Cloudinary media and responsive gallery
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleRewriteWithAI}
                    disabled={isRewriting || !editingItem.projectDetails?.trim()}
                    className={`btn btn-sm text-xs font-semibold rounded-lg gap-1.5 ${
                      isRewriting || !editingItem.projectDetails?.trim()
                        ? 'btn-disabled opacity-50'
                        : 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                    }`}
                    title="Rewrite case study with AI using standard section titles"
                  >
                    {isRewriting ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        Rewriting...
                      </>
                    ) : (
                      <>✨ Rewrite with AI</>
                    )}
                  </button>
                </div>

                {/* AI Error Display */}
                {aiError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 flex items-center justify-between text-xs text-red-700">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold">⚠️</span>
                      <span>{aiError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAiError('')}
                      className="text-red-500 hover:text-red-700 font-bold px-1"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Full-width WYSIWYG Editor */}
                <div className="flex-grow">
                  <WYSIWYGEditor
                    value={editingItem.projectDetails}
                    onChange={(html) => setEditingItem({ ...editingItem, projectDetails: html })}
                  />
                </div>

                {/* Bottom Action Controls */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <span className="text-xs text-gray-400">
                    Pro-tip: Press <kbd className="kbd kbd-xs">⌘S</kbd> to save anytime
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="btn btn-ghost btn-sm text-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={loading || imageUploading || videoUploading}
                      className={`btn btn-primary btn-sm gap-2 shadow-sm ${
                        (loading || imageUploading || videoUploading) ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {loading ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {isAddingNew ? 'Add Project' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Items List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Portfolio Items ({portfolioItems.length})
            </h2>
            
            {portfolioItems.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-gray-500">No portfolio items added yet.</p>
                <button
                  onClick={handleAdd}
                  className="btn btn-primary mt-4"
                >
                  Add Your First Project
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {portfolioItems.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Project Image */}
                    <div className="aspect-video bg-gray-100 overflow-hidden">
                      {item.imageURL ? (
                        <img
                          src={item.imageURL}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Project Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
                          {item.title}
                        </h3>
                        <div className="flex space-x-1 ml-2 flex-shrink-0">
                          {item.isPinned && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800" title="Pinned to landing page">
                              📌
                            </span>
                          )}
                          {item.isPasswordProtected && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800" title="Password protected">
                              🔒
                            </span>
                          )}
                          {item.isPublished === false && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-800 border border-gray-300" title="Hidden from public visitors">
                              🚫 Hidden
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                        {item.desc}
                      </p>
                      
                      {/* Roles */}
                      {item.roles && item.roles.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {item.roles.map((roleTitle, index) => {
                            const role = availableRoles.find(r => r.title === roleTitle);
                            return (
                              <div
                                key={index}
                                className={`badge badge-${role?.color || 'info'} badge-xs`}
                              >
                                {roleTitle}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Year & Related Affiliation Badges */}
                      {(item.year || item.relatedExperienceCompany || item.relatedEducationInstitution) && (
                        <div className="flex flex-wrap items-center gap-1.5 mb-2">
                          {item.year && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                              📅 {item.year}
                            </span>
                          )}
                          {item.relatedExperienceCompany && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              💼 {item.relatedExperienceCompany}
                            </span>
                          )}
                          {item.relatedEducationInstitution && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                              🎓 {item.relatedEducationInstitution}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Tech Stack */}
                      {item.tech.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {item.tech.slice(0, 3).map((tech, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                            >
                              {tech}
                            </span>
                          ))}
                          {item.tech.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              +{item.tech.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            disabled={editingItem !== null}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            disabled={editingItem !== null}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        
                        {item.linkTo && (
                          <a
                            href={item.linkTo}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Visit
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">🚀 Instructions</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Add your best projects to showcase your skills and experience</li>
            <li>• Use the Markdown editor for detailed project descriptions with formatting</li>
            <li>• Include live project links when available</li>
            <li>• Select technologies from your Tech Tools list or add custom ones</li>
            <li>• Assign professional roles to categorize your projects</li>
            <li>• Upload high-quality project screenshots or mockups - images are stored securely in the cloud</li>
            <li>• Make sure to add Tech Tools and Roles first to have them available for selection in projects</li>
          </ul>
        </div>
      </div>

      {/* AI Portfolio Modal */}
      <AIPortfolioModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onGenerate={handleAIPortfolioGenerate}
        availableTechTools={availableTechTools}
        availableRoles={availableRoles}
      />
    </CMSLayout>
  );
};

export default PortfolioManagement;
