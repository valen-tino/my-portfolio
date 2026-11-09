import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ExperienceSection from '../src/sections/experience/experience';
import EducationCard from '../src/sections/education/educationcard';
import AboutMe from '../src/sections/aboutme/aboutme';
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
    getAbout: vi.fn(),
  }
}));

// Mock react-scroll Link to render a standard link without passing non-standard props to DOM
vi.mock('react-scroll', () => ({
  Link: ({ children, to, activeClass, spy, smooth, offset, duration, ...props }: any) => <a href={`#${to}`} {...props}>{children}</a>
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

  describe('ExperienceSection formatting', () => {
    it('renders HTML bullet lists inside experience cards with wysiwyg-content class', async () => {
      const mockExperience = [{
        id: 'exp-1',
        title: 'Lead Frontend Engineer',
        status: 'Current' as const,
        companyName: 'TechCorp',
        startDate: '2023-01',
        endDate: '',
        description: '<ul><li>Engineered microfrontends</li><li>Mentored junior engineers</li></ul>',
        logoURL: 'https://example.com/logo.png',
        order: 1
      }];

      vi.mocked(apiService.getExperiences).mockResolvedValue({
        success: true,
        data: mockExperience
      });

      render(<ExperienceSection />);

      await waitFor(() => {
        expect(screen.getByText('Lead Frontend Engineer')).toBeInTheDocument();
      });

      expect(screen.getByText('Engineered microfrontends')).toBeInTheDocument();
      expect(screen.getByText('Mentored junior engineers')).toBeInTheDocument();

      const listItem = screen.getByText('Engineered microfrontends').closest('li');
      expect(listItem).not.toBeNull();
      const wysiwygContainer = listItem?.closest('.wysiwyg-content');
      expect(wysiwygContainer).not.toBeNull();
    });
  });

  describe('EducationCard formatting', () => {
    it('renders HTML ordered and unordered lists inside education descriptions', () => {
      const mockItem = {
        id: 'edu-1',
        title: 'Bachelor of Computer Science',
        institution: 'University of Technology',
        startDate: '2020-09',
        endDate: '2024-06',
        description: '<p>Relevant coursework:</p><ul><li>Distributed Systems</li><li>Algorithms & Data Structures</li></ul>',
        link: 'https://example.com/cert'
      };

      render(<EducationCard item={mockItem} />);

      expect(screen.getByText('Distributed Systems')).toBeInTheDocument();
      expect(screen.getByText('Algorithms & Data Structures')).toBeInTheDocument();

      const itemEl = screen.getByText('Distributed Systems').closest('li');
      expect(itemEl).not.toBeNull();
      expect(itemEl?.closest('.wysiwyg-content')).not.toBeNull();
    });
  });

  describe('AboutMe section formatting & dynamic CV link', () => {
    it('renders rich paragraphs and uses dynamic Cloudinary CV URL', async () => {
      const mockAbout = {
        description: '<p>Hi, I am Valen.</p><p>Passionate about building scalable web apps.</p>',
        imageURL: 'https://example.com/me.jpg',
        cvURL: 'https://res.cloudinary.com/demo/raw/upload/v123/cv.pdf',
        cvCloudinaryId: 'portfolio-cms/cv/cv_123'
      };

      vi.mocked(CMSStorage.getAbout).mockResolvedValue(mockAbout);

      render(<AboutMe />);

      await waitFor(() => {
        expect(screen.getByText('Hi, I am Valen.')).toBeInTheDocument();
      });

      expect(screen.getByText('Passionate about building scalable web apps.')).toBeInTheDocument();

      const downloadBtn = screen.getByRole('link', { name: /download cv/i });
      expect(downloadBtn).toHaveAttribute('href', 'https://res.cloudinary.com/demo/raw/upload/v123/cv.pdf');
      expect(downloadBtn).toHaveAttribute('target', '_blank');
      expect(downloadBtn).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('falls back to /Valen-Jehaut.pdf if cvURL is not provided', async () => {
      const mockAbout = {
        description: 'About text',
        imageURL: 'myface.jpeg'
      };

      vi.mocked(CMSStorage.getAbout).mockResolvedValue(mockAbout);

      render(<AboutMe />);

      await waitFor(() => {
        expect(screen.getByText('About text')).toBeInTheDocument();
      });

      const downloadBtn = screen.getByRole('link', { name: /download cv/i });
      expect(downloadBtn).toHaveAttribute('href', '/Valen-Jehaut.pdf');
    });
  });
});
