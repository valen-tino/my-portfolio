import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CMSStorage, type AboutData, type Role } from '../cms/apiStorage';
import { BlogCard } from '../components/BlogCard';
import { CVModal } from '../components/CVModal';
import { EditorialCarousel } from '../components/EditorialCarousel';
import { ExperienceEducationSection } from '../components/ExperienceEducationSection';
import { Footer } from '../components/Footer';
import { HeroProjectStrip } from '../components/HeroProjectStrip';
import { ArrowRightIcon, DownloadIcon } from '../components/Icons';
import { ImagePlaceholder } from '../components/ImagePlaceholder';
import PasswordProtectionModal from '../components/PasswordProtectionModal';
import { ProjectCard } from '../components/ProjectCard';
import {
  AboutSectionSkeleton,
  BlogCardSkeletonGrid,
  ProgressiveImageFrame,
  ProjectCardSkeletonGrid,
  SkeletonBox,
} from '../components/Skeleton';
import { WorkProcessSection } from '../components/WorkProcessSection';
import {
  BLOG_POSTS,
  EDUCATION_LIST,
  EXPERIENCES,
  PERSONAL_INFO,
  PROJECTS,
  SOCIAL_LINKS,
  TECH_TOOLS,
  WORK_PROCESS_STEPS,
  mapCMSBlogToPost,
  mapCMSEducationToView,
  mapCMSExperienceToView,
  mapCMSSocialLinkToView,
  mapCMSTechToolToView,
  mapCMSWorkProcessToView,
  mapPortfolioItemToProject,
} from '../data/portfolioData';
import { getGreetingText } from '../others/greeting';
import apiService from '../services/api';
import type {
  BlogPost,
  Education,
  Experience,
  Project,
  SocialLink,
  TechToolView,
  WorkProcessStep,
} from '../types/portfolio';
import { buildCloudinarySrcSet, formatPublicDescription } from '../utils/contentMigration';
import { sortByLatestEndDate } from '../utils/dateFormat';
import {
  animateElementTransition,
  animateImageReveal,
  useGSAPPageEntrance,
} from '../utils/gsapAnimations';
import { navigateWithTransition } from '../utils/viewTransitions';

interface HomeProps {
  onOpenCVModal?: () => void;
}

export default function Home({ onOpenCVModal }: HomeProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const rootRef = useRef<HTMLDivElement>(null);
  const workCarouselRef = useRef<HTMLDivElement>(null);
  const didMountRoleRef = useRef(false);
  const greeting = getGreetingText();

  const cachedPortfolios =
    typeof CMSStorage.peekCachedPortfolios === 'function'
      ? CMSStorage.peekCachedPortfolios(true)
      : null;
  const cachedBlogs =
    typeof CMSStorage.peekCachedBlogs === 'function' ? CMSStorage.peekCachedBlogs(true) : null;
  const cachedAbout =
    typeof CMSStorage.peekCachedAbout === 'function' ? CMSStorage.peekCachedAbout() : null;
  const cachedTools =
    typeof CMSStorage.peekCachedTechTools === 'function'
      ? CMSStorage.peekCachedTechTools(true)
      : null;
  const cachedEducation =
    typeof CMSStorage.peekCachedEducation === 'function' ? CMSStorage.peekCachedEducation() : null;
  const cachedExperiences =
    typeof CMSStorage.peekCachedExperiences === 'function'
      ? CMSStorage.peekCachedExperiences(true)
      : null;
  const cachedWorkProcesses =
    typeof CMSStorage.peekCachedWorkProcesses === 'function'
      ? CMSStorage.peekCachedWorkProcesses(true)
      : null;
  const cachedRoles =
    typeof CMSStorage.peekCachedRoles === 'function' ? CMSStorage.peekCachedRoles() : null;
  const cachedSocialLinks =
    typeof CMSStorage.peekCachedSocialLinks === 'function'
      ? CMSStorage.peekCachedSocialLinks(true)
      : null;

  const [projects, setProjects] = useState<Project[]>(() => {
    if (!cachedPortfolios) return [];
    const published = cachedPortfolios
      .filter((item) => item.isPublished !== false)
      .map(mapPortfolioItemToProject);
    return published.length > 0 ? published : PROJECTS;
  });
  const [blogs, setBlogs] = useState<BlogPost[]>(() =>
    cachedBlogs
      ? cachedBlogs.filter((item) => item.isPublished !== false).map(mapCMSBlogToPost)
      : [],
  );
  const [experiences, setExperiences] = useState<Experience[]>(() =>
    cachedExperiences && cachedExperiences.length > 0
      ? sortByLatestEndDate(cachedExperiences.map(mapCMSExperienceToView))
      : [],
  );
  const [educationList, setEducationList] = useState<Education[]>(() =>
    cachedEducation && cachedEducation.length > 0
      ? sortByLatestEndDate(cachedEducation.map(mapCMSEducationToView))
      : [],
  );
  const [techTools, setTechTools] = useState<TechToolView[]>(() =>
    cachedTools && cachedTools.length > 0 ? cachedTools.map(mapCMSTechToolToView) : [],
  );
  const [workProcessSteps, setWorkProcessSteps] = useState<WorkProcessStep[]>(() =>
    cachedWorkProcesses && cachedWorkProcesses.length > 0
      ? cachedWorkProcesses.map(mapCMSWorkProcessToView)
      : [],
  );
  const [cmsRoles, setCmsRoles] = useState<Role[]>(() => cachedRoles ?? []);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(() =>
    cachedSocialLinks && cachedSocialLinks.length > 0
      ? cachedSocialLinks.filter((item) => item.isPublished !== false).map(mapCMSSocialLinkToView)
      : [],
  );
  const [aboutData, setAboutData] = useState<AboutData | null>(cachedAbout);
  const [portraitError, setPortraitError] = useState(false);
  const [portraitLoaded, setPortraitLoaded] = useState(false);
  const [loadingState, setLoadingState] = useState({
    projects: !cachedPortfolios,
    blogs: !cachedBlogs,
    about: !cachedAbout,
    tools: !cachedTools,
    education: !cachedEducation,
    experiences: !cachedExperiences,
    workProcess: !cachedWorkProcesses,
    socialLinks: !cachedSocialLinks,
  });

  const [selectedRole, setSelectedRole] = useState('All');
  const [protectedProject, setProtectedProject] = useState<Project | null>(null);
  const [passwordError, setPasswordError] = useState('');
  const [localCVOpen, setLocalCVOpen] = useState(false);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactStatus, setContactStatus] = useState('');

  useGSAPPageEntrance(rootRef, [
    projects.length,
    blogs.length,
    loadingState.about,
    loadingState.projects,
    loadingState.tools,
  ]);

  useEffect(() => {
    let active = true;

    async function loadCMSContent() {
      const [
        portfoliosRes,
        blogsRes,
        aboutRes,
        toolsRes,
        educationRes,
        experiencesRes,
        workProcessRes,
        rolesRes,
        socialLinksRes,
      ] = await Promise.allSettled([
        CMSStorage.getPortfolios(true),
        CMSStorage.getBlogs(true),
        CMSStorage.getAbout(),
        CMSStorage.getTechTools(true),
        CMSStorage.getEducation(),
        apiService.getExperiences(true),
        typeof CMSStorage.getWorkProcesses === 'function'
          ? CMSStorage.getWorkProcesses(true)
          : Promise.resolve([]),
        typeof CMSStorage.getRoles === 'function'
          ? CMSStorage.getRoles()
          : Promise.resolve([]),
        typeof CMSStorage.getSocialLinks === 'function'
          ? CMSStorage.getSocialLinks(true)
          : Promise.resolve([]),
      ]);

      if (!active) return;

      if (portfoliosRes.status === 'fulfilled' && Array.isArray(portfoliosRes.value)) {
        const published = portfoliosRes.value
          .filter((item) => item.isPublished !== false)
          .map(mapPortfolioItemToProject);
        setProjects(published.length > 0 ? published : PROJECTS);
      } else {
        setProjects(PROJECTS);
      }

      if (blogsRes.status === 'fulfilled' && Array.isArray(blogsRes.value)) {
        const publishedBlogs = blogsRes.value
          .filter((item) => item.isPublished !== false)
          .map(mapCMSBlogToPost);
        setBlogs(publishedBlogs);
      } else {
        setBlogs(BLOG_POSTS);
      }

      if (aboutRes.status === 'fulfilled' && aboutRes.value) {
        setAboutData(aboutRes.value);
      }

      if (toolsRes.status === 'fulfilled' && Array.isArray(toolsRes.value) && toolsRes.value.length > 0) {
        setTechTools(toolsRes.value.map(mapCMSTechToolToView));
      } else {
        setTechTools(TECH_TOOLS);
      }

      if (
        educationRes.status === 'fulfilled' &&
        Array.isArray(educationRes.value) &&
        educationRes.value.length > 0
      ) {
        setEducationList(sortByLatestEndDate(educationRes.value.map(mapCMSEducationToView)));
      } else {
        setEducationList(sortByLatestEndDate(EDUCATION_LIST));
      }

      if (
        experiencesRes.status === 'fulfilled' &&
        experiencesRes.value?.success &&
        Array.isArray(experiencesRes.value.data) &&
        experiencesRes.value.data.length > 0
      ) {
        setExperiences(sortByLatestEndDate(experiencesRes.value.data.map(mapCMSExperienceToView)));
      } else {
        setExperiences(sortByLatestEndDate(EXPERIENCES));
      }

      if (
        workProcessRes.status === 'fulfilled' &&
        Array.isArray(workProcessRes.value) &&
        workProcessRes.value.length > 0
      ) {
        setWorkProcessSteps(workProcessRes.value.map(mapCMSWorkProcessToView));
      } else {
        setWorkProcessSteps(WORK_PROCESS_STEPS);
      }

      if (rolesRes.status === 'fulfilled' && Array.isArray(rolesRes.value)) {
        setCmsRoles(rolesRes.value);
      }

      if (
        socialLinksRes.status === 'fulfilled' &&
        Array.isArray(socialLinksRes.value) &&
        socialLinksRes.value.length > 0
      ) {
        setSocialLinks(
          socialLinksRes.value
            .filter((item) => item.isPublished !== false)
            .map(mapCMSSocialLinkToView)
        );
      } else {
        setSocialLinks(SOCIAL_LINKS);
      }

      setLoadingState({
        projects: false,
        blogs: false,
        about: false,
        tools: false,
        education: false,
        experiences: false,
        workProcess: false,
        socialLinks: false,
      });
    }

    loadCMSContent();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!location.hash) return;
    const targetId = location.hash.replace('#', '');
    const element = document.getElementById(targetId);
    if (element && typeof element.scrollIntoView === 'function') {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location.hash]);

  const roleFilters = useMemo(() => {
    const distinct = Array.from(new Set(projects.flatMap((p) => p.roles))).filter(Boolean);
    const cmsOrdered = cmsRoles
      .map((r) => r.title)
      .filter((title) => distinct.includes(title));
    const remaining = distinct.filter((title) => !cmsOrdered.includes(title));
    return ['All', ...cmsOrdered, ...remaining];
  }, [projects, cmsRoles]);

  const filteredProjects = useMemo(() => {
    if (selectedRole === 'All') return projects;
    return projects.filter((p) => p.roles.includes(selectedRole));
  }, [projects, selectedRole]);

  useEffect(() => {
    if (!didMountRoleRef.current) {
      didMountRoleRef.current = true;
      return;
    }
    if (loadingState.projects) return;
    animateElementTransition(workCarouselRef.current, {
      y: 8,
      duration: 0.25,
      staggerSelector: 'article',
    });
  }, [selectedRole, loadingState.projects]);

  const handleSelectProject = (project: Project) => {
    if (project.isPasswordProtected) {
      setProtectedProject(project);
      setPasswordError('');
      return;
    }
    navigateWithTransition(navigate, `/portfolio/${project.id || project.slug}`);
  };

  const handlePasswordSubmit = (enteredPassword: string) => {
    if (!protectedProject) return;
    if (enteredPassword === protectedProject.password) {
      const targetId = protectedProject.id || protectedProject.slug;
      setProtectedProject(null);
      setPasswordError('');
      navigateWithTransition(navigate, `/portfolio/${targetId}`);
    } else {
      setPasswordError('Incorrect password. Please try again.');
    }
  };

  const handleSelectBlog = (post: BlogPost) => {
    navigateWithTransition(navigate, `/blogs/${post.slug || post.id}`);
  };

  const handleOpenCV = () => {
    if (onOpenCVModal) {
      onOpenCVModal();
    } else {
      setLocalCVOpen(true);
    }
  };

  const displayName = aboutData?.name?.trim() || PERSONAL_INFO.name;
  const fullName = aboutData?.fullName?.trim() || PERSONAL_INFO.fullName;
  const locationLabel = aboutData?.location?.trim() || PERSONAL_INFO.location;
  const contactEmailAddress = aboutData?.email?.trim() || 'valentinojehaut@gmail.com';
  const heroHeadline = aboutData?.heroHeadline?.trim() || 'I design and build digital products 💻📱.';
  const heroSubheadline =
    aboutData?.heroSubheadline?.trim() ||
    'I turn ideas into useful digital products through design and development.';

  async function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmittingContact) return;

    const trimmedName = contactName.trim();
    const trimmedEmail = contactEmail.trim();
    const trimmedMessage = contactMessage.trim();
    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      setContactStatus('Please complete your name, email address, and project message.');
      return;
    }

    setIsSubmittingContact(true);
    setContactStatus('');
    try {
      await CMSStorage.addContactEntry({
        name: trimmedName,
        email: trimmedEmail,
        message: trimmedMessage,
      });
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      setContactStatus('Thanks! Your message has been sent and I will reply by email soon.');
    } catch {
      const subject = `Portfolio inquiry from ${trimmedName}`;
      const body = `${trimmedMessage}\n\nFrom: ${trimmedName}\nReply to: ${trimmedEmail}`;
      setContactStatus(
        `Could not reach the messaging service right now. You can send directly via mailto:${contactEmailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)} or use the email address on the left.`,
      );
    } finally {
      setIsSubmittingContact(false);
    }
  }

  const resolvedPortraitUrl = aboutData?.imageURL
    ? aboutData.imageURL.startsWith('http') || aboutData.imageURL.startsWith('/')
      ? aboutData.imageURL
      : `/images/${aboutData.imageURL}`
    : undefined;

  return (
    <div ref={rootRef} className="min-h-screen bg-white text-ink">
      <section id="home" aria-labelledby="home-heading" className="bg-paper">
        <div className="page-shell flex flex-col items-center pb-12 pt-16 text-center sm:pb-16 sm:pt-24 lg:pt-28">
          {loadingState.about ? (
            <div
              aria-busy="true"
              aria-label="Loading hero introduction"
              data-testid="hero-copy-skeleton"
              className="flex w-full flex-col items-center"
            >
              <h1 id="home-heading" className="sr-only">
                Loading portfolio
              </h1>
              <SkeletonBox className="h-11 w-full max-w-xl rounded sm:h-14" />
              <SkeletonBox className="mt-3 h-11 w-4/5 max-w-2xl rounded sm:h-14" />
              <SkeletonBox className="mt-7 h-5 w-full max-w-md rounded" />
              <SkeletonBox className="mt-2 h-5 w-72 rounded" />
            </div>
          ) : (
            <>
              <h1 id="home-heading" data-gsap="hero-item" className="hero-type mx-auto max-w-[28ch]">
                <span className="block">
                  {greeting} 👋, I’m {displayName}.
                </span>
                <span className="mt-3 block text-brand">{heroHeadline}</span>
              </h1>
              <p
                data-gsap="hero-item"
                className="mt-7 max-w-[46ch] text-base leading-relaxed text-muted-600 sm:text-lg"
              >
                {heroSubheadline}
              </p>
            </>
          )}
          <div data-gsap="hero-item" className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#selected-work" className="flat-button flat-button-blue">
              View projects <ArrowRightIcon className="size-4" />
            </a>
            <a href="#contact" className="flat-button flat-button-outline">
              Contact me <ArrowRightIcon className="size-4" />
            </a>
          </div>
        </div>
        <HeroProjectStrip projects={projects} isLoading={loadingState.projects} />
      </section>

      <section
        id="selected-work"
        aria-labelledby="work-heading"
        data-gsap="reveal-section"
        className="py-20 sm:py-28"
      >
        <div className="page-shell">
          <div className="mb-10">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <h2 id="work-heading" className="section-title">
                Selected <span className="text-brand">projects</span>
              </h2>
              {loadingState.projects ? (
                <SkeletonBox className="h-11 w-36 rounded-full" />
              ) : (
                <Link className="text-link" to="/portfolio">
                  View all work{' '}
                  <span className="tabular-nums text-muted-600">({projects.length})</span>
                  <ArrowRightIcon className="size-4" />
                </Link>
              )}
            </div>
            {!loadingState.projects && roleFilters.length > 2 && (
              <div
                role="group"
                aria-label="Filter selected projects by role"
                className="mt-8 flex flex-wrap gap-2.5"
              >
                {roleFilters.map((role) => {
                  const active = selectedRole === role;
                  return (
                    <button
                      key={role}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setSelectedRole(role)}
                      className={`min-h-10 rounded-full border px-4 py-1.5 text-sm font-medium ${active
                        ? 'border-brand bg-brand text-white'
                        : 'border-muted-400 bg-transparent text-ink hover:border-ink'
                        }`}
                    >
                      {role}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {loadingState.projects ? (
            <ProjectCardSkeletonGrid count={3} carouselMode />
          ) : (
            <div ref={workCarouselRef}>
              <EditorialCarousel label="selected work">
                {filteredProjects.slice(0, 6).map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onSelectProject={handleSelectProject}
                    aspectRatio="aspect-video"
                  />
                ))}
              </EditorialCarousel>
            </div>
          )}
        </div>
      </section>

      <WorkProcessSection
        steps={workProcessSteps}
        subtitle={aboutData?.workProcessSubtitle}
        isLoading={loadingState.workProcess}
        subtitleLoading={loadingState.about}
      />

      <section
        id="about"
        aria-labelledby="about-heading"
        data-gsap="reveal-section"
        className="py-20 sm:py-28"
      >
        <div className="page-shell">
          <h2 id="about-heading" className="section-title mb-10">
            About <span className="text-brand">me</span>
          </h2>
          {loadingState.about ? (
            <AboutSectionSkeleton />
          ) : (
            <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
              <div>
                {aboutData?.description ? (
                  <div
                    className="wysiwyg-content max-w-[65ch] text-base leading-[1.75] text-muted-600"
                    dangerouslySetInnerHTML={{
                      __html: formatPublicDescription(aboutData.description),
                    }}
                  />
                ) : (
                  <p className="max-w-[65ch] text-base leading-[1.75] text-muted-600">
                    {PERSONAL_INFO.aboutBio}
                  </p>
                )}
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <button type="button" onClick={handleOpenCV} className="text-link">
                    View my résumé <ArrowRightIcon className="size-4" />
                  </button>
                  {aboutData?.cvURL && (
                    <a
                      href={aboutData.cvURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flat-button flat-button-outline"
                    >
                      Download CV <DownloadIcon className="size-4" />
                    </a>
                  )}
                </div>
                <div className="mt-12 grid grid-cols-3 gap-4 border-t border-muted-300 pt-6">
                  {[
                    [
                      aboutData?.yearsExperience?.trim() || '4+',
                      aboutData?.yearsExperienceLabel?.trim() || 'Years of experience',
                    ],
                    [
                      String(projects.length).padStart(2, '0'),
                      aboutData?.selectedProjectsLabel?.trim() || 'Selected projects',
                    ],
                    [
                      aboutData?.degreesCount?.trim() || '02',
                      aboutData?.degreesLabel?.trim() || 'Bachelor’s degrees',
                    ],
                  ].map(([value, label]) => (
                    <div key={label}>
                      <p
                        data-gsap="stat-value"
                        className="text-4xl font-medium tracking-[-0.05em] text-brand sm:text-5xl"
                      >
                        {value}
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-muted-600">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="max-w-xs">
                  {resolvedPortraitUrl && !portraitError ? (
                    <ProgressiveImageFrame aspectRatio="aspect-[4/5]" loaded={portraitLoaded}>
                      <img
                        src={resolvedPortraitUrl}
                        srcSet={buildCloudinarySrcSet(resolvedPortraitUrl, [400, 800])}
                        sizes="(max-width: 1024px) 320px, 320px"
                        alt={`Portrait of ${fullName}`}
                        width={400}
                        height={500}
                        loading="lazy"
                        decoding="async"
                        onLoad={(event) => {
                          setPortraitLoaded(true);
                          animateImageReveal(event.currentTarget);
                        }}
                        onError={() => {
                          setPortraitLoaded(true);
                          setPortraitError(true);
                        }}
                        className="relative z-[1] h-full w-full object-cover"
                      />
                    </ProgressiveImageFrame>
                  ) : (
                    <ImagePlaceholder label={`Portrait of ${displayName}`} aspectRatio="aspect-[4/5]" />
                  )}
                </div>
                <p className="mt-3 text-xs text-muted-600">
                  {displayName} / {locationLabel}
                </p>
              </div>
            </div>
          )}
          <div id="tools" className="mt-16 space-y-6 border-t border-muted-300 pt-8">
            <h3 className="text-xl font-medium">Tools I use</h3>
            {loadingState.tools ? (
              <div aria-busy="true" aria-label="Loading tools" data-testid="tools-skeleton" className="flex flex-wrap gap-3">
                {[88, 72, 96, 80, 108, 84, 76, 92].map((w, idx) => (
                  <div
                    key={idx}
                    aria-hidden="true"
                    style={{ width: `${w}px` }}
                    className="h-6 animate-pulse rounded bg-[#e7e7e9] motion-reduce:animate-none"
                  />
                ))}
              </div>
            ) : (
              <ul className="flex flex-wrap gap-x-6 gap-y-4 text-sm font-medium">
                {techTools.map((tool) => (
                  <li
                    key={tool.id || tool.name}
                    data-gsap="reveal-item"
                    className="inline-flex items-center gap-2"
                  >
                    {tool.imageURL && (
                      <img
                        src={tool.imageURL}
                        srcSet={buildCloudinarySrcSet(tool.imageURL, [48, 96])}
                        sizes="18px"
                        alt=""
                        width={18}
                        height={18}
                        loading="lazy"
                        decoding="async"
                        className="size-[18px] object-contain"
                      />
                    )}
                    <span>{tool.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <ExperienceEducationSection
        experiences={experiences}
        educationList={educationList}
        activeHash={location.hash}
        isLoadingExperiences={loadingState.experiences}
        isLoadingEducation={loadingState.education}
      />

      {(loadingState.blogs || blogs.length > 0) && (
        <section
          id="journal"
          aria-labelledby="journal-heading"
          aria-busy={loadingState.blogs || undefined}
          data-gsap="reveal-section"
          className="py-20 sm:py-28"
        >
          <div className="page-shell">
            <div className="mb-12">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <h2 id="journal-heading" className="section-title">
                  My <span className="text-brand">journal</span>
                </h2>
                {loadingState.blogs ? (
                  <SkeletonBox className="h-11 w-40 rounded-full" />
                ) : (
                  <Link to="/blogs" className="text-link">
                    Read the journal <ArrowRightIcon className="size-4" />
                  </Link>
                )}
              </div>
            </div>
            {loadingState.blogs ? (
              <BlogCardSkeletonGrid count={3} />
            ) : (
              <EditorialCarousel label="journal">
                {blogs.slice(0, 6).map((post) => (
                  <BlogCard key={post.id} post={post} onSelectPost={handleSelectBlog} />
                ))}
              </EditorialCarousel>
            )}
          </div>
        </section>
      )}

      <section
        id="contact"
        aria-labelledby="contact-heading"
        data-gsap="reveal-section"
        className="bg-brand py-20 text-white sm:py-28"
      >
        <div className="page-shell">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              {loadingState.about ? (
                <div aria-busy="true" aria-label="Loading contact details" data-testid="contact-skeleton" className="space-y-6">
                  <h2 id="contact-heading" className="sr-only">
                    Contact
                  </h2>
                  <div aria-hidden="true" className="space-y-3">
                    <div className="h-10 w-4/5 max-w-md animate-pulse rounded bg-white/20 motion-reduce:animate-none sm:h-12" />
                    <div className="h-10 w-3/5 max-w-sm animate-pulse rounded bg-white/20 motion-reduce:animate-none sm:h-12" />
                  </div>
                  <div aria-hidden="true" className="space-y-2 pt-2">
                    <div className="h-4 w-full max-w-md animate-pulse rounded bg-white/20 motion-reduce:animate-none" />
                    <div className="h-4 w-2/3 max-w-xs animate-pulse rounded bg-white/20 motion-reduce:animate-none" />
                  </div>
                  <div aria-hidden="true" className="h-11 w-60 animate-pulse rounded-full bg-white/20 motion-reduce:animate-none" />
                </div>
              ) : (
                <>
                  <h2 id="contact-heading" className="section-title max-w-[15ch]">
                    {aboutData?.contactHeading?.trim() || 'Tell me about your project'}
                  </h2>
                  <p className="mt-8 max-w-md text-base leading-relaxed">
                    {aboutData?.contactSubtext?.trim() ||
                      'Send me your project details or ask a question. I will reply by email.'}
                  </p>
                  <a href={`mailto:${contactEmailAddress}`} className="text-link mt-7 break-all">
                    {contactEmailAddress} <ArrowRightIcon className="size-4 shrink-0" />
                  </a>
                </>
              )}
              {loadingState.socialLinks ? (
                <div aria-busy="true" aria-label="Loading social links" data-testid="social-links-skeleton" className="mt-10 flex flex-wrap gap-3">
                  {[84, 96, 88].map((w, idx) => (
                    <div
                      key={idx}
                      aria-hidden="true"
                      style={{ width: `${w}px` }}
                      className="h-10 animate-pulse rounded bg-white/20 motion-reduce:animate-none"
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
                  {socialLinks
                    .filter((link) => link.icon !== 'mail')
                    .map((link) => (
                      <a
                        key={link.id || link.name}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-11 items-center gap-3 text-sm underline underline-offset-4"
                      >
                        {link.name}
                        <ArrowRightIcon className="size-3" />
                      </a>
                    ))}
                </div>
              )}
            </div>
            <form onSubmit={handleContactSubmit} aria-labelledby="contact-heading" className="space-y-6">
              <div>
                <label htmlFor="contact-name" className="mb-2 block text-sm">
                  Your name
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                  disabled={isSubmittingContact}
                  className="field-inverse"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="mb-2 block text-sm">
                  Email address
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                  disabled={isSubmittingContact}
                  className="field-inverse"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="mb-2 block text-sm">
                  Tell me about your project
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={4}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  required
                  disabled={isSubmittingContact}
                  className="field-inverse min-h-[7rem] resize-y"
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="max-w-[30ch] text-xs leading-relaxed">
                  Messages are saved directly for review and reply.
                </p>
                <button
                  type="submit"
                  disabled={isSubmittingContact}
                  className="inline-flex min-h-12 items-center gap-4 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand focus-visible:outline-white disabled:opacity-60"
                >
                  {isSubmittingContact ? 'Sending...' : 'Send message'}
                  <ArrowRightIcon className="size-4" />
                </button>
              </div>
              <p role="status" aria-live="polite" className="min-h-5 text-sm leading-relaxed">
                {contactStatus}
              </p>
            </form>
          </div>
        </div>
      </section>

      <Footer
        aboutData={aboutData}
        socialLinks={socialLinks}
        isLoading={loadingState.about || loadingState.socialLinks}
      />

      <PasswordProtectionModal
        isOpen={Boolean(protectedProject)}
        onClose={() => {
          setProtectedProject(null);
          setPasswordError('');
        }}
        onSubmit={handlePasswordSubmit}
        portfolioTitle={protectedProject?.title || ''}
        error={passwordError}
      />

      {!onOpenCVModal && (
        <CVModal
          isOpen={localCVOpen}
          onClose={() => setLocalCVOpen(false)}
          experiences={experiences}
          educationList={educationList}
          cvURL={aboutData?.cvURL}
          fullName={aboutData?.fullName}
          resumeSummary={aboutData?.resumeSummary}
          email={aboutData?.email}
        />
      )}
    </div>
  );
}
