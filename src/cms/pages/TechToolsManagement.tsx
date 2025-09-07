import React, { useState, useEffect } from 'react';
import CMSLayout from '../components/CMSLayout';
import { CMSStorage, TechTool } from '../apiStorage';

const TechToolsManagement: React.FC = () => {
  const [techTools, setTechTools] = useState<TechTool[]>([]);
  const [editingTool, setEditingTool] = useState<TechTool | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    loadTechTools();
  }, []);

  const loadTechTools = async () => {
    try {
      const tools = await CMSStorage.getTechTools();
      setTechTools(tools);
    } catch (error) {
      console.error('Error loading tech tools:', error);
      setMessage({
        type: 'error',
        text: 'Failed to load tech tools. Please refresh the page.'
      });
    }
  };

  const saveTechTool = async (tool: TechTool, isNew: boolean = false): Promise<TechTool> => {
    setLoading(true);
    try {
      let savedTool: TechTool;
      if (isNew) {
        savedTool = await CMSStorage.addTechTool(tool);
        setTechTools(prev => [...prev, savedTool].sort((a, b) => (a.order || 0) - (b.order || 0)));
      } else {
        savedTool = await CMSStorage.updateTechTool(tool.id, tool);
        setTechTools(prev => prev.map(t => t.id === tool.id ? savedTool : t).sort((a, b) => (a.order || 0) - (b.order || 0)));
      }
      setMessage({
        type: 'success',
        text: `Tech tool ${isNew ? 'added' : 'updated'} successfully!`
      });
      return savedTool;
    } catch (error) {
      console.error('Save error:', error);
      setMessage({
        type: 'error',
        text: `Failed to ${isNew ? 'add' : 'update'} tech tool. Please try again.`
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    const newTool: TechTool = {
      id: 'temp-new', // Will be assigned by backend
      title: '',
      imageURL: ''
    };
    setEditingTool(newTool);
    setIsAddingNew(true);
  };

  const handleEdit = (tool: TechTool) => {
    setEditingTool(tool);
    setIsAddingNew(false);
  };

  const handleSave = async () => {
    if (!editingTool || !editingTool.title.trim()) {
      setMessage({
        type: 'error',
        text: 'Please provide a title for the tech tool.'
      });
      return;
    }

    try {
      await saveTechTool(editingTool, isAddingNew);
      setEditingTool(null);
      setIsAddingNew(false);
    } catch (error) {
      // Error already handled in saveTechTool
    }
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Are you sure you want to delete this tech tool?')) {
      try {
        await CMSStorage.deleteTechTool(id);
        setTechTools(prev => prev.filter(t => t.id !== id));
        setMessage({
          type: 'success',
          text: 'Tech tool deleted successfully!'
        });
      } catch (error) {
        console.error('Delete error:', error);
        setMessage({
          type: 'error',
          text: 'Failed to delete tech tool. Please try again.'
        });
      }
    }
  };

  const handleCancel = () => {
    setEditingTool(null);
    setIsAddingNew(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingTool) {
      setImageUploading(true);
      try {
        const uploadResult = await CMSStorage.uploadTechToolImage(file);
        setEditingTool({
          ...editingTool,
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
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tech Tools Management</h1>
            <p className="mt-2 text-gray-600">Manage your technology skills and tools.</p>
          </div>
          <button
            onClick={handleAdd}
            className="btn btn-primary"
            disabled={editingTool !== null}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Tool
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
        {editingTool && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {isAddingNew ? 'Add New Tech Tool' : 'Edit Tech Tool'}
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tool Title *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., React JS, Node.js, Python"
                      value={editingTool.title}
                      onChange={(e) => setEditingTool({ ...editingTool, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Icon Image
                    </label>
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
                          <div className="text-sm text-gray-600">Uploading...</div>
                        </div>
                      )}
                    </div>
                    {editingTool.imageURL && !imageUploading && (
                      <p className="text-sm text-gray-500 mt-1">
                        ✓ Image uploaded successfully
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-center bg-gray-50 rounded-lg p-6">
                  {editingTool.imageURL ? (
                    <div className="text-center">
                      <img
                        src={editingTool.imageURL}
                        alt={editingTool.title}
                        className="w-16 h-16 mx-auto object-contain"
                      />
                      <p className="text-sm text-gray-600 mt-2">{editingTool.title || 'Tool Title'}</p>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm">Preview will appear here</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
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
                  {loading ? 'Saving...' : (isAddingNew ? 'Add Tool' : 'Save Changes')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tech Tools Grid */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Current Tech Tools ({techTools.length})
            </h2>
            
            {techTools.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-gray-500">No tech tools configured yet.</p>
                <button
                  onClick={handleAdd}
                  className="btn btn-primary mt-4"
                >
                  Add Your First Tool
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {techTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="group relative bg-gray-50 rounded-lg p-4 text-center hover:shadow-md transition-shadow"
                  >
                    <img
                      src={tool.imageURL}
                      alt={tool.title}
                      className="w-12 h-12 mx-auto mb-2 object-contain"
                    />
                    <p className="text-sm font-medium text-gray-900 truncate" title={tool.title}>
                      {tool.title}
                    </p>
                    
                    {/* Action buttons - show on hover */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEdit(tool)}
                          className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                          disabled={editingTool !== null}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(tool.id)}
                          className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                          disabled={editingTool !== null}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
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
          <h3 className="text-lg font-semibold text-blue-900 mb-2">📝 Instructions</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Click "Add New Tool" to add a technology to your skills showcase</li>
            <li>• Upload icons in SVG or PNG format for best results - images are stored securely in the cloud</li>
            <li>• Hover over existing tools to edit or delete them</li>
            <li>• Tools will appear in the "Some tools that i use..." section of your portfolio</li>
            <li>• These tools can be selected when creating portfolio projects</li>
          </ul>
        </div>
      </div>
    </CMSLayout>
  );
};

export default TechToolsManagement;
