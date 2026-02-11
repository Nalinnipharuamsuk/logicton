// Company Information Types
export interface CompanyInfo {
  id: string;
  name: string;
  description: {
    th: string;
    en: string;
  };
  mission: {
    th: string;
    en: string;
  };
  vision: {
    th: string;
    en: string;
  };
  history: {
    th: string;
    en: string;
  };
  foundedYear: number;
  location: string;
  updatedAt: string;
}

// Team Member Types
export interface TeamMember {
  id: string;
  name: {
    th: string;
    en: string;
  };
  role: {
    th: string;
    en: string;
  };
  bio: {
    th: string;
    en: string;
  };
  photo: string;
  email?: string;
  linkedin?: string;
  order: number;
  isActive: boolean;
}

// Service Types
export interface Service {
  id: string;
  title: {
    th: string;
    en: string;
  };
  description: {
    th: string;
    en: string;
  };
  features: {
    th: string[];
    en: string[];
  };
  technologies: string[];
  icon: string;
  category: 'web' | 'mobile' | 'animation' | 'framework';
  order: number;
  isActive: boolean;
  howWeWork?: {
    th: Array<{
      title: string;
      description: string;
    }>;
    en: Array<{
      title: string;
      description: string;
    }>;
  };
}

// Portfolio Types
export interface PortfolioItem {
  id: string;
  title: {
    th: string;
    en: string;
  };
  description: {
    th: string;
    en: string;
  };
  client: {
    name: string;
    industry: string;
  };
  technologies: string[];
  images: string[];
  demoUrl?: string;
  githubUrl?: string;
  category: 'web' | 'mobile' | 'animation' | 'framework';
  completedDate: string;
  featured: boolean;
  isActive: boolean;
}

// Contact Types
export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  language: 'th' | 'en';
  submittedAt: string;
  status: 'new' | 'read';
  ipAddress: string;
}

// Site Configuration Types
export interface SiteConfig {
  siteName?: {
    th: string;
    en: string;
  };
  siteDescription?: {
    th: string;
    en: string;
  };
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: {
      th: string;
      en: string;
    };
  };
  socialMedia?: {
    facebook?: string;
    linkedin?: string;
    twitter?: string;
  };
  seo?: {
    keywords: {
      th: string[];
      en: string[];
    };
  };
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Locale Types
export type Locale = 'th' | 'en';

// Common Props Types
export interface LocalizedContent {
  th: string;
  en: string;
}

export interface BaseEntity {
  id: string;
  isActive: boolean;
  updatedAt?: string;
  createdAt?: string;
}