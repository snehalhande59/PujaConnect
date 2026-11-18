import {
  UserRole,
  BookingStatus,
  PanditVerificationStatus,
  PaymentStatus,
  PaymentMethod,
  OrderStatus,
  TicketStatus,
  TicketPriority,
} from '../constants';

export interface BaseEntity {
  id: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface UserDto extends BaseEntity {
  email: string;
  phoneNumber?: string | null;
  role: UserRole;
  isActive: boolean;
  customerProfile?: CustomerProfileDto | null;
  panditProfile?: PanditProfileDto | null;
}

export interface CustomerProfileDto extends BaseEntity {
  userId: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
}

export interface PanditProfileDto extends BaseEntity {
  userId: string;
  fullName: string;
  avatarUrl?: string | null;
  experienceYears: number;
  languages: string[];
  specializations: string[];
  city: string;
  state: string;
  serviceAreas: string[];
  bio?: string | null;
  verificationStatus: PanditVerificationStatus;
  rejectionReason?: string | null;
  averageRating: number;
  totalReviews: number;
  isAvailable: boolean;
  basePrice?: number | null;
}

export interface PujaDto extends BaseEntity {
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  basePrice: number;
  samagriPrice: number;
  durationMinutes: number;
  requiredPandits: number;
  languages: string[];
  requiredSamagri: string[];
  imageUrl?: string | null;
  isActive: boolean;
}

export interface BookingDto extends BaseEntity {
  bookingNumber: string;
  customerId: string;
  panditId: string;
  pujaId: string;
  pujaDate: string;
  pujaTimeSlot: string;
  pujaLanguage: string;
  venueAddress: string;
  city: string;
  pincode: string;
  includeSamagri: boolean;
  pujaFee: number;
  samagriFee: number;
  platformFee: number;
  totalAmount: number;
  status: BookingStatus;
  specialInstructions?: string | null;
}

export interface ProductDto extends BaseEntity {
  name: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  discountPrice?: number | null;
  stockQuantity: number;
  images: string[];
  isActive: boolean;
}

export interface CartItemDto {
  productId: string;
  quantity: number;
  product?: ProductDto;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}
