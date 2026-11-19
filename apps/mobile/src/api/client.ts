import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import {
  Puja,
  PujaCategory,
  PanditProfile,
  PanditDocument,
  Product,
  Cart,
  Booking,
  Order,
  Address,
} from '../types';

// Default host determination for Android Emulator vs Device vs Local Web
const getBaseUrl = (): string => {
  // If explicitly configured in app.json extra
  const configUrl = Constants.expoConfig?.extra?.apiUrl;
  if (configUrl) return configUrl;

 if (Platform.OS === 'android') {
  return 'http://192.168.1.3:3001/api/v1';
}  return 'http://localhost:3001/api/v1';
};

export const API_BASE_URL = getBaseUrl();

// Storage keys
const TOKEN_KEY = 'pujaconnect_auth_token';
const USER_KEY = 'pujaconnect_user_profile';
const BOOKINGS_KEY = 'pujaconnect_local_bookings';

// In-memory fallback for platforms where SecureStore is not accessible
let memoryToken: string | null = null;
let memoryUser: any = null;
let memoryBookings: Booking[] = [];

export const storage = {
  async setToken(token: string) {
    memoryToken = token;
    try {
      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      }
    } catch (e) {
      // Fallback in memory
    }
  },

  async getToken(): Promise<string | null> {
    if (memoryToken) return memoryToken;
    try {
      if (Platform.OS !== 'web') {
        const stored = await SecureStore.getItemAsync(TOKEN_KEY);
        if (stored) {
          memoryToken = stored;
          return stored;
        }
      }
    } catch (e) {
      // ignore
    }
    return memoryToken;
  },

  async setUser(user: any) {
    memoryUser = user;
    try {
      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
      }
    } catch (e) {
      // ignore
    }
  },

  async getUser(): Promise<any | null> {
    if (memoryUser) return memoryUser;
    try {
      if (Platform.OS !== 'web') {
        const stored = await SecureStore.getItemAsync(USER_KEY);
        if (stored) {
          memoryUser = JSON.parse(stored);
          return memoryUser;
        }
      }
    } catch (e) {
      // ignore
    }
    return memoryUser;
  },

  async saveBooking(booking: Booking) {
    memoryBookings = [booking, ...memoryBookings.filter((b) => b.id !== booking.id)];
    try {
      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync(BOOKINGS_KEY, JSON.stringify(memoryBookings));
      }
    } catch (e) {
      // ignore
    }
  },

  async getLocalBookings(): Promise<Booking[]> {
    try {
      if (Platform.OS !== 'web') {
        const stored = await SecureStore.getItemAsync(BOOKINGS_KEY);
        if (stored) {
          memoryBookings = JSON.parse(stored);
        }
      }
    } catch (e) {
      // ignore
    }
    return memoryBookings;
  },

  async clear() {
    memoryToken = null;
    memoryUser = null;
    try {
      if (Platform.OS !== 'web') {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
      }
    } catch (e) {
      // ignore
    }
  },
};

// Generic fetch wrapper
async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await storage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = Array.isArray(payload.message)
      ? payload.message.join(', ')
      : payload.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  // NestJS TransformInterceptor wraps in { success: true, data: ... }
  if (payload.data !== undefined) {
    // If double-wrapped, unwrap once
    return payload.data?.data !== undefined ? payload.data.data : payload.data;
  }

  return payload as T;
}

// -------------------------------------------------------------
// API CLIENT METHODS
// -------------------------------------------------------------

export const api = {
  // --- AUTHENTICATION ---
  async loginCustomer(email: string, password: string) {
    const res = await apiRequest('/auth/customer/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim(), password }),
    });
    if (res.token && res.user) {
      await storage.setToken(res.token);
      await storage.setUser(res.user);
    }
    return res;
  },

  async registerCustomer(params: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  }) {
    const res = await apiRequest('/auth/customer/register', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    if (res.token && res.user) {
      await storage.setToken(res.token);
      await storage.setUser(res.user);
    }
    return res;
  },

  async loginPandit(email: string, password: string) {
    const res = await apiRequest('/auth/pandit/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim(), password }),
    });
    if (res.token && res.user) {
      await storage.setToken(res.token);
      await storage.setUser(res.user);
    }
    return res;
  },

  async registerPandit(params: {
    email: string;
    password: string;
    phoneNumber: string;
    fullName: string;
    experienceYears?: number;
    languages: string[];
    specializations: string[];
    city: string;
    state: string;
    bio?: string;
    basePrice?: number;
  }) {
    const res = await apiRequest('/auth/pandit/register', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    if (res.token && res.user) {
      await storage.setToken(res.token);
      await storage.setUser(res.user);
    }
    return res;
  },

  async getMe() {
    return apiRequest('/auth/me');
  },

  async logout() {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (e) {
      // continue local cleanup
    }
    await storage.clear();
  },

  // --- CATEGORIES & PUJAS ---
  async getCategories(): Promise<PujaCategory[]> {
    return apiRequest<PujaCategory[]>('/categories');
  },

  async getPujas(params?: { categoryId?: string; search?: string }): Promise<Puja[]> {
    const query = new URLSearchParams();
    if (params?.categoryId) query.append('categoryId', params.categoryId);
    if (params?.search) query.append('search', params.search);
    const qs = query.toString();
    return apiRequest<Puja[]>(`/pujas${qs ? `?${qs}` : ''}`);
  },

  async getPujaDetails(idOrSlug: string): Promise<Puja> {
    return apiRequest<Puja>(`/pujas/${idOrSlug}`);
  },

  // --- PANDITS MARKETPLACE ---
  async getVerifiedPandits(params?: {
    city?: string;
    search?: string;
    specialization?: string;
    language?: string;
  }): Promise<PanditProfile[]> {
    const query = new URLSearchParams();
    if (params?.city) query.append('city', params.city);
    if (params?.search) query.append('search', params.search);
    if (params?.specialization) query.append('specialization', params.specialization);
    if (params?.language) query.append('language', params.language);
    const qs = query.toString();
    return apiRequest<PanditProfile[]>(`/pandits${qs ? `?${qs}` : ''}`);
  },

  async getPandits(params?: {
    city?: string;
    search?: string;
    specialization?: string;
    language?: string;
  }): Promise<PanditProfile[]> {
    return this.getVerifiedPandits(params);
  },

  async getPanditDetails(id: string): Promise<PanditProfile> {
    return apiRequest<PanditProfile>(`/pandits/${id}`);
  },

  // --- PANDIT PORTAL (AUTHENTICATED) ---
  async getMyPanditProfile(): Promise<PanditProfile> {
    return apiRequest<PanditProfile>('/pandits/me/profile');
  },

  async getMyPanditDocuments(): Promise<PanditDocument[]> {
    return apiRequest<PanditDocument[]>('/pandits/me/documents');
  },

  async uploadPanditDocument(formData: FormData): Promise<PanditDocument> {
    const token = await storage.getToken();
    const response = await fetch(`${API_BASE_URL}/pandits/me/documents`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.message || 'Document upload failed.');
    }
    return payload.data?.data || payload.data;
  },

  async deletePanditDocument(id: string) {
    return apiRequest(`/pandits/me/documents/${id}`, { method: 'DELETE' });
  },

  async resubmitPanditVerification(): Promise<PanditProfile> {
    return apiRequest<PanditProfile>('/pandits/me/resubmit', { method: 'POST' });
  },

  // --- BOOKINGS ---
  async createBooking(params: {
    pujaId: string;
    panditProfileId: string;
    pujaDate: string;
    pujaTimeSlot: string;
    pujaLanguage: string;
    venueAddress: string;
    city: string;
    pincode: string;
    includeSamagri?: boolean;
    specialInstructions?: string;
    customerName?: string;
    customerPhone?: string;
    paymentMethod?: string;
    paymentStatus?: string;
    transactionId?: string;
  }): Promise<Booking> {
    return apiRequest<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async getMyCustomerBookings(): Promise<Booking[]> {
    return this.getMyBookings();
  },

  async getMyBookings(): Promise<Booking[]> {
    try {
      const serverBookings = await apiRequest<Booking[]>('/bookings/my');
      const localBookings = await storage.getLocalBookings();
      const combined = [...(localBookings || []), ...(serverBookings || [])];
      // remove duplicate ids while preserving order
      const map = new Map<string, Booking>();
      for (const b of combined) {
        if (b && b.id && !map.has(b.id)) {
          map.set(b.id, b);
        }
      }
      return Array.from(map.values());
    } catch (e) {
      return storage.getLocalBookings();
    }
  },

  async getMyPanditBookings(): Promise<Booking[]> {
    return apiRequest<Booking[]>('/bookings/pandit');
  },

  async getBookingDetails(id: string): Promise<Booking> {
    return apiRequest<Booking>(`/bookings/${id}`);
  },

  async acceptBooking(id: string): Promise<Booking> {
    return apiRequest<Booking>(`/bookings/${id}/accept`, { method: 'PATCH' });
  },

  async rejectBooking(id: string, reason?: string): Promise<Booking> {
    return apiRequest<Booking>(`/bookings/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  },

  async cancelBooking(id: string, reason?: string): Promise<Booking> {
    return apiRequest<Booking>(`/bookings/${id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  },

  // --- STORE & PRODUCTS ---
  async getProducts(params?: { category?: string; search?: string }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    const qs = query.toString();
    return apiRequest<Product[]>(`/products${qs ? `?${qs}` : ''}`);
  },

  async getProductDetails(idOrSlug: string): Promise<Product> {
    return apiRequest<Product>(`/products/${idOrSlug}`);
  },

  // --- CART ---
  async getCart(): Promise<Cart> {
    return apiRequest<Cart>('/cart');
  },

  async addToCart(productId: string, quantity: number = 1): Promise<Cart> {
    return apiRequest<Cart>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  },

  async updateCartItem(id: string, quantity: number): Promise<Cart> {
    return apiRequest<Cart>(`/cart/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
  },

  async removeCartItem(id: string): Promise<Cart> {
    return apiRequest<Cart>(`/cart/items/${id}`, { method: 'DELETE' });
  },

  async clearCart() {
    return apiRequest('/cart/clear', { method: 'DELETE' });
  },

  // --- ORDERS ---
  async createOrder(shippingAddressId: string): Promise<Order> {
    return apiRequest<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify({ shippingAddressId }),
    });
  },

  async getMyOrders(): Promise<Order[]> {
    return apiRequest<Order[]>('/orders/my');
  },

  // --- CUSTOMER PROFILE & ADDRESSES ---
  async getCustomerProfile() {
    return apiRequest('/customers/me');
  },

  async updateCustomerProfile(data: { firstName?: string; lastName?: string; city?: string; state?: string }) {
    return apiRequest('/customers/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async getAddresses(): Promise<Address[]> {
    return apiRequest<Address[]>('/customers/addresses');
  },

  async addAddress(params: {
    fullName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2?: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    isDefault?: boolean;
  }): Promise<Address> {
    return apiRequest<Address>('/customers/addresses', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async deleteAddress(id: string) {
    return apiRequest(`/customers/addresses/${id}`, { method: 'DELETE' });
  },
};
