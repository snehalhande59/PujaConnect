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

declare const process: any;
declare const __DEV__: boolean;

export const PRODUCTION_API_URL = 'https://pujaconnect-api-he9b.onrender.com/api/v1';

// Dynamic host determination:
// 1. Explicit EXPO_PUBLIC_API_URL environment variable has top priority.
// 2. Constants extra apiUrl from app.json
// 3. Defaults to live HTTPS production Render API URL.
export const getApiBaseUrl = (): string => {
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  const extraUrl = Constants.expoConfig?.extra?.apiUrl;
  if (extraUrl) {
    return extraUrl;
  }
  return PRODUCTION_API_URL;
};

export const API_BASE_URL = getApiBaseUrl();

// Storage keys
const TOKEN_KEY = 'devsutra_auth_token';
const USER_KEY = 'devsutra_user_profile';
const BOOKINGS_KEY = 'devsutra_local_bookings';

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

// Helper to perform fetch with timeout to prevent hanging connections
function fetchWithTimeout(
  url: string,
  options: RequestInit,
  headers: Record<string, string>,
  timeoutMs: number = 45000,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, {
    ...options,
    headers,
    signal: controller.signal,
  }).finally(() => clearTimeout(timeoutId));
}

async function handleApiResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = Array.isArray(payload.message)
      ? payload.message.join(', ')
      : payload.message || `Request failed with status ${response.status}`;
    const err: any = new Error(errorMsg);
    err.isApiError = true;
    err.status = response.status;
    throw err;
  }

  // NestJS TransformInterceptor wraps in { success: true, data: ... }
  if (payload.data !== undefined) {
    return payload.data?.data !== undefined ? payload.data.data : payload.data;
  }

  return payload as T;
}

// Production HTTPS API fetch wrapper (supports any Wi-Fi network and Cellular Mobile Data worldwide)
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

  // 45s timeout handles cloud cold-starts comfortably across Mobile Data and Wi-Fi
  const timeoutMs = 45000;
  const targetUrl = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetchWithTimeout(targetUrl, options, headers, timeoutMs);
    return await handleApiResponse<T>(response);
  } catch (err: any) {
    // If the server answered with an HTTP validation or business error, return it immediately
    if (err?.isApiError) {
      throw err;
    }

    if (err?.name === 'AbortError') {
      throw new Error(
        'Connecting to DevSutra cloud server timed out. If the server is waking up, please retry in a few moments.',
      );
    }

    const isNetworkErr =
      err?.message?.includes('SocketException') ||
      err?.message?.includes('Connection reset') ||
      err?.message?.includes('Network request failed') ||
      err?.message?.includes('fetch failed') ||
      err?.message?.includes('Failed to fetch') ||
      err?.message?.includes('Network Error');

    if (isNetworkErr) {
      throw new Error(
        'Unable to connect to DevSutra servers. Please check your internet connection (Wi-Fi or Mobile Data) and try again.',
      );
    }

    throw new Error(
      err?.message || 'Unable to connect to DevSutra servers. Please try again.',
    );
  }
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

  async sendCustomerOtp(identifier: string, channel: 'email' | 'sms' = 'email') {
    const trimmed = identifier.trim();
    const isEmail = trimmed.includes('@');
    const resolvedChannel = channel || (isEmail ? 'email' : 'sms');

    const body: Record<string, any> = {
      identifier: trimmed,
      channel: resolvedChannel,
    };
    if (isEmail) {
      body.email = trimmed;
    } else {
      body.phoneNumber = trimmed;
    }

    return apiRequest('/auth/customer/send-otp', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async verifyCustomerOtp(identifier: string, otp: string, fullName?: string) {
    const trimmed = identifier.trim();
    const isEmail = trimmed.includes('@');

    const body: Record<string, any> = {
      identifier: trimmed,
      channel: isEmail ? 'email' : 'sms',
      otp: otp.trim(),
    };
    if (isEmail) {
      body.email = trimmed;
    } else {
      body.phoneNumber = trimmed;
    }
    if (fullName && fullName.trim()) {
      body.fullName = fullName.trim();
    }

    const res = await apiRequest('/auth/customer/verify-otp', {
      method: 'POST',
      body: JSON.stringify(body),
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
