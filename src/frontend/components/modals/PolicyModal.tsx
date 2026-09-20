import React, { useState, useEffect } from 'react';
import { 
  X, 
  Shield, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  FileText, 
  User, 
  Car, 
  CreditCard, 
  Fingerprint,
  Download,
  Building2,
  Calendar,
  Sparkles,
  Check
} from 'lucide-react';
import { insuranceStore, type ProductModel as Product, type PolicyModel as Policy } from '../../services/insuranceStore';
import { getStoredUser } from '../../services/api';
import { documentGenerator } from '../../utils/documentGenerator';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (policy: Policy) => void;
  preselectedProduct?: Product | null;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedProduct
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const products = insuranceStore.getProducts();

  // Form State - Customer Details (Step 1)
  const [customerName, setCustomerName] = useState('Arjun Mehta');
  const [customerEmail, setCustomerEmail] = useState('arjun.mehta@srinsurance.com');
  const [customerPhone, setCustomerPhone] = useState('+91 98765 43210');
  const [aadhaarNumber, setAadhaarNumber] = useState('5421-9876-1234');
  const [panNumber, setPanNumber] = useState('ABCDE1234F');

  // Form State - Policy & Coverage (Step 2)
  const [selectedProductId, setSelectedProductId] = useState<string>(
    preselectedProduct?.productId ? String(preselectedProduct.productId) : (products[0]?.productId ? String(products[0].productId) : '')
  );
  const [sumInsured, setSumInsured] = useState(1250000);
  const [policyTenure, setPolicyTenure] = useState('1 Year');

  // Form State - Asset & Nominee Details (Step 3)
  const [registrationNumber, setRegistrationNumber] = useState('MH-02-CB-8821');
  const [makeModel, setMakeModel] = useState('Hyundai Creta 1.5 SX(O)');
  const [manufacturingYear, setManufacturingYear] = useState(2024);
  const [nomineeName, setNomineeName] = useState('Pooja Mehta');
  const [nomineeRelation, setNomineeRelation] = useState('Spouse');

  // Underwriting & Addons
  const [ncb, setNcb] = useState(20);
  const [zeroDep, setZeroDep] = useState(true);
  const [engineProtect, setEngineProtect] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [issuedPolicy, setIssuedPolicy] = useState<Policy | null>(null);

  // Initialize with logged in user if available
  useEffect(() => {
    if (!isOpen) return;
    const currentUser = getStoredUser();
    if (currentUser) {
      if (currentUser.username) setCustomerName(currentUser.username);
      if (currentUser.email) setCustomerEmail(currentUser.email);
    }
    if (preselectedProduct?.productId) {
      setSelectedProductId(String(preselectedProduct.productId));
    }
  }, [isOpen, preselectedProduct]);

  if (!isOpen) return null;

  const currentProduct = products.find(p => String(p.productId) === selectedProductId) || products[0];

  // Premium Math (Actuarial Calculation per IRDAI Tariff)
  const odBase = Math.round((sumInsured * (currentProduct?.baseRatePerMille || 2.8)) / 100);
  const ncbDiscount = Math.round((odBase * ncb) / 100);
  const netOD = odBase - ncbDiscount;
  const tpPremium = 3416; // Statutory IRDAI TP rate
  const addOnsCost = (zeroDep ? 3200 : 0) + (engineProtect ? 1800 : 0);
  const netPremium = Math.round(netOD + tpPremium + addOnsCost);
  const gstAmount = Math.round(netPremium * 0.18);
  const grossPremium = netPremium + gstAmount;

  const handleIssuePolicy = () => {
    if (!currentProduct) return;
    setIsProcessing(true);
    try {
      const currentUser = getStoredUser();
      const customerId = currentUser?.role === 'CUSTOMER' ? currentUser.userId : undefined;
      const customerCode = currentUser?.role === 'CUSTOMER' ? (currentUser.customerCode || currentUser.username) : undefined;

      const newPolicy = insuranceStore.createPolicy({
        productName: currentProduct.productName,
        policyType: (currentProduct.lob === 'MOTOR' ? 'Motor' : currentProduct.lob === 'HEALTH' ? 'Health' : currentProduct.lob === 'LIFE' ? 'Life' : currentProduct.lob === 'PROPERTY' ? 'Property' : currentProduct.lob === 'TRAVEL' ? 'Travel' : 'Commercial') as Policy['policyType'],
        sumInsured,
        annualPremium: grossPremium,
        customerId: customerId,
        customerCode: customerCode,
        customerName: customerName || currentUser?.username || 'Customer',
        customerEmail: customerEmail || currentUser?.email || 'customer@srinsurance.com',
        customerPhone: customerPhone || '+91 98765 43210',
        customerAddress: 'SR Insurance Registered Policyholder, India',
        vehicleNo: registrationNumber,
        vehicleMake: makeModel,
        nomineeName,
        nomineeRelation,
        ncbPct: ncb,
      });

      // Dispatch events for live UI updates across views
      window.dispatchEvent(new CustomEvent('policy:created', { detail: newPolicy }));
      window.dispatchEvent(new Event('policies:updated'));

      setIssuedPolicy(newPolicy);
      setStep(5); // Move to success confirmation step
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to issue policy');
    } finally {
      setIsProcessing(false);
    }
  };

  const stepsList = [
    { num: 1, title: 'Customer Details' },
    { num: 2, title: 'Policy & Coverage' },
    { num: 3, title: 'Asset & Nominee' },
    { num: 4, title: 'Premium Summary' },
    { num: 5, title: 'Confirmation' },
  ];

  const handleCompleteFlow = () => {
    if (issuedPolicy) {
      onSuccess(issuedPolicy);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#101A33] border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 lg:p-7 shadow-2xl relative my-6 text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Wizard Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4 text-blue-400" />
            <span>IRDAI Compliant E-Policy Issuance</span>
          </div>
          <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
            {step === 5 ? "Policy Issued Successfully" : "New Policy Application Form"}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {step === 5 
              ? "Your digital insurance certificate has been generated with statutory seal."
              : "Complete the mandatory KYC and underwriting details for instant policy issuance."}
          </p>
        </div>

        {/* Progress Stepper */}
        <div className="mb-6 pb-4 border-b border-slate-700/60">
          <div className="grid grid-cols-5 gap-2 relative">
            {stepsList.map((s) => {
              const isCompleted = step > s.num;
              const isCurrent = step === s.num;
              return (
                <div key={s.num} className="flex flex-col items-center text-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                      isCompleted
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : isCurrent
                        ? 'bg-blue-600 text-white ring-4 ring-blue-600/20'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <span className={`text-[10px] font-medium mt-1.5 leading-tight ${
                    isCurrent ? 'text-blue-400 font-semibold' : isCompleted ? 'text-slate-300' : 'text-slate-400'
                  }`}>
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 1: Customer Details */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="p-3 bg-blue-950/40 rounded-xl border border-blue-500/20 flex items-center gap-3">
              <Fingerprint className="w-5 h-5 text-blue-400 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-white">IRDAI Mandatory KYC Verification</span>
                <p className="text-slate-400 text-[11px]">Personal identification linked directly with UIDAI &amp; Income Tax PAN databases.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Proposer Full Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-[#0B132B] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Arjun Mehta"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address *</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-[#0B132B] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. arjun@example.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mobile Number *</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-[#0B132B] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Aadhaar (UIDAI) *</label>
                <input
                  type="text"
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value)}
                  className="w-full bg-[#0B132B] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="5421-9876-1234"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">PAN Card Number *</label>
                <input
                  type="text"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                  className="w-full bg-[#0B132B] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono uppercase"
                  maxLength={10}
                  placeholder="ABCDE1234F"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Policy & Coverage Details */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Selected IRDAI Product Plan *</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full bg-[#0B132B] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {products.map((p) => (
                  <option key={p.productId} value={p.productId}>
                    {p.productName} — LOB: {p.lob} (UIN: {p.irdaiUin})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Sum Insured / IDV (₹) *</label>
                <input
                  type="number"
                  step="50000"
                  value={sumInsured}
                  onChange={(e) => setSumInsured(Math.max(100000, parseInt(e.target.value) || 0))}
                  className="w-full bg-[#0B132B] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-white font-mono font-semibold focus:outline-none focus:border-blue-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Insured Declared Value (IDV) benchmark for claim liability</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Policy Tenure</label>
                <select
                  value={policyTenure}
                  onChange={(e) => setPolicyTenure(e.target.value)}
                  className="w-full bg-[#0B132B] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="1 Year">1 Year (Annual Policy)</option>
                  <option value="2 Years">2 Years Multi-Year</option>
                  <option value="3 Years">3 Years Comprehensive</option>
                </select>
                <span className="text-[11px] text-slate-400 mt-1 block">Standard annual renewable schedule with 30-day grace</span>
              </div>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/70 text-xs flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Line of Business: {currentProduct?.lob || 'General Insurance'}</p>
                <p className="text-slate-400 text-[11px]">IRDAI Regulatory UIN: {currentProduct?.irdaiUin || 'IRDAI/NL-GEN/2023'}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30">
                Base Rate: {currentProduct?.baseRatePct || 2.8}% p.a.
              </span>
            </div>
          </div>
        )}

        {/* STEP 3: Asset & Nominee Details */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Asset Registration / Reference No. *</label>
                <input
                  type="text"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                  className="w-full bg-[#0B132B] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="e.g. MH-02-CB-8821"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Asset Make &amp; Model *</label>
                <input
                  type="text"
                  value={makeModel}
                  onChange={(e) => setMakeModel(e.target.value)}
                  className="w-full bg-[#0B132B] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Hyundai Creta 1.5 SX(O)"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Manufacturing Year</label>
                <input
                  type="number"
                  value={manufacturingYear}
                  onChange={(e) => setManufacturingYear(parseInt(e.target.value) || 2024)}
                  className="w-full bg-[#0B132B] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nominee Full Name *</label>
                <input
                  type="text"
                  value={nomineeName}
                  onChange={(e) => setNomineeName(e.target.value)}
                  className="w-full bg-[#0B132B] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Pooja Mehta"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nominee Relationship *</label>
                <select
                  value={nomineeRelation}
                  onChange={(e) => setNomineeRelation(e.target.value)}
                  className="w-full bg-[#0B132B] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent</option>
                  <option value="Child">Child</option>
                  <option value="Sibling">Sibling</option>
                </select>
              </div>
            </div>

            {/* Actuarial Endorsements */}
            <div className="pt-2 border-t border-slate-700/60 space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Statutory Add-on Endorsements</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label className="flex items-center justify-between p-3 bg-[#0B132B] rounded-lg border border-slate-700/80 hover:border-slate-600 cursor-pointer">
                  <div className="text-xs">
                    <span className="font-semibold text-white block">Zero Depreciation</span>
                    <span className="text-[11px] text-slate-400">100% parts waiver</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-blue-400">+₹3,200</span>
                    <input
                      type="checkbox"
                      checked={zeroDep}
                      onChange={(e) => setZeroDep(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-blue-600 w-4 h-4"
                    />
                  </div>
                </label>

                <label className="flex items-center justify-between p-3 bg-[#0B132B] rounded-lg border border-slate-700/80 hover:border-slate-600 cursor-pointer">
                  <div className="text-xs">
                    <span className="font-semibold text-white block">Engine Protector</span>
                    <span className="text-[11px] text-slate-400">Hydrostatic lock cover</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-blue-400">+₹1,800</span>
                    <input
                      type="checkbox"
                      checked={engineProtect}
                      onChange={(e) => setEngineProtect(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-blue-600 w-4 h-4"
                    />
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Premium Summary & Tax Schedule */}
        {step === 4 && (
          <div className="space-y-4">
            {/* NCB Tier Selector */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-300">No Claim Bonus (NCB) Discount Tier</label>
                <span className="text-xs font-bold text-emerald-400 font-mono">-{ncb}% Discount Applied</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[0, 20, 25, 35, 50].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setNcb(rate)}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      ncb === rate
                        ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                        : 'bg-[#0B132B] text-slate-300 border-slate-700/80 hover:border-slate-600'
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>

            {/* Actuarial Breakdown Card */}
            <div className="bg-[#0B132B] p-4 rounded-xl border border-slate-700/80 space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-700/60">
                <span className="text-slate-400">Selected Plan:</span>
                <span className="font-semibold text-white">{currentProduct?.productName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Sum Insured (IDV):</span>
                <span className="font-mono font-semibold text-white">₹{sumInsured.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Own Damage (OD) Base Premium:</span>
                <span className="font-mono text-slate-200">₹{odBase.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-emerald-400">
                <span>NCB Discount ({ncb}% on OD):</span>
                <span className="font-mono">-₹{ncbDiscount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Statutory IRDAI Third-Party (TP):</span>
                <span className="font-mono text-slate-200">₹{tpPremium.toLocaleString('en-IN')}</span>
              </div>
              {addOnsCost > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Add-on Endorsements (Zero Dep + Engine):</span>
                  <span className="font-mono text-slate-200">₹{addOnsCost.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-slate-700/60">
                <span className="text-slate-400">Net Premium:</span>
                <span className="font-mono font-semibold text-white">₹{netPremium.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Goods &amp; Services Tax (18% GST):</span>
                <span className="font-mono text-slate-200">₹{gstAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center pt-2.5 border-t border-slate-700/80">
                <span className="text-sm font-bold text-white">Total Payable Annual Premium:</span>
                <span className="text-lg font-black text-emerald-400 font-mono">₹{grossPremium.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="p-2.5 bg-emerald-950/30 rounded-lg border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Section 45 Non-Contestability protection applies after 36 continuous policy months.</span>
            </div>
          </div>
        )}

        {/* STEP 5: Success State / Confirmation */}
        {step === 5 && issuedPolicy && (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-950/30 rounded-xl border border-emerald-500/30 text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">✓ Policy Issued Successfully</h3>
              <p className="text-xs text-slate-300">
                Your statutory policy certificate has been registered in the SR Insurance central repository.
              </p>
            </div>

            <div className="bg-[#0B132B] p-4 rounded-xl border border-slate-700/80 space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-700/60">
                <span className="text-slate-400 font-medium">Policy Number:</span>
                <span className="font-mono font-bold text-blue-400 text-sm">{issuedPolicy.policyNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Policyholder:</span>
                <span className="font-semibold text-white">{issuedPolicy.customerName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Plan Name:</span>
                <span className="font-semibold text-white">{issuedPolicy.productName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Total Premium:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">₹{(issuedPolicy.annualPremium ?? grossPremium).toLocaleString('en-IN')} / year</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Effective Date:</span>
                <span className="text-slate-200">{issuedPolicy.startDate || new Date().toISOString().split('T')[0]}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Expiry Date:</span>
                <span className="text-slate-200">{issuedPolicy.endDate || new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0]}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-700/60">
                <span className="text-slate-400 font-medium">Policy Status:</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  ACTIVE (IRDAI Registered)
                </span>
              </div>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => documentGenerator.downloadPolicyPdf(issuedPolicy)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Download Certificate</span>
              </button>
              <button
                type="button"
                onClick={handleCompleteFlow}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30 transition-all"
              >
                <span>View My Policy</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Footer Actions (Steps 1 to 4) */}
        {step <= 4 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-700/60">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((step - 1) as any)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((step + 1) as any)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20"
              >
                <span>Continue</span> <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleIssuePolicy}
                disabled={isProcessing}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Generating Policy Schedule...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Issue Policy &amp; Generate Certificate</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
