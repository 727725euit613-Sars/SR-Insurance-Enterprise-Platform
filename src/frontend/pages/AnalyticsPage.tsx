import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  Download, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight,
  Shield,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { insuranceStore, Policy, Claim } from '../services/insuranceStore';

export const AnalyticsPage: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [timeRange, setTimeRange] = useState<'30D' | '90D' | 'FY26' | 'ALL'>('FY26');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    setPolicies(insuranceStore.getPolicies());
    setClaims(insuranceStore.getClaims());
  }, []);

  const totalGWP = policies.reduce((sum, p) => sum + (p.grossPremium ?? p.annualPremium ?? 0), 0);
  const totalClaimsIncurred = claims.reduce((sum, c) => sum + (c.approvedAmount ?? c.estimatedAmount ?? c.estimatedLoss ?? 0), 0);
  const lossRatio = totalGWP > 0 ? ((totalClaimsIncurred / totalGWP) * 100).toFixed(1) : '52.4';
  const combinedRatio = (parseFloat(lossRatio) + 36.2).toFixed(1); // loss ratio + expense ratio (36.2%)

  // Line of Business Breakdown
  const motorPolicies = policies.filter(p => (p.productName || p.name || p.policyType || '').toLowerCase().includes('motor') || (p.productName || p.name || p.policyType || '').toLowerCase().includes('car'));
  const healthPolicies = policies.filter(p => (p.productName || p.name || p.policyType || '').toLowerCase().includes('health') || (p.productName || p.name || p.policyType || '').toLowerCase().includes('care'));
  const termPolicies = policies.filter(p => (p.productName || p.name || p.policyType || '').toLowerCase().includes('term') || (p.productName || p.name || p.policyType || '').toLowerCase().includes('life'));

  const motorGWP = motorPolicies.reduce((sum, p) => sum + (p.grossPremium ?? p.annualPremium ?? 0), 0) || 12450000;
  const healthGWP = healthPolicies.reduce((sum, p) => sum + (p.grossPremium ?? p.annualPremium ?? 0), 0) || 8950000;
  const termGWP = termPolicies.reduce((sum, p) => sum + (p.grossPremium ?? p.annualPremium ?? 0), 0) || 6800000;

  const handleExportBIReport = () => {
    const csvContent = [
      'SafeGuard Executive Insurance BI & Loss Analytics Report',
      `Generated: ${new Date().toISOString()}`,
      `Financial Year: 2025-2026 (IRDAI Compliant)`,
      '',
      'Metric,Value,Benchmark,Status',
      `Gross Written Premium (GWP),₹${totalGWP.toLocaleString('en-IN')},₹2,50,00,000,ON_TRACK`,
      `Net Incurred Claims,₹${totalClaimsIncurred.toLocaleString('en-IN')},-,NORMAL`,
      `Incurred Loss Ratio (ILR),${lossRatio}%,< 65%,EXCELLENT`,
      `Combined Operating Ratio (COR),${combinedRatio}%,< 100%,PROFITABLE`,
      `Policy Persistency (13th Month),88.6%,> 85%,OUTPERFORMING`,
      `Claims Settlement Ratio (CSR),98.4%,> 95%,TOP_TIER`,
      '',
      'Line of Business,GWP (INR),Share %,Loss Ratio %',
      `Motor Private Car,₹${motorGWP.toLocaleString('en-IN')},44.2%,54.6%`,
      `Health Comprehensive,₹${healthGWP.toLocaleString('en-IN')},31.8%,48.2%`,
      `Term Life & Micro-Insurance,₹${termGWP.toLocaleString('en-IN')},24.0%,32.1%`,
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SafeGuard_BI_Analytics_${timeRange}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Executive BI Analytics CSV exported successfully.');
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/50 text-emerald-400 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up backdrop-blur-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2.5 text-xs font-semibold tracking-wider text-indigo-400 uppercase mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Executive Business Intelligence & Loss Analytics</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
            Portfolio Underwriting & Actuarial BI
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time Loss Ratios, Combined Operating Ratio (COR), Product Persistency, and Underwriting Waterfall.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            {(['30D', '90D', 'FY26', 'ALL'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  timeRange === range
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportBIReport}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition-all border border-slate-700 shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Export BI Report</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Gross Written Premium</span>
            <span className="flex items-center text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +18.4%
            </span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-white mt-3">
            ₹{totalGWP > 0 ? (totalGWP / 10000000).toFixed(2) : '2.82'} Cr
          </p>
          <span className="text-xs text-slate-400 mt-2">Active Policies: {policies.length || 24}</span>
        </div>

        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Incurred Loss Ratio (ILR)</span>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Optimal
            </span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-indigo-400 mt-3">{lossRatio}%</p>
          <span className="text-xs text-slate-400 mt-2">Target Benchmark: &lt; 65.0%</span>
        </div>

        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Combined Operating Ratio (COR)</span>
            <span className="flex items-center text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Profitable
            </span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-emerald-400 mt-3">{combinedRatio}%</p>
          <span className="text-xs text-slate-400 mt-2">Underwriting Profit Margin: {(100 - parseFloat(combinedRatio)).toFixed(1)}%</span>
        </div>

        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">13th Month Persistency</span>
            <span className="flex items-center text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +4.2%
            </span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-purple-400 mt-3">88.6%</p>
          <span className="text-xs text-slate-400 mt-2">IRDAI Minimum Mandate: 85.0%</span>
        </div>
      </div>

      {/* Loss Ratio & Lines of Business Waterfall */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line of Business Distribution */}
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Line of Business Distribution</h3>
            <span className="text-xs text-slate-400">GWP Mix</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Motor Comprehensive & TP</span>
                <span className="text-white font-mono font-semibold">44.2% (₹1.24 Cr)</span>
              </div>
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '44.2%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Health & Family Floaters</span>
                <span className="text-white font-mono font-semibold">31.8% (₹0.89 Cr)</span>
              </div>
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '31.8%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Term Life & Critical Illness</span>
                <span className="text-white font-mono font-semibold">24.0% (₹0.68 Cr)</span>
              </div>
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '24.0%' }}></div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-center">
            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
              <span className="text-xs text-slate-500 block">Avg Ticket Size</span>
              <span className="text-sm font-bold text-white">₹18,450</span>
            </div>
            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
              <span className="text-xs text-slate-500 block">Solvency Ratio</span>
              <span className="text-sm font-bold text-emerald-400">2.14x (Req 1.5x)</span>
            </div>
          </div>
        </div>

        {/* Underwriting Profitability Waterfall */}
        <div className="lg:col-span-2 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-white">Underwriting Performance & Combined Ratio Breakdown</h3>
                <p className="text-xs text-slate-400">Statutory breakdown as per IRDAI Public Disclosures (NL-4)</p>
              </div>
              <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                COR: {combinedRatio}%
              </span>
            </div>

            <div className="grid grid-cols-4 gap-4 my-6">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-center">
                <span className="text-xs text-slate-400 block mb-1">GWP (100%)</span>
                <span className="text-lg font-bold text-white font-mono">100.0%</span>
                <span className="text-xs text-slate-500 block mt-1">Base Revenue</span>
              </div>
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-center">
                <span className="text-xs text-slate-400 block mb-1">Net Incurred Claims</span>
                <span className="text-lg font-bold text-indigo-400 font-mono">-{lossRatio}%</span>
                <span className="text-xs text-slate-500 block mt-1">Loss Ratio</span>
              </div>
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-center">
                <span className="text-xs text-slate-400 block mb-1">Acquisition & Comm.</span>
                <span className="text-lg font-bold text-amber-400 font-mono">-14.8%</span>
                <span className="text-xs text-slate-500 block mt-1">Agent / POSP</span>
              </div>
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-center">
                <span className="text-xs text-slate-400 block mb-1">Management Expense</span>
                <span className="text-lg font-bold text-purple-400 font-mono">-21.4%</span>
                <span className="text-xs text-slate-500 block mt-1">OpEx & Admin</span>
              </div>
            </div>
          </div>

          <div className="bg-indigo-950/30 p-4 rounded-xl border border-indigo-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-indigo-400 shrink-0" />
              <div className="text-xs">
                <p className="font-semibold text-white">Net Underwriting Profit Surplus: {(100 - parseFloat(combinedRatio)).toFixed(1)}%</p>
                <p className="text-slate-400">Healthy technical underwriting margin compliant with IRDAI Expense of Management (EoM) Regulations.</p>
              </div>
            </div>
            <button
              onClick={handleExportBIReport}
              className="text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors whitespace-nowrap"
            >
              Download NL-4 Report
            </button>
          </div>
        </div>
      </div>

      {/* Fraud Detection & Surveyor Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
          <h3 className="font-semibold text-white mb-1">AI Fraud Score Distribution (Claims)</h3>
          <p className="text-xs text-slate-400 mb-4">Real-time telemetry & geo-tagging anomaly screening</p>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-emerald-950/20 rounded-xl border border-emerald-500/20">
              <div>
                <span className="text-sm font-semibold text-white">Low Risk (Score &lt; 25)</span>
                <span className="text-xs text-emerald-400 block">Auto-approved for instant Razorpay payout</span>
              </div>
              <span className="text-lg font-mono font-bold text-emerald-400">84.2%</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-amber-950/20 rounded-xl border border-amber-500/20">
              <div>
                <span className="text-sm font-semibold text-white">Medium Risk (Score 25 - 60)</span>
                <span className="text-xs text-amber-400 block">Surveyor field inspection dispatched</span>
              </div>
              <span className="text-lg font-mono font-bold text-amber-400">12.5%</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-rose-950/20 rounded-xl border border-rose-500/20">
              <div>
                <span className="text-sm font-semibold text-white">High Risk (Score &gt; 60)</span>
                <span className="text-xs text-rose-400 block">Forensic investigation & duplicate FNOL flag</span>
              </div>
              <span className="text-lg font-mono font-bold text-rose-400">3.3%</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
          <h3 className="font-semibold text-white mb-1">Surveyor Network SLA & TAT Metrics</h3>
          <p className="text-xs text-slate-400 mb-4">IRDAI 48-Hour Inspection Mandate Performance</p>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-950/40 rounded-xl border border-slate-800/60">
              <div>
                <span className="text-sm font-medium text-white">Average Survey Completion TAT</span>
                <span className="text-xs text-slate-400 block">From FNOL assignment to final report</span>
              </div>
              <span className="text-base font-mono font-bold text-indigo-300">18.4 Hours</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-950/40 rounded-xl border border-slate-800/60">
              <div>
                <span className="text-sm font-medium text-white">IRDAI SLA Compliance Rate</span>
                <span className="text-xs text-slate-400 block">Inspections under 48-hour statutory limit</span>
              </div>
              <span className="text-base font-mono font-bold text-emerald-400">98.2%</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-950/40 rounded-xl border border-slate-800/60">
              <div>
                <span className="text-sm font-medium text-white">Active Surveyor Network</span>
                <span className="text-xs text-slate-400 block">IRDAI licensed motor/marine/fire assessors</span>
              </div>
              <span className="text-base font-mono font-bold text-purple-300">142 Surveyors</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
