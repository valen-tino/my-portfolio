import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Home from '../src/pages/Home';
import PortfolioPage from '../src/pages/PortfolioPage';
import BlogPage from '../src/pages/BlogPage';
import PortfolioDetail from '../src/pages/PortfolioDetail';
import BlogDetail from '../src/pages/BlogDetail';
import { CVModal } from '../src/components/CVModal';
import { CMSStorage } from '../src/cms/apiStorage';
import apiService from '../src/services/api';

vi.mock('../src/cms/apiStorage', () => ({
  CMSStorage: {
    getPortfolios: vi.fn(),
    getBlogs: vi.fn(),
    getBlog: vi.fn(),
    getAbout: vi.fn(),
    getTechTools: vi.fn(),
    getEducation: vi.fn(),
    getRoles: vi.fn(),
    getWorkProcesses: vi.fn(),
    getSocialLinks: vi.fn(),
    addContactEntry: vi.fn(),
  },
}));

vi.mock('../src/services/api', () => ({
  default: {
    getExperiences: vi.fn(),
  },
}));

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('Database Skeleton Loading States & Hidden Scrollbar CSS', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders skeletons across Home while database fetches are pending instead of static fallback data, then hydrates live assets', async () => {
    const portfoliosDef = createDeferred<any[]>();
    const blogsDef = createDeferred<any[]>();
    const aboutDef = createDeferred<any>();
    const toolsDef = createDeferred<any[]>();
    const eduDef = createDeferred<any[]>();
    const expDef = createDeferred<any>();
    const wpDef = createDeferred<any[]>();
    const rolesDef = createDeferred<any[]>();
    const socialDef = createDeferred<any[]>();

    vi.mocked(CMSStorage.getPortfolios).mockReturnValueOnce(portfoliosDef.promise);
    vi.mocked(CMSStorage.getBlogs).mockReturnValueOnce(blogsDef.promise);
    vi.mocked(CMSStorage.getAbout).mockReturnValueOnce(aboutDef.promise);
    vi.mocked(CMSStorage.getTechTools).mockReturnValueOnce(toolsDef.promise);
    vi.mocked(CMSStorage.getEducation).mockReturnValueOnce(eduDef.promise);
    vi.mocked(apiService.getExperiences).mockReturnValueOnce(expDef.promise);
    vi.mocked(CMSStorage.getWorkProcesses).mockReturnValueOnce(wpDef.promise);
    vi.mocked(CMSStorage.getRoles).mockReturnValueOnce(rolesDef.promise);
    vi.mocked(CMSStorage.getSocialLinks).mockReturnValueOnce(socialDef.promise);

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByTestId('hero-copy-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('hero-strip-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('projects-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('work-process-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('about-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('tools-skeleton')).toBeInTheDocument();
    expect(screen.getAllByTestId('timeline-skeleton')).toHaveLength(2);
    expect(screen.getByTestId('blogs-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('contact-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('social-links-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('footer-skeleton')).toBeInTheDocument();

    // Ensure static datasets do NOT flash during database load
    expect(screen.queryByText(/MURSIM - Travel Data Plan Platform/i)).toBeNull();
    expect(screen.queryByText(/Bali Connection Service/i)).toBeNull();
    expect(screen.queryByText(/ITB STIKOM Bali and HELP University Malaysia/i)).toBeNull();

    portfoliosDef.resolve([
      {
        id: 'db-p1',
        title: 'Live LayerBase Project',
        desc: 'Fetched from DocumentDB.',
        category: 'Web App',
        tech: ['React'],
        images: [],
        imageURL: 'https://res.cloudinary.com/demo/image/upload/live.jpg',
        year: '2026',
        roles: ['Full-Stack Developer'],
        isPublished: true,
        isPasswordProtected: false,
      },
    ]);
    blogsDef.resolve([
      {
        id: 'db-b1',
        title: 'Live Journal Post',
        slug: 'live-journal-post',
        desc: 'Live journal excerpt.',
        content: '<p>Live</p>',
        category: 'Engineering',
        tags: ['Mongo'],
        date: '2026-06-01',
        readTime: '3 min read',
        isPublished: true,
      },
    ]);
    aboutDef.resolve({
      name: 'Valen Live',
      description: 'Live DB bio text.',
      heroHeadline: 'Live DB Hero Headline',
      imageURL: '',
    });
    toolsDef.resolve([{ id: 't-live', title: 'DocumentDB', imageURL: '' }]);
    eduDef.resolve([
      {
        id: 'edu-live',
        title: 'B.Sc. Software Engineering',
        institution: 'Live University',
        startDate: '2022',
        endDate: '2026',
      },
    ]);
    expDef.resolve({
      success: true,
      data: [
        {
          id: 'exp-live',
          title: 'Principal Engineer',
          companyName: 'LayerBase Corp',
          startDate: '2025',
          endDate: 'Present',
          status: 'Current',
          description: 'Database engineering.',
        },
      ],
    });
    wpDef.resolve([{ id: 'wp-live', title: 'Architecture', description: 'Schema first.', order: 1, isPublished: true }]);
    rolesDef.resolve([]);
    socialDef.resolve([
      {
        id: 'sl-live',
        name: 'GitHub',
        url: 'https://github.com/live',
        icon: 'github',
        order: 1,
        isPublished: true,
      },
    ]);

    await waitFor(() => {
      expect(screen.queryByTestId('hero-strip-skeleton')).toBeNull();
      expect(screen.queryByTestId('projects-skeleton')).toBeNull();
      expect(screen.queryByTestId('footer-skeleton')).toBeNull();
    });

    expect(screen.getByText('Live DB Hero Headline')).toBeInTheDocument();
    expect(screen.getByText('Live LayerBase Project')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Live Journal Post' })).toBeInTheDocument();
    expect(screen.getByText('DocumentDB')).toBeInTheDocument();
    expect(screen.getByText('Principal Engineer')).toBeInTheDocument();
  });

  it('shows filter + grid/table skeletons on PortfolioPage while loading and falls back to static PROJECTS only when backend fails', async () => {
    const def = createDeferred<any[]>();
    vi.mocked(CMSStorage.getPortfolios).mockReturnValueOnce(def.promise);
    vi.mocked(CMSStorage.getRoles).mockResolvedValue([]);

    const { unmount } = render(
      <MemoryRouter initialEntries={['/portfolio?view=table']}>
        <PortfolioPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId('filter-bar-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('portfolio-table-skeleton')).toBeInTheDocument();
    expect(screen.queryByText(/MURSIM/i)).toBeNull();

    def.reject(new Error('Database timeout'));

    await waitFor(() => {
      expect(screen.queryByTestId('portfolio-table-skeleton')).toBeNull();
    });
    expect(screen.getByText(/MURSIM - Travel Data Plan Platform/i)).toBeInTheDocument();
    unmount();

    const gridDef = createDeferred<any[]>();
    vi.mocked(CMSStorage.getPortfolios).mockReturnValueOnce(gridDef.promise);
    render(
      <MemoryRouter initialEntries={['/portfolio']}>
        <PortfolioPage />
      </MemoryRouter>
    );
    expect(screen.getByTestId('projects-skeleton')).toBeInTheDocument();
    gridDef.resolve([]);
    await waitFor(() => {
      expect(screen.queryByTestId('projects-skeleton')).toBeNull();
      expect(screen.queryByTestId('footer-skeleton')).toBeNull();
    });
  });

  it('shows skeletons on BlogPage while loading and replaces them with live DB articles', async () => {
    const def = createDeferred<any[]>();
    vi.mocked(CMSStorage.getBlogs).mockReturnValueOnce(def.promise);

    render(
      <MemoryRouter initialEntries={['/blogs']}>
        <BlogPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId('filter-bar-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('blogs-skeleton')).toBeInTheDocument();
    expect(screen.queryByText(/Design-to-Code Handoff/i)).toBeNull();

    def.resolve([
      {
        id: 'b-live',
        title: 'Skeletons Over Static Data',
        slug: 'skeletons-over-static-data',
        desc: 'Why skeletons avoid stale flashes.',
        content: '<p>Live</p>',
        category: 'Engineering',
        tags: ['UX'],
        date: '2026-07-01',
        readTime: '4 min read',
        isPublished: true,
      },
    ]);

    await waitFor(() => {
      expect(screen.queryByTestId('blogs-skeleton')).toBeNull();
    });
    expect(screen.getByRole('heading', { level: 3, name: 'Skeletons Over Static Data' })).toBeInTheDocument();
  });

  it('keeps brand-blue LoadingScreen and renders structural detail skeletons behind it while PortfolioDetail and BlogDetail load', () => {
    const portDef = createDeferred<any[]>();
    const blogDef = createDeferred<any>();
    vi.mocked(CMSStorage.getPortfolios).mockReturnValueOnce(portDef.promise);
    vi.mocked(CMSStorage.getAbout).mockResolvedValue(null as any);
    vi.mocked(CMSStorage.getBlog).mockReturnValueOnce(blogDef.promise);

    const { unmount } = render(
      <MemoryRouter initialEntries={['/portfolio/1']}>
        <Routes>
          <Route path="/portfolio/:id" element={<PortfolioDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('loading-screen')).toBeInTheDocument();
    expect(screen.getByTestId('portfolio-detail-skeleton')).toBeInTheDocument();
    unmount();

    render(
      <MemoryRouter initialEntries={['/blogs/1']}>
        <Routes>
          <Route path="/blogs/:id" element={<BlogDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('loading-screen')).toBeInTheDocument();
    expect(screen.getByTestId('blog-detail-skeleton')).toBeInTheDocument();
  });

  it('renders CVModalSkeleton while CV context is loading without flashing static entries', () => {
    render(<CVModal isOpen={true} onClose={vi.fn()} isLoading={true} />);
    expect(screen.getByTestId('cv-modal-skeleton')).toBeInTheDocument();
    expect(screen.queryByText(/Bali Connection Service/i)).toBeNull();
  });

  it('hides visible scrollbars across index.css and App.css while preserving WebKit fallback inside @supports', () => {
    const indexCss = fs.readFileSync(path.resolve(process.cwd(), 'src/index.css'), 'utf8');
    const appCss = fs.readFileSync(path.resolve(process.cwd(), 'src/App.css'), 'utf8');

    expect(indexCss).toContain('scrollbar-width: none');
    expect(indexCss).toContain('@supports not (scrollbar-width: none)');
    expect(indexCss).toContain('::-webkit-scrollbar');
    expect(appCss).not.toContain('scrollbar-width: thin');
    expect(appCss).toContain('scrollbar-width: none');
  });
});
