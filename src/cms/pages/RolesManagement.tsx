import React, { useState, useEffect } from 'react';
import CMSLayout from '../components/CMSLayout';
import { CMSStorage, Role } from '../apiStorage';

const RolesManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const data = await CMSStorage.getRoles();
      setRoles(data);
    } catch (error) {
      console.error('Error loading roles:', error);
      setMessage({
        type: 'error',
        text: 'Failed to load roles. Please refresh the page.'
      });
    }
  };

  const saveRole = async (role: Role, isNew: boolean = false) => {
    setLoading(true);
    try {
      let savedRole;
      if (isNew) {
        savedRole = await CMSStorage.addRole(role);
        setRoles(prev => [...prev, savedRole]);
      } else {
        savedRole = await CMSStorage.updateRole(role.id, role);
        setRoles(prev => prev.map(r => r.id === role.id ? savedRole : r));
      }
      setMessage({
        type: 'success',
        text: `Role ${isNew ? 'added' : 'updated'} successfully!`
      });
      return savedRole;
    } catch (error) {
      console.error('Save error:', error);
      setMessage({
        type: 'error',
        text: `Failed to ${isNew ? 'add' : 'update'} role. Please try again.`
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    const newRole: Role = {
      id: 'temp-new',
      title: '',
      description: '',
      color: 'info'
    };
    setEditingRole(newRole);
    setIsAddingNew(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setIsAddingNew(false);
  };

  const handleSave = async () => {
    if (!editingRole || !editingRole.title.trim()) {
      setMessage({
        type: 'error',
        text: 'Please provide a title for the role.'
      });
      return;
    }

    try {
      await saveRole(editingRole, isAddingNew);
      setEditingRole(null);
      setIsAddingNew(false);
    } catch (error) {
      // Error already handled in saveRole
    }
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await CMSStorage.deleteRole(id);
        setRoles(prev => prev.filter(r => r.id !== id));
        setMessage({
          type: 'success',
          text: 'Role deleted successfully!'
        });
      } catch (error) {
        console.error('Delete error:', error);
        setMessage({
          type: 'error',
          text: 'Failed to delete role. Please try again.'
        });
      }
    }
  };

  const handleCancel = () => {
    setEditingRole(null);
    setIsAddingNew(false);
  };

  const colorOptions = [
    { value: 'primary', label: 'Primary', preview: 'badge-primary' },
    { value: 'secondary', label: 'Secondary', preview: 'badge-secondary' },
    { value: 'accent', label: 'Accent', preview: 'badge-accent' },
    { value: 'info', label: 'Info', preview: 'badge-info' },
    { value: 'success', label: 'Success', preview: 'badge-success' },
    { value: 'warning', label: 'Warning', preview: 'badge-warning' },
    { value: 'error', label: 'Error', preview: 'badge-error' }
  ];

  return (
    <CMSLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Roles Management</h1>
            <p className="mt-2 text-gray-600">Manage your professional roles and specializations.</p>
          </div>
          <button
            onClick={handleAdd}
            className="btn btn-primary"
            disabled={editingRole !== null}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Role
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
        {editingRole && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {isAddingNew ? 'Add New Role' : 'Edit Role'}
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role Title *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., UI/UX Designer, Web Developer"
                      value={editingRole.title}
                      onChange={(e) => setEditingRole({ ...editingRole, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (optional)
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Brief description of this role"
                      value={editingRole.description || ''}
                      onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Badge Color
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {colorOptions.map((option) => (
                        <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="color"
                            value={option.value}
                            checked={editingRole.color === option.value}
                            onChange={(e) => setEditingRole({ ...editingRole, color: e.target.value })}
                            className="radio radio-sm"
                          />
                          <div className={`badge ${option.preview} badge-sm`}>{option.label}</div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center bg-gray-50 rounded-lg p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-4">Preview</h3>
                    <div className={`badge badge-${editingRole.color || 'info'} badge-lg`}>
                      {editingRole.title || 'Role Title'}
                    </div>
                    {editingRole.description && (
                      <p className="text-sm text-gray-600 mt-3 max-w-xs">
                        {editingRole.description}
                      </p>
                    )}
                  </div>
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
                  disabled={loading}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Saving...' : (isAddingNew ? 'Add Role' : 'Save Changes')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Roles List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Current Roles ({roles.length})
            </h2>
            
            {roles.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6z" />
                </svg>
                <p className="text-gray-500">No roles configured yet.</p>
                <button
                  onClick={handleAdd}
                  className="btn btn-primary mt-4"
                >
                  Add Your First Role
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className={`badge badge-${role.color || 'info'} badge-lg`}>
                        {role.title}
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEdit(role)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          disabled={editingRole !== null}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(role.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          disabled={editingRole !== null}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {role.description && (
                      <p className="text-sm text-gray-600">
                        {role.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">💼 Instructions</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Add your professional roles and specializations</li>
            <li>• Choose different badge colors to categorize your roles</li>
            <li>• These roles can be assigned to portfolio projects for better organization</li>
            <li>• Roles will be used as filters on your portfolio page</li>
            <li>• Keep role titles concise and professional</li>
          </ul>
        </div>
      </div>
    </CMSLayout>
  );
};

export default RolesManagement;
