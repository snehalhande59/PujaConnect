export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  PANDIT = 'PANDIT',
  ADMIN = 'ADMIN',
  SUPPORT = 'SUPPORT',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PanditVerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  RAZORPAY = 'RAZORPAY',
  CASH = 'CASH',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export const PUJA_LANGUAGES = [
  'Hindi',
  'Sanskrit',
  'Marathi',
  'Gujarati',
  'Bengali',
  'Tamil',
  'Telugu',
  'Kannada',
  'Odia',
  'English',
] as const;

export const INITIAL_PUJA_CATEGORIES = [
  { name: 'Griha Pravesh Puja', slug: 'griha-pravesh-puja', description: 'Sacred house warming ceremonies for auspicious new beginnings' },
  { name: 'Satyanarayan Puja', slug: 'satyanarayan-puja', description: 'Blessings of Lord Vishnu for harmony, prosperity and peace' },
  { name: 'Ganesh Puja', slug: 'ganesh-puja', description: 'Invocation of Lord Ganesha for removing obstacles in all endeavors' },
  { name: 'Vastu Shanti', slug: 'vastu-shanti', description: 'Rectification of architectural defects and infusing positive cosmic energy' },
  { name: 'Navgraha Shanti', slug: 'navgraha-shanti', description: 'Appeasing nine planetary deities to alleviate astrological doshas' },
  { name: 'Rudrabhishek', slug: 'rudrabhishek', description: 'Powerful Abhishek ritual dedicated to Lord Shiva for health and protection' },
  { name: 'Marriage Puja', slug: 'marriage-puja', description: 'Traditional Vedic wedding rites and sacred marital bond consecration' },
  { name: 'Havan', slug: 'havan', description: 'Sacred fire offerings fostering spiritual purification and ambient cleansing' },
  { name: 'Mangal Dosh Puja', slug: 'mangal-dosh-puja', description: 'Rites to mitigate Mars affliction for relationship bliss' },
] as const;

export const SAMAGRI_CATEGORIES = [
  'Puja Kits',
  'Kalash',
  'Pooja Thali',
  'Incense Sticks',
  'Diya',
  'Flowers and Garlands',
  'Rudraksha',
  'Religious Books',
  'Festival Products',
] as const;
