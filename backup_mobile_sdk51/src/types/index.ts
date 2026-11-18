export type Role = 'CUSTOMER' | 'PANDIT' | 'ADMIN' | 'SUPPORT';

export interface User {
  id: string;
  email: string;
  role: Role;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  customerProfile?: CustomerProfile;
  panditProfile?: PanditProfile;
}

export interface CustomerProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  city?: string;
  state?: string;
}

export interface PanditProfile {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl?: string;
  experienceYears: number;
  languages: string[];
  specializations: string[];
  city: string;
  state: string;
  serviceAreas?: string[];
  bio?: string;
  basePrice?: number;
  averageRating: number;
  rating?: number;
  totalReviews: number;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  rejectionReason?: string;
  isAvailable?: boolean;
  user?: {
    id?: string;
    firstName: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
  };
}

export interface PanditDocument {
  id: string;
  panditProfileId: string;
  documentType: string;
  documentNumber?: string;
  fileUrl: string;
  isVerified: boolean;
  status?: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface PujaCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  _count?: { pujas: number };
}

export type Category = PujaCategory;

export interface Puja {
  id: string;
  categoryId: string;
  title: string;
  slug: string;
  description: string;
  basePrice: number | string;
  samagriPrice?: number | string;
  durationMinutes: number;
  requiredPandits?: number;
  languages?: string[];
  requiredSamagri?: string[];
  imageUrl?: string;
  category?: { id: string; name: string; slug: string };
  panditServices?: Array<{
    panditProfile: PanditProfile;
    customPrice?: number;
  }>;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  discountPrice?: number;
  stockQuantity: number;
  images?: string[];
  isActive?: boolean;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  cartId: string;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
}

export interface Booking {
  id: string;
  bookingNumber?: string;
  customerProfileId?: string;
  panditProfileId?: string;
  pujaId: string;
  pujaDate: string;
  bookingDate?: string;
  pujaTimeSlot: string;
  timeSlot?: string;
  pujaLanguage?: string;
  venueAddress: string;
  address?: {
    street: string;
    city: string;
    state?: string;
    postalCode?: string;
  };
  city: string;
  pincode: string;
  includeSamagri: boolean;
  pujaFee?: number;
  samagriFee?: number;
  platformFee?: number;
  totalAmount: number;
  totalPrice?: number | string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  specialInstructions?: string;
  cancellationReason?: string;
  createdAt?: string;
  puja?: {
    id: string;
    title: string;
    slug?: string;
    imageUrl?: string;
    durationMinutes?: number;
  };
  panditProfile?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    city: string;
    averageRating?: number;
  };
  pandit?: {
    id: string;
    basePrice?: number;
    city?: string;
    user?: {
      firstName: string;
      lastName?: string;
    };
  };
  customerProfile?: {
    id: string;
    firstName: string;
    lastName?: string;
  };
  customer?: {
    firstName: string;
    lastName?: string;
  };
}

export interface Address {
  id: string;
  customerProfileId?: string;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface OrderItem {
  id: string;
  orderId?: string;
  productId?: string;
  quantity: number;
  price?: number;
  unitPrice?: number;
  totalPrice?: number;
  product?: Product;
}

export interface Order {
  id: string;
  orderNumber?: string;
  subtotal?: number;
  shippingFee?: number;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt?: string;
  items?: OrderItem[];
  orderItems?: OrderItem[];
  shippingAddress?: Address;
}
