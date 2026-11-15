import { useId, useRef, useState } from 'react';
import { WORK_PROCESS_STEPS } from '../data/portfolioData';
import { ArrowLeftIcon, ArrowRightIcon } from './Icons';

export function WorkProcessSection() {
  const [index, setIndex] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const step = WORK_PROCESS_STEPS[index];

  function select(next: number, focus = false) {
    setIndex(next);
    if (focus) tabs.current[next]?.focus();
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
              I use five steps to understand user needs, develop ideas, and test solutions.
            </p>
          </div>
        </div>
        <div
          role="tablist"
          aria-label="Design Thinking steps"
          className="flex flex-nowrap gap-3 overflow-x-auto pb-1"
        >
          {WORK_PROCESS_STEPS.map((item, i) => {
            const isSelected = i === index;
            return (
              <button
                key={item.title}
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
                    next = (i + 1) % WORK_PROCESS_STEPS.length;
                  if (event.key === 'ArrowLeft' || event.key === 'ArrowUp')
                    next = (i + WORK_PROCESS_STEPS.length - 1) % WORK_PROCESS_STEPS.length;
                  if (event.key === 'Home') next = 0;
                  if (event.key === 'End') next = WORK_PROCESS_STEPS.length - 1;
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
          aria-labelledby={`${id}-tab-${index}`}
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
              onClick={() => select(index - 1)}
              disabled={index === 0}
              className="icon-button"
            >
              <ArrowLeftIcon className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Next process step"
              onClick={() => select(index + 1)}
              disabled={index === WORK_PROCESS_STEPS.length - 1}
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
