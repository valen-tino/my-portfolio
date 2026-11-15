import { useId, useRef, useState } from 'react';
import { WORK_PROCESS_STEPS } from '../data/portfolioData';
import type { WorkProcessStep } from '../types/portfolio';
import { ArrowLeftIcon, ArrowRightIcon } from './Icons';

interface WorkProcessSectionProps {
  steps?: WorkProcessStep[];
}

export function WorkProcessSection({ steps }: WorkProcessSectionProps = {}) {
  const [index, setIndex] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const resolvedSteps = steps && steps.length > 0 ? steps : WORK_PROCESS_STEPS;
  const safeIndex = Math.min(index, resolvedSteps.length - 1);
  const step = resolvedSteps[safeIndex];

  function select(next: number, focus = false) {
    const clamped = Math.max(0, Math.min(next, resolvedSteps.length - 1));
    setIndex(clamped);
    if (focus) tabs.current[clamped]?.focus();
  }

  return (
    <section
      id="process"
      aria-labelledby={`${id}-heading`}
      data-gsap="reveal-section"
      className="bg-paper py-20 sm:py-28"
    >
      <div className="page-shell">
        <div className="mb-10">
          <div>
            <h2 id={`${id}-heading`} className="section-title max-w-[19ch]">
              This is how we
              <br className="hidden sm:block" /> can work together
              <span className="text-brand">.</span>
            </h2>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-600">
              I combine design thinking with spec-driven development—from research and prototyping through structured engineering, automated testing, and iterative delivery.
            </p>
          </div>
        </div>
        <div
          role="tablist"
          aria-label="Work process steps"
          className="flex flex-nowrap gap-3 overflow-x-auto pb-1"
        >
          {resolvedSteps.map((item, i) => {
            const isSelected = i === safeIndex;
            return (
              <button
                key={item.id || `${item.title}-${i}`}
                type="button"
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                role="tab"
                id={`${id}-tab-${i}`}
                aria-controls={`${id}-panel`}
                aria-selected={isSelected}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => select(i)}
                onKeyDown={(event) => {
                  let next: number | undefined;
                  if (event.key === 'ArrowRight' || event.key === 'ArrowDown')
                    next = (i + 1) % resolvedSteps.length;
                  if (event.key === 'ArrowLeft' || event.key === 'ArrowUp')
                    next = (i + resolvedSteps.length - 1) % resolvedSteps.length;
                  if (event.key === 'Home') next = 0;
                  if (event.key === 'End') next = resolvedSteps.length - 1;
                  if (next !== undefined) {
                    event.preventDefault();
                    select(next, true);
                  }
                }}
                className={`min-h-12 shrink-0 whitespace-nowrap rounded-full border px-6 py-3 text-left focus-visible:outline-brand ${
                  isSelected
                    ? 'border-brand bg-brand text-white underline decoration-2 underline-offset-4 forced-colors:outline forced-colors:outline-2'
                    : 'border-muted-400 text-muted-600 hover:border-ink hover:text-ink'
                }`}
              >
                <span className="text-lg font-medium tracking-tight sm:text-xl">
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>
        <div
          role="tabpanel"
          tabIndex={0}
          id={`${id}-panel`}
          aria-labelledby={`${id}-tab-${safeIndex}`}
          className="mt-8 bg-white p-6 sm:p-10"
        >
          <h3 className="text-3xl font-medium tracking-tight">{step.title}</h3>
          <p className="mt-5 max-w-[65ch] text-lg leading-relaxed">{step.description}</p>
        </div>
        <div className="mt-6 flex items-center justify-end gap-4">
          <div className="flex gap-3">
            <button
              type="button"
              aria-label="Previous process step"
              onClick={() => select(safeIndex - 1)}
              disabled={safeIndex === 0}
              className="icon-button"
            >
              <ArrowLeftIcon className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Next process step"
              onClick={() => select(safeIndex + 1)}
              disabled={safeIndex === resolvedSteps.length - 1}
              className="icon-button"
            >
              <ArrowRightIcon className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
