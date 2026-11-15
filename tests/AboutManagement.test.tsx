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

  it('stages uploaded profile image via file input until Save Changes is clicked', async () => {
    const uploadedUrl = 'https://res.cloudinary.com/demo/image/upload/new-avatar.webp';
    vi.mocked(CMSStorage.uploadProfileImage).mockResolvedValue({
      imageURL: uploadedUrl,
      imageCloudinaryId: 'cloudinary-avatar-1',
    });
    vi.mocked(CMSStorage.updateAbout).mockResolvedValue(undefined);

    const { container } = render(
      <MemoryRouter>
        <AboutManagement />
      </MemoryRouter>
    );

    const saveButton = await screen.findByRole('button', { name: /save changes/i });
    expect(container.querySelector('[data-theme="light"]')).toBeInTheDocument();
    expect(container.querySelector('.bg-base-100')).toBeNull();

    const imageInput = screen.getByTestId('profile-image-input');
    const imageFile = new File(['png-bytes'], 'avatar.png', { type: 'image/png' });

    fireEvent.change(imageInput, { target: { files: [imageFile] } });

    await waitFor(() => {
      expect(CMSStorage.uploadProfileImage).toHaveBeenCalledWith(imageFile);
    });

    expect(
      await screen.findByText(/profile image uploaded! click "save changes" below to publish it\./i)
    ).toBeInTheDocument();
    expect(CMSStorage.updateAbout).not.toHaveBeenCalled();

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(CMSStorage.updateAbout).toHaveBeenCalledWith(
        expect.objectContaining({
          imageURL: uploadedUrl,
          imageCloudinaryId: 'cloudinary-avatar-1',
        })
      );
    });
  });

  it('supports drag-and-drop profile image upload on the dropzone', async () => {
    const uploadedUrl = 'https://res.cloudinary.com/demo/image/upload/dropped.jpg';
    vi.mocked(CMSStorage.uploadProfileImage).mockResolvedValue({
      imageURL: uploadedUrl,
      imageCloudinaryId: 'cloudinary-avatar-2',
    });

    render(
      <MemoryRouter>
        <AboutManagement />
      </MemoryRouter>
    );

    await screen.findByRole('button', { name: /save changes/i });

    const dropzone = screen.getByTestId('profile-image-dropzone');
    const droppedFile = new File(['jpg-bytes'], 'portrait.jpg', { type: 'image/jpeg' });

    fireEvent.dragOver(dropzone);
    fireEvent.drop(dropzone, { dataTransfer: { files: [droppedFile] } });

    await waitFor(() => {
      expect(CMSStorage.uploadProfileImage).toHaveBeenCalledWith(droppedFile);
    });

    expect(
      await screen.findByText(/profile image uploaded! click "save changes" below to publish it\./i)
    ).toBeInTheDocument();
  });

  it('rejects invalid MIME types and files over 10MB for profile images, and surfaces upload errors', async () => {
    vi.mocked(CMSStorage.uploadProfileImage).mockRejectedValue(
      new Error('Cloudinary upload preset rejected request')
    );

    render(
      <MemoryRouter>
        <AboutManagement />
      </MemoryRouter>
    );

    await screen.findByRole('button', { name: /save changes/i });

    const imageInput = screen.getByTestId('profile-image-input');

    const invalidTypeFile = new File(['%PDF'], 'doc.pdf', { type: 'application/pdf' });
    fireEvent.change(imageInput, { target: { files: [invalidTypeFile] } });
    expect(CMSStorage.uploadProfileImage).not.toHaveBeenCalled();
    expect(
      await screen.findByText(/please select a valid image file \(png, jpg, gif, webp, or svg\)\./i)
    ).toBeInTheDocument();

    const oversizedFile = new File(['x'], 'huge.png', { type: 'image/png' });
    Object.defineProperty(oversizedFile, 'size', { value: 11 * 1024 * 1024 });
    fireEvent.change(imageInput, { target: { files: [oversizedFile] } });
    expect(CMSStorage.uploadProfileImage).not.toHaveBeenCalled();
    expect(await screen.findByText(/profile image exceeds 10mb limit\./i)).toBeInTheDocument();

    const validFile = new File(['ok'], 'valid.webp', { type: 'image/webp' });
    fireEvent.change(imageInput, { target: { files: [validFile] } });
    expect(
      await screen.findByText(/cloudinary upload preset rejected request/i)
    ).toBeInTheDocument();
  });

  it('edits and saves extended About & Site Copy fields via updateAbout', async () => {
    vi.mocked(CMSStorage.getAbout).mockResolvedValue({
      description: '<p>Bio text</p>',
      imageURL: 'me.jpg',
      name: 'Valentino Jehaut',
      heroHeadline: 'I design and build digital products 💻📱.',
      workProcessSubtitle: 'Original process subtitle.',
      email: 'valentinojehaut@gmail.com',
    });
    vi.mocked(CMSStorage.updateAbout).mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <AboutManagement />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/^display name$/i)).toHaveValue('Valentino Jehaut');
    });

    fireEvent.change(screen.getByLabelText(/^display name$/i), {
      target: { value: 'Valen Dev' },
    });
    fireEvent.change(screen.getByLabelText(/^hero headline$/i), {
      target: { value: 'Custom CMS Headline' },
    });
    fireEvent.change(screen.getByLabelText(/^work process subtitle$/i), {
      target: { value: 'Custom process subtitle from CMS.' },
    });
    fireEvent.change(screen.getByLabelText(/^primary contact email$/i), {
      target: { value: 'valen@example.com' },
    });

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(CMSStorage.updateAbout).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Valen Dev',
          heroHeadline: 'Custom CMS Headline',
          workProcessSubtitle: 'Custom process subtitle from CMS.',
          email: 'valen@example.com',
        })
      );
    });
  });
});

