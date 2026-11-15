export type PageView =
  | 'home'
  | 'portfolio'
  | 'portfolio-detail'
  | 'blog'
  | 'blog-detail'
  | 'design-system';

export interface WorkProcessStep {
  id?: string;
  title: string;
  description: string;
  order?: number;
  isPublished?: boolean;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  year: string;
  roles: string[];
  tags: string[];
  description: string;
  isPinned?: boolean;
  isPublished?: boolean;
  category?: string;
  externalUrl?: string;
  imageURL?: string;
  videoURL?: string | null;
  projectDetails?: string;
  isPasswordProtected?: boolean;
  password?: string | null;
  relatedExperienceCompany?: string | null;
  relatedEducationInstitution?: string | null;
  overview?: string;
  backgroundContext?: string;
  targetUsers?: string;
  objectives?: string;
  developmentProcess?: string;
  technicalApproach?: string;
  keyChallenges?: string;
  coreFeatures?: string[];
  technologiesList?: string[];
  notableAchievements?: string;
}

export interface BlogSectionGalleryItem {
  caption: string;
  aspect?: string;
  src?: string;
}

export interface BlogContentSection {
  heading?: string;
  paragraphs: string[];
  gallery?: BlogSectionGalleryItem[];
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  date: string;
  readTime: string;
  category: string;
  author: string;
  excerpt: string;
  content?: string;
  imageURL?: string;
  location?: string;
  link?: string;
  isPinned?: boolean;
  isPublished?: boolean;
  tags: string[];
  contentSections?: BlogContentSection[];
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  period: string;
  startDate?: string;
  endDate?: string;
  description: string;
  certificateUrl?: string;
  badgeColor?: 'yellow' | 'blue' | 'purple' | 'green';
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  startDate?: string;
  endDate?: string;
  type: string;
  description: string;
  logoURL?: string;
  skills?: string[];
  logoColor?: string;
}

export interface TechToolView {
  id?: string;
  name: string;
  imageURL?: string;
  symbol: string;
  bg: string;
  text: string;
}

export interface SocialLink {
  name: string;
  handle: string;
  url: string;
  actionLabel: string;
  bgColor: string;
  textColor: string;
  icon: string;
}

