import { createRequire } from 'node:module';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { CMSStorage } from '../src/cms/apiStorage';
import { HeroProjectStrip } from '../src/components/HeroProjectStrip';
import apiService from '../src/services/api';
import type { Project } from '../src/types/portfolio';
import {
  fetchWithCMSCache,
  invalidateCMSCache,
  peekCMSCache,
  setCMSCache,
  setCMSCacheTestMode,
} from '../src/utils/cmsCache';
import {
  buildCloudinarySrcSet,
  enhanceRichHtmlMedia,
  optimizeCloudinaryImageUrl,
} from '../src/utils/contentMigration';
import {
  animateElementTransition,
  animateFloatingPreviewY,
  animateImageReveal,
} from '../src/utils/gsapAnimations';

const require = createRequire(import.meta.url);
const responseCache = require('../server/utils/responseCache');

describe('Client SWR Cache, Cloudinary Optimization, Server Cache & GSAP Guards', () => {
  beforeEach(() => {
    window.localStorage.clear();
    setCMSCacheTestMode(true);
  });

  afterEach(() => {
    invalidateCMSCache();
    setCMSCacheTestMode(false);
    vi.restoreAllMocks();
  });

  it('deduplicates concurrent in-flight requests and persists across memory clear via localStorage', async () => {
    const fetcher = vi.fn().mockResolvedValue({ name: 'Valen', cached: true });

    const [first, second] = await Promise.all([
      fetchWithCMSCache('about', fetcher),
      fetchWithCMSCache('about', fetcher),
    ]);

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(first).toEqual({ name: 'Valen', cached: true });
    expect(second).toEqual({ name: 'Valen', cached: true });

    // Confirm localStorage persistence
    const rawStored = window.localStorage.getItem('portfolio_cms_cache_v1:about');
    expect(rawStored).toContain('"cached":true');

    // Simulate page reload by clearing in-memory cache (re-enabling test mode clears memory map)
    setCMSCacheTestMode(true);
    const hydrated = peekCMSCache<{ name: string; cached: boolean }>('about');
    expect(hydrated?.data).toEqual({ name: 'Valen', cached: true });
    expect(hydrated?.isFresh).toBe(true);
  });

  it('serves stale cache immediately while revalidating in background and supports prefix invalidation', async () => {
    setCMSCache('portfolio:list', [{ id: '1', title: 'Stale Project' }]);
    setCMSCache('about', { name: 'Keep Me' });

    const revalidateFetcher = vi
      .fn()
      .mockResolvedValue([{ id: '1', title: 'Fresh LayerBase Project' }]);

    // Force stale check via freshTtlMs: -1
    const immediate = await fetchWithCMSCache('portfolio:list', revalidateFetcher, {
      freshTtlMs: -1,
    });

    expect(immediate).toEqual([{ id: '1', title: 'Stale Project' }]);
    expect(revalidateFetcher).toHaveBeenCalledTimes(1);

    await vi.waitFor(() => {
      expect(peekCMSCache('portfolio:list')?.data).toEqual([
        { id: '1', title: 'Fresh LayerBase Project' },
      ]);
    });

    invalidateCMSCache('portfolio');
    expect(peekCMSCache('portfolio:list')).toBeNull();
    expect(peekCMSCache('about')?.data).toEqual({ name: 'Keep Me' });
  });

  it('optimizes Cloudinary image URLs and generates srcSet without mutating local assets', () => {
    const cloudinaryUrl = 'https://res.cloudinary.com/demo/image/upload/v1234/sample.jpg';
    const localUrl = '/images/portfolios/bcs.png';

    expect(optimizeCloudinaryImageUrl(cloudinaryUrl, { width: 800 })).toBe(
      'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_800/v1234/sample.jpg',
    );
    expect(optimizeCloudinaryImageUrl(localUrl, { width: 800 })).toBe(localUrl);

    const srcSet = buildCloudinarySrcSet(cloudinaryUrl, [400, 800]);
    expect(srcSet).toContain('f_auto,q_auto,c_limit,w_400/v1234/sample.jpg 400w');
    expect(srcSet).toContain('f_auto,q_auto,c_limit,w_800/v1234/sample.jpg 800w');
    expect(buildCloudinarySrcSet(localUrl)).toBeUndefined();

    const enhancedHtml = enhanceRichHtmlMedia('<p>Text</p><img src="https://example.com/a.jpg" alt="A" />');
    expect(enhancedHtml).toContain('loading="lazy"');
    expect(enhancedHtml).toContain('decoding="async"');
  });

  it('prioritizes first primary HeroProjectStrip image and lazy-loads off-screen and cloned slides', () => {
    const projects: Project[] = Array.from({ length: 4 }, (_, index) => ({
      id: `p-${index + 1}`,
      slug: `p-${index + 1}`,
      title: `Project ${index + 1}`,
      year: '2026',
      roles: ['UI/UX'],
      tags: ['React'],
      description: 'Desc',
      imageURL: `https://res.cloudinary.com/demo/image/upload/p-${index + 1}.jpg`,
      isPublished: true,
      isPasswordProtected: false,
    }));

    render(<HeroProjectStrip projects={projects} />);

    const region = screen.getByRole('region', { name: 'Project previews' });
    const firstSlideImgs = within(region).getAllByRole('img', { name: 'Project 1' });
    const fourthSlideImgs = within(region).getAllByRole('img', { name: 'Project 4' });

    // Primary slide 1 has fetchpriority="high"; cloned copies have loading="lazy" + fetchpriority="low"
    const hasHighPriorityPrimary = firstSlideImgs.some(
      (img) => img.getAttribute('fetchpriority') === 'high' && !img.hasAttribute('loading'),
    );
    expect(hasHighPriorityPrimary).toBe(true);

    // Slide 4 (index 3) and all clones use lazy loading + low fetch priority
    fourthSlideImgs.forEach((img) => {
      expect(img).toHaveAttribute('loading', 'lazy');
      expect(img).toHaveAttribute('fetchpriority', 'low');
    });
  });

  it('supports execLean, Cache-Control headers, and server in-memory response caching', async () => {
    const plainQuery = Promise.resolve([{ title: 'Plain Mock' }]);
    const mongooseLikeQuery = {
      lean: vi.fn().mockResolvedValue([{ title: 'Lean Doc' }]),
    };

    await expect(responseCache.execLean(plainQuery)).resolves.toEqual([{ title: 'Plain Mock' }]);
    await expect(responseCache.execLean(mongooseLikeQuery)).resolves.toEqual([{ title: 'Lean Doc' }]);
    expect(mongooseLikeQuery.lean).toHaveBeenCalledTimes(1);

    const headers: Record<string, string> = {};
    const mockRes = {
      setHeader: (k: string, v: string) => {
        headers[k] = v;
      },
    };
    responseCache.setPublicCacheHeaders(mockRes, 60, 300, 600, { headers: {} });
    expect(headers['Cache-Control']).toBe(
      'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
    );

    responseCache.setPublicCacheHeaders(mockRes, 60, 300, 600, {
      headers: { authorization: 'Bearer token' },
    });
    expect(headers['Cache-Control']).toBe('private, no-cache');

    responseCache.setCachedResponse('portfolio:list:pub', { success: true, data: [1] }, 60_000, {
      forceEnableInTest: true,
    });
    expect(
      responseCache.getCachedResponse('portfolio:list:pub', { forceEnableInTest: true }),
    ).toEqual({ success: true, data: [1] });
    responseCache.invalidateServerCache('portfolio:');
    expect(
      responseCache.getCachedResponse('portfolio:list:pub', { forceEnableInTest: true }),
    ).toBeNull();
  });

  it('safely guards GSAP micro-interaction helpers in test/reduced-motion environments', () => {
    const el = document.createElement('div');
    const img = document.createElement('img');

    expect(() => animateElementTransition(el, { direction: 1, staggerSelector: 'article' })).not.toThrow();
    expect(() => animateImageReveal(img)).not.toThrow();
    expect(() => animateFloatingPreviewY(el, 120)).not.toThrow();
    expect(el.style.opacity).toBe('');
  });

  it('deduplicates CMSStorage.getAbout calls, exposes peekCachedAbout, and invalidates on updateAbout', async () => {
    const getAboutSpy = vi.spyOn(apiService, 'getAbout').mockResolvedValue({
      success: true,
      data: {
        description: 'Cached bio from LayerBase',
        imageURL: 'https://res.cloudinary.com/demo/image/upload/me.jpg',
      },
    });
    const updateAboutSpy = vi.spyOn(apiService, 'updateAbout').mockResolvedValue({
      success: true,
      data: {},
    });

    const [first, second] = await Promise.all([CMSStorage.getAbout(), CMSStorage.getAbout()]);
    expect(getAboutSpy).toHaveBeenCalledTimes(1);
    expect(first.description).toBe('Cached bio from LayerBase');
    expect(second.description).toBe('Cached bio from LayerBase');
    expect(CMSStorage.peekCachedAbout()?.description).toBe('Cached bio from LayerBase');

    await CMSStorage.updateAbout({
      description: 'Updated bio',
      imageURL: 'https://res.cloudinary.com/demo/image/upload/me.jpg',
    });
    expect(updateAboutSpy).toHaveBeenCalledTimes(1);
    expect(CMSStorage.peekCachedAbout()).toBeNull();
  });
});
