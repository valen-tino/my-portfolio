import React, { useEffect, useRef, useState } from 'react';
import {
  useEditor,
  EditorContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  NodeViewProps
} from '@tiptap/react';
import { Node, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { CMSStorage } from '../apiStorage';
import { migrateContentToHtml, optimizeCloudinaryVideoUrl, STANDARD_SECTION_TITLES } from '../../utils/contentMigration';
import ImageLightboxModal, { LightboxImageItem } from '../../components/ImageLightboxModal';

export type MediaSizeOption = '25%' | '33%' | '50%' | '75%' | '100%';
export type AspectRatioOption = '16:9' | '4:3' | '1:1' | 'auto';
export type AlignOption = 'left' | 'center' | 'right';

export interface GalleryMediaItem {
  id: string;
  src: string;
  mediaType: 'image' | 'video';
  alt?: string;
  size: MediaSizeOption;
  aspectRatio: AspectRatioOption;
}

const ASPECT_CLASS_MAP: Record<AspectRatioOption, string> = {
  '16:9': 'aspect-video',
  '4:3': 'aspect-[4/3]',
  '1:1': 'aspect-square',
  'auto': 'aspect-auto'
};

const ALIGN_CLASS_MAP: Record<AlignOption, string> = {
  left: 'mr-auto',
  center: 'mx-auto',
  right: 'ml-auto'
};

const SIZE_OPTIONS: MediaSizeOption[] = ['25%', '33%', '50%', '75%', '100%'];
const ASPECT_OPTIONS: AspectRatioOption[] = ['16:9', '4:3', '1:1', 'auto'];

const MAX_IMAGE_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
const MAX_VIDEO_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

const validateMediaFileSize = (file: File): string | null => {
  const isVideo = (file.type && file.type.startsWith('video/')) || /\.(mp4|webm|mov|mkv|m4v)$/i.test(file.name);
  if (isVideo && file.size > MAX_VIDEO_FILE_SIZE) {
    return `Video "${file.name}" exceeds 100 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`;
  }
  if (!isVideo && file.size > MAX_IMAGE_FILE_SIZE) {
    return `Image "${file.name}" exceeds 25 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`;
  }
  return null;
};

/**
 * Helper to build gallery HTML from items array so both renderHTML and static rendering match.
 */
export function buildGalleryInnerHtml(items: GalleryMediaItem[]): string {
  return items
    .map((item) => {
      const aspectClass = ASPECT_CLASS_MAP[item.aspectRatio || '16:9'] || 'aspect-video';
      const size = item.size || '33%';
      const flexBasis =
        size === '33%' ? 'calc(33.333% - 1rem)' : size === '50%' ? 'calc(50% - 1rem)' : size === '25%' ? 'calc(25% - 1rem)' : size === '75%' ? 'calc(75% - 1rem)' : '100%';
      const mediaTag =
        item.mediaType === 'video'
          ? `<video src="${optimizeCloudinaryVideoUrl(item.src)}" controls playsinline preload="metadata" class="w-full h-full object-cover rounded-xl shadow-md ${aspectClass}"></video>`
          : `<img src="${item.src}" alt="${item.alt || 'Gallery image'}" class="w-full h-full object-cover rounded-xl shadow-md ${aspectClass}" loading="lazy" /><span class="gallery-zoom-badge">🔍 Click to view image</span>`;

      const figureClass = item.mediaType === 'image' ? 'gallery-item gallery-image-clickable my-0 relative group cursor-pointer' : 'gallery-item my-0 relative';

      return `<figure class="${figureClass}" data-item-id="${item.id}" data-media-type="${item.mediaType}" data-size="${size}" data-aspect="${item.aspectRatio || '16:9'}" style="width: ${flexBasis}; flex: 0 0 ${flexBasis}; max-width: 100%;">${mediaTag}</figure>`;
    })
    .join('');
}

/**
 * React NodeView for Single Media (Image or Video) with Size, Aspect Ratio, and Alignment Controls
 */
const SingleMediaNodeView: React.FC<NodeViewProps> = ({ node, updateAttributes, deleteNode, selected }) => {
  const { src, mediaType, alt, size, aspectRatio, align } = node.attrs as {
    src: string;
    mediaType: 'image' | 'video';
    alt: string;
    size: MediaSizeOption;
    aspectRatio: AspectRatioOption;
    align: AlignOption;
  };
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const aspectClass = ASPECT_CLASS_MAP[aspectRatio || '16:9'] || 'aspect-video';
  const alignClass = ALIGN_CLASS_MAP[align || 'center'] || 'mx-auto';

  return (
    <NodeViewWrapper className="my-4 relative group" data-testid="single-media-node">
      {/* Interactive Media Controls Bar */}
      <div
        className={`flex flex-wrap items-center gap-2 p-2 mb-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg transition-opacity ${
          selected ? 'opacity-100' : 'opacity-90 group-hover:opacity-100'
        }`}
        data-testid="single-media-controls"
      >
        <span className="font-semibold text-gray-300">Size:</span>
        {SIZE_OPTIONS.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => updateAttributes({ size: opt })}
            className={`px-2 py-0.5 rounded ${
              size === opt ? 'bg-blue-600 text-white font-bold' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
            }`}
          >
            {opt}
          </button>
        ))}

        <span className="font-semibold text-gray-300 ml-2">Ratio:</span>
        {ASPECT_OPTIONS.map((ratio) => (
          <button
            key={ratio}
            type="button"
            onClick={() => updateAttributes({ aspectRatio: ratio })}
            className={`px-2 py-0.5 rounded ${
              aspectRatio === ratio ? 'bg-blue-600 text-white font-bold' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
            }`}
          >
            {ratio}
          </button>
        ))}

        <span className="font-semibold text-gray-300 ml-2">Align:</span>
        {(['left', 'center', 'right'] as AlignOption[]).map((al) => (
          <button
            key={al}
            type="button"
            onClick={() => updateAttributes({ align: al })}
            className={`px-2 py-0.5 rounded capitalize ${
              align === al ? 'bg-blue-600 text-white font-bold' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
            }`}
          >
            {al}
          </button>
        ))}

        <button
          type="button"
          onClick={() => deleteNode()}
          className="ml-auto px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded"
          title="Remove media"
        >
          ✕ Remove
        </button>
      </div>

      <figure
        style={{ width: size || '100%', maxWidth: '100%' }}
        className={`${alignClass} relative transition-all duration-200 ${selected ? 'ring-2 ring-blue-500 rounded-xl' : ''}`}
      >
        {mediaType === 'video' ? (
          <video
            src={optimizeCloudinaryVideoUrl(src)}
            controls
            playsInline
            preload="metadata"
            className={`w-full rounded-xl shadow-md object-cover ${aspectClass}`}
          />
        ) : (
          <div
            className="relative group/img cursor-pointer overflow-hidden rounded-xl"
            onClick={() => setLightboxOpen(true)}
            data-testid="single-media-image-trigger"
          >
            <img
              src={src}
              alt={alt || 'Portfolio media'}
              className={`w-full rounded-xl shadow-md object-cover transition-transform duration-200 group-hover/img:scale-[1.01] ${aspectClass}`}
            />
            <span className="gallery-zoom-badge">🔍 Click to view image</span>
          </div>
        )}
      </figure>

      {mediaType === 'image' && (
        <ImageLightboxModal
          images={[{ src, alt: alt || 'Portfolio media' }]}
          currentIndex={0}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onSelectIndex={() => {}}
        />
      )}
    </NodeViewWrapper>
  );
};

/**
 * Custom TipTap Node for Single Media (Image or Video)
 */
export const PortfolioMediaNode = Node.create({
  name: 'portfolioMedia',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: { default: '' },
      mediaType: { default: 'image' },
      alt: { default: '' },
      size: { default: '100%' },
      aspectRatio: { default: '16:9' },
      align: { default: 'center' }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'figure[data-portfolio-media="true"]',
        getAttrs: (dom) => {
          const el = dom as HTMLElement;
          const video = el.querySelector('video');
          const img = el.querySelector('img');
          return {
            src: video?.getAttribute('src') || img?.getAttribute('src') || el.getAttribute('data-src') || '',
            mediaType: el.getAttribute('data-media-type') || (video ? 'video' : 'image'),
            alt: img?.getAttribute('alt') || '',
            size: el.getAttribute('data-size') || '100%',
            aspectRatio: el.getAttribute('data-aspect') || '16:9',
            align: el.getAttribute('data-align') || 'center'
          };
        }
      },
      {
        tag: 'img[src]',
        getAttrs: (dom) => {
          const el = dom as HTMLElement;
          if (el.closest('[data-portfolio-gallery="true"]')) return false;
          return {
            src: el.getAttribute('src') || '',
            mediaType: 'image',
            alt: el.getAttribute('alt') || '',
            size: el.getAttribute('data-size') || '100%',
            aspectRatio: el.getAttribute('data-aspect') || 'auto',
            align: el.getAttribute('data-align') || 'center'
          };
        }
      }
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, mediaType, alt, size, aspectRatio, align } = HTMLAttributes;
    const aspectClass = ASPECT_CLASS_MAP[(aspectRatio as AspectRatioOption) || '16:9'] || 'aspect-video';
    const alignClass = ALIGN_CLASS_MAP[(align as AlignOption) || 'center'] || 'mx-auto';

    const childNode =
      mediaType === 'video'
        ? [
            'video',
            {
              src: optimizeCloudinaryVideoUrl(src),
              controls: 'true',
              playsinline: 'true',
              preload: 'metadata',
              class: `w-full rounded-xl shadow-md object-cover ${aspectClass}`
            }
          ]
        : [
            'img',
            {
              src,
              alt: alt || 'Portfolio media',
              loading: 'lazy',
              class: `w-full rounded-xl shadow-md object-cover ${aspectClass}`
            }
          ];

    return [
      'figure',
      mergeAttributes({
        'data-portfolio-media': 'true',
        'data-src': src,
        'data-media-type': mediaType,
        'data-size': size,
        'data-aspect': aspectRatio,
        'data-align': align,
        style: `width: ${size || '100%'}; max-width: 100%;`,
        class: `my-6 ${alignClass}`
      }),
      childNode
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(SingleMediaNodeView);
  }
});

/**
 * React NodeView for Gallery Section with Per-Item Image & Video Size Controls
 */
const GalleryNodeView: React.FC<NodeViewProps> = ({ node, updateAttributes, deleteNode }) => {
  const items: GalleryMediaItem[] = Array.isArray(node.attrs.items) ? node.attrs.items : [];
  const [uploadingMore, setUploadingMore] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);

  const galleryImages: LightboxImageItem[] = items
    .filter((item) => item.mediaType === 'image')
    .map((item) => ({ src: item.src, alt: item.alt || 'Gallery item' }));

  const handleOpenImageLightbox = (itemSrc: string) => {
    const idx = galleryImages.findIndex((img) => img.src === itemSrc);
    if (idx !== -1) {
      setLightboxIndex(idx);
    }
  };

  const updateItem = (id: string, patch: Partial<GalleryMediaItem>) => {
    const updated = items.map((item) => (item.id === id ? { ...item, ...patch } : item));
    updateAttributes({ items: updated });
  };

  const removeItem = (id: string) => {
    const updated = items.filter((item) => item.id !== id);
    if (updated.length === 0) {
      deleteNode();
    } else {
      updateAttributes({ items: updated });
    }
  };

  const handleAddMoreFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    for (const f of files) {
      const sizeErr = validateMediaFileSize(f);
      if (sizeErr) {
        alert(sizeErr);
        if (addMoreInputRef.current) addMoreInputRef.current.value = '';
        return;
      }
    }

    setUploadingMore(true);
    try {
      const uploaded = await CMSStorage.uploadEditorGallery(files);
      const newItems: GalleryMediaItem[] = uploaded.map((u, idx) => ({
        id: `gal-${Date.now()}-${idx}`,
        src: u.url,
        mediaType: u.mediaType,
        alt: files[idx]?.name || 'Gallery item',
        size: '33%',
        aspectRatio: '16:9'
      }));
      updateAttributes({ items: [...items, ...newItems] });
    } catch (error) {
      console.error('Failed to add files to gallery:', error);
    } finally {
      setUploadingMore(false);
      if (addMoreInputRef.current) addMoreInputRef.current.value = '';
    }
  };

  return (
    <NodeViewWrapper className="my-6 p-4 border-2 border-dashed border-blue-300 rounded-2xl bg-blue-50/40" data-testid="gallery-node">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-blue-200">
        <div className="flex items-center gap-2">
          <span className="badge badge-info badge-sm text-white font-semibold">🖼️ Gallery Section ({items.length} items)</span>
          <span className="text-xs text-gray-500">Adjust individual sizes or click any image to preview</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={addMoreInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={handleAddMoreFiles}
          />
          <button
            type="button"
            onClick={() => addMoreInputRef.current?.click()}
            disabled={uploadingMore}
            className="px-2.5 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
          >
            {uploadingMore ? 'Uploading...' : '+ Add Media to Gallery'}
          </button>
          <button
            type="button"
            onClick={() => deleteNode()}
            className="px-2.5 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded-md font-medium"
          >
            Delete Gallery
          </button>
        </div>
      </div>

      {/* Gallery Grid with Per-Item Size & Aspect Controls (Responsive: Mobile Carousel, Tablet 2-Col, Desktop Custom) */}
      <div className="portfolio-gallery flex flex-wrap gap-4 items-start">
        {items.map((item) => {
          const aspectClass = ASPECT_CLASS_MAP[item.aspectRatio || '16:9'] || 'aspect-video';
          const size = item.size || '33%';
          const widthStyle =
            size === '33%'
              ? 'calc(33.333% - 0.75rem)'
              : size === '50%'
              ? 'calc(50% - 0.75rem)'
              : size === '25%'
              ? 'calc(25% - 0.75rem)'
              : size === '75%'
              ? 'calc(75% - 0.75rem)'
              : '100%';

          return (
            <div
              key={item.id}
              style={{ width: widthStyle, flex: `0 0 ${widthStyle}`, maxWidth: '100%' }}
              className="gallery-item bg-white rounded-xl p-2 shadow-sm border border-gray-200 transition-all duration-200"
              data-testid={`gallery-item-${item.id}`}
              data-size={size}
              data-aspect={item.aspectRatio || '16:9'}
            >
              {/* Per-item controls */}
              <div className="flex flex-wrap items-center justify-between gap-1 mb-2 bg-gray-800 text-white p-1.5 rounded-lg text-[11px]" data-testid={`gallery-item-controls-${item.id}`}>
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-gray-300 font-medium">Size:</span>
                  {SIZE_OPTIONS.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => updateItem(item.id, { size: sz })}
                      className={`px-1.5 py-0.5 rounded ${
                        size === sz ? 'bg-blue-500 text-white font-bold' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-gray-300 font-medium">Ratio:</span>
                  {ASPECT_OPTIONS.map((rt) => (
                    <button
                      key={rt}
                      type="button"
                      onClick={() => updateItem(item.id, { aspectRatio: rt })}
                      className={`px-1.5 py-0.5 rounded ${
                        item.aspectRatio === rt ? 'bg-blue-500 text-white font-bold' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                      }`}
                    >
                      {rt}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="ml-1 px-1.5 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded"
                    title="Remove item from gallery"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {item.mediaType === 'video' ? (
                <video
                  src={optimizeCloudinaryVideoUrl(item.src)}
                  controls
                  playsInline
                  preload="metadata"
                  className={`w-full rounded-lg object-cover ${aspectClass}`}
                />
              ) : (
                <div
                  className="relative group/gal cursor-pointer overflow-hidden rounded-lg"
                  onClick={() => handleOpenImageLightbox(item.src)}
                  data-testid={`gallery-image-trigger-${item.id}`}
                >
                  <img
                    src={item.src}
                    alt={item.alt || 'Gallery item'}
                    className={`w-full rounded-lg object-cover transition-transform duration-200 group-hover/gal:scale-[1.02] ${aspectClass}`}
                  />
                  <span className="gallery-zoom-badge">🔍 Click to view image</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ImageLightboxModal
        images={galleryImages}
        currentIndex={lightboxIndex ?? 0}
        isOpen={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
        onSelectIndex={(idx) => setLightboxIndex(idx)}
      />
    </NodeViewWrapper>
  );
};

/**
 * Custom TipTap Node for Multi-Media Gallery Section
 */
export const PortfolioGalleryNode = Node.create({
  name: 'portfolioGallery',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      items: {
        default: []
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-portfolio-gallery="true"]',
        getAttrs: (dom) => {
          const el = dom as HTMLElement;
          const rawJson = el.getAttribute('data-gallery-items');
          if (rawJson) {
            try {
              return { items: JSON.parse(rawJson) };
            } catch (e) {
              console.error('Failed to parse gallery items JSON:', e);
            }
          }
          // Fallback: parse child <figure> elements
          const figures = Array.from(el.querySelectorAll('figure.gallery-item'));
          const parsedItems: GalleryMediaItem[] = figures.map((fig, idx) => {
            const video = fig.querySelector('video');
            const img = fig.querySelector('img');
            return {
              id: fig.getAttribute('data-item-id') || `gal-item-${idx}`,
              src: video?.getAttribute('src') || img?.getAttribute('src') || '',
              mediaType: (fig.getAttribute('data-media-type') as 'image' | 'video') || (video ? 'video' : 'image'),
              alt: img?.getAttribute('alt') || 'Gallery item',
              size: (fig.getAttribute('data-size') as MediaSizeOption) || '33%',
              aspectRatio: (fig.getAttribute('data-aspect') as AspectRatioOption) || '16:9'
            };
          });
          return { items: parsedItems };
        }
      }
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const items: GalleryMediaItem[] = Array.isArray(HTMLAttributes.items) ? HTMLAttributes.items : [];

    const childNodes = items.map((item) => {
      const aspectClass = ASPECT_CLASS_MAP[item.aspectRatio || '16:9'] || 'aspect-video';
      const size = item.size || '33%';
      const flexBasis =
        size === '33%'
          ? 'calc(33.333% - 1rem)'
          : size === '50%'
          ? 'calc(50% - 1rem)'
          : size === '25%'
          ? 'calc(25% - 1rem)'
          : size === '75%'
          ? 'calc(75% - 1rem)'
          : '100%';

      if (item.mediaType === 'video') {
        return [
          'figure',
          {
            class: 'gallery-item my-0 relative',
            'data-item-id': item.id,
            'data-media-type': item.mediaType,
            'data-size': size,
            'data-aspect': item.aspectRatio || '16:9',
            style: `width: ${flexBasis}; flex: 0 0 ${flexBasis}; max-width: 100%;`
          },
          [
            'video',
            {
              src: optimizeCloudinaryVideoUrl(item.src),
              controls: 'true',
              playsinline: 'true',
              preload: 'metadata',
              class: `w-full h-full object-cover rounded-xl shadow-md ${aspectClass}`
            }
          ]
        ];
      }

      return [
        'figure',
        {
          class: 'gallery-item gallery-image-clickable my-0 relative group cursor-pointer',
          'data-item-id': item.id,
          'data-media-type': item.mediaType,
          'data-size': size,
          'data-aspect': item.aspectRatio || '16:9',
          style: `width: ${flexBasis}; flex: 0 0 ${flexBasis}; max-width: 100%;`
        },
        [
          'img',
          {
            src: item.src,
            alt: item.alt || 'Gallery image',
            loading: 'lazy',
            class: `w-full h-full object-cover rounded-xl shadow-md ${aspectClass}`
          }
        ],
        [
          'span',
          {
            class: 'gallery-zoom-badge'
          },
          '🔍 Click to view image'
        ]
      ];
    });

    return [
      'div',
      mergeAttributes({
        'data-portfolio-gallery': 'true',
        'data-gallery-items': JSON.stringify(items),
        class: 'portfolio-gallery flex flex-wrap gap-4 my-6 items-start'
      }),
      ...childNodes
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(GalleryNodeView);
  }
});

export interface WYSIWYGEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const WYSIWYGEditor: React.FC<WYSIWYGEditorProps> = ({ value, onChange }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showSectionMenu, setShowSectionMenu] = useState(false);
  const [customSectionTitle, setCustomSectionTitle] = useState('');
  const singleFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const sectionMenuRef = useRef<HTMLDivElement>(null);

  const initialHtml = migrateContentToHtml(value || '');
  const lastEmittedHtmlRef = useRef<string>(initialHtml);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
          HTMLAttributes: {
            class: 'portfolio-section-title'
          }
        },
        link: {
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-info underline'
          }
        }
      }),
      PortfolioMediaNode,
      PortfolioGalleryNode
    ],
    content: initialHtml,
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      lastEmittedHtmlRef.current = html;
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none min-h-[420px] p-5 focus:outline-none text-gray-800'
      }
    }
  });

  // Close section dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sectionMenuRef.current && !sectionMenuRef.current.contains(e.target as any)) {
        setShowSectionMenu(false);
      }
    };
    if (showSectionMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSectionMenu]);

  // Sync external value changes (e.g., when AI rewrites projectDetails or user switches portfolio item)
  useEffect(() => {
    if (!editor) return;
    // Skip setContent if the incoming value matches the HTML just emitted by the editor itself
    if (value === lastEmittedHtmlRef.current || value === editor.getHTML()) {
      return;
    }
    const migrated = migrateContentToHtml(value || '');
    if (migrated !== editor.getHTML()) {
      lastEmittedHtmlRef.current = migrated;
      editor.commands.setContent(migrated, { emitUpdate: false });
    }
  }, [value, editor]);

  const handleInsertSectionTitle = (title: string) => {
    if (!editor || !title.trim()) return;

    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ').trim();
    const sectionText = selectedText || title.trim();

    // Insert section title H2 followed by an active paragraph
    editor
      .chain()
      .focus()
      .insertContent(`<h2 class="portfolio-section-title">${sectionText}</h2><p></p>`)
      .run();

    setShowSectionMenu(false);
    setCustomSectionTitle('');
  };

  const handleSingleMediaSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    const sizeErr = validateMediaFileSize(file);
    if (sizeErr) {
      setUploadError(sizeErr);
      if (singleFileInputRef.current) singleFileInputRef.current.value = '';
      return;
    }

    setUploading(true);
    setUploadError('');
    try {
      const result = await CMSStorage.uploadEditorMedia(file);
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'portfolioMedia',
          attrs: {
            src: result.url,
            mediaType: result.mediaType,
            alt: file.name,
            size: '100%',
            aspectRatio: '16:9',
            align: 'center'
          }
        })
        .run();
    } catch (err: any) {
      console.error('Media upload failed:', err);
      setUploadError(err.message || 'Failed to upload media to Cloudinary');
    } finally {
      setUploading(false);
      if (singleFileInputRef.current) singleFileInputRef.current.value = '';
    }
  };

  const handleGallerySelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0 || !editor) return;

    const files = Array.from(fileList);
    for (const f of files) {
      const sizeErr = validateMediaFileSize(f);
      if (sizeErr) {
        setUploadError(sizeErr);
        if (galleryFileInputRef.current) galleryFileInputRef.current.value = '';
        return;
      }
    }

    setUploading(true);
    setUploadError('');
    try {
      const uploadedItems = await CMSStorage.uploadEditorGallery(files);
      const defaultSize: MediaSizeOption = files.length === 2 ? '50%' : '33%';

      const galleryItems: GalleryMediaItem[] = uploadedItems.map((item, idx) => ({
        id: `gal-${Date.now()}-${idx}`,
        src: item.url,
        mediaType: item.mediaType,
        alt: files[idx]?.name || `Gallery media ${idx + 1}`,
        size: defaultSize,
        aspectRatio: '16:9'
      }));

      editor
        .chain()
        .focus()
        .insertContent({
          type: 'portfolioGallery',
          attrs: {
            items: galleryItems
          }
        })
        .run();
    } catch (err: any) {
      console.error('Gallery upload failed:', err);
      setUploadError(err.message || 'Failed to upload gallery files to Cloudinary');
    } finally {
      setUploading(false);
      if (galleryFileInputRef.current) galleryFileInputRef.current.value = '';
    }
  };

  const handleAddLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  if (!editor) {
    return <div className="p-4 border rounded-md bg-gray-50 text-gray-500">Loading editor...</div>;
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm" data-testid="wysiwyg-editor">
      {/* Toolbar */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center gap-1 p-2 bg-gray-100/95 backdrop-blur-xs border-b border-gray-300 shadow-xs">
        {/* Section Title Creator Dropdown */}
        <div className="relative inline-block" ref={sectionMenuRef}>
          <button
            type="button"
            onClick={() => setShowSectionMenu(!showSectionMenu)}
            className={`px-2.5 py-1 text-xs font-semibold rounded flex items-center gap-1 transition-colors ${
              showSectionMenu ? 'bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
            data-testid="section-title-dropdown-btn"
            title="Create or insert a case study section title"
          >
            📑 Section Title ▾
          </button>

          {showSectionMenu && (
            <div
              className="absolute left-0 mt-1 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-2 text-xs"
              data-testid="section-title-menu"
            >
              <div className="font-semibold text-gray-700 px-2 py-1 mb-1 border-b border-gray-100 flex items-center justify-between">
                <span>Standard Section Presets</span>
                <span className="text-[10px] text-gray-400 font-normal">H2 Chapter</span>
              </div>
              <div className="space-y-1 mb-2">
                {STANDARD_SECTION_TITLES.map((title) => (
                  <button
                    key={title}
                    type="button"
                    onClick={() => handleInsertSectionTitle(title)}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-indigo-50 hover:text-indigo-700 text-gray-700 transition-colors flex items-center gap-1.5"
                    data-testid={`preset-section-${title}`}
                  >
                    <span className="text-indigo-500 font-bold">›</span>
                    <span className="truncate">{title}</span>
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-gray-100">
                <label className="block text-[11px] font-medium text-gray-600 mb-1 px-1">
                  Custom Section Title
                </label>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={customSectionTitle}
                    onChange={(e) => setCustomSectionTitle(e.target.value)}
                    placeholder="e.g. 6. Key Learnings"
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleInsertSectionTitle(customSectionTitle);
                      }
                    }}
                    data-testid="custom-section-input"
                  />
                  <button
                    type="button"
                    onClick={() => handleInsertSectionTitle(customSectionTitle)}
                    disabled={!customSectionTitle.trim()}
                    className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded text-xs font-medium"
                    data-testid="insert-custom-section-btn"
                  >
                    Insert
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-gray-300 mx-1" />

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2.5 py-1 text-xs font-semibold rounded ${
            editor.isActive('heading', { level: 2 }) ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-200 text-gray-700'
          }`}
          title="Heading 2"
          data-testid="toolbar-h2-btn"
        >
          H2
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2.5 py-1 text-xs font-semibold rounded ${
            editor.isActive('heading', { level: 3 }) ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-200 text-gray-700'
          }`}
          title="Heading 3"
          data-testid="toolbar-h3-btn"
        >
          H3
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2.5 py-1 text-xs font-bold rounded ${
            editor.isActive('bold') ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-200 text-gray-700'
          }`}
          title="Bold"
          data-testid="toolbar-bold-btn"
        >
          B
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2.5 py-1 text-xs italic rounded ${
            editor.isActive('italic') ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-200 text-gray-700'
          }`}
          title="Italic"
          data-testid="toolbar-italic-btn"
        >
          I
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2.5 py-1 text-xs rounded ${
            editor.isActive('bulletList') ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-200 text-gray-700'
          }`}
          title="Bullet List"
          data-testid="toolbar-bullet-list-btn"
        >
          • List
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2.5 py-1 text-xs rounded ${
            editor.isActive('orderedList') ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-200 text-gray-700'
          }`}
          title="Numbered List"
          data-testid="toolbar-ordered-list-btn"
        >
          1. List
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-2.5 py-1 text-xs rounded ${
            editor.isActive('blockquote') ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-200 text-gray-700'
          }`}
          title="Quote"
          data-testid="toolbar-quote-btn"
        >
          ❝ Quote
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleAddLink}
          className={`px-2.5 py-1 text-xs rounded ${
            editor.isActive('link') ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-200 text-gray-700'
          }`}
          title="Insert Link"
          data-testid="toolbar-link-btn"
        >
          🔗 Link
        </button>

        <div className="h-4 w-px bg-gray-300 mx-1" />

        {/* Direct Media Upload (Single Image/Video) */}
        <input
          ref={singleFileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          data-testid="single-media-input"
          onChange={handleSingleMediaSelect}
        />
        <button
          type="button"
          onClick={() => singleFileInputRef.current?.click()}
          disabled={uploading}
          className="px-2.5 py-1 text-xs font-medium rounded bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1"
          title="Upload Image or Video to Cloudinary"
        >
          📷 Upload Image/Video
        </button>

        {/* Direct Multi-Image/Video Gallery Upload */}
        <input
          ref={galleryFileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          data-testid="gallery-media-input"
          onChange={handleGallerySelect}
        />
        <button
          type="button"
          onClick={() => galleryFileInputRef.current?.click()}
          disabled={uploading}
          className="px-2.5 py-1 text-xs font-medium rounded bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1"
          title="Upload Multiple Images/Videos as a Gallery Section"
        >
          🖼️ Add Gallery Section
        </button>
      </div>

      {/* Upload Status Banner */}
      {uploading && (
        <div className="px-4 py-2 bg-blue-50 text-blue-700 text-xs flex items-center gap-2 border-b border-blue-100">
          <span className="loading loading-spinner loading-xs"></span>
          Uploading and optimizing media to Cloudinary...
        </div>
      )}

      {uploadError && (
        <div className="px-4 py-2 bg-red-50 text-red-700 text-xs flex items-center justify-between border-b border-red-100">
          <span>⚠️ {uploadError}</span>
          <button type="button" onClick={() => setUploadError('')} className="text-red-500 hover:text-red-700 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Editor Content Area */}
      <div className="min-h-[460px] max-h-[720px] overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default WYSIWYGEditor;
