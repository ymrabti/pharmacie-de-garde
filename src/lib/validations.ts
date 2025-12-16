/**
 * Zod Validation Schemas
 * Centralized validation for all forms and API inputs
 */
import { z } from 'zod';

// User registration schema
export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  confirmPassword: z.string(),
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

// Pharmacy profile schema (for creation - all required fields)
export const pharmacySchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  address: z.string().min(5, 'Adresse requise'),
  city: z.string().min(2, 'Ville requise'),
  district: z.string().optional(),
  phone: z.string().min(8, 'Numéro de téléphone invalide'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  description: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  openingHours: z.any().optional(),
});

// Pharmacy update schema (for profile updates - partial, no lat/lng required)
export const pharmacyUpdateSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
  address: z.string().min(5, 'Adresse requise').optional(),
  city: z.string().min(2, 'Ville requise').optional(),
  district: z.string().optional(),
  phone: z.string().min(8, 'Numéro de téléphone invalide').optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  description: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  openingHours: z.any().optional(),
});

// Duty period schema
export const dutyPeriodSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  notes: z.string().optional(),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: 'La date de fin doit être après la date de début',
  path: ['endDate'],
});

// Rating schema
export const ratingSchema = z.object({
  score: z.number().min(1).max(5),
  comment: z.string().max(500).optional(),
  pharmacyId: z.string(),
});

// Feedback schema
export const feedbackSchema = z.object({
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères').max(1000),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  pharmacyId: z.string().optional(),
});

// Blog post schema
export const blogPostSchema = z.object({
  title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Le slug ne doit contenir que des lettres minuscules, chiffres et tirets'),
  excerpt: z.string().min(20, 'L\'extrait doit contenir au moins 20 caractères').max(300),
  content: z.string().min(100, 'Le contenu doit contenir au moins 100 caractères'),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  isPublished: z.boolean().default(false),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

// Invitation schema
export const invitationSchema = z.object({
  email: z.string().email('Email invalide'),
});

// Search/Filter schema
export const searchSchema = z.object({
  city: z.string().optional(),
  district: z.string().optional(),
  date: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radius: z.number().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PharmacyInput = z.infer<typeof pharmacySchema>;
export type PharmacyUpdateInput = z.infer<typeof pharmacyUpdateSchema>;
export type DutyPeriodInput = z.infer<typeof dutyPeriodSchema>;
export type RatingInput = z.infer<typeof ratingSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;
export type BlogPostInput = z.infer<typeof blogPostSchema>;
export type InvitationInput = z.infer<typeof invitationSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
