import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BlogPage from '../src/pages/BlogPage';
import BlogDetail from '../src/pages/BlogDetail';
import Home from '../src/pages/Home';
import { CMSStorage, BlogItem } from '../src/cms/apiStorage';

vi.mock('../src/cms/apiStorage', () => ({
  CMSStorage: {
    getBlogs: vi.fn(),
    getBlog: vi.fn(),
    getPortfolios: vi.fn(),
    getAbout: vi.fn(),
    getTechTools: vi.fn(),
    getEducation: vi.fn(),
    addContactEntry: vi.fn(),
  }
}));

vi.mock('../src/services/api', () => ({
  default: {
    getExperiences: vi.fn().mockResolvedValue({ success: true, data: [] }),
  },
  apiService: {
    getExperiences: vi.fn().mockResolvedValue({ success: true, data: [] }),
  },
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
    vi.mocked(CMSStorage.getPortfolios).mockResolvedValue([]);
    vi.mocked(CMSStorage.getAbout).mockResolvedValue({ description: 'Bio', imageURL: '/face.jpg' });
    vi.mocked(CMSStorage.getTechTools).mockResolvedValue([]);
    vi.mocked(CMSStorage.getEducation).mockResolvedValue([]);
  });

  it('renders published blog posts on BlogPage and filters out drafts', async () => {
    render(
      <MemoryRouter>
        <BlogPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(CMSStorage.getBlogs).toHaveBeenCalledWith(true);
      expect(screen.getByRole('heading', { name: 'Speaking at Tech Summit 2026' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Reflections on Full-Stack Engineering' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Unreleased Draft Article' })).toBeNull();
    });
  });

  it('filters blog posts by category pills on BlogPage and omits categories with 0 published items', async () => {
    render(
      <MemoryRouter>
        <BlogPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Speaking at Tech Summit 2026' })).toBeInTheDocument();
    });

    const categoryGroup = screen.getByRole('group', { name: 'Filter by category' });
    expect(within(categoryGroup).getByRole('button', { name: /Event/i })).toBeInTheDocument();
    expect(within(categoryGroup).getByRole('button', { name: /Personal/i })).toBeInTheDocument();
    expect(within(categoryGroup).queryByRole('button', { name: /News/i })).toBeNull();
    expect(within(categoryGroup).queryByRole('button', { name: /Tech/i })).toBeNull();

    fireEvent.click(within(categoryGroup).getByRole('button', { name: /Personal/i }));
    expect(screen.getByRole('heading', { name: 'Reflections on Full-Stack Engineering' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Speaking at Tech Summit 2026' })).toBeNull();

    fireEvent.click(within(categoryGroup).getByRole('button', { name: /All/i }));
    expect(screen.getByRole('heading', { name: 'Speaking at Tech Summit 2026' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Reflections on Full-Stack Engineering' })).toBeInTheDocument();
  });

  it('filters blog posts by year select, topic select, and keyword search on BlogPage', async () => {
    render(
      <MemoryRouter>
        <BlogPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Speaking at Tech Summit 2026' })).toBeInTheDocument();
    });

    const yearSelect = screen.getByLabelText('Year');
    fireEvent.change(yearSelect, { target: { value: '2025' } });
    expect(screen.getByRole('heading', { name: 'Reflections on Full-Stack Engineering' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Speaking at Tech Summit 2026' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /Clear filters/i }));

    const tagSelect = screen.getByLabelText('Topic');
    fireEvent.change(tagSelect, { target: { value: 'Architecture' } });
    expect(screen.getByRole('heading', { name: 'Speaking at Tech Summit 2026' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Reflections on Full-Stack Engineering' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /Clear filters/i }));

    const searchInput = screen.getByLabelText('Search articles');
    fireEvent.change(searchInput, { target: { value: 'Summit' } });
    expect(screen.getByRole('heading', { name: 'Speaking at Tech Summit 2026' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Reflections on Full-Stack Engineering' })).toBeNull();
  });

  it('suppresses #journal section on Home when there are 0 published blogs', async () => {
    vi.mocked(CMSStorage.getBlogs).mockResolvedValueOnce([]);

    const { container } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(CMSStorage.getBlogs).toHaveBeenCalledWith(true);
    });

    expect(container.querySelector('#journal')).toBeNull();
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
      expect(screen.getByRole('heading', { level: 1, name: 'Speaking at Tech Summit 2026' })).toBeInTheDocument();
      expect(screen.getByText('Keynote presentation on autonomous AI agents.')).toBeInTheDocument();
      expect(screen.getByText('Summit was extraordinary!')).toBeInTheDocument();
      expect(screen.getByText('May 15, 2026')).toHaveAttribute('datetime', '2026-05-15');
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
