import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WYSIWYGEditor, { buildGalleryInnerHtml } from '../src/cms/components/WYSIWYGEditor';
import { CMSStorage } from '../src/cms/apiStorage';
import { isMarkdownContent, migrateContentToHtml, optimizeCloudinaryVideoUrl } from '../src/utils/contentMigration';

vi.mock('../src/cms/apiStorage', () => ({
  CMSStorage: {
    uploadEditorMedia: vi.fn(),
    uploadEditorGallery: vi.fn()
  }
}));

describe('Content Migration & WYSIWYG Editor with Gallery Controls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('detects legacy markdown content and migrates it to semantic HTML with standardized section titles', () => {
    const md = '## Project Overview\n\n- Built with React\n- Hosted on Vercel';
    expect(isMarkdownContent(md)).toBe(true);

    const html = migrateContentToHtml(md);
    expect(html).toContain('<h2 class="portfolio-section-title">1. Project Background & Context</h2>');
    expect(html).toContain('<li>Built with React</li>');
    expect(isMarkdownContent(html)).toBe(false);
  });

  it('inserts preset and custom section titles via the Section Title dropdown', async () => {
    const handleChange = vi.fn();
    render(<WYSIWYGEditor value="<p>Start</p>" onChange={handleChange} />);

    const dropdownBtn = screen.getByTestId('section-title-dropdown-btn');
    fireEvent.click(dropdownBtn);

    expect(screen.getByTestId('section-title-menu')).toBeInTheDocument();

    const presetBtn = screen.getByTestId('preset-section-1. Project Background & Context');
    fireEvent.click(presetBtn);

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalled();
    });
  });

  it('optimizes Cloudinary video URLs with q_auto,f_auto,w_1920,c_limit', () => {
    const rawUrl = 'https://res.cloudinary.com/demo/video/upload/v12345/sample.mp4';
    const optimized = optimizeCloudinaryVideoUrl(rawUrl);
    expect(optimized).toBe('https://res.cloudinary.com/demo/video/upload/q_auto,f_auto,w_1920,c_limit/v12345/sample.mp4');
  });

  it('builds gallery HTML with per-item size and aspect ratio attributes for images and videos', () => {
    const galleryHtml = buildGalleryInnerHtml([
      {
        id: 'item-1',
        src: 'https://res.cloudinary.com/demo/image/upload/img1.jpg',
        mediaType: 'image',
        alt: 'First image',
        size: '50%',
        aspectRatio: '16:9'
      },
      {
        id: 'item-2',
        src: 'https://res.cloudinary.com/demo/video/upload/v1/vid1.mp4',
        mediaType: 'video',
        size: '25%',
        aspectRatio: '1:1'
      }
    ]);

    expect(galleryHtml).toContain('data-size="50%"');
    expect(galleryHtml).toContain('data-aspect="16:9"');
    expect(galleryHtml).toContain('data-size="25%"');
    expect(galleryHtml).toContain('data-aspect="1:1"');
    expect(galleryHtml).toContain('q_auto,f_auto,w_1920,c_limit');
  });

  it('uploads single image/video to Cloudinary and inserts media node with controls', async () => {
    vi.mocked(CMSStorage.uploadEditorMedia).mockResolvedValue({
      url: 'https://res.cloudinary.com/demo/image/upload/uploaded.jpg',
      cloudinaryId: 'uploaded-id',
      mediaType: 'image'
    });

    const handleChange = vi.fn();
    render(<WYSIWYGEditor value="<p>Initial content</p>" onChange={handleChange} />);

    const singleInput = screen.getByTestId('single-media-input');
    const file = new File(['dummy'], 'screenshot.png', { type: 'image/png' });

    fireEvent.change(singleInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(CMSStorage.uploadEditorMedia).toHaveBeenCalledWith(file);
      expect(screen.getByTestId('single-media-controls')).toBeInTheDocument();
    });
  });

  it('uploads multiple files as a gallery section with individual item size controls', async () => {
    vi.mocked(CMSStorage.uploadEditorGallery).mockResolvedValue([
      {
        url: 'https://res.cloudinary.com/demo/image/upload/gal1.jpg',
        cloudinaryId: 'gal1',
        mediaType: 'image'
      },
      {
        url: 'https://res.cloudinary.com/demo/video/upload/v1/gal2.mp4',
        cloudinaryId: 'gal2',
        mediaType: 'video'
      }
    ]);

    const handleChange = vi.fn();
    render(<WYSIWYGEditor value="<p>Gallery test</p>" onChange={handleChange} />);

    const galleryInput = screen.getByTestId('gallery-media-input');
    const file1 = new File(['img'], 'gal1.jpg', { type: 'image/jpeg' });
    const file2 = new File(['vid'], 'gal2.mp4', { type: 'video/mp4' });

    fireEvent.change(galleryInput, { target: { files: [file1, file2] } });

    await waitFor(() => {
      expect(CMSStorage.uploadEditorGallery).toHaveBeenCalled();
      expect(screen.getByTestId('gallery-node')).toBeInTheDocument();
    });

    // Verify "Click to view image" badge is rendered and clicking the image opens Lightbox modal
    expect(screen.getByText(/Click to view image/i)).toBeInTheDocument();
    const imgElement = screen.getByAltText('gal1.jpg');
    fireEvent.click(imgElement);

    await waitFor(() => {
      expect(screen.getByTestId('image-lightbox-modal')).toBeInTheDocument();
      expect(screen.getByTestId('lightbox-image')).toHaveAttribute(
        'src',
        'https://res.cloudinary.com/demo/image/upload/gal1.jpg'
      );
    });
  });

  it('toggles bullet list and ordered list in the editor without resetting state', async () => {
    const Wrapper: React.FC = () => {
      const [val, setVal] = React.useState('<h2 class="portfolio-section-title">1. Project Background & Context</h2><p>First bullet item</p>');
      return <WYSIWYGEditor value={val} onChange={setVal} />;
    };

    render(<Wrapper />);

    const bulletListBtn = screen.getByTestId('toolbar-bullet-list-btn');
    fireEvent.click(bulletListBtn);

    await waitFor(() => {
      const editorEl = document.querySelector('.ProseMirror');
      expect(editorEl?.innerHTML).toContain('<ul>');
      expect(editorEl?.innerHTML).toContain('<li>');
    });

    const orderedListBtn = screen.getByTestId('toolbar-ordered-list-btn');
    fireEvent.click(orderedListBtn);

    await waitFor(() => {
      const editorEl = document.querySelector('.ProseMirror');
      expect(editorEl?.innerHTML).toContain('<ol>');
      expect(editorEl?.innerHTML).toContain('<li>');
    });
  });
});

