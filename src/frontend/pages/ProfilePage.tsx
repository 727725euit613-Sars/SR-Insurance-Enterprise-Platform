import React, { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  Lock, 
  Bell, 
  CheckCircle2, 
  Smartphone, 
  Mail, 
  FileCheck, 
  Key, 
  Save, 
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { apiService } from '../services/api';

interface ProfilePageProps {
  onNavigate?: (page: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = () => {
  const currentUser = apiService.getCurrentUser();
  const [name, setName] = useState(currentUser?.name || 'Rajesh Sharma');
  const [email, setEmail] = useState(currentUser?.email || 'customer@safeguard.in');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [panNumber, setPanNumber] = useState('ABCDE1234F');
  const [aadhaarMasked, setAadhaarMasked] = useState('XXXX-XXXX-4921');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  
  // Notification Preferences
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [claimPushAlerts, setClaimPushAlerts] = useState(true);

  // Password update state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Profile information and eKYC records saved successfully.');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters with numbers and symbols.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match.');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('Password updated securely with active session rotation.');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/50 text-emerald-400 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up backdrop-blur-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/20">
            {name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">{name}</h1>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" /> eKYC Verified
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Role: <span className="text-indigo-400 font-semibold">{currentUser?.role || 'CUSTOMER'}</span> • User ID: USR-IND-{currentUser?.userId || '9821'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveProfile}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20 self-start md:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal Info & eKYC */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" /> Personal & Contact Details
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Legal Name (as per PAN/Aadhaar)</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Official Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Phone (OTP Linked)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">PAN Card Number</label>
                  <input
                    type="text"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Registered Address (DigiLocker Synced)</label>
                <textarea
                  rows={2}
                  defaultValue="Flat 402, Sunshine Heights, MG Road, Koramangala, Bengaluru, Karnataka - 560034"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>
            </form>
          </div>

          {/* DigiLocker eKYC & Statutory Verification Badge */}
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" /> DigiLocker & Aadhaar eKYC Verification
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400">UIDAI Aadhaar e-KYC</span>
                  <p className="text-sm font-bold text-white font-mono">{aadhaarMasked}</p>
                  <span className="text-xs text-emerald-400 mt-1 block">Biometrics & OTP Verified</span>
                </div>
              </div>

              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400">Income Tax PAN Database</span>
                  <p className="text-sm font-bold text-white font-mono">{panNumber}</p>
                  <span className="text-xs text-emerald-400 mt-1 block">Active & Name Matched (100%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-400" /> Update Account Password
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="relative">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Current Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter existing password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 chars, 1 number, 1 symbol"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? 'Hide Passwords' : 'Show Passwords'}</span>
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors border border-slate-700"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Security, 2FA & Notifications */}
        <div className="space-y-6">
          {/* Two-Factor Authentication */}
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6">
            <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-400" /> Security & 2FA
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Protect your policy endorsements, claims disbursements, and bank authorizations.
            </p>

            <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 mb-3">
              <div>
                <span className="text-sm font-semibold text-white block">Authenticator (TOTP)</span>
                <span className="text-xs text-slate-400">Google Authenticator or Duo</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={twoFactorEnabled}
                  onChange={(e) => {
                    setTwoFactorEnabled(e.target.checked);
                    showToast(e.target.checked ? '2FA Enabled with TOTP key' : '2FA Disabled');
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Zero-Trust IRDAI Information Security Guidelines Compliant.</span>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-400" /> Notification Channels
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-2.5 text-slate-300">
                  <Mail className="w-4 h-4 text-indigo-400" />
                  <span>Email Policy Schedules & Tax Invoices</span>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-2.5 text-slate-300">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>SMS Renewal & Expiry Alerts</span>
                </div>
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-2.5 text-slate-300">
                  <span className="w-4 h-4 flex items-center justify-center font-bold text-emerald-500">W</span>
                  <span>WhatsApp Claims Tracker & Documents</span>
                </div>
                <input
                  type="checkbox"
                  checked={whatsappAlerts}
                  onChange={(e) => setWhatsappAlerts(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-2.5 text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>Claim Adjudication & Payout Push Updates</span>
                </div>
                <input
                  type="checkbox"
                  checked={claimPushAlerts}
                  onChange={(e) => setClaimPushAlerts(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
