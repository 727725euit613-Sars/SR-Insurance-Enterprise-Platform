import React, { useState } from "react";
import {
  Car, Heart, Shield, Home, Plane, Briefcase,
  CheckCircle2, Filter, ArrowRight, ShieldCheck,
  Calculator, Check, X, Building2, Clock, Award
} from "lucide-react";
import { insuranceStore, type ProductModel } from "../services/insuranceStore";

export const MarketplacePage = ({
  darkMode,
  onSelectProductForQuote,
  onBuyNow,
}: {
  darkMode: boolean;
  onSelectProductForQuote: (productName: string) => void;
  onBuyNow?: (product: ProductModel) => void;
}) => {
  const [filter, setFilter] = useState("All");
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const products = insuranceStore.getProducts();
  const dk = darkMode;

  const filteredProducts = products.filter(
    p => filter === "All" || p.lob.toUpperCase() === filter.toUpperCase()
  );

  return (
    <div className={`p-6 lg:p-8 space-y-6 ${dk ? "bg-[#0A0F1E] text-white" : "bg-slate-50 text-slate-900"}`}>
      {/* Category Tabs Bar */}
      <div className={`flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-xl border ${
        dk ? "bg-[#101A33] border-slate-700/60 shadow-sm" : "bg-white border-slate-200 shadow-sm"
      }`}>
        <div className="flex gap-1.5 flex-wrap">
          {["All", "Motor", "Health", "Life", "Property", "Travel", "Commercial"].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`text-xs px-3.5 py-2 rounded-lg font-semibold transition-all ${
                filter === cat
                  ? "bg-blue-600 text-white shadow-sm"
                  : dk
                  ? "text-slate-300 hover:text-white hover:bg-slate-800"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          onClick={() => setCompareModalOpen(true)}
          className={`flex items-center gap-2 text-xs px-3.5 py-2 rounded-lg font-semibold border transition-all ${
            dk ? "border-slate-700 text-slate-200 hover:bg-slate-800" : "border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <Filter className="w-3.5 h-3.5 text-blue-500" />
          <span>Compare All Plans</span>
        </button>
      </div>

      {/* Product Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map(prod => {
          const IconComp =
            prod.lob === "MOTOR" ? Car :
            prod.lob === "HEALTH" ? Heart :
            prod.lob === "LIFE" ? Shield :
            prod.lob === "PROPERTY" ? Home :
            prod.lob === "TRAVEL" ? Plane : Briefcase;

          return (
            <div
              key={prod.productId}
              className={`rounded-xl border flex flex-col justify-between transition-all duration-200 hover:shadow-md ${
                dk
                  ? "bg-[#101A33] border-slate-700/70 shadow-black/20"
                  : "bg-white border-slate-200 shadow-sm"
              }`}
            >
              {/* Card Header */}
              <div className="p-5 pb-4 border-b border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
                        {prod.lob}
                      </span>
                      <p className="text-[10px] font-mono text-slate-400 leading-none">
                        UIN: {prod.irdaiUin}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    IRDAI Approved
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {prod.productName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {prod.description}
                </p>

                {/* Key Financial Metrics */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50 grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Sum Insured Up To</span>
                    <div className="text-base font-bold text-slate-900 dark:text-white font-mono">
                      ₹{(prod.maxSumInsured / 100000).toFixed(0)} Lakhs
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Base Tariff</span>
                    <div className="text-base font-bold text-blue-600 dark:text-blue-400 font-mono">
                      {prod.baseRatePct}% p.a.
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Body - Key Benefits */}
              <div className="p-5 pt-4 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Key Features &amp; Coverage
                  </p>
                  <div className="space-y-1.5">
                    {prod.benefits.slice(0, 3).map((b, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex gap-2">
                  <button
                    onClick={() => onSelectProductForQuote(prod.productName)}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors ${
                      dk
                        ? "border-slate-700 text-slate-200 hover:bg-slate-800"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <Calculator className="w-3.5 h-3.5 text-slate-400" />
                    <span>Calculate Quote</span>
                  </button>
                  <button
                    onClick={() => {
                      if (onBuyNow) {
                        onBuyNow(prod);
                      } else {
                        onSelectProductForQuote(prod.productName);
                      }
                    }}
                    className="flex-1 py-2.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-sm transition-all flex items-center justify-center gap-1"
                  >
                    <span>Buy Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Modal */}
      {compareModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`border rounded-xl w-full max-w-4xl shadow-2xl p-6 max-h-[85vh] overflow-y-auto space-y-4 ${
            dk ? "bg-[#101A33] border-slate-700 text-slate-100" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">IRDAI Plan Comparison Matrix</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Statutory comparison across major Lines of Business</p>
              </div>
              <button 
                onClick={() => setCompareModalOpen(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-700/80 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase font-bold">
                    <th className="py-3 px-4">Feature / Policy Line</th>
                    <th className="py-3 px-4 text-blue-600 dark:text-blue-400">Motor Car Comprehensive</th>
                    <th className="py-3 px-4 text-emerald-600 dark:text-emerald-400">Health Family Floater</th>
                    <th className="py-3 px-4 text-indigo-600 dark:text-indigo-400">Smart Term Life</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-700 dark:text-slate-300 font-medium">
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Max Sum Insured</td>
                    <td className="py-3 px-4 font-mono">₹50 Lakhs (IDV)</td>
                    <td className="py-3 px-4 font-mono">₹50 Lakhs</td>
                    <td className="py-3 px-4 font-mono">₹5 Crore</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">No Claim Bonus (NCB)</td>
                    <td className="py-3 px-4">Up to 50% discount</td>
                    <td className="py-3 px-4">Cumulative bonus (10%/yr)</td>
                    <td className="py-3 px-4">N/A</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Cashless Network</td>
                    <td className="py-3 px-4">5,000+ Authorized Garages</td>
                    <td className="py-3 px-4">10,000+ Empanelled Hospitals</td>
                    <td className="py-3 px-4">Direct Wire Settlement</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Aadhaar eKYC Required</td>
                    <td className="py-3 px-4">Yes (UIDAI OTP verified)</td>
                    <td className="py-3 px-4">Yes (UIDAI OTP verified)</td>
                    <td className="py-3 px-4">Yes (UIDAI OTP verified)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Claim Settlement SLA</td>
                    <td className="py-3 px-4">7 Business Days</td>
                    <td className="py-3 px-4">30 Mins Pre-Authorization</td>
                    <td className="py-3 px-4">24h Immediate Settlement</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setCompareModalOpen(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
