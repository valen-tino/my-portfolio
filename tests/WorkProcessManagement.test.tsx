import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import WorkProcessManagement from '../src/cms/pages/WorkProcessManagement';
import { CMSStorage, type CMSWorkProcessStep } from '../src/cms/apiStorage';

vi.mock('../src/cms/apiStorage', () => ({
  CMSStorage: {
    getWorkProcesses: vi.fn(),
    addWorkProcess: vi.fn(),
    updateWorkProcess: vi.fn(),
    deleteWorkProcess: vi.fn(),
    seedWorkProcesses: vi.fn(),
  },
}));

vi.mock('../src/cms/auth', () => ({
  AuthService: {
    getSession: vi.fn().mockReturnValue({ email: 'admin@portfolio.com', token: 'mock-jwt' }),
    isAuthenticated: vi.fn().mockReturnValue(true),
    logout: vi.fn(),
  },
}));

const sampleSteps: CMSWorkProcessStep[] = [
  {
    id: 'step-1',
    _id: 'step-1',
    title: 'Empathize',
    description: 'Understand user needs and pain points.',
    order: 1,
    isPublished: true,
  },
  {
    id: 'step-2',
    _id: 'step-2',
    title: 'Define',
    description: 'Synthesize insights into clear problem statements.',
    order: 2,
    isPublished: true,
  },
  {
    id: 'step-5',
    _id: 'step-5',
    title: 'Development',
    description:
      'Spec-Driven Development from PRD, ERD, and Design Brief through CI/CD to Production.',
    order: 5,
    isPublished: true,
  },
];

describe('WorkProcessManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(CMSStorage.getWorkProcesses).mockResolvedValue(sampleSteps);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders steps in order inside bright light CMS layout with top-level Work Process nav', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/cms/work-process']}>
        <WorkProcessManagement />
      </MemoryRouter>
    );

    expect(await screen.findByText('Process Steps (3)')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /work process/i }).length).toBeGreaterThan(0);
    expect(screen.getByText('Empathize')).toBeInTheDocument();
    expect(screen.getByText('Define')).toBeInTheDocument();
    expect(screen.getByText('Development')).toBeInTheDocument();

    expect(container.querySelector('[data-theme="light"]')).toBeInTheDocument();
    expect(container.querySelector('.bg-base-100')).toBeNull();
  });

  it('creates a new work process step', async () => {
    vi.mocked(CMSStorage.addWorkProcess).mockResolvedValue({
      id: 'step-new',
      _id: 'step-new',
      title: 'Prototype',
      description: 'Interactive flows before build.',
      order: 4,
      isPublished: true,
    });

    render(
      <MemoryRouter>
        <WorkProcessManagement />
      </MemoryRouter>
    );

    await screen.findByText('Process Steps (3)');

    fireEvent.click(screen.getByRole('button', { name: /\+ add new step/i }));

    fireEvent.change(screen.getByLabelText(/step title/i), {
      target: { value: 'Prototype' },
    });
    fireEvent.change(screen.getByLabelText(/order/i), {
      target: { value: '4' },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Interactive flows before build.' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create step/i }));

    await waitFor(() => {
      expect(CMSStorage.addWorkProcess).toHaveBeenCalledWith({
        title: 'Prototype',
        description: 'Interactive flows before build.',
        order: 4,
        isPublished: true,
      });
    });

    expect(
      await screen.findByText(/work process step created successfully!/i)
    ).toBeInTheDocument();
  });

  it('edits, reorders, toggles visibility, and deletes a step', async () => {
    vi.mocked(CMSStorage.updateWorkProcess).mockResolvedValue(sampleSteps[0]);
    vi.mocked(CMSStorage.deleteWorkProcess).mockResolvedValue(undefined);
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <MemoryRouter>
        <WorkProcessManagement />
      </MemoryRouter>
    );

    await screen.findByText('Process Steps (3)');

    // Edit Development step
    const editButtons = screen.getAllByRole('button', { name: /^edit$/i });
    fireEvent.click(editButtons[2]);

    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Updated agile engineering workflow.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /update step/i }));

    await waitFor(() => {
      expect(CMSStorage.updateWorkProcess).toHaveBeenCalledWith(
        'step-5',
        expect.objectContaining({
          title: 'Development',
          description: 'Updated agile engineering workflow.',
        })
      );
    });

    // Move Define up
    fireEvent.click(screen.getByRole('button', { name: 'Move Define up' }));
    await waitFor(() => {
      expect(CMSStorage.updateWorkProcess).toHaveBeenCalledWith('step-2', { order: 1 });
      expect(CMSStorage.updateWorkProcess).toHaveBeenCalledWith('step-1', { order: 2 });
    });

    // Toggle publish state
    const hideButtons = screen.getAllByRole('button', { name: /^hide$/i });
    fireEvent.click(hideButtons[0]);
    await waitFor(() => {
      expect(CMSStorage.updateWorkProcess).toHaveBeenCalledWith('step-1', {
        isPublished: false,
      });
    });

    // Delete step
    const deleteButtons = screen.getAllByRole('button', { name: /^delete$/i });
    fireEvent.click(deleteButtons[0]);
    await waitFor(() => {
      expect(CMSStorage.deleteWorkProcess).toHaveBeenCalledWith('step-1');
    });
  });

  it('imports the default 6 steps when the database collection is empty', async () => {
    vi.mocked(CMSStorage.getWorkProcesses)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(sampleSteps);
    vi.mocked(CMSStorage.seedWorkProcesses).mockResolvedValue(sampleSteps);

    render(
      <MemoryRouter>
        <WorkProcessManagement />
      </MemoryRouter>
    );

    const importButtons = await screen.findAllByRole('button', {
      name: /import default 6 steps/i,
    });
    fireEvent.click(importButtons[0]);

    await waitFor(() => {
      expect(CMSStorage.seedWorkProcesses).toHaveBeenCalled();
    });

    expect(
      await screen.findByText(/default 6 work process steps imported successfully!/i)
    ).toBeInTheDocument();
  });
});
