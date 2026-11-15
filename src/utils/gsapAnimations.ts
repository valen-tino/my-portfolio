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

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isTestRuntime(): boolean {
  if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)) return true;
  return typeof import.meta !== 'undefined' && Boolean((import.meta as { vitest?: unknown }).vitest);
}

/**
 * Animates `[data-gsap="hero-item"]` entrance choreography, `[data-gsap="reveal-section"]`
 * scroll reveals, and `[data-gsap="card-interactive"]` micro-interactions using GSAP while
 * leaving all elements visible if reduced motion is enabled or when running inside JSDOM.
 */
export function useGSAPPageEntrance(
  scopeRef: RefObject<HTMLElement | null>,
  deps: readonly unknown[] = [],
): void {
  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope || prefersReducedMotion() || isTestRuntime()) return;

    ensureScrollTrigger();

    const ctx = gsap.context(() => {
      const heroItems = scope.querySelectorAll<HTMLElement>('[data-gsap="hero-item"]');
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
          },
        );
      }

      const revealSections = scope.querySelectorAll<HTMLElement>('[data-gsap="reveal-section"]');
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
          },
        );
      });
    }, scope);

    const interactiveCleanups: Array<() => void> = [];
    const cards = scope.querySelectorAll<HTMLElement>('[data-gsap="card-interactive"]');
    cards.forEach((card) => {
      const onEnter = () => {
        gsap.to(card, { y: -4, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
      };
      const onLeave = () => {
        gsap.to(card, { y: 0, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
      };
      card.addEventListener('pointerenter', onEnter);
      card.addEventListener('pointerleave', onLeave);
      interactiveCleanups.push(() => {
        card.removeEventListener('pointerenter', onEnter);
        card.removeEventListener('pointerleave', onLeave);
      });
    });

    return () => {
      interactiveCleanups.forEach((fn) => fn());
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

