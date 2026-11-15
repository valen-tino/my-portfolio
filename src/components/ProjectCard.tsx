import { useState } from 'react';
import type { Project } from '../types/portfolio';
import { ArrowRightIcon, LockIcon } from './Icons';
import { ImagePlaceholder } from './ImagePlaceholder';

interface ProjectCardProps {
  project: Project;
  onSelectProject: (project: Project) => void;
  aspectRatio?: string;
}

export function ProjectCard({
  project,
  onSelectProject,
  aspectRatio = 'aspect-video',
}: ProjectCardProps) {
  const [imgError, setImgError] = useState(false);
  const href = `/portfolio/${project.id || project.slug}`;
  const showImage = Boolean(project.imageURL) && !project.isPasswordProtected && !imgError;

  return (
    <article data-gsap="card-interactive" className="group min-w-0">
      <a
        href={href}
        onClick={(event) => {
          if (
            !event.metaKey &&
            !event.ctrlKey &&
            !event.shiftKey &&
            !event.altKey &&
            event.button === 0
          ) {
            event.preventDefault();
            onSelectProject(project);
          }
        }}
        className="block"
        aria-label={`View project: ${project.title}`}
      >
        <div className="relative">
          {showImage ? (
            <div
              className={`relative w-full overflow-hidden bg-[#e7e7e9] outline outline-1 -outline-offset-1 outline-black/10 ${aspectRatio}`}
            >
              <img
                src={project.imageURL}
                alt={project.title}
                width={800}
                height={450}
                loading="lazy"
                decoding="async"
                onError={() => setImgError(true)}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <ImagePlaceholder
              label={project.isPasswordProtected ? 'Password protected case study' : project.title}
              aspectRatio={aspectRatio}
              badge={project.isPasswordProtected ? 'Protected' : undefined}
              badgeColor="bg-ink text-white"
            />
          )}
          <span className="card-hover-cta absolute bottom-3 right-3 flex min-h-12 items-center gap-3 rounded-full bg-white px-4 py-3 text-sm font-medium text-ink group-hover:bg-brand group-hover:text-white group-focus-within:bg-brand group-focus-within:text-white">
            {project.isPasswordProtected ? (
              <>
                <LockIcon className="size-4" />
                Unlock project
              </>
            ) : (
              <>
                View project <ArrowRightIcon className="size-4" />
              </>
            )}
          </span>
        </div>
        <div className="mt-5 flex items-start justify-between gap-4">
          <h3 className="max-w-[32ch] text-xl font-medium leading-snug tracking-[-0.035em] group-hover:text-brand sm:text-2xl">
            {project.title}
          </h3>
          {!project.isPasswordProtected && project.year && (
            <span className="pt-1 text-xs tabular-nums text-muted-600">{project.year}</span>
          )}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-600">
          {project.roles.length > 0 ? project.roles.join(' / ') : project.category || 'Case Study'}
        </p>
      </a>
    </article>
  );
}
