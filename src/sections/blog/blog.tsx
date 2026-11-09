import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import BlogCard from './blogcard';
import { CMSStorage, BlogItem } from '../../cms/apiStorage';

const ALL_CATEGORIES = ['Event', 'Personal', 'News', 'Tech'] as const;

interface BlogSectionProps {
  limit?: number;
  showArchiveLink?: boolean;
}

const BlogSection: React.FC<BlogSectionProps> = ({ limit }) => {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const tagDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await CMSStorage.getBlogs(true);
        const published = (data || []).filter((b) => b.isPublished !== false);
        setBlogs(published);
      } catch (error) {
        console.error('Error fetching public blogs:', error);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  // Close tag dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(e.target as Node)) {
        setTagDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dynamic category pills: only show categories that have at least 1 published blog post
  const visibleCategories = [
    'All',
    ...ALL_CATEGORIES.filter((cat) => blogs.some((b) => b.category === cat))
  ];

  // Defensive auto-reset if selectedCategory is no longer available
  useEffect(() => {
    if (selectedCategory !== 'All' && !visibleCategories.includes(selectedCategory as any)) {
      setSelectedCategory('All');
    }
  }, [visibleCategories, selectedCategory]);

  // Compute available filter options strictly from published blogs
  const availableYears = Array.from(
    new Set(
      blogs
        .map((b) => {
          if (b.year) return b.year;
          if (b.date) {
            const m = String(b.date).match(/\b(19\d\d|20\d\d)\b/);
            return m ? m[0] : '';
          }
          return '';
        })
        .filter(Boolean)
    )
  ).sort((a, b) => b.localeCompare(a));

  const availableTags = Array.from(
    new Set(blogs.flatMap((b) => (Array.isArray(b.tags) ? b.tags : [])))
  ).sort();

  // Filter blogs (Archive mode)
  const filtered = blogs.filter((blog) => {
    // Category filter
    if (selectedCategory !== 'All' && blog.category !== selectedCategory) {
      return false;
    }

    // Year filter
    if (selectedYear !== 'All') {
      const y = blog.year || (blog.date ? String(blog.date).slice(0, 4) : '');
      if (y !== selectedYear) return false;
    }

    // Tag filter
    if (selectedTag !== 'All') {
      if (!blog.tags || !blog.tags.includes(selectedTag)) {
        return false;
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = (blog.title || '').toLowerCase().includes(q);
      const matchDesc = (blog.desc || '').toLowerCase().includes(q);
      const matchTags = (blog.tags || []).some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTags) return false;
    }

    return true;
  });

  const handleClearFilters = () => {
    setSelectedCategory('All');
    setSelectedYear('All');
    setSelectedTag('All');
    setSearchQuery('');
  };

  const isFiltered = selectedCategory !== 'All' || selectedYear !== 'All' || selectedTag !== 'All' || searchQuery.trim() !== '';

  // Mode 1: Homepage preview mode (limit is present)
  if (limit) {
    // Suppress entire section when loading or if there are no blogs at all
    if (loading || blogs.length === 0) {
      return null;
    }

    const latestBlogs = blogs.slice(0, limit);

    return (
      <section id="blog" className="section bg-base-100 py-16">
        <div className="section-container">
          <div className="w-full">
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-base-content mb-3">
                Personal <span className="text-info">Blog</span>
              </h2>
              <p className="text-base text-base-content/70 max-w-2xl mx-auto">
                Event recaps, project announcements, and personal engineering commentary.
              </p>
            </div>

            {/* Latest Blogs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {latestBlogs.map((blog) => (
                <BlogCard key={blog.id || blog._id} item={blog} />
              ))}
            </div>

            {/* See More Blogs CTA */}
            <div className="text-center mt-8 sm:mt-10 lg:mt-12">
              <Link
                to="/blogs"
                className="btn btn-outline btn-info btn-sm sm:btn-md"
                data-testid="see-more-blogs-btn"
              >
                See More Blogs
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Mode 2: Archive mode (limit is undefined)
  const displayedBlogs = filtered;

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-bold text-base-content mb-3">
          Personal <span className="text-info">Blog</span>
        </h2>
        <p className="text-base text-base-content/70 max-w-2xl mx-auto">
          Event recaps and personal comments about anything.
        </p>
      </div>

      {/* Multi-Dimensional Filter Bar (Archive view only) */}
      <div className="bg-base-200/60 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-base-300 shadow-sm mb-10 space-y-4">
        {/* Row 1: Category Pills & Search Input */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-1.5" data-testid="blog-category-filter">
            <span className="text-xs font-semibold text-base-content/60 mr-1 hidden sm:inline">Category:</span>
            {visibleCategories.map((cat) => {
              const count = cat === 'All'
                ? blogs.length
                : blogs.filter((b) => b.category === cat).length;
              const isSelected = selectedCategory === cat;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`btn btn-xs sm:btn-sm gap-1.5 rounded-full transition-all ${isSelected
                    ? 'btn-primary shadow-sm font-semibold'
                    : 'btn-ghost hover:bg-base-300'
                    }`}
                  data-testid={`category-filter-${cat}`}
                >
                  <span>{cat}</span>
                  <span className={`badge badge-xs ${isSelected ? 'badge-neutral' : 'badge-ghost'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="w-full md:w-64 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles & topics..."
              className="input input-bordered input-sm w-full pl-8 text-xs rounded-full bg-base-100"
              data-testid="blog-search-input"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-base-content/40 text-xs">
              🔍
            </span>
          </div>
        </div>

        {/* Row 2: Year Filter, Tags Dropdown, and Clear All */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-base-300/60">
          <div className="flex flex-wrap items-center gap-2">
            {/* Year Selector */}
            {availableYears.length > 0 && (
              <div className="flex items-center gap-1.5" data-testid="blog-year-filter">
                <span className="text-xs font-semibold text-base-content/60 mr-1">Year:</span>
                <button
                  type="button"
                  onClick={() => setSelectedYear('All')}
                  className={`btn btn-xs rounded-full ${selectedYear === 'All' ? 'btn-primary font-semibold' : 'btn-ghost'
                    }`}
                  data-testid="year-filter-All"
                >
                  All
                </button>
                {availableYears.map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setSelectedYear(yr)}
                    className={`btn btn-xs rounded-full ${selectedYear === yr ? 'btn-primary font-semibold' : 'btn-ghost'
                      }`}
                    data-testid={`year-filter-${yr}`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            )}

            {/* Tags Dropdown */}
            {availableTags.length > 0 && (
              <div className="relative inline-block" ref={tagDropdownRef}>
                <button
                  type="button"
                  onClick={() => setTagDropdownOpen(!tagDropdownOpen)}
                  className={`btn btn-xs rounded-full gap-1 border-base-300 ${selectedTag !== 'All' ? 'btn-accent' : 'btn-outline'
                    }`}
                  data-testid="blog-tag-dropdown-btn"
                >
                  <span>🏷️ {selectedTag === 'All' ? 'Filter by Tag' : `#${selectedTag}`}</span>
                  <span>▾</span>
                </button>

                {tagDropdownOpen && (
                  <div
                    className="absolute left-0 mt-1 w-56 max-h-60 overflow-y-auto bg-base-100 rounded-xl shadow-xl border border-base-300 z-50 p-2 text-xs"
                    data-testid="blog-tag-menu"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTag('All');
                        setTagDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors ${selectedTag === 'All' ? 'bg-primary text-primary-content font-bold' : 'hover:bg-base-200'
                        }`}
                    >
                      All Tags
                    </button>
                    {availableTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setSelectedTag(tag);
                          setTagDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${selectedTag === tag ? 'bg-primary text-primary-content font-bold' : 'hover:bg-base-200'
                          }`}
                        data-testid={`tag-option-${tag}`}
                      >
                        <span>#{tag}</span>
                        <span className="text-[10px] opacity-60">
                          {blogs.filter((b) => b.tags && b.tags.includes(tag)).length}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Clear Filters Button */}
          {isFiltered && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="btn btn-ghost btn-xs text-error gap-1 hover:bg-error/10"
              data-testid="clear-blog-filters"
            >
              ✕ Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Grid of Blog Posts */}
      {displayedBlogs.length === 0 ? (
        <div className="text-center py-20 bg-base-200/30 rounded-2xl border border-base-300">
          <p className="text-base text-base-content/60 mb-3">
            {blogs.length === 0
              ? 'No articles published yet.'
              : 'No articles match your current filter selections.'}
          </p>
          {isFiltered && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="btn btn-primary btn-sm"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {displayedBlogs.map((blog) => (
            <BlogCard key={blog.id || blog._id} item={blog} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogSection;
