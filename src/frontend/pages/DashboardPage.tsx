import React, { useState, useEffect } from "react";
import {
  FileText, DollarSign, AlertCircle, CreditCard, ArrowUpRight, ArrowDownRight,
  TrendingUp, RefreshCw, Plus, Download, MessageSquare, ShieldCheck, Activity,
  Users, UserCheck, MapPin, CheckCircle, Clock, Check, ChevronRight, Award,
  Sparkles, Camera, Shield, Landmark, Scale, FileSpreadsheet, Layers, Edit
} from "lucide-react";
import {
  AreaChart, Area, BarChart as RechartsBar, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
  insuranceStore,
  type PolicyModel,
  type ClaimModel,
  type PaymentModel,
} from "../services/insuranceStore";
import { getDashboardStats, type AuthResponse } from "../services/api";

const revenueData = [
  { month: "Jan", premium: 42, claims: 12 },
  { month: "Feb", premium: 38, claims: 9 },
  { month: "Mar", premium: 51, claims: 14 },
  { month: "Apr", premium: 47, claims: 11 },
  { month: "May", premium: 58, claims: 16 },
  { month: "Jun", premium: 62, claims: 18 },
  { month: "Jul", premium: 59, claims: 15 },
  { month: "Aug", premium: 68, claims: 20 },
  { month: "Sep", premium: 71, claims: 19 },
  { month: "Oct", premium: 65, claims: 17 },
  { month: "Nov", premium: 78, claims: 21 },
  { month: "Dec", premium: 85, claims: 23 },
];

export const DashboardPage = ({
  currentUser,
  darkMode,
  onNavigate,
  onOpenNewClaim,
  onOpenRenew,
  onOpenPay,
  onOpenQuote,
  onOpenEndorsement,
}: {
  currentUser: AuthResponse | null;
  darkMode: boolean;
  onNavigate: (page: string) => void;
  onOpenNewClaim: () => void;
  onOpenRenew: (policy?: PolicyModel) => void;
  onOpenPay: (policy?: PolicyModel) => void;
  onOpenQuote: () => void;
  onOpenEndorsement: (policy?: PolicyModel) => void;
}) => {
  const [stats, setStats] = useState<any>(null);
  const dk = darkMode;
  const cardCls = `rounded-[24px] border ${dk ? "bg-slate-800/50 border-white/[0.07]" : "bg-white border-slate-200/80 shadow-sm"}`;
  const role = (currentUser?.role || "CUSTOMER").toUpperCase();

  const policies = insuranceStore.getPolicies();
  const claims = insuranceStore.getClaims();
  const payments = insuranceStore.getPayments();
  const endorsements = insuranceStore.getEndorsements();
  const agents = insuranceStore.getAgents();
  const currentAgent = agents[0];

  useEffect(() => {
    getDashboardStats().then(setStats);
  }, []);

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Welcome Banner */}
      <div className={`p-6 rounded-[28px] bg-gradient-to-r ${
        role === "UNDERWRITER"
          ? "from-emerald-950/60 via-slate-900 to-slate-900 border-emerald-500/20"
          : role === "CLAIMS_HANDLER"
          ? "from-amber-950/60 via-slate-900 to-slate-900 border-amber-500/20"
          : role === "AGENT"
          ? "from-violet-950/60 via-slate-900 to-slate-900 border-violet-500/20"
          : role === "SURVEYOR"
          ? "from-cyan-950/60 via-slate-900 to-slate-900 border-cyan-500/20"
          : role === "FINANCE_OFFICER"
          ? "from-rose-950/60 via-slate-900 to-slate-900 border-rose-500/20"
          : "from-blue-950/60 via-slate-900 to-slate-900 border-blue-500/20"
      } border shadow-xl flex flex-wrap items-center justify-between gap-4`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider bg-white/10 text-white">
              {role.replace("_", " ")} WORKSPACE
            </span>
            <span className="text-xs text-slate-400 font-semibold">• IRDAI Compliant</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Welcome back, {currentUser?.name || "Arjun Mehta"} 👋
          </h2>
          <p className="text-xs text-slate-400">
            {role === "UNDERWRITER" && "Review high-value risk referrals, sum-insured clearance & endorsement approvals."}
            {role === "CLAIMS_HANDLER" && "Adjudicate pending First Notice of Loss (FNOL) and monitor 24h/30d IRDAI TAT SLAs."}
            {role === "AGENT" && "Track daily gross written premium (GWP), commission earnings & client renewals."}
            {role === "SURVEYOR" && "Perform motor & property field inspections, submit damage estimates & assess liability."}
            {role === "FINANCE_OFFICER" && "Manage premium reconciliations, claim payout disbursements & reinsurance bordereaux."}
            {role === "ADMIN" && "System health overview, IRDAI IIB XML reporting & master configuration."}
            {role === "CUSTOMER" && "Manage your insurance coverage, track live claims, pay premiums & download tax receipts."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {role === "CUSTOMER" && (
            <>
              <button
                onClick={onOpenNewClaim}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-rose-600/30 flex items-center gap-1.5 transition-all"
              >
                <AlertCircle className="w-3.5 h-3.5" /> File New Claim
              </button>
              <button
                onClick={onOpenQuote}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-blue-600/30 flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Buy / Quote Policy
              </button>
            </>
          )}

          {role === "AGENT" && (
            <>
              <button
                onClick={() => onNavigate("agent")}
                className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-violet-600/30 flex items-center gap-1.5 transition-all"
              >
                <UserCheck className="w-3.5 h-3.5" /> Open Lead CRM
              </button>
              <button
                onClick={onOpenQuote}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-blue-600/30 flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Generate Quote
              </button>
            </>
          )}

          {role === "UNDERWRITER" && (
            <button
              onClick={() => onNavigate("admin")}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Risk Evaluation Queue
            </button>
          )}

          {role === "CLAIMS_HANDLER" && (
            <button
              onClick={() => onNavigate("claims")}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-amber-600/30 flex items-center gap-1.5 transition-all"
            >
              <Activity className="w-3.5 h-3.5" /> Process FNOL Queue
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: role === "AGENT" ? "My Sold Policies" : "Active Policies",
            value: role === "AGENT" ? String(currentAgent?.policiesSold || 61) : String(stats?.activePolicies || policies.filter(p => p.status === "Active" || p.status === "Expiring").length),
            sub: `${policies.length} total in system`,
            icon: FileText,
            color: "#2563EB",
            trend: "+12.4% MoM"
          },
          {
            title: role === "AGENT" ? "Commission Wallet" : "Total Premium Collected",
            value: role === "AGENT" ? `₹${(currentAgent?.walletBalance || 184500).toLocaleString()}` : `₹${(stats?.totalPremiumCollected || 111500).toLocaleString()}`,
            sub: role === "AGENT" ? "Available for payout" : "Gross Written Premium",
            icon: DollarSign,
            color: "#22C55E",
            trend: "+8.9% YoY"
          },
          {
            title: "Active Claims (FNOL)",
            value: String(stats?.pendingClaims || claims.filter(c => c.status !== "Settled" && c.status !== "Rejected").length),
            sub: "100% within IRDAI SLA",
            icon: AlertCircle,
            color: "#F59E0B",
            trend: "0 SLA Breaches"
          },
          {
            title: "Payments Settled",
            value: `₹${(stats?.totalPaymentsReceived || 107500).toLocaleString()}`,
            sub: `${payments.length} successful transactions`,
            icon: CreditCard,
            color: "#8B5CF6",
            trend: "Razorpay Verified"
          },
        ].map(card => (
          <div key={card.title} className={`${cardCls} p-5 hover:-translate-y-0.5 transition-all duration-200`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{card.title}</p>
                <p className={`text-2xl font-black ${dk ? "text-white" : "text-slate-900"}`}>{card.value}</p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">{card.sub}</p>
              </div>
              <div className="p-3 rounded-2xl flex-shrink-0" style={{ background: `${card.color}18` }}>
                <card.icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-100 dark:border-white/5">
              <ArrowUpRight className="w-3 h-3 text-emerald-400" />
              <span className="text-[11px] text-emerald-400 font-extrabold">{card.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Split: Analytics Chart & Role Specific Worklists */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart Column */}
        <div className={`lg:col-span-2 ${cardCls} p-6 space-y-4`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-sm font-extrabold ${dk ? "text-white" : "text-slate-900"}`}>
                GWP Premium vs Claims Incurred Trend
              </h3>
              <p className="text-xs text-slate-500">2024 Monthly Financial Breakdown (in ₹ Lakhs)</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-blue-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Premium
              </span>
              <span className="flex items-center gap-1.5 text-xs text-rose-400 font-bold ml-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Claims
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={revenueData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F43F5E" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#F43F5E" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={dk ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
              <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: dk ? "#192950" : "#FFFFFF", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="premium" stroke="#1f54c5" strokeWidth={3} fill="url(#g1)" name="Premium (₹L)" />
              <Area type="monotone" dataKey="claims" stroke="#F43F5E" strokeWidth={2.5} fill="url(#g2)" name="Claims (₹L)" />
            </AreaChart>
          </ResponsiveContainer>

          {/* Quick Actions Bar */}
          <div className="pt-4 border-t border-slate-100 dark:border-white/5 grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[
              { label: "New Claim", icon: AlertCircle, color: "#EF4444", action: onOpenNewClaim },
              { label: "Renew Policy", icon: RefreshCw, color: "#22C55E", action: () => onOpenRenew() },
              { label: "Pay Premium", icon: CreditCard, color: "#1f54c5", action: () => onOpenPay() },
              { label: "Get Quote", icon: FileText, color: "#8B5CF6", action: onOpenQuote },
              { label: "Endorsement", icon: Edit, color: "#06B6D4", action: () => onOpenEndorsement() },
              { label: "Compliance", icon: Scale, color: "#F59E0B", action: () => onNavigate("compliance") },
            ].map(qa => (
              <button
                key={qa.label}
                onClick={qa.action}
                className={`p-3 rounded-2xl text-center flex flex-col items-center gap-1.5 transition-all hover:scale-105 ${
                  dk ? "bg-slate-700/30 hover:bg-slate-700/60" : "bg-slate-50 hover:bg-slate-100"
                }`}
              >
                <qa.icon className="w-4 h-4" style={{ color: qa.color }} />
                <span className={`text-[10px] font-bold ${dk ? "text-slate-300" : "text-slate-700"}`}>{qa.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Worklist Column */}
        <div className="space-y-4">
          {/* Active Claim Tracker Card */}
          <div className={`${cardCls} p-5 space-y-3`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-xs font-extrabold uppercase tracking-wider ${dk ? "text-white" : "text-slate-900"}`}>
                Live Claim Tracker
              </h3>
              <button onClick={() => onNavigate("claims")} className="text-[11px] font-bold text-blue-500 hover:underline">
                View All
              </button>
            </div>

            {claims.slice(0, 2).map(c => (
              <div key={c.claimId} className={`p-3 rounded-2xl border ${dk ? "border-white/5 bg-slate-900/40" : "border-slate-100 bg-slate-50"} space-y-2`}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-blue-400">{c.claimNumber}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    c.status === "Approved" || c.status === "Settled"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : c.status === "Rejected"
                      ? "bg-rose-500/15 text-rose-400"
                      : "bg-amber-500/15 text-amber-400"
                  }`}>
                    {c.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-1">{c.description}</div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold pt-1 border-t border-slate-100 dark:border-white/5">
                  <span>Assessed: ₹{c.estimatedLoss.toLocaleString()}</span>
                  <span>Surveyor: {c.surveyorName || "Assigned"}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Policy Renewal Alert Card */}
          <div className={`${cardCls} p-5 space-y-3`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-xs font-extrabold uppercase tracking-wider ${dk ? "text-white" : "text-slate-900"}`}>
                Upcoming Renewals
              </h3>
              <button onClick={() => onNavigate("policies")} className="text-[11px] font-bold text-blue-500 hover:underline">
                Manage
              </button>
            </div>

            {policies.filter(p => p.status === "Expiring" || p.status === "Active").slice(0, 2).map(pol => (
              <div key={pol.policyId} className={`p-3 rounded-2xl border ${dk ? "border-white/5 bg-slate-900/40" : "border-slate-100 bg-slate-50"} flex items-center justify-between`}>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{pol.policyType} Insurance</div>
                  <div className="text-[10px] text-slate-400">{pol.policyNumber} • Exp: {pol.endDate}</div>
                </div>
                <button
                  onClick={() => onOpenRenew(pol)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-extrabold shadow-md transition-all"
                >
                  Renew ({pol.ncbPct}%)
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
