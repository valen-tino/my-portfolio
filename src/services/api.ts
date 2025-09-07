import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Resolve environment
const APP_ENV = (import.meta.env.VITE_APP_ENV as string | undefined) || (import.meta.env.PROD ? 'production' : 'development');

// Frontend app URL by environment (used for redirects)
const APP_URL = (
  (APP_ENV === 'production' && (import.meta.env.VITE_APP_URL_PROD as string | undefined)) ||
  (APP_ENV === 'preview' && (import.meta.env.VITE_APP_URL_PREVIEW as string | undefined)) ||
  (APP_ENV === 'development' && (import.meta.env.VITE_APP_URL_DEV as string | undefined)) ||
  (import.meta.env.VITE_APP_URL as string | undefined)
);

// API base URL by environment
const API_BASE_URL = (
  (APP_ENV === 'production' && (import.meta.env.VITE_API_URL_PROD as string | undefined)) ||
  (APP_ENV === 'preview' && (import.meta.env.VITE_API_URL_PREVIEW as string | undefined)) ||
  (APP_ENV === 'development' && (import.meta.env.VITE_API_URL_DEV as string | undefined)) ||
  (import.meta.env.VITE_API_URL as string | undefined) ||
  (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api')
);

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 120000, // 2 minutes for AI requests
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('cms-auth-token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('cms-auth-token');
          localStorage.removeItem('cms-user');
          if (window.location.pathname.startsWith('/cms/') && window.location.pathname !== '/cms/login') {
            if (APP_URL) {
              window.location.href = `${APP_URL.replace(/\/$/, '')}/cms/login`;
            } else {
              window.location.href = '/cms/login';
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic HTTP methods
  async post(url: string, data?: any) {
    const response = await this.api.post(url, data);
    return response.data;
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password });
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('cms-auth-token', response.data.data.token);
      localStorage.setItem('cms-user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  }

  async logout() {
    try {
      await this.api.post('/auth/logout');
    } finally {
      localStorage.removeItem('cms-auth-token');
      localStorage.removeItem('cms-user');
    }
  }

  async getCurrentUser() {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  // About methods
  async getAbout() {
    const response = await this.api.get('/about');
    return response.data;
  }

  async updateAbout(data: { description: string; imageURL?: string; imageCloudinaryId?: string }) {
    const response = await this.api.put('/about', data);
    return response.data;
  }

  // Tech Tools methods
  async getTechTools() {
    const response = await this.api.get('/tech-tools');
    return response.data;
  }

  async createTechTool(data: { title: string; imageURL: string; imageCloudinaryId?: string; order?: number }) {
    const response = await this.api.post('/tech-tools', data);
    return response.data;
  }

  async updateTechTool(id: string, data: { title?: string; imageURL?: string; imageCloudinaryId?: string; order?: number }) {
    const response = await this.api.put(`/tech-tools/${id}`, data);
    return response.data;
  }

  async deleteTechTool(id: string) {
    const response = await this.api.delete(`/tech-tools/${id}`);
    return response.data;
  }

  // Education methods
  async getEducation() {
    const response = await this.api.get('/education');
    return response.data;
  }

  async createEducation(data: {
    title: string;
    institution: string;
    startDate: string;
    endDate?: string;
    description?: string;
    link?: string;
  }) {
    const response = await this.api.post('/education', data);
    return response.data;
  }

  async updateEducation(id: string, data: {
    title?: string;
    institution?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    link?: string;
  }) {
    const response = await this.api.put(`/education/${id}`, data);
    return response.data;
  }

  async deleteEducation(id: string) {
    const response = await this.api.delete(`/education/${id}`);
    return response.data;
  }

  // Portfolio methods
  async getPortfolios(publishedOnly = false) {
    const params = publishedOnly ? { published: 'true' } : {};
    const response = await this.api.get('/portfolio', { params });
    return response.data;
  }

  async getPortfolio(id: string) {
    const response = await this.api.get(`/portfolio/${id}`);
    return response.data;
  }

  async createPortfolio(data: {
    title: string;
    desc: string;
    projectDetails?: string;
    linkTo?: string;
    imageURL: string;
    imageCloudinaryId?: string;
    tech?: string[];
    roles?: string[];
    order?: number;
    isPublished?: boolean;
  }) {
    const response = await this.api.post('/portfolio', data);
    return response.data;
  }

  async updatePortfolio(id: string, data: {
    title?: string;
    desc?: string;
    projectDetails?: string;
    linkTo?: string;
    imageURL?: string;
    imageCloudinaryId?: string;
    tech?: string[];
    roles?: string[];
    order?: number;
    isPublished?: boolean;
  }) {
    const response = await this.api.put(`/portfolio/${id}`, data);
    return response.data;
  }

  async deletePortfolio(id: string) {
    const response = await this.api.delete(`/portfolio/${id}`);
    return response.data;
  }

  // Contact methods
  async getContacts() {
    const response = await this.api.get('/contact');
    return response.data;
  }

  async createContact(data: { name: string; email: string; message: string }) {
    const response = await this.api.post('/contact', data);
    return response.data;
  }

  async markContactAsRead(id: string) {
    const response = await this.api.put(`/contact/${id}/read`);
    return response.data;
  }

  async markContactAsReplied(id: string) {
    const response = await this.api.put(`/contact/${id}/reply`);
    return response.data;
  }

  async deleteContact(id: string) {
    const response = await this.api.delete(`/contact/${id}`);
    return response.data;
  }

  async deleteAllContacts() {
    const response = await this.api.delete('/contact');
    return response.data;
  }

  async getContactStats() {
    const response = await this.api.get('/contact/stats');
    return response.data;
  }

  // File upload methods
  async uploadProfileImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    const response = await this.api.post('/upload/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async uploadPortfolioImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    const response = await this.api.post('/upload/portfolio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async uploadTechToolImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    const response = await this.api.post('/upload/tech-tool', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteImage(cloudinaryId: string) {
    const response = await this.api.delete(`/upload/${cloudinaryId}`);
    return response.data;
  }

  // Role methods
  async getRoles() {
    const response = await this.api.get('/roles');
    return response.data;
  }

  async createRole(data: {
    title: string;
    description?: string;
    color?: string;
    order?: number;
  }) {
    const response = await this.api.post('/roles', data);
    return response.data;
  }

  async updateRole(id: string, data: {
    title?: string;
    description?: string;
    color?: string;
    order?: number;
  }) {
    const response = await this.api.put(`/roles/${id}`, data);
    return response.data;
  }

  async deleteRole(id: string) {
    const response = await this.api.delete(`/roles/${id}`);
    return response.data;
  }

  // AI methods
  async rewriteProjectDetails(data: { projectDetails: string; projectTitle: string }) {
    const response = await this.api.post('/ai/rewrite-project-details', data, {
      timeout: 120000 // 2 minutes for AI processing
    });
    return response.data;
  }

  async createPortfolioFromText(data: { textDescription: string }) {
    const response = await this.api.post('/ai/create-portfolio-from-text', data, {
      timeout: 200000 // 3.5 minutes for AI processing (reasoner model is slower)
    });
    return response.data;
  }

  async testAIConnection() {
    const response = await this.api.get('/ai/test-connection', {
      timeout: 60000 // 1 minute for connection test
    });
    return response.data;
  }

  async getAIStatus() {
    const response = await this.api.get('/ai/status');
    return response.data;
  }

  // Experience methods
  async getExperiences(publishedOnly = false) {
    const params = publishedOnly ? { published: 'true' } : {};
    const response = await this.api.get('/experiences', { params });
    return response.data;
  }

  async getExperience(id: string) {
    const response = await this.api.get(`/experiences/${id}`);
    return response.data;
  }

  async createExperience(data: {
    title: string;
    status: string;
    companyName: string;
    duration: string;
    description: string;
    logoURL?: string;
    logoCloudinaryId?: string;
    order?: number;
    isPublished?: boolean;
  }) {
    const response = await this.api.post('/experiences', data);
    return response.data;
  }

  async updateExperience(id: string, data: {
    title?: string;
    status?: string;
    companyName?: string;
    duration?: string;
    description?: string;
    logoURL?: string;
    logoCloudinaryId?: string;
    order?: number;
    isPublished?: boolean;
  }) {
    const response = await this.api.put(`/experiences/${id}`, data);
    return response.data;
  }

  async deleteExperience(id: string) {
    const response = await this.api.delete(`/experiences/${id}`);
    return response.data;
  }

  async getExperienceStats() {
    const response = await this.api.get('/experiences/stats/overview');
    return response.data;
  }

  async uploadExperienceLogo(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    const response = await this.api.post('/upload/experience', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Health check
  async healthCheck() {
    const response = await this.api.get('/health');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
