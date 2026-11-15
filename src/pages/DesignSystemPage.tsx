import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BlogCard } from '../components/BlogCard';
import { FloatingNavigation } from '../components/FloatingNavigation';
import { Footer } from '../components/Footer';
import { ArrowRightIcon, CheckIcon } from '../components/Icons';
import { ProjectCard } from '../components/ProjectCard';
import { BLOG_POSTS, PROJECTS } from '../data/portfolioData';

interface DesignSystemPageProps {
  onOpenCVModal?: () => void;
}

const COLORS = [
  {
    name: 'Primary blue',
    value: '#2563EB',
    token: 'brand',
    usage: 'Primary actions & large fields',
  },
  { name: 'Sky blue', value: '#4CA7F8', token: 'brand-light', usage: 'Supporting graphics' },
  { name: 'Blue tint', value: '#BCE4FC', token: 'brand-tint', usage: 'Secondary surfaces' },
  { name: 'Mint', value: '#6EC98E', token: 'mint', usage: 'Process markers' },
  { name: 'Magenta', value: '#EB54A7', token: 'pink', usage: 'Process markers' },
  { name: 'Tangerine', value: '#F19E38', token: 'orange', usage: 'Process markers' },
  { name: 'Ink', value: '#0F172A', token: 'ink', usage: 'Text & dark surfaces' },
  { name: 'Paper', value: '#F8F8FA', token: 'paper', usage: 'Quiet background fields' },
];

interface DesignReference {
  name: string;
  url: string;
  description: string;
}

const DESIGN_REFERENCES: readonly DesignReference[] = [
  {
    name: 'Daniella Marynova',
    url: 'https://hellodani.co/?ref=killerportfolio',
    description:
      'Warm minimal typography, spacious layout pacing, and clear product design case study framing.',
  },
  {
    name: 'Marijana Pavlinić',
    url: 'https://marijanapav.com/',
    description:
      'Minimalist typographic index table, grid/list view switching, and quiet hover project previews.',
  },
  {
    name: 'Pentagram',
    url: 'https://www.pentagram.com',
    description: 'Clear navigation and large, rectangular project images.',
  },
  {
    name: 'Studio Lenzing',
    url: 'https://www.studiolenzing.com',
    description: 'Simple navigation, clear headings, and layouts with columns of different sizes.',
  },
  {
    name: 'It’s Nice That',
    url: 'https://www.itsnicethat.com',
    description: 'Articles with flat image areas and clear captions.',
  },
];

export default function DesignSystemPage({ onOpenCVModal }: DesignSystemPageProps) {
  const navigate = useNavigate();
  const [status, setStatus] = useState('');
  const [preview, setPreview] = useState('I design and build digital products.');
  const [weight, setWeight] = useState(500);
  const [size, setSize] = useState(48);
  const [grid, setGrid] = useState(false);

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setStatus(`Copied ${value}.`);
    } catch {
      setStatus(`Clipboard unavailable. Select and copy this value: ${value}`);
    }
  }

  return (
    <div className="min-h-screen bg-white text-ink">
      <main className="page-shell py-16 sm:py-24">
        <div className="space-y-6">
          <h1 className="text-6xl font-medium leading-[1.02] tracking-[-0.065em] sm:text-8xl">
            Design system
          </h1>
          <div className="space-y-4">
            <p className="max-w-md text-base leading-relaxed text-muted-600">
              These rules explain the colors, text styles, layouts, and controls used on this website.
            </p>
            <Link to="/" className="text-link mt-5">
              View the homepage <ArrowRightIcon className="size-4" />
            </Link>
          </div>
        </div>

        <nav
          aria-label="Design system contents"
          className="my-12 flex flex-wrap gap-x-8 gap-y-2 border-y border-muted-300 py-3"
        >
          {['Principles', 'Color', 'Typography', 'Components', 'Geometry', 'References'].map(
            (label, index) => (
              <a
                href={`#ds-${label.toLowerCase()}`}
                className="inline-flex min-h-11 items-center gap-3 text-sm hover:text-brand"
                key={label}
              >
                <span className="text-xs tabular-nums text-muted-600">0{index + 1}</span>
                {label}
              </a>
            ),
          )}
        </nav>

        <section id="ds-principles" className="py-8 sm:py-12" aria-labelledby="principles-heading">
          <h2 id="principles-heading" className="section-title">
            Design rules
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              [
                'Use flat layouts.',
                'Use solid colors and flat content panels. Use rounded controls to make actions clear.',
              ],
              [
                'Use clear text styles.',
                'Use one font family. Make headings clear and leave enough space between content groups.',
              ],
              [
                'Keep content clear.',
                'Show full titles and working links. Keep important actions visible without a mouse.',
              ],
            ].map(([title, text]) => (
              <div key={title}>
                <h3 className="text-xl font-medium tracking-tight">{title}</h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-600">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="ds-color" className="py-12 sm:py-16" aria-labelledby="color-heading">
          <div className="space-y-6">
            <h2 id="color-heading" className="section-title">
              Colors
            </h2>
            <p className="max-w-sm text-sm leading-relaxed text-muted-600">
              Use blue for main actions. Use white text on primary blue or ink backgrounds. Use dark
              text on light colors.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-4">
            {COLORS.map((color) => (
              <div key={color.token} className="text-left">
                <span
                  className="mb-4 flex aspect-[4/3] items-end p-4 outline outline-1 -outline-offset-1 outline-black/10"
                  style={{ backgroundColor: color.value }}
                >
                  <span
                    className={`section-label ${['brand', 'ink'].includes(color.token) ? 'text-white' : 'text-ink'}`}
                  >
                    Aa
                  </span>
                </span>
                <span className="flex flex-wrap justify-between gap-2 text-sm font-medium">
                  <span>{color.name}</span>
                  <span className="text-xs">{color.value}</span>
                </span>
                <span className="mt-2 block text-xs leading-relaxed text-muted-600">
                  {color.usage}
                </span>
                <button
                  type="button"
                  onClick={() => copy(color.value)}
                  aria-label={`Copy ${color.name}: ${color.value}`}
                  className="text-link mt-4"
                >
                  Copy color
                </button>
              </div>
            ))}
          </div>
          <p role="status" className="mt-5 min-h-6 text-sm text-brand">
            {status}
          </p>
        </section>

        <section id="ds-typography" className="py-12 sm:py-16" aria-labelledby="type-heading">
          <h2 id="type-heading" className="section-title">
            Plus Jakarta Sans.
          </h2>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-600">
            Use Plus Jakarta Sans throughout the website. Use medium weight for headings, regular
            for body text, and semibold for actions.
          </p>
          <div className="mt-9 grid gap-6 md:grid-cols-[2fr_1fr_1fr]">
            <div>
              <label htmlFor="type-preview" className="mb-2 block text-sm">
                Preview text
              </label>
              <input
                id="type-preview"
                className="field"
                value={preview}
                onChange={(event) => setPreview(event.target.value)}
              />
            </div>
            <div>
              <label htmlFor="type-size" className="mb-2 block text-sm">
                Size: {size}px
              </label>
              <input
                id="type-size"
                className="h-12 w-full accent-brand"
                type="range"
                min={20}
                max={80}
                value={size}
                onChange={(event) => setSize(Number(event.target.value))}
              />
            </div>
            <div>
              <label htmlFor="type-weight" className="mb-2 block text-sm">
                Weight
              </label>
              <select
                id="type-weight"
                className="field"
                value={weight}
                onChange={(event) => setWeight(Number(event.target.value))}
              >
                {[400, 500, 600, 700, 800].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p
            className="my-8 overflow-hidden break-words bg-paper p-6 leading-[1.15] tracking-[-0.045em] sm:p-10"
            style={{ fontSize: size, fontWeight: weight }}
          >
            {preview || 'Write something to try the typeface.'}
          </p>
          {[
            ['Display', '32–80 / 1.12 / 500', 'I design and build digital products.', 'hero-type'],
            [
              'Section heading',
              '36–60 / 1.08 / 500',
              'Selected projects',
              'text-4xl sm:text-5xl font-medium leading-[1.08] tracking-[-0.055em]',
            ],
            [
              'Card title',
              '20–24 / 1.35 / 500',
              'MURSIM — Travel data plan platform',
              'text-xl sm:text-2xl font-medium leading-snug tracking-[-0.035em]',
            ],
            [
              'Body',
              '16 / 1.6 / 400',
              'I design and build websites that meet user needs.',
              'text-base leading-relaxed',
            ],
            ['Form label', '14 / 1.5 / 500', 'Email address', 'text-sm font-medium'],
          ].map(([name, spec, text, className]) => (
            <div
              key={name}
              className="grid gap-5 border-t border-muted-300 py-6 md:grid-cols-[1fr_3fr]"
            >
              <div>
                <h3 className="text-sm font-medium">{name}</h3>
                <p className="mt-1 text-xs text-muted-600">{spec}</p>
              </div>
              <p className={className}>{text}</p>
            </div>
          ))}
        </section>

        <section
          id="ds-components"
          className="py-12 sm:py-16"
          aria-labelledby="components-heading"
        >
          <h2 id="components-heading" className="section-title">
            Buttons and cards
          </h2>
          <div className="mt-10 flex flex-wrap items-center gap-5">
            <Link to="/portfolio" className="flat-button flat-button-blue">
              View work <ArrowRightIcon className="size-4" />
            </Link>
            <Link to="/#contact" className="flat-button flat-button-outline">
              Start a project <ArrowRightIcon className="size-4" />
            </Link>
            <Link to="/blogs" className="text-link">
              Read the journal <ArrowRightIcon className="size-4" />
            </Link>
            <button type="button" disabled className="flat-button">
              Unavailable
            </button>
            <Link to="/portfolio" className="icon-button" aria-label="View portfolio">
              <ArrowRightIcon className="size-4" />
            </Link>
          </div>
          <div className="mt-12 space-y-5">
            <h3 className="text-xl font-medium">Light floating navigation</h3>
            <p className="max-w-xl text-sm leading-relaxed text-muted-600">
              The white pill sits near the bottom of the screen. A blue fill and underline mark the
              current page. This example stays in the page flow.
            </p>
            <FloatingNavigation
              preview
              currentPage="portfolio"
              onOpenCVModal={() => onOpenCVModal?.()}
            />
          </div>
          <div className="mt-14 grid gap-10 md:grid-cols-2">
            <ProjectCard
              project={PROJECTS[0]}
              onSelectProject={(project) => navigate(`/portfolio/${project.id}`)}
            />
            <BlogCard
              post={BLOG_POSTS[0]}
              onSelectPost={(post) => navigate(`/blogs/${post.slug}`)}
            />
          </div>
        </section>

        <section id="ds-geometry" className="py-12 sm:py-16" aria-labelledby="geometry-heading">
          <h2 id="geometry-heading" className="section-title">
            Layout and spacing
          </h2>
          <div className="my-8 grid gap-6 sm:grid-cols-3">
            {[
              ['Pill', 'Buttons and navigation'],
              ['0px', 'Image and content corners'],
              ['0', 'Decorative shadows'],
              ['4px', 'Base spacing unit'],
            ].map(([value, label]) => (
              <div key={label} className="bg-paper p-6">
                <p className="text-5xl font-medium tracking-tight text-brand">{value}</p>
                <p className="mt-4 text-sm text-muted-600">{label}</p>
              </div>
            ))}
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={grid}
            aria-controls="layout-preview"
            onClick={() => setGrid(!grid)}
            className="inline-flex min-h-12 items-center gap-3 rounded-full border border-muted-400 px-5 text-sm"
          >
            <span
              className={`flex size-5 items-center justify-center border ${
                grid ? 'border-brand bg-brand text-white' : 'border-muted-500'
              }`}
            >
              {grid && <CheckIcon className="size-3" />}
            </span>
            Show layout grid
          </button>
          <div
            id="layout-preview"
            className="mt-5 grid grid-cols-6 gap-3 bg-paper p-5 sm:grid-cols-12"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className={`h-28 ${grid ? 'bg-brand-tint' : 'bg-muted-200'}`}>
                <span className="p-1 text-xs text-ink">{String(i + 1).padStart(2, '0')}</span>
              </div>
            ))}
          </div>
        </section>

        <section
          id="ds-references"
          className="py-12 sm:py-16"
          aria-labelledby="references-heading"
        >
          <h2 id="references-heading" className="section-title">
            Design references
          </h2>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-600">
            These websites helped guide the layout. This portfolio keeps its own colors, content,
            and Plus Jakarta Sans font.
          </p>
          <ul
            role="list"
            className="mt-10 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
          >
            {DESIGN_REFERENCES.map(({ name, url, description }) => (
              <li key={url}>
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-link">
                  {name}
                  <ArrowRightIcon className="size-4" />
                </a>
                <p className="mt-4 text-sm leading-relaxed text-muted-600">{description}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <Footer />
    </div>
  );
}
