  import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import type { Education, Experience } from '../types/portfolio';
import { formatPublicDescription } from '../utils/contentMigration';
import { sortByLatestEndDate } from '../utils/dateFormat';
import { ArrowRightIcon } from './Icons';

interface ExperienceEducationSectionProps {
  experiences: Experience[];
  educationList: Education[];
  activeHash?: string;
}

type TimelineTab = 'experiences' | 'education';

export function ExperienceEducationSection({
  experiences,
  educationList,
  activeHash,
}: ExperienceEducationSectionProps) {
  const [activeTab, setActiveTab] = useState<TimelineTab>(() =>
    activeHash === '#education' ? 'education' : 'experiences',
  );
  const [failedLogos, setFailedLogos] = useState<Record<string, boolean>>({});

  const expTabRef = useRef<HTMLButtonElement>(null);
  const eduTabRef = useRef<HTMLButtonElement>(null);
  const expPanelRef = useRef<HTMLDivElement>(null);
  const eduPanelRef = useRef<HTMLDivElement>(null);

  const baseId = useId();
  const expTabId = `${baseId}-tab-experiences`;
  const eduTabId = `${baseId}-tab-education`;
  const expPanelId = `${baseId}-panel-experiences`;

  const sortedExperiences = useMemo(() => sortByLatestEndDate(experiences), [experiences]);
  const sortedEducation = useMemo(() => sortByLatestEndDate(educationList), [educationList]);

  useEffect(() => {
    if (activeHash === '#education') {
      setActiveTab('education');
    } else if (activeHash === '#experience') {
      setActiveTab('experiences');
    }
  }, [activeHash]);

  // Set hidden="until-found" directly via DOM API because React treats JSX `hidden` as boolean ("")
  useLayoutEffect(() => {
    const syncPanel = (panel: HTMLDivElement | null, isActive: boolean) => {
      if (!panel) return;
      if (isActive) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', 'until-found');
      }
    };

    syncPanel(expPanelRef.current, activeTab === 'experiences');
    syncPanel(eduPanelRef.current, activeTab === 'education');
  }, [activeTab]);

  // Synchronize active tab when browser Find-in-Page opens a hidden="until-found" panel
  useEffect(() => {
    const expPanel = expPanelRef.current;
    const eduPanel = eduPanelRef.current;

    const handleExpMatch = () => setActiveTab('experiences');
    const handleEduMatch = () => setActiveTab('education');

    expPanel?.addEventListener('beforematch', handleExpMatch);
    eduPanel?.addEventListener('beforematch', handleEduMatch);

    return () => {
      expPanel?.removeEventListener('beforematch', handleExpMatch);
      eduPanel?.removeEventListener('beforematch', handleEduMatch);
    };
  }, []);

  const selectAndFocusTab = (tab: TimelineTab) => {
    setActiveTab(tab);
    if (tab === 'experiences') {
      expTabRef.current?.focus();
    } else {
      eduTabRef.current?.focus();
    }
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, current: TimelineTab) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      selectAndFocusTab(current === 'experiences' ? 'education' : 'experiences');
    } else if (event.key === 'Home') {
      event.preventDefault();
      selectAndFocusTab('experiences');
    } else if (event.key === 'End') {
      event.preventDefault();
      selectAndFocusTab('education');
    }
  };

  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      data-gsap="reveal-section"
      className="bg-paper py-20 sm:py-28"
    >
      <div className="page-shell space-y-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 id="experience-heading" className="section-title">
            Experience and education
          </h2>

          <div
            role="tablist"
            aria-label="Experiences and Education"
            className="flex shrink-0 items-center gap-2 overflow-x-auto pb-1"
          >
            <button
              ref={expTabRef}
              id={expTabId}
              type="button"
              role="tab"
              aria-selected={activeTab === 'experiences'}
              aria-controls={expPanelId}
              tabIndex={activeTab === 'experiences' ? 0 : -1}
              onClick={() => setActiveTab('experiences')}
              onKeyDown={(e) => handleTabKeyDown(e, 'experiences')}
              className={`tab-editorial inline-flex min-h-11 shrink-0 items-center gap-2.5 rounded-full border px-5 py-2 text-sm font-medium focus-visible:outline-brand ${
                activeTab === 'experiences'
                  ? 'border-brand bg-brand text-white'
                  : 'border-muted-400 bg-white text-ink hover:border-ink'
              }`}
            >
              <span>Experiences</span>
              <span className="text-xs tabular-nums opacity-85">{sortedExperiences.length}</span>
            </button>

            <button
              ref={eduTabRef}
              id={eduTabId}
              type="button"
              role="tab"
              aria-selected={activeTab === 'education'}
              aria-controls="education"
              tabIndex={activeTab === 'education' ? 0 : -1}
              onClick={() => setActiveTab('education')}
              onKeyDown={(e) => handleTabKeyDown(e, 'education')}
              className={`tab-editorial inline-flex min-h-11 shrink-0 items-center gap-2.5 rounded-full border px-5 py-2 text-sm font-medium focus-visible:outline-brand ${
                activeTab === 'education'
                  ? 'border-brand bg-brand text-white'
                  : 'border-muted-400 bg-white text-ink hover:border-ink'
              }`}
            >
              <span>Education</span>
              <span className="text-xs tabular-nums opacity-85">{sortedEducation.length}</span>
            </button>
          </div>
        </div>

        <div>
          <div
            ref={expPanelRef}
            id={expPanelId}
            role="tabpanel"
            aria-labelledby={expTabId}
            tabIndex={activeTab === 'experiences' ? 0 : undefined}
          >
            <div className="pt-2">
              <h3 className="sr-only">Experiences</h3>
              {sortedExperiences.map((exp) => (
                <article key={exp.id} className="border-t border-muted-300 py-6">
                  <div className="flex flex-wrap justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      {exp.logoURL && !failedLogos[exp.id] && (
                        <img
                          src={exp.logoURL}
                          alt={`${exp.company} logo`}
                          width={40}
                          height={40}
                          loading="lazy"
                          decoding="async"
                          onError={() =>
                            setFailedLogos((prev) => ({ ...prev, [exp.id]: true }))
                          }
                          className="mt-0.5 size-10 shrink-0 rounded-lg border border-muted-300 bg-white object-contain p-1"
                        />
                      )}
                      <div>
                        <h4 className="text-xl font-medium tracking-tight">{exp.role}</h4>
                        <p className="mt-1 text-sm text-brand">{exp.company}</p>
                      </div>
                    </div>
                    <p className="text-xs tabular-nums text-muted-600">
                      {exp.period}
                      {exp.type ? ` / ${exp.type}` : ''}
                    </p>
                  </div>
                  <div
                    className="wysiwyg-content mt-4 max-w-[65ch] text-sm leading-relaxed text-muted-600"
                    dangerouslySetInnerHTML={{
                      __html: formatPublicDescription(exp.description || ''),
                    }}
                  />
                </article>
              ))}
            </div>
          </div>

          <div
            ref={eduPanelRef}
            id="education"
            role="tabpanel"
            aria-labelledby={eduTabId}
            tabIndex={activeTab === 'education' ? 0 : undefined}
          >
            <div className="pt-2">
              <h3 className="sr-only">Education</h3>
              {sortedEducation.map((edu) => (
                <article key={edu.id} className="border-t border-muted-300 py-6">
                  <p className="text-xs tabular-nums text-muted-600">{edu.period}</p>
                  <h4 className="mt-2 text-xl font-medium tracking-tight">{edu.degree}</h4>
                  <p className="mt-1 text-sm text-brand">{edu.institution}</p>
                  <div
                    className="wysiwyg-content mt-4 max-w-[65ch] text-sm leading-relaxed text-muted-600"
                    dangerouslySetInnerHTML={{
                      __html: formatPublicDescription(edu.description || ''),
                    }}
                  />
                  {edu.certificateUrl &&
                    (/^(https?:\/\/|\/(?!\/))/.test(edu.certificateUrl) ? (
                      <a
                        href={edu.certificateUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-link mt-3"
                        aria-label={`View certificate: ${edu.degree}`}
                      >
                        View certificate <ArrowRightIcon className="size-4" />
                      </a>
                    ) : (
                      <div className="mt-3">
                        <button
                          type="button"
                          disabled
                          className="text-link opacity-50"
                          aria-label={`View certificate: ${edu.degree}`}
                          aria-describedby={`${edu.id}-certificate-note`}
                        >
                          View certificate
                        </button>
                        <p
                          id={`${edu.id}-certificate-note`}
                          className="mt-2 text-sm text-muted-600"
                        >
                          Certificate not available yet.
                        </p>
                      </div>
                    ))}
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
