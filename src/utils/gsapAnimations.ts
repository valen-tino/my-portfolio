import { useEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let pluginRegistered = false;

function ensureScrollTrigger(): void {
  if (pluginRegistered || typeof window === 'undefined') return;
  try {
    gsap.registerPlugin(ScrollTrigger);
    pluginRegistered = true;
  } catch {
    // Ignore registration errors in constrained environments
  }
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function isTestRuntime(): boolean {
  if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)) return true;
  if (typeof import.meta !== 'undefined' && Boolean((import.meta as { vitest?: unknown }).vitest)) {
    return true;
  }
  return typeof process !== 'undefined' && Boolean(process.env?.VITEST);
}

export function shouldSkipGSAPMotion(): boolean {
  return prefersReducedMotion() || isTestRuntime();
}

export interface ElementTransitionOptions {
  direction?: -1 | 0 | 1;
  y?: number;
  duration?: number;
  staggerSelector?: string;
}

/**
 * Animates panel/tab/filter state transitions using compositor-only transform and opacity properties.
 * Safely no-ops under `prefers-reduced-motion` or in JSDOM/Vitest test runtimes.
 */
export function animateElementTransition(
  element: HTMLElement | null,
  options: ElementTransitionOptions = {},
): void {
  if (!element || shouldSkipGSAPMotion()) return;

  const { direction = 0, y = 10, duration = 0.28, staggerSelector } = options;
  const xOffset = direction * 14;

  if (staggerSelector) {
    const items = element.querySelectorAll<HTMLElement>(staggerSelector);
    if (items.length > 0) {
      gsap.fromTo(
        items,
        { x: xOffset, y, opacity: 0 },
        {
          x: 0,
          y: 0,
          opacity: 1,
          duration,
          stagger: 0.035,
          ease: 'power2.out',
          overwrite: 'auto',
          clearProps: 'transform,opacity',
        },
      );
      return;
    }
  }

  gsap.fromTo(
    element,
    { x: xOffset, y, opacity: 0 },
    {
      x: 0,
      y: 0,
      opacity: 1,
      duration,
      ease: 'power2.out',
      overwrite: 'auto',
      clearProps: 'transform,opacity',
    },
  );
}

/**
 * Smoothly settles a newly loaded image into its 0px editorial frame without layout shift.
 */
export function animateImageReveal(imgEl: HTMLImageElement | null): void {
  if (!imgEl || shouldSkipGSAPMotion()) return;

  gsap.fromTo(
    imgEl,
    { scale: 1.03, opacity: 0 },
    {
      scale: 1,
      opacity: 1,
      duration: 0.4,
      ease: 'power2.out',
      overwrite: 'auto',
      clearProps: 'transform,opacity',
    },
  );
}

/**
 * Smoothly glides the floating table preview card along the vertical axis with GSAP.
 */
export function animateFloatingPreviewY(element: HTMLElement | null, targetY: number): void {
  if (!element || shouldSkipGSAPMotion()) return;

  gsap.to(element, {
    y: targetY,
    duration: 0.25,
    ease: 'power3.out',
    overwrite: 'auto',
  });
}

function attachCardInteractions(
  card: HTMLElement,
  cleanups: Array<() => void>,
): void {
  const img = card.querySelector<HTMLImageElement>('img');
  const cta = card.querySelector<HTMLElement>('.card-hover-cta');
  const arrow = cta?.querySelector<SVGElement>('svg') ?? null;

  const onEnter = () => {
    gsap.to(card, { y: -4, duration: 0.26, ease: 'power2.out', overwrite: 'auto' });
    if (img) {
      gsap.to(img, { scale: 1.035, duration: 0.45, ease: 'power2.out', overwrite: 'auto' });
    }
    if (cta) {
      gsap.to(cta, { scale: 1.02, duration: 0.24, ease: 'power2.out', overwrite: 'auto' });
    }
    if (arrow) {
      gsap.to(arrow, { x: 3, duration: 0.22, ease: 'power2.out', overwrite: 'auto' });
    }
  };

  const onLeave = () => {
    gsap.to(card, {
      y: 0,
      duration: 0.25,
      ease: 'power2.out',
      overwrite: 'auto',
      clearProps: 'transform',
    });
    if (img) {
      gsap.to(img, {
        scale: 1,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto',
        clearProps: 'transform',
      });
    }
    if (cta) {
      gsap.to(cta, {
        scale: 1,
        duration: 0.2,
        ease: 'power2.out',
        overwrite: 'auto',
        clearProps: 'transform',
      });
    }
    if (arrow) {
      gsap.to(arrow, {
        x: 0,
        duration: 0.2,
        ease: 'power2.out',
        overwrite: 'auto',
        clearProps: 'transform',
      });
    }
  };

  const onFocusOut = (event: FocusEvent) => {
    if (!card.contains(event.relatedTarget as Node | null)) {
      onLeave();
    }
  };

  card.addEventListener('pointerenter', onEnter);
  card.addEventListener('pointerleave', onLeave);
  card.addEventListener('focusin', onEnter);
  card.addEventListener('focusout', onFocusOut);

  cleanups.push(() => {
    card.removeEventListener('pointerenter', onEnter);
    card.removeEventListener('pointerleave', onLeave);
    card.removeEventListener('focusin', onEnter);
    card.removeEventListener('focusout', onFocusOut);
  });
}

function attachButtonInteractions(
  button: HTMLElement,
  cleanups: Array<() => void>,
): void {
  const arrow = button.querySelector<SVGElement>('svg');
  const isUpArrow = button.dataset.gsapArrow === 'up';

  const onEnter = () => {
    if (button.hasAttribute('disabled')) return;
    if (arrow) {
      gsap.to(arrow, {
        ...(isUpArrow ? { y: -3 } : { x: 3 }),
        duration: 0.2,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }
  };

  const onLeave = () => {
    if (arrow) {
      gsap.to(arrow, {
        x: 0,
        y: 0,
        duration: 0.2,
        ease: 'power2.out',
        overwrite: 'auto',
        clearProps: 'transform',
      });
    }
    gsap.to(button, {
      scale: 1,
      duration: 0.16,
      ease: 'power2.out',
      overwrite: 'auto',
      clearProps: 'transform',
    });
  };

  const onPointerDown = () => {
    if (button.hasAttribute('disabled')) return;
    gsap.to(button, { scale: 0.97, duration: 0.12, ease: 'power2.out', overwrite: 'auto' });
  };

  const onPointerUp = () => {
    if (button.hasAttribute('disabled')) return;
    gsap.to(button, {
      scale: 1,
      duration: 0.18,
      ease: 'power2.out',
      overwrite: 'auto',
      clearProps: 'transform',
    });
  };

  const onFocusOut = (event: FocusEvent) => {
    if (!button.contains(event.relatedTarget as Node | null)) {
      onLeave();
    }
  };

  button.addEventListener('pointerenter', onEnter);
  button.addEventListener('pointerleave', onLeave);
  button.addEventListener('pointerdown', onPointerDown);
  button.addEventListener('pointerup', onPointerUp);
  button.addEventListener('pointercancel', onPointerUp);
  button.addEventListener('focusin', onEnter);
  button.addEventListener('focusout', onFocusOut);

  cleanups.push(() => {
    button.removeEventListener('pointerenter', onEnter);
    button.removeEventListener('pointerleave', onLeave);
    button.removeEventListener('pointerdown', onPointerDown);
    button.removeEventListener('pointerup', onPointerUp);
    button.removeEventListener('pointercancel', onPointerUp);
    button.removeEventListener('focusin', onEnter);
    button.removeEventListener('focusout', onFocusOut);
  });
}

/**
 * Orchestrates hydration-safe hero entrance choreography, scroll-triggered section & child reveals,
 * metric count-ups, interactive card hover frames, and tactile pill button micro-interactions.
 */
export function useGSAPPageEntrance(
  scopeRef: RefObject<HTMLElement | null>,
  deps: readonly unknown[] = [],
): void {
  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope || shouldSkipGSAPMotion()) return;

    ensureScrollTrigger();

    const ctx = gsap.context(() => {
      const heroItems = Array.from(
        scope.querySelectorAll<HTMLElement>('[data-gsap="hero-item"]'),
      ).filter((el) => el.dataset.gsapAnimated !== 'true');

      if (heroItems.length > 0) {
        gsap.fromTo(
          heroItems,
          { y: 18, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
            onStart: () => {
              heroItems.forEach((el) => {
                el.dataset.gsapAnimated = 'true';
              });
            },
          },
        );
      }

      const revealSections = Array.from(
        scope.querySelectorAll<HTMLElement>('[data-gsap="reveal-section"]'),
      ).filter((el) => el.dataset.gsapAnimated !== 'true');

      revealSections.forEach((section) => {
        gsap.fromTo(
          section,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: 'power2.out',
            clearProps: 'transform,opacity',
            scrollTrigger: {
              trigger: section,
              start: 'top 88%',
              once: true,
            },
            onStart: () => {
              section.dataset.gsapAnimated = 'true';
            },
          },
        );

        const revealItems = Array.from(
          section.querySelectorAll<HTMLElement>('[data-gsap="reveal-item"]'),
        ).filter((el) => el.dataset.gsapAnimated !== 'true');

        if (revealItems.length > 0) {
          gsap.fromTo(
            revealItems,
            { y: 12, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.42,
              stagger: 0.04,
              ease: 'power3.out',
              clearProps: 'transform,opacity',
              scrollTrigger: {
                trigger: section,
                start: 'top 85%',
                once: true,
              },
              onStart: () => {
                revealItems.forEach((item) => {
                  item.dataset.gsapAnimated = 'true';
                });
              },
            },
          );
        }
      });

      const statEls = Array.from(
        scope.querySelectorAll<HTMLElement>('[data-gsap="stat-value"]'),
      ).filter((el) => el.dataset.gsapAnimated !== 'true');

      statEls.forEach((statEl) => {
        const rawText = (statEl.textContent || '').trim();
        const match = rawText.match(/^(\d+)(.*)$/);
        if (!match) return;
        const digits = match[1];
        const suffix = match[2] || '';
        const target = Number(digits);
        if (!Number.isFinite(target) || target <= 0) return;
        const padLength = digits.startsWith('0') && digits.length > 1 ? digits.length : 0;
        const counter = { val: 0 };

        gsap.to(counter, {
          val: target,
          duration: 0.85,
          ease: 'power2.out',
          snap: { val: 1 },
          scrollTrigger: {
            trigger: statEl,
            start: 'top 90%',
            once: true,
          },
          onStart: () => {
            statEl.dataset.gsapAnimated = 'true';
          },
          onUpdate: () => {
            const current = Math.round(counter.val);
            const formatted =
              padLength > 0 ? String(current).padStart(padLength, '0') : String(current);
            statEl.textContent = `${formatted}${suffix}`;
          },
          onComplete: () => {
            statEl.textContent = rawText;
          },
        });
      });
    }, scope);

    if (pluginRegistered && typeof ScrollTrigger.refresh === 'function') {
      ScrollTrigger.refresh();
    }

    const interactiveCleanups: Array<() => void> = [];
    scope.querySelectorAll<HTMLElement>('[data-gsap="card-interactive"]').forEach((card) => {
      attachCardInteractions(card, interactiveCleanups);
    });

    scope
      .querySelectorAll<HTMLElement>('.flat-button, .text-link, .icon-button')
      .forEach((button) => {
        attachButtonInteractions(button, interactiveCleanups);
      });

    return () => {
      interactiveCleanups.forEach((fn) => fn());
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
