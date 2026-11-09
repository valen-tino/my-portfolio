import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PortfolioManagement from '../src/cms/pages/PortfolioManagement';
import { CMSStorage } from '../src/cms/apiStorage';

// Mock WYSIWYGEditor to avoid TipTap layout issues in JSDOM
vi.mock('../src/cms/components/WYSIWYGEditor', () => ({
  default: ({ value, onChange }: { value: string; onChange: (val: string) => void }) => (
    <textarea
      data-testid="mock-wysiwyg"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}));

// Mock CMSStorage API methods
vi.mock('../src/cms/apiStorage', () => ({
  CMSStorage: {
    getPortfolios: vi.fn(),
    getTechTools: vi.fn(),
    getRoles: vi.fn(),
    getExperiences: vi.fn(),
    getEducation: vi.fn(),
    addPortfolio: vi.fn(),
    updatePortfolio: vi.fn(),
    deletePortfolio: vi.fn(),
    uploadPortfolioImage: vi.fn(),
    uploadPortfolioVideo: vi.fn()
  }
}));

const mockTools = [
  { id: '1', title: 'React', imageURL: '/react.svg', category: 'Frontend', level: 'Advanced' },
  { id: '2', title: 'Node.js', imageURL: '/node.svg', category: 'Backend', level: 'Intermediate' }
];

describe('PortfolioManagement - Custom Technologies Input', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(CMSStorage.getPortfolios).mockResolvedValue([]);
    vi.mocked(CMSStorage.getTechTools).mockResolvedValue(mockTools as any);
    vi.mocked(CMSStorage.getRoles).mockResolvedValue([]);
    vi.mocked(CMSStorage.getExperiences).mockResolvedValue([]);
    vi.mocked(CMSStorage.getEducation).mockResolvedValue([]);
    vi.mocked(CMSStorage.addPortfolio).mockImplementation((item) => Promise.resolve({ ...item, id: 'saved-1' }));
    vi.mocked(CMSStorage.updatePortfolio).mockImplementation((id, item) => Promise.resolve(item as any));
  });

  const renderComponentAndOpenAddModal = async () => {
    render(
      <MemoryRouter>
        <PortfolioManagement />
      </MemoryRouter>
    );

    // Wait for initial data loading
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add project|add your first project/i })).toBeInTheDocument();
    });

    // Click Add Project to open modal
    fireEvent.click(screen.getByRole('button', { name: /add project|add your first project/i }));

    // Verify modal is open and custom tech input is visible
    expect(screen.getByTestId('custom-tech-input')).toBeInTheDocument();
  };

  it('adds custom technologies as chips when clicking + Add button', async () => {
    await renderComponentAndOpenAddModal();

    const input = screen.getByTestId('custom-tech-input');
    const addBtn = screen.getByTestId('add-custom-tech-btn');

    fireEvent.change(input, { target: { value: 'Three.js, WebGL' } });
    fireEvent.click(addBtn);

    // Chips must appear in selected chips container
    expect(screen.getByText('Three.js')).toBeInTheDocument();
    expect(screen.getByText('WebGL')).toBeInTheDocument();
    expect(input).toHaveValue('');
    expect(screen.getByText(/Technologies Used \(2\)/)).toBeInTheDocument();
  });

  it('adds custom technologies when pressing Enter or comma', async () => {
    await renderComponentAndOpenAddModal();

    const input = screen.getByTestId('custom-tech-input');

    // Test Enter key
    fireEvent.change(input, { target: { value: 'Docker' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText('Docker')).toBeInTheDocument();
    expect(input).toHaveValue('');

    // Test comma key
    fireEvent.change(input, { target: { value: 'Kubernetes' } });
    fireEvent.keyDown(input, { key: ',', code: 'Comma' });

    expect(screen.getByText('Kubernetes')).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  it('normalizes casing against catalog and prevents duplicate tags', async () => {
    await renderComponentAndOpenAddModal();

    const input = screen.getByTestId('custom-tech-input');
    const addBtn = screen.getByTestId('add-custom-tech-btn');

    // Type lowercase 'react' which exists in catalog as 'React'
    fireEvent.change(input, { target: { value: 'react' } });
    fireEvent.click(addBtn);

    // Should normalize to 'React' in selected chips
    const chipsContainer = screen.getByTestId('selected-tech-chips');
    expect(within(chipsContainer).getByText('React')).toBeInTheDocument();
    expect(screen.getByText(/Technologies Used \(1\)/)).toBeInTheDocument();

    // Try adding duplicate 'REACT'
    fireEvent.change(input, { target: { value: 'REACT' } });
    fireEvent.click(addBtn);

    // Count should still be 1
    expect(screen.getByText(/Technologies Used \(1\)/)).toBeInTheDocument();
  });

  it('automatically commits uncommitted input buffer on form save', async () => {
    await renderComponentAndOpenAddModal();

    // Populate mandatory fields
    fireEvent.change(screen.getByPlaceholderText(/e\.g\., E-commerce Website/i), {
      target: { value: 'My Test Project' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Brief description that appears on portfolio cards/i), {
      target: { value: 'Test description' }
    });

    // Type into custom tech without clicking Add or pressing Enter
    const input = screen.getByTestId('custom-tech-input');
    fireEvent.change(input, { target: { value: 'UnsavedTech1, UnsavedTech2' } });

    // Click Save button in sticky header
    const saveButton = screen.getByTitle(/save changes/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(CMSStorage.addPortfolio).toHaveBeenCalledWith(
        expect.objectContaining({
          tech: expect.arrayContaining(['UnsavedTech1', 'UnsavedTech2'])
        })
      );
    });
  });

  it('resets custom tech input buffer when clicking Clear all', async () => {
    await renderComponentAndOpenAddModal();

    const input = screen.getByTestId('custom-tech-input');
    const addBtn = screen.getByTestId('add-custom-tech-btn');

    fireEvent.change(input, { target: { value: 'TechToClear' } });
    fireEvent.click(addBtn);

    expect(screen.getByText('TechToClear')).toBeInTheDocument();

    // Also leave pending text in input
    fireEvent.change(input, { target: { value: 'PendingToClear' } });

    // Click Clear all
    const clearAllBtn = screen.getByRole('button', { name: /clear all/i });
    fireEvent.click(clearAllBtn);

    expect(screen.queryByText('TechToClear')).not.toBeInTheDocument();
    expect(input).toHaveValue('');
  });
});
