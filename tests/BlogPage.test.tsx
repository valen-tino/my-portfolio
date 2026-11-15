import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import BlogPage from '../src/pages/BlogPage';
import { CMSStorage } from '../src/cms/apiStorage';

vi.mock('../src/cms/apiStorage', () => ({
  CMSStorage: {
    getBlogs: vi.fn(),
  },
}));

const mockBlogItems = [
  {
    id: 'blog-1',
    title: 'Designing Calm Interfaces',
    slug: 'designing-calm-interfaces',
    desc: 'Reducing cognitive load in enterprise products.',
    content: '<p>Details here</p>',
    category: 'Design',
    tags: ['UX', 'Typography'],
    imageURL: '',
    date: '2026-04-10',
    readTime: '4 min read',
    author: 'Valentino',
    isPublished: true,
    createdAt: '2026-04-10',
    updatedAt: '2026-04-10',
  },
  {
    id: 'blog-2',
    title: 'React Performance Notes',
    slug: 'react-performance-notes',
    desc: 'Practical rendering optimization techniques.',
    content: '<p>Notes here</p>',
    category: 'Engineering',
    tags: ['React'],
    imageURL: '',
    date: '2025-11-05',
    readTime: '6 min read',
    author: 'Valentino',
    isPublished: true,
    createdAt: '2025-11-05',
    updatedAt: '2025-11-05',
  },
];

describe('BlogPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(CMSStorage.getBlogs).mockResolvedValue(mockBlogItems as any);
  });

  it('renders <search> article filters, filters by category/year/topic/query, and handles empty reset', async () => {
    render(
      <MemoryRouter initialEntries={['/blogs']}>
        <Routes>
          <Route path="/blogs" element={<BlogPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('2 articles');
    });

    const searchLandmark = document.querySelector('search[aria-label="Filter articles"]');
    expect(searchLandmark).toBeInTheDocument();

    const designCatBtn = screen.getByRole('button', { name: /Design/i });
    expect(designCatBtn).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(designCatBtn);
    expect(designCatBtn).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('1 article');
    expect(screen.getByRole('heading', { level: 3, name: 'Designing Calm Interfaces' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 3, name: 'React Performance Notes' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getByRole('status')).toHaveTextContent('2 articles');

    fireEvent.change(screen.getByLabelText('Year'), { target: { value: '2025' } });
    expect(screen.getByRole('status')).toHaveTextContent('1 article');
    expect(screen.getByRole('heading', { level: 3, name: 'React Performance Notes' })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Topic'), { target: { value: 'Typography' } });
    expect(screen.getByRole('status')).toHaveTextContent('0 articles');
    expect(screen.getByText(/No articles match these filters/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Show all articles' }));
    expect(screen.getByRole('status')).toHaveTextContent('2 articles');

    fireEvent.change(screen.getByLabelText('Search articles'), { target: { value: 'Calm' } });
    expect(screen.getByRole('status')).toHaveTextContent('1 article');
  });
});
