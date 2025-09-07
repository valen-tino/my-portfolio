import React, { useState, useEffect } from 'react';
import CMSLayout from '../components/CMSLayout';
import { CMSStorage, ContactEntry } from '../apiStorage';

const ContactEntries: React.FC = () => {
  const [contactEntries, setContactEntries] = useState<ContactEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<ContactEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadContactEntries();
  }, []);

  const loadContactEntries = async () => {
    try {
      const entries = await CMSStorage.getContacts();
      setContactEntries(entries);
    } catch (error) {
      console.error('Error loading contact entries:', error);
      setMessage({
        type: 'error',
        text: 'Failed to load contact entries. Please refresh the page.'
      });
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const deleteEntry = async (id: string | number) => {
    if (window.confirm('Are you sure you want to delete this contact entry?')) {
      setLoading(true);
      try {
        await CMSStorage.deleteContact(id);
        setContactEntries(prev => prev.filter(entry => entry.id !== id));
        
        if (selectedEntry?.id === id) {
          setSelectedEntry(null);
        }
        
        setMessage({
          type: 'success',
          text: 'Contact entry deleted successfully!'
        });
      } catch (error) {
        console.error('Delete error:', error);
        setMessage({
          type: 'error',
          text: 'Failed to delete contact entry. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const clearAllEntries = async () => {
    if (window.confirm('Are you sure you want to delete ALL contact entries? This action cannot be undone.')) {
      setLoading(true);
      try {
        // Delete all contact entries one by one (or implement a bulk delete endpoint)
        for (const entry of contactEntries) {
          await CMSStorage.deleteContact(entry.id);
        }
        setContactEntries([]);
        setSelectedEntry(null);
        setMessage({
          type: 'success',
          text: 'All contact entries deleted successfully!'
        });
      } catch (error) {
        console.error('Clear all error:', error);
        setMessage({
          type: 'error',
          text: 'Failed to delete all contact entries. Please try again.'
        });
        // Reload entries to get accurate state
        loadContactEntries();
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <CMSLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Contact Entries</h1>
            <p className="mt-2 text-gray-600">View and manage contact form submissions.</p>
          </div>
          {contactEntries.length > 0 && (
            <button
              onClick={clearAllEntries}
              disabled={loading}
              className={`btn btn-outline btn-error ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {loading ? 'Clearing...' : 'Clear All'}
            </button>
          )}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Entries List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Entries ({contactEntries.length})
                </h2>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {contactEntries.length === 0 ? (
                  <div className="p-8 text-center">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500 mb-2">No contact entries yet</p>
                    <p className="text-sm text-gray-400">
                      When visitors submit your contact form, entries will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 p-4">
                    {contactEntries.map((entry) => (
                      <div
                        key={entry.id}
                        onClick={() => setSelectedEntry(entry)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedEntry?.id === entry.id 
                            ? 'bg-blue-50 border border-blue-200' 
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-medium text-gray-900 text-sm truncate">
                            {entry.name}
                          </h3>
                          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                            {entry.timestamp ? new Date(entry.timestamp).toLocaleDateString() : new Date(entry.createdAt || '').toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{entry.email}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {entry.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Entry Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              {selectedEntry ? (
                <div>
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          {selectedEntry.name}
                        </h2>
                        <p className="text-gray-600 mt-1">{selectedEntry.email}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Received: {formatDate(selectedEntry.timestamp || selectedEntry.createdAt || '')}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <a
                          href={`mailto:${selectedEntry.email}?subject=Re: Contact Form Submission`}
                          className="btn btn-primary btn-sm"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Reply
                        </a>
                        <button
                          onClick={() => deleteEntry(selectedEntry.id)}
                          disabled={loading}
                          className={`btn btn-error btn-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          {loading ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Message</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {selectedEntry.message}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a contact entry
                  </h3>
                  <p className="text-gray-500">
                    Choose an entry from the list to view its details and reply.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        {contactEntries.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Entries</p>
                  <p className="text-2xl font-semibold text-gray-900">{contactEntries.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">This Week</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {contactEntries.filter(entry => {
                      const entryDate = new Date(entry.timestamp || entry.createdAt || '');
                      const oneWeekAgo = new Date();
                      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                      return entryDate > oneWeekAgo;
                    }).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Latest Entry</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {contactEntries.length > 0 
                      ? new Date(contactEntries[0].timestamp || contactEntries[0].createdAt || '').toLocaleDateString()
                      : 'None'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">📧 Contact Management</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Contact form submissions will automatically appear here</li>
            <li>• Click on any entry to view full details</li>
            <li>• Use the "Reply" button to respond via email</li>
            <li>• Delete individual entries or clear all at once</li>
            <li>• Entries are stored locally and persist across browser sessions</li>
          </ul>
        </div>
      </div>
    </CMSLayout>
  );
};

export default ContactEntries;
