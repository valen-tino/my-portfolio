import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CMSStorage } from '../cms/apiStorage';
import { Footer } from '../components/Footer';
import { ArrowLeftIcon, ExternalLinkIcon } from '../components/Icons';
import ImageLightboxModal, { type LightboxImageItem } from '../components/ImageLightboxModal';
import { ImagePlaceholder } from '../components/ImagePlaceholder';
import { LoadingScreen } from '../components/LoadingScreen';
import { BlogDetailSkeleton, ProgressiveImageFrame } from '../components/Skeleton';
import { BLOG_POSTS, mapCMSBlogToPost } from '../data/portfolioData';
import type { BlogPost } from '../types/portfolio';
import { formatPublicDescription } from '../utils/contentMigration';
import { formatFullDate, toISODateAttribute } from '../utils/dateFormat';
import { useGSAPPageEntrance } from '../utils/gsapAnimations';
import { navigateWithTransition } from '../utils/viewTransitions';

export default function BlogDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const [lightboxImages, setLightboxImages] = useState<LightboxImageItem[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useGSAPPageEntrance(rootRef, [post?.id, loading]);

  useEffect(() => {
    let active = true;
    setImgError(false);
    setImgLoaded(false);

    async function fetchBlogPost() {
      if (!id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await CMSStorage.getBlog(id);
        if (!active) return;
        if (!data) {
          setError('Article not found');
          setPost(null);
        } else {
          setPost(mapCMSBlogToPost(data));
        }
      } catch {
        if (!active) return;
        const staticMatch = BLOG_POSTS.find((b) => b.id === id || b.slug === id);
        if (staticMatch) {
          setPost(staticMatch);
        } else {
          setError('Article not found or server error');
          setPost(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchBlogPost();
    return () => {
      active = false;
    };
  }, [id]);

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    const anchor = target.closest('a');
    if (anchor) {
      const href = anchor.getAttribute('href');
      if (href && href.startsWith('/')) {
        e.preventDefault();
        navigateWithTransition(navigate, href);
        return;
      }
    }

    const figureEl = target.closest(
      'figure.gallery-item[data-media-type="image"], figure.gallery-image-clickable',
    );
    const imgEl = (
      figureEl ? figureEl.querySelector('img') : target.closest('img')
    ) as HTMLImageElement | null;

    if (imgEl && imgEl.src && !target.closest('.portfolio-embed-card')) {
      const galleryContainer = imgEl.closest('.portfolio-gallery');
      if (galleryContainer) {
        const allImgs = Array.from(galleryContainer.querySelectorAll('img'));
        const items: LightboxImageItem[] = allImgs.map((img) => ({
          src: img.getAttribute('src') || img.src,
          alt: img.getAttribute('alt') || 'Article gallery image',
        }));
        const clickedIdx = allImgs.indexOf(imgEl);
        setLightboxImages(items);
        setLightboxIndex(clickedIdx >= 0 ? clickedIdx : 0);
        setLightboxOpen(true);
      } else {
        setLightboxImages([
          {
            src: imgEl.getAttribute('src') || imgEl.src,
            alt: imgEl.getAttribute('alt') || post?.title || 'Article image',
          },
        ]);
        setLightboxIndex(0);
        setLightboxOpen(true);
      }
    }
  };

  return (
    <div ref={rootRef} className="min-h-screen bg-white text-ink">
      <LoadingScreen isLoading={loading} label="Loading article..." />
      {loading ? (
        <BlogDetailSkeleton />
      ) : (
        <main className="page-shell py-12 sm:py-20">
          {error || !post ? (
          <div className="py-24 text-center">
            <h1 className="text-3xl font-medium tracking-tight">Article Not Found</h1>
            <p className="mt-4 text-base text-muted-600">
              The article you are looking for does not exist or may have been unpublished.
            </p>
            <Link to="/blogs" className="flat-button flat-button-blue mt-8">
              <ArrowLeftIcon className="size-4" />
              Return to journal archive
            </Link>
          </div>
        ) : (
          <article className="mx-auto max-w-3xl" data-testid="blog-article-detail">
            <nav
              aria-label="Breadcrumb"
              data-gsap="hero-item"
              className="mb-8 flex flex-wrap items-center gap-3 text-xs leading-relaxed text-muted-600"
            >
              <Link to="/" className="inline-flex min-h-8 items-center hover:underline">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <Link to="/blogs" className="inline-flex min-h-8 items-center hover:underline">
                Journal
              </Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{post.title}</span>
            </nav>

            <Link to="/blogs" className="text-link mb-10" data-testid="back-to-blogs-link">
              <ArrowLeftIcon className="size-4" />
              Back to journal
            </Link>

            <div className="mb-6 flex flex-wrap items-center gap-3 text-xs text-muted-600">
              <span className="section-label text-brand">{post.category}</span>
              <span aria-hidden="true">/</span>
              <time dateTime={toISODateAttribute(post.date)}>{formatFullDate(post.date)}</time>
              <span aria-hidden="true">/</span>
              <span>{post.readTime}</span>
              {post.location && (
                <>
                  <span aria-hidden="true">/</span>
                  <span>{post.location}</span>
                </>
              )}
            </div>

            <h1 className="text-4xl font-medium leading-[1.12] tracking-[-0.05em] sm:text-6xl">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="mt-6 max-w-[65ch] text-lg leading-relaxed text-muted-600">
                {post.excerpt}
              </p>
            )}

            <div className="mb-10 mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-muted-300 pt-4 text-sm text-muted-600">
              <span>Written by {post.author}</span>
              {post.link && (
                <a
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                >
                  External link <ExternalLinkIcon className="size-4" />
                </a>
              )}
            </div>

            {post.imageURL && !imgError ? (
              <ProgressiveImageFrame aspectRatio="aspect-[16/9]" loaded={imgLoaded}>
                <img
                  src={post.imageURL}
                  alt={post.title}
                  fetchPriority="high"
                  decoding="async"
                  onLoad={() => setImgLoaded(true)}
                  onError={() => {
                    setImgLoaded(true);
                    setImgError(true);
                  }}
                  className="relative z-[1] h-full w-full cursor-zoom-in object-cover"
                  onClick={() => {
                    setLightboxImages([{ src: post.imageURL as string, alt: post.title }]);
                    setLightboxIndex(0);
                    setLightboxOpen(true);
                  }}
                />
              </ProgressiveImageFrame>
            ) : (
              <ImagePlaceholder
                label="Featured article photo"
                sublabel={post.title}
                aspectRatio="aspect-[16/9]"
              />
            )}

            {post.content ? (
              <div
                className="wysiwyg-content portfolio-markdown prose max-w-none min-w-0 w-full overflow-x-clip py-8 leading-relaxed text-muted-700"
                dangerouslySetInnerHTML={{ __html: formatPublicDescription(post.content) }}
                onClick={handleContentClick}
                data-testid="blog-content-body"
              />
            ) : (
              <div className="mt-10 space-y-10" data-testid="blog-content-body">
                {post.contentSections?.map((section, index) => (
                  <section
                    key={index}
                    aria-label={section.heading || `Article section ${index + 1}`}
                  >
                    {section.heading && (
                      <h2 className="mb-6 text-2xl font-medium">{section.heading}</h2>
                    )}
                    <div className="mx-auto max-w-[65ch] space-y-6">
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph} className="text-base leading-[1.75] text-muted-700">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    {section.gallery && (
                      <div className="my-9 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3">
                        {section.gallery.map((item, photoIndex) => (
                          <figure key={item.caption}>
                            <ImagePlaceholder
                              label={`Photo ${photoIndex + 1}`}
                              sublabel={item.caption}
                              aspectRatio="aspect-[4/3]"
                              showIcon={false}
                            />
                            <figcaption className="mt-2 text-xs leading-relaxed text-muted-600">
                              {item.caption}
                            </figcaption>
                          </figure>
                        ))}
                      </div>
                    )}
                  </section>
                ))}
              </div>
            )}

            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 border-t border-muted-300 pt-7">
                <h2 className="section-label text-muted-600">Filed under</h2>
                <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs leading-relaxed text-muted-600">
                  {post.tags.map((item) => (
                    <li key={item}>{item.startsWith('#') ? item : `#${item}`}</li>
                  ))}
                </ul>
              </div>
            )}

            <Link to="/blogs" className="text-link mt-10">
              <ArrowLeftIcon className="size-4" />
              Read all articles
            </Link>
          </article>
          )}
        </main>
      )}

      {lightboxOpen && (
        <ImageLightboxModal
          images={lightboxImages}
          currentIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onSelectIndex={setLightboxIndex}
        />
      )}

      <Footer />
    </div>
  );
}
