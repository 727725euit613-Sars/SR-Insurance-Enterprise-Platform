import React, { useState } from 'react';
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
  Sparkles
} from 'lucide-react';
import { insuranceStore, type ProductModel as Product, type PolicyModel as Policy } from '../../services/insuranceStore';
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
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const products = insuranceStore.getProducts();

  // Form State
  const [selectedProductId, setSelectedProductId] = useState<string>(
    preselectedProduct?.productId ? String(preselectedProduct.productId) : (products[0]?.productId ? String(products[0].productId) : '')
  );
  const [customerName, setCustomerName] = useState('Rajesh Sharma');
  const [customerEmail, setCustomerEmail] = useState('rajesh.sharma@gmail.com');
  const [customerPhone, setCustomerPhone] = useState('+91 98765 43210');
  const [aadhaarNumber, setAadhaarNumber] = useState('5421-9876-1234');
  const [panNumber, setPanNumber] = useState('ABCDE1234F');
  const [nomineeName, setNomineeName] = useState('Pooja Sharma');
  const [nomineeRelation, setNomineeRelation] = useState('Spouse');

  // Risk / Asset Details
  const [registrationNumber, setRegistrationNumber] = useState('MH-02-CB-8821');
  const [makeModel, setMakeModel] = useState('Hyundai Creta 1.5 SX(O)');
  const [manufacturingYear, setManufacturingYear] = useState(2023);
  const [sumInsured, setSumInsured] = useState(1250000);
  const [ncb, setNcb] = useState(20);
  const [zeroDep, setZeroDep] = useState(true);
  const [engineProtect, setEngineProtect] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const currentProduct = products.find(p => String(p.productId) === selectedProductId) || products[0];

  // Premium Math
  const odBase = (sumInsured * (currentProduct?.baseRatePerMille || 2.8)) / 100;
  const ncbDiscount = (odBase * ncb) / 100;
  const netOD = odBase - ncbDiscount;
  const tpPremium = 3416; // Statutory IRDAI TP rate
  const addOnsCost = (zeroDep ? 3200 : 0) + (engineProtect ? 1800 : 0);
  const netPremium = Math.round(netOD + tpPremium + addOnsCost);
  const gstAmount = Math.round(netPremium * 0.18);
  const grossPremium = netPremium + gstAmount;

  const handleIssuePolicy = () => {
    if (!currentProduct) return;
    try {
      const newPolicy = insuranceStore.createPolicy({
        productName: currentProduct.productName,
        policyType: (currentProduct.lob === 'MOTOR' ? 'Motor' : currentProduct.lob === 'HEALTH' ? 'Health' : currentProduct.lob === 'LIFE' ? 'Life' : currentProduct.lob === 'PROPERTY' ? 'Property' : currentProduct.lob === 'TRAVEL' ? 'Travel' : 'Commercial') as Policy['policyType'],
        sumInsured,
        annualPremium: grossPremium,
        customerName,
        customerEmail,
        customerPhone,
        customerAddress: 'India',
        vehicleNo: registrationNumber,
        vehicleMake: makeModel,
        nomineeName,
        nomineeRelation,
        ncbPct: ncb,
      });
      onSuccess(newPolicy);
      onClose();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Unable to issue policy');
    }
    return;
    /*
    setIsProcessing(true);
    setTimeout(() => {
      const now = new Date();
      const nextYear = new Date(now);
      nextYear.setFullYear(now.getFullYear() + 1);

      const newPolicy: Policy = {
        id: `POL-${Date.now().toString().slice(-6)}`,
        policyNumber: `SG/${currentProduct.category.slice(0, 3)}/2026/${Math.floor(100000 + Math.random() * 900000)}`,
        productId: currentProduct.id,
        productName: currentProduct.name,
        uin: currentProduct.uin,
        customerId: 'CUST-IND-01',
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        riskDetails: {
          assetType: currentProduct.category,
          registrationNumber: registrationNumber,
          makeModel: makeModel,
          manufacturingYear: manufacturingYear,
          chassisNumber: 'MA3FHB11S00' + Math.floor(100000 + Math.random() * 900000),
          engineNumber: 'G4FLM' + Math.floor(100000 + Math.random() * 900000)
        },
        sumInsured: sumInsured,
        netPremium: netPremium,
        gstAmount: gstAmount,
        grossPremium: grossPremium,
        ncbPercentage: ncb,
        policyStartDate: now.toISOString().split('T')[0],
        policyEndDate: nextYear.toISOString().split('T')[0],
        status: sumInsured > 2500000 ? 'UNDERWRITING_REVIEW' : 'ACTIVE',
        issuedAt: now.toISOString().split('T')[0],
        agentCode: 'AG-9042',
        irdaApproved: true,
        nomineeDetails: {
          name: nomineeName,
          relation: nomineeRelation,
          age: 32
        }
      };

      insuranceStore.addPolicy(newPolicy);
      setIsProcessing(false);
      onSuccess(newPolicy);
      onClose();
    }, 1200);*/
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 lg:p-8 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Wizard Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Instant IRDAI Straight-Through Policy Issuance</span>
          </div>
          <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
            New Insurance Proposal & eKYC Wizard
          </h2>
        </div>

        {/* Step Progression Bar */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 z-0"></div>
          {[
            { num: 1, label: 'Product & Asset' },
            { num: 2, label: 'Aadhaar eKYC' },
            { num: 3, label: 'Underwriting & Add-ons' },
            { num: 4, label: 'Review & Issuance' },
          ].map((s) => (
            <div key={s.num} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step >= s.num
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
              </div>
              <span className="text-[11px] font-medium text-slate-400 mt-1.5 hidden sm:block">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* STEP 1: Product Selection & Asset Details */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select IRDAI Product</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {products.map((p) => (
                  <option key={p.productId} value={p.productId}>
                    {p.productName} ({p.irdaiUin})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Registration Number</label>
                <input
                  type="text"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="e.g. DL-01-AB-1234"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Make & Model</label>
                <input
                  type="text"
                  value={makeModel}
                  onChange={(e) => setMakeModel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Tata Nexon EV Max"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Manufacturing Year</label>
                <input
                  type="number"
                  value={manufacturingYear}
                  onChange={(e) => setManufacturingYear(parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Insured Declared Value (IDV ₹)</label>
                <input
                  type="number"
                  step="50000"
                  value={sumInsured}
                  onChange={(e) => setSumInsured(parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-semibold"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: eKYC & Nominee Details */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-3.5 bg-indigo-950/30 rounded-2xl border border-indigo-500/20 flex items-center gap-3">
              <Fingerprint className="w-6 h-6 text-indigo-400 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-white">IRDAI Mandatory e-KYC Integration</span>
                <p className="text-slate-400">UIDAI OTP authentication & instant DigiLocker document fetch.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Proposer Full Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Aadhaar Number (UIDAI)</label>
                <input
                  type="text"
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="XXXX-XXXX-XXXX"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">PAN Card Number</label>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nominee Full Name</label>
                <input
                  type="text"
                  value={nomineeName}
                  onChange={(e) => setNomineeName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nominee Relationship</label>
                <select
                  value={nomineeRelation}
                  onChange={(e) => setNomineeRelation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent</option>
                  <option value="Child">Child</option>
                  <option value="Sibling">Sibling</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Actuarial Add-ons & NCB Progression */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                No Claim Bonus (NCB) Discount Tier
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[0, 20, 25, 35, 50].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setNcb(rate)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      ncb === rate
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-slate-300">Actuarial Endorsement Add-ons</label>
              
              <label className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                <div>
                  <span className="text-sm font-semibold text-white block">Nil Depreciation / Bumper-to-Bumper</span>
                  <span className="text-xs text-slate-400">100% reimbursement on fiber, glass & rubber parts</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-semibold text-indigo-400">+₹3,200</span>
                  <input
                    type="checkbox"
                    checked={zeroDep}
                    onChange={(e) => setZeroDep(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                </div>
              </label>

              <label className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                <div>
                  <span className="text-sm font-semibold text-white block">Hydrostatic Lock & Engine Protector</span>
                  <span className="text-xs text-slate-400">Water ingress and engine lubricant leakage coverage</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-semibold text-indigo-400">+₹1,800</span>
                  <input
                    type="checkbox"
                    checked={engineProtect}
                    onChange={(e) => setEngineProtect(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                </div>
              </label>
            </div>
          </div>
        )}

        {/* STEP 4: Summary & Instant Issuance */}
        {step === 4 && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                <span className="text-xs text-slate-400">Product & UIN:</span>
                <span className="text-xs font-semibold text-white">{currentProduct?.productName || "Insurance Product"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Proposer & Nominee:</span>
                <span className="text-xs font-medium text-slate-200">{customerName} (Nominee: {nomineeName})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Asset & Reg Number:</span>
                <span className="text-xs font-medium text-slate-200">{makeModel} ({registrationNumber})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Sum Insured (IDV):</span>
                <span className="text-xs font-bold text-white font-mono">₹{sumInsured.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Net Premium (OD + TP + Add-ons):</span>
                <span className="text-xs font-medium text-slate-200 font-mono">₹{netPremium.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Statutory GST (18%):</span>
                <span className="text-xs font-medium text-slate-200 font-mono">₹{gstAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
                <span className="text-sm font-bold text-white">Gross Payable Premium:</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">₹{grossPremium.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Section 45 Non-Contestability protection applies after 36 continuous policy months.</span>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((step - 1) as any)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div></div>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((step + 1) as any)}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20"
            >
              <span>Continue</span> <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleIssuePolicy}
              disabled={isProcessing}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
            >
              {isProcessing ? (
                <span>Generating Policy Schedule...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Issue Policy & Generate Certificate</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
