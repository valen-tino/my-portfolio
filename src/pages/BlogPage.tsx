import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CMSStorage } from '../cms/apiStorage';
import { BlogCard } from '../components/BlogCard';
import { Footer } from '../components/Footer';
import { CloseIcon, SearchIcon } from '../components/Icons';
import { BlogCardSkeletonGrid, FilterBarSkeleton } from '../components/Skeleton';
import { BLOG_POSTS, mapCMSBlogToPost } from '../data/portfolioData';
import type { BlogPost } from '../types/portfolio';
import { animateElementTransition, useGSAPPageEntrance } from '../utils/gsapAnimations';
import { navigateWithTransition } from '../utils/viewTransitions';

export default function BlogPage() {
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const didMountFilterRef = useRef(false);

  const cachedBlogs =
    typeof CMSStorage.peekCachedBlogs === 'function'
      ? CMSStorage.peekCachedBlogs(true)
      : null;

  const [posts, setPosts] = useState<BlogPost[]>(() =>
    cachedBlogs
      ? cachedBlogs.filter((item) => item.isPublished !== false).map(mapCMSBlogToPost)
      : [],
  );
  const [loading, setLoading] = useState(!cachedBlogs);
  const [category, setCategory] = useState('All');
  const [year, setYear] = useState('All');
  const [tag, setTag] = useState('All');
  const [query, setQuery] = useState('');

  useGSAPPageEntrance(rootRef, [posts.length, loading]);

  useEffect(() => {
    if (!didMountFilterRef.current) {
      didMountFilterRef.current = true;
      return;
    }
    if (loading) return;
    animateElementTransition(resultsRef.current, {
      y: 10,
      duration: 0.25,
      staggerSelector: 'article',
    });
  }, [category, year, tag, loading]);

  useEffect(() => {
    let active = true;
    async function loadBlogs() {
      try {
        const items = await CMSStorage.getBlogs(true);
        if (!active) return;
        const published = items
          .filter((item) => item.isPublished !== false)
          .map(mapCMSBlogToPost);
        setPosts(published);
      } catch {
        if (active) {
          setPosts(BLOG_POSTS);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    loadBlogs();
    return () => {
      active = false;
    };
  }, []);

  const tags = useMemo(
    () => [...new Set(posts.flatMap((post) => post.tags))],
    [posts],
  );
  const categories = useMemo(
    () => ['All', ...new Set(posts.map((post) => post.category))],
    [posts],
  );
  const years = useMemo(
    () => [...new Set(posts.map((post) => post.date.slice(0, 4)).filter(Boolean))].sort().reverse(),
    [posts],
  );

  const results = useMemo(
    () =>
      posts.filter(
        (post) =>
          (category === 'All' || post.category === category) &&
          (year === 'All' || post.date.startsWith(year)) &&
          (tag === 'All' || post.tags.includes(tag)) &&
          `${post.title} ${post.excerpt} ${post.tags.join(' ')}`
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
      ),
    [posts, category, year, tag, query],
  );

  const reset = () => {
    setCategory('All');
    setYear('All');
    setTag('All');
    setQuery('');
  };

  const activeFilters = category !== 'All' || year !== 'All' || tag !== 'All' || query !== '';

  return (
    <div ref={rootRef} className="min-h-screen bg-white text-ink">
      <main className="page-shell py-16 sm:py-24">
        <div data-gsap="hero-item" className="mb-14 space-y-6">
          <h1 className="text-6xl font-medium leading-[1.02] tracking-[-0.065em] sm:text-8xl">
            My <span className="text-brand">journal</span>
          </h1>
          <p className="max-w-sm text-base leading-relaxed text-muted-600">
            I write about design, events, and what I learn from my work.
          </p>
        </div>

        {loading ? (
          <FilterBarSkeleton />
        ) : (
          <search aria-label="Filter articles" className="mb-10 block bg-paper p-5 sm:p-7">
          <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-3">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
                className={`flex min-h-11 items-center gap-4 rounded-full border px-4 py-2 text-sm focus-visible:outline-brand ${category === item
                    ? 'border-brand bg-brand text-white'
                    : 'border-muted-400 hover:border-ink'
                  }`}
              >
                {item}
                <span className="text-xs tabular-nums">
                  {item === 'All'
                    ? posts.length
                    : posts.filter((post) => post.category === item).length}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-[2fr_1fr_1fr]">
            <div>
              <label htmlFor="article-search" className="mb-2 block text-xs font-medium">
                Search articles
              </label>
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-4 top-4 size-4 text-muted-600" />
                <input
                  id="article-search"
                  name="q"
                  type="search"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  enterKeyHint="search"
                  className="field pl-11 pr-12"
                  placeholder="Article title or topic"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Clear article search"
                    className="absolute right-0 top-0 flex size-12 items-center justify-center rounded-full"
                  >
                    <CloseIcon className="size-4" />
                  </button>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="article-year" className="mb-2 block text-xs font-medium">
                Year
              </label>
              <select
                id="article-year"
                name="year"
                className="field"
                value={year}
                onChange={(event) => setYear(event.target.value)}
              >
                <option value="All">All years</option>
                {years.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="article-tag" className="mb-2 block text-xs font-medium">
                Topic
              </label>
              <select
                id="article-tag"
                name="tag"
                className="field"
                value={tag}
                onChange={(event) => setTag(event.target.value)}
              >
                <option value="All">All topics</option>
                {tags.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </search>
        )}

        {!loading && (
          <div className="mb-8 flex items-center justify-between gap-4">
            <p role="status" className="text-xs tabular-nums text-muted-600">
              {results.length} {results.length === 1 ? 'article' : 'articles'}
            </p>
            {activeFilters && (
              <button type="button" className="text-link" onClick={reset}>
                Clear filters
              </button>
            )}
          </div>
        )}

        <div ref={resultsRef}>
        {loading ? (
          <BlogCardSkeletonGrid count={6} />
        ) : results.length ? (
          <div className="grid gap-x-7 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
            {results.map((post) => (
              <BlogCard
                key={post.id}
                post={post}
                onSelectPost={(selected) =>
                  navigateWithTransition(navigate, `/blogs/${selected.slug || selected.id}`)
                }
              />
            ))}
          </div>
        ) : (
          <div className="bg-paper px-6 py-16">
            <h2 className="text-2xl font-medium">
              No articles {query ? `for “${query}”` : 'match these filters'}.
            </h2>
            <p className="mt-3 text-sm text-muted-600">
              Try a different topic or clear the filters to see all articles.
            </p>
            <button type="button" onClick={reset} className="flat-button flat-button-blue mt-6">
              Show all articles
            </button>
          </div>
        )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
