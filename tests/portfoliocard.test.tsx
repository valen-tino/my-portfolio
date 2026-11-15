import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProjectCard } from '../src/components/ProjectCard';
import { BlogCard } from '../src/components/BlogCard';
import type { BlogPost, Project } from '../src/types/portfolio';

const baseProject: Project = {
  id: '1',
  slug: 'cloud-analytics',
  title: 'Enterprise Cloud Analytics & Real-Time Monitoring Platform',
  description: 'A comprehensive platform monitoring distributed infrastructure.',
  year: '2024',
  roles: ['Fullstack Developer', 'UI/UX Designer'],
  tags: ['React', 'TypeScript'],
  imageURL: 'https://res.cloudinary.com/demo/image/upload/alpha.jpg',
  isPasswordProtected: false,
  isPublished: true,
};

const samplePost: BlogPost = {
  id: 'b-1',
  slug: 'design-systems-in-practice',
  title: 'Design Systems in Practice',
  date: '2026-05-15',
  readTime: '4 min read',
  category: 'Design',
  author: 'Valentino Jehaut',
  excerpt: 'Notes on tokens and flat editorial layouts.',
  imageURL: 'https://res.cloudinary.com/demo/image/upload/post.jpg',
  isPublished: true,
  tags: ['Design'],
};

describe('ProjectCard & BlogCard - Editorial Metadata & Hover CTA Behavior', () => {
  it('renders full project title, roles, year, and hides CTA pill until card interaction', () => {
    const onSelect = vi.fn();
    render(<ProjectCard project={baseProject} onSelectProject={onSelect} />);

    expect(
      screen.getByRole('heading', { level: 3, name: baseProject.title }),
    ).toBeInTheDocument();
    expect(screen.getByText('Fullstack Developer / UI/UX Designer')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();

    const ctaPill = screen.getByText('View project').closest('span');
    expect(ctaPill?.className).toContain('card-hover-cta');

    fireEvent.click(screen.getByRole('link', { name: `View project: ${baseProject.title}` }));
    expect(onSelect).toHaveBeenCalledWith(baseProject);
  });

  it('masks year and image while showing Protected badge & Unlock CTA for password-protected projects', () => {
    const protectedProject: Project = {
      ...baseProject,
      id: '3',
      isPasswordProtected: true,
      year: '2023',
      relatedExperienceCompany: 'Confidential Corp',
    };

    render(<ProjectCard project={protectedProject} onSelectProject={vi.fn()} />);

    expect(screen.queryByText('Confidential Corp')).not.toBeInTheDocument();
    expect(screen.queryByText('2023')).not.toBeInTheDocument();
    expect(screen.getByText('Protected')).toBeInTheDocument();

    const unlockCta = screen.getByText('Unlock project').closest('span');
    expect(unlockCta?.className).toContain('card-hover-cta');
  });

  it('hides BlogCard Read article CTA pill with .card-hover-cta until cursor or keyboard interaction', () => {
    const onSelectPost = vi.fn();
    render(<BlogCard post={samplePost} onSelectPost={onSelectPost} />);

    expect(screen.getByRole('heading', { level: 3, name: samplePost.title })).toBeInTheDocument();
    const readCta = screen.getByText('Read article').closest('span');
    expect(readCta?.className).toContain('card-hover-cta');

    fireEvent.click(screen.getByRole('link', { name: `Read article: ${samplePost.title}` }));
    expect(onSelectPost).toHaveBeenCalledWith(samplePost);
  });
});
