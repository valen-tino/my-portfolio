import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Home from '../src/pages/Home';
import TechToolsManagement from '../src/cms/pages/TechToolsManagement';
import { CMSStorage, TechTool } from '../src/cms/apiStorage';
import { AuthService } from '../src/cms/auth';

vi.mock('../src/cms/apiStorage', () => ({
  CMSStorage: {
    getTechTools: vi.fn(),
    addTechTool: vi.fn(),
    updateTechTool: vi.fn(),
    deleteTechTool: vi.fn(),
    uploadTechToolImage: vi.fn(),
    syncSkillsFromPortfolios: vi.fn(),
    getPortfolios: vi.fn(),
    getBlogs: vi.fn(),
    getAbout: vi.fn(),
    getEducation: vi.fn(),
    addContactEntry: vi.fn(),
  }
}));

vi.mock('../src/services/api', () => ({
  default: {
    getExperiences: vi.fn().mockResolvedValue({ success: true, data: [] }),
  },
  apiService: {
    getExperiences: vi.fn().mockResolvedValue({ success: true, data: [] }),
  },
}));

vi.mock('../src/cms/auth', () => ({
  AuthService: {
    getSession: vi.fn().mockReturnValue({ email: 'admin@portfolio.com', token: 'mock-jwt' }),
    isAuthenticated: vi.fn().mockReturnValue(true),
    logout: vi.fn()
  }
}));

const mockAllTools: TechTool[] = [
  {
    id: 'tool-1',
    _id: 'tool-1',
    title: 'React',
    imageURL: 'https://res.cloudinary.com/demo/image/upload/react.svg',
    isPublished: true,
    order: 1
  },
  {
    id: 'tool-2',
    _id: 'tool-2',
    title: 'TypeScript',
    imageURL: 'https://res.cloudinary.com/demo/image/upload/ts.svg',
    isPublished: true,
    order: 2
  },
  {
    id: 'tool-3',
    _id: 'tool-3',
    title: 'Kubernetes',
    imageURL: '/placeholder-tech.svg',
    isPublished: false,
    order: 0
  }
];

describe('Tech Tools Auto-Sync & Privacy Isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Home fetches only published tools (publishedOnly = true) and excludes unpublished tools', async () => {
    vi.mocked(CMSStorage.getPortfolios).mockResolvedValue([]);
    vi.mocked(CMSStorage.getBlogs).mockResolvedValue([]);
    vi.mocked(CMSStorage.getAbout).mockResolvedValue({ description: 'Bio', imageURL: '/face.jpg' });
    vi.mocked(CMSStorage.getEducation).mockResolvedValue([]);

    // Only published tools returned for public stack
    const publishedOnly = mockAllTools.filter(t => t.isPublished !== false);
    vi.mocked(CMSStorage.getTechTools).mockImplementation(async (published?: boolean) => {
      if (published) return publishedOnly;
      return mockAllTools;
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(CMSStorage.getTechTools).toHaveBeenCalledWith(true);
      expect(screen.getAllByText('React').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('TypeScript').length).toBeGreaterThanOrEqual(1);
      expect(screen.queryByText('Kubernetes')).toBeNull();
    });
  });

  it('TechToolsManagement CMS displays Draft (Placeholder) badge on auto-provisioned uncataloged tools', async () => {
    vi.mocked(CMSStorage.getTechTools).mockResolvedValue(mockAllTools);

    render(
      <MemoryRouter>
        <TechToolsManagement />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Kubernetes')).toBeInTheDocument();
      expect(screen.getByTestId('draft-badge-tool-3')).toHaveTextContent('Draft (Placeholder)');
      expect(screen.getAllByText('Published').length).toBeGreaterThanOrEqual(2);
    });
  });

  it('allows an administrator to edit a draft tool, toggle Published, and save changes', async () => {
    vi.mocked(CMSStorage.getTechTools).mockResolvedValue([...mockAllTools]);

    const updatedKubernetes = {
      ...mockAllTools[2],
      imageURL: 'https://res.cloudinary.com/demo/image/upload/k8s.svg',
      isPublished: true
    };
    vi.mocked(CMSStorage.updateTechTool).mockResolvedValue(updatedKubernetes);

    render(
      <MemoryRouter>
        <TechToolsManagement />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Kubernetes')).toBeInTheDocument();
    });

    // Find and click the edit button on Kubernetes
    const editK8sBtn = screen.getByTestId('edit-tech-tool-tool-3');
    fireEvent.click(editK8sBtn);

    // Toggle Published checkbox
    const publishedCheckbox = screen.getByLabelText(/Published \(Visible in public skills showcase\)/i);
    expect(publishedCheckbox).not.toBeChecked(); // was false
    fireEvent.click(publishedCheckbox);
    expect(publishedCheckbox).toBeChecked();

    // Click Save Changes
    const saveBtn = screen.getByText('Save Changes');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(CMSStorage.updateTechTool).toHaveBeenCalledWith(
        'tool-3',
        expect.objectContaining({
          id: 'tool-3',
          isPublished: true
        })
      );
      expect(screen.getByText('Tech tool updated successfully!')).toBeInTheDocument();
    });
  });

  it('triggers manual sync from portfolios via the CMS sync button', async () => {
    vi.mocked(CMSStorage.getTechTools).mockResolvedValue([...mockAllTools]);
    vi.mocked(CMSStorage.syncSkillsFromPortfolios).mockResolvedValue({
      success: true,
      message: 'Migrated 3 skill(s) from portfolios.',
      data: { scannedPortfolios: 5, totalUniqueSkills: 12, insertedCount: 3 }
    });

    render(
      <MemoryRouter>
        <TechToolsManagement />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('sync-skills-btn')).toBeInTheDocument();
    });

    const syncBtn = screen.getByTestId('sync-skills-btn');
    fireEvent.click(syncBtn);

    await waitFor(() => {
      expect(CMSStorage.syncSkillsFromPortfolios).toHaveBeenCalled();
      expect(screen.getByText('Migrated 3 skill(s) from portfolios.')).toBeInTheDocument();
    });
  });
});
