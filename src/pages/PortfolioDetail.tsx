import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CMSStorage } from '../cms/apiStorage';
import { Footer } from '../components/Footer';
import { ArrowLeftIcon, ExternalLinkIcon, LockIcon } from '../components/Icons';
import ImageLightboxModal, { type LightboxImageItem } from '../components/ImageLightboxModal';
import { ImagePlaceholder } from '../components/ImagePlaceholder';
import PasswordProtectionModal from '../components/PasswordProtectionModal';
import ScrollProgressBar from '../components/ScrollProgressBar';
import { PROJECTS, mapPortfolioItemToProject } from '../data/portfolioData';
import type { Project } from '../types/portfolio';
import { migrateContentToHtml, optimizeCloudinaryVideoUrl } from '../utils/contentMigration';
import { useGSAPPageEntrance } from '../utils/gsapAnimations';

export default function PortfolioDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [imgError, setImgError] = useState(false);

  const [lightboxImages, setLightboxImages] = useState<LightboxImageItem[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useGSAPPageEntrance(rootRef, [project?.id, loading, isUnlocked]);

  useEffect(() => {
    let active = true;
    setImgError(false);

    async function fetchPortfolio() {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const items = await CMSStorage.getPortfolios(true);
        if (!active) return;
        const foundRaw = items.find(
          (p) => (String(p.id) === id || p._id === id) && p.isPublished !== false,
        );
        if (foundRaw) {
          setProject(mapPortfolioItemToProject(foundRaw));
        } else {
          // If backend returned items cleanly, respect unpublished/missing status without leaking
          if (items.length > 0) {
            setProject(null);
          } else {
            const fallback = PROJECTS.find((p) => p.id === id || p.slug === id) || null;
            setProject(fallback);
          }
        }
      } catch {
        if (!active) return;
        const fallback = PROJECTS.find((p) => p.id === id || p.slug === id) || null;
        setProject(fallback);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchPortfolio();
    return () => {
      active = false;
    };
  }, [id]);

  const handlePasswordSubmit = (enteredPassword: string) => {
    if (!project) return;
    if (enteredPassword === project.password) {
      setIsUnlocked(true);
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password. Please try again.');
    }
  };

  const handleDetailsClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const figureEl = target.closest(
      'figure.gallery-item[data-media-type="image"], figure.gallery-image-clickable',
    );
    const imgEl = (
      figureEl ? figureEl.querySelector('img') : target.closest('img')
    ) as HTMLImageElement | null;

    if (!imgEl || !imgEl.src) return;

    const galleryContainer = imgEl.closest('.portfolio-gallery');
    if (galleryContainer) {
      const allImgs = Array.from(galleryContainer.querySelectorAll('img'));
      const items: LightboxImageItem[] = allImgs.map((img) => ({
        src: img.getAttribute('src') || img.src,
        alt: img.getAttribute('alt') || 'Gallery image',
      }));
      const clickedIdx = allImgs.indexOf(imgEl);
      setLightboxImages(items);
      setLightboxIndex(clickedIdx >= 0 ? clickedIdx : 0);
      setLightboxOpen(true);
    } else {
      setLightboxImages([
        {
          src: imgEl.getAttribute('src') || imgEl.src,
          alt: imgEl.getAttribute('alt') || project?.title || 'Project image',
        },
      ]);
      setLightboxIndex(0);
      setLightboxOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-ink">
        <main className="page-shell py-24 text-center">
          <div className="loading loading-spinner loading-lg text-brand" />
          <p className="mt-4 text-sm text-muted-600">Loading portfolio...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-white text-ink">
        <main className="page-shell py-24 text-center">
          <h1 className="text-4xl font-medium tracking-tight">Portfolio Not Found</h1>
          <p className="mt-4 text-base text-muted-600">
            The portfolio item you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link to="/portfolio" className="flat-button flat-button-blue mt-8">
            <ArrowLeftIcon className="size-4" />
            Back to portfolio
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  if (project.isPasswordProtected && !isUnlocked) {
    return (
      <div className="min-h-screen bg-white text-ink">
        <main className="page-shell py-24 text-center">
          <div className="mx-auto max-w-md space-y-5">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-paper text-brand">
              <LockIcon className="size-7" />
            </div>
            <h1 className="text-3xl font-medium tracking-tight">Protected Portfolio</h1>
            <p className="text-lg font-medium text-muted-700">{project.title}</p>
            <p className="text-sm leading-relaxed text-muted-600">
              This portfolio is password protected. Please enter the password to view the details.
            </p>
            <Link to="/portfolio" className="text-link">
              <ArrowLeftIcon className="size-4" />
              Back to portfolio
            </Link>
          </div>
        </main>

        <PasswordProtectionModal
          isOpen={true}
          onClose={() => navigate('/portfolio')}
          onSubmit={handlePasswordSubmit}
          portfolioTitle={project.title}
          error={passwordError}
        />

        <Footer />
      </div>
    );
  }

  const liveUrl =
    project.externalUrl && /^https?:\/\//i.test(project.externalUrl)
      ? project.externalUrl
      : undefined;

  return (
    <div ref={rootRef} className="min-h-screen bg-white text-ink">
      <main className="page-shell py-12 sm:py-20">
        <nav
          aria-label="Breadcrumb"
          data-gsap="hero-item"
          className="mb-12 flex flex-wrap items-center gap-3 text-xs leading-relaxed text-muted-600"
        >
          <Link to="/" className="inline-flex min-h-8 items-center hover:underline">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link to="/portfolio" className="inline-flex min-h-8 items-center hover:underline">
            Portfolio
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{project.title}</span>
        </nav>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.5fr] lg:items-start lg:gap-20">
          <div
            data-testid="portfolio-detail-left-column"
            data-gsap="hero-item"
            className="min-w-0 overscroll-contain lg:sticky lg:top-8 lg:max-h-[calc(100dvh-4rem)] lg:overflow-y-auto lg:pr-2"
          >
            <h1 className="text-4xl font-medium leading-[1.12] tracking-[-0.05em] sm:text-5xl">
              {project.title}
            </h1>
            {project.subtitle && (
              <p className="mt-4 text-sm leading-relaxed text-muted-600">{project.subtitle}</p>
            )}

            <div className="my-8">
              {project.videoURL ? (
                <div className="overflow-hidden bg-black outline outline-1 -outline-offset-1 outline-black/10">
                  <video
                    src={optimizeCloudinaryVideoUrl(project.videoURL)}
                    poster={project.imageURL}
                    controls
                    playsInline
                    preload="metadata"
                    className="aspect-video w-full object-cover"
                    data-testid="portfolio-hero-video"
                  />
                </div>
              ) : project.imageURL && !imgError ? (
                <div className="overflow-hidden bg-[#e7e7e9] outline outline-1 -outline-offset-1 outline-black/10">
                  <img
                    src={project.imageURL}
                    alt={project.title}
                    fetchPriority="high"
                    decoding="async"
                    onError={() => setImgError(true)}
                    className="aspect-video w-full cursor-zoom-in object-cover"
                    data-testid="portfolio-hero-image"
                    onClick={() => {
                      setLightboxImages([
                        { src: project.imageURL as string, alt: project.title },
                      ]);
                      setLightboxIndex(0);
                      setLightboxOpen(true);
                    }}
                  />
                </div>
              ) : (
                <ImagePlaceholder
                  label={project.title}
                  sublabel="Primary platform preview"
                  aspectRatio="aspect-video"
                />
              )}
            </div>

            <dl className="space-y-6">
              {project.year && (
                <div>
                  <dt className="text-sm font-medium text-muted-600">Year</dt>
                  <dd className="mt-3 tabular-nums">{project.year}</dd>
                </div>
              )}
              {project.relatedExperienceCompany && (
                <div>
                  <dt className="text-sm font-medium text-muted-600">Experience context</dt>
                  <dd className="mt-3 text-base">{project.relatedExperienceCompany}</dd>
                </div>
              )}
              {project.relatedEducationInstitution && (
                <div>
                  <dt className="text-sm font-medium text-muted-600">Academic context</dt>
                  <dd className="mt-3 text-base">{project.relatedEducationInstitution}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-muted-600">Project roles</dt>
                <dd className="mt-3 text-base leading-relaxed">
                  {project.roles.length > 0 ? project.roles.join(' / ') : 'Case Study'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-600">Technologies used</dt>
                <dd className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm leading-relaxed">
                  {project.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </dd>
              </div>
            </dl>

            <div className="mt-9 flex flex-wrap gap-4">
              {liveUrl ? (
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flat-button flat-button-blue"
                >
                  Visit project <ExternalLinkIcon className="size-4" />
                </a>
              ) : (
                <a
                  href={`mailto:valentinojehaut@gmail.com?subject=${encodeURIComponent(`Project inquiry: ${project.title}`)}`}
                  className="flat-button flat-button-blue"
                >
                  Ask about this project <ExternalLinkIcon className="size-4" />
                </a>
              )}
              <Link to="/portfolio" className="text-link">
                <ArrowLeftIcon className="size-4" />
                Back to portfolio
              </Link>
            </div>
          </div>

          <div
            data-testid="portfolio-detail-right-column"
            data-gsap="hero-item"
            className="min-w-0 max-w-[65ch] space-y-12 pt-1"
          >
            <ScrollProgressBar defaultLabel={project.title} />

            <section>
              <h2 className="text-2xl font-medium tracking-tight">Project overview</h2>
              <p className="mt-5 text-base leading-[1.75] text-muted-600">
                {project.overview || project.description}
              </p>
            </section>

            {project.projectDetails ? (
              <section>
                <div
                  className="wysiwyg-content portfolio-markdown prose max-w-none min-w-0 w-full overflow-x-clip text-muted-700"
                  data-color-mode="light"
                  onClick={handleDetailsClick}
                  dangerouslySetInnerHTML={{
                    __html: migrateContentToHtml(project.projectDetails, project.title),
                  }}
                />
              </section>
            ) : (
              <>
                {project.backgroundContext && (
                  <section>
                    <h2 className="text-2xl font-medium tracking-tight">Background &amp; context</h2>
                    <div className="mt-5 space-y-4">
                      {project.backgroundContext.split('\n\n').map((paragraph) => (
                        <p key={paragraph} className="text-base leading-[1.75] text-muted-600">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </section>
                )}
                {project.developmentProcess && (
                  <section>
                    <h2 className="text-2xl font-medium tracking-tight">Development process</h2>
                    <div className="mt-5 space-y-4">
                      {project.developmentProcess.split('\n\n').map((paragraph) => (
                        <p
                          key={paragraph}
                          className="break-words text-base leading-[1.75] text-muted-600"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </section>
                )}
                {project.coreFeatures && (
                  <section>
                    <h2 className="text-2xl font-medium tracking-tight">Core features</h2>
                    <ul className="mt-5 list-disc space-y-3 pl-5 text-base leading-relaxed text-muted-600">
                      {project.coreFeatures.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </section>
                )}
                <section>
                  <h2 className="text-2xl font-medium tracking-tight">Built with</h2>
                  <p className="mt-5 text-base leading-relaxed text-muted-600">
                    {(project.technologiesList || project.tags).join(', ')}
                  </p>
                </section>
                {project.notableAchievements && (
                  <section>
                    <h2 className="text-2xl font-medium tracking-tight">Results</h2>
                    <p className="mt-5 text-base leading-[1.75] text-muted-600">
                      {project.notableAchievements}
                    </p>
                  </section>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <ImageLightboxModal
        images={lightboxImages}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onSelectIndex={setLightboxIndex}
      />

      <Footer />
    </div>
  );
}
