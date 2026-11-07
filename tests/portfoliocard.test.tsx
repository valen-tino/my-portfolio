import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import PortfolioCard from '../src/sections/portfolios/portfoliocard';
import { PortfolioItem } from '../src/cms/apiStorage';

const mockItems: PortfolioItem[] = [
  {
    id: '1',
    title: 'Enterprise Cloud Analytics & Real-Time Monitoring Platform',
    desc: 'A comprehensive full-stack platform designed to monitor real-time cloud infrastructure metrics, logs, and performance across distributed nodes.',
    projectDetails: '<p>Full details</p>',
    linkTo: 'https://example.com',
    imageURL: 'bcs.png',
    tech: ['React JS', 'TypeScript', 'Tailwind CSS', 'Node.js', 'MongoDB', 'Docker'],
    roles: ['Fullstack Developer']
  }
];

describe('PortfolioCard Component - Truncation & Layout Fix', () => {
  it('renders full title and description in hover title attributes to prevent information loss', () => {
    render(
      <MemoryRouter>
        <PortfolioCard items={mockItems} />
      </MemoryRouter>
    );

    const heading = screen.getByRole('heading', { name: mockItems[0].title });
    expect(heading).toHaveAttribute('title', mockItems[0].title);

    const description = screen.getByText(mockItems[0].desc);
    expect(description).toHaveAttribute('title', mockItems[0].desc);
    expect(description.className).toContain('line-clamp-3');
  });

  it('limits displayed tech badges to 4 and shows a +N more badge with tooltip for remaining technologies', () => {
    render(
      <MemoryRouter>
        <PortfolioCard items={mockItems} />
      </MemoryRouter>
    );

    expect(screen.getByText('React JS')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Tailwind CSS')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
    expect(screen.queryByText('MongoDB')).not.toBeInTheDocument();

    const moreBadge = screen.getByText('+2 more');
    expect(moreBadge).toBeInTheDocument();
    expect(moreBadge).toHaveAttribute('title', 'MongoDB, Docker');
  });

  it('applies equal-height flex column classes to the card container', () => {
    const { container } = render(
      <MemoryRouter>
        <PortfolioCard items={mockItems} />
      </MemoryRouter>
    );

    const card = container.querySelector('.card');
    expect(card?.className).toContain('h-full');
    expect(card?.className).toContain('flex-col');
    expect(card?.className).toContain('justify-between');
  });
});

