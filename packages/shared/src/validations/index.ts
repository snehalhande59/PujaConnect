import { z } from 'zod';
import { UserRole, BookingStatus, PanditVerificationStatus } from '../constants';

export const registerCustomerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  firstName: z.string().min(2, 'First name must have at least 2 characters'),
  lastName: z.string().min(2, 'Last name must have at least 2 characters'),
  phoneNumber: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number'),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerPanditSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  phoneNumber: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number'),
  experienceYears: z.number().int().min(1, 'Experience must be at least 1 year'),
  languages: z.array(z.string()).min(1, 'Select at least one language'),
  specializations: z.array(z.string()).min(1, 'Select at least one specialization'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  serviceAreas: z.array(z.string()).min(1, 'Provide at least one service locality'),
  bio: z.string().optional(),
});

export const createBookingSchema = z.object({
  panditId: z.string().uuid('Invalid Pandit ID'),
  pujaId: z.string().uuid('Invalid Puja ID'),
  pujaDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
  pujaTimeSlot: z.string().min(3, 'Time slot is required'),
  pujaLanguage: z.string().min(2, 'Puja language is required'),
  venueAddress: z.string().min(5, 'Full venue address is required'),
  city: z.string().min(2, 'City is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit PIN code'),
  includeSamagri: z.boolean().default(false),
  specialInstructions: z.string().max(500).optional(),
});

export type RegisterCustomerInput = z.infer<typeof registerCustomerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterPanditInput = z.infer<typeof registerPanditSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
