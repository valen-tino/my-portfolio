import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CMSStorage, BlogItem } from '../cms/apiStorage';
import Navbar from '../sections/nav/nav';
import Footer from '../sections/footer/footer';
import ImageLightboxModal, { LightboxImageItem } from '../components/ImageLightboxModal';
import { formatPublicDescription } from '../utils/contentMigration';

const CATEGORY_STYLES: Record<string, string> = {
  Event: 'badge-secondary',
  News: 'badge-info',
  Tech: 'badge-accent',
  Personal: 'badge-primary'
};

const BlogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<BlogItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxImages, setLightboxImages] = useState<LightboxImageItem[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchBlogPost = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await CMSStorage.getBlog(id);
        if (!data) {
          setError('Article not found');
        } else {
          setBlog(data);
        }
      } catch (err: any) {
        console.error('Error fetching blog detail:', err);
        setError('Article not found or server error');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPost();
  }, [id]);

  // Delegated click handler for SPA links and gallery lightboxes
  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    // 1. Intercept relative anchor tags (e.g., /portfolio/...)
    const anchor = target.closest('a');
    if (anchor) {
      const href = anchor.getAttribute('href');
      if (href && href.startsWith('/')) {
        e.preventDefault();
        navigate(href);
        return;
      }
    }

    // 2. Open lightbox on gallery or content image clicks
    const figureEl = target.closest('figure.gallery-item[data-media-type="image"], figure.gallery-image-clickable');
    const imgEl = (figureEl ? figureEl.querySelector('img') : target.closest('img')) as HTMLImageElement | null;
    if (imgEl && imgEl.src && !target.closest('.portfolio-embed-card')) {
      const galleryContainer = imgEl.closest('.portfolio-gallery');
      if (galleryContainer) {
        const allImgs = Array.from(galleryContainer.querySelectorAll('img'));
        const items: LightboxImageItem[] = allImgs.map((img) => ({
          src: img.getAttribute('src') || img.src,
          alt: img.getAttribute('alt') || 'Article gallery image'
        }));
        const clickedIdx = allImgs.indexOf(imgEl);
        setLightboxImages(items);
        setLightboxIndex(clickedIdx >= 0 ? clickedIdx : 0);
        setLightboxOpen(true);
      } else {
        setLightboxImages([
          {
            src: imgEl.getAttribute('src') || imgEl.src,
            alt: imgEl.getAttribute('alt') || blog?.title || 'Article image'
          }
        ]);
        setLightboxIndex(0);
        setLightboxOpen(true);
      }
    }
  };

  return (
    <div className="App min-h-screen flex flex-col bg-base-100">
      <Navbar />

      <main className="flex-1 pt-28 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb / Back Button */}
          <div className="mb-8">
            <Link
              to="/blogs"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline group"
              data-testid="back-to-blogs-link"
            >
              <span className="transition-transform group-hover:-translate-x-1">←</span>
              Back to Blog & News
            </Link>
          </div>

          {loading ? (
            <div className="py-28 text-center text-base-content/50 flex flex-col items-center justify-center gap-3">
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <p className="text-sm font-medium">Loading article...</p>
            </div>
          ) : error || !blog ? (
            <div className="py-24 text-center">
              <div className="text-5xl mb-4">📰</div>
              <h1 className="text-2xl font-bold text-base-content mb-2">
                Article Not Found
              </h1>
              <p className="text-base-content/60 mb-6">
                The article you are looking for does not exist or may have been unpublished.
              </p>
              <Link to="/blogs" className="btn btn-primary btn-sm">
                Return to Blog Archive
              </Link>
            </div>
          ) : (
            <article className="space-y-8" data-testid="blog-article-detail">
              {/* Header Metadata */}
              <header className="space-y-4 text-left">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`badge ${CATEGORY_STYLES[blog.category] || 'badge-neutral'} font-semibold`}>
                    {blog.category}
                  </span>
                  {blog.isPinned && (
                    <span className="badge badge-warning font-semibold">📌 Pinned</span>
                  )}
                  <span className="text-sm text-base-content/60">
                    📅 {blog.date}
                  </span>
                  {blog.readTime && (
                    <span className="text-sm text-base-content/60">
                      • ⏱️ {blog.readTime}
                    </span>
                  )}
                  {blog.location && (
                    <span className="text-sm text-base-content/60">
                      • 📍 {blog.location}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-base-content tracking-tight leading-tight">
                  {blog.title}
                </h1>

                {blog.desc && (
                  <p className="text-lg sm:text-xl text-base-content/80 font-normal leading-relaxed pt-1">
                    {blog.desc}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-base-300/60 text-xs text-base-content/60">
                  <span>Written by <strong className="text-base-content">{blog.author || 'Valentino Jehaut'}</strong></span>
                  {blog.link && (
                    <a
                      href={blog.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-xs btn-outline btn-primary gap-1"
                    >
                      External Event Link ↗
                    </a>
                  )}
                </div>
              </header>

              {/* Hero Cover Image */}
              {blog.imageURL && (
                <div className="rounded-2xl overflow-hidden shadow-xl border border-base-300 aspect-video max-h-[500px] bg-base-200">
                  <img
                    src={blog.imageURL}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Main Content Body */}
              <div
                className="wysiwyg-content portfolio-markdown prose prose-lg max-w-none text-base-content/90 leading-relaxed text-left py-4"
                dangerouslySetInnerHTML={{ __html: formatPublicDescription(blog.content || '') }}
                onClick={handleContentClick}
                data-testid="blog-content-body"
              />

              {/* Tags Section */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="pt-8 border-t border-base-300 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-base-content/70 mr-1">Tags:</span>
                  {blog.tags.map((tag) => (
                    <span key={tag} className="badge badge-outline badge-md">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Bottom Back Button */}
              <div className="pt-8 border-t border-base-300 text-left">
                <Link to="/blog" className="btn btn-outline btn-primary">
                  ← Back to All Articles
                </Link>
              </div>
            </article>
          )}
        </div>
      </main>

      {/* Lightbox for Article Images */}
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
};

export default BlogDetail;

