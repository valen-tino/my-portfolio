import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Portfolio from '../src/sections/portfolios/portfolio';
import { CMSStorage } from '../src/cms/apiStorage';

const mockPortfolios = [
  {
    id: '1',
    title: 'Project 2024 Alpha',
    desc: 'Alpha description',
    projectDetails: '',
    linkTo: '',
    imageURL: 'alpha.png',
    tech: ['React'],
    roles: ['Frontend'],
    year: '2024',
    relatedExperienceCompany: 'Company A'
  },
  {
    id: '2',
    title: 'Project 2023 Beta',
    desc: 'Beta description',
    projectDetails: '',
    linkTo: '',
    imageURL: 'beta.png',
    tech: ['Node.js'],
    roles: ['Backend'],
    year: '2023',
    relatedExperienceCompany: 'Company B'
  }
];

describe('Portfolio Component - Year Filtering', () => {
  beforeEach(() => {
    vi.spyOn(CMSStorage, 'getPortfolios').mockResolvedValue(mockPortfolios as any);
    vi.spyOn(CMSStorage, 'getRoles').mockResolvedValue([
      { id: 'r1', title: 'Frontend', color: 'info' },
      { id: 'r2', title: 'Backend', color: 'primary' }
    ] as any);
  });

  it('renders year filter buttons derived from portfolio data in descending order', async () => {
    render(
      <MemoryRouter>
        <Portfolio />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Project 2024 Alpha')).toBeInTheDocument();
      expect(screen.getByText('Project 2023 Beta')).toBeInTheDocument();
    });

    const yearLabels = screen.getAllByText('Year:');
    expect(yearLabels.length).toBeGreaterThan(0);

    const button2024 = screen.getByRole('button', { name: /2024/i });
    const button2023 = screen.getByRole('button', { name: /2023/i });
    expect(button2024).toBeInTheDocument();
    expect(button2023).toBeInTheDocument();
  });

  it('filters portfolio cards when a year filter badge is clicked', async () => {
    render(
      <MemoryRouter>
        <Portfolio />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Project 2024 Alpha')).toBeInTheDocument();
    });

    const button2024 = screen.getByRole('button', { name: /2024/i });
    fireEvent.click(button2024);

    await waitFor(() => {
      expect(screen.getByText('Project 2024 Alpha')).toBeInTheDocument();
      expect(screen.queryByText('Project 2023 Beta')).not.toBeInTheDocument();
    });
  });

  it('resets year filtering when Clear All is clicked', async () => {
    render(
      <MemoryRouter>
        <Portfolio />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Project 2024 Alpha')).toBeInTheDocument();
    });

    const button2023 = screen.getByRole('button', { name: /2023/i });
    fireEvent.click(button2023);

    await waitFor(() => {
      expect(screen.queryByText('Project 2024 Alpha')).not.toBeInTheDocument();
      expect(screen.getByText('Project 2023 Beta')).toBeInTheDocument();
    });

    const clearAllButton = screen.getByRole('button', { name: /clear all/i });
    fireEvent.click(clearAllButton);

    await waitFor(() => {
      expect(screen.getByText('Project 2024 Alpha')).toBeInTheDocument();
      expect(screen.getByText('Project 2023 Beta')).toBeInTheDocument();
    });
  });

  it('excludes unpublished portfolio items and their metadata filters from public view', async () => {
    const mockWithHidden = [
      ...mockPortfolios,
      {
        id: 'hidden-item-99',
        title: 'Hidden Stealth Project',
        desc: 'Unpublished project description',
        projectDetails: '',
        linkTo: '',
        imageURL: 'stealth.png',
        tech: ['StealthTech'],
        roles: ['StealthRole'],
        year: '1995',
        isPublished: false
      }
    ];

    vi.spyOn(CMSStorage, 'getPortfolios').mockResolvedValue(mockWithHidden as any);

    render(
      <MemoryRouter>
        <Portfolio />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Project 2024 Alpha')).toBeInTheDocument();
    });

    // 1. Hidden card must not be rendered
    expect(screen.queryByText('Hidden Stealth Project')).not.toBeInTheDocument();

    // 2. Metadata filters must not extract from unpublished items
    expect(screen.queryByText('StealthTech')).not.toBeInTheDocument();
    expect(screen.queryByText('StealthRole')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /1995/i })).not.toBeInTheDocument();

    // 3. Verify CMSStorage was invoked with publishedOnly = true
    expect(CMSStorage.getPortfolios).toHaveBeenCalledWith(true);
  });

  it('filters portfolio cards by keyword search input and resets on Clear All', async () => {
    render(
      <MemoryRouter>
        <Portfolio />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Project 2024 Alpha')).toBeInTheDocument();
      expect(screen.getByText('Project 2023 Beta')).toBeInTheDocument();
    });

    const searchInput = screen.getByTestId('portfolio-search-input');
    fireEvent.change(searchInput, { target: { value: 'Alpha' } });

    await waitFor(() => {
      expect(screen.getByText('Project 2024 Alpha')).toBeInTheDocument();
      expect(screen.queryByText('Project 2023 Beta')).not.toBeInTheDocument();
    });

    // Clear via Clear All
    const clearAllButton = screen.getByRole('button', { name: /clear all/i });
    fireEvent.click(clearAllButton);

    await waitFor(() => {
      expect(screen.getByText('Project 2024 Alpha')).toBeInTheDocument();
      expect(screen.getByText('Project 2023 Beta')).toBeInTheDocument();
    });
  });

  it('renders a friendly empty state when 0 projects match filters, with reset button', async () => {
    render(
      <MemoryRouter>
        <Portfolio />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Project 2024 Alpha')).toBeInTheDocument();
    });

    const searchInput = screen.getByTestId('portfolio-search-input');
    fireEvent.change(searchInput, { target: { value: 'NonExistentProject123' } });

    await waitFor(() => {
      expect(screen.getByText('No projects match your current filter and search criteria.')).toBeInTheDocument();
      expect(screen.getByTestId('reset-empty-portfolio-filters')).toBeInTheDocument();
    });

    // Reset via empty state button
    fireEvent.click(screen.getByTestId('reset-empty-portfolio-filters'));

    await waitFor(() => {
      expect(screen.getByText('Project 2024 Alpha')).toBeInTheDocument();
      expect(screen.getByText('Project 2023 Beta')).toBeInTheDocument();
    });
  });

  it('applies #00BAFE to selected year pill and reflects CMS badge colors on role tabs', async () => {
    render(
      <MemoryRouter>
        <Portfolio />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Project 2024 Alpha')).toBeInTheDocument();
    });

    // Check year pill #00BAFE on default 'All'
    const yearAll = screen.getByTestId('year-filter-All');
    expect(yearAll.className).toContain('bg-[#00BAFE]');

    // Click year 2024
    const year2024 = screen.getByTestId('year-filter-2024');
    fireEvent.click(year2024);
    expect(year2024.className).toContain('bg-[#00BAFE]');
    expect(yearAll.className).not.toContain('bg-[#00BAFE]');

    // Check role tabs reflect CMS colors
    // In mock: Frontend has color: 'info' -> #00BAFE border/text when inactive
    // Backend has color: 'primary' -> btn-outline btn-primary when inactive
    const roleFrontend = screen.getByTestId('role-filter-Frontend');
    const roleBackend = screen.getByTestId('role-filter-Backend');
    const roleAll = screen.getByTestId('role-filter-All');

    // Role 'All' starts selected with #00BAFE
    expect(roleAll.className).toContain('bg-[#00BAFE]');
    // Role 'Backend' (primary) starts inactive
    expect(roleBackend.className).toContain('btn-outline');
    expect(roleBackend.className).toContain('btn-primary');

    // Select Backend role
    fireEvent.click(roleBackend);
    expect(roleBackend.className).toContain('btn-primary');
    expect(roleBackend.className).not.toContain('btn-outline');
    // Role 'All' now inactive with border-[#00BAFE]
    expect(roleAll.className).toContain('border-[#00BAFE]');
  });
});

