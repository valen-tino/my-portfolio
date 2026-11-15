import { useEffect, useMemo, useRef } from 'react';
import { EDUCATION_LIST, EXPERIENCES, PERSONAL_INFO } from '../data/portfolioData';
import type { Education, Experience } from '../types/portfolio';
import { sortByLatestEndDate } from '../utils/dateFormat';
import { CloseIcon, DownloadIcon } from './Icons';

interface CVModalProps {
  isOpen: boolean;
  onClose: () => void;
  experiences?: Experience[];
  educationList?: Education[];
  cvURL?: string;
  fullName?: string;
  resumeSummary?: string;
  email?: string;
}

export function CVModal({
  isOpen,
  onClose,
  experiences = EXPERIENCES,
  educationList = EDUCATION_LIST,
  cvURL,
  fullName,
  resumeSummary,
  email,
}: CVModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        if (typeof dialog.showModal === 'function') {
          dialog.showModal();
        } else {
          dialog.setAttribute('open', '');
        }
      }
    } else if (dialog.open) {
      if (typeof dialog.close === 'function') {
        dialog.close();
      } else {
        dialog.removeAttribute('open');
      }
    }
  }, [isOpen]);

  const handleLightDismissFallback = (event: React.MouseEvent<HTMLDialogElement>) => {
    if ('closedBy' in HTMLDialogElement.prototype) return;
    const dialog = ref.current;
    if (!dialog || event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    const clickedInDialog =
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width;
    if (!clickedInDialog) {
      if (typeof dialog.close === 'function') {
        dialog.close();
      } else {
        onClose();
      }
    }
  };

  const sortedExperiences = useMemo(() => sortByLatestEndDate(experiences), [experiences]);
  const sortedEducation = useMemo(() => sortByLatestEndDate(educationList), [educationList]);
  const hasDownloadableCV = Boolean(cvURL && cvURL.trim());
  const resolvedEmail = email?.trim() || 'valentinojehaut@gmail.com';

  return (
    <dialog
      ref={ref}
      {...({ closedby: 'any' } as Record<string, string>)}
      aria-labelledby="resume-heading"
      onClose={() => {
        if (isOpen) onClose();
      }}
      onClick={handleLightDismissFallback}
      className="fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%-2.5rem)] max-w-2xl overflow-y-auto overscroll-contain bg-white p-6 text-ink backdrop:bg-black/60 sm:p-10"
    >
      <div className="flex items-start justify-between gap-5">
        <div>
          <h2 id="resume-heading" className="mt-3 text-3xl font-medium tracking-tight">
            {fullName?.trim() || PERSONAL_INFO.fullName}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          autoFocus
          aria-label="Close résumé"
          className="icon-button"
        >
          <CloseIcon className="size-5" />
        </button>
      </div>
      <p className="mt-6 text-sm leading-relaxed text-muted-600">
        {resumeSummary?.trim() ||
          'Bali-based web developer and UI/UX designer. React, TypeScript, WordPress, and Figma.'}
      </p>
      <h3 className="mb-4 mt-8 text-lg font-medium">Experience</h3>
      {sortedExperiences.map((exp) => (
        <div key={exp.id} className="border-t border-muted-300 py-4">
          <p className="text-sm font-medium">
            {exp.role} / {exp.company}
          </p>
          <p className="mt-1 text-xs text-muted-600">{exp.period}</p>
        </div>
      ))}
      <h3 className="mb-4 mt-6 text-lg font-medium">Education</h3>
      {sortedEducation.map((edu) => (
        <div key={edu.id} className="border-t border-muted-300 py-4">
          <p className="text-sm font-medium">{edu.degree}</p>
          <p className="mt-1 text-xs text-muted-600">
            {edu.institution} / {edu.period}
          </p>
        </div>
      ))}
      {hasDownloadableCV ? (
        <a
          href={cvURL}
          target="_blank"
          rel="noopener noreferrer"
          className="flat-button flat-button-blue mt-6"
        >
          Download full résumé <DownloadIcon className="size-4" />
        </a>
      ) : (
        <>
          <a
            href={`mailto:${resolvedEmail}?subject=Full%20résumé%20request`}
            className="flat-button flat-button-blue mt-6"
          >
            Request full résumé <DownloadIcon className="size-4" />
          </a>
          <p className="mt-3 text-xs text-muted-600">
            Opens your email app. No résumé PDF is currently attached to this portfolio.
          </p>
        </>
      )}
    </dialog>
  );
}
