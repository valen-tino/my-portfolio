import { useEffect, useState, type ReactNode } from 'react';
import { useInRouterContext, useNavigate } from 'react-router-dom';
import { SOCIAL_LINKS } from '../data/portfolioData';
import { navigateWithTransition } from '../utils/viewTransitions';
import { ArrowRightIcon, ArrowUpIcon } from './Icons';

function getBaliTimeString(): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Makassar',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date());
  } catch {
    return 'UTC+8';
  }
}

function RouterAwareFooterLink({
  to,
  className,
  children,
}: {
  to: string;
  className: string;
  children: ReactNode;
}) {
  const inRouter = useInRouterContext();
  if (!inRouter) {
    return (
      <a href={to} className={className}>
        {children}
      </a>
    );
  }
  return <InnerRouterFooterLink to={to} className={className}>{children}</InnerRouterFooterLink>;
}

function InnerRouterFooterLink({
  to,
  className,
  children,
}: {
  to: string;
  className: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <a
      href={to}
      className={className}
      onClick={(event) => {
        if (
          !event.metaKey &&
          !event.ctrlKey &&
          !event.shiftKey &&
          !event.altKey &&
          event.button === 0
        ) {
          event.preventDefault();
          if (to.startsWith('/#')) {
            const hashId = to.slice(2);
            const targetEl = document.getElementById(hashId);
            if (targetEl) {
              targetEl.scrollIntoView?.({ behavior: 'smooth' });
              navigate(to, { replace: true });
              return;
            }
          }
          navigateWithTransition(navigate, to);
          window.scrollTo?.({ top: 0 });
        }
      }}
    >
      {children}
    </a>
  );
}

const FOOTER_ROUTES = [
  { label: 'Home', to: '/' },
  { label: 'Selected Work', to: '/portfolio' },
  { label: 'Journal', to: '/blogs' },
  { label: 'About Me', to: '/#about' },
  { label: 'Contact', to: '/#contact' },
];

const SOCIAL_HOVER_ACCENTS: Record<string, string> = {
  Email: 'hover:border-brand-light hover:bg-brand-light hover:text-ink',
  GitHub: 'hover:border-mint hover:bg-mint hover:text-ink',
  LinkedIn: 'hover:border-orange hover:bg-orange hover:text-ink',
};

export function Footer() {
  const [baliTime, setBaliTime] = useState<string>(() => getBaliTimeString());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setBaliTime(getBaliTimeString());
    }, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const handleBackToTop = () => {
    const reduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo?.({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <footer className="bg-ink pt-16 pb-28 text-white">
      <div className="page-shell space-y-14">
        <div className="relative overflow-hidden bg-brand p-8 sm:p-12">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-xl">
              <h2 className="text-3xl font-medium tracking-[-0.04em] text-white sm:text-5xl">
                Let’s build something thoughtful together.
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <RouterAwareFooterLink
                to="/#contact"
                className="inline-flex min-h-12 items-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand transition-transform hover:-translate-y-0.5 focus-visible:outline-white"
              >
                Start a conversation
                <ArrowRightIcon className="size-4" />
              </RouterAwareFooterLink>
              <a
                href="mailto:valentinojehaut@gmail.com"
                className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/50 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-white hover:text-ink focus-visible:outline-white"
              >
                valentinojehaut@gmail.com
              </a>
            </div>
          </div>
          <div aria-hidden="true" className="mt-10 grid h-2 grid-cols-3 gap-2">
            <span className="rounded-full bg-mint" />
            <span className="rounded-full bg-orange" />
            <span className="rounded-full bg-pink" />
          </div>
        </div>

        <div className="grid gap-10 border-b border-white/15 pb-12 md:grid-cols-[1.4fr_1fr_1.2fr]">
          <div>
            <p className="text-2xl font-semibold tracking-tight text-white">
              Valentino Jehaut<span className="text-mint">.</span>
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-300">
              UI/UX designer &amp; full-stack product developer crafting fast, accessible web experiences.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1.5 text-xs text-muted-200">
              <span>Bali, Indonesia (WITA)</span>
              <span aria-hidden="true">·</span>
              <span className="font-medium tabular-nums text-white">{baliTime}</span>
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-400">
              Explore
            </h3>
            <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {FOOTER_ROUTES.map((item) => (
                <li key={item.to}>
                  <RouterAwareFooterLink
                    to={item.to}
                    className="inline-flex min-h-9 items-center text-muted-200 transition-colors hover:text-mint"
                  >
                    {item.label}
                  </RouterAwareFooterLink>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-400">
              Connect
            </h3>
            <div className="mt-5 flex flex-wrap gap-2.5">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target={link.url.startsWith('mailto:') ? undefined : '_blank'}
                  rel={link.url.startsWith('mailto:') ? undefined : 'noreferrer'}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-full border border-white/25 bg-white/5 px-4 py-2 text-xs font-medium text-white transition-colors ${
                    SOCIAL_HOVER_ACCENTS[link.name] || 'hover:border-white hover:bg-white hover:text-ink'
                  }`}
                >
                  <span>{link.name}</span>
                  <ArrowRightIcon className="size-3.5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 text-xs text-muted-300 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <p>© {new Date().getFullYear()} Valentino Jehaut</p>
            <span aria-hidden="true" className="text-white/30">/</span>
            <p>Designed &amp; engineered with React, TypeScript, Tailwind CSS &amp; GSAP.</p>
          </div>
          <button
            type="button"
            onClick={handleBackToTop}
            aria-label="Back to top"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/25 px-4 py-2 text-xs font-medium text-white transition-colors hover:border-mint hover:text-mint focus-visible:outline-white"
          >
            Back to top
            <ArrowUpIcon className="size-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
