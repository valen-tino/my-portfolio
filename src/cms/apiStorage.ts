import apiService from '../services/api';

export interface AboutData {
  _id?: string;
  description: string;
  imageURL: string;
  imageCloudinaryId?: string;
}

export interface TechTool {
  id: string | number;
  _id?: string;
  title: string;
  imageURL: string;
  imageCloudinaryId?: string;
  order?: number;
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
  tech: string[];
  roles: string[];
  order?: number;
  isPublished?: boolean;
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

export interface CMSData {
  about: AboutData;
  techTools: TechTool[];
  education: EducationItem[];
  portfolios: PortfolioItem[];
  contactEntries: ContactEntry[];
  roles: Role[];
  experiences: Experience[];
}

export class CMSStorage {
  // About methods
  static async getAbout(): Promise<AboutData> {
    try {
      const response = await apiService.getAbout();
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to fetch about data');
    } catch (error) {
      console.error('Error fetching about data:', error);
      throw error;
    }
  }

  // Role methods
  static async getRoles(): Promise<Role[]> {
    try {
      const response = await apiService.getRoles();
      if (response.success) {
        return response.data.map((item: any) => this.mapRoleData(item));
      }
      throw new Error('Failed to fetch roles');
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  }

  static async addRole(role: Omit<Role, 'id' | '_id'>): Promise<Role> {
    try {
      const response = await apiService.createRole(role);
      if (response.success) {
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
    } catch (error) {
      console.error('Error updating about data:', error);
      throw error;
    }
  }

  // Tech Tools methods
  static async getTechTools(): Promise<TechTool[]> {
    try {
      const response = await apiService.getTechTools();
      if (response.success) {
        return response.data.map((item: any) => this.mapTechToolData(item));
      }
      throw new Error('Failed to fetch tech tools');
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
    } catch (error) {
      console.error('Error deleting tech tool:', error);
      throw error;
    }
  }

  // Education methods
  static async getEducation(): Promise<EducationItem[]> {
    try {
      const response = await apiService.getEducation();
      if (response.success) {
        return response.data.map((item: any) => this.mapEducationData(item));
      }
      throw new Error('Failed to fetch education data');
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
    } catch (error) {
      console.error('Error deleting education item:', error);
      throw error;
    }
  }

  // Portfolio methods
  static async getPortfolios(): Promise<PortfolioItem[]> {
    try {
      const response = await apiService.getPortfolios();
      if (response.success) {
        return response.data.map((item: any) => this.mapPortfolioData(item));
      }
      throw new Error('Failed to fetch portfolio data');
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      throw error;
    }
  }

  static async updatePortfolios(portfolios: PortfolioItem[]): Promise<void> {
    // This method is replaced by individual CRUD operations
    throw new Error('Use individual createPortfolio, updatePortfolio, deletePortfolio methods instead');
  }

  static async addPortfolio(portfolio: Omit<PortfolioItem, 'id' | '_id'>): Promise<PortfolioItem> {
    try {
      const response = await apiService.createPortfolio(portfolio);
      if (response.success) {
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
      const response = await apiService.updatePortfolio(idString, portfolio);
      if (response.success) {
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
      const [about, techTools, education, portfolios, contactEntries, roles, experiences] = await Promise.all([
        this.getAbout(),
        this.getTechTools(),
        this.getEducation(),
        this.getPortfolios(),
        this.getContacts(),
        this.getRoles(),
        this.getExperiences()
      ]);

      return {
        about,
        techTools,
        education,
        portfolios,
        contactEntries,
        roles,
        experiences
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

  // Experience methods
  static async getExperiences(): Promise<Experience[]> {
    try {
      const response = await apiService.getExperiences();
      if (response.success) {
        return response.data.map((item: any) => this.mapExperienceData(item));
      }
      throw new Error('Failed to fetch experiences');
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
}
