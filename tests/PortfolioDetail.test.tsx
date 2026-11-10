import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PortfolioDetail from '../src/pages/PortfolioDetail';
import { CMSStorage } from '../src/cms/apiStorage';

vi.mock('../src/cms/apiStorage', () => ({
  CMSStorage: {
    getPortfolios: vi.fn(),
    getRoles: vi.fn().mockResolvedValue([{ id: '1', title: 'Fullstack Developer', color: 'info' }]),
    getAbout: vi.fn().mockResolvedValue({ cvURL: '/Valen-Jehaut.pdf' })
  }
}));

describe('PortfolioDetail Component - Cloudinary Video & WYSIWYG Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders web-optimized <video> element when videoURL is present', async () => {
    vi.mocked(CMSStorage.getPortfolios).mockResolvedValue([
      {
        id: '1',
        title: 'Video Project Showcase',
        desc: 'Project with Cloudinary video',
        projectDetails: '<h2>Overview</h2><p>Rich HTML details</p>',
        linkTo: 'https://example.com',
        imageURL: 'https://res.cloudinary.com/demo/image/upload/poster.jpg',
        videoURL: 'https://res.cloudinary.com/demo/video/upload/v1234/demo.mp4',
        tech: ['React JS'],
        roles: ['Fullstack Developer']
      }
    ]);

    render(
      <MemoryRouter initialEntries={['/portfolio/1']}>
        <Routes>
          <Route path="/portfolio/:id" element={<PortfolioDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const videos = screen.getAllByTestId('portfolio-hero-video');
      expect(videos.length).toBeGreaterThan(0);
      const video = videos[0] as HTMLVideoElement;
      expect(video).toHaveAttribute('controls');
      expect(video.getAttribute('src')).toContain('/video/upload/q_auto,f_auto,w_1920,c_limit/');
      expect(video.getAttribute('poster')).toBe('https://res.cloudinary.com/demo/image/upload/poster.jpg');
    });

    expect(screen.queryByTestId('portfolio-hero-image')).toBeNull();
  });

  it('falls back to <img> when videoURL is not provided', async () => {
    vi.mocked(CMSStorage.getPortfolios).mockResolvedValue([
      {
        id: '2',
        title: 'Image Only Project',
        desc: 'Project with static image only',
        projectDetails: '## Legacy Markdown Heading\n\n- Bullet item 1',
        linkTo: '',
        imageURL: 'bcs.png',
        videoURL: null,
        tech: ['Tailwind CSS'],
        roles: []
      }
    ]);

    render(
      <MemoryRouter initialEntries={['/portfolio/2']}>
        <Routes>
          <Route path="/portfolio/:id" element={<PortfolioDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const images = screen.getAllByTestId('portfolio-hero-image');
      expect(images.length).toBeGreaterThan(0);
      expect(images[0].getAttribute('src')).toBe('/images/portfolios/bcs.png');
    });

    expect(screen.queryByTestId('portfolio-hero-video')).toBeNull();
    // Verify legacy markdown was automatically migrated to HTML heading
    expect(screen.getAllByText('Legacy Markdown Heading').length).toBeGreaterThan(0);
  });

  it('renders Option B Case Study ScrollProgressBar and opens Lightbox when clicking a gallery image', async () => {
    vi.mocked(CMSStorage.getPortfolios).mockResolvedValue([
      {
        id: '3',
        title: 'Case Study with Gallery',
        desc: 'Interactive gallery and progress bar showcase',
        projectDetails: `
          <h2 class="portfolio-section-title">1. Project Background & Context</h2>
          <div data-portfolio-gallery="true" class="portfolio-gallery">
            <figure class="gallery-item gallery-image-clickable" data-media-type="image">
              <img src="https://res.cloudinary.com/demo/image/upload/gal-preview.jpg" alt="Gallery Preview 1" />
              <span class="gallery-zoom-badge">🔍 Click to view image</span>
            </figure>
          </div>
        `,
        linkTo: '',
        imageURL: 'bcs.png',
        videoURL: null,
        tech: ['React JS'],
        roles: ['Fullstack Developer']
      }
    ]);

    render(
      <MemoryRouter initialEntries={['/portfolio/3']}>
        <Routes>
          <Route path="/portfolio/:id" element={<PortfolioDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const progressBars = screen.getAllByTestId('case-study-progress-bar');
      expect(progressBars.length).toBeGreaterThan(0);
      expect(progressBars[0].className).toContain('sticky');
      expect(progressBars[0].parentElement?.className).not.toContain('overflow-hidden');
      const pctElement = screen.getAllByTestId('progress-percentage')[0];
      expect(pctElement.textContent).not.toContain('read');
      expect(pctElement.textContent).toMatch(/^\d+%/);
    });

    const galleryImgs = screen.getAllByAltText('Gallery Preview 1');
    fireEvent.click(galleryImgs[0]);

    await waitFor(() => {
      expect(screen.getByTestId('image-lightbox-modal')).toBeInTheDocument();
      expect(screen.getByTestId('lightbox-image')).toHaveAttribute(
        'src',
        'https://res.cloudinary.com/demo/image/upload/gal-preview.jpg'
      );
    });
  });

  it('renders Portfolio Not Found fallback when navigating directly to an unpublished portfolio item', async () => {
    vi.mocked(CMSStorage.getPortfolios).mockResolvedValue([
      {
        id: 'hidden-item-99',
        title: 'Hidden Case Study',
        desc: 'Secret details',
        projectDetails: '<p>Secret</p>',
        linkTo: '',
        imageURL: 'hidden.png',
        videoURL: null,
        tech: ['React'],
        roles: [],
        isPublished: false
      }
    ]);

    render(
      <MemoryRouter initialEntries={['/portfolio/hidden-item-99']}>
        <Routes>
          <Route path="/portfolio/:id" element={<PortfolioDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Portfolio Not Found')).toBeInTheDocument();
    });
    expect(screen.queryByText('Hidden Case Study')).not.toBeInTheDocument();
    expect(CMSStorage.getPortfolios).toHaveBeenCalledWith(true);
  });
});

