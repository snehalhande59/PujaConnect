/**
 * DevSutra Authentication Client Library
 * Handles secure communication with the DevSutra NestJS API
 */

export interface AuthUser {
  id: string;
  email: string;
  role: 'CUSTOMER' | 'PANDIT' | 'ADMIN' | 'SUPPORT';
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: AuthUser;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

/**
 * Retrieve the saved auth token from cookie or localStorage safely
 */
export function getClientToken(): string | null {
  if (typeof window === 'undefined') return null;

  // 1. Try reading from cookie
  const cookieMatch = document.cookie.match(/(?:^|;\s*)devsutra_token=([^;]+)/);
  if (cookieMatch && cookieMatch[1]) {
    return decodeURIComponent(cookieMatch[1]);
  }

  // 2. Try localStorage token fallback
  return localStorage.getItem('devsutra_auth_token');
}

/**
 * Save auth token & user profile safely in client (NEVER stores passwords)
 */
export function saveClientSession(token: string, user: AuthUser) {
  if (typeof window === 'undefined') return;

  // Set secure cookie accessible to standard domain
  document.cookie = `devsutra_token=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax`;
  localStorage.setItem('devsutra_auth_token', token);
  localStorage.setItem('devsutra_user_profile', JSON.stringify(user));
}

/**
 * Clear client session on logout
 */
export function clearClientSession() {
  if (typeof window === 'undefined') return;

  document.cookie = 'devsutra_token=; path=/; max-age=0; SameSite=Lax';
  localStorage.removeItem('devsutra_auth_token');
  localStorage.removeItem('devsutra_user_profile');
}

/**
 * Retrieve saved user profile
 */
export function getSavedUserProfile(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('devsutra_user_profile');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Retrieve authorization headers for authenticated API requests
 */
export function getAuthHeaders(): HeadersInit {
  const token = getClientToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Authenticate customer / devotee with email and password
 */
export async function loginCustomer(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/customer/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email: email.trim(), password }),
  });

  const payload = await response.json();

  if (!response.ok) {
    const errorMessage = Array.isArray(payload.message)
      ? payload.message.join(', ')
      : payload.message || 'Authentication failed. Please check your credentials.';
    throw new Error(errorMessage);
  }

  // Interceptor wraps data in data payload
  const resultData = payload.data || payload;
  if (resultData.token && resultData.user) {
    saveClientSession(resultData.token, resultData.user);
  }

  return {
    success: true,
    message: resultData.message || 'Login successful',
    token: resultData.token,
    user: resultData.user,
  };
}

/**
 * Send Customer OTP for login / registration (Email OTP active)
 */
export async function sendCustomerOtp(
  identifier: string,
  channel: 'email' | 'sms' = 'email',
): Promise<{ success: boolean; message: string; cooldownSeconds?: number }> {
  const response = await fetch(`${API_BASE_URL}/auth/customer/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: identifier.includes('@') ? identifier.trim() : undefined,
      phoneNumber: !identifier.includes('@') ? identifier.trim() : undefined,
      identifier: identifier.trim(),
      channel,
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    const errorMessage = Array.isArray(payload.message)
      ? payload.message.join(', ')
      : payload.message || 'Failed to send verification code.';
    throw new Error(errorMessage);
  }

  const resultData = payload.data || payload;
  return {
    success: true,
    message: resultData.message || 'Verification code sent.',
    cooldownSeconds: resultData.cooldownSeconds || 60,
  };
}

/**
 * Verify Customer OTP and complete login / registration
 */
export async function verifyCustomerOtp(
  identifier: string,
  otp: string,
  fullName?: string,
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/customer/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      email: identifier.includes('@') ? identifier.trim() : undefined,
      phoneNumber: !identifier.includes('@') ? identifier.trim() : undefined,
      identifier: identifier.trim(),
      otp: otp.trim(),
      fullName: fullName?.trim() || undefined,
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    const errorMessage = Array.isArray(payload.message)
      ? payload.message.join(', ')
      : payload.message || 'Invalid or expired verification code.';
    throw new Error(errorMessage);
  }

  const resultData = payload.data || payload;
  if (resultData.token && resultData.user) {
    saveClientSession(resultData.token, resultData.user);
  }

  return {
    success: true,
    message: resultData.message || 'Authentication successful.',
    token: resultData.token,
    user: resultData.user,
  };
}

/**
 * Authenticate Vedic Pandit with email and password
 */
export async function loginPandit(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/pandit/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email: email.trim(), password }),
  });

  const payload = await response.json();

  if (!response.ok) {
    const errorMessage = Array.isArray(payload.message)
      ? payload.message.join(', ')
      : payload.message || 'Pandit authentication failed. Please check your credentials.';
    throw new Error(errorMessage);
  }

  const resultData = payload.data || payload;
  if (resultData.token && resultData.user) {
    saveClientSession(resultData.token, resultData.user);
  }

  return {
    success: true,
    message: resultData.message || 'Login successful',
    token: resultData.token,
    user: resultData.user,
  };
}

/**
 * Authenticate Admin with email and password
 */
export async function loginAdmin(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email: email.trim(), password }),
  });

  const payload = await response.json();

  if (!response.ok) {
    const errorMessage = Array.isArray(payload.message)
      ? payload.message.join(', ')
      : payload.message || 'Admin authentication failed.';
    throw new Error(errorMessage);
  }

  const resultData = payload.data || payload;
  if (resultData.token && resultData.user) {
    saveClientSession(resultData.token, resultData.user);
  }

  return {
    success: true,
    message: resultData.message || 'Admin authenticated successfully',
    token: resultData.token,
    user: resultData.user,
  };
}

/**
 * Register a new Vedic Pandit
 */
export async function registerPandit(params: {
  email: string;
  password: string;
  phoneNumber: string;
  fullName: string;
  experienceYears?: number;
  languages: string[];
  specializations: string[];
  city: string;
  state: string;
  serviceAreas?: string[];
  bio?: string;
  basePrice?: number;
}): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/pandit/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      email: params.email.trim(),
      password: params.password,
      phoneNumber: params.phoneNumber.trim(),
      fullName: params.fullName.trim(),
      experienceYears: params.experienceYears || 1,
      languages: params.languages,
      specializations: params.specializations,
      city: params.city.trim(),
      state: params.state.trim(),
      serviceAreas: params.serviceAreas || [params.city.trim()],
      bio: params.bio?.trim() || undefined,
      basePrice: params.basePrice || undefined,
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    const errorMessage = Array.isArray(payload.message)
      ? payload.message.join(', ')
      : payload.message || 'Pandit registration failed.';
    throw new Error(errorMessage);
  }

  const resultData = payload.data || payload;
  if (resultData.token && resultData.user) {
    saveClientSession(resultData.token, resultData.user);
  }

  return {
    success: true,
    message: resultData.message || 'Registration submitted successfully.',
    token: resultData.token,
    user: resultData.user,
  };
}

/**
 * Register a new Devotee / Customer
 */
export async function registerCustomer(params: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/customer/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      email: params.email.trim(),
      password: params.password,
      firstName: params.firstName.trim(),
      lastName: params.lastName.trim(),
      phoneNumber: params.phoneNumber?.trim() || undefined,
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    const errorMessage = Array.isArray(payload.message)
      ? payload.message.join(', ')
      : payload.message || 'Registration failed. Please check your information.';
    throw new Error(errorMessage);
  }

  const resultData = payload.data || payload;
  if (resultData.token && resultData.user) {
    saveClientSession(resultData.token, resultData.user);
  }

  return {
    success: true,
    message: resultData.message || 'Registration successful',
    token: resultData.token,
    user: resultData.user,
  };
}

/**
 * Request password reset link
 */
export async function requestPasswordReset(email: string): Promise<{ success: boolean; message: string; resetUrl?: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim() }),
  });

  const payload = await response.json();

  if (!response.ok) {
    const errorMessage = Array.isArray(payload.message)
      ? payload.message.join(', ')
      : payload.message || 'Unable to process password reset request.';
    throw new Error(errorMessage);
  }

  const resultData = payload.data || payload;
  return {
    success: true,
    message: resultData.message,
    resetUrl: resultData.resetUrl,
  };
}

/**
 * Complete password reset with token
 */
export async function resetPasswordWithToken(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: token.trim(), newPassword }),
  });

  const payload = await response.json();

  if (!response.ok) {
    const errorMessage = Array.isArray(payload.message)
      ? payload.message.join(', ')
      : payload.message || 'Unable to reset password.';
    throw new Error(errorMessage);
  }

  const resultData = payload.data || payload;
  return {
    success: true,
    message: resultData.message,
  };
}
