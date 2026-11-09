import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AboutManagement from '../src/cms/pages/AboutManagement';
import { CMSStorage } from '../src/cms/apiStorage';

// Mock WYSIWYGEditor to avoid TipTap DOM layout issues in JSDOM
vi.mock('../src/cms/components/WYSIWYGEditor', () => ({
  default: ({ value, onChange }: { value: string; onChange: (val: string) => void }) => (
    <textarea
      data-testid="mock-about-wysiwyg"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}));

vi.mock('../src/cms/apiStorage', () => ({
  CMSStorage: {
    getAbout: vi.fn(),
    updateAbout: vi.fn(),
    uploadProfileImage: vi.fn(),
    uploadCV: vi.fn(),
  }
}));

describe('AboutManagement - WYSIWYG & CV Upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads and displays current about data including CV link and WYSIWYG content', async () => {
    const mockAbout = {
      description: '<p>Hello world from CMS</p>',
      imageURL: 'https://example.com/avatar.jpg',
      imageCloudinaryId: 'avatar-123',
      cvURL: 'https://res.cloudinary.com/demo/raw/upload/v1/test_cv.pdf',
      cvCloudinaryId: 'portfolio-cms/cv/cv_test'
    };

    vi.mocked(CMSStorage.getAbout).mockResolvedValue(mockAbout);

    render(
      <MemoryRouter>
        <AboutManagement />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('mock-about-wysiwyg')).toHaveValue('<p>Hello world from CMS</p>');
    });

    const cvLink = screen.getByRole('link', { name: /view current cv/i });
    expect(cvLink).toHaveAttribute('href', 'https://res.cloudinary.com/demo/raw/upload/v1/test_cv.pdf');
  });

  it('uploads a new CV PDF via CMSStorage.uploadCV and updates cvURL state', async () => {
    const mockAbout = {
      description: 'Initial description',
      imageURL: 'https://example.com/avatar.jpg',
      cvURL: '/Valen-Jehaut.pdf',
      cvCloudinaryId: null
    };

    vi.mocked(CMSStorage.getAbout).mockResolvedValue(mockAbout);
    vi.mocked(CMSStorage.uploadCV).mockResolvedValue({
      cvURL: 'https://res.cloudinary.com/demo/raw/upload/v2/new_cv.pdf',
      cvCloudinaryId: 'portfolio-cms/cv/new_cv'
    });
    vi.mocked(CMSStorage.updateAbout).mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <AboutManagement />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('mock-about-wysiwyg')).toBeInTheDocument();
    });

    const cvInput = screen.getByTestId('cv-upload-input');
    const dummyFile = new File(['%PDF-1.4 test cv'], 'my-updated-resume.pdf', { type: 'application/pdf' });

    fireEvent.change(cvInput, { target: { files: [dummyFile] } });

    await waitFor(() => {
      expect(CMSStorage.uploadCV).toHaveBeenCalledWith(dummyFile);
    });

    // Check that success message or view link updated
    await waitFor(() => {
      const cvLink = screen.getByRole('link', { name: /view current cv/i });
      expect(cvLink).toHaveAttribute('href', 'https://res.cloudinary.com/demo/raw/upload/v2/new_cv.pdf');
    });

    // Submit form and verify updated cvURL & cvCloudinaryId sent
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(CMSStorage.updateAbout).toHaveBeenCalledWith(
        expect.objectContaining({
          cvURL: 'https://res.cloudinary.com/demo/raw/upload/v2/new_cv.pdf',
          cvCloudinaryId: 'portfolio-cms/cv/new_cv'
        })
      );
    });
  });

  it('rejects non-PDF files with an error message', async () => {
    const mockAbout = {
      description: 'Test description',
      imageURL: 'myface.jpeg',
      cvURL: '/Valen-Jehaut.pdf'
    };

    vi.mocked(CMSStorage.getAbout).mockResolvedValue(mockAbout);

    render(
      <MemoryRouter>
        <AboutManagement />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('mock-about-wysiwyg')).toBeInTheDocument();
    });

    const cvInput = screen.getByTestId('cv-upload-input');
    const invalidFile = new File(['text'], 'resume.txt', { type: 'text/plain' });

    fireEvent.change(cvInput, { target: { files: [invalidFile] } });

    expect(CMSStorage.uploadCV).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByText(/please select a valid pdf file/i)).toBeInTheDocument();
    });
  });
});

