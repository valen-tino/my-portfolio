import { useEffect, useId, useRef, useState, type FocusEvent, type MouseEvent } from 'react';
import gsap from 'gsap';
import type { Project } from '../types/portfolio';
import { animateFloatingPreviewY, shouldSkipGSAPMotion } from '../utils/gsapAnimations';
import { LockIcon } from './Icons';
import { ImagePlaceholder } from './ImagePlaceholder';

interface PortfolioTableProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
}

function formatProjectHost(externalUrl?: string): string {
  if (!externalUrl || !externalUrl.trim()) return '';
  try {
    const parsed = new URL(externalUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '';
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function isPrimaryPlainClick(event: MouseEvent<HTMLElement>): boolean {
  return (
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey &&
    event.button === 0
  );
}

/** Editorial project table with keyboard/hover thumbnail preview and container-responsive stacking. */
export function PortfolioTable({ projects, onSelectProject }: PortfolioTableProps) {
  const captionId = useId();
  const stageRef = useRef<HTMLDivElement>(null);
  const tbodyRef = useRef<HTMLTableSectionElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const wasActiveRef = useRef(false);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [previewTop, setPreviewTop] = useState(0);
  const [failedImageIds, setFailedImageIds] = useState<Record<string, boolean>>({});

  const activeProject = activeIndex !== null ? projects[activeIndex] ?? null : null;

  useEffect(() => {
    const el = previewRef.current;
    if (!activeProject || !el) {
      wasActiveRef.current = false;
      return;
    }
    if (shouldSkipGSAPMotion()) {
      wasActiveRef.current = true;
      return;
    }
    if (!wasActiveRef.current) {
      wasActiveRef.current = true;
      gsap.fromTo(
        el,
        { y: previewTop, opacity: 0, scale: 0.98 },
        { y: previewTop, opacity: 1, scale: 1, duration: 0.2, ease: 'power2.out', overwrite: 'auto' },
      );
    } else {
      animateFloatingPreviewY(el, previewTop);
    }
  }, [activeProject, previewTop]);

  const activatePreview = (index: number, rowEl: HTMLTableRowElement | null) => {
    setActiveIndex(index);
    const stageEl = stageRef.current;
    if (!stageEl || !rowEl) return;
    const stageRect = stageEl.getBoundingClientRect();
    const rowRect = rowEl.getBoundingClientRect();
    setPreviewTop(Math.max(0, Math.round(rowRect.bottom - stageRect.top + 8)));
  };

  const handleTbodyBlur = (event: FocusEvent<HTMLTableSectionElement>) => {
    if (!tbodyRef.current?.contains(event.relatedTarget as Node | null)) {
      setActiveIndex(null);
    }
  };

  const showPreviewImage =
    Boolean(activeProject?.imageURL) &&
    !activeProject?.isPasswordProtected &&
    !failedImageIds[activeProject?.id ?? ''];

  return (
    <div ref={stageRef} data-testid="portfolio-table-view" className="relative">
      <div
        tabIndex={0}
        role="region"
        aria-labelledby={captionId}
        className="portfolio-table-wrapper border-t border-muted-300"
      >
        <table className="portfolio-table">
          <caption id={captionId} className="sr-only">
            Selected projects directory
          </caption>
          <thead>
            <tr>
              <th scope="col" className="w-16 text-left">
                No.
              </th>
              <th scope="col" className="text-left">
                Project
              </th>
              <th scope="col" className="text-left">
                Role
              </th>
              <th scope="col" className="text-left">
                Link
              </th>
              <th scope="col" className="w-24 text-left">
                Year
              </th>
            </tr>
          </thead>
          <tbody
            ref={tbodyRef}
            onMouseLeave={() => setActiveIndex(null)}
            onBlur={handleTbodyBlur}
          >
            {projects.map((project, index) => {
              const href = `/portfolio/${project.id || project.slug}`;
              const paddedIndex = String(index + 1).padStart(3, '0');
              const rolesLabel =
                project.roles.length > 0 ? project.roles.join(', ') : project.category || 'Case Study';
              const destinationLabel = project.isPasswordProtected
                ? 'Protected'
                : formatProjectHost(project.externalUrl) || 'Case study';

              return (
                <tr
                  key={project.id}
                  data-testid={`portfolio-table-row-${project.id}`}
                  onMouseEnter={(event) => activatePreview(index, event.currentTarget)}
                  onFocus={(event) => activatePreview(index, event.currentTarget)}
                  onClick={(event) => {
                    if (window.getSelection()?.toString()) return;
                    if (isPrimaryPlainClick(event)) {
                      onSelectProject(project);
                    }
                  }}
                  className="group/row cursor-pointer"
                >
                  <td data-col="index" className="text-xs font-medium tabular-nums text-muted-500">
                    {paddedIndex}
                  </td>
                  <th scope="row" className="font-medium text-ink">
                    <a
                      href={href}
                      aria-label={`View project: ${project.title}`}
                      onClick={(event) => {
                        if (isPrimaryPlainClick(event)) {
                          event.preventDefault();
                          event.stopPropagation();
                          onSelectProject(project);
                        }
                      }}
                      className="inline-flex min-h-11 items-center gap-2.5 text-base font-medium tracking-tight text-ink underline-offset-4 focus-visible:outline-brand group-hover/row:text-brand group-hover/row:underline group-focus-within/row:text-brand group-focus-within/row:underline"
                    >
                      <span>{project.title}</span>
                      {project.isPasswordProtected && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-ink px-2.5 py-0.5 text-[11px] font-medium text-white no-underline">
                          <LockIcon className="size-3" />
                          Protected
                        </span>
                      )}
                    </a>
                  </th>
                  <td data-col="roles" className="text-muted-600">
                    {rolesLabel}
                  </td>
                  <td data-col="link" className="text-muted-600">
                    {destinationLabel}
                  </td>
                  <td data-col="year" className="text-left tabular-nums text-muted-600">
                    {!project.isPasswordProtected && project.year ? project.year : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {activeProject && (
        <div
          ref={previewRef}
          data-testid="portfolio-table-preview"
          aria-hidden="true"
          style={
            shouldSkipGSAPMotion() ? { transform: `translate3d(0, ${previewTop}px, 0)` } : undefined
          }
          className="portfolio-table-preview pointer-events-none absolute right-6 top-0 z-20 w-72 overflow-hidden border border-muted-300 bg-white shadow-xl lg:right-10 lg:w-80"
        >
          {showPreviewImage ? (
            <div className="aspect-video w-full overflow-hidden bg-[#e7e7e9]">
              <img
                src={activeProject.imageURL}
                alt=""
                width={640}
                height={360}
                decoding="async"
                onError={() =>
                  setFailedImageIds((prev) => ({
                    ...prev,
                    [activeProject.id]: true,
                  }))
                }
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <ImagePlaceholder
              label={
                activeProject.isPasswordProtected
                  ? 'Password protected case study'
                  : activeProject.title
              }
              badge={activeProject.isPasswordProtected ? 'Protected' : undefined}
              badgeColor="bg-ink text-white"
              aspectRatio="aspect-video"
            />
          )}
          <div className="border-t border-muted-300 bg-white px-3.5 py-2.5">
            <p className="truncate text-xs font-medium text-ink">{activeProject.title}</p>
            <p className="mt-0.5 truncate text-[11px] text-muted-600">
              {activeProject.roles.length > 0
                ? activeProject.roles.join(' · ')
                : activeProject.category || 'Case Study'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

