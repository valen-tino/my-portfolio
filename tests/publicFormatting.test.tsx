import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Home from '../src/pages/Home';
import apiService from '../src/services/api';
import { CMSStorage } from '../src/cms/apiStorage';
import { formatPublicDescription } from '../src/utils/contentMigration';

vi.mock('../src/services/api', () => ({
  default: {
    getExperiences: vi.fn(),
  },
  apiService: {
    getExperiences: vi.fn(),
  }
}));

vi.mock('../src/cms/apiStorage', () => ({
  CMSStorage: {
    getPortfolios: vi.fn(),
    getBlogs: vi.fn(),
    getAbout: vi.fn(),
    getTechTools: vi.fn(),
    getEducation: vi.fn(),
    addContactEntry: vi.fn(),
  }
}));

describe('Public View Rich Formatting & formatPublicDescription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('formatPublicDescription utility', () => {
    it('returns empty string for null, undefined, or whitespace-only inputs', () => {
      expect(formatPublicDescription('')).toBe('');
      expect(formatPublicDescription('   ')).toBe('');
    });

    it('preserves existing semantic HTML without altering heading contents into case study titles', () => {
      const richHtml = '<h3>Role and Responsibilities</h3><ul><li>Built React dashboard</li><li>Optimized database queries</li></ul>';
      const formatted = formatPublicDescription(richHtml);
      expect(formatted).toBe(richHtml);
      expect(formatted).not.toContain('Project Background');
    });

    it('converts legacy markdown with lists and bold text into valid HTML without case study prefixes', () => {
      const markdown = '### Responsibilities\n- Developed UI components\n- **Improved** performance by 40%';
      const formatted = formatPublicDescription(markdown);
      expect(formatted).toContain('<h3');
      expect(formatted).toContain('Responsibilities');
      expect(formatted).not.toContain('1. Project Background');
      expect(formatted).toContain('<li>Developed UI components</li>');
      expect(formatted).toContain('<strong>Improved</strong>');
    });

    it('converts legacy plain-text with newlines into paragraphs', () => {
      const plainText = 'First paragraph.\n\nSecond paragraph with details.';
      const formatted = formatPublicDescription(plainText);
      expect(formatted).toContain('<p>First paragraph.</p>');
      expect(formatted).toContain('<p>Second paragraph with details.</p>');
    });
  });

  const mockDefaultCMS = () => {
    vi.mocked(CMSStorage.getPortfolios).mockResolvedValue([]);
    vi.mocked(CMSStorage.getBlogs).mockResolvedValue([]);
    vi.mocked(CMSStorage.getTechTools).mockResolvedValue([]);
    vi.mocked(CMSStorage.getEducation).mockResolvedValue([]);
    vi.mocked(CMSStorage.getAbout).mockResolvedValue({
      description: 'Bio',
      imageURL: '/face.jpg',
    });
    vi.mocked(apiService.getExperiences).mockResolvedValue({
      success: true,
      data: [],
    } as any);
  };

  describe('Home Experience & Education formatting', () => {
    it('renders HTML bullet lists inside Experiences and Education tabs with wysiwyg-content class', async () => {
      mockDefaultCMS();
      vi.mocked(apiService.getExperiences).mockResolvedValue({
        success: true,
        data: [{
          id: 'exp-1',
          title: 'Lead Frontend Engineer',
          status: 'Current' as const,
          companyName: 'TechCorp',
          startDate: '2023-01',
          endDate: '',
          description: '<ul><li>Engineered microfrontends</li><li>Mentored junior engineers</li></ul>',
          logoURL: 'https://example.com/logo.png',
          order: 1
        }]
      } as any);

      vi.mocked(CMSStorage.getEducation).mockResolvedValue([{
        id: 'edu-1',
        title: 'Bachelor of Computer Science',
        institution: 'University of Technology',
        startDate: '2020-09',
        endDate: '2024-06',
        description: '<p>Relevant coursework:</p><ul><li>Distributed Systems</li><li>Algorithms & Data Structures</li></ul>',
        link: 'https://example.com/cert',
      }]);

      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Lead Frontend Engineer')).toBeInTheDocument();
      });

      const expListItem = screen.getByText('Engineered microfrontends').closest('li');
      expect(expListItem).not.toBeNull();
      expect(expListItem?.closest('.wysiwyg-content')).not.toBeNull();
      expect(screen.getByText('Mentored junior engineers')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('tab', { name: /Education/i }));

      await waitFor(() => {
        expect(screen.getByText('Distributed Systems')).toBeInTheDocument();
      });
      const eduItem = screen.getByText('Distributed Systems').closest('li');
      expect(eduItem).not.toBeNull();
      expect(eduItem?.closest('.wysiwyg-content')).not.toBeNull();
      expect(screen.getByText('Algorithms & Data Structures')).toBeInTheDocument();
    });
  });

  describe('Home About section formatting & dynamic CV link', () => {
    it('renders rich paragraphs and uses dynamic Cloudinary CV URL', async () => {
      mockDefaultCMS();
      vi.mocked(CMSStorage.getAbout).mockResolvedValue({
        description: '<p>Hi, I am Valen.</p><p>Passionate about building scalable web apps.</p>',
        imageURL: 'https://example.com/me.jpg',
        cvURL: 'https://res.cloudinary.com/demo/raw/upload/v123/cv.pdf',
        cvCloudinaryId: 'portfolio-cms/cv/cv_123'
      });

      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Hi, I am Valen.')).toBeInTheDocument();
      });

      const paragraphContainer = screen.getByText('Hi, I am Valen.').closest('.wysiwyg-content');
      expect(paragraphContainer).not.toBeNull();
      expect(screen.getByText('Passionate about building scalable web apps.')).toBeInTheDocument();

      const downloadBtn = screen.getByRole('link', { name: /download cv/i });
      expect(downloadBtn).toHaveAttribute('href', 'https://res.cloudinary.com/demo/raw/upload/v123/cv.pdf');
      expect(downloadBtn).toHaveAttribute('target', '_blank');
      expect(downloadBtn).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('omits Download CV link while keeping View my résumé button when cvURL is not provided', async () => {
      mockDefaultCMS();
      vi.mocked(CMSStorage.getAbout).mockResolvedValue({
        description: 'About text',
        imageURL: 'myface.jpeg'
      });

      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('About text')).toBeInTheDocument();
      });

      expect(screen.queryByRole('link', { name: /download cv/i })).toBeNull();
      expect(screen.getByRole('button', { name: /View my résumé/i })).toBeInTheDocument();
    });
  });
});
