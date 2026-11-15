import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SocialLinksManagement from '../src/cms/pages/SocialLinksManagement';
import { CMSStorage, type CMSSocialLink } from '../src/cms/apiStorage';

vi.mock('../src/cms/apiStorage', () => ({
  CMSStorage: {
    getSocialLinks: vi.fn(),
    addSocialLink: vi.fn(),
    updateSocialLink: vi.fn(),
    deleteSocialLink: vi.fn(),
    seedSocialLinks: vi.fn(),
  },
}));

vi.mock('../src/cms/auth', () => ({
  AuthService: {
    getSession: vi.fn().mockReturnValue({ email: 'admin@portfolio.com', token: 'mock-jwt' }),
    isAuthenticated: vi.fn().mockReturnValue(true),
    logout: vi.fn(),
  },
}));

const sampleLinks: CMSSocialLink[] = [
  {
    id: 'sl-1',
    _id: 'sl-1',
    name: 'Email',
    handle: 'valentinojehaut@gmail.com',
    url: 'mailto:valentinojehaut@gmail.com',
    actionLabel: 'Email Me',
    icon: 'mail',
    order: 1,
    isPublished: true,
  },
  {
    id: 'sl-2',
    _id: 'sl-2',
    name: 'GitHub',
    handle: '@valentinojehaut',
    url: 'https://github.com/valentinojehaut',
    actionLabel: 'Follow Me',
    icon: 'github',
    order: 2,
    isPublished: true,
  },
];

describe('SocialLinksManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(CMSStorage.getSocialLinks).mockResolvedValue(sampleLinks);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders existing social links inside light CMS layout', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/cms/social-links']}>
        <SocialLinksManagement />
      </MemoryRouter>
    );

    expect(await screen.findByText('Social Links (2)')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(container.querySelector('[data-theme="light"]')).toBeInTheDocument();
  });

  it('creates a new social link', async () => {
    vi.mocked(CMSStorage.addSocialLink).mockResolvedValue({
      id: 'sl-3',
      _id: 'sl-3',
      name: 'Dribbble',
      handle: '@valen',
      url: 'https://dribbble.com/valen',
      actionLabel: 'Shots',
      icon: 'dribbble',
      order: 3,
      isPublished: true,
    });

    render(
      <MemoryRouter>
        <SocialLinksManagement />
      </MemoryRouter>
    );

    await screen.findByText('Social Links (2)');

    fireEvent.click(screen.getByRole('button', { name: /\+ add social link/i }));

    fireEvent.change(screen.getByLabelText(/platform name/i), {
      target: { value: 'Dribbble' },
    });
    fireEvent.change(screen.getByLabelText(/^url/i), {
      target: { value: 'https://dribbble.com/valen' },
    });
    fireEvent.change(screen.getByLabelText(/handle \/ display label/i), {
      target: { value: '@valen' },
    });
    fireEvent.change(screen.getByLabelText(/action label/i), {
      target: { value: 'Shots' },
    });
    fireEvent.change(screen.getByLabelText(/icon type/i), {
      target: { value: 'dribbble' },
    });
    fireEvent.change(screen.getByLabelText(/order/i), {
      target: { value: '3' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create link/i }));

    await waitFor(() => {
      expect(CMSStorage.addSocialLink).toHaveBeenCalledWith({
        name: 'Dribbble',
        handle: '@valen',
        url: 'https://dribbble.com/valen',
        actionLabel: 'Shots',
        icon: 'dribbble',
        order: 3,
        isPublished: true,
      });
    });

    expect(await screen.findByText(/social link created successfully!/i)).toBeInTheDocument();
  });

  it('edits, reorders, toggles visibility, and deletes a social link', async () => {
    vi.mocked(CMSStorage.updateSocialLink).mockResolvedValue(sampleLinks[0]);
    vi.mocked(CMSStorage.deleteSocialLink).mockResolvedValue(undefined);
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <MemoryRouter>
        <SocialLinksManagement />
      </MemoryRouter>
    );

    await screen.findByText('Social Links (2)');

    const editButtons = screen.getAllByRole('button', { name: /^edit$/i });
    fireEvent.click(editButtons[1]);

    fireEvent.change(screen.getByLabelText(/^url/i), {
      target: { value: 'https://github.com/valen-updated' },
    });
    fireEvent.click(screen.getByRole('button', { name: /update link/i }));

    await waitFor(() => {
      expect(CMSStorage.updateSocialLink).toHaveBeenCalledWith(
        'sl-2',
        expect.objectContaining({
          name: 'GitHub',
          url: 'https://github.com/valen-updated',
        })
      );
    });

    fireEvent.click(screen.getByRole('button', { name: 'Move GitHub up' }));
    await waitFor(() => {
      expect(CMSStorage.updateSocialLink).toHaveBeenCalledWith('sl-2', { order: 1 });
      expect(CMSStorage.updateSocialLink).toHaveBeenCalledWith('sl-1', { order: 2 });
    });

    const hideButtons = screen.getAllByRole('button', { name: /^hide$/i });
    fireEvent.click(hideButtons[0]);
    await waitFor(() => {
      expect(CMSStorage.updateSocialLink).toHaveBeenCalledWith('sl-1', {
        isPublished: false,
      });
    });

    const deleteButtons = screen.getAllByRole('button', { name: /^delete$/i });
    fireEvent.click(deleteButtons[0]);
    await waitFor(() => {
      expect(CMSStorage.deleteSocialLink).toHaveBeenCalledWith('sl-1');
    });
  });

  it('imports default social links when empty', async () => {
    vi.mocked(CMSStorage.getSocialLinks)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(sampleLinks);
    vi.mocked(CMSStorage.seedSocialLinks).mockResolvedValue(sampleLinks);

    render(
      <MemoryRouter>
        <SocialLinksManagement />
      </MemoryRouter>
    );

    const importButtons = await screen.findAllByRole('button', {
      name: /import default social links/i,
    });
    fireEvent.click(importButtons[0]);

    await waitFor(() => {
      expect(CMSStorage.seedSocialLinks).toHaveBeenCalled();
    });

    expect(
      await screen.findByText(/default social links imported successfully!/i)
    ).toBeInTheDocument();
  });
});

