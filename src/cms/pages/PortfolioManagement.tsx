import React, { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import CMSLayout from '../components/CMSLayout';
import { CMSStorage, PortfolioItem, TechTool, Role } from '../apiStorage';
import AIPortfolioModal from '../components/AIPortfolioModal';
import aiService from '../../services/ai';
import {
  validateProjectDetailsForRewriting,
  formatAIErrorMessage,
  isContentSignificantlyDifferent,
  sanitizeTextForAI
} from '../../utils/aiHelpers';

const PortfolioManagement: React.FC = () => {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [techInput, setTechInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [availableTechTools, setAvailableTechTools] = useState<TechTool[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  // AI-related state
  const [showAIModal, setShowAIModal] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    loadPortfolioItems();
    loadTechTools();
    loadRoles();
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
      roles: []
    };
    setEditingItem(newItem);
    setIsAddingNew(true);
    setTechInput('');
  };

  const handleEdit = (item: PortfolioItem) => {
    // Ensure all fields exist with proper defaults
    const itemWithDefaults = {
      ...item,
      roles: item.roles || [],
      // Initialize new fields with defaults if they don't exist
      isPasswordProtected: item.isPasswordProtected || false,
      password: item.password || '',
      isPinned: item.isPinned || false,
      isPublished: item.isPublished !== undefined ? item.isPublished : true
    };
    setEditingItem(itemWithDefaults);
    setIsAddingNew(false);
    setTechInput(''); // Clear custom tech input when editing existing item
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

    // Combine selected tech tools with custom tech input
    const customTechTools = techInput
      .split(',')
      .map(tech => tech.trim())
      .filter(tech => tech.length > 0);
    
    const allTechTools = [...(editingItem.tech || []), ...customTechTools]
      .filter((tech, index, arr) => arr.indexOf(tech) === index); // Remove duplicates

    const updatedItem = {
      ...editingItem,
      tech: allTechTools,
      roles: editingItem.roles || [] // Ensure roles array exists
    };

    try {
      await savePortfolioItem(updatedItem, isAddingNew);
      setEditingItem(null);
      setIsAddingNew(false);
      setTechInput('');
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
    setAiError('');
  };

  const handleAIPortfolioGenerate = (portfolio: any) => {
    const newItem: PortfolioItem = {
      ...portfolio,
      id: 'temp-ai-generated',
      roles: portfolio.roles || [],
      tech: portfolio.tech || [] // Matched technologies
    };
    
    // Set custom technologies in the input field if any were unmatched
    const customTechString = portfolio.customTech && portfolio.customTech.length > 0 
      ? portfolio.customTech.join(', ')
      : '';
    
    setEditingItem(newItem);
    setIsAddingNew(true);
    setTechInput(customTechString); // Populate custom tech input
    setShowAIModal(false);
    
    const techMessage = portfolio.customTech && portfolio.customTech.length > 0
      ? `AI-generated portfolio loaded! ${portfolio.customTech.length} unmatched technologies added to custom field.`
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
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {isAddingNew ? 'Add New Portfolio Item' : 'Edit Portfolio Item'}
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., E-commerce Website, Mobile App"
                      value={editingItem.title}
                      onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Short Description *
                    </label>
                    <textarea
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Brief description that appears on portfolio cards"
                      value={editingItem.desc}
                      onChange={(e) => setEditingItem({ ...editingItem, desc: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Link (optional)
                    </label>
                    <input
                      type="url"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com"
                      value={editingItem.linkTo}
                      onChange={(e) => setEditingItem({ ...editingItem, linkTo: e.target.value })}
                    />
                  </div>

                  {/* Portfolio Settings */}
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700">Portfolio Settings</h3>
                    
                    {/* Pin Portfolio */}
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="pinned"
                        checked={editingItem.isPinned || false}
                        onChange={(e) => setEditingItem({ ...editingItem, isPinned: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <label htmlFor="pinned" className="text-sm font-medium text-gray-700">
                          📌 Pin to Landing Page
                        </label>
                        <p className="text-xs text-gray-500">
                          Show this portfolio on the homepage regardless of date. Max 3 pinned items.
                        </p>
                      </div>
                    </div>

                    {/* Password Protection */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
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
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <label htmlFor="passwordProtected" className="text-sm font-medium text-gray-700">
                            🔒 Password Protection
                          </label>
                          <p className="text-xs text-gray-500">
                            Require a password to view this portfolio item
                          </p>
                        </div>
                      </div>
                      
                      {editingItem.isPasswordProtected && (
                        <div className="ml-6">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Portfolio Password *
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter password for this portfolio"
                            value={editingItem.password || ''}
                            onChange={(e) => setEditingItem({ ...editingItem, password: e.target.value })}
                          />
                          <p className="text-xs text-orange-600 mt-1">
                            ⚠️ Users will need this password to view the portfolio details
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Publish Status */}
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="published"
                        checked={editingItem.isPublished !== false} // Default to true if undefined
                        onChange={(e) => setEditingItem({ ...editingItem, isPublished: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <label htmlFor="published" className="text-sm font-medium text-gray-700">
                          🌐 Published
                        </label>
                        <p className="text-xs text-gray-500">
                          Make this portfolio visible to public visitors
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Technologies Used
                    </label>
                    {availableTechTools.length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
                        {availableTechTools.map((tool) => (
                          <label key={tool.id} className="flex items-center space-x-2 text-sm">
                            <input
                              type="checkbox"
                              checked={(editingItem.tech || []).includes(tool.title)}
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
                                    tech: currentTech.filter(t => t !== tool.title)
                                  });
                                }
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <img src={tool.imageURL} alt={tool.title} className="w-5 h-5 object-contain" />
                            <span>{tool.title}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 border border-gray-300 rounded-md bg-gray-50">
                        <p className="text-gray-500 text-sm">No tech tools available.</p>
                        <p className="text-gray-400 text-xs mt-1">Add some tech tools first in the Tech Tools management section.</p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">Select the technologies used in this project</p>
                    
                    {/* Fallback text input for custom tech */}
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Custom Technologies (comma-separated)
                        {techInput && (
                          <span className="ml-1 text-orange-600 font-normal">
                            AI-populated
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                          techInput ? 'border-orange-300 bg-orange-50' : 'border-gray-300'
                        }`}
                        placeholder="Any additional technologies not listed above"
                        value={techInput}
                        onChange={(e) => setTechInput(e.target.value)}
                      />
                      {techInput && (
                        <p className="text-xs text-orange-600 mt-1">
                          These technologies were suggested by AI and will be added to your project
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Professional Roles
                    </label>
                    {availableRoles.length > 0 ? (
                      <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-3">
                        {availableRoles.map((role) => (
                          <label key={role.id} className="flex items-center space-x-2 text-sm">
                            <input
                              type="checkbox"
                              checked={(editingItem.roles || []).includes(role.title)}
                              onChange={(e) => {
                                const currentRoles = editingItem.roles || [];
                                if (e.target.checked) {
                                  setEditingItem({
                                    ...editingItem,
                                    roles: [...currentRoles, role.title]
                                  });
                                } else {
                                  setEditingItem({
                                    ...editingItem,
                                    roles: currentRoles.filter(r => r !== role.title)
                                  });
                                }
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className={`badge badge-${role.color || 'info'} badge-sm`}>
                              {role.title}
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 border border-gray-300 rounded-md bg-gray-50">
                        <p className="text-gray-500 text-sm">No roles available.</p>
                        <p className="text-gray-400 text-xs mt-1">Add some roles first in the Roles management section.</p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">Select the roles that apply to this project</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Image
                    </label>
                    
                    {editingItem.imageURL && (
                      <div className="mb-4">
                        <img
                          src={editingItem.imageURL}
                          alt="Project preview"
                          className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
                        />
                        <p className="text-sm text-gray-500 mt-1">Current image</p>
                      </div>
                    )}
                    
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${imageUploading ? 'opacity-50' : ''}`}
                        onChange={handleImageUpload}
                        disabled={imageUploading}
                      />
                      {imageUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-md">
                          <div className="text-sm text-gray-600">Uploading image...</div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Upload a project screenshot or mockup (PNG, JPG, GIF)</p>
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Details (Markdown)
                  </label>
                  <div data-color-mode="light">
                    <MDEditor
                      value={editingItem.projectDetails}
                      onChange={(val) => setEditingItem({ ...editingItem, projectDetails: val || '' })}
                      preview="edit"
                      hideToolbar={false}
                      height={400}
                    />
                  </div>
                  
                  {/* AI Rewrite Button */}
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      Use Markdown formatting to create rich project descriptions
                    </p>
                    <button
                      onClick={handleRewriteWithAI}
                      disabled={isRewriting || !editingItem.projectDetails?.trim()}
                      className={`px-3 py-1 text-sm rounded-md font-medium ${
                        isRewriting || !editingItem.projectDetails?.trim()
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-300'
                      }`}
                    >
                      {isRewriting ? (
                        <div className="flex items-center">
                          <svg className="w-3 h-3 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Rewriting...
                        </div>
                      ) : (
                        <>✨ Rewrite using AI</>
                      )}
                    </button>
                  </div>
                  
                  {/* AI Error Display */}
                  {aiError && (
                    <div className="mt-2 bg-red-50 border border-red-200 rounded-md p-2">
                      <div className="flex">
                        <svg className="w-4 h-4 text-red-400 mr-1 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className="text-xs text-red-700">{aiError}</p>
                        <button
                          onClick={() => setAiError('')}
                          className="ml-auto text-red-400 hover:text-red-600"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-8">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading || imageUploading}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${(loading || imageUploading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Saving...' : (isAddingNew ? 'Add Project' : 'Save Changes')}
                </button>
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
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800" title="Unpublished">
                              🚫
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
