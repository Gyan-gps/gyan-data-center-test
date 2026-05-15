import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export const assetFilterSchema = z.object({
  searchTerm: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  operator: z.string().optional(),
  isActive: z.boolean().optional(),
})

export const itLoadFilterSchema = z.object({
  startYear: z.number().min(2016).max(2030),
  endYear: z.number().min(2016).max(2030),
  assetIds: z.array(z.string()).optional(),
  region: z.string().optional(),
  country: z.string().optional(),
})

export const contactFormSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name must contain only letters and spaces'),
  email: z.string()
    .email('Please enter a valid email address')
    .refine((email) => {
      // Basic business email validation - reject common personal email domains
      const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com']
      const domain = email.split('@')[1]?.toLowerCase()
      return !personalDomains.includes(domain)
    }, 'Please enter a valid business email address'),
  company: z.string()
    .min(1, 'Company name is required')
    .max(200, 'Company name must be less than 200 characters'),
  phone: z.string()
    .optional()
    .refine((phone) => {
      if (!phone) return true
      return /^[0-9\s\-+()]+$/.test(phone) && phone.replace(/\D/g, '').length >= 10
    }, 'Please enter a valid phone number'),
  countryCode: z.string().optional(),
  countryName: z.string().optional(),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters')
    .refine((message) => message.trim().length > 0, 'Message cannot be empty')
})
