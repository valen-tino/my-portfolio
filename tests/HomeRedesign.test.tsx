import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../src/pages/Home';
import { Footer } from '../src/components/Footer';
import { CMSStorage } from '../src/cms/apiStorage';
import apiService from '../src/services/api';

vi.mock('../src/cms/apiStorage', () => ({
  CMSStorage: {
    getPortfolios: vi.fn(),
    getBlogs: vi.fn(),
    getAbout: vi.fn(),
    getTechTools: vi.fn(),
    getEducation: vi.fn(),
    getRoles: vi.fn(),
    getSocialLinks: vi.fn(),
    addContactEntry: vi.fn(),
  },
}));

vi.mock('../src/services/api', () => ({
  default: {
    getExperiences: vi.fn(),
  },
}));

describe('Home (Redesigned)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(CMSStorage.getPortfolios).mockResolvedValue([
      {
        id: 'cms-p1',
        title: 'CMS Live Project',
        desc: 'Built from live CMS data.',
        category: 'Web App',
        tech: ['React'],
        images: [],
        imageURL: '',
        year: '2026',
        role: 'Full-Stack Developer',
        roles: ['Full-Stack Developer'],
        isPasswordProtected: false,
        isPublished: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      } as any,
    ]);
    vi.mocked(CMSStorage.getBlogs).mockResolvedValue([
      {
        id: 'cms-b1',
        title: 'CMS Live Article',
        slug: 'cms-live-article',
        desc: 'Live journal excerpt.',
        content: '<p>Hello</p>',
        category: 'Engineering',
        tags: ['TypeScript'],
        date: '2026-05-01',
        readTime: '3 min read',
        isPublished: true,
      } as any,
    ]);
    vi.mocked(CMSStorage.getAbout).mockResolvedValue({
      title: 'About Me',
      description: 'Independent product engineer in Bali.',
      cvURL: 'https://example.com/valentino-cv.pdf',
      imageURL: '',
    } as any);
    vi.mocked(CMSStorage.getTechTools).mockResolvedValue([
      { id: 't1', title: 'Vitest', imageURL: '' } as any,
    ]);
    vi.mocked(CMSStorage.getEducation).mockResolvedValue([
      {
        id: 'e1',
        title: 'B.Sc. Computer Science',
        institution: 'Primakara University',
        startDate: '2021',
        endDate: '2025',
      } as any,
    ]);
    vi.mocked(CMSStorage.getRoles).mockResolvedValue([]);
    vi.mocked(CMSStorage.getSocialLinks).mockResolvedValue([]);
    vi.mocked(apiService.getExperiences).mockResolvedValue({
      success: true,
      data: [
        {
          id: 'exp1',
          title: 'Senior Product Engineer',
          companyName: 'Studio Nusantara',
          startDate: '2024',
          endDate: 'Present',
          status: 'Current',
          description: 'Led frontend systems.',
        },
      ],
    } as any);
  });

  it('toggles HeroProjectStrip Play/Pause icon button, shows accessible toggletip, and keeps hero slides non-clickable with 16:9 images', async () => {
    vi.mocked(CMSStorage.getPortfolios).mockResolvedValueOnce([
      {
        id: 'cms-p1',
        title: 'CMS Live Project',
        desc: 'Built from live CMS data.',
        category: 'Web App',
        tech: ['React'],
        images: [],
        imageURL: 'https://res.cloudinary.com/demo/image/upload/cms-p1.jpg',
        year: '2026',
        role: 'Full-Stack Developer',
        roles: ['Full-Stack Developer'],
        isPasswordProtected: false,
        isPublished: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      } as any,
    ]);

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('CMS Live Project').length).toBeGreaterThan(0);
    });

    expect(screen.getByRole('heading', { level: 3, name: 'CMS Live Article' })).toBeInTheDocument();
    expect(screen.getByText('Independent product engineer in Bali.')).toBeInTheDocument();
    expect(screen.getAllByText(/Senior Product Engineer/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Primakara University/).length).toBeGreaterThan(0);

    // Hero carousel slides are pure visual 16:9 previews with no links, titles, or arrows
    const previewRegion = screen.getByRole('region', { name: 'Project previews' });
    expect(within(previewRegion).queryAllByRole('link')).toHaveLength(0);
    expect(within(previewRegion).queryByText('CMS Live Project')).toBeNull();
    const heroImg = within(previewRegion).getAllByRole('img', { name: 'CMS Live Project' })[0];
    expect(heroImg.parentElement).toHaveClass('aspect-video');

    // Featured ProjectCard also uses 16:9 aspect-video
    const featuredWorkRegion = screen.getByRole('region', { name: 'selected work' });
    const cardImg = within(featuredWorkRegion).getByRole('img', { name: 'CMS Live Project' });
    expect(cardImg.parentElement).toHaveClass('aspect-video');

    // Tooltip replaces the always-visible helper paragraph
    const tooltipTrigger = screen.getByTestId('hero-strip-tooltip-trigger');
    const tooltip = screen.getByTestId('hero-strip-tooltip');
    expect(tooltip).toHaveAttribute('role', 'tooltip');
    expect(tooltip).toHaveAttribute('popover', 'hint');
    expect(tooltip).toHaveTextContent('Swipe, drag, or use arrows to browse selected previews');
    expect(tooltipTrigger).toHaveAttribute('popovertarget', tooltip.id);
    expect(tooltipTrigger).toHaveAttribute('popovertargetaction', 'show');
    expect(tooltipTrigger).toHaveAttribute('interestfor', tooltip.id);
    expect(tooltipTrigger).toHaveAttribute('aria-expanded', 'false');

    const openToggleEvent = new Event('toggle');
    Object.assign(openToggleEvent, { newState: 'open' });
    fireEvent(tooltip, openToggleEvent);
    expect(tooltipTrigger).toHaveAttribute('aria-expanded', 'true');

    // Play/Pause button uses compact icon toggle instead of "Pause previews" / "Play previews" copy
    const toggleBtn = screen.getByTestId('hero-strip-play-pause');
    expect(toggleBtn).toHaveAttribute('aria-label', 'Pause project previews');
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'false');
    expect(screen.queryByText('Pause previews')).toBeNull();
    expect(screen.queryByText('Play previews')).toBeNull();

    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute('aria-label', 'Play project previews');
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('submits contact form to CMSStorage.addContactEntry with disabled button and live status announcements', async () => {
    let resolveSubmit!: (val: any) => void;
    vi.mocked(CMSStorage.addContactEntry).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSubmit = resolve;
        })
    );

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Independent product engineer in Bali.')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'Alex' } });
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'alex@example.com' } });
    fireEvent.change(screen.getByLabelText('Tell me about your project', { selector: 'textarea' }), {
      target: { value: 'Need a portfolio redesign.' },
    });

    const submitBtn = screen.getByRole('button', { name: /Send message/i });
    fireEvent.click(submitBtn);

    expect(submitBtn).toBeDisabled();
    expect(submitBtn).toHaveTextContent('Sending...');
    expect(CMSStorage.addContactEntry).toHaveBeenCalledWith({
      name: 'Alex',
      email: 'alex@example.com',
      message: 'Need a portfolio redesign.',
    });

    resolveSubmit({ id: 'contact-1' });

    await waitFor(() => {
      expect(submitBtn).not.toBeDisabled();
      expect(screen.getByRole('status')).toHaveTextContent(
        'Thanks! Your message has been sent and I will reply by email soon.'
      );
    });
  });

  it('displays mailto fallback message in role="status" when contact API fails', async () => {
    vi.mocked(CMSStorage.addContactEntry).mockRejectedValueOnce(new Error('Network down'));

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Independent product engineer in Bali.')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'Alex' } });
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'alex@example.com' } });
    fireEvent.change(screen.getByLabelText('Tell me about your project', { selector: 'textarea' }), {
      target: { value: 'Hello there' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Send message/i }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/mailto:valentinojehaut@gmail\.com/i);
    });
  });

  it('renders valentinojehaut@gmail.com at contact, omits Upwork, and renders vibrant Footer without removed items', async () => {
    window.scrollTo = vi.fn();

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const contactEmail = await screen.findAllByRole('link', { name: /valentinojehaut@gmail\.com/i });
    expect(contactEmail.length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText(/tino\.jehaut@gmail\.com/i)).toBeNull();
    expect(screen.queryByRole('link', { name: /Upwork/i })).toBeNull();
    expect(screen.queryByText(/Open for collaborations/i)).toBeNull();
    expect(screen.queryByRole('link', { name: /Design System/i })).toBeNull();

    const footer = screen.getByRole('contentinfo');
    expect(within(footer).getByRole('navigation', { name: 'Footer navigation' })).toBeInTheDocument();
    expect(within(footer).getByRole('link', { name: 'Selected Work' })).toHaveAttribute('href', '/portfolio');
    expect(within(footer).getByRole('link', { name: /GitHub/i })).toBeInTheDocument();

    const backToTop = within(footer).getByRole('button', { name: 'Back to top' });
    fireEvent.click(backToTop);
    expect(window.scrollTo).toHaveBeenCalled();
  });

  it('renders dynamic greeting, formatted ISO timeline dates, and interactive HeroProjectStrip swipe/step controls', async () => {
    vi.mocked(apiService.getExperiences).mockResolvedValueOnce({
      success: true,
      data: [
        {
          id: 'exp-iso',
          title: 'Principal Engineer',
          companyName: 'Studio Nusantara',
          startDate: '2025-10-01T00:00:00.000Z',
          endDate: 'Present',
          status: 'Current',
          description: 'Shipped design systems.',
        },
      ],
    } as any);

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('CMS Live Project').length).toBeGreaterThan(0);
    });

    // Dynamic greeting in hero H1
    const heroHeading = screen.getByRole('heading', { level: 1 });
    expect(heroHeading.textContent).toMatch(
      /^(Good Morning|Good Afternoon|Good Evening)(?: 👋)?, I’m Valentino Jehaut\./
    );

    // ISO date formatted cleanly without raw timestamp leak
    expect(screen.getAllByText(/Oct 2025.*Present/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/2025-10-01T00:00:00\.000Z/)).toBeNull();

    // HeroProjectStrip step buttons and touch swipe auto-pause
    const prevBtn = screen.getByRole('button', { name: 'Previous project preview' });
    const nextBtn = screen.getByRole('button', { name: 'Next project preview' });
    expect(prevBtn).toBeInTheDocument();
    expect(nextBtn).toBeInTheDocument();

    const region = screen.getByRole('region', { name: 'Project previews' });
    fireEvent.touchStart(region);
    expect(screen.getByRole('button', { name: 'Play project previews' })).toBeInTheDocument();
  });

  it('switches Experiences and Education tabs via click, keyboard arrows, and #education hash, and sorts latest end date first', async () => {
    vi.mocked(apiService.getExperiences).mockResolvedValueOnce({
      success: true,
      data: [
        {
          id: 'exp-old',
          title: 'Junior Frontend Engineer',
          companyName: 'Old Web Studio',
          startDate: '2020-01',
          endDate: '2022-05',
          status: 'Past',
          description: 'Built static sites.',
        },
        {
          id: 'exp-new',
          title: 'Staff Product Engineer',
          companyName: 'Current Labs',
          startDate: '2023-03',
          endDate: '',
          status: 'Current',
          description: 'Leads frontend platform.',
        },
      ],
    } as any);

    vi.mocked(CMSStorage.getEducation).mockResolvedValueOnce([
      {
        id: 'edu-old',
        title: 'Associate Web Certificate',
        institution: 'Polytechnic Institute',
        startDate: '2016-09',
        endDate: '2018-06',
        description: 'Foundations.',
      },
      {
        id: 'edu-new',
        title: 'MSc Human-Computer Interaction',
        institution: 'Graduate Design Institute',
        startDate: '2021-09',
        endDate: '2024-07',
        description: 'Thesis on editorial typography.',
      },
    ]);

    const { unmount } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const expTab = await screen.findByRole('tab', { name: /Experiences/i });
    const eduTab = screen.getByRole('tab', { name: /Education/i });
    const expPanel = document.querySelector(`[role="tabpanel"][aria-labelledby="${expTab.id}"]`) as HTMLElement;
    const eduPanel = document.getElementById('education')!;

    expect(expTab).toHaveAttribute('aria-selected', 'true');
    expect(eduTab).toHaveAttribute('aria-selected', 'false');
    expect(expPanel.hasAttribute('hidden')).toBe(false);
    expect(eduPanel.getAttribute('hidden')).toBe('until-found');

    await waitFor(() => {
      expect(within(expPanel).getByText('Staff Product Engineer')).toBeInTheDocument();
      expect(within(expPanel).getByText('Junior Frontend Engineer')).toBeInTheDocument();
    });

    // Latest experience (Current / Present) appears before older experience
    const newExpEl = within(expPanel).getByText('Staff Product Engineer');
    const oldExpEl = within(expPanel).getByText('Junior Frontend Engineer');
    expect(newExpEl.compareDocumentPosition(oldExpEl) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    // Switch to Education via ArrowRight (selection follows focus)
    expTab.focus();
    fireEvent.keyDown(expTab, { key: 'ArrowRight' });
    expect(eduTab).toHaveAttribute('aria-selected', 'true');
    expect(expTab).toHaveAttribute('aria-selected', 'false');
    expect(eduPanel.hasAttribute('hidden')).toBe(false);
    expect(expPanel.getAttribute('hidden')).toBe('until-found');

    // Latest education end date appears first
    const newEduEl = within(eduPanel).getByText('MSc Human-Computer Interaction');
    const oldEduEl = within(eduPanel).getByText('Associate Web Certificate');
    expect(newEduEl.compareDocumentPosition(oldEduEl) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    // Switch back via ArrowLeft, Home, End
    fireEvent.keyDown(eduTab, { key: 'ArrowLeft' });
    expect(expTab).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(expTab, { key: 'End' });
    expect(eduTab).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(eduTab, { key: 'Home' });
    expect(expTab).toHaveAttribute('aria-selected', 'true');

    unmount();

    // #education hash opens Education tab directly
    render(
      <MemoryRouter initialEntries={['/#education']}>
        <Home />
      </MemoryRouter>
    );

    expect(await screen.findByRole('tab', { name: /Education/i })).toHaveAttribute('aria-selected', 'true');
    expect(document.getElementById('education')?.hasAttribute('hidden')).toBe(false);
  });

  it('renders all published portfolios in HeroProjectStrip instead of capping at 6', async () => {
    const manyProjects = Array.from({ length: 8 }, (_, idx) => ({
      id: `bulk-p${idx + 1}`,
      title: `Bulk Portfolio ${idx + 1}`,
      desc: `Description ${idx + 1}`,
      category: 'Web App',
      tech: ['React'],
      images: [],
      imageURL: `https://res.cloudinary.com/demo/image/upload/p-${idx + 1}.jpg`,
      year: '2026',
      role: 'Full-Stack Developer',
      roles: ['Full-Stack Developer'],
      isPasswordProtected: false,
      isPublished: true,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    })) as any;

    vi.mocked(CMSStorage.getPortfolios).mockResolvedValueOnce(manyProjects);

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const previewRegion = await screen.findByRole('region', { name: 'Project previews' });
    await waitFor(() => {
      for (let i = 1; i <= 8; i += 1) {
        expect(within(previewRegion).getAllByRole('img', { name: `Bulk Portfolio ${i}` }).length).toBeGreaterThan(0);
      }
    });
  });

  it('renders CMS About copy, CMS Social Links, Experience company logos, and custom role filter ordering', async () => {
    vi.mocked(CMSStorage.getAbout).mockResolvedValueOnce({
      description: 'Independent product engineer in Bali.',
      imageURL: '',
      name: 'Valen Studio',
      heroHeadline: 'CMS Powered Headline',
      heroSubheadline: 'CMS Powered Subheadline',
      workProcessSubtitle: 'CMS Powered Process Subtitle',
      yearsExperience: '6+',
      yearsExperienceLabel: 'Years crafting',
      degreesCount: '03',
      degreesLabel: 'Verified Degrees',
      email: 'studio@valen.dev',
      contactHeading: 'Let us talk CMS',
      footerCtaHeading: 'Custom Footer CTA',
      footerBio: 'Custom Footer Bio',
    } as any);
    vi.mocked(CMSStorage.getSocialLinks).mockResolvedValueOnce([
      {
        id: 'sl-custom',
        name: 'Mastodon',
        handle: '@valen',
        url: 'https://mastodon.social/@valen',
        actionLabel: 'Follow',
        icon: 'globe',
        order: 1,
        isPublished: true,
      },
    ]);
    vi.mocked(CMSStorage.getRoles).mockResolvedValueOnce([
      { id: 'r1', title: 'Design Lead', order: 1 },
      { id: 'r2', title: 'Full-Stack Developer', order: 2 },
    ]);
    vi.mocked(apiService.getExperiences).mockResolvedValueOnce({
      success: true,
      data: [
        {
          id: 'exp-logo',
          title: 'Design Engineer',
          companyName: 'Blossem',
          startDate: '2025-10',
          endDate: 'Present',
          status: 'Current',
          description: 'Built UI systems.',
          logoURL: 'https://example.com/blossem-logo.png',
        },
      ],
    } as any);

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(await screen.findByText('CMS Powered Headline')).toBeInTheDocument();
    expect(screen.getByText('CMS Powered Subheadline')).toBeInTheDocument();
    expect(screen.getByText('CMS Powered Process Subtitle')).toBeInTheDocument();
    expect(screen.getByText('6+')).toBeInTheDocument();
    expect(screen.getByText('Years crafting')).toBeInTheDocument();
    expect(screen.getByText('03')).toBeInTheDocument();
    expect(screen.getByText('Let us talk CMS')).toBeInTheDocument();
    expect(screen.getByText('Custom Footer CTA')).toBeInTheDocument();
    expect(screen.getByText('Custom Footer Bio')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /studio@valen\.dev/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('link', { name: /Mastodon/i }).length).toBeGreaterThanOrEqual(2);

    const logoImg = await screen.findByRole('img', { name: 'Blossem logo' });
    expect(logoImg).toHaveAttribute('src', 'https://example.com/blossem-logo.png');
  });
});
