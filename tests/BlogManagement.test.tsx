import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BlogManagement from '../src/cms/pages/BlogManagement';
import { CMSStorage } from '../src/cms/apiStorage';
import { AuthService } from '../src/cms/auth';

vi.mock('../src/cms/apiStorage', () => ({
  CMSStorage: {
    getBlogs: vi.fn(),
    addBlog: vi.fn(),
    updateBlog: vi.fn(),
    deleteBlog: vi.fn(),
    uploadBlogImage: vi.fn(),
    getPortfolios: vi.fn().mockResolvedValue([])
  }
}));

vi.mock('../src/cms/auth', () => ({
  AuthService: {
    getSession: vi.fn().mockReturnValue({ email: 'admin@portfolio.com', token: 'mock-jwt' }),
    isAuthenticated: vi.fn().mockReturnValue(true),
    logout: vi.fn()
  }
}));

const mockBlogs = [
  {
    id: 'blog-1',
    _id: 'blog-1',
    title: 'First Event Recap',
    slug: 'first-event-recap',
    desc: 'Exciting weekend at conference',
    content: '<p>Great talks on AI agents.</p>',
    category: 'Event' as const,
    tags: ['AI', 'Conference'],
    imageURL: 'https://res.cloudinary.com/demo/image/upload/event.jpg',
    date: '2026-06-01',
    isPinned: true,
    isPublished: true
  },
  {
    id: 'blog-2',
    _id: 'blog-2',
    title: 'Draft Feature Review',
    slug: 'draft-feature-review',
    desc: 'Unpublished draft testing',
    content: '<p>Work in progress.</p>',
    category: 'Tech' as const,
    tags: ['WIP'],
    imageURL: '',
    date: '2026-06-02',
    isPinned: false,
    isPublished: false
  }
];

describe('CMS Blog & News Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(CMSStorage.getBlogs).mockResolvedValue([...mockBlogs]);
  });

  it('renders all blog posts with category and status badges', async () => {
    render(
      <MemoryRouter>
        <BlogManagement />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('First Event Recap')).toBeInTheDocument();
      expect(screen.getByText('Draft Feature Review')).toBeInTheDocument();
      expect(screen.getByText('📌 Pinned')).toBeInTheDocument();
      expect(screen.getByText('Draft')).toBeInTheDocument();
      expect(screen.getByText('Published')).toBeInTheDocument();
    });
  });

  it('opens create modal, fills fields, uploads cover image, and saves new blog post', async () => {
    vi.mocked(CMSStorage.uploadBlogImage).mockResolvedValue({
      imageURL: 'https://res.cloudinary.com/demo/image/upload/new-cover.jpg',
      imageCloudinaryId: 'new-cover-id'
    });

    const createdBlog = {
      id: 'blog-3',
      _id: 'blog-3',
      title: 'New Announcement',
      desc: 'Important product updates',
      content: '<p>Exciting news ahead.</p>',
      category: 'News' as const,
      tags: ['Announcement'],
      imageURL: 'https://res.cloudinary.com/demo/image/upload/new-cover.jpg',
      date: '2026-06-03',
      isPinned: false,
      isPublished: true
    };

    vi.mocked(CMSStorage.addBlog).mockResolvedValue(createdBlog);

    render(
      <MemoryRouter>
        <BlogManagement />
      </MemoryRouter>
    );

    const addBtn = screen.getByTestId('add-blog-btn');
    fireEvent.click(addBtn);

    expect(screen.getByTestId('blog-edit-form')).toBeInTheDocument();

    const titleInput = screen.getByTestId('blog-title-input');
    fireEvent.change(titleInput, { target: { value: 'New Announcement' } });

    const descInput = screen.getByTestId('blog-desc-input');
    fireEvent.change(descInput, { target: { value: 'Important product updates' } });

    // Upload cover image
    const fileInput = screen.getByTestId('blog-cover-input');
    const mockFile = new File(['img'], 'cover.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(CMSStorage.uploadBlogImage).toHaveBeenCalledWith(mockFile);
      expect(screen.getByText('Cover image uploaded successfully!')).toBeInTheDocument();
    });

    // Save
    const saveBtn = screen.getByTestId('blog-save-btn');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(CMSStorage.addBlog).toHaveBeenCalled();
      expect(screen.getByText('Blog post created successfully!')).toBeInTheDocument();
      expect(screen.getByText('New Announcement')).toBeInTheDocument();
    });
  });

  it('edits an existing blog post and updates toggles', async () => {
    const updatedBlog = {
      ...mockBlogs[0],
      title: 'Updated Event Recap Title',
      isPinned: false
    };

    vi.mocked(CMSStorage.updateBlog).mockResolvedValue(updatedBlog);

    render(
      <MemoryRouter>
        <BlogManagement />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('edit-blog-blog-1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('edit-blog-blog-1'));

    expect(screen.getByTestId('blog-edit-form')).toBeInTheDocument();

    const titleInput = screen.getByTestId('blog-title-input');
    fireEvent.change(titleInput, { target: { value: 'Updated Event Recap Title' } });

    const pinnedToggle = screen.getByTestId('blog-pinned-toggle');
    fireEvent.click(pinnedToggle);

    const saveBtn = screen.getByTestId('blog-save-btn');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(CMSStorage.updateBlog).toHaveBeenCalledWith(
        'blog-1',
        expect.objectContaining({
          title: 'Updated Event Recap Title',
          isPinned: false
        })
      );
      expect(screen.getByText('Blog post updated successfully!')).toBeInTheDocument();
    });
  });

  it('deletes a blog post after user confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.mocked(CMSStorage.deleteBlog).mockResolvedValue();

    render(
      <MemoryRouter>
        <BlogManagement />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('delete-blog-blog-1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('delete-blog-blog-1'));

    await waitFor(() => {
      expect(CMSStorage.deleteBlog).toHaveBeenCalledWith('blog-1');
      expect(screen.getByText('Blog post deleted successfully!')).toBeInTheDocument();
      expect(screen.queryByText('First Event Recap')).toBeNull();
    });
  });
});

