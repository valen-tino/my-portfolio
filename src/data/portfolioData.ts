import type {
  PortfolioItem,
  BlogItem,
  Experience as CMSExperience,
  EducationItem as CMSEducationItem,
  TechTool as CMSTechTool,
  CMSWorkProcessStep,
} from '../cms/apiStorage';
import type {
  Project,
  BlogPost,
  Education,
  Experience,
  SocialLink,
  WorkProcessStep,
  TechToolView,
} from '../types/portfolio';
import { formatMonthYear, toISODateAttribute } from '../utils/dateFormat';

export const PERSONAL_INFO = {
  name: 'Valentino Jehaut',
  fullName: 'Valentino Yudhistira Jehaut',
  roleHeadline: 'I design and build websites that meet user needs.',
  location: 'Bali, Indonesia',
  greeting: 'Good evening!',
  aboutBio:
    'I am Valentino Yudhistira Jehaut, a digital product developer based in Bali. I design user interfaces and build websites. I graduated from vocational high school in 2021, where I studied Software Engineering. I have more than four years of experience with web projects. I am also pursuing two bachelor’s degrees in Information Technology and Information Systems at ITB STIKOM Bali and HELP University Malaysia.',
  copyrightYear: '2026',
};

export const WORK_PROCESS_STEPS: WorkProcessStep[] = [
  {
    title: 'Empathize',
    description: 'I observe and interview users to understand their needs, goals, and problems.',
  },
  {
    title: 'Define',
    description: 'I review the research and clearly state the main problem users need to solve.',
  },
  {
    title: 'Ideate',
    description: 'I explore many possible solutions before I choose ideas to develop.',
  },
  {
    title: 'Prototype',
    description: 'I make simple sketches or models to show how the proposed solutions could work.',
  },
  {
    title: 'Development',
    description:
      'Following Spec-Driven Development with AI-assisted workflows, I build from PRD, ERD, and Design Brief through Local Development, Unit Tests, CI/CD Pipeline, Staging, and In Production—then repeat with Agile Methodology.',
  },
  {
    title: 'Test',
    description:
      'I test the prototypes with users. I use their feedback to find problems and improve the design.',
  },
];

export const TECH_TOOLS: TechToolView[] = [
  { name: 'JavaScript', symbol: 'JS', bg: 'bg-[#F7DF1E]', text: 'text-muted-900' },
  { name: 'PHP', symbol: 'PHP', bg: 'bg-[#777BB4]', text: 'text-white' },
  { name: 'Python', symbol: 'PY', bg: 'bg-[#3776AB]', text: 'text-white' },
  { name: 'MySQL', symbol: 'SQL', bg: 'bg-[#4479A1]', text: 'text-white' },
  { name: 'WordPress', symbol: 'WP', bg: 'bg-[#21759B]', text: 'text-white' },
  { name: 'Git', symbol: 'GIT', bg: 'bg-[#F05032]', text: 'text-white' },
  { name: 'Docker', symbol: 'DOC', bg: 'bg-[#2496ED]', text: 'text-white' },
  { name: 'React', symbol: 'REACT', bg: 'bg-[#2563EB]', text: 'text-white' },
  { name: 'TypeScript', symbol: 'TS', bg: 'bg-[#3B82F6]', text: 'text-white' },
  { name: 'Next.js', symbol: 'NEXT', bg: 'bg-muted-900', text: 'text-white' },
  { name: 'Tailwind', symbol: 'TW', bg: 'bg-[#4CA7F8]', text: 'text-white' },
  { name: 'Figma', symbol: 'FIGMA', bg: 'bg-[#EB54A7]', text: 'text-white' },
  { name: 'Node.js', symbol: 'NODE', bg: 'bg-[#6EC98E]', text: 'text-muted-900' },
  { name: 'Supabase', symbol: 'SUPA', bg: 'bg-[#3ECF8E]', text: 'text-muted-900' },
  { name: 'GitHub', symbol: 'GH', bg: 'bg-[#0F172A]', text: 'text-white' },
];

export const EDUCATION_LIST: Education[] = [
  {
    id: 'edu-1',
    degree: 'Bachelors of Information Technology (Hons)',
    institution: 'HELP University',
    period: '15 Oct 2024 - Jul 2026',
    description:
      'I am studying for a dual degree through HELP University and ITB STIKOM Bali. My studies cover software systems, cloud computing, and software development.',
    badgeColor: 'yellow',
  },
  {
    id: 'edu-2',
    degree: 'Information Systems',
    institution: 'ITB STIKOM Bali',
    period: '01 Sep 2021 - Sep 2024',
    description:
      'I completed courses in Software Engineering, Database Systems Architecture, Distributed Web Systems, and IT Project Management.',
    badgeColor: 'yellow',
  },
  {
    id: 'edu-3',
    degree: 'UX Designer for Beginner',
    institution: 'Digital Talent Scholarship',
    period: '21 May 2024 - 11 Jul 2024',
    description:
      'I studied Design Thinking, user research, Figma prototypes, and usability testing.',
    certificateUrl: '#',
    badgeColor: 'purple',
  },
  {
    id: 'edu-4',
    degree: 'Level 1 Descriptive and Diagnostics Analytics',
    institution: 'HELP University',
    period: '04 Mar 2024 - 15 Mar 2024',
    description:
      'I completed practical training in data analysis, business reports, and dashboards.',
    certificateUrl: '#',
    badgeColor: 'purple',
  },
];

export const EXPERIENCES: Experience[] = [
  {
    id: 'exp-1',
    role: 'Web Developer',
    company: 'Bali Connection Service',
    period: 'Jan 2024 - Present',
    type: 'Full-time',
    description:
      'I lead front-end web development at BCS. I build customer websites and add booking and consultation systems. I also maintain services on cPanel and Cloudflare.',
    skills: ['React', 'Tailwind CSS', 'Vite', 'cPanel', 'Responsive Design'],
    logoColor: 'bg-amber-500',
  },
  {
    id: 'exp-2',
    role: 'UI/UX Designer',
    company: 'Freelance & Agency',
    period: 'Oct 2023 - Jan 2024',
    type: 'Contract',
    description:
      'I designed interfaces, design systems, and wireframes for mobile apps and websites. I interviewed users and created interactive prototypes in Figma.',
    skills: ['Figma', 'Design Systems', 'User Research', 'Wireframing'],
    logoColor: 'bg-teal-500',
  },
  {
    id: 'exp-3',
    role: 'Web Developer',
    company: 'PT Mitra Solusi Bersama',
    period: 'Jul 2021 - Oct 2023',
    type: 'Full-time',
    description:
      'I built websites and landing pages that work on different screen sizes. I developed WordPress plugins, improved website speed, and created reusable components.',
    skills: ['JavaScript', 'WordPress', 'PHP', 'HTML/CSS', 'MySQL'],
    logoColor: 'bg-indigo-500',
  },
  {
    id: 'exp-4',
    role: 'Web Developer & Designer',
    company: 'Globiz Japan / VDM',
    period: 'Jan 2022 - Jun 2023',
    type: 'Contract',
    description:
      'I developed marketing websites in two languages and online stores for travelers and Japanese domestic programs.',
    skills: ['WordPress', 'Bricks Builder', 'ACF', 'Elementor'],
    logoColor: 'bg-sky-500',
  },
];

export const PROJECTS: Project[] = [
  {
    id: 'mursim',
    slug: 'mursim-travel-data-plan-platform',
    title: 'MURSIM - Travel Data Plan Platform',
    subtitle: 'Japan Travel SIM & Data Plans',
    year: '2024',
    roles: ['UI/UX', 'WordPress Developer'],
    tags: ['Figma', 'WordPress', 'Elementor', 'Advanced Custom Field', 'Surveysparrow', 'Laragon'],
    description:
      'I designed and built a website for Mashup R Tokyo to present MURSIM data plans. It helps travelers in Japan buy a plan and explains the affiliate program.',
    isPinned: true,
    isPublished: true,
    category: 'Travel & E-commerce',
    externalUrl: 'https://mursim.jp',
    overview:
      'I designed and built a website for Mashup R Tokyo to present MURSIM data plans. It helps travelers in Japan buy a plan and explains the affiliate program.',
    backgroundContext:
      'I built MURSIM for Mashup R Tokyo to present data plans and an affiliate program for travelers visiting Japan. The website helps visitors find reliable mobile data and understand how to join the program.\n\nUsers: Foreign travelers who need affordable data plans in Japan, and content creators who join the affiliate program.\n\nGoals: Clearly explain the plans, make purchases easier, and explain how referrals work.',
    developmentProcess:
      'I first reviewed the existing Wix website (https://monsterwifijp.wixsite.com/murtrain). I found problems with small screens, unclear referral instructions, and registration links that did not work.\n\nTools: I chose WordPress so the team could update the content. I used Elementor for page layouts and Advanced Custom Fields for custom functions.\n\nMain tasks: I made the referral instructions clearer, adapted the pages to different screen sizes, and simplified the purchase steps.',
    coreFeatures: [
      'Responsive website design optimized for all devices',
      'Streamlined data plan purchase process using Surveysparrow Form integration',
      'Enhanced referral program section with clear illustrations and instructions',
      'Improved customer feedback display system',
      'Accessible footer with icon-based navigation',
    ],
    technologiesList: [
      'WordPress',
      'Elementor',
      'Advanced Custom Fields (ACF)',
      'Figma (wireframing/prototyping)',
      'Surveysparrow Form',
    ],
    notableAchievements:
      'I replaced the old website with pages that adapt to different screen sizes and clearer steps for buying a plan.',
  },
  {
    id: 'echolang',
    slug: 'echolang-university-final-year-project',
    title: "Echolang - University's Final Year Project",
    subtitle: 'AI Subtitle & Video Translation System',
    year: '2024',
    roles: ['Web Developer', 'UI/UX'],
    tags: ['TypeScript', 'Antigravity IDE', 'HTML', 'CSS', 'React', 'Tailwind CSS', 'Node.js'],
    description:
      'EchoLang is a video translation and editing website started in 2024 under the supervision of HELP University and ITB STIKOM Bali. It uses AI to convert speech to text and match subtitles to video.',
    isPinned: false,
    isPublished: true,
    category: 'SaaS / AI Tool',
    externalUrl: '#',
    overview:
      'A university final-year project for a website where teams can add subtitles and translate video audio.',
    backgroundContext:
      'Created to bridge language gaps in digital educational video content using automated speech recognition models.',
    coreFeatures: [
      'Interactive video timeline synchronization editor',
      'Multi-language subtitle generator with SRT export',
      'Real-time collaborative editing workspace',
    ],
    technologiesList: ['TypeScript', 'React', 'Tailwind CSS', 'Node.js', 'Express', 'FFmpeg'],
  },
  {
    id: 'blossem-meetbureau',
    slug: 'blossem-group-meetbureau-blossem',
    title: 'Blossem Group - Meetbureau Blossem',
    subtitle: 'Architectural Measurement Services',
    year: '2024',
    roles: ['WordPress Developer', 'UI/UX'],
    tags: ['Local by Flywheel', 'HTML', 'CSS', 'Javascript', 'WordPress', 'PHP', 'Elementor'],
    description:
      'Meetbureau Blossem is part of Blossem Group in the Netherlands. Its services include 3D laser scanning, building measurements, and architecture.',
    isPinned: false,
    isPublished: true,
    category: 'Corporate & Architecture',
    externalUrl: '#',
    overview: 'A company website that presents architectural measurement services in the Netherlands.',
    technologiesList: ['WordPress', 'Elementor Pro', 'PHP', 'JavaScript', 'CSS3'],
  },
  {
    id: 'sumber-maju',
    slug: 'sumber-maju-perkasa-company-website',
    title: 'Sumber Maju Perkasa - Company Website',
    subtitle: 'Industrial Piping & Valves Catalog',
    year: '2024',
    roles: ['Web Developer'],
    tags: ['Cpanel', 'Local by Flywheel', 'HTML', 'CSS', 'PHP', 'Bootstrap', 'MySQL'],
    description:
      'Sumber Maju Perkasa is an industrial supplier in Indonesia. It supplies pipes, valves, and hardware across Southeast Asia.',
    isPinned: true,
    isPublished: true,
    category: 'Industrial B2B',
    externalUrl: '#',
    overview: 'A company website and product catalog for industrial parts.',
    technologiesList: ['PHP', 'Bootstrap 5', 'MySQL', 'cPanel', 'JavaScript'],
  },
  {
    id: 'blossem-realestate',
    slug: 'blossem-group-real-estate-website',
    title: 'Blossem Group - Real Estate Website',
    subtitle: 'Luxury Property Development',
    year: '2023',
    roles: ['Web Developer', 'UI/UX'],
    tags: ['Cloudinary', 'HTML', 'CSS', 'Javascript', 'Tailwind CSS', 'REST API'],
    description:
      'Blossem Group is a property development and investment company in the Netherlands. It builds, restores, and leases luxury properties.',
    isPinned: true,
    isPublished: true,
    category: 'Real Estate',
    externalUrl: '#',
    overview: 'A property website that presents building renovations and properties for lease.',
    technologiesList: ['JavaScript', 'Tailwind CSS', 'Cloudinary Media API', 'HTML5'],
  },
  {
    id: 'fit-market',
    slug: 'fit-market-express',
    title: 'Fit Market Express',
    subtitle: 'Healthy Grocery & Meal Planning App',
    year: '2022',
    roles: ['UI/UX'],
    tags: ['Figma', 'User Research', 'Design System', 'Prototyping'],
    description: 'Fit Market Express helps users choose healthy recipes and shop for groceries.',
    isPinned: false,
    isPublished: true,
    category: 'Mobile UI/UX',
    externalUrl: '#',
    overview: 'A mobile app design and prototype for grocery delivery and healthy meal kits.',
    technologiesList: ['Figma', 'Wireframing', 'Prototyping', 'Design Systems'],
  },
  {
    id: 'globiz-landing',
    slug: 'globiz-jp-landing-page',
    title: 'Globiz.jp Landing Page',
    subtitle: 'Business Matchmaking Portal',
    year: '2023',
    roles: ['WordPress Developer', 'UI/UX'],
    tags: ['WordPress', 'Bricks Builder', 'HTML', 'CSS', 'JavaScript', 'ACF'],
    description:
      'I built a one-page website for Globiz.jp with WordPress and Bricks Builder. The website supports several languages and includes forms for customer inquiries.',
    isPinned: false,
    isPublished: true,
    category: 'Bilingual Landing Page',
    externalUrl: '#',
    overview: 'A landing page for Japanese companies looking for technology professionals in Southeast Asia.',
    technologiesList: ['WordPress', 'Bricks Builder', 'ACF', 'CSS3'],
  },
  {
    id: 'sakura-sim',
    slug: 'sakura-sim-ecommerce-website',
    title: 'Sakura SIM E-commerce Website',
    subtitle: 'Prepaid SIM & eSIM for Japan',
    year: '2024',
    roles: ['Web Developer', 'WordPress Developer'],
    tags: ['WordPress', 'Advanced Custom Field', 'PHP', 'MySQL', 'WooCommerce'],
    description:
      'I built an online store for Sakura SIM to offer low-cost data plans to foreign residents in Japan. I used ACF and adapted the checkout process.',
    isPinned: true,
    isPublished: true,
    category: 'E-commerce',
    externalUrl: '#',
    overview: 'An online store with automatic eSIM activation and physical SIM delivery in Japan.',
    technologiesList: ['WordPress', 'WooCommerce', 'PHP', 'ACF', 'MySQL'],
  },
  {
    id: 'vdm-furusato',
    slug: 'vdm-furusato-japan-hometown-tax',
    title: 'VDM Furusato - Japan Hometown Tax',
    subtitle: 'Hometown Tax Portal & Tax Deduction Calculator',
    year: '2024',
    roles: ['WordPress Developer', 'Web Developer'],
    tags: ['WordPress', 'Bricks Builder', 'Advanced Custom Field', 'Rakuten API', 'PHP'],
    description:
      'I built a WordPress website for VDM Furusato with Bricks Builder and Advanced Custom Fields. I connected the Rakuten API for tax calculations and a regional gift catalog.',
    isPinned: false,
    isPublished: true,
    category: 'Tax & Portal',
    externalUrl: '#',
    overview:
      'A website that explains Japan’s Furusato Nozei hometown tax program and includes a tax calculator.',
    technologiesList: ['WordPress', 'Bricks Builder', 'ACF', 'Rakuten API', 'JavaScript'],
  },
  {
    id: 'bali-connection',
    slug: 'bali-connection-service',
    title: 'Bali Connection Service',
    subtitle: 'Expatriate Legal & Concierge Portal',
    year: '2024',
    roles: ['Web Developer', 'UI/UX'],
    tags: ['React JS', 'Tailwind', 'Figma', 'Cpanel', 'Node.js'],
    description:
      'Bali Connection Service (BCS) started in 2005. It helps local and foreign residents in Indonesia with legal, immigration, and property services.',
    isPinned: true,
    isPublished: true,
    category: 'Consulting & Legal',
    externalUrl: '#',
    overview: 'A website redesign and front-end rebuild for a legal and visa consultancy in Bali.',
    technologiesList: ['React', 'Tailwind CSS', 'Figma', 'cPanel', 'Vite'],
  },
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'ccdt-2026',
    slug: 'my-experience-as-a-mentor-and-judge-at-ccdt-2026',
    title: 'My Experience as a Mentor and Judge at CCDT 2026',
    date: '2026-11-09',
    readTime: '3 min read',
    category: 'Personal',
    author: 'Valentino Jehaut',
    excerpt:
      'I share my experience of teaching new designers and judging the UI/UX competition at Politeknik Negeri Bali’s Computer Club Digital Talent (CCDT) 2026.',
    isPublished: true,
    isPinned: true,
    tags: [
      '#UI/UX Design',
      '#Mentorship',
      '#Competition Judging',
      '#CCDT 2026',
      '#Politeknik Negeri Bali',
      '#Design Thinking',
      '#Figma',
      '#Visual Communication Design',
      '#Tech Education',
    ],
    contentSections: [
      {
        paragraphs: [
          'Recently, I had the opportunity to participate in Computer Club Digital Talent (CCDT) 2026, an event organized by the student club UKM Computer Club at Politeknik Negeri Bali (PNB). What made this experience special was my dual role: I served as both a trainer for the workshops and an official judge for the UI/UX competition.',
          'My journey began in late March 2026 when the committee invited me to teach five sessions on UI/UX for their Visual Communication Design division. Since one of the dates conflicted with my graduation ceremony in Malaysia, the committee kindly moved that session to July so I could still participate. Over several weeks, we met at the campus buildings like Gedung K and Gedung PUT, with one online session on Zoom. I introduced the students to real-world design topics, such as Design Thinking, UX writing, the Laws of UX and more! To help them practice, I also created a hands-on Figma project called NomadNook so they could build user interfaces step by step.',
        ],
        gallery: [
          { caption: 'Teaching sessions at Gedung K & Gedung PUT', aspect: 'aspect-[4/3]' },
          { caption: 'Mentoring students on Figma & Design Thinking', aspect: 'aspect-[4/3]' },
          { caption: 'Interactive critique and wireframing review', aspect: 'aspect-[4/3]' },
          { caption: 'NomadNook hands-on practice session', aspect: 'aspect-[4/3]' },
          { caption: 'Live component hierarchy demonstration', aspect: 'aspect-[4/3]' },
          { caption: 'Student Q&A and design review discussion', aspect: 'aspect-[4/3]' },
        ],
      },
      {
        paragraphs: [
          'At the same time, the committee asked if I would also join the competition panel as a judge. In August, my co-judge Juliarta and I evaluated the semifinal submissions directly in Figma and recorded our scores. We reviewed their user research, visual structure, and interactive components. During the review process, I also coordinated with the committee to fix a few missing files and duplicate links to make sure every participant was judged fairly.',
          'The Grand Final took place on August 30, 2026, at Gedung K. The day started with an unexpected challenge when my motorbike broke down in Sanur, but I was able to get it running and reach the venue in time haha. In the final stage, the teams presented their solutions and defended their design choices on stage. Seeing the students develop from beginners practicing basic wireframes into confident designers pitching complete digital products was very satisfying, and I am grateful for the chance to support them!',
        ],
        gallery: [
          { caption: 'Grand Final presentations at Gedung K', aspect: 'aspect-[4/3]' },
          { caption: 'Judges panel evaluation and scoring discussion', aspect: 'aspect-[4/3]' },
          { caption: 'Awarding ceremony with competition winners', aspect: 'aspect-[4/3]' },
          {
            caption: 'Certificate of Appreciation from UKM Computer Club PNB',
            aspect: 'aspect-[4/3]',
          },
        ],
      },
    ],
  },
];

export const SOCIAL_LINKS: SocialLink[] = [
  {
    name: 'Email',
    handle: 'valentinojehaut@gmail.com',
    url: 'mailto:valentinojehaut@gmail.com',
    actionLabel: 'Email Me',
    bgColor: 'bg-[#2563EB]',
    textColor: 'text-white',
    icon: 'mail',
  },
  {
    name: 'GitHub',
    handle: '@valentinojehaut',
    url: 'https://github.com',
    actionLabel: 'Follow Me',
    bgColor: 'bg-white border border-muted-200/90',
    textColor: 'text-muted-950',
    icon: 'github',
  },
  {
    name: 'LinkedIn',
    handle: 'Valentino Jehaut',
    url: 'https://linkedin.com',
    actionLabel: 'Connect',
    bgColor: 'bg-[#4CA7F8]',
    textColor: 'text-muted-950',
    icon: 'linkedin',
  },
];

function slugifyText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function stripHtmlTags(raw?: string): string {
  if (!raw) return '';
  return raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function resolvePortfolioImageUrl(imageURL?: string): string | undefined {
  if (!imageURL || !imageURL.trim()) return undefined;
  const trimmed = imageURL.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
    return trimmed;
  }
  return `/images/portfolios/${trimmed}`;
}

export function mapPortfolioItemToProject(item: PortfolioItem): Project {
  const id = String(item.id || item._id || slugifyText(item.title));
  const roles = Array.isArray(item.roles) ? item.roles.filter(Boolean) : [];
  const tags = Array.isArray(item.tech) ? item.tech.filter(Boolean) : [];
  const cleanDescription = stripHtmlTags(item.desc);

  return {
    id,
    slug: id,
    title: item.title,
    year: /^\d{4}/.test(item.year || '') ? String(item.year).slice(0, 4) : item.year || '',
    roles,
    tags,
    description: cleanDescription,
    overview: cleanDescription,
    isPinned: !!item.isPinned,
    isPublished: item.isPublished !== false,
    externalUrl: item.linkTo || undefined,
    imageURL: resolvePortfolioImageUrl(item.imageURL),
    videoURL: item.videoURL || null,
    projectDetails: item.projectDetails || '',
    isPasswordProtected: !!item.isPasswordProtected,
    password: item.password || null,
    relatedExperienceCompany: item.relatedExperienceCompany || null,
    relatedEducationInstitution: item.relatedEducationInstitution || null,
    technologiesList: tags,
  };
}

export function mapCMSBlogToPost(item: BlogItem): BlogPost {
  const id = String(item.id || item._id || item.slug || slugifyText(item.title));
  const slug = item.slug || id;
  const rawDate = item.date || item.year || '';
  return {
    id,
    slug,
    title: item.title,
    date: toISODateAttribute(rawDate) || rawDate,
    readTime: item.readTime || '3 min read',
    category: item.category || 'Personal',
    author: item.author || 'Valentino Jehaut',
    excerpt: stripHtmlTags(item.desc || ''),
    content: item.content || '',
    imageURL: item.imageURL || undefined,
    location: item.location || undefined,
    link: item.link || undefined,
    isPinned: !!item.isPinned,
    isPublished: item.isPublished !== false,
    tags: Array.isArray(item.tags) ? item.tags.filter(Boolean) : [],
  };
}

export function mapCMSExperienceToView(exp: CMSExperience): Experience {
  const id = String(exp.id || exp._id || slugifyText(`${exp.companyName}-${exp.title}`));
  const start = formatMonthYear(exp.startDate);
  const resolvedEndRaw = exp.endDate || (exp.status === 'Current' ? 'Present' : '');
  const end = resolvedEndRaw ? formatMonthYear(resolvedEndRaw) : '';
  const periodParts = [start, end].filter(Boolean);
  const period = periodParts.length > 0 ? periodParts.join(' - ') : exp.duration || '';

  return {
    id,
    role: exp.title,
    company: exp.companyName,
    period,
    startDate: exp.startDate,
    endDate: resolvedEndRaw || exp.startDate,
    type: exp.status || 'Experience',
    description: exp.description || '',
    logoURL: exp.logoURL || undefined,
  };
}

export function mapCMSEducationToView(edu: CMSEducationItem): Education {
  const id = String(edu.id || edu._id || slugifyText(`${edu.institution}-${edu.title}`));
  const start = formatMonthYear(edu.startDate);
  const resolvedEndRaw = edu.endDate || 'Present';
  const end = formatMonthYear(resolvedEndRaw);
  const period = [start, end].filter(Boolean).join(' - ');
  return {
    id,
    degree: edu.title,
    institution: edu.institution,
    period,
    startDate: edu.startDate,
    endDate: resolvedEndRaw,
    description: edu.description || '',
    certificateUrl: edu.link || undefined,
  };
}

export function mapCMSTechToolToView(tool: CMSTechTool): TechToolView {
  const safeTitle = tool.title || 'Tool';
  return {
    id: String(tool.id || tool._id || safeTitle),
    name: safeTitle,
    imageURL: tool.imageURL || undefined,
    symbol: safeTitle.slice(0, 4).toUpperCase(),
    bg: 'bg-paper',
    text: 'text-ink',
  };
}

export function mapCMSWorkProcessToView(step: CMSWorkProcessStep): WorkProcessStep {
  return {
    id: step.id ? String(step.id) : step._id,
    title: step.title,
    description: step.description,
    order: step.order,
    isPublished: step.isPublished,
  };
}
