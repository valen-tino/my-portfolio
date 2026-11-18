import apiService from '../services/api';
import { fetchWithCMSCache, invalidateCMSCache, peekCMSCache } from '../utils/cmsCache';

function isCMSAdminPath(): boolean {
  return typeof window !== 'undefined' && window.location.pathname.startsWith('/cms');
}

export interface AboutData {
  _id?: string;
  description: string;
  imageURL: string;
  imageCloudinaryId?: string | null;
  cvURL?: string;
  cvCloudinaryId?: string | null;
  name?: string;
  fullName?: string;
  location?: string;
  email?: string;
  heroHeadline?: string;
  heroSubheadline?: string;
  yearsExperience?: string;
  yearsExperienceLabel?: string;
  selectedProjectsLabel?: string;
  degreesCount?: string;
  degreesLabel?: string;
  workProcessSubtitle?: string;
  resumeSummary?: string;
  contactHeading?: string;
  contactSubtext?: string;
  footerCtaHeading?: string;
  footerBio?: string;
}

export interface TechTool {
  id: string | number;
  _id?: string;
  title: string;
  imageURL: string;
  imageCloudinaryId?: string;
  order?: number;
  isPublished?: boolean;
}

export interface BlogItem {
  _id?: string;
  id?: string | number;
  title: string;
  slug?: string;
  date: string;
  year?: string;
  category: 'Event' | 'Personal' | 'News' | 'Tech';
  imageURL: string;
  imageCloudinaryId?: string | null;
  readTime?: string;
  location?: string;
  link?: string;
  desc: string;
  content: string;
  tags: string[];
  isPublished: boolean;
  isPinned: boolean;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EducationItem {
  id: string | number;
  _id?: string;
  title: string;
  institution: string;
  startDate: string;
  endDate?: string;
  description: string;
  link?: string;
}

export interface PortfolioItem {
  id: string | number;
  _id?: string;
  title: string;
  desc: string;
  projectDetails: string;
  linkTo: string;
  imageURL: string;
  imageCloudinaryId?: string;
  videoURL?: string | null;
  videoCloudinaryId?: string | null;
  tech: string[];
  roles: string[];
  order?: number;
  isPublished?: boolean;
  // New fields for password protection and pinning
  isPasswordProtected?: boolean;
  password?: string | null;
  isPinned?: boolean;
  year?: string | null;
  relatedExperience?: string | { _id?: string; id?: string; companyName: string; title?: string } | null;
  relatedExperienceCompany?: string | null;
  relatedEducation?: string | { _id?: string; id?: string; institution?: string; title?: string } | null;
  relatedEducationInstitution?: string | null;
}

export interface ContactEntry {
  id: string | number;
  _id?: string;
  name: string;
  email: string;
  message: string;
  timestamp?: string;
  createdAt?: string;
  isRead?: boolean;
  isReplied?: boolean;
}

export interface Role {
  id: string | number;
  _id?: string;
  title: string;
  description?: string;
  color?: string;
  order?: number;
}

export interface Experience {
  id: string | number;
  _id?: string;
  title: string;
  status: 'Current' | 'Past' | 'Contract' | 'Internship' | 'Freelance' | 'Volunteer';
  companyName: string;
  startDate: string;
  endDate?: string;
  duration?: string; // Keep for backward compatibility, will be deprecated
  description: string;
  logoURL: string;
  logoCloudinaryId?: string;
  order?: number;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CMSWorkProcessStep {
  id: string | number;
  _id?: string;
  title: string;
  description: string;
  order?: number;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CMSSocialLink {
  id: string | number;
  _id?: string;
  name: string;
  handle?: string;
  url: string;
  actionLabel?: string;
  icon?: string;
  order?: number;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CMSData {
  about: AboutData;
  techTools: TechTool[];
  education: EducationItem[];
  portfolios: PortfolioItem[];
  contactEntries: ContactEntry[];
  roles: Role[];
  experiences: Experience[];
  blogs: BlogItem[];
}

export class CMSStorage {
  // Synchronous cache readers for instant route hydration on repeat visits
  static peekCachedAbout(): AboutData | null {
    return peekCMSCache<AboutData>('about')?.data ?? null;
  }

  static peekCachedRoles(): Role[] | null {
    return peekCMSCache<Role[]>('roles')?.data ?? null;
  }

  static peekCachedTechTools(publishedOnly = true): TechTool[] | null {
    const key = `techTools:${publishedOnly ? 'pub' : 'all'}`;
    return peekCMSCache<TechTool[]>(key)?.data ?? null;
  }

  static peekCachedEducation(): EducationItem[] | null {
    return peekCMSCache<EducationItem[]>('education')?.data ?? null;
  }

  static peekCachedPortfolios(publishedOnly = true): PortfolioItem[] | null {
    const key = `portfolios:${publishedOnly ? 'pub' : 'all'}`;
    return peekCMSCache<PortfolioItem[]>(key)?.data ?? null;
  }

  static peekCachedPortfolioById(id: string): PortfolioItem | null {
    const direct = peekCMSCache<PortfolioItem>(`portfolio:${id}`)?.data;
    if (direct) return direct;
    const list =
      this.peekCachedPortfolios(true) ?? this.peekCachedPortfolios(false);
    if (!list) return null;
    return (
      list.find((item) => (String(item.id) === id || item._id === id) && item.isPublished !== false) ??
      null
    );
  }

  static peekCachedExperiences(publishedOnly = true): Experience[] | null {
    const key = `experiences:${publishedOnly ? 'pub' : 'all'}`;
    const direct = peekCMSCache<Experience[]>(key)?.data;
    if (direct) return direct;
    const apiKey = `api:experiences:${publishedOnly ? 'pub' : 'all'}`;
    const apiCached = peekCMSCache<{ success?: boolean; data?: any[] }>(apiKey)?.data;
    if (apiCached?.success && Array.isArray(apiCached.data)) {
      return apiCached.data.map((item: any) => this.mapExperienceData(item));
    }
    return null;
  }

  static peekCachedBlogs(publishedOnly = true): BlogItem[] | null {
    const key = `blogs:${publishedOnly ? 'pub' : 'all'}:::`;
    return peekCMSCache<BlogItem[]>(key)?.data ?? null;
  }

  static peekCachedBlogById(id: string): BlogItem | null {
    const direct = peekCMSCache<BlogItem>(`blog:${id}`)?.data;
    if (direct) return direct;
    const list = this.peekCachedBlogs(true) ?? this.peekCachedBlogs(false);
    if (!list) return null;
    return (
      list.find(
        (item) =>
          (String(item.id) === id || item._id === id || item.slug === id) &&
          item.isPublished !== false,
      ) ?? null
    );
  }

  static peekCachedWorkProcesses(publishedOnly = true): CMSWorkProcessStep[] | null {
    const key = `workProcess:${publishedOnly ? 'pub' : 'all'}`;
    return peekCMSCache<CMSWorkProcessStep[]>(key)?.data ?? null;
  }

  static peekCachedSocialLinks(publishedOnly = true): CMSSocialLink[] | null {
    const key = `socialLinks:${publishedOnly ? 'pub' : 'all'}`;
    return peekCMSCache<CMSSocialLink[]>(key)?.data ?? null;
  }

  // About methods
  static async getAbout(): Promise<AboutData> {
    try {
      return await fetchWithCMSCache(
        'about',
        async () => {
          const response = await apiService.getAbout();
          if (response.success) {
            return response.data;
          }
          throw new Error('Failed to fetch about data');
        },
        { forceRefresh: isCMSAdminPath() },
      );
    } catch (error) {
      console.error('Error fetching about data:', error);
      throw error;
    }
  }

  // Role methods
  static async getRoles(): Promise<Role[]> {
    try {
      return await fetchWithCMSCache(
        'roles',
        async () => {
          const response = await apiService.getRoles();
          if (response.success) {
            return response.data.map((item: any) => this.mapRoleData(item));
          }
          throw new Error('Failed to fetch roles');
        },
        { forceRefresh: isCMSAdminPath() },
      );
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  }

  static async addRole(role: Omit<Role, 'id' | '_id'>): Promise<Role> {
    try {
      const response = await apiService.createRole(role);
      if (response.success) {
        invalidateCMSCache('roles');
        return this.mapRoleData(response.data);
      }
      throw new Error(response.message || 'Failed to create role');
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  }

  static async updateRole(id: string | number, role: Partial<Role>): Promise<Role> {
    try {
      const idString = typeof id === 'string' ? id : id.toString();
      const response = await apiService.updateRole(idString, role);
      if (response.success) {
        invalidateCMSCache('roles');
        return this.mapRoleData(response.data);
      }
      throw new Error(response.message || 'Failed to update role');
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  }

  static async deleteRole(id: string | number): Promise<void> {
    try {
      const idString = typeof id === 'string' ? id : id.toString();
      const response = await apiService.deleteRole(idString);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete role');
      }
      invalidateCMSCache('roles');
    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  }

  static async updateAbout(about: AboutData): Promise<void> {
    try {
      const response = await apiService.updateAbout(about);
      if (!response.success) {
        throw new Error(response.message || 'Failed to update about data');
      }
      invalidateCMSCache('about');
    } catch (error) {
      console.error('Error updating about data:', error);
      throw error;
    }
  }

  // Tech Tools methods
  static async getTechTools(publishedOnly = false): Promise<TechTool[]> {
    try {
      const key = `techTools:${publishedOnly ? 'pub' : 'all'}`;
      return await fetchWithCMSCache(
        key,
        async () => {
          const response = await apiService.getTechTools(publishedOnly);
          if (response.success) {
            return response.data.map((item: any) => this.mapTechToolData(item));
          }
          throw new Error('Failed to fetch tech tools');
        },
        { forceRefresh: isCMSAdminPath() },
      );
    } catch (error) {
      console.error('Error fetching tech tools:', error);
      throw error;
    }
  }

  static async updateTechTools(techTools: TechTool[]): Promise<void> {
    // This method is replaced by individual CRUD operations
    // For compatibility, we'll throw an error to indicate it should use individual methods
    throw new Error('Use individual createTechTool, updateTechTool, deleteTechTool methods instead');
  }

  static async addTechTool(techTool: Omit<TechTool, 'id' | '_id'>): Promise<TechTool> {
    try {
      const response = await apiService.createTechTool(techTool);
      if (response.success) {
        invalidateCMSCache('techTools');
        return this.mapTechToolData(response.data);
      }
      throw new Error(response.message || 'Failed to create tech tool');
    } catch (error) {
      console.error('Error creating tech tool:', error);
      throw error;
    }
  }

  static async updateTechTool(id: string | number, techTool: Partial<TechTool>): Promise<TechTool> {
    try {
      const idString = typeof id === 'string' ? id : id.toString();
      const response = await apiService.updateTechTool(idString, techTool);
      if (response.success) {
        invalidateCMSCache('techTools');
        return this.mapTechToolData(response.data);
      }
      throw new Error(response.message || 'Failed to update tech tool');
    } catch (error) {
      console.error('Error updating tech tool:', error);
      throw error;
    }
  }

  static async deleteTechTool(id: string | number): Promise<void> {
    try {
      const idString = typeof id === 'string' ? id : id.toString();
      const response = await apiService.deleteTechTool(idString);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete tech tool');
      }
      invalidateCMSCache('techTools');
    } catch (error) {
      console.error('Error deleting tech tool:', error);
      throw error;
    }
  }

  static async syncSkillsFromPortfolios(): Promise<{ success: boolean; message: string; data: any }> {
    try {
      const response = await apiService.syncSkillsFromPortfolios();
      invalidateCMSCache('techTools');
      return response;
    } catch (error) {
      console.error('Error syncing skills from portfolios:', error);
      throw error;
    }
  }

  // Education methods
  static async getEducation(): Promise<EducationItem[]> {
    try {
      return await fetchWithCMSCache(
        'education',
        async () => {
          const response = await apiService.getEducation();
          if (response.success) {
            return response.data.map((item: any) => this.mapEducationData(item));
          }
          throw new Error('Failed to fetch education data');
        },
        { forceRefresh: isCMSAdminPath() },
      );
    } catch (error) {
      console.error('Error fetching education data:', error);
      throw error;
    }
  }

  static async updateEducationBulk(education: EducationItem[]): Promise<void> {
    // This method is replaced by individual CRUD operations
    throw new Error('Use individual addEducation, updateEducation, deleteEducation methods instead');
  }

  static async addEducation(education: Omit<EducationItem, 'id' | '_id'>): Promise<EducationItem> {
    try {
      const response = await apiService.createEducation(education);
      if (response.success) {
        invalidateCMSCache('education');
        return this.mapEducationData(response.data);
      }
      throw new Error(response.message || 'Failed to create education item');
    } catch (error) {
      console.error('Error creating education item:', error);
      throw error;
    }
  }

  static async updateEducation(id: string | number, education: Partial<EducationItem>): Promise<EducationItem> {
    try {
      const idString = typeof id === 'string' ? id : id.toString();
      const response = await apiService.updateEducation(idString, education);
      if (response.success) {
        invalidateCMSCache('education');
        return this.mapEducationData(response.data);
      }
      throw new Error(response.message || 'Failed to update education item');
    } catch (error) {
      console.error('Error updating education item:', error);
      throw error;
    }
  }

  static async deleteEducation(id: string | number): Promise<void> {
    try {
      const idString = typeof id === 'string' ? id : id.toString();
      const response = await apiService.deleteEducation(idString);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete education item');
      }
      invalidateCMSCache('education');
    } catch (error) {
      console.error('Error deleting education item:', error);
      throw error;
    }
  }

  // Portfolio methods
  static async getPortfolios(publishedOnly = false): Promise<PortfolioItem[]> {
    try {
      const key = `portfolios:${publishedOnly ? 'pub' : 'all'}`;
      return await fetchWithCMSCache(
        key,
        async () => {
          const response = await apiService.getPortfolios(publishedOnly);
          if (response.success) {
            return response.data.map((item: any) => this.mapPortfolioData(item));
          }
          throw new Error('Failed to fetch portfolio data');
        },
        { forceRefresh: isCMSAdminPath() },
      );
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      throw error;
    }
  }

  static async getPortfolio(id: string): Promise<PortfolioItem> {
    try {
      const cached = !isCMSAdminPath() ? this.peekCachedPortfolioById(id) : null;
      if (cached) {
        return cached;
      }
      return await fetchWithCMSCache(
        `portfolio:${id}`,
        async () => {
          const response = await apiService.getPortfolio(id);
          if (response.success) {
            return this.mapPortfolioData(response.data);
          }
          throw new Error(response.message || 'Failed to fetch portfolio item');
        },
        { forceRefresh: isCMSAdminPath() },
      );
    } catch (error) {
      console.error('Error fetching portfolio item:', error);
      throw error;
    }
  }

  static async updatePortfolios(portfolios: PortfolioItem[]): Promise<void> {
    // This method is replaced by individual CRUD operations
    throw new Error('Use individual createPortfolio, updatePortfolio, deletePortfolio methods instead');
  }

  static async addPortfolio(portfolio: Omit<PortfolioItem, 'id' | '_id'>): Promise<PortfolioItem> {
    try {
      const expId = typeof portfolio.relatedExperience === 'object' && portfolio.relatedExperience !== null
        ? (portfolio.relatedExperience._id || portfolio.relatedExperience.id || null)
        : (portfolio.relatedExperience || null);
      const eduId = typeof portfolio.relatedEducation === 'object' && portfolio.relatedEducation !== null
        ? (portfolio.relatedEducation._id || portfolio.relatedEducation.id || null)
        : (portfolio.relatedEducation || null);

      const response = await apiService.createPortfolio({
        ...portfolio,
        relatedExperience: expId,
        relatedEducation: eduId
      });
      if (response.success) {
        invalidateCMSCache('portfolio');
        invalidateCMSCache('techTools');
        return this.mapPortfolioData(response.data);
      }
      throw new Error(response.message || 'Failed to create portfolio item');
    } catch (error) {
      console.error('Error creating portfolio item:', error);
      throw error;
    }
  }

  static async updatePortfolio(id: string | number, portfolio: Partial<PortfolioItem>): Promise<PortfolioItem> {
    try {
      const idString = typeof id === 'string' ? id : id.toString();
      const expId = typeof portfolio.relatedExperience === 'object' && portfolio.relatedExperience !== null
        ? (portfolio.relatedExperience._id || portfolio.relatedExperience.id || null)
        : (portfolio.relatedExperience !== undefined ? portfolio.relatedExperience : undefined);
      const eduId = typeof portfolio.relatedEducation === 'object' && portfolio.relatedEducation !== null
        ? (portfolio.relatedEducation._id || portfolio.relatedEducation.id || null)
        : (portfolio.relatedEducation !== undefined ? portfolio.relatedEducation : undefined);

      const response = await apiService.updatePortfolio(idString, {
        ...portfolio,
        ...(expId !== undefined ? { relatedExperience: expId } : {}),
        ...(eduId !== undefined ? { relatedEducation: eduId } : {})
      });
      if (response.success) {
        invalidateCMSCache('portfolio');
        invalidateCMSCache('techTools');
        return this.mapPortfolioData(response.data);
      }
      throw new Error(response.message || 'Failed to update portfolio item');
    } catch (error) {
      console.error('Error updating portfolio item:', error);
      throw error;
    }
  }

  static async deletePortfolio(id: string | number): Promise<void> {
    try {
      const idString = typeof id === 'string' ? id : id.toString();
      const response = await apiService.deletePortfolio(idString);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete portfolio item');
      }
      invalidateCMSCache('portfolio');
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
      throw error;
    }
  }

  // Contact methods
  static async getContacts(): Promise<ContactEntry[]> {
    try {
      const response = await apiService.getContacts();
      if (response.success) {
        return response.data.map((item: any) => this.mapContactData(item));
      }
      throw new Error('Failed to fetch contact entries');
    } catch (error) {
      console.error('Error fetching contact entries:', error);
      throw error;
    }
  }

  static async addContactEntry(entry: Omit<ContactEntry, 'id' | '_id' | 'createdAt'>): Promise<ContactEntry> {
    try {
      const response = await apiService.createContact(entry);
      if (response.success) {
        return this.mapContactData(response.data);
      }
      throw new Error(response.message || 'Failed to create contact entry');
    } catch (error) {
      console.error('Error creating contact entry:', error);
      throw error;
    }
  }

  static async deleteContact(id: string | number): Promise<void> {
    try {
      const idString = typeof id === 'string' ? id : id.toString();
      const response = await apiService.deleteContact(idString);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete contact entry');
      }
    } catch (error) {
      console.error('Error deleting contact entry:', error);
      throw error;
    }
  }

  static async deleteAllContactEntries(): Promise<void> {
    try {
      const response = await apiService.deleteAllContacts();
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete all contact entries');
      }
    } catch (error) {
      console.error('Error deleting all contact entries:', error);
      throw error;
    }
  }

  // Legacy compatibility method
  static async getData(): Promise<CMSData> {
    try {
      const [about, techTools, education, portfolios, contactEntries, roles, experiences, blogs] = await Promise.all([
        this.getAbout(),
        this.getTechTools(),
        this.getEducation(),
        this.getPortfolios(),
        this.getContacts(),
        this.getRoles(),
        this.getExperiences(),
        this.getBlogs()
      ]);

      return {
        about,
        techTools,
        education,
        portfolios,
        contactEntries,
        roles,
        experiences,
        blogs
      };
    } catch (error) {
      console.error('Error fetching CMS data:', error);
      throw error;
    }
  }

  // Utility methods
  static getNextId(items: { _id?: string }[]): string {
    // In API mode, IDs are generated by the database
    return 'temp-' + Date.now().toString();
  }

  // Data mapping methods to handle MongoDB _id to id conversion
  private static mapTechToolData(data: any): TechTool {
    return {
      ...data,
      id: data._id || data.id
    };
  }

  private static mapEducationData(data: any): EducationItem {
    return {
      ...data,
      id: data._id || data.id,
      // Convert dates to YYYY-MM format for month pickers
      startDate: data.startDate ? new Date(data.startDate).toISOString().substring(0, 7) : '',
      endDate: data.endDate ? new Date(data.endDate).toISOString().substring(0, 7) : ''
    };
  }

  private static mapPortfolioData(data: any): PortfolioItem {
    return {
      ...data,
      id: data._id || data.id
    };
  }

  private static mapContactData(data: any): ContactEntry {
    return {
      ...data,
      id: data._id || data.id,
      timestamp: data.createdAt || data.timestamp
    };
  }

  private static mapRoleData(data: any): Role {
    return {
      ...data,
      id: data._id || data.id
    };
  }

  private static mapExperienceData(data: any): Experience {
    return {
      ...data,
      id: data._id || data.id,
      // Convert dates to YYYY-MM format for month pickers
      startDate: data.startDate ? new Date(data.startDate).toISOString().substring(0, 7) : '',
      endDate: data.endDate ? new Date(data.endDate).toISOString().substring(0, 7) : undefined
    };
  }

  private static mapBlogData(data: any): BlogItem {
    return {
      ...data,
      id: data._id || data.id,
      _id: data._id,
      title: data.title || '',
      slug: data.slug || '',
      date: data.date || '',
      year: data.year || '',
      category: data.category || 'Personal',
      imageURL: data.imageURL || '',
      imageCloudinaryId: data.imageCloudinaryId || null,
      readTime: data.readTime || '3 min read',
      location: data.location || '',
      link: data.link || '',
      desc: data.desc || '',
      content: data.content || '',
      tags: Array.isArray(data.tags) ? data.tags : [],
      isPublished: data.isPublished !== undefined ? data.isPublished : true,
      isPinned: !!data.isPinned,
      author: data.author || 'Valentino Jehaut',
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  }

  private static mapWorkProcessData(data: any): CMSWorkProcessStep {
    return {
      ...data,
      id: data._id || data.id,
      _id: data._id,
      title: data.title || '',
      description: data.description || '',
      order: typeof data.order === 'number' ? data.order : 0,
      isPublished: data.isPublished !== undefined ? data.isPublished : true,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  }

  private static mapSocialLinkData(data: any): CMSSocialLink {
    return {
      ...data,
      id: data._id || data.id,
      _id: data._id,
      name: data.name || '',
      handle: data.handle || '',
      url: data.url || '',
      actionLabel: data.actionLabel || 'Connect',
      icon: data.icon || 'globe',
      order: typeof data.order === 'number' ? data.order : 0,
      isPublished: data.isPublished !== undefined ? data.isPublished : true,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  }

  // File upload methods
  static async uploadProfileImage(file: File): Promise<{ imageURL: string; imageCloudinaryId: string }> {
    try {
      const response = await apiService.uploadProfileImage(file);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to upload profile image');
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  }

  static async uploadPortfolioImage(file: File): Promise<{ imageURL: string; imageCloudinaryId: string }> {
    try {
      const response = await apiService.uploadPortfolioImage(file);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to upload portfolio image');
    } catch (error) {
      console.error('Error uploading portfolio image:', error);
      throw error;
    }
  }

  static async uploadPortfolioVideo(file: File): Promise<{ videoURL: string; videoCloudinaryId: string }> {
    try {
      const response = await apiService.uploadPortfolioVideo(file);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to upload portfolio video');
    } catch (error) {
      console.error('Error uploading portfolio video:', error);
      throw error;
    }
  }

  static async uploadEditorMedia(file: File): Promise<{ url: string; cloudinaryId: string; mediaType: 'image' | 'video' }> {
    try {
      const response = await apiService.uploadEditorMedia(file);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to upload media');
    } catch (error) {
      console.error('Error uploading editor media:', error);
      throw error;
    }
  }

  static async uploadEditorGallery(files: File[]): Promise<Array<{ url: string; cloudinaryId: string; mediaType: 'image' | 'video' }>> {
    try {
      const response = await apiService.uploadEditorGallery(files);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to upload gallery media');
    } catch (error) {
      console.error('Error uploading gallery media:', error);
      throw error;
    }
  }

  static async uploadTechToolImage(file: File): Promise<{ imageURL: string; imageCloudinaryId: string }> {
    try {
      const response = await apiService.uploadTechToolImage(file);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to upload tech tool image');
    } catch (error) {
      console.error('Error uploading tech tool image:', error);
      throw error;
    }
  }

  static async uploadCV(file: File): Promise<{ cvURL: string; cvCloudinaryId: string }> {
    try {
      const result = await apiService.uploadCV(file);
      return {
        cvURL: result.url,
        cvCloudinaryId: result.cloudinaryId
      };
    } catch (error) {
      console.error('Error uploading CV to Cloudinary:', error);
      throw error;
    }
  }

  // Experience methods
  static async getExperiences(publishedOnly = false): Promise<Experience[]> {
    try {
      const key = `experiences:${publishedOnly ? 'pub' : 'all'}`;
      return await fetchWithCMSCache(
        key,
        async () => {
          const response = await apiService.getExperiences(publishedOnly);
          if (response.success) {
            return response.data.map((item: any) => this.mapExperienceData(item));
          }
          throw new Error('Failed to fetch experiences');
        },
        { forceRefresh: isCMSAdminPath() },
      );
    } catch (error) {
      console.error('Error fetching experiences:', error);
      throw error;
    }
  }

  static async addExperience(experience: Omit<Experience, 'id' | '_id'>): Promise<Experience> {
    try {
      // Ensure duration is set for API compatibility
      const experienceWithDuration = {
        ...experience,
        duration: experience.duration || ''
      };
      const response = await apiService.createExperience(experienceWithDuration);
      if (response.success) {
        invalidateCMSCache('experiences');
        invalidateCMSCache('api:experiences');
        return this.mapExperienceData(response.data);
      }
      throw new Error(response.message || 'Failed to create experience');
    } catch (error) {
      console.error('Error creating experience:', error);
      throw error;
    }
  }

  static async updateExperience(id: string | number, experience: Partial<Experience>): Promise<Experience> {
    try {
      const idString = typeof id === 'string' ? id : id.toString();
      const response = await apiService.updateExperience(idString, experience);
      if (response.success) {
        invalidateCMSCache('experiences');
        invalidateCMSCache('api:experiences');
        return this.mapExperienceData(response.data);
      }
      throw new Error(response.message || 'Failed to update experience');
    } catch (error) {
      console.error('Error updating experience:', error);
      throw error;
    }
  }

  static async deleteExperience(id: string | number): Promise<void> {
    try {
      const idString = typeof id === 'string' ? id : id.toString();
      const response = await apiService.deleteExperience(idString);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete experience');
      }
      invalidateCMSCache('experiences');
      invalidateCMSCache('api:experiences');
    } catch (error) {
      console.error('Error deleting experience:', error);
      throw error;
    }
  }

  static async uploadExperienceLogo(file: File): Promise<{ imageURL: string; imageCloudinaryId: string }> {
    try {
      const response = await apiService.uploadExperienceLogo(file);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to upload experience logo');
    } catch (error) {
      console.error('Error uploading experience logo:', error);
      throw error;
    }
  }

  // Blog methods
  static async getBlogs(publishedOnly = false, params?: { category?: string; tag?: string; search?: string }): Promise<BlogItem[]> {
    try {
      const key = `blogs:${publishedOnly ? 'pub' : 'all'}:${params?.category || ''}:${params?.tag || ''}:${params?.search || ''}`;
      return await fetchWithCMSCache(
        key,
        async () => {
          const response = await apiService.getBlogs({
            published: publishedOnly,
            ...params
          });
          if (response.success) {
            return response.data.map((item: any) => this.mapBlogData(item));
          }
          throw new Error('Failed to fetch blogs');
        },
        { forceRefresh: isCMSAdminPath() },
      );
    } catch (error) {
      console.error('Error fetching blogs:', error);
      throw error;
    }
  }

  static async getBlog(id: string): Promise<BlogItem> {
    try {
      if (!isCMSAdminPath()) {
        const cached = this.peekCachedBlogById(id);
        if (cached && cached.content) {
          return cached;
        }
      }
      return await fetchWithCMSCache(
        `blog:${id}`,
        async () => {
          const response = await apiService.getBlog(id);
          if (response.success) {
            return this.mapBlogData(response.data);
          }
          throw new Error(response.message || 'Failed to fetch blog post');
        },
        { forceRefresh: isCMSAdminPath() },
      );
    } catch (error) {
      console.error('Error fetching blog post:', error);
      throw error;
    }
  }

  static async addBlog(blog: Omit<BlogItem, 'id' | '_id'>): Promise<BlogItem> {
    try {
      const response = await apiService.createBlog(blog);
      if (response.success) {
        invalidateCMSCache('blog');
        return this.mapBlogData(response.data);
      }
      throw new Error(response.message || 'Failed to create blog post');
    } catch (error) {
      console.error('Error creating blog post:', error);
      throw error;
    }
  }

  static async updateBlog(id: string | number, blog: Partial<BlogItem>): Promise<BlogItem> {
    try {
      const idString = typeof id === 'string' ? id : id.toString();
      const response = await apiService.updateBlog(idString, blog);
      if (response.success) {
        invalidateCMSCache('blog');
        return this.mapBlogData(response.data);
      }
      throw new Error(response.message || 'Failed to update blog post');
    } catch (error) {
      console.error('Error updating blog post:', error);
      throw error;
    }
  }

  static async deleteBlog(id: string | number): Promise<void> {
    try {
      const idString = typeof id === 'string' ? id : id.toString();
      const response = await apiService.deleteBlog(idString);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete blog post');
      }
      invalidateCMSCache('blog');
    } catch (error) {
      console.error('Error deleting blog post:', error);
      throw error;
    }
  }

  static async uploadBlogImage(file: File): Promise<{ imageURL: string; imageCloudinaryId: string }> {
    try {
      const response = await apiService.uploadBlogImage(file);
      return response;
    } catch (error) {
      console.error('Error uploading blog image:', error);
      throw error;
    }
  }

  // Work process methods
  static async getWorkProcesses(publishedOnly = false): Promise<CMSWorkProcessStep[]> {
    try {
      const key = `workProcess:${publishedOnly ? 'pub' : 'all'}`;
      return await fetchWithCMSCache(
        key,
        async () => {
          const response = await apiService.getWorkProcesses(publishedOnly);
          if (response.success && Array.isArray(response.data)) {
            return response.data.map((item: any) => this.mapWorkProcessData(item));
          }
          throw new Error('Failed to fetch work process steps');
        },
        { forceRefresh: isCMSAdminPath() },
      );
    } catch (error) {
      console.error('Error fetching work process steps:', error);
      throw error;
    }
  }

  static async addWorkProcess(step: Omit<CMSWorkProcessStep, 'id' | '_id'>): Promise<CMSWorkProcessStep> {
    try {
      const response = await apiService.createWorkProcess(step);
      if (response.success) {
        invalidateCMSCache('workProcess');
        return this.mapWorkProcessData(response.data);
      }
      throw new Error(response.message || 'Failed to create work process step');
    } catch (error) {
      console.error('Error creating work process step:', error);
      throw error;
    }
  }

  static async updateWorkProcess(
    id: string | number,
    step: Partial<CMSWorkProcessStep>
  ): Promise<CMSWorkProcessStep> {
    try {
      const idString = typeof id === 'string' ? id : id.toString();
      const response = await apiService.updateWorkProcess(idString, step);
      if (response.success) {
        invalidateCMSCache('workProcess');
        return this.mapWorkProcessData(response.data);
      }
      throw new Error(response.message || 'Failed to update work process step');
    } catch (error) {
      console.error('Error updating work process step:', error);
      throw error;
    }
  }

  static async deleteWorkProcess(id: string | number): Promise<void> {
    try {
      const idString = typeof id === 'string' ? id : id.toString();
      const response = await apiService.deleteWorkProcess(idString);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete work process step');
      }
      invalidateCMSCache('workProcess');
    } catch (error) {
      console.error('Error deleting work process step:', error);
      throw error;
    }
  }

  static async seedWorkProcesses(force = false): Promise<CMSWorkProcessStep[]> {
    try {
      const response = await apiService.seedWorkProcesses(force);
      if (response.success && Array.isArray(response.data)) {
        invalidateCMSCache('workProcess');
        return response.data.map((item: any) => this.mapWorkProcessData(item));
      }
      throw new Error(response.message || 'Failed to seed default work process steps');
    } catch (error) {
      console.error('Error seeding work process steps:', error);
      throw error;
    }
  }

  // Social links methods
  static async getSocialLinks(publishedOnly = false): Promise<CMSSocialLink[]> {
    try {
      const key = `socialLinks:${publishedOnly ? 'pub' : 'all'}`;
      return await fetchWithCMSCache(
        key,
        async () => {
          const response = await apiService.getSocialLinks(publishedOnly);
          if (response.success && Array.isArray(response.data)) {
            return response.data.map((item: any) => this.mapSocialLinkData(item));
          }
          throw new Error('Failed to fetch social links');
        },
        { forceRefresh: isCMSAdminPath() },
      );
    } catch (error) {
      console.error('Error fetching social links:', error);
      throw error;
    }
  }

  static async addSocialLink(link: Omit<CMSSocialLink, 'id' | '_id'>): Promise<CMSSocialLink> {
    try {
      const response = await apiService.createSocialLink(link);
      if (response.success) {
        invalidateCMSCache('socialLinks');
        return this.mapSocialLinkData(response.data);
      }
      throw new Error(response.message || 'Failed to create social link');
    } catch (error) {
      console.error('Error creating social link:', error);
      throw error;
    }
  }

  static async updateSocialLink(
    id: string | number,
    link: Partial<CMSSocialLink>
  ): Promise<CMSSocialLink> {
    try {
      const idString = typeof id === 'string' ? id : id.toString();
      const response = await apiService.updateSocialLink(idString, link);
      if (response.success) {
        invalidateCMSCache('socialLinks');
        return this.mapSocialLinkData(response.data);
      }
      throw new Error(response.message || 'Failed to update social link');
    } catch (error) {
      console.error('Error updating social link:', error);
      throw error;
    }
  }

  static async deleteSocialLink(id: string | number): Promise<void> {
    try {
      const idString = typeof id === 'string' ? id : id.toString();
      const response = await apiService.deleteSocialLink(idString);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete social link');
      }
      invalidateCMSCache('socialLinks');
    } catch (error) {
      console.error('Error deleting social link:', error);
      throw error;
    }
  }

  static async seedSocialLinks(force = false): Promise<CMSSocialLink[]> {
    try {
      const response = await apiService.seedSocialLinks(force);
      if (response.success && Array.isArray(response.data)) {
        invalidateCMSCache('socialLinks');
        return response.data.map((item: any) => this.mapSocialLinkData(item));
      }
      throw new Error(response.message || 'Failed to seed default social links');
    } catch (error) {
      console.error('Error seeding social links:', error);
      throw error;
    }
  }
}
