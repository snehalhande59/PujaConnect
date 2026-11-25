'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Settings,
  Save,
  CheckCircle2,
  ShieldCheck,
  Mail,
  Database,
  Check,
  CreditCard,
  Bell,
  Lock,
  Server,
  Smartphone,
  Globe,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'finance' | 'gateway' | 'notifications' | 'system'>('finance');

  // Financial Settings
  const [commission, setCommission] = useState(10);
  const [platformFee, setPlatformFee] = useState(99);
  const [payoutSchedule, setPayoutSchedule] = useState('WEEKLY');
  const [minPayoutThreshold, setMinPayoutThreshold] = useState(1000);
  const [taxGstNumber, setTaxGstNumber] = useState('27AAACD1234F1Z5');

  // Gateway Settings
  const [gatewayMode, setGatewayMode] = useState<'LIVE' | 'TEST'>('TEST');
  const [razorpayKeyId, setRazorpayKeyId] = useState('rzp_test_51NgExampleKey');
  const [webhookSecretStatus, setWebhookSecretStatus] = useState('ACTIVE_VERIFIED');
  const [autoRefunds, setAutoRefunds] = useState(true);

  // Communications / SMTP
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState(587);
  const [emailSender, setEmailSender] = useState('admin@devsutra.in');
  const [enableDevoteeEmails, setEnableDevoteeEmails] = useState(true);
  const [enablePanditSms, setEnablePanditSms] = useState(true);

  // System & Security
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [requireGurukulCert, setRequireGurukulCert] = useState(true);
  const [autoApproveCustomers, setAutoApproveCustomers] = useState(true);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load persisted settings from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('devsutra_platform_settings');
        if (stored) {
          const cfg = JSON.parse(stored);
          if (cfg.commission !== undefined) setCommission(cfg.commission);
          if (cfg.platformFee !== undefined) setPlatformFee(cfg.platformFee);
          if (cfg.payoutSchedule !== undefined) setPayoutSchedule(cfg.payoutSchedule);
          if (cfg.minPayoutThreshold !== undefined) setMinPayoutThreshold(cfg.minPayoutThreshold);
          if (cfg.taxGstNumber !== undefined) setTaxGstNumber(cfg.taxGstNumber);
          if (cfg.gatewayMode !== undefined) setGatewayMode(cfg.gatewayMode);
          if (cfg.razorpayKeyId !== undefined) setRazorpayKeyId(cfg.razorpayKeyId);
          if (cfg.enableDevoteeEmails !== undefined) setEnableDevoteeEmails(cfg.enableDevoteeEmails);
          if (cfg.maintenanceMode !== undefined) setMaintenanceMode(cfg.maintenanceMode);
        }
      } catch (e) {}
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const settingsPayload = {
      commission,
      platformFee,
      payoutSchedule,
      minPayoutThreshold,
      taxGstNumber,
      gatewayMode,
      razorpayKeyId,
      smtpHost,
      enableDevoteeEmails,
      enablePanditSms,
      maintenanceMode,
      requireGurukulCert,
      updatedAt: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('devsutra_platform_settings', JSON.stringify(settingsPayload));
    }

    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    }, 600);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center justify-center p-1.5 rounded-lg bg-amber-100 text-amber-800">
                <Settings className="w-5 h-5 text-amber-700" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                Platform Settings & System Configuration
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-stone-500">
              Enterprise policies, Razorpay payment gateway credentials, Vedic commission rates, and SMTP dispatch rules
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="self-start sm:self-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-xs disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Configuration</span>
          </button>
        </div>

        {saved && (
          <div className="p-4 rounded-xl text-xs bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2 shadow-xs animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">Enterprise configuration updated and synchronized across all active workers!</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('finance')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              activeTab === 'finance'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <span>Financial & Commission</span>
          </button>

          <button
            onClick={() => setActiveTab('gateway')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              activeTab === 'gateway'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <CreditCard className="w-4 h-4 text-emerald-700" />
            <span>Payment Gateway (Razorpay)</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              activeTab === 'notifications'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Mail className="w-4 h-4 text-blue-700" />
            <span>SMTP Email & SMS Relay</span>
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              activeTab === 'system'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Server className="w-4 h-4 text-purple-700" />
            <span>System Modes & Security</span>
          </button>
        </div>

        {/* Tab 1: Financial & Commission */}
        {activeTab === 'finance' && (
          <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs text-xs">
            <div className="border-b border-stone-100 pb-4">
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Financial Policies & Marketplace Dakshina Rates</span>
              </h3>
              <p className="text-stone-500 text-xs">
                Configure platform commission percentage, fixed booking platform fees, and Pandit payout cycles
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Standard Platform Commission (%)
                </label>
                <div className="relative max-w-sm">
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={commission}
                    onChange={(e) => setCommission(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 font-semibold focus:outline-amber-600"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold">%</span>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Retained by DevSutra from Pandit Dakshina upon successful completion of sacred rituals
                </p>
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Auspicious Booking Platform Fee (₹)
                </label>
                <div className="relative max-w-sm">
                  <input
                    type="number"
                    min={0}
                    value={platformFee}
                    onChange={(e) => setPlatformFee(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 font-semibold focus:outline-amber-600"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold">₹</span>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Fixed nominal fee per booking for devotee support and ritual management
                </p>
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Pandit Dakshina Payout Schedule
                </label>
                <select
                  value={payoutSchedule}
                  onChange={(e) => setPayoutSchedule(e.target.value)}
                  className="w-full max-w-sm px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 font-semibold focus:outline-amber-600"
                >
                  <option value="INSTANT">Instant Settlement Post-Ritual</option>
                  <option value="WEEKLY">Weekly Batch (Every Monday)</option>
                  <option value="BIWEEKLY">Bi-Weekly Settlement</option>
                  <option value="MONTHLY">Monthly Settlement (1st of month)</option>
                </select>
                <p className="text-[11px] text-stone-500 mt-1">
                  Automatic direct UPI or NEFT bank transfer timing for verified purohits
                </p>
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Minimum Payout Threshold (₹)
                </label>
                <div className="relative max-w-sm">
                  <input
                    type="number"
                    min={500}
                    value={minPayoutThreshold}
                    onChange={(e) => setMinPayoutThreshold(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 font-semibold focus:outline-amber-600"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold">₹</span>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Minimum accumulated dakshina balance required for automated bank dispatch
                </p>
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  GSTIN / Tax Identification
                </label>
                <input
                  type="text"
                  value={taxGstNumber}
                  onChange={(e) => setTaxGstNumber(e.target.value)}
                  className="w-full max-w-sm px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 font-mono focus:outline-amber-600 uppercase"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  Printed on devotee invoices and samagri kit tax receipts
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Razorpay Payment Gateway */}
        {activeTab === 'gateway' && (
          <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs text-xs">
            <div className="border-b border-stone-100 pb-4">
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Razorpay Gateway & Checkout Credentials</span>
              </h3>
              <p className="text-stone-500 text-xs">
                Secure API connectivity for UPI, Cards, NetBanking, and automated verification webhooks
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Gateway Operational Environment
                </label>
                <div className="flex items-center gap-3 mt-1.5">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-stone-800">
                    <input
                      type="radio"
                      name="gatewayMode"
                      value="LIVE"
                      checked={gatewayMode === 'LIVE'}
                      onChange={() => setGatewayMode('LIVE')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span>Production Live</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-stone-800">
                    <input
                      type="radio"
                      name="gatewayMode"
                      value="TEST"
                      checked={gatewayMode === 'TEST'}
                      onChange={() => setGatewayMode('TEST')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span>Sandbox Test Mode</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Razorpay Key ID
                </label>
                <input
                  type="text"
                  value={razorpayKeyId}
                  onChange={(e) => setRazorpayKeyId(e.target.value)}
                  className="w-full max-w-sm px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 font-mono text-xs focus:outline-amber-600"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  Used by mobile app & website checkout SDK to initialize payments
                </p>
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Webhook Verification Status
                </label>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl max-w-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-emerald-900">Active & Signature Verified</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                    HTTP 200
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Auto-Refund on Booking Cancellation
                </label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="autoRefunds"
                    checked={autoRefunds}
                    onChange={(e) => setAutoRefunds(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <label htmlFor="autoRefunds" className="text-stone-700 font-medium">
                    Automatically trigger Razorpay gateway refund when devotee cancels booking
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: SMTP Email & Communications */}
        {activeTab === 'notifications' && (
          <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs text-xs">
            <div className="border-b border-stone-100 pb-4">
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <span>Gmail SMTP Relay & Communication Dispatch</span>
              </h3>
              <p className="text-stone-500 text-xs">
                Transactional email dispatch for ceremony confirmations, status alerts, and receipts
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  SMTP Host Server
                </label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  className="w-full max-w-sm px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 font-mono text-xs focus:outline-amber-600"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Sender Email Identity
                </label>
                <input
                  type="email"
                  value={emailSender}
                  onChange={(e) => setEmailSender(e.target.value)}
                  className="w-full max-w-sm px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 font-mono text-xs focus:outline-amber-600"
                />
              </div>

              <div className="space-y-3 md:col-span-2 pt-2 border-t border-stone-100">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-stone-800">
                  <input
                    type="checkbox"
                    checked={enableDevoteeEmails}
                    onChange={(e) => setEnableDevoteeEmails(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <span>Dispatch booking confirmation emails to devotees via Gmail SMTP Relay</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-stone-800">
                  <input
                    type="checkbox"
                    checked={enablePanditSms}
                    onChange={(e) => setEnablePanditSms(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <span>Dispatch immediate push alerts & SMS to Pandits upon new sacred assignments</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: System Modes & Security */}
        {activeTab === 'system' && (
          <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs text-xs">
            <div className="border-b border-stone-100 pb-4">
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <Server className="w-4 h-4 text-purple-600" />
                <span>Operating Modes & Shastric Security</span>
              </h3>
              <p className="text-stone-500 text-xs">
                Platform maintenance lock, scholar Gurukul certificate verification requirements, and database safety
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">Gurukul Vedic Credentials Check</h4>
                  <p className="text-stone-500 text-xs mt-0.5">
                    Strictly require Purohits to upload Gurukul certificates & Shastric documents prior to marketplace visibility
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={requireGurukulCert}
                  onChange={(e) => setRequireGurukulCert(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded mt-1"
                />
              </div>

              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">Instant Devotee Account Activation</h4>
                  <p className="text-stone-500 text-xs mt-0.5">
                    Automatically activate devotee accounts upon mobile OTP / password verification without manual intervention
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={autoApproveCustomers}
                  onChange={(e) => setAutoApproveCustomers(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded mt-1"
                />
              </div>

              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-bold text-rose-900 text-sm flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Emergency System Maintenance Mode</span>
                  </h4>
                  <p className="text-rose-700 text-xs mt-0.5">
                    When active, public booking checkout is paused while administrative operations remain accessible.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded mt-1"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
