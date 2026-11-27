import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  BackHandler,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Puja, PanditProfile, Booking } from '../types';

// Auth Screens
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { CustomerLoginScreen } from '../screens/auth/CustomerLoginScreen';
import { CustomerPersonalDetailsScreen } from '../screens/auth/CustomerPersonalDetailsScreen';
import { CustomerAddressDetailsScreen } from '../screens/auth/CustomerAddressDetailsScreen';
import { CustomerRegisterScreen } from '../screens/auth/CustomerRegisterScreen';
import { PanditLoginScreen } from '../screens/auth/PanditLoginScreen';
import { PanditRegisterScreen } from '../screens/auth/PanditRegisterScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { LanguageModal, LanguageOption } from '../screens/auth/LanguageModal';
import { api } from '../api/client';

// Customer Screens
import { CustomerHomeScreen } from '../screens/customer/CustomerHomeScreen';
import { CustomerExploreScreen } from '../screens/customer/CustomerExploreScreen';
import { CustomerBookingsScreen } from '../screens/customer/CustomerBookingsScreen';
import { CustomerStoreScreen } from '../screens/customer/CustomerStoreScreen';
import { CustomerProfileScreen } from '../screens/customer/CustomerProfileScreen';
import { PujaDetailScreen } from '../screens/customer/PujaDetailScreen';
import { PanditDetailScreen } from '../screens/customer/PanditDetailScreen';
import { BookingFlowScreen } from '../screens/customer/BookingFlowScreen';
import { BookingConfirmationScreen } from '../screens/customer/BookingConfirmationScreen';
import { CartScreen } from '../screens/customer/CartScreen';
import { OrderHistoryScreen } from '../screens/customer/OrderHistoryScreen';
import { AddressManagementScreen } from '../screens/customer/AddressManagementScreen';
import { MuhurthScreen } from '../screens/customer/MuhurthScreen';
import { PujaCatalogScreen } from '../screens/customer/PujaCatalogScreen';
import { FeedScreen } from '../screens/customer/FeedScreen';
import { WalletScreen } from '../screens/customer/WalletScreen';
import { NotificationScreen } from '../screens/customer/NotificationScreen';
import { DrawerMenuModal } from '../components/common/DrawerMenuModal';
import { CitySelectorModal } from '../components/common/CitySelectorModal';
import { PlusMembershipModal } from '../components/common/PlusMembershipModal';
import { HelpSupportModal } from '../components/common/HelpSupportModal';
import { KundaliModal } from '../components/common/KundaliModal';

// Pandit Screens
import { PanditDashboardScreen } from '../screens/pandit/PanditDashboardScreen';
import { PanditBookingsScreen } from '../screens/pandit/PanditBookingsScreen';
import { PanditAvailabilityScreen } from '../screens/pandit/PanditAvailabilityScreen';
import { PanditEarningsScreen } from '../screens/pandit/PanditEarningsScreen';
import { PanditProfileScreen } from '../screens/pandit/PanditProfileScreen';
import { PanditVerificationScreen } from '../screens/pandit/PanditVerificationScreen';

export const RootNavigator: React.FC = () => {
  const { user, role, isLoading } = useAuth();
  const { itemCount } = useCart();
  const insets = useSafeAreaInsets();
  // Fixed, non-jumping height for bottomNav
  const bottomNavPadding = Platform.OS === 'ios' ? Math.max(insets.bottom, 12) : 6;
  const bottomNavHeight = 58 + (Platform.OS === 'ios' ? Math.max(insets.bottom, 12) : 6);

  // Language state
  const [currentLanguage, setCurrentLanguage] = useState('English');
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // Auth flow route
  const [authRoute, setAuthRoute] = useState<
    'welcome' | 'customer_login' | 'customer_register' | 'pandit_login' | 'pandit_register' | 'forgot_password'
  >('welcome');

  // Customer Navigation State
  const [customerTab, setCustomerTab] = useState<'home' | 'muhurth' | 'puja' | 'feed' | 'wallet'>('home');
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Pune');
  const [showCityModal, setShowCityModal] = useState(false);
  const [showPlusModal, setShowPlusModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showKundaliModal, setShowKundaliModal] = useState(false);

  // Customer Profile Registration Stepper (Post-OTP)
  const [registrationStep, setRegistrationStep] = useState<'none' | 'personal' | 'address'>('none');
  const [registrationPending, setRegistrationPending] = useState<{
    fullName: string;
    phoneNumber: string;
  }>({
    fullName: '',
    phoneNumber: '',
  });

  const [customerDetailView, setCustomerDetailView] = useState<{
    type: 'none' | 'puja_detail' | 'pandit_detail' | 'booking_flow' | 'booking_confirm' | 'cart' | 'orders' | 'bookings' | 'addresses' | 'notification' | 'store' | 'profile' | 'pandit_list';
    puja?: Puja;
    pandit?: PanditProfile;
    booking?: Booking;
  }>({ type: 'none' });

  // Pandit Navigation State
  const [panditTab, setPanditTab] = useState<'dashboard' | 'bookings' | 'availability' | 'earnings' | 'profile'>('dashboard');
  const [panditDetailView, setPanditDetailView] = useState<'none' | 'verification'>('none');

  // Check customer profile completeness whenever authenticated as CUSTOMER
  useEffect(() => {
    if (user && role === 'CUSTOMER') {
      const checkCompleteness = async () => {
        try {
          const profile = await api.getCustomerProfile();
          const hasName = Boolean(
            profile?.firstName &&
            profile.firstName.trim().toLowerCase() !== 'devotee' &&
            profile.firstName.trim() !== ''
          );
          const hasAddresses = Boolean(profile?.addresses && profile.addresses.length > 0);

          if (!hasName) {
            setRegistrationStep('personal');
          } else if (!hasAddresses) {
            setRegistrationPending((prev) => ({
              ...prev,
              fullName: `${profile.firstName} ${profile.lastName || ''}`.trim(),
              phoneNumber: profile.user?.phoneNumber || prev.phoneNumber || '',
            }));
            setRegistrationStep('address');
          } else {
            setRegistrationStep('none');
          }
        } catch (e) {
          if (!user.firstName || user.firstName.toLowerCase() === 'devotee') {
            setRegistrationStep('personal');
          } else {
            setRegistrationStep('none');
          }
        }
      };

      checkCompleteness();
    } else {
      setRegistrationStep('none');
    }
  }, [user?.id, role]);

  // --- HARDWARE & GESTURE BACK BUTTON HANDLER FOR ANDROID ---
  useEffect(() => {
    const onBackPress = () => {
      // 0. Handle Registration Stepper Back
      if (registrationStep === 'address') {
        setRegistrationStep('personal');
        return true;
      }

      // 1. Close open modals first
      if (showKundaliModal) {
        setShowKundaliModal(false);
        return true;
      }
      if (showHelpModal) {
        setShowHelpModal(false);
        return true;
      }
      if (showPlusModal) {
        setShowPlusModal(false);
        return true;
      }
      if (showCityModal) {
        setShowCityModal(false);
        return true;
      }
      if (showDrawer) {
        setShowDrawer(false);
        return true;
      }
      if (showLanguageModal) {
        setShowLanguageModal(false);
        return true;
      }

      // 2. Pop detail stack view back to previous screen
      if (customerDetailView.type !== 'none') {
        if (customerDetailView.type === 'booking_confirm') {
          setCustomerDetailView({ type: 'none' });
          setCustomerTab('home');
          return true;
        }
        setCustomerDetailView({ type: 'none' });
        return true;
      }

      // 3. Pop Pandit detail stack
      if (panditDetailView !== 'none') {
        setPanditDetailView('none');
        return true;
      }

      // 4. Return to home tab from secondary tabs before exiting app
      if (role === 'CUSTOMER' && customerTab !== 'home') {
        setCustomerTab('home');
        return true;
      }
      if (role === 'PANDIT' && panditTab !== 'dashboard') {
        setPanditTab('dashboard');
        return true;
      }

      // 5. Unauthenticated navigation flow back
      if (!user) {
        if (authRoute === 'customer_register' || authRoute === 'forgot_password') {
          setAuthRoute('customer_login');
          return true;
        }
        if (authRoute === 'pandit_register') {
          setAuthRoute('pandit_login');
          return true;
        }
        if (authRoute === 'customer_login' || authRoute === 'pandit_login') {
          setAuthRoute('welcome');
          return true;
        }
      }

      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [
    showKundaliModal,
    showHelpModal,
    showPlusModal,
    showCityModal,
    showDrawer,
    showLanguageModal,
    customerDetailView,
    panditDetailView,
    customerTab,
    panditTab,
    authRoute,
    registrationStep,
    user,
    role,
  ]);

  if (isLoading) {
    return (
      <View style={styles.splashContainer}>
        <View style={styles.splashIconCircle}>
          <Ionicons name="flame" size={54} color={colors.gold} />
        </View>
        <Text style={styles.splashBrand}>DevSutra</Text>
        <Text style={styles.splashTagline}>Your Sacred Vedic Journey • वैदिक पूजा व अनुष्ठान</Text>
        <ActivityIndicator size="small" color={colors.gold} style={{ marginTop: 24 }} />
      </View>
    );
  }

  // --- UNAUTHENTICATED FLOW ---
  if (!user || !role) {
    return (
      <>
        {authRoute === 'welcome' && (
          <WelcomeScreen
            onSelectUser={() => setAuthRoute('customer_login')}
            onLanguagePress={() => setShowLanguageModal(true)}
            currentLanguage={currentLanguage}
          />
        )}

        {authRoute === 'customer_login' && (
          <CustomerLoginScreen
            onBack={() => setAuthRoute('welcome')}
            onLoginSuccess={(loggedUser, isNew) => {
              const isDevoteeDefault =
                !loggedUser?.firstName ||
                loggedUser.firstName.toLowerCase() === 'devotee';
              const hasNoCity =
                !loggedUser?.city && !loggedUser?.customerProfile?.city;
              const needsOnboarding = Boolean(isNew || (isDevoteeDefault && hasNoCity));

              if (needsOnboarding) {
                setRegistrationStep('personal');
              } else {
                setRegistrationStep('none');
              }
            }}
            onNavigateForgotPassword={() => setAuthRoute('forgot_password')}
          />
        )}

        {authRoute === 'customer_register' && (
          <CustomerRegisterScreen
            onBack={() => setAuthRoute('customer_login')}
            onNavigateLogin={() => setAuthRoute('customer_login')}
          />
        )}

        {authRoute === 'pandit_login' && (
          <PanditLoginScreen
            onBack={() => setAuthRoute('welcome')}
            onNavigateRegister={() => setAuthRoute('pandit_register')}
            onSwitchToCustomer={() => setAuthRoute('customer_login')}
          />
        )}

        {authRoute === 'pandit_register' && (
          <PanditRegisterScreen
            onBack={() => setAuthRoute('pandit_login')}
            onNavigateLogin={() => setAuthRoute('pandit_login')}
          />
        )}

        {authRoute === 'forgot_password' && (
          <ForgotPasswordScreen onBack={() => setAuthRoute('customer_login')} />
        )}

        <LanguageModal
          visible={showLanguageModal}
          selectedLanguage={currentLanguage}
          onSelectLanguage={(lang: LanguageOption) => setCurrentLanguage(lang.name)}
          onClose={() => setShowLanguageModal(false)}
        />
      </>
    );
  }

  // --- CUSTOMER PORTAL ---
  if (role === 'CUSTOMER') {
    // Unified Profile Setup (Post-OTP: Name, Age, Gender, Address)
    if (registrationStep === 'personal' || registrationStep === 'address') {
      return (
        <CustomerPersonalDetailsScreen
          initialFullName={
            user.firstName && user.firstName.toLowerCase() !== 'devotee'
              ? `${user.firstName} ${user.lastName || ''}`.trim()
              : ''
          }
          initialPhoneNumber={user.phoneNumber || ''}
          onComplete={() => {
            setRegistrationStep('none');
            setCustomerTab('home');
          }}
        />
      );
    }

    // Pandit List Detail View
    if (customerDetailView.type === 'pandit_list') {
      return (
        <CustomerExploreScreen
          onBack={() => setCustomerDetailView({ type: 'none' })}
          onNavigatePanditDetail={(pandit) =>
            setCustomerDetailView({ type: 'pandit_detail', pandit })
          }
          onNavigatePujaDetail={(puja) =>
            setCustomerDetailView({ type: 'puja_detail', puja })
          }
          initialTab="PANDITS"
        />
      );
    }
    // Handle Customer Sub-views (Modals / Full Stacks)
    if (customerDetailView.type === 'puja_detail' && customerDetailView.puja) {
      return (
        <PujaDetailScreen
          puja={customerDetailView.puja}
          onBack={() => setCustomerDetailView({ type: 'none' })}
          onBookNow={(p) => setCustomerDetailView({ type: 'booking_flow', puja: p })}
        />
      );
    }

    if (customerDetailView.type === 'pandit_detail' && customerDetailView.pandit) {
      return (
        <PanditDetailScreen
          pandit={customerDetailView.pandit}
          onBack={() => setCustomerDetailView({ type: 'none' })}
          onBookPandit={(pandit) => setCustomerDetailView({ type: 'booking_flow', pandit })}
        />
      );
    }

    if (customerDetailView.type === 'booking_flow') {
      return (
        <BookingFlowScreen
          initialPuja={customerDetailView.puja}
          initialPandit={customerDetailView.pandit}
          onBack={() => setCustomerDetailView({ type: 'none' })}
          onBookingSuccess={(booking) =>
            setCustomerDetailView({ type: 'booking_confirm', booking })
          }
        />
      );
    }

    if (customerDetailView.type === 'booking_confirm' && customerDetailView.booking) {
      return (
        <BookingConfirmationScreen
          booking={customerDetailView.booking}
          onNavigateMyBookings={() => {
            setCustomerDetailView({ type: 'bookings' });
          }}
          onNavigateHome={() => {
            setCustomerDetailView({ type: 'none' });
            setCustomerTab('home');
          }}
        />
      );
    }

    if (customerDetailView.type === 'bookings') {
      return (
        <CustomerBookingsScreen
          onBack={() => setCustomerDetailView({ type: 'none' })}
          onExplorePujas={() => {
            setCustomerDetailView({ type: 'none' });
            setCustomerTab('puja');
          }}
        />
      );
    }

    if (customerDetailView.type === 'cart') {
      return (
        <CartScreen
          onBack={() => setCustomerDetailView({ type: 'none' })}
          onNavigateOrders={() => setCustomerDetailView({ type: 'orders' })}
          onContinueShopping={() => {
            setCustomerDetailView({ type: 'store' });
          }}
        />
      );
    }

    if (customerDetailView.type === 'orders') {
      return (
        <OrderHistoryScreen
          onBack={() => setCustomerDetailView({ type: 'none' })}
          onExploreStore={() => {
            setCustomerDetailView({ type: 'store' });
          }}
        />
      );
    }

    if (customerDetailView.type === 'addresses') {
      return (
        <AddressManagementScreen onBack={() => setCustomerDetailView({ type: 'none' })} />
      );
    }

    if (customerDetailView.type === 'notification') {
      return (
        <NotificationScreen onBack={() => setCustomerDetailView({ type: 'none' })} />
      );
    }

    if (customerDetailView.type === 'store') {
      return (
        <CustomerStoreScreen
          onBack={() => setCustomerDetailView({ type: 'none' })}
          onNavigateCart={() => setCustomerDetailView({ type: 'cart' })}
        />
      );
    }

    if (customerDetailView.type === 'profile') {
      return (
        <CustomerProfileScreen
          onBack={() => setCustomerDetailView({ type: 'none' })}
          onNavigateAddresses={() => setCustomerDetailView({ type: 'addresses' })}
          onNavigateOrders={() => setCustomerDetailView({ type: 'orders' })}
          onSelectLanguage={() => setShowLanguageModal(true)}
          onSwitchToPandit={() => setAuthRoute('pandit_login')}
        />
      );
    }

    return (
      <View style={styles.portalSafe}>
        {/* Main Tab Screen */}
        <View style={styles.tabContentContainer}>
          {customerTab === 'home' && (
            <CustomerHomeScreen
              onNavigatePujaDetail={(p) => setCustomerDetailView({ type: 'puja_detail', puja: p })}
              onNavigatePanditDetail={(p) =>
                setCustomerDetailView({ type: 'pandit_detail', pandit: p })
              }
              onNavigateFindPandits={() => setCustomerDetailView({ type: 'pandit_list' })}
              onNavigateCategory={(cat) => setCustomerTab('puja')}
              onNavigateStore={() => setCustomerDetailView({ type: 'store' })}
              onNavigateCart={() => setCustomerDetailView({ type: 'cart' })}
              onNavigateExplore={() => setCustomerDetailView({ type: 'pandit_list' })}
              onNavigateNotifications={() => setCustomerDetailView({ type: 'notification' })}
              onNavigateWallet={() => setCustomerTab('wallet')}
              onNavigateBookings={() => setCustomerDetailView({ type: 'bookings' })}
              onOpenDrawer={() => setShowDrawer(true)}
              onSelectCity={() => setShowCityModal(true)}
              selectedCity={selectedCity}
            />
          )}

          {customerTab === 'muhurth' && (
            <MuhurthScreen
              onOpenDrawer={() => setShowDrawer(true)}
              onOpenNotifications={() => setCustomerDetailView({ type: 'notification' })}
              onSelectCity={() => setShowCityModal(true)}
              selectedCity={selectedCity}
              onBookDate={() => setCustomerTab('puja')}
            />
          )}

          {customerTab === 'puja' && (
            <PujaCatalogScreen
              onOpenDrawer={() => setShowDrawer(true)}
              onOpenNotifications={() => setCustomerDetailView({ type: 'notification' })}
              onSelectCity={() => setShowCityModal(true)}
              selectedCity={selectedCity}
              onSelectPuja={(p) => setCustomerDetailView({ type: 'puja_detail', puja: p })}
            />
          )}

          {customerTab === 'feed' && (
            <FeedScreen
              onOpenDrawer={() => setShowDrawer(true)}
              onOpenNotifications={() => setCustomerDetailView({ type: 'notification' })}
              onSelectCity={() => setShowCityModal(true)}
              selectedCity={selectedCity}
            />
          )}

          {customerTab === 'wallet' && (
            <WalletScreen
              onOpenDrawer={() => setShowDrawer(true)}
              onOpenNotifications={() => setCustomerDetailView({ type: 'notification' })}
              onSelectCity={() => setShowCityModal(true)}
              selectedCity={selectedCity}
              onBookPuja={() => setCustomerTab('puja')}
            />
          )}
        </View>

        {/* Customer Bottom Navigation Bar - Speedy Pandit Exact 5 Tabs */}
        <View style={[styles.bottomNav, { height: bottomNavHeight, paddingBottom: bottomNavPadding }]}>
          {/* Tab 1: Home */}
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setCustomerTab('home')}
          >
            <Ionicons
              name={customerTab === 'home' ? 'home' : 'home-outline'}
              size={22}
              color={customerTab === 'home' ? colors.primary : '#5C4A42'}
            />
            <Text
              style={[styles.navText, customerTab === 'home' && styles.navTextActive]}
            >
              Home
            </Text>
          </TouchableOpacity>

          {/* Tab 2: Muhurth */}
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setCustomerTab('muhurth')}
          >
            <Ionicons
              name={customerTab === 'muhurth' ? 'calendar' : 'calendar-outline'}
              size={22}
              color={customerTab === 'muhurth' ? colors.primary : '#5C4A42'}
            />
            <Text
              style={[styles.navText, customerTab === 'muhurth' && styles.navTextActive]}
            >
              Muhurth
            </Text>
          </TouchableOpacity>

          {/* Tab 3: Puja */}
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setCustomerTab('puja')}
          >
            <Ionicons
              name={customerTab === 'puja' ? 'flame' : 'flame-outline'}
              size={22}
              color={customerTab === 'puja' ? colors.primary : '#5C4A42'}
            />
            <Text
              style={[styles.navText, customerTab === 'puja' && styles.navTextActive]}
            >
              Puja
            </Text>
          </TouchableOpacity>

          {/* Tab 4: Feed */}
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setCustomerTab('feed')}
          >
            <Ionicons
              name={customerTab === 'feed' ? 'grid' : 'grid-outline'}
              size={22}
              color={customerTab === 'feed' ? colors.primary : '#5C4A42'}
            />
            <Text
              style={[styles.navText, customerTab === 'feed' && styles.navTextActive]}
            >
              Feed
            </Text>
          </TouchableOpacity>

          {/* Tab 5: Wallet */}
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setCustomerTab('wallet')}
          >
            <Ionicons
              name={customerTab === 'wallet' ? 'wallet' : 'wallet-outline'}
              size={22}
              color={customerTab === 'wallet' ? colors.primary : '#5C4A42'}
            />
            <Text
              style={[styles.navText, customerTab === 'wallet' && styles.navTextActive]}
            >
              Wallet
            </Text>
          </TouchableOpacity>
        </View>

        <LanguageModal
          visible={showLanguageModal}
          selectedLanguage={currentLanguage}
          onSelectLanguage={(lang: LanguageOption) => setCurrentLanguage(lang.name)}
          onClose={() => setShowLanguageModal(false)}
        />

        <DrawerMenuModal
          visible={showDrawer}
          onClose={() => setShowDrawer(false)}
          onNavigateWallet={() => {
            setShowDrawer(false);
            setCustomerTab('wallet');
          }}
          onNavigateProfile={() => {
            setShowDrawer(false);
            setCustomerDetailView({ type: 'profile' });
          }}
          onNavigateOrders={() => {
            setShowDrawer(false);
            setCustomerDetailView({ type: 'bookings' });
          }}
          onNavigateLanguage={() => {
            setShowDrawer(false);
            setShowLanguageModal(true);
          }}
          onNavigateAddresses={() => {
            setShowDrawer(false);
            setCustomerDetailView({ type: 'addresses' });
          }}
          onNavigateHelp={() => {
            setShowDrawer(false);
            setShowHelpModal(true);
          }}
          onNavigatePlus={() => {
            setShowDrawer(false);
            setShowPlusModal(true);
          }}
          onNavigateKundali={() => {
            setShowDrawer(false);
            setShowKundaliModal(true);
          }}
        />

        <CitySelectorModal
          visible={showCityModal}
          selectedCity={selectedCity}
          onSelectCity={(city) => setSelectedCity(city)}
          onClose={() => setShowCityModal(false)}
        />

        <PlusMembershipModal
          visible={showPlusModal}
          onClose={() => setShowPlusModal(false)}
          onUpgrade={() => {
            setShowPlusModal(false);
            setCustomerTab('puja');
          }}
        />

        <HelpSupportModal
          visible={showHelpModal}
          onClose={() => setShowHelpModal(false)}
        />

        <KundaliModal
          visible={showKundaliModal}
          onClose={() => setShowKundaliModal(false)}
          onBookPuja={() => {
            setShowKundaliModal(false);
            setCustomerTab('puja');
          }}
        />
      </View>
    );
  }

  // --- PANDIT PORTAL ---
  if (role === 'PANDIT') {
    if (panditDetailView === 'verification') {
      return (
        <PanditVerificationScreen onBack={() => setPanditDetailView('none')} />
      );
    }

    return (
      <View style={styles.portalSafe}>
        <View style={styles.tabContentContainer}>
          {panditTab === 'dashboard' && (
            <PanditDashboardScreen
              onNavigateBookings={() => setPanditTab('bookings')}
              onNavigateAvailability={() => setPanditTab('availability')}
              onNavigateEarnings={() => setPanditTab('earnings')}
              onNavigateVerification={() => setPanditDetailView('verification')}
              onNavigateProfile={() => setPanditTab('profile')}
            />
          )}

          {panditTab === 'bookings' && <PanditBookingsScreen />}

          {panditTab === 'availability' && <PanditAvailabilityScreen />}

          {panditTab === 'earnings' && <PanditEarningsScreen />}

          {panditTab === 'profile' && (
            <PanditProfileScreen
              onNavigateVerification={() => setPanditDetailView('verification')}
              onNavigateAvailability={() => setPanditTab('availability')}
              onNavigateEarnings={() => setPanditTab('earnings')}
            />
          )}
        </View>

        {/* Pandit Bottom Navigation Bar */}
        <View style={[styles.bottomNav, { height: bottomNavHeight, paddingBottom: bottomNavPadding }]}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setPanditTab('dashboard')}
          >
            <Ionicons
              name={panditTab === 'dashboard' ? 'grid' : 'grid-outline'}
              size={22}
              color={panditTab === 'dashboard' ? colors.secondary : colors.textSecondary}
            />
            <Text
              style={[styles.navText, panditTab === 'dashboard' && styles.navTextPanditActive]}
            >
              Dashboard
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setPanditTab('bookings')}
          >
            <Ionicons
              name={panditTab === 'bookings' ? 'calendar' : 'calendar-outline'}
              size={22}
              color={panditTab === 'bookings' ? colors.secondary : colors.textSecondary}
            />
            <Text
              style={[styles.navText, panditTab === 'bookings' && styles.navTextPanditActive]}
            >
              Bookings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setPanditTab('availability')}
          >
            <Ionicons
              name={panditTab === 'availability' ? 'time' : 'time-outline'}
              size={22}
              color={panditTab === 'availability' ? colors.secondary : colors.textSecondary}
            />
            <Text
              style={[styles.navText, panditTab === 'availability' && styles.navTextPanditActive]}
            >
              Schedule
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setPanditTab('earnings')}
          >
            <Ionicons
              name={panditTab === 'earnings' ? 'wallet' : 'wallet-outline'}
              size={22}
              color={panditTab === 'earnings' ? colors.secondary : colors.textSecondary}
            />
            <Text
              style={[styles.navText, panditTab === 'earnings' && styles.navTextPanditActive]}
            >
              Dakshina
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setPanditTab('profile')}
          >
            <Ionicons
              name={panditTab === 'profile' ? 'person' : 'person-outline'}
              size={22}
              color={panditTab === 'profile' ? colors.secondary : colors.textSecondary}
            />
            <Text
              style={[styles.navText, panditTab === 'profile' && styles.navTextPanditActive]}
            >
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  splashBrand: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.goldLight,
    letterSpacing: 1,
  },
  splashTagline: {
    fontSize: 13,
    color: colors.surface,
    marginTop: 6,
  },
  portalSafe: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  tabContentContainer: {
    flex: 1,
  },
  bottomNav: {
    height: 60,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 2,
  },
  navTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  navTextPanditActive: {
    color: colors.secondary,
    fontWeight: '700',
  },
  navDot: {
    position: 'absolute',
    top: -3,
    right: -8,
    backgroundColor: colors.primary,
    borderRadius: 7,
    minWidth: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  navDotText: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.textWhite,
  },
});
