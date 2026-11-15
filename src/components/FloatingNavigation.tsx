import { useEffect, useId, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { PageView } from '../types/portfolio';
import { navigateWithTransition } from '../utils/viewTransitions';
import { CloseIcon, DownloadIcon, MenuIcon } from './Icons';

interface Props {
  currentPage?: PageView;
  section?: string;
  onOpenCVModal: () => void;
  preview?: boolean;
}

function resolvePageFromPath(pathname: string): PageView {
  if (pathname.startsWith('/portfolio/')) return 'portfolio-detail';
  if (pathname.startsWith('/portfolio')) return 'portfolio';
  if (pathname.startsWith('/blogs/') || pathname.startsWith('/blog/')) return 'blog-detail';
  if (pathname.startsWith('/blogs') || pathname.startsWith('/blog')) return 'blog';
  if (pathname.startsWith('/design-system')) return 'design-system';
  return 'home';
}

export function FloatingNavigation({
  currentPage: propPage,
  section: propSection,
  onOpenCVModal,
  preview = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const more = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const location = useLocation();
  const navigate = useNavigate();

  const currentPage = propPage ?? resolvePageFromPath(location.pathname);
  const hashSection = location.hash ? location.hash.replace('#', '') : undefined;
  const activeSection = propSection ?? hashSection;

  useEffect(() => {
    if (preview || typeof window === 'undefined' || !window.visualViewport) return;
    const viewport = window.visualViewport;
    const update = () => {
      const offset =
        viewport.scale === 1
          ? Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
          : 0;
      document.documentElement.style.setProperty('--dock-keyboard-offset', `${offset}px`);
    };
    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);
    update();
    return () => {
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
      document.documentElement.style.removeProperty('--dock-keyboard-offset');
    };
  }, [preview]);

  const homeSection = currentPage === 'home' ? activeSection : undefined;

  const items: Array<{
    label: string;
    href: string;
    sectionId?: string;
    active: boolean;
    compact: boolean;
  }> = [
    {
      label: 'Home',
      href: '/',
      active: currentPage === 'home' && !['about', 'contact'].includes(homeSection ?? ''),
      compact: true,
    },
    {
      label: 'About',
      href: '/#about',
      sectionId: 'about',
      active: homeSection === 'about',
      compact: false,
    },
    {
      label: 'Work',
      href: '/portfolio',
      active: currentPage.startsWith('portfolio'),
      compact: true,
    },
    {
      label: 'Journal',
      href: '/blogs',
      active: currentPage.startsWith('blog'),
      compact: false,
    },
    {
      label: 'Contact',
      href: '/#contact',
      sectionId: 'contact',
      active: homeSection === 'contact',
      compact: true,
    },
  ];

  useEffect(() => {
    setOpen(false);
  }, [currentPage, activeSection, location.pathname, location.hash]);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) {
        setOpen(false);
        if (root.current?.contains(document.activeElement)) more.current?.focus();
      }
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(min-width: 900px)');
    const close = () => {
      if (query.matches) setOpen(false);
    };
    query.addEventListener?.('change', close);
    return () => query.removeEventListener?.('change', close);
  }, []);

  const handleLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    item: (typeof items)[number],
  ) => {
    setOpen(false);
    if (preview) {
      event.preventDefault();
      return;
    }
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }
    event.preventDefault();

    if (item.sectionId) {
      if (location.pathname === '/') {
        const el = document.getElementById(item.sectionId);
        if (el && typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({ behavior: 'smooth' });
        }
        navigate(`/#${item.sectionId}`, { replace: true });
      } else {
        navigateWithTransition(navigate, `/#${item.sectionId}`);
      }
      return;
    }

    navigateWithTransition(navigate, item.href);
    window.scrollTo?.({ top: 0 });
  };

  const renderLink = (item: (typeof items)[number], extra = '') => (
    <a
      key={item.label}
      href={item.href}
      onClick={(event) => handleLinkClick(event, item)}
      aria-current={
        item.active
          ? item.label === 'About' || item.label === 'Contact'
            ? 'location'
            : 'page'
          : undefined
      }
      className={`dock-item ${item.active ? 'dock-item-active' : ''} ${extra}`}
    >
      {item.label}
    </a>
  );

  return (
    <div
      ref={root}
      className={
        preview
          ? 'relative w-fit max-w-full'
          : 'fixed inset-x-0 bottom-[calc(1rem+env(safe-area-inset-bottom)+var(--dock-keyboard-offset,0px))] z-40 mx-auto w-fit max-w-[calc(100%-1.5rem)]'
      }
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.preventDefault();
          setOpen(false);
          more.current?.focus();
        }
      }}
    >
      <nav aria-label={preview ? 'Example' : 'Primary'} className="dock-surface">
        {items.map((item) =>
          renderLink(
            item,
            item.compact ? 'px-2.5 min-[900px]:px-4' : 'hidden min-[900px]:inline-flex',
          ),
        )}
        <button
          type="button"
          onClick={onOpenCVModal}
          className="dock-item dock-item-primary hidden min-[900px]:inline-flex"
        >
          <DownloadIcon className="size-4" />
          Résumé
        </button>
        <button
          ref={more}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen(!open)}
          className={`dock-item px-2.5 min-[900px]:hidden ${items.some((item) => item.active && !item.compact) ? 'dock-item-active' : ''}`}
        >
          {open ? <CloseIcon className="size-4" /> : <MenuIcon className="size-4" />} More
        </button>
      </nav>
      {/* Remains mounted while the résumé dialog is open, preserving its return-focus target. */}
      <div
        id={panelId}
        hidden={!open}
        className="absolute bottom-[calc(100%+0.75rem)] right-0 max-h-[max(3rem,min(65dvh,calc(100dvh-7rem-var(--dock-keyboard-offset,0px))))] w-64 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-3xl border border-muted-300 bg-white p-3 min-[900px]:hidden"
      >
        <nav aria-label={preview ? 'Example extra' : 'More'} className="grid gap-1">
          {items.filter((item) => !item.compact).map((item) => renderLink(item, 'justify-start'))}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onOpenCVModal();
            }}
            className="dock-item justify-start"
          >
            <DownloadIcon className="size-4" />
            View résumé
          </button>
        </nav>
      </div>
    </div>
  );
}
