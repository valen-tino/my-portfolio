import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CMSStorage, type AboutData } from '../cms/apiStorage';
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
  TechToolView,
  WorkProcessStep,
} from '../types/portfolio';
import { formatPublicDescription } from '../utils/contentMigration';
import { sortByLatestEndDate } from '../utils/dateFormat';
import { useGSAPPageEntrance } from '../utils/gsapAnimations';
import { navigateWithTransition } from '../utils/viewTransitions';

interface HomeProps {
  onOpenCVModal?: () => void;
}

export default function Home({ onOpenCVModal }: HomeProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const rootRef = useRef<HTMLDivElement>(null);
  const greeting = getGreetingText();

  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [blogs, setBlogs] = useState<BlogPost[]>(BLOG_POSTS);
  const [experiences, setExperiences] = useState<Experience[]>(() => sortByLatestEndDate(EXPERIENCES));
  const [educationList, setEducationList] = useState<Education[]>(() =>
    sortByLatestEndDate(EDUCATION_LIST),
  );
  const [techTools, setTechTools] = useState<TechToolView[]>(TECH_TOOLS);
  const [workProcessSteps, setWorkProcessSteps] = useState<WorkProcessStep[]>(WORK_PROCESS_STEPS);
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [portraitError, setPortraitError] = useState(false);

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

  useGSAPPageEntrance(rootRef, [projects.length, blogs.length]);

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
      ]);

      if (!active) return;

      if (portfoliosRes.status === 'fulfilled' && Array.isArray(portfoliosRes.value)) {
        const published = portfoliosRes.value
          .filter((item) => item.isPublished !== false)
          .map(mapPortfolioItemToProject);
        if (published.length > 0) {
          setProjects(published);
        }
      }

      if (blogsRes.status === 'fulfilled' && Array.isArray(blogsRes.value)) {
        const publishedBlogs = blogsRes.value
          .filter((item) => item.isPublished !== false)
          .map(mapCMSBlogToPost);
        setBlogs(publishedBlogs);
      }

      if (aboutRes.status === 'fulfilled' && aboutRes.value) {
        setAboutData(aboutRes.value);
      }

      if (toolsRes.status === 'fulfilled' && Array.isArray(toolsRes.value) && toolsRes.value.length > 0) {
        setTechTools(toolsRes.value.map(mapCMSTechToolToView));
      }

      if (
        educationRes.status === 'fulfilled' &&
        Array.isArray(educationRes.value) &&
        educationRes.value.length > 0
      ) {
        setEducationList(sortByLatestEndDate(educationRes.value.map(mapCMSEducationToView)));
      }

      if (
        experiencesRes.status === 'fulfilled' &&
        experiencesRes.value?.success &&
        Array.isArray(experiencesRes.value.data) &&
        experiencesRes.value.data.length > 0
      ) {
        setExperiences(sortByLatestEndDate(experiencesRes.value.data.map(mapCMSExperienceToView)));
      }

      if (
        workProcessRes.status === 'fulfilled' &&
        Array.isArray(workProcessRes.value) &&
        workProcessRes.value.length > 0
      ) {
        setWorkProcessSteps(workProcessRes.value.map(mapCMSWorkProcessToView));
      }
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
    return ['All', ...distinct];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (selectedRole === 'All') return projects;
    return projects.filter((p) => p.roles.includes(selectedRole));
  }, [projects, selectedRole]);

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
        `Could not reach the messaging service right now. You can send directly via mailto:valentinojehaut@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)} or use the email address on the left.`,
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
          <h1 id="home-heading" data-gsap="hero-item" className="hero-type mx-auto max-w-[28ch]">
            <span className="block">{greeting} 👋, I’m Valentino Jehaut.</span>
            <span className="mt-3 block text-brand">I design and build digital products 💻📱.</span>
          </h1>
          <p
            data-gsap="hero-item"
            className="mt-7 max-w-[46ch] text-base leading-relaxed text-muted-600 sm:text-lg"
          >
            I turn ideas into useful digital products through design and development.
          </p>
          <div data-gsap="hero-item" className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#selected-work" className="flat-button flat-button-blue">
              View projects <ArrowRightIcon className="size-4" />
            </a>
            <a href="#contact" className="flat-button flat-button-outline">
              Contact me <ArrowRightIcon className="size-4" />
            </a>
          </div>
        </div>
        <HeroProjectStrip projects={projects} />
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
              <Link className="text-link" to="/portfolio">
                View all work{' '}
                <span className="tabular-nums text-muted-600">({projects.length})</span>
                <ArrowRightIcon className="size-4" />
              </Link>
            </div>
            {roleFilters.length > 2 && (
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
      </section>

      <WorkProcessSection steps={workProcessSteps} />

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
                  ['4+', 'Years of experience'],
                  [String(projects.length).padStart(2, '0'), 'Selected projects'],
                  ['02', 'Bachelor’s degrees'],
                ].map(([value, label]) => (
                  <div key={label}>
                    <p className="text-4xl font-medium tracking-[-0.05em] text-brand sm:text-5xl">
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
                  <div className="aspect-[4/5] overflow-hidden bg-[#e7e7e9] outline outline-1 -outline-offset-1 outline-black/10">
                    <img
                      src={resolvedPortraitUrl}
                      alt={`Portrait of ${PERSONAL_INFO.fullName}`}
                      width={400}
                      height={500}
                      loading="lazy"
                      decoding="async"
                      onError={() => setPortraitError(true)}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <ImagePlaceholder label="Portrait of Valentino Jehaut" aspectRatio="aspect-[4/5]" />
                )}
              </div>
              <p className="mt-3 text-xs text-muted-600">Valentino Jehaut / Bali, Indonesia</p>
            </div>
          </div>
          <div id="tools" className="mt-16 space-y-6 border-t border-muted-300 pt-8">
            <h3 className="text-xl font-medium">Tools I use</h3>
            <ul className="flex flex-wrap gap-x-6 gap-y-4 text-sm font-medium">
              {techTools.map((tool) => (
                <li key={tool.id || tool.name} className="inline-flex items-center gap-2">
                  {tool.imageURL && (
                    <img
                      src={tool.imageURL}
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
          </div>
        </div>
      </section>

      <ExperienceEducationSection
        experiences={experiences}
        educationList={educationList}
        activeHash={location.hash}
      />

      {blogs.length > 0 && (
        <section
          id="journal"
          aria-labelledby="journal-heading"
          data-gsap="reveal-section"
          className="py-20 sm:py-28"
        >
          <div className="page-shell">
            <div className="mb-12">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <h2 id="journal-heading" className="section-title">
                  My <span className="text-brand">journal</span>
                </h2>
                <Link to="/blogs" className="text-link">
                  Read the journal <ArrowRightIcon className="size-4" />
                </Link>
              </div>
            </div>
            <EditorialCarousel label="journal">
              {blogs.slice(0, 6).map((post) => (
                <BlogCard key={post.id} post={post} onSelectPost={handleSelectBlog} />
              ))}
            </EditorialCarousel>
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
              <h2 id="contact-heading" className="section-title max-w-[15ch]">
                Tell me about your project
              </h2>
              <p className="mt-8 max-w-md text-base leading-relaxed">
                Send me your project details or ask a question. I will reply by email.
              </p>
              <a href="mailto:valentinojehaut@gmail.com" className="text-link mt-7 break-all">
                valentinojehaut@gmail.com <ArrowRightIcon className="size-4 shrink-0" />
              </a>
              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
                {SOCIAL_LINKS.filter((link) => link.icon !== 'mail').map((link) => (
                  <a
                    key={link.name}
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

      <Footer />

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
        />
      )}
    </div>
  );
}
