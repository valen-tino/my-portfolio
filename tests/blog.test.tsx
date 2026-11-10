import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BlogSection from '../src/sections/blog/blog';
import BlogDetail from '../src/pages/BlogDetail';
import { CMSStorage, BlogItem } from '../src/cms/apiStorage';

vi.mock('../src/cms/apiStorage', () => ({
  CMSStorage: {
    getBlogs: vi.fn(),
    getBlog: vi.fn()
  }
}));

const mockBlogs: BlogItem[] = [
  {
    id: 'blog-1',
    _id: 'blog-1',
    title: 'Speaking at Tech Summit 2026',
    slug: 'speaking-at-tech-summit-2026',
    desc: 'Keynote presentation on autonomous AI agents.',
    content: '<p>Summit was extraordinary!</p><div data-portfolio-embed="true" data-portfolio-id="port-99" data-title="Agent Framework" data-desc="Production agents" class="portfolio-embed-card"></div>',
    category: 'Event',
    tags: ['AI', 'Keynote', 'Architecture'],
    imageURL: 'https://res.cloudinary.com/demo/image/upload/summit.jpg',
    date: '2026-05-15',
    year: '2026',
    readTime: '4 min read',
    location: 'San Francisco, CA',
    isPinned: true,
    isPublished: true,
    author: 'Valentino Jehaut'
  },
  {
    id: 'blog-2',
    _id: 'blog-2',
    title: 'Reflections on Full-Stack Engineering',
    slug: 'reflections-on-full-stack-engineering',
    desc: 'Thoughts on frontend-backend cohesion and ergonomics.',
    content: '<p>Personal musings on web dev in 2025.</p>',
    category: 'Personal',
    tags: ['Career', 'WebDev'],
    imageURL: '',
    date: '2025-11-20',
    year: '2025',
    readTime: '3 min read',
    isPinned: false,
    isPublished: true,
    author: 'Valentino Jehaut'
  },
  {
    id: 'blog-3',
    _id: 'blog-3',
    title: 'Unreleased Draft Article',
    slug: 'unreleased-draft-article',
    desc: 'Secret post that should not be visible publicly.',
    content: '<p>Top secret draft.</p>',
    category: 'News',
    tags: ['Secret'],
    imageURL: '',
    date: '2026-01-01',
    year: '2026',
    isPinned: false,
    isPublished: false,
    author: 'Valentino Jehaut'
  }
];

describe('Public Blog & News System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(CMSStorage.getBlogs).mockResolvedValue(mockBlogs);
  });

  it('renders published blog posts and filters out drafts', async () => {
    render(
      <MemoryRouter>
        <BlogSection />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Speaking at Tech Summit 2026')).toBeInTheDocument();
      expect(screen.getByText('Reflections on Full-Stack Engineering')).toBeInTheDocument();
      expect(screen.queryByText('Unreleased Draft Article')).toBeNull();
    });
  });

  it('filters blog posts by category pills and strictly omits categories with 0 published items', async () => {
    render(
      <MemoryRouter>
        <BlogSection />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Speaking at Tech Summit 2026')).toBeInTheDocument();
    });

    // Event and Personal exist and have >0 posts
    expect(screen.getByTestId('category-filter-Event')).toBeInTheDocument();
    expect(screen.getByTestId('category-filter-Personal')).toBeInTheDocument();

    // News and Tech have 0 published posts -> strictly omitted
    expect(screen.queryByTestId('category-filter-News')).toBeNull();
    expect(screen.queryByTestId('category-filter-Tech')).toBeNull();

    // Click 'Personal' category
    const personalBtn = screen.getByTestId('category-filter-Personal');
    fireEvent.click(personalBtn);

    expect(screen.getByText('Reflections on Full-Stack Engineering')).toBeInTheDocument();
    expect(screen.queryByText('Speaking at Tech Summit 2026')).toBeNull();

    // Click 'All' category to restore
    const allBtn = screen.getByTestId('category-filter-All');
    fireEvent.click(allBtn);

    expect(screen.getByText('Speaking at Tech Summit 2026')).toBeInTheDocument();
    expect(screen.getByText('Reflections on Full-Stack Engineering')).toBeInTheDocument();
  });

  it('filters blog posts by year pills and keyword search in archive view with #00BAFE active branding', async () => {
    render(
      <MemoryRouter>
        <BlogSection />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Speaking at Tech Summit 2026')).toBeInTheDocument();
    });

    // Default "All" year button should have active #00BAFE branding
    const allYearBtn = screen.getByTestId('year-filter-All');
    expect(allYearBtn.className).toContain('bg-[#00BAFE]');
    expect(allYearBtn.className).toContain('text-white');

    // Filter by year 2025
    const year2025Btn = screen.getByTestId('year-filter-2025');
    fireEvent.click(year2025Btn);

    expect(year2025Btn.className).toContain('bg-[#00BAFE]');
    expect(year2025Btn.className).toContain('text-white');
    expect(screen.getByText('Reflections on Full-Stack Engineering')).toBeInTheDocument();
    expect(screen.queryByText('Speaking at Tech Summit 2026')).toBeNull();

    // Reset via clear filters button
    const clearBtn = screen.getByTestId('clear-blog-filters');
    fireEvent.click(clearBtn);

    // Search keyword
    const searchInput = screen.getByTestId('blog-search-input');
    fireEvent.change(searchInput, { target: { value: 'Summit' } });

    expect(screen.getByText('Speaking at Tech Summit 2026')).toBeInTheDocument();
    expect(screen.queryByText('Reflections on Full-Stack Engineering')).toBeNull();
  });

  it('establishes proper stacking context hierarchy for tag filter dropdown above blog cards', async () => {
    render(
      <MemoryRouter>
        <BlogSection />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Speaking at Tech Summit 2026')).toBeInTheDocument();
    });

    // Filter bar has relative z-30
    const filterBar = screen.getByTestId('blog-filter-bar');
    expect(filterBar.className).toContain('relative');
    expect(filterBar.className).toContain('z-30');

    // Tag dropdown anchor has relative inline-block z-40
    const tagAnchor = screen.getByTestId('blog-tag-dropdown-anchor');
    expect(tagAnchor.className).toContain('relative');
    expect(tagAnchor.className).toContain('inline-block');
    expect(tagAnchor.className).toContain('z-40');

    // Open dropdown and verify menu has z-50
    const tagDropdownBtn = screen.getByTestId('blog-tag-dropdown-btn');
    fireEvent.click(tagDropdownBtn);

    const tagMenu = screen.getByTestId('blog-tag-menu');
    expect(tagMenu.className).toContain('z-50');

    // Blog posts grid has relative z-10
    const postsGrid = screen.getByTestId('blog-posts-grid');
    expect(postsGrid.className).toContain('relative');
    expect(postsGrid.className).toContain('z-10');
  });

  it('in Homepage mode (limit passed), suppresses search/filter bar and displays latest blogs with "See More Blogs" CTA', async () => {
    render(
      <MemoryRouter>
        <BlogSection limit={3} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Speaking at Tech Summit 2026')).toBeInTheDocument();
    });

    // Filter controls and search box must be completely hidden on homepage
    expect(screen.queryByTestId('blog-category-filter')).toBeNull();
    expect(screen.queryByTestId('blog-search-input')).toBeNull();
    expect(screen.queryByTestId('blog-year-filter')).toBeNull();

    // "See More Blogs" button must be rendered linking to /blogs
    const seeMoreBtn = screen.getByTestId('see-more-blogs-btn');
    expect(seeMoreBtn).toBeInTheDocument();
    expect(seeMoreBtn).toHaveTextContent('See More Blogs');
    expect(seeMoreBtn).toHaveAttribute('href', '/blogs');
  });

  it('in Homepage mode, completely suppresses the section when there are 0 published blogs', async () => {
    vi.mocked(CMSStorage.getBlogs).mockResolvedValueOnce([]);

    const { container } = render(
      <MemoryRouter>
        <BlogSection limit={3} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(CMSStorage.getBlogs).toHaveBeenCalled();
    });

    expect(container.querySelector('#blog')).toBeNull();
    expect(container.firstChild).toBeNull();
  });

  it('renders BlogDetail reading view with metadata and canonical back link to /blogs', async () => {
    vi.mocked(CMSStorage.getBlog).mockResolvedValue(mockBlogs[0]);

    render(
      <MemoryRouter initialEntries={['/blogs/speaking-at-tech-summit-2026']}>
        <Routes>
          <Route path="/blogs/:id" element={<BlogDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('blog-article-detail')).toBeInTheDocument();
      expect(screen.getByText('Speaking at Tech Summit 2026')).toBeInTheDocument();
      expect(screen.getByText('Keynote presentation on autonomous AI agents.')).toBeInTheDocument();
      expect(screen.getByText('Summit was extraordinary!')).toBeInTheDocument();
      expect(screen.getByText('📅 2026-05-15')).toBeInTheDocument();
      expect(screen.getByTestId('back-to-blogs-link')).toHaveAttribute('href', '/blogs');

      const contentBody = screen.getByTestId('blog-content-body');
      expect(contentBody.className).toContain('overflow-x-clip');
      expect(contentBody.className).toContain('min-w-0');
    });
  });

  it('handles 404 cleanly when blog post does not exist', async () => {
    vi.mocked(CMSStorage.getBlog).mockRejectedValue(new Error('Not found'));

    render(
      <MemoryRouter initialEntries={['/blogs/non-existent-article']}>
        <Routes>
          <Route path="/blogs/:id" element={<BlogDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Article Not Found')).toBeInTheDocument();
    });
  });
});
