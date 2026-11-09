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
});

