import React, { useState, useEffect } from 'react';
import CMSLayout from '../components/CMSLayout';
import WYSIWYGEditor from '../components/WYSIWYGEditor';
import { CMSStorage, BlogItem } from '../apiStorage';

const CATEGORIES = ['Event', 'Personal', 'News', 'Tech'] as const;

const BlogManagement: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [editingBlog, setEditingBlog] = useState<BlogItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      const data = await CMSStorage.getBlogs(false);
      setBlogs(data);
    } catch (error) {
      console.error('Error loading blogs:', error);
      setMessage({
        type: 'error',
        text: 'Failed to load blog posts. Please refresh the page.'
      });
    }
  };

  const handleAdd = () => {
    const newBlog: BlogItem = {
      title: '',
      category: 'Personal',
      date: new Date().toISOString().split('T')[0],
      readTime: '3 min read',
      location: '',
      link: '',
      desc: '',
      content: '',
      imageURL: '',
      tags: [],
      isPinned: false,
      isPublished: true
    };
    setEditingBlog(newBlog);
    setIsAddingNew(true);
    setTagInput('');
  };

  const handleEdit = (blog: BlogItem) => {
    setEditingBlog({ ...blog });
    setIsAddingNew(false);
    setTagInput('');
  };

  const handleCancel = () => {
    setEditingBlog(null);
    setIsAddingNew(false);
    setTagInput('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingBlog) return;

    setImageUploading(true);
    try {
      const result = await CMSStorage.uploadBlogImage(file);
      setEditingBlog({
        ...editingBlog,
        imageURL: result.imageURL,
        imageCloudinaryId: result.imageCloudinaryId
      });
      setMessage({
        type: 'success',
        text: 'Cover image uploaded successfully!'
      });
    } catch (error: any) {
      console.error('Image upload error:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Failed to upload cover image.'
      });
    } finally {
      setImageUploading(false);
    }
  };

  const handleAddTag = () => {
    if (!tagInput.trim() || !editingBlog) return;
    const currentTags = editingBlog.tags || [];
    const newTags = tagInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t && !currentTags.includes(t));

    if (newTags.length > 0) {
      setEditingBlog({
        ...editingBlog,
        tags: [...currentTags, ...newTags]
      });
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!editingBlog) return;
    setEditingBlog({
      ...editingBlog,
      tags: (editingBlog.tags || []).filter(t => t !== tagToRemove)
    });
  };

  const handleSave = async () => {
    if (!editingBlog || !editingBlog.title.trim()) {
      setMessage({
        type: 'error',
        text: 'Title is required for the blog post.'
      });
      return;
    }

    setLoading(true);
    try {
      if (isAddingNew) {
        const created = await CMSStorage.addBlog(editingBlog);
        setBlogs(prev => [created, ...prev]);
        setMessage({
          type: 'success',
          text: 'Blog post created successfully!'
        });
      } else {
        const idToUpdate = editingBlog.id || editingBlog._id;
        if (!idToUpdate) throw new Error('Missing blog ID');
        const updated = await CMSStorage.updateBlog(idToUpdate, editingBlog);
        setBlogs(prev => prev.map(b => (b.id === idToUpdate || b._id === idToUpdate ? updated : b)));
        setMessage({
          type: 'success',
          text: 'Blog post updated successfully!'
        });
      }
      setEditingBlog(null);
      setIsAddingNew(false);
    } catch (error: any) {
      console.error('Error saving blog post:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Failed to save blog post. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;

    try {
      await CMSStorage.deleteBlog(id);
      setBlogs(prev => prev.filter(b => b.id !== id && b._id !== id));
      setMessage({
        type: 'success',
        text: 'Blog post deleted successfully!'
      });
    } catch (error) {
      console.error('Delete blog error:', error);
      setMessage({
        type: 'error',
        text: 'Failed to delete blog post.'
      });
    }
  };

  const filteredBlogs = blogs.filter((b) => {
    const matchesCategory = filterCategory === 'All' || b.category === filterCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      b.title.toLowerCase().includes(q) ||
      b.desc.toLowerCase().includes(q) ||
      (b.tags && b.tags.some(t => t.toLowerCase().includes(q)));
    return matchesCategory && matchesSearch;
  });

  return (
    <CMSLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blog & News Management</h1>
            <p className="mt-1 text-gray-600">
              Publish event updates, announcements, and personal engineering commentary.
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="btn btn-primary"
            disabled={editingBlog !== null}
            data-testid="add-blog-btn"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create New Post
          </button>
        </div>

        {/* Status Alert */}
        {message.text && (
          <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            <span>{message.text}</span>
            <button type="button" onClick={() => setMessage({ type: '', text: '' })} className="ml-auto font-bold">
              ✕
            </button>
          </div>
        )}

        {/* Edit / Create Form Modal */}
        {editingBlog && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden" data-testid="blog-edit-form">
            <div className="p-6 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {isAddingNew ? 'Create New Blog Post' : 'Edit Blog Post'}
              </h2>
              <span className="badge badge-info">{editingBlog.category}</span>
            </div>

            <div className="p-6 space-y-6">
              {/* Row 1: Title & Category */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    value={editingBlog.title}
                    onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                    placeholder="e.g. Speaking at Google I/O 2026: The Future of Agents"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="blog-title-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={editingBlog.category}
                    onChange={(e) => setEditingBlog({ ...editingBlog, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    data-testid="blog-category-select"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Date, Read Time, Location, External Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={editingBlog.date}
                    onChange={(e) => setEditingBlog({ ...editingBlog, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Read Time
                  </label>
                  <input
                    type="text"
                    value={editingBlog.readTime || ''}
                    onChange={(e) => setEditingBlog({ ...editingBlog, readTime: e.target.value })}
                    placeholder="e.g. 4 min read"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Location (Optional)
                  </label>
                  <input
                    type="text"
                    value={editingBlog.location || ''}
                    onChange={(e) => setEditingBlog({ ...editingBlog, location: e.target.value })}
                    placeholder="e.g. Mountain View, CA"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    External Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={editingBlog.link || ''}
                    onChange={(e) => setEditingBlog({ ...editingBlog, link: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Cover Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Cover Image
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-full sm:w-48 aspect-video rounded-xl bg-gray-100 border border-gray-300 overflow-hidden flex items-center justify-center shrink-0">
                    {editingBlog.imageURL ? (
                      <img
                        src={editingBlog.imageURL}
                        alt="Blog cover preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">No cover image</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={imageUploading}
                      className="file-input file-input-bordered file-input-sm w-full max-w-xs"
                      data-testid="blog-cover-input"
                    />
                    {imageUploading && (
                      <p className="text-xs text-blue-600 flex items-center gap-1">
                        <span className="loading loading-spinner loading-xs"></span> Uploading cover image...
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Upload a crisp banner image stored directly on Cloudinary.
                    </p>
                  </div>
                </div>
              </div>

              {/* Excerpt / Summary */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Short Excerpt / Summary *
                </label>
                <textarea
                  value={editingBlog.desc}
                  onChange={(e) => setEditingBlog({ ...editingBlog, desc: e.target.value })}
                  rows={2}
                  placeholder="A concise 1-2 sentence teaser for cards and previews..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  data-testid="blog-desc-input"
                />
              </div>

              {/* Tags Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Tags & Topics
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Enter tags separated by commas, e.g. AI, React, Architecture..."
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="btn btn-sm btn-outline"
                  >
                    Add Tag
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(editingBlog.tags || []).map((tag) => (
                    <span key={tag} className="badge badge-neutral gap-1 text-xs py-2 px-2.5">
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-300 ml-1 font-bold"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* WYSIWYG Content Editor */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-semibold text-gray-700">
                    Full Article Content (WYSIWYG)
                  </label>
                  <span className="text-xs text-purple-600 font-medium">
                    💼 Tip: Click "Attach Portfolio" to embed rich case study cards!
                  </span>
                </div>
                <WYSIWYGEditor
                  value={editingBlog.content}
                  onChange={(newHtml) => setEditingBlog({ ...editingBlog, content: newHtml })}
                  enableSectionPresets={false}
                  enableGalleries={true}
                  enablePortfolioEmbed={true}
                  minHeight="350px"
                />
              </div>

              {/* Pinned & Published Toggles */}
              <div className="flex flex-wrap items-center gap-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary checkbox-sm"
                    checked={editingBlog.isPublished !== false}
                    onChange={(e) => setEditingBlog({ ...editingBlog, isPublished: e.target.checked })}
                    data-testid="blog-published-toggle"
                  />
                  <span className="text-sm font-medium text-gray-800">
                    Published (Visible in public blog feed)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-warning checkbox-sm"
                    checked={!!editingBlog.isPinned}
                    onChange={(e) => setEditingBlog({ ...editingBlog, isPinned: e.target.checked })}
                    data-testid="blog-pinned-toggle"
                  />
                  <span className="text-sm font-medium text-gray-800">
                    📌 Pin to top of feed
                  </span>
                </label>
              </div>

              {/* Form Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading || imageUploading}
                  className="btn btn-primary"
                  data-testid="blog-save-btn"
                >
                  {loading ? 'Saving...' : (isAddingNew ? 'Create Post' : 'Save Changes')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Blog Post Feed Table & Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 bg-gray-50/70 border-b border-gray-200 flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Category Pills */}
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setFilterCategory('All')}
                className={`btn btn-xs ${filterCategory === 'All' ? 'btn-primary' : 'btn-ghost'}`}
              >
                All ({blogs.length})
              </button>
              {CATEGORIES.map(cat => {
                const count = blogs.filter(b => b.category === cat).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFilterCategory(cat)}
                    className={`btn btn-xs ${filterCategory === cat ? 'btn-primary' : 'btn-ghost'}`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>

            {/* Keyword Search */}
            <div className="w-full md:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts..."
                className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="blog-search-filter"
              />
            </div>
          </div>

          {/* Posts List */}
          {filteredBlogs.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <p className="text-sm">No blog posts found matching your criteria.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredBlogs.map((blog) => (
                <div
                  key={blog.id || blog._id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
                  data-testid={`blog-row-${blog.id || blog._id}`}
                >
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    {/* Thumbnail */}
                    <div className="w-20 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                      {blog.imageURL ? (
                        <img
                          src={blog.imageURL}
                          alt={blog.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                          No cover
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1 text-left">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {blog.isPinned && (
                          <span className="badge badge-warning badge-xs">📌 Pinned</span>
                        )}
                        <span className="badge badge-outline badge-xs font-semibold">
                          {blog.category}
                        </span>
                        <span className="text-xs text-gray-400">
                          {blog.date} • {blog.readTime || '3 min read'}
                        </span>
                        {blog.isPublished === false ? (
                          <span className="badge badge-warning badge-xs">Draft</span>
                        ) : (
                          <span className="badge badge-success badge-xs">Published</span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-gray-900 truncate">
                        {blog.title}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                        {blog.desc}
                      </p>
                      {blog.tags && blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {blog.tags.map(t => (
                            <span key={t} className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleEdit(blog)}
                      className="btn btn-xs btn-outline"
                      data-testid={`edit-blog-${blog.id || blog._id}`}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(blog.id || blog._id!)}
                      className="btn btn-xs btn-error btn-outline"
                      data-testid={`delete-blog-${blog.id || blog._id}`}
                    >
                      Delete
                    </button>
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

export default BlogManagement;

