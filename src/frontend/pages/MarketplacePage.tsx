import React, { useState } from "react";
import {
  Car, Heart, Shield, Home, Plane, Briefcase, Star, CheckCircle,
  Filter, ArrowRight, ShieldCheck, Zap, Info, Check, X
} from "lucide-react";
import { insuranceStore, type ProductModel } from "../services/insuranceStore";

export const MarketplacePage = ({
  darkMode,
  onSelectProductForQuote,
}: {
  darkMode: boolean;
  onSelectProductForQuote: (productName: string) => void;
}) => {
  const [filter, setFilter] = useState("All");
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const products = insuranceStore.getProducts();
  const dk = darkMode;
  const cardCls = `rounded-[28px] border overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${
    dk ? "bg-slate-800/50 border-white/[0.07]" : "bg-white border-slate-200/80 shadow-sm"
  }`;

  const filteredProducts = products.filter(
    p => filter === "All" || p.lob.toUpperCase() === filter.toUpperCase()
  );

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Category Tabs Bar */}
      <div className={`flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border ${
        dk ? "bg-slate-800/40 border-white/[0.07]" : "bg-white border-slate-200/80 shadow-sm"
      }`}>
        <div className="flex gap-2 flex-wrap">
          {["All", "Motor", "Health", "Life", "Property", "Travel", "Commercial"].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`text-xs px-4 py-2 rounded-xl font-extrabold transition-all ${
                filter === cat
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : dk
                  ? "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          onClick={() => setCompareModalOpen(true)}
          className={`flex items-center gap-2 text-xs px-4 py-2 rounded-xl font-extrabold border transition-all ${
            dk ? "border-white/10 text-slate-300 hover:bg-white/[0.05]" : "border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <Filter className="w-3.5 h-3.5 text-blue-500" /> Compare All Plans
        </button>
      </div>

      {/* Product Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(prod => {
          const color =
            prod.lob === "MOTOR" ? "#2563EB" :
            prod.lob === "HEALTH" ? "#22C55E" :
            prod.lob === "LIFE" ? "#8B5CF6" :
            prod.lob === "PROPERTY" ? "#F59E0B" :
            prod.lob === "TRAVEL" ? "#06B6D4" : "#4F46E5";

          const IconComp =
            prod.lob === "MOTOR" ? Car :
            prod.lob === "HEALTH" ? Heart :
            prod.lob === "LIFE" ? Shield :
            prod.lob === "PROPERTY" ? Home :
            prod.lob === "TRAVEL" ? Plane : Briefcase;

          return (
            <div key={prod.productId} className={cardCls}>
              {/* Card Header Gradient */}
              <div
                className="p-6 relative text-white"
                style={{ background: `linear-gradient(135deg, ${color}, ${color}CC)` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg">
                    <IconComp className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-black/25 backdrop-blur-sm px-2.5 py-1 rounded-full text-white">
                    UIN: {prod.irdaiUin.slice(0, 12)}...
                  </span>
                </div>

                <h3 className="text-base font-black tracking-tight">{prod.productName}</h3>
                <p className="text-xs text-white/80 mt-1 line-clamp-2">{prod.description}</p>

                <div className="mt-4 pt-3 border-t border-white/20 flex justify-between items-baseline">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-white/70">Sum Insured Up To</span>
                    <div className="text-xl font-black">₹{(prod.maxSumInsured / 100000).toFixed(0)} Lakhs</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-white/70">Base Rate</span>
                    <div className="text-sm font-extrabold">{prod.baseRatePct}% p.a.</div>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Included Coverage</p>
                  {prod.benefits.slice(0, 3).map((b, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span className="line-clamp-1">{b}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex gap-2">
                  <button
                    onClick={() => setCompareModalOpen(true)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      dk ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => onSelectProductForQuote(prod.productName)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-extrabold text-white shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-1.5"
                    style={{ background: color }}
                  >
                    Buy Now →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Modal */}
      {compareModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-4xl shadow-2xl p-6 max-h-[85vh] overflow-y-auto space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-white/5">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Insurance Plan Comparison Matrix</h3>
                <p className="text-xs text-slate-500">Side-by-side feature and rating breakdown per IRDAI filings</p>
              </div>
              <button onClick={() => setCompareModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 uppercase font-extrabold">
                    <th className="py-3 px-4">Feature / Policy Line</th>
                    <th className="py-3 px-4 text-blue-500">Motor Car Comprehensive</th>
                    <th className="py-3 px-4 text-emerald-500">Health Family Floater</th>
                    <th className="py-3 px-4 text-violet-500">Smart Term Life</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-semibold text-slate-700 dark:text-slate-200">
                  <tr><td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Max Sum Insured</td><td className="py-3 px-4">₹50 Lakhs (IDV)</td><td className="py-3 px-4">₹50 Lakhs</td><td className="py-3 px-4">₹5 Crore</td></tr>
                  <tr><td className="py-3 px-4 font-bold text-slate-900 dark:text-white">No Claim Bonus (NCB)</td><td className="py-3 px-4">Up to 50% discount</td><td className="py-3 px-4">Cumulative bonus (10%/yr)</td><td className="py-3 px-4">N/A</td></tr>
                  <tr><td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Cashless Network</td><td className="py-3 px-4">5,000+ Authorized Garages</td><td className="py-3 px-4">10,000+ Empanelled Hospitals</td><td className="py-3 px-4">Direct Wire Settlement</td></tr>
                  <tr><td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Aadhaar eKYC Required</td><td className="py-3 px-4">✅ Yes (OTP verified)</td><td className="py-3 px-4">✅ Yes (OTP verified)</td><td className="py-3 px-4">✅ Yes (OTP verified)</td></tr>
                  <tr><td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Claim Settlement SLA</td><td className="py-3 px-4">7 Business Days</td><td className="py-3 px-4">30 Mins Pre-Auth</td><td className="py-3 px-4">24h Immediate Wire</td></tr>
                </tbody>
              </table>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setCompareModalOpen(false)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-extrabold shadow-md"
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
