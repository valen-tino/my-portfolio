import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { LoadingScreen } from '../src/components/LoadingScreen';
import { resolveApiBaseUrl } from '../src/services/api';

describe('LoadingScreen', () => {
  afterEach(() => {
    vi.useRealTimers();
    document.querySelectorAll('meta[name="theme-color"]').forEach((el) => el.remove());
  });

  it('renders a brand-blue fullscreen overlay with centered /favicon.ico and ease-in-out CSS transition when loading', () => {
    render(<LoadingScreen isLoading={true} />);

    const overlay = screen.getByTestId('loading-screen');
    expect(overlay).toHaveClass('bg-brand');
    expect(overlay).toHaveClass('transition-opacity');
    expect(overlay).toHaveClass('ease-in-out');
    expect(overlay).toHaveClass('opacity-100');
    expect(overlay).toHaveAttribute('aria-hidden', 'false');
    expect(overlay).toHaveAttribute('role', 'status');

    const img = overlay.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/favicon.ico');
    expect(img).toHaveClass('ease-in-out');
  });

  it('transitions to opacity-0 pointer-events-none and aria-hidden="true" when loading finishes', () => {
    const { rerender } = render(<LoadingScreen isLoading={true} />);
    const overlay = screen.getByTestId('loading-screen');
    expect(overlay).toHaveClass('opacity-100');

    rerender(<LoadingScreen isLoading={false} />);
    expect(overlay).toHaveClass('opacity-0');
    expect(overlay).toHaveClass('pointer-events-none');
    expect(overlay).toHaveAttribute('aria-hidden', 'true');
  });

  it('unmounts the fixed brand-blue overlay after fade-out completes and syncs light theme-color', () => {
    vi.useFakeTimers();
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    meta.setAttribute('content', '#f8f8fa');
    document.head.appendChild(meta);

    const { rerender } = render(<LoadingScreen isLoading={true} />);
    const overlay = screen.getByTestId('loading-screen');

    rerender(<LoadingScreen isLoading={false} />);
    expect(screen.getByTestId('loading-screen')).toBeInTheDocument();

    fireEvent.transitionEnd(overlay);
    expect(screen.queryByTestId('loading-screen')).not.toBeInTheDocument();
    expect(meta.getAttribute('content')).toBe('#f8f8fa');

    // Also unmounts via fallback timer when transitionEnd is skipped (e.g. reduced motion)
    rerender(<LoadingScreen isLoading={true} />);
    expect(screen.getByTestId('loading-screen')).toBeInTheDocument();

    rerender(<LoadingScreen isLoading={false} />);
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(screen.queryByTestId('loading-screen')).not.toBeInTheDocument();
  });

  it('does not mount the overlay when rendered initially with isLoading={false}', () => {
    render(<LoadingScreen isLoading={false} />);
    expect(screen.queryByTestId('loading-screen')).not.toBeInTheDocument();
  });
});

describe('resolveApiBaseUrl', () => {
  it('forces relative /api in production builds even when VITE_APP_ENV=development and localhost dev URL exist', () => {
    expect(
      resolveApiBaseUrl({
        isProd: true,
        viteAppEnv: 'development',
        viteApiUrlDev: 'http://localhost:5001/api',
        hostname: 'my-portfolio.vercel.app',
      })
    ).toBe('/api');
  });

  it('ignores placeholder vercel URLs and resolves to /api', () => {
    expect(
      resolveApiBaseUrl({
        isProd: true,
        viteAppEnv: 'production',
        viteApiUrl: 'https://your-portfolio.vercel.app/api',
        viteApiUrlProd: 'https://your-portfolio.vercel.app/api',
        hostname: 'my-portfolio.vercel.app',
      })
    ).toBe('/api');
  });

  it('ignores localhost API URLs when accessed from non-localhost hostnames such as iPhone LAN preview', () => {
    expect(
      resolveApiBaseUrl({
        isProd: false,
        viteAppEnv: 'development',
        viteApiUrlDev: 'http://localhost:5001/api',
        hostname: '192.168.100.42',
      })
    ).toBe('/api');

    expect(
      resolveApiBaseUrl({
        isProd: false,
        viteAppEnv: 'development',
        viteApiUrlDev: 'http://localhost:5001/api',
        hostname: 'localhost',
      })
    ).toBe('http://localhost:5001/api');
  });
});

