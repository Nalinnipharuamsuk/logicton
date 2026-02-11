import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { CompanyInfo, TeamMember, Service, PortfolioItem, SiteConfig } from '@/types';
import {
  companyInfoSchema,
  servicesPayloadSchema,
  portfolioPayloadSchema
} from '@/lib/validation';

// Database connection
const dbConfig = {
  host: 'localhost',
  user: 'myuser',
  password: 'mypassword',
  database: 'mydatabase',
};

// Use content directory relative to project root
const CONTENT_PATH = './content';

// Helper function to read JSON files (fallback for non-database content)
async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const fullPath = path.join(process.cwd(), CONTENT_PATH, filePath);
    console.log(`[readJsonFile] Attempting to read: ${fullPath}`);
    console.log(`[readJsonFile] File exists: ${fs.existsSync(fullPath)}`);
    const fileContent = fs.readFileSync(fullPath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

// Helper function to write JSON files
async function writeJsonFile<T>(filePath: string, data: T): Promise<boolean> {
  try {
    const fullPath = path.join(process.cwd(), CONTENT_PATH, filePath);
    const dir = path.dirname(fullPath);

    console.log(`[writeJsonFile] Attempting to write: ${fullPath}`);

    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      console.log(`[writeJsonFile] Creating directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    return false;
  }
}

// Company content functions (still use JSON)
export async function getCompanyInfo(): Promise<CompanyInfo | null> {
  const data = await readJsonFile<CompanyInfo>('company/info.json');
  const parsed = companyInfoSchema.safeParse(data);
  if (!parsed.success) {
    console.error('Invalid company info content', parsed.error.format());
    return null;
  }
  return parsed.data;
}

export async function updateCompanyInfo(data: CompanyInfo): Promise<boolean> {
  return writeJsonFile('company/info.json', data);
}

// Team content functions (still use JSON)
export async function getTeamMembers(): Promise<TeamMember[]> {
  try {
    const data = await readJsonFile<{ members: TeamMember[] }>('company/team.json');
    if (!data || !data.members) {
      console.error('Invalid team content: data or members is null/undefined');
      return [];
    }
    return data.members;
  } catch (error) {
    console.error('Error in getTeamMembers:', error);
    return [];
  }
}

export async function updateTeamMembers(members: TeamMember[]): Promise<boolean> {
  return writeJsonFile('company/team.json', { members });
}

// Services content functions - FROM JSON FILE
export async function getServices(): Promise<Service[]> {
  console.log('[getServices] Fetching from JSON file...');
  try {
    const data = await readJsonFile<{ services: Service[] }>('services/services.json');
    if (data && data.services) {
      console.log('[getServices] Found services:', data.services.length);
      return data.services;
    }
    return [];
  } catch (error) {
    console.error('[getServices] Error reading JSON file:', error);
    return [];
  }
}

export async function updateServices(services: Service[]): Promise<boolean> {
  console.log('[updateServices] Updating JSON file...');
  try {
    const result = await writeJsonFile('services/services.json', { services });
    if (result) {
      console.log('[updateServices] Services updated successfully');
    }
    return result;
  } catch (error) {
    console.error('[updateServices] Error:', error);
    return false;
  }
}

// Portfolio content functions (still use JSON)
export async function getPortfolioItems(): Promise<PortfolioItem[]> {
  const data = await readJsonFile<{ items: PortfolioItem[] }>('portfolio/items.json');
  const parsed = portfolioPayloadSchema.safeParse(data);
  if (!parsed.success) {
    console.error('Invalid portfolio content', parsed.error.format());
    return [];
  }
  return parsed.data.items;
}

export async function updatePortfolioItems(items: PortfolioItem[]): Promise<boolean> {
  return writeJsonFile('portfolio/items.json', { items });
}

// Site configuration functions (still use JSON)
export async function getSiteConfig(): Promise<SiteConfig | null> {
  return await readJsonFile<SiteConfig>('settings/site-config.json');
}

// Utility functions
export function generateId(prefix: string = 'item'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-z0-9.-]/gi, '_').toLowerCase();
}
