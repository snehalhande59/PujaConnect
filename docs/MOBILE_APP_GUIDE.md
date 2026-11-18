# PujaConnect / DevSutra – Android Mobile Application Guide
## Single Unified App Architecture Inspired by Speedy Pandit

### 1. Architectural Overview

The PujaConnect Android application is located inside:
`apps/mobile/`

It is implemented as a **single, unified React Native + Expo + TypeScript application** supporting dual user roles (`CUSTOMER` and `PANDIT`). After login or registration, the application automatically mounts the corresponding role-specific bottom tab navigation and workflows without requiring two separate apps.

- **Brand Personality:** DevSutra Sacred Identity
- **Brand Colors:**
  - Primary Maroon: `#7B2635`
  - Deep Maroon: `#551822`
  - Saffron / Kesari: `#D97724`
  - Antique Gold: `#C49A45`
  - Ivory Cream: `#FFF8EC`
  - Deep Sacred Brown: `#382820`
- **Framework:** Expo 51 + React Native 0.74.5 + TypeScript 5.5
- **API Client:** Real NestJS backend integration with loopback support for Android Studio emulators (`10.0.2.2:3001`), local IP, and production endpoints.

---

### 2. Complete Screen Catalog

#### A. Authentication & Onboarding (`apps/mobile/src/screens/auth/`)
1. **WelcomeScreen.tsx**: Speedy Pandit-inspired gateway allowing user to select between "Devotee / Customer" and "Vedic Pandit / Shastri", plus quick language picker.
2. **LanguageModal.tsx**: Multi-language modal supporting English, हिन्दी (Hindi), मराठी (Marathi), ગુજરાતી (Gujarati), संस्कृतम् (Sanskrit), తెలుగు (Telugu), தமிழ் (Tamil), and বাংলা (Bengali).
3. **CustomerLoginScreen.tsx**: Devotee sign-in with clean inputs, password visibility toggle, and error alerts.
4. **CustomerRegisterScreen.tsx**: Devotee account creation with validation.
5. **PanditLoginScreen.tsx**: Acharya and Shastri partner sign-in portal.
6. **PanditRegisterScreen.tsx**: Comprehensive Vedic onboarding including experience years, base dakshina, operational city, multi-language chanting selection, and ritual specializations.
7. **ForgotPasswordScreen.tsx**: Password reset request workflow.

#### B. Customer Portal (`apps/mobile/src/screens/customer/`)
1. **CustomerHomeScreen.tsx**:
   - Time-based Vedic greeting (*Shubh Prabhat*, *Shubh Madhyahan*, *Shubh Sandhya*).
   - City selector & live search prompt.
   - Promotional festival hero card (*Navratri, Griha Pravesh Season*).
   - Sacred Puja Categories horizontal carousel.
   - Trending Pujas & Havans with starting Dakshina.
   - Verified Pandit Scholars near you with ratings & review counts.
   - Pure Samagri Store teaser with direct "Add to Cart".
   - DevSutra Trust Assurances (100% Certified, Pure Herbs, Muhurat Precision, Transparent Dakshina).
2. **CustomerExploreScreen.tsx**:
   - Dual tabs: "Verified Pandits" vs "Sacred Pujas".
   - Real-time search by name, ritual, language, or gotra.
   - City filter chips (All Cities, Pune, Mumbai, Nashik, Varanasi, Bengaluru).
3. **CustomerBookingsScreen.tsx**:
   - Status tabs: "Upcoming", "Completed", "Cancelled".
   - Booking reference, assigned Purohit, scheduled Muhurat, address, and live cancellation action.
4. **CustomerStoreScreen.tsx**:
   - Pure Samagri Bhandar grid.
   - Quick "+ Add" buttons with item counters.
   - Floating cart drawer showing item count and live subtotal.
5. **CustomerProfileScreen.tsx**:
   - Devotee avatar, member badge, saved venues link, order history, language switcher, and logout.
6. **PujaDetailScreen.tsx**:
   - Ritual duration, starting dakshina, Vedic Vidhi significance, and 4-step ceremony breakdown (*Sankalpa, Shodashopachara, Havan, Maha Aarti*).
7. **PanditDetailScreen.tsx**:
   - Purohit bio, Gurukul qualifications, languages spoken, specializations, and booking CTA.
8. **BookingFlowScreen.tsx**:
   - 4-Step Booking Wizard:
     - Step 1: Confirm Puja & Pandit.
     - Step 2: Auspicious Date & Muhurat Slot (Pratah Kaal, Madhyahan, Sandhya).
     - Step 3: Venue Address & Chanting Language.
     - Step 4: Samagri Kit Inclusion (+₹1,500) & Dakshina Breakdown -> Live Booking Creation.
9. **BookingConfirmationScreen.tsx**:
   - Auspicious celebration confirmation (*Shubh Sankalpa!*), reference ID, date, time, venue, and next steps.
10. **CartScreen.tsx**:
    - Shopping cart with quantity steppers, saved address selector, quick "+ Add Address" form, and "Place Sacred Order" action.
11. **OrderHistoryScreen.tsx**:
    - Delivered and processing samagri kit orders.
12. **AddressManagementScreen.tsx**:
    - Manage home, temple, and ancestral puja venues with create and delete APIs.

#### C. Pandit Partner Portal (`apps/mobile/src/screens/pandit/`)
1. **PanditDashboardScreen.tsx**:
   - Dynamic Verification Alert Banner (Approved / Under Review / Action Required).
   - Taking Bookings online/offline toggle.
   - Performance metrics: Total Dakshina, Completed Pujas, Pending Requests, Rating.
   - Incoming Ritual Requests with instant **Accept Puja** and **Decline** actions.
   - Upcoming confirmed ceremonies list.
2. **PanditBookingsScreen.tsx**:
   - Tabs for "Requests", "Upcoming", and "Completed" rituals with devotee venue and special instructions.
3. **PanditAvailabilityScreen.tsx**:
   - Operational city & travel radius.
   - Days of the week availability toggles (Somvar through Ravivar).
   - Preferred Muhurat windows (Pratah, Madhyahan, Sandhya, Ratri).
4. **PanditEarningsScreen.tsx**:
   - Total Dakshina balance ledger.
   - Verified bank account indicator.
   - Completed ritual earnings transactions list.
5. **PanditProfileScreen.tsx**:
   - Vedic credentials, Gurukul lineage, base dakshina, languages, and support helpline.
6. **PanditVerificationScreen.tsx**:
   - Identity & Gurukul document upload (Aadhaar, PAN, Sanad).
   - Document deletion and "Resubmit for Verification" action.

---

### 3. Real Backend API Integration Map

All screens communicate with the live NestJS backend (`http://localhost:3001` or Android emulator `http://10.0.2.2:3001`):

| Feature | HTTP Endpoint | Mobile API Method |
|---|---|---|
| Customer Login | `POST /api/v1/auth/customer/login` | `api.loginCustomer()` |
| Customer Register | `POST /api/v1/auth/customer/register` | `api.registerCustomer()` |
| Pandit Login | `POST /api/v1/auth/pandit/login` | `api.loginPandit()` |
| Pandit Register | `POST /api/v1/auth/pandit/register` | `api.registerPandit()` |
| Categories | `GET /api/v1/categories` | `api.getCategories()` |
| Pujas Discovery | `GET /api/v1/pujas` | `api.getPujas()` |
| Pandit Discovery | `GET /api/v1/pandits` | `api.getPandits()` |
| Pure Samagri Store | `GET /api/v1/products` | `api.getProducts()` |
| Cart Management | `GET, POST, PATCH, DELETE /api/v1/cart/*` | `useCart()` provider |
| Create Booking | `POST /api/v1/bookings` | `api.createBooking()` |
| Customer Bookings | `GET /api/v1/bookings/my` | `api.getMyBookings()` |
| Cancel Booking | `PATCH /api/v1/bookings/:id/cancel` | `api.cancelBooking()` |
| Pandit Bookings | `GET /api/v1/bookings/pandit` | `api.getMyPanditBookings()` |
| Accept Booking | `PATCH /api/v1/bookings/:id/accept` | `api.acceptBooking()` |
| Reject Booking | `PATCH /api/v1/bookings/:id/reject` | `api.rejectBooking()` |
| Place Order | `POST /api/v1/orders` | `api.createOrder()` |
| Customer Orders | `GET /api/v1/orders/my` | `api.getMyOrders()` |
| Saved Addresses | `GET, POST, DELETE /api/v1/customers/addresses` | `api.getAddresses()`, `api.addAddress()` |
| Pandit Profile | `GET /api/v1/pandits/me/profile` | `api.getMyPanditProfile()` |
| Pandit Documents | `GET, POST, DELETE /api/v1/pandits/me/documents` | `api.getMyPanditDocuments()`, `api.uploadPanditDocument()` |
| Resubmit Verification | `POST /api/v1/pandits/me/resubmit` | `api.resubmitPanditVerification()` |

---

### 4. Running the Application

#### Step 1: Ensure Backend is Running
The NestJS API runs on port 3001:
```powershell
cd "d:\JMKC DESIGN\poojaconnectApp\apps\api"
node dist/main.js
```

#### Step 2: Start Mobile App with Expo
```powershell
cd "d:\JMKC DESIGN\poojaconnectApp\apps\mobile"
pnpm start
```

- **Run on Android Studio Emulator:** Press `a` in the terminal (or run `pnpm android`).
  - Note: The app automatically detects the Android emulator loopback and connects to `http://10.0.2.2:3001/api/v1`.
- **Run on Physical Android Phone:**
  1. Install **Expo Go** from Google Play Store on your Android phone.
  2. Ensure your phone and development PC are connected to the same Wi-Fi network.
  3. Scan the QR code displayed in the terminal with the Expo Go app.

#### Step 3: Run TypeScript Type Check
To verify type integrity at any time:
```powershell
cd "d:\JMKC DESIGN\poojaconnectApp\apps\mobile"
pnpm build:check
```
*Current status: 0 errors.*
