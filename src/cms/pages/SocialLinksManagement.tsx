import React, { useEffect, useMemo, useState } from 'react';
import CMSLayout from '../components/CMSLayout';
import { CMSStorage, type CMSSocialLink } from '../apiStorage';

interface SocialLinkFormState {
  name: string;
  handle: string;
  url: string;
  actionLabel: string;
  icon: string;
  order: number;
  isPublished: boolean;
}

const ICON_OPTIONS = [
  { value: 'globe', label: 'Website / Globe' },
  { value: 'mail', label: 'Email (Mail)' },
  { value: 'github', label: 'GitHub' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'X / Twitter' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'dribbble', label: 'Dribbble' },
  { value: 'youtube', label: 'YouTube' },
];

const SocialLinksManagement: React.FC = () => {
  const [links, setLinks] = useState<CMSSocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingLink, setEditingLink] = useState<CMSSocialLink | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formState, setFormState] = useState<SocialLinkFormState>({
    name: '',
    handle: '',
    url: '',
    actionLabel: 'Connect',
    icon: 'globe',
    order: 1,
    isPublished: true,
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const sortedLinks = useMemo(
    () => [...links].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [links]
  );

  const loadLinks = async () => {
    try {
      setLoading(true);
      const data = await CMSStorage.getSocialLinks();
      setLinks(data);
    } catch (error) {
      console.error('Error loading social links:', error);
      setMessage({
        type: 'error',
        text: 'Failed to load social links.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLinks();
  }, []);

  const resetForm = () => {
    setEditingLink(null);
    setIsAddingNew(false);
    setFormState({
      name: '',
      handle: '',
      url: '',
      actionLabel: 'Connect',
      icon: 'globe',
      order: sortedLinks.length + 1,
      isPublished: true,
    });
  };

  const handleStartAdd = () => {
    setIsAddingNew(true);
    setEditingLink(null);
    setMessage({ type: '', text: '' });
    setFormState({
      name: '',
      handle: '',
      url: '',
      actionLabel: 'Connect',
      icon: 'globe',
      order: sortedLinks.length + 1,
      isPublished: true,
    });
  };

  const handleStartEdit = (link: CMSSocialLink) => {
    setIsAddingNew(false);
    setEditingLink(link);
    setMessage({ type: '', text: '' });
    setFormState({
      name: link.name,
      handle: link.handle || '',
      url: link.url,
      actionLabel: link.actionLabel || 'Connect',
      icon: link.icon || 'globe',
      order: link.order ?? 0,
      isPublished: link.isPublished !== false,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim() || !formState.url.trim()) {
      setMessage({
        type: 'error',
        text: 'Platform name and URL are required.',
      });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        name: formState.name.trim(),
        handle: formState.handle.trim(),
        url: formState.url.trim(),
        actionLabel: formState.actionLabel.trim() || 'Connect',
        icon: formState.icon || 'globe',
        order: Number.isFinite(Number(formState.order)) ? Number(formState.order) : 0,
        isPublished: formState.isPublished,
      };

      if (editingLink) {
        const targetId = String(editingLink._id || editingLink.id);
        await CMSStorage.updateSocialLink(targetId, payload);
        setMessage({
          type: 'success',
          text: 'Social link updated successfully!',
        });
      } else {
        await CMSStorage.addSocialLink(payload);
        setMessage({
          type: 'success',
          text: 'Social link created successfully!',
        });
      }

      resetForm();
      await loadLinks();
    } catch (error: any) {
      console.error('Save social link error:', error);
      const serverMsg = error?.response?.data?.message || error?.message;
      setMessage({
        type: 'error',
        text: serverMsg || 'Failed to save social link.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (link: CMSSocialLink) => {
    if (!window.confirm(`Delete "${link.name}" from your social links?`)) {
      return;
    }

    try {
      const targetId = String(link._id || link.id);
      await CMSStorage.deleteSocialLink(targetId);
      setMessage({
        type: 'success',
        text: `"${link.name}" deleted successfully.`,
      });
      await loadLinks();
    } catch (error: any) {
      console.error('Delete social link error:', error);
      setMessage({
        type: 'error',
        text: error?.response?.data?.message || 'Failed to delete social link.',
      });
    }
  };

  const handleTogglePublished = async (link: CMSSocialLink) => {
    try {
      const targetId = String(link._id || link.id);
      await CMSStorage.updateSocialLink(targetId, {
        isPublished: link.isPublished === false,
      });
      await loadLinks();
    } catch (error) {
      console.error('Toggle social link visibility error:', error);
      setMessage({
        type: 'error',
        text: 'Failed to update social link visibility.',
      });
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= sortedLinks.length) return;

    const current = sortedLinks[index];
    const target = sortedLinks[swapIndex];
    const currentOrder = current.order ?? index + 1;
    const targetOrder = target.order ?? swapIndex + 1;
    const resolvedCurrentOrder = currentOrder === targetOrder ? swapIndex + 1 : targetOrder;
    const resolvedTargetOrder = currentOrder === targetOrder ? index + 1 : currentOrder;

    try {
      await Promise.all([
        CMSStorage.updateSocialLink(String(current._id || current.id), {
          order: resolvedCurrentOrder,
        }),
        CMSStorage.updateSocialLink(String(target._id || target.id), {
          order: resolvedTargetOrder,
        }),
      ]);
      await loadLinks();
    } catch (error) {
      console.error('Reorder social links error:', error);
      setMessage({
        type: 'error',
        text: 'Failed to reorder social links.',
      });
    }
  };

  const handleSeedDefaults = async () => {
    try {
      setSaving(true);
      await CMSStorage.seedSocialLinks();
      setMessage({
        type: 'success',
        text: 'Default social links imported successfully!',
      });
      await loadLinks();
    } catch (error: any) {
      console.error('Seed social links error:', error);
      setMessage({
        type: 'error',
        text: error?.response?.data?.message || 'Failed to import default social links.',
      });
    } finally {
      setSaving(false);
    }
  };

  const isFormOpen = isAddingNew || editingLink !== null;

  return (
    <CMSLayout>
      <div className="container mx-auto max-w-6xl p-4 space-y-6 text-gray-900">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Social Links Management</h1>
            <p className="text-gray-600 mt-2">
              Manage the social &amp; contact links displayed in the Contact section and Footer.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {sortedLinks.length === 0 && !loading && (
              <button
                type="button"
                onClick={handleSeedDefaults}
                disabled={saving}
                className="btn bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
              >
                Import Default Social Links
              </button>
            )}
            <button
              type="button"
              onClick={handleStartAdd}
              disabled={isFormOpen}
              className="btn btn-primary text-white"
            >
              + Add Social Link
            </button>
          </div>
        </div>

        {/* Status Message */}
        {message.text && (
          <div
            role="status"
            className={`p-4 rounded-lg border flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <span>{message.text}</span>
          </div>
        )}

        {/* Create / Edit Form */}
        {isFormOpen && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {editingLink ? `Edit Link: ${editingLink.name}` : 'Add New Social Link'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="social-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Platform Name *
                  </label>
                  <input
                    id="social-name"
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., GitHub, LinkedIn, Instagram"
                    className="w-full px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="social-url" className="block text-sm font-medium text-gray-700 mb-1.5">
                    URL *
                  </label>
                  <input
                    id="social-url"
                    type="text"
                    required
                    value={formState.url}
                    onChange={(e) => setFormState((prev) => ({ ...prev, url: e.target.value }))}
                    placeholder="https://github.com/username or mailto:..."
                    className="w-full px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div>
                  <label htmlFor="social-handle" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Handle / Display Label
                  </label>
                  <input
                    id="social-handle"
                    type="text"
                    value={formState.handle}
                    onChange={(e) => setFormState((prev) => ({ ...prev, handle: e.target.value }))}
                    placeholder="e.g., @valentinojehaut"
                    className="w-full px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="social-action-label" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Action Label
                  </label>
                  <input
                    id="social-action-label"
                    type="text"
                    value={formState.actionLabel}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, actionLabel: e.target.value }))
                    }
                    placeholder="e.g., Follow Me, Connect"
                    className="w-full px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="social-icon" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Icon Type
                  </label>
                  <select
                    id="social-icon"
                    value={formState.icon}
                    onChange={(e) => setFormState((prev) => ({ ...prev, icon: e.target.value }))}
                    className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="social-order" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Order
                  </label>
                  <input
                    id="social-order"
                    type="number"
                    min={0}
                    value={formState.order}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        order: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.isPublished}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, isPublished: e.target.checked }))
                    }
                    className="toggle toggle-success"
                  />
                  <span className="text-sm font-medium text-gray-700">Published on site</span>
                </label>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={saving}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn btn-primary text-white"
                  >
                    {saving ? 'Saving...' : editingLink ? 'Update Link' : 'Create Link'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Links List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Social Links ({sortedLinks.length})
          </h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : sortedLinks.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <p className="text-gray-600">
                No social links saved in the database yet. Import the default links or create a new link above.
              </p>
              <button
                type="button"
                onClick={handleSeedDefaults}
                disabled={saving}
                className="btn btn-outline btn-primary"
              >
                Import Default Social Links
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedLinks.map((link, index) => (
                <div
                  key={String(link._id || link.id || `${link.name}-${index}`)}
                  className="rounded-lg border border-gray-200 bg-gray-50/70 p-5 hover:border-gray-300 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-900">{link.name}</h3>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                          {link.icon || 'globe'}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            link.isPublished !== false
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-gray-100 text-gray-700 border-gray-300'
                          }`}
                        >
                          {link.isPublished !== false ? 'Published' : 'Hidden'}
                        </span>
                        <span className="text-xs text-gray-500">Order: {link.order ?? 0}</span>
                      </div>
                      <p className="text-sm text-gray-700 truncate">
                        {link.handle ? `${link.handle} · ` : ''}
                        <span className="text-blue-700">{link.url}</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        aria-label={`Move ${link.name} up`}
                        disabled={index === 0}
                        onClick={() => handleMove(index, 'up')}
                        className="px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-40"
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        aria-label={`Move ${link.name} down`}
                        disabled={index === sortedLinks.length - 1}
                        onClick={() => handleMove(index, 'down')}
                        className="px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-40"
                      >
                        Down
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTogglePublished(link)}
                        className="px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100"
                      >
                        {link.isPublished !== false ? 'Hide' : 'Publish'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(link)}
                        className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-white border border-blue-200 rounded-md hover:bg-blue-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(link)}
                        className="px-3 py-1.5 text-xs font-medium text-red-700 bg-white border border-red-200 rounded-md hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </CMSLayout>
  );
};

export default SocialLinksManagement;

