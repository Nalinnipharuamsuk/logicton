import { z } from 'zod';

export const localizedStringSchema = z.object({
  th: z.string().min(1),
  en: z.string().min(1)
});

export const companyInfoSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: localizedStringSchema,
  mission: localizedStringSchema,
  vision: localizedStringSchema,
  history: localizedStringSchema,
  foundedYear: z.number().int(),
  location: z.string().min(1),
  updatedAt: z.string().min(1)
});

export const teamMemberSchema = z.object({
  id: z.string().min(1),
  name: localizedStringSchema,
  role: localizedStringSchema,
  bio: z.object({
    th: z.string().optional().default(''),
    en: z.string().optional().default('')
  }),
  photo: z.string().optional().default(''),
  email: z.string().optional(),
  linkedin: z.string().optional(),
  order: z.number().int().default(1),
  isActive: z.boolean().default(true)
});

export const serviceSchema = z.object({
  id: z.string().min(1),
  title: localizedStringSchema,
  description: localizedStringSchema,
  features: z.object({
    th: z.array(z.string().min(1)),
    en: z.array(z.string().min(1))
  }),
  technologies: z.array(z.string().min(1)),
  icon: z.string().min(1),
  category: z.enum(['web', 'mobile', 'animation', 'framework']),
  order: z.number().int(),
  isActive: z.boolean(),
  howWeWork: z.object({
    th: z.array(z.object({
      title: z.string(),
      description: z.string()
    })).optional(),
    en: z.array(z.object({
      title: z.string(),
      description: z.string()
    })).optional()
  }).optional()
});

export const portfolioItemSchema = z.object({
  id: z.string().min(1),
  title: localizedStringSchema,
  description: localizedStringSchema,
  client: z.object({
    name: z.string().min(1),
    industry: z.string().min(1)
  }),
  technologies: z.array(z.string().min(1)),
  images: z.array(z.string().min(1)),
  demoUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  category: z.enum(['web', 'mobile', 'animation', 'framework']),
  completedDate: z.string().min(1),
  featured: z.boolean(),
  isActive: z.boolean()
});

export const contactInquirySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  subject: z.string().min(1),
  message: z.string().min(1),
  language: z.enum(['th', 'en']),
  submittedAt: z.string().min(1),
  status: z.enum(['new', 'read']),
  ipAddress: z.string().min(1)
});

export const siteConfigSchema = z.object({
  siteName: localizedStringSchema.optional(),
  siteDescription: localizedStringSchema.optional(),
  contactInfo: z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: localizedStringSchema.optional()
  }).optional(),
  socialMedia: z.object({
    facebook: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    twitter: z.string().url().optional()
  }).optional(),
  seo: z.object({
    keywords: z.object({
      th: z.array(z.string().min(1)),
      en: z.array(z.string().min(1))
    })
  }).optional()
});

export const teamPayloadSchema = z.object({
  members: z.array(teamMemberSchema)
});

export const servicesPayloadSchema = z.object({
  services: z.array(serviceSchema)
});

export const portfolioPayloadSchema = z.object({
  items: z.array(portfolioItemSchema)
});

export const contactPayloadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  subject: z.string().min(1),
  message: z.string().min(1),
  language: z.enum(['th', 'en']).default('th')
});