import React, { useState } from "react";
import {
  Users, FileText, DollarSign, Target, Plus, Phone, Mail, CheckCircle,
  TrendingUp, Award, Zap, X, Check, Landmark, ArrowRight, Shield
} from "lucide-react";
import { insuranceStore, type LeadModel, type AgentModel } from "../services/insuranceStore";

export const AgentPage = ({
  darkMode,
}: {
  darkMode: boolean;
}) => {
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [newLeadName, setNewLeadName] = useState("");
  const [newLeadPhone, setNewLeadPhone] = useState("+91 9");
  const [newLeadProduct, setNewLeadProduct] = useState("Motor Comprehensive");
  const [newLeadValue, setNewLeadValue] = useState("35000");
  const [payoutAmount, setPayoutAmount] = useState(50000);

  const dk = darkMode;
  const cardCls = `rounded-[28px] border ${dk ? "bg-slate-800/50 border-white/[0.07]" : "bg-white border-slate-200/80 shadow-sm"}`;

  const agents = insuranceStore.getAgents();
  const currentAgent = agents[0];
  const leads = insuranceStore.getLeads();

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName) return;
    insuranceStore.addLead({
      name: newLeadName,
      phone: newLeadPhone,
      productType: newLeadProduct,
      estimatedValue: Number(newLeadValue) || 25000,
      stage: "New",
      hot: true,
      notes: "Lead registered from Agent POSP desk."
    });
    setShowAddLeadModal(false);
    setNewLeadName("");
  };

  const handleProcessPayout = () => {
    try {
      const txn = insuranceStore.requestAgentPayout(currentAgent.agentId, payoutAmount);
      alert(`Commission payout of ₹${payoutAmount.toLocaleString()} disbursed to ${currentAgent.bankAccount}!\nTransaction Ref: ${txn}`);
      setShowPayoutModal(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleStageChange = (leadId: number, nextStage: LeadModel["stage"]) => {
    insuranceStore.updateLeadStage(leadId, nextStage);
    window.location.reload();
  };

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Agent KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Leads", value: String(leads.length), icon: Users, color: "#2563EB", sub: "Pipeline CRM" },
          { label: "Policies Sold", value: String(currentAgent?.policiesSold || 61), icon: FileText, color: "#22C55E", sub: "YTD Gross Count" },
          { label: "Commission Wallet", value: `₹${(currentAgent?.walletBalance || 184500).toLocaleString()}`, icon: DollarSign, color: "#F59E0B", sub: "Net Payable (After TDS)" },
          { label: "Target Achievement", value: `${currentAgent?.renewalRatioPct || 94.5}%`, icon: Target, color: "#8B5CF6", sub: "Platinum Tier Status" },
        ].map(kpi => (
          <div key={kpi.label} className={`${cardCls} p-5`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{kpi.label}</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{kpi.value}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{kpi.sub}</p>
              </div>
              <div className="p-3 rounded-2xl" style={{ background: `${kpi.color}15`, color: kpi.color }}>
                <kpi.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Leads CRM & Leaderboard */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Leads Pipeline */}
        <div className={`lg:col-span-2 ${cardCls} p-6 space-y-5`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Active Prospect & Leads Pipeline</h3>
              <p className="text-xs text-slate-500">Track client conversion through POSP sales stages</p>
            </div>
            <button
              onClick={() => setShowAddLeadModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-blue-600/30 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Prospect
            </button>
          </div>

          <div className="space-y-3">
            {leads.map(lead => (
              <div
                key={lead.leadId}
                className={`p-4 rounded-2xl border transition-all ${
                  dk ? "bg-slate-900/40 border-white/5 hover:border-white/10" : "bg-slate-50 border-slate-200/80"
                } flex flex-wrap sm:flex-nowrap items-center justify-between gap-4`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white">{lead.name}</span>
                    {lead.hot && (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400">
                        🔥 High Priority
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {lead.phone} • {lead.productType}
                  </div>
                  <p className="text-[11px] text-slate-400 italic">"{lead.notes}"</p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-black text-slate-900 dark:text-white">₹{lead.estimatedValue.toLocaleString()}</div>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      lead.stage === "Closed Won" ? "bg-emerald-500/15 text-emerald-400" :
                      lead.stage === "Negotiation" ? "bg-amber-500/15 text-amber-400" : "bg-blue-500/15 text-blue-400"
                    }`}>
                      {lead.stage}
                    </span>
                  </div>

                  {lead.stage !== "Closed Won" && (
                    <button
                      onClick={() => handleStageChange(lead.leadId, lead.stage === "New" ? "Contacted" : lead.stage === "Contacted" ? "Quoted" : "Closed Won")}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-600/15 hover:bg-blue-600/30 text-blue-400 text-[10px] font-bold transition-all"
                    >
                      Advance Stage →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Wallet & Leaderboard */}
        <div className="space-y-6">
          {/* Commission Wallet Box */}
          <div className={`${cardCls} p-6 space-y-4`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Commission Payout</span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                TDS Deducted (Sec 194D)
              </span>
            </div>

            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                ₹{(currentAgent?.walletBalance || 184500).toLocaleString()}
              </div>
              <p className="text-xs text-slate-400 mt-1">Bank: {currentAgent?.bankAccount}</p>
            </div>

            <button
              onClick={() => setShowPayoutModal(true)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" /> Request Bank Transfer (Razorpay)
            </button>
          </div>

          {/* Top POSP Leaderboard */}
          <div className={`${cardCls} p-6 space-y-4`}>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" /> POSP Agent Leaderboard
            </h3>

            <div className="space-y-3 text-xs">
              {agents.map((ag, i) => (
                <div key={ag.agentId} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      i === 0 ? "bg-amber-500 text-black" : "bg-slate-700 text-white"
                    }`}>
                      {i + 1}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{ag.name}</div>
                      <div className="text-[10px] text-slate-400">{ag.tier} Tier • {ag.policiesSold} sold</div>
                    </div>
                  </div>
                  <span className="font-mono font-black text-blue-500">₹{(ag.totalGwp / 100000).toFixed(1)}L</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Lead Modal */}
      {showAddLeadModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-white/5">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Add Prospect Lead</h3>
              <button onClick={() => setShowAddLeadModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleAddLead} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Prospect Name</label>
                <input
                  required
                  value={newLeadName}
                  onChange={e => setNewLeadName(e.target.value)}
                  placeholder="Full customer name"
                  className="w-full px-3 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Mobile Number</label>
                <input
                  required
                  value={newLeadPhone}
                  onChange={e => setNewLeadPhone(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Product Category</label>
                <select
                  value={newLeadProduct}
                  onChange={e => setNewLeadProduct(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 outline-none text-slate-900 dark:text-white"
                >
                  <option value="Motor Comprehensive">Motor Comprehensive</option>
                  <option value="Family Floater Health">Family Floater Health</option>
                  <option value="Term Life 1 Cr">Term Life 1 Cr</option>
                  <option value="Home Shield Property">Home Shield Property</option>
                  <option value="Commercial Cyber Guard">Commercial Cyber Guard</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Estimated Premium (₹)</label>
                <input
                  type="number"
                  value={newLeadValue}
                  onChange={e => setNewLeadValue(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 outline-none text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-extrabold text-xs shadow-md mt-2"
              >
                Save Prospect to Pipeline
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-white/5">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Request Commission Payout</h3>
              <button onClick={() => setShowPayoutModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <div className="text-slate-400">Available Wallet Balance:</div>
                <div className="text-xl font-black text-emerald-500">₹{(currentAgent?.walletBalance || 184500).toLocaleString()}</div>
                <div className="text-[10px] text-slate-500 mt-1">Direct NEFT to {currentAgent?.bankAccount}</div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Disbursement Amount (₹)</label>
                <input
                  type="number"
                  value={payoutAmount}
                  max={currentAgent?.walletBalance}
                  onChange={e => setPayoutAmount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 outline-none text-slate-900 dark:text-white"
                />
              </div>

              <button
                onClick={handleProcessPayout}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-extrabold text-xs shadow-md mt-2"
              >
                Confirm Razorpay Disbursement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
