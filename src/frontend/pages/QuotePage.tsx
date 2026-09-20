import React, { useState, useEffect } from "react";
import {
  Car, Heart, Shield, Home, Plane, Briefcase, CheckCircle, ChevronLeft,
  ChevronRight, Download, ArrowRight, Zap, Check, FileText, Sparkles, Percent
} from "lucide-react";
import { insuranceStore } from "../services/insuranceStore";
import { getStoredUser } from "../services/api";
import { openPrintableDocument } from "../utils/documentGenerator";

const insTypes = [
  { label: "Motor", icon: Car, color: "#2563EB", grad: "from-blue-600 to-blue-900" },
  { label: "Health", icon: Heart, color: "#22C55E", grad: "from-green-500 to-emerald-800" },
  { label: "Life", icon: Shield, color: "#8B5CF6", grad: "from-violet-500 to-violet-900" },
  { label: "Property", icon: Home, color: "#F59E0B", grad: "from-amber-500 to-amber-900" },
  { label: "Travel", icon: Plane, color: "#06B6D4", grad: "from-cyan-500 to-cyan-900" },
  { label: "Commercial", icon: Briefcase, color: "#4F46E5", grad: "from-indigo-500 to-indigo-900" },
];

export const QuotePage = ({
  darkMode,
  initialProduct,
  onProceedToIssuance,
}: {
  darkMode: boolean;
  initialProduct?: string;
  onProceedToIssuance: (quoteData: {
    productName: string;
    policyType: "Motor" | "Health" | "Life" | "Property" | "Travel" | "Commercial";
    sumInsured: number;
    annualPremium: number;
    ncbPct: number;
  }) => void;
}) => {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string>(initialProduct || "Motor");
  const [sumInsured, setSumInsured] = useState(2000000);
  const [ncb, setNcb] = useState(25);
  const [deductible, setDeductible] = useState(2000);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([
    "Zero Depreciation",
    "24/7 Roadside Assistance",
  ]);
  const [vehicleNo, setVehicleNo] = useState("KA-01-MN-5678");
  const [vehicleMake, setVehicleMake] = useState("Toyota Fortuner 4x4 (Diesel)");
  const [customerName, setCustomerName] = useState(() => {
    const user = getStoredUser();
    return user?.username || "Arjun Mehta";
  });
  const [customerPhone, setCustomerPhone] = useState("+91 98765 43210");
  const [selectedPlanTier, setSelectedPlanTier] = useState<"Essential" | "Standard" | "Elite">("Standard");

  useEffect(() => {
    const user = getStoredUser();
    if (user?.username) {
      setCustomerName(user.username);
    }
  }, []);

  const dk = darkMode;
  const panelCls = `rounded-[28px] p-6 sm:p-8 border ${
    dk ? "bg-slate-800/50 border-white/[0.07]" : "bg-white border-slate-200/80 shadow-sm"
  }`;

  // Actuarial calculation engine per SRS FR1
  const baseRate = selectedType === "Motor" ? 0.015 : selectedType === "Health" ? 0.012 : selectedType === "Life" ? 0.002 : 0.003;
  const rawBasePremium = sumInsured * baseRate;
  const ncbDiscount = Math.round((rawBasePremium * ncb) / 100);
  const addonCost = selectedAddons.length * 1250;
  const netBeforeTax = Math.max(1500, Math.round(rawBasePremium - ncbDiscount + addonCost - deductible * 0.2));
  const gstAmount = Math.round(netBeforeTax * 0.18);
  const stampDuty = 100;
  const finalAnnualPremium = Math.round(netBeforeTax + gstAmount + stampDuty);

  const toggleAddon = (addon: string) => {
    setSelectedAddons(prev =>
      prev.includes(addon) ? prev.filter(a => a !== addon) : [...prev, addon]
    );
  };

  const handleDownloadQuotePdf = () => {
    const html = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2 style="color: #2563EB;">SR INSURANCE — OFFICIAL QUOTATION</h2>
        <p><strong>Quote Reference:</strong> QTE-${Date.now().toString().slice(-8)} (Valid for 15 days)</p>
        <hr style="margin: 15px 0; border: 1px solid #e2e8f0;" />
        <p><strong>Insured:</strong> ${customerName} (${customerPhone})</p>
        <p><strong>Product Line:</strong> ${selectedType} Insurance — ${selectedPlanTier} Plan</p>
        <p><strong>Sum Insured / IDV:</strong> ₹${(sumInsured ?? 0).toLocaleString()}</p>
        <p><strong>No Claim Bonus Applied:</strong> ${ncb}%</p>
        <p><strong>Add-on Covers:</strong> ${selectedAddons.join(", ") || "None"}</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr style="background: #f1f5f9;"><th style="padding: 8px; text-align: left;">Line Item</th><th style="padding: 8px; text-align: right;">Amount (₹)</th></tr>
          <tr><td style="padding: 8px;">Base Premium</td><td style="padding: 8px; text-align: right;">₹${Math.round(rawBasePremium ?? 0).toLocaleString()}</td></tr>
          <tr><td style="padding: 8px; color: green;">NCB (${ncb}%) Discount</td><td style="padding: 8px; text-align: right; color: green;">- ₹${(ncbDiscount ?? 0).toLocaleString()}</td></tr>
          <tr><td style="padding: 8px;">Add-on Covers</td><td style="padding: 8px; text-align: right;">₹${(addonCost ?? 0).toLocaleString()}</td></tr>
          <tr><td style="padding: 8px;">GST @ 18.00%</td><td style="padding: 8px; text-align: right;">₹${(gstAmount ?? 0).toLocaleString()}</td></tr>
          <tr><td style="padding: 8px;">Stamp Duty</td><td style="padding: 8px; text-align: right;">₹${stampDuty}</td></tr>
          <tr style="background: #dbeafe; font-weight: bold;"><td style="padding: 8px;">TOTAL ESTIMATED ANNUAL PREMIUM</td><td style="padding: 8px; text-align: right;">₹${(finalAnnualPremium ?? 0).toLocaleString()}</td></tr>
        </table>
      </div>
    `;
    openPrintableDocument("Insurance_Quotation_Summary.pdf", html);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 font-sans">
      {/* Step Stepper Header */}
      <div className={panelCls}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Step {step} of 4: {step === 1 ? "Select Line" : step === 2 ? "Asset & Risk" : step === 3 ? "Coverage & Add-ons" : "Review & Compare"}
          </span>
          <span className="text-xs font-bold text-blue-500">Actuarial Engine v2.4</span>
        </div>

        <div className="flex gap-2">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="flex-1 h-2 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
              <div className={`h-full transition-all duration-300 ${s <= step ? "bg-blue-600" : ""}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Select Insurance Category */}
      {step === 1 && (
        <div className={panelCls}>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">What would you like to insure?</h2>
          <p className="text-xs text-slate-500 mb-6">Select your product category to load actuarial rating parameters.</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {insTypes.map(({ label, icon: Icon, color, grad }) => (
              <button
                key={label}
                onClick={() => setSelectedType(label)}
                className={`p-5 rounded-2xl border text-center transition-all flex flex-col items-center gap-3 ${
                  selectedType === label
                    ? "border-blue-500 bg-blue-600/10 shadow-lg shadow-blue-600/20 scale-105"
                    : dk ? "border-white/5 bg-slate-700/20 hover:border-white/20" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">{label} Insurance</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Risk Details & Customer Input */}
      {step === 2 && (
        <div className={panelCls}>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Risk Profile & Asset Specification</h2>
          <p className="text-xs text-slate-500 mb-6">Enter vehicle or asset details for IRDAI rating computation.</p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Customer / Insured Name</label>
              <input
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border text-xs font-semibold bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 outline-none text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Contact Mobile Number</label>
              <input
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border text-xs font-semibold bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 outline-none text-slate-900 dark:text-white"
              />
            </div>
            {selectedType === "Motor" && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Vehicle Registration No.</label>
                  <input
                    value={vehicleNo}
                    onChange={e => setVehicleNo(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border text-xs font-semibold bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 outline-none text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Make & Model</label>
                  <input
                    value={vehicleMake}
                    onChange={e => setVehicleMake(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border text-xs font-semibold bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Actuarial Coverage Customizer */}
      {step === 3 && (
        <div className={panelCls}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Coverage & Add-ons Customization</h2>
              <p className="text-xs text-slate-500">Fine-tune Sum Insured, NCB discount and optional covers.</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400">Live Computed Premium</span>
              <div className="text-2xl font-black text-blue-500">₹{(finalAnnualPremium ?? 0).toLocaleString()}</div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Sum Insured Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-300">Sum Insured / IDV</span>
                <span className="text-blue-500 font-extrabold text-sm">₹{(sumInsured / 100000).toFixed(0)} Lakhs</span>
              </div>
              <input
                type="range"
                min={300000}
                max={5000000}
                step={100000}
                value={sumInsured}
                onChange={e => setSumInsured(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* NCB Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                No Claim Bonus (NCB) Discount
              </label>
              <div className="grid grid-cols-6 gap-2">
                {[0, 20, 25, 35, 45, 50].map(val => (
                  <button
                    key={val}
                    onClick={() => setNcb(val)}
                    className={`py-2 rounded-xl text-xs font-extrabold border transition-all ${
                      ncb === val
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                        : dk ? "border-white/10 bg-slate-800 text-slate-400" : "border-slate-200 bg-slate-50 text-slate-700"
                    }`}
                  >
                    {val}%
                  </button>
                ))}
              </div>
            </div>

            {/* Add-ons Toggles */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Optional Add-on Riders (+₹1,250 each)
              </label>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  "Zero Depreciation",
                  "24/7 Roadside Assistance",
                  "Engine & Gearbox Protection",
                  "Consumables Cover",
                  "Key & Lock Replacement",
                  "Personal Accident Cover (₹15L)",
                ].map(addon => (
                  <label
                    key={addon}
                    onClick={() => toggleAddon(addon)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      selectedAddons.includes(addon)
                        ? "border-blue-500 bg-blue-600/10 text-slate-900 dark:text-white"
                        : dk ? "border-white/5 bg-slate-800/40 text-slate-400" : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAddons.includes(addon)}
                      onChange={() => {}}
                      className="accent-blue-600 rounded"
                    />
                    <span className="text-xs font-bold">{addon}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Plan Comparison & Confirmation */}
      {step === 4 && (
        <div className={panelCls}>
          <div className="text-center mb-6">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Review & Compare Quotation</h2>
            <p className="text-xs text-slate-500">Select your preferred coverage tier or proceed with the customized quote.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { tier: "Essential", factor: 0.8, feats: ["Own Damage Cover", "Third Party Liability", "Basic Roadside Assist"] },
              { tier: "Standard", factor: 1.0, feats: ["Own Damage + TP", "Zero Depreciation", "24/7 Roadside Assist", "Engine Protect"], popular: true },
              { tier: "Elite", factor: 1.35, feats: ["Zero Dep + RSA", "Engine Protection", "Consumables & Key", "Personal Accident ₹15L", "Priority Fast-Track Claims"] },
            ].map(plan => {
              const pCost = Math.round(finalAnnualPremium * plan.factor);
              const isSel = selectedPlanTier === plan.tier;
              return (
                <div
                  key={plan.tier}
                  onClick={() => setSelectedPlanTier(plan.tier as any)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSel
                      ? "border-blue-500 bg-blue-600/10 shadow-xl shadow-blue-600/20 scale-105"
                      : dk ? "border-white/5 bg-slate-800/30" : "border-slate-200 bg-slate-50"
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase bg-blue-600 text-white px-3 py-0.5 rounded-full shadow">
                      Recommended
                    </span>
                  )}
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{plan.tier} Plan</h3>
                    <div className="text-2xl font-black text-blue-500 mt-2">₹{(pCost ?? 0).toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400">per annum incl. 18% GST</div>

                    <div className="space-y-1.5 mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
                      {plan.feats.map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                          <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    className={`w-full mt-5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                      isSel ? "bg-blue-600 text-white shadow-md" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {isSel ? "Selected Plan" : "Choose Tier"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
            <button
              onClick={handleDownloadQuotePdf}
              className={`px-5 py-3 rounded-xl text-xs font-extrabold border transition-all flex items-center gap-2 ${
                dk ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Download className="w-4 h-4 text-blue-500" /> Download Quote PDF (15-Day Lock)
            </button>

            <button
              onClick={() => {
                onProceedToIssuance({
                  productName: `${selectedType} Comprehensive Insurance (${selectedPlanTier} Plan)`,
                  policyType: selectedType as any,
                  sumInsured,
                  annualPremium: finalAnnualPremium,
                  ncbPct: ncb,
                });
              }}
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-extrabold shadow-xl shadow-blue-600/40 transition-all hover:scale-105 flex items-center gap-2"
            >
              Proceed to Policy Issuance & eKYC →
            </button>
          </div>
        </div>
      )}

      {/* Stepper Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
            step === 1 ? "opacity-30 cursor-not-allowed" : dk ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        {step < 4 && (
          <button
            onClick={() => setStep(Math.min(4, step + 1))}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center gap-1.5"
          >
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
