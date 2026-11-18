import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export interface PaymentSuccessDetails {
  paymentId: string;
  orderId: string;
  method: string;
  amount: number;
  mudraDiscount: number;
  date: string;
}

interface PaymentGatewayModalProps {
  visible: boolean;
  totalAmount: number;
  itemTitle: string;
  onClose: () => void;
  onPaymentSuccess: (details: PaymentSuccessDetails) => void;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  visible,
  totalAmount,
  itemTitle,
  onClose,
  onPaymentSuccess,
}) => {
  const insets = useSafeAreaInsets();
  const headerPaddingTop = Platform.OS === 'android'
    ? (StatusBar.currentHeight || 28) + 8
    : Math.max(insets.top, 20) + 6;

  const [selectedMethod, setSelectedMethod] = useState<'UPI' | 'CARD' | 'NETBANKING' | 'CASH'>('UPI');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'GPAY' | 'PHONEPE' | 'PAYTM'>('GPAY');
  const [applyMudra, setApplyMudra] = useState(true);
  const [upiId, setUpiId] = useState('user@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('841');

  // Processing & Success State
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txDetails, setTxDetails] = useState<PaymentSuccessDetails | null>(null);

  const mudraDiscount = applyMudra ? Math.min(300, totalAmount) : 0;
  const payableAmount = Math.max(0, totalAmount - mudraDiscount);

  const handlePay = () => {
    setIsProcessing(true);

    // Simulate Payment Gateway processing delay
    setTimeout(() => {
      const generatedId = `PAY_${Math.floor(10000000 + Math.random() * 90000000)}`;
      const details: PaymentSuccessDetails = {
        paymentId: generatedId,
        orderId: `DEV_${Math.floor(100000 + Math.random() * 900000)}`,
        method: selectedMethod,
        amount: payableAmount,
        mudraDiscount: mudraDiscount,
        date: new Date().toISOString(),
      };

      setTxDetails(details);
      setIsProcessing(false);
      setIsSuccess(true);

      // Auto close and notify after success animation
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        onPaymentSuccess(details);
      }, 1600);
    }, 1800);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.safe}>
        <View style={styles.container}>
          {/* Header */}
          <View style={[styles.header, { paddingTop: headerPaddingTop }]}>
            <TouchableOpacity onPress={onClose} style={styles.backBtn} disabled={isProcessing} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <View style={styles.headerTitleBox}>
              <Text style={styles.headerTitle}>DevSutra Secure Payment</Text>
              <View style={styles.secureBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#15803D" />
                <Text style={styles.secureText}>256-Bit SSL Encrypted</Text>
              </View>
            </View>
            <View style={{ width: 36 }} />
          </View>

          {/* Processing Modal Overlay */}
          {isProcessing && (
            <View style={styles.processingOverlay}>
              <View style={styles.processingCard}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.processingTitle}>Processing Sacred Dakshina...</Text>
                <Text style={styles.processingDesc}>
                  Connecting to bank gateway. Please do not press back or close the app.
                </Text>
              </View>
            </View>
          )}

          {/* Success Overlay */}
          {isSuccess && txDetails && (
            <View style={styles.processingOverlay}>
              <View style={styles.processingCard}>
                <View style={styles.successIconCircle}>
                  <Ionicons name="checkmark" size={38} color="#FFFFFF" />
                </View>
                <Text style={styles.successTitle}>Payment Successful!</Text>
                <Text style={styles.successTxId}>Payment ID: {txDetails.paymentId}</Text>
                <Text style={styles.successAmount}>₹{txDetails.amount.toLocaleString('en-IN')}</Text>
                <Text style={styles.successSub}>Dakshina Consecrated & Confirmed</Text>
              </View>
            </View>
          )}

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Order Dakshina Summary Card */}
            <View style={styles.summaryCard}>
              <Text style={styles.itemTitle} numberOfLines={1}>{itemTitle}</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Ceremony / Service Dakshina:</Text>
                <Text style={styles.summaryValue}>₹{totalAmount.toLocaleString('en-IN')}</Text>
              </View>

              {applyMudra && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: '#15803D' }]}>DevSutra Mudra Redeemed:</Text>
                  <Text style={[styles.summaryValue, { color: '#15803D' }]}>- ₹{mudraDiscount}</Text>
                </View>
              )}

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.payableLabel}>Net Amount Payable:</Text>
                <Text style={styles.payableValue}>₹{payableAmount.toLocaleString('en-IN')}</Text>
              </View>
            </View>

            {/* DevSutra Mudra Redemption Banner */}
            <TouchableOpacity
              style={[styles.mudraBanner, applyMudra && styles.mudraBannerActive]}
              activeOpacity={0.8}
              onPress={() => setApplyMudra(!applyMudra)}
            >
              <View style={styles.mudraLeft}>
                <Ionicons name="wallet" size={22} color={colors.gold} />
                <View>
                  <Text style={styles.mudraTitle}>Apply 300 DevSutra Mudras</Text>
                  <Text style={styles.mudraSubtitle}>Instant ₹300 off on this ceremony</Text>
                </View>
              </View>

              <Ionicons
                name={applyMudra ? 'checkbox' : 'square-outline'}
                size={22}
                color={applyMudra ? colors.primary : '#8C7A70'}
              />
            </TouchableOpacity>

            {/* Payment Method Selector */}
            <Text style={styles.sectionHeading}>Select Payment Option</Text>

            {/* Option 1: UPI */}
            <TouchableOpacity
              style={[styles.methodCard, selectedMethod === 'UPI' && styles.methodCardSelected]}
              onPress={() => setSelectedMethod('UPI')}
              activeOpacity={0.8}
            >
              <View style={styles.methodHeader}>
                <View style={styles.methodTitleRow}>
                  <Ionicons name="phone-portrait-outline" size={20} color={colors.primary} />
                  <Text style={styles.methodName}>Instant UPI (GPay, PhonePe, Paytm)</Text>
                </View>
                <View style={[styles.radioCircle, selectedMethod === 'UPI' && styles.radioCircleActive]}>
                  {selectedMethod === 'UPI' && <View style={styles.radioInner} />}
                </View>
              </View>

              {selectedMethod === 'UPI' && (
                <View style={styles.methodContent}>
                  <Text style={styles.upiAppsLabel}>Fast 1-Tap App Checkout:</Text>
                  <View style={styles.upiAppsRow}>
                    {[
                      { id: 'GPAY', name: 'Google Pay' },
                      { id: 'PHONEPE', name: 'PhonePe' },
                      { id: 'PAYTM', name: 'Paytm' },
                    ].map((app) => (
                      <TouchableOpacity
                        key={app.id}
                        style={[
                          styles.upiAppPill,
                          selectedUpiApp === app.id && styles.upiAppPillActive,
                        ]}
                        onPress={() => setSelectedUpiApp(app.id as any)}
                      >
                        <Text
                          style={[
                            styles.upiAppText,
                            selectedUpiApp === app.id && styles.upiAppTextActive,
                          ]}
                        >
                          {app.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>Or Enter Any UPI ID</Text>
                    <TextInput
                      style={styles.textInput}
                      value={upiId}
                      onChangeText={setUpiId}
                      placeholder="mobile@upi"
                    />
                  </View>
                </View>
              )}
            </TouchableOpacity>

            {/* Option 2: Credit / Debit Card */}
            <TouchableOpacity
              style={[styles.methodCard, selectedMethod === 'CARD' && styles.methodCardSelected]}
              onPress={() => setSelectedMethod('CARD')}
              activeOpacity={0.8}
            >
              <View style={styles.methodHeader}>
                <View style={styles.methodTitleRow}>
                  <Ionicons name="card-outline" size={20} color={colors.primary} />
                  <Text style={styles.methodName}>Credit / Debit Card (Visa, RuPay, MC)</Text>
                </View>
                <View style={[styles.radioCircle, selectedMethod === 'CARD' && styles.radioCircleActive]}>
                  {selectedMethod === 'CARD' && <View style={styles.radioInner} />}
                </View>
              </View>

              {selectedMethod === 'CARD' && (
                <View style={styles.methodContent}>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>Card Number</Text>
                    <TextInput
                      style={styles.textInput}
                      value={cardNumber}
                      onChangeText={setCardNumber}
                      placeholder="4532 •••• •••• 8821"
                    />
                  </View>

                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Expiry</Text>
                      <TextInput
                        style={styles.textInput}
                        value={cardExpiry}
                        onChangeText={setCardExpiry}
                        placeholder="MM/YY"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>CVV</Text>
                      <TextInput
                        style={styles.textInput}
                        value={cardCvv}
                        onChangeText={setCardCvv}
                        secureTextEntry
                        placeholder="•••"
                      />
                    </View>
                  </View>
                </View>
              )}
            </TouchableOpacity>

            {/* Option 3: Net Banking */}
            <TouchableOpacity
              style={[styles.methodCard, selectedMethod === 'NETBANKING' && styles.methodCardSelected]}
              onPress={() => setSelectedMethod('NETBANKING')}
              activeOpacity={0.8}
            >
              <View style={styles.methodHeader}>
                <View style={styles.methodTitleRow}>
                  <Ionicons name="business-outline" size={20} color={colors.primary} />
                  <Text style={styles.methodName}>Net Banking (HDFC, SBI, ICICI, Axis)</Text>
                </View>
                <View style={[styles.radioCircle, selectedMethod === 'NETBANKING' && styles.radioCircleActive]}>
                  {selectedMethod === 'NETBANKING' && <View style={styles.radioInner} />}
                </View>
              </View>
            </TouchableOpacity>

            {/* Option 4: Pay After Vidhi */}
            <TouchableOpacity
              style={[styles.methodCard, selectedMethod === 'CASH' && styles.methodCardSelected]}
              onPress={() => setSelectedMethod('CASH')}
              activeOpacity={0.8}
            >
              <View style={styles.methodHeader}>
                <View style={styles.methodTitleRow}>
                  <Ionicons name="hand-left-outline" size={20} color={colors.primary} />
                  <Text style={styles.methodName}>Pay After Ceremony (Cash to Panditji)</Text>
                </View>
                <View style={[styles.radioCircle, selectedMethod === 'CASH' && styles.radioCircleActive]}>
                  {selectedMethod === 'CASH' && <View style={styles.radioInner} />}
                </View>
              </View>
            </TouchableOpacity>
          </ScrollView>

          {/* Bottom Pay Action Button */}
          <View style={styles.footerBar}>
            <View>
              <Text style={styles.footerAmountLabel}>Payable Total</Text>
              <Text style={styles.footerAmountVal}>₹{payableAmount.toLocaleString('en-IN')}</Text>
            </View>

            <TouchableOpacity style={styles.payBtn} activeOpacity={0.85} onPress={handlePay}>
              <Ionicons name="lock-closed" size={16} color="#FFFFFF" />
              <Text style={styles.payBtnText}>
                {selectedMethod === 'CASH'
                  ? 'Confirm Booking'
                  : `Pay ₹${payableAmount.toLocaleString('en-IN')}`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFDF7',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFDF7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDE0CB',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    padding: 4,
  },
  headerTitleBox: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  secureText: {
    fontSize: 10,
    color: '#15803D',
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EDE0CB',
    marginBottom: 14,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#735C50',
  },
  summaryValue: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#382820',
  },
  divider: {
    height: 1,
    backgroundColor: '#EDE0CB',
    marginVertical: 8,
  },
  payableLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#382820',
  },
  payableValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  mudraBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#EDE0CB',
    marginBottom: 18,
  },
  mudraBannerActive: {
    borderColor: '#15803D',
    backgroundColor: '#F0FDF4',
  },
  mudraLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mudraTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
  },
  mudraSubtitle: {
    fontSize: 10.5,
    color: '#735C50',
    marginTop: 1,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 10,
  },
  methodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EDE0CB',
    padding: 14,
    marginBottom: 10,
  },
  methodCardSelected: {
    borderColor: colors.primary,
    borderWidth: 1.5,
    backgroundColor: '#FFFDF9',
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  methodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  methodName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#382820',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#EDE0CB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  methodContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5ECE3',
  },
  upiAppsLabel: {
    fontSize: 11,
    color: '#735C50',
    marginBottom: 8,
  },
  upiAppsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  upiAppPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FFF8EC',
    borderWidth: 1,
    borderColor: '#EDE0CB',
  },
  upiAppPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  upiAppText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#382820',
  },
  upiAppTextActive: {
    color: '#FFFFFF',
  },
  inputWrapper: {
    marginTop: 4,
  },
  inputLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#735C50',
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#EDE0CB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: '#382820',
    backgroundColor: '#FFFFFF',
  },
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EDE0CB',
  },
  footerAmountLabel: {
    fontSize: 10.5,
    color: '#735C50',
  },
  footerAmountVal: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  payBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  processingOverlay: {
    position: 'absolute',
    inset: 0,
    zIndex: 999,
    backgroundColor: 'rgba(56, 40, 32, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  processingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 26,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  processingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 14,
    marginBottom: 6,
    textAlign: 'center',
  },
  processingDesc: {
    fontSize: 11,
    color: '#735C50',
    textAlign: 'center',
    lineHeight: 16,
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#15803D',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#15803D',
    marginBottom: 4,
  },
  successTxId: {
    fontSize: 11,
    color: '#735C50',
    marginBottom: 8,
  },
  successAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: 4,
  },
  successSub: {
    fontSize: 11,
    color: colors.goldDark,
    fontWeight: '600',
  },
});
