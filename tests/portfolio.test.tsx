import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PortfolioPage from '../src/pages/PortfolioPage';
import { CMSStorage, PortfolioItem } from '../src/cms/apiStorage';

vi.mock('../src/cms/apiStorage', () => ({
  CMSStorage: {
    getPortfolios: vi.fn(),
  },
}));

const mockPortfolios: PortfolioItem[] = [
  {
    id: 'p1',
    title: 'Design System Atlas',
    desc: 'Component tokens and multi-brand architecture',
    projectDetails: '<p>Multi-brand design system case study.</p>',
    linkTo: 'https://example.com/atlas',
    roles: ['Design Systems'],
    year: '2024',
    tech: ['React', 'TypeScript'],
    imageURL: '/atlas.jpg',
    isPublished: true,
    isPasswordProtected: false,
    password: '',
  },
  {
    id: 'p2',
    title: 'Checkout Flow Redesign',
    desc: 'Conversion-focused mobile payment experience',
    projectDetails: '<p>Payment UX redesign details.</p>',
    linkTo: 'https://example.com/checkout',
    roles: ['Product Design'],
    year: '2023',
    tech: ['Figma', 'Tailwind CSS'],
    imageURL: '/checkout.jpg',
    isPublished: true,
    isPasswordProtected: false,
    password: '',
  },
  {
    id: 'p-draft',
    title: 'Unreleased Stealth Console',
    desc: 'Confidential draft portfolio',
    projectDetails: '<p>Draft details.</p>',
    linkTo: 'https://example.com/draft',
    roles: ['Stealth Only Role'],
    year: '2021',
    tech: ['RustDraftOnly'],
    imageURL: '/draft.jpg',
    isPublished: false,
    isPasswordProtected: false,
    password: '',
  },
];

describe('PortfolioPage Archive & Filtering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(CMSStorage.getPortfolios).mockResolvedValue(mockPortfolios);
  });

  const renderPage = () =>
    render(
      <MemoryRouter>
        <PortfolioPage />
      </MemoryRouter>
    );

  it('requests published portfolios and excludes unpublished items and their exclusive filter pills', async () => {
    renderPage();

    await waitFor(() => {
      expect(CMSStorage.getPortfolios).toHaveBeenCalledWith(true);
      expect(screen.getByRole('heading', { name: 'Design System Atlas' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Checkout Flow Redesign' })).toBeInTheDocument();
    });

    expect(screen.queryByRole('heading', { name: 'Unreleased Stealth Console' })).not.toBeInTheDocument();
    expect(screen.queryByTestId('year-filter-2021')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Stealth Only Role/i })).not.toBeInTheDocument();
  });

  it('sorts year filter pills descending (2024 before 2023) and filters by year', async () => {
    renderPage();

    const year2024 = await screen.findByTestId('year-filter-2024');
    const year2023 = await screen.findByTestId('year-filter-2023');

    const relation = year2024.compareDocumentPosition(year2023);
    expect(relation & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    fireEvent.click(year2024);

    expect(screen.getByRole('heading', { name: 'Design System Atlas' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Checkout Flow Redesign' })).not.toBeInTheDocument();
  });

  it('filters by role and tech dropdown and clears all active filters', async () => {
    renderPage();

    await screen.findByRole('heading', { name: 'Design System Atlas' });

    fireEvent.click(screen.getByRole('button', { name: /Product Design/i }));
    expect(screen.queryByRole('heading', { name: 'Design System Atlas' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Checkout Flow Redesign' })).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('clear-portfolio-filters'));
    expect(screen.getByRole('heading', { name: 'Design System Atlas' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Checkout Flow Redesign' })).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('portfolio-tech-dropdown-btn'));
    const techMenu = screen.getByTestId('portfolio-tech-menu');
    expect(techMenu).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('tech-option-TypeScript'));

    expect(screen.getByRole('heading', { name: 'Design System Atlas' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Checkout Flow Redesign' })).not.toBeInTheDocument();
  });

  it('filters by keyword search and recovers via Show all projects on empty state', async () => {
    renderPage();

    await screen.findByRole('heading', { name: 'Design System Atlas' });

    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'nonexistent-query-xyz' } });

    const resetButton = await screen.findByRole('button', { name: /Show all projects/i });
    expect(resetButton).toBeInTheDocument();

    fireEvent.click(resetButton);
    expect(screen.getByRole('heading', { name: 'Design System Atlas' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Checkout Flow Redesign' })).toBeInTheDocument();
  });
});
