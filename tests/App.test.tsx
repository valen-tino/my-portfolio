import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../src/App';
import { CMSStorage } from '../src/cms/apiStorage';
import apiService from '../src/services/api';

vi.mock('../src/cms/apiStorage', () => ({
  CMSStorage: {
    getAbout: vi.fn().mockResolvedValue({ description: 'Test about', imageURL: 'me.png' }),
    getTechTools: vi.fn().mockResolvedValue([{ id: '1', title: 'React', imageURL: 'react.svg' }]),
    getRoles: vi.fn().mockResolvedValue([]),
    getEducation: vi.fn().mockResolvedValue([
      {
        id: 'edu-1',
        title: 'B.Sc Computer Science',
        institution: 'Test University',
        startDate: '2020-09',
        endDate: '2024-06',
        description: 'Computer Science Degree',
      },
    ]),
    getPortfolios: vi.fn().mockResolvedValue([]),
    getExperiences: vi.fn().mockResolvedValue([]),
    getBlogs: vi.fn().mockResolvedValue([
      {
        id: 'blog-1',
        title: 'Test Blog',
        category: 'Tech',
        isPublished: true,
        date: '2026-01-01',
      },
    ]),
  },
}));

vi.mock('../src/services/api', () => ({
  default: {
    getExperiences: vi.fn().mockResolvedValue({
      success: true,
      data: [
        {
          id: 'exp-1',
          title: 'Software Engineer',
          status: 'Current',
          companyName: 'Tech Corp',
          startDate: '2024-01',
          description: 'Building software',
          logoURL: '',
        },
      ],
    }),
  },
}));

describe('App Component - Redesign Hierarchy & Floating Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(CMSStorage.getAbout).mockResolvedValue({ description: 'Test about', imageURL: 'me.png' } as any);
    vi.mocked(CMSStorage.getTechTools).mockResolvedValue([{ id: '1', title: 'React', imageURL: 'react.svg' }] as any);
    vi.mocked(CMSStorage.getEducation).mockResolvedValue([
      {
        id: 'edu-1',
        title: 'B.Sc Computer Science',
        institution: 'Test University',
        startDate: '2020-09',
        endDate: '2024-06',
        description: 'Computer Science Degree',
      },
    ] as any);
    vi.mocked(CMSStorage.getPortfolios).mockResolvedValue([]);
    vi.mocked(CMSStorage.getBlogs).mockResolvedValue([
      {
        id: 'blog-1',
        title: 'Test Blog',
        category: 'Tech',
        isPublished: true,
        date: '2026-01-01',
      },
    ] as any);
    vi.mocked(apiService.getExperiences).mockResolvedValue({
      success: true,
      data: [
        {
          id: 'exp-1',
          title: 'Software Engineer',
          status: 'Current',
          companyName: 'Tech Corp',
          startDate: '2024-01',
          description: 'Building software',
          logoURL: '',
        },
      ],
    });
  });

  it('renders public site without any CursorInverter or CursorToggle elements', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(CMSStorage.getPortfolios).toHaveBeenCalled();
    });

    expect(container.querySelector('.cursor-inverter')).toBeNull();
    expect(container.querySelector('[data-cursor-inverter]')).toBeNull();
    expect(localStorage.getItem('cursorInverterEnabled')).toBeNull();
  });

  it('renders redesigned Home sections in editorial hierarchy with floating navigation', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(apiService.getExperiences).toHaveBeenCalled();
      expect(CMSStorage.getEducation).toHaveBeenCalled();
      expect(CMSStorage.getBlogs).toHaveBeenCalled();
    });

    const sectionIds = Array.from(container.querySelectorAll('section[id]'))
      .map((el) => el.id)
      .filter(Boolean);

    expect(sectionIds).toEqual([
      'home',
      'selected-work',
      'process',
      'about',
      'experience',
      'journal',
      'contact',
    ]);

    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
  });

  it('omits #journal section when getBlogs returns empty array', async () => {
    vi.mocked(CMSStorage.getBlogs).mockResolvedValueOnce([]).mockResolvedValueOnce([]);
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(CMSStorage.getBlogs).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(container.querySelector('#journal')).toBeNull();
    });
  });

  it('renders /design-system route cleanly', async () => {
    render(
      <MemoryRouter initialEntries={['/design-system']}>
        <App />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Design system' })).toBeInTheDocument();
    });
  });
});
