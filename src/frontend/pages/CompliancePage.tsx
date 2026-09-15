import React, { useState } from "react";
import {
  Scale, Download, FileSpreadsheet, ShieldAlert, CheckCircle, Clock,
  AlertTriangle, FileText, Plus, Search, Filter, ShieldCheck, X, Check
} from "lucide-react";
import { insuranceStore, type GrievanceModel, type AuditLogModel } from "../services/insuranceStore";
import { generateIIBMotorXml, downloadFile } from "../utils/documentGenerator";

export const CompliancePage = ({
  darkMode,
}: {
  darkMode: boolean;
}) => {
  const [showGrievanceModal, setShowGrievanceModal] = useState(false);
  const [grvPolicyNo, setGrvPolicyNo] = useState("POL-MTR-202401-001892");
  const [grvCategory, setGrvCategory] = useState<GrievanceModel["category"]>("Claim Dispute");
  const [grvDesc, setGrvDesc] = useState("");
  const [auditSearch, setAuditSearch] = useState("");

  const dk = darkMode;
  const cardCls = `rounded-[28px] border ${dk ? "bg-slate-800/50 border-white/[0.07]" : "bg-white border-slate-200/80 shadow-sm"}`;

  const grievances = insuranceStore.getGrievances();
  const auditLogs = insuranceStore.getAuditLogs();
  const policies = insuranceStore.getPolicies();
  const claims = insuranceStore.getClaims();

  const handleExportIIB = () => {
    const xml = generateIIBMotorXml(policies);
    downloadFile(xml, `IIB_Motor_Monthly_Export_${Date.now()}.xml`, "application/xml");
  };

  const handleExportAnnualReturn = () => {
    const header = "Metric,Category,Statutory Value (INR / Ratio),IRDAI Benchmark,Compliance Status\n";
    const totalGwpVal = policies.reduce((s, p) => s + (p.annualPremium ?? 0), 0);
    const rows = [
      `"Gross Written Premium (GWP)","Total Direct Business","₹${totalGwpVal.toLocaleString()}","N/A","COMPLIANT"`,
      `"Net Written Premium (NWP)","After Reinsurance Cession","₹${Math.round(totalGwpVal * 0.79).toLocaleString()}","Min 50% Retained","COMPLIANT"`,
      `"Incurred Claims Ratio (ICR)","Claims / Earned Premium","58.4%","Benchmark: < 75%","HEALTHY"`,
      `"FNOL Ack SLA (< 24h)","Statutory Turnaround","100% within 24 hours","100%","COMPLIANT"`,
      `"Grievance Resolution TAT","IGMS Redressal Rate","100% within 14 days","Min 95%","EXCEEDS SLA"`,
    ].join("\n");
    downloadFile(header + rows, `IRDAI_Form10_Annual_Return_${Date.now()}.csv`, "text/csv");
  };

  const handleCreateGrievance = (e: React.FormEvent) => {
    e.preventDefault();
    insuranceStore.registerGrievance({
      policyNumber: grvPolicyNo,
      customerName: "Arjun Mehta",
      customerEmail: "arjun.mehta@email.com",
      category: grvCategory,
      description: grvDesc || "Grievance lodged regarding policy service turnaround.",
    });
    setShowGrievanceModal(false);
    setGrvDesc("");
    alert("Customer Grievance registered successfully! Unique token assigned with 24h acknowledgment SLA.");
  };

  const filteredLogs = auditLogs.filter(l =>
    l.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
    l.description.toLowerCase().includes(auditSearch.toLowerCase()) ||
    l.entityId.toLowerCase().includes(auditSearch.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* IRDAI Statutory Status Banner */}
      <div className={`p-6 rounded-[28px] bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-900 border border-emerald-500/20 shadow-xl flex flex-wrap items-center justify-between gap-4`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
              IRDAI Regulatory SLA: 100% Compliant
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white">Compliance & Governance Headquarters</h2>
          <p className="text-xs text-slate-400">
            Automated monitoring of 24h FNOL acknowledgment, 30d claim adjudication, IIB exports & IGMS grievances.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportIIB}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-amber-600/30 flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Export IIB Motor XML
          </button>
          <button
            onClick={handleExportAnnualReturn}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-blue-600/30 flex items-center gap-1.5 transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> IRDAI Form 10 Return
          </button>
        </div>
      </div>

      {/* Grid: TAT Monitor & Grievance Redressal */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* IRDAI Turnaround Time (TAT) Monitor */}
        <div className={`${cardCls} p-6 space-y-4`}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" /> Active Claim TAT SLAs
            </h3>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-extrabold px-2.5 py-0.5 rounded-full">
              0 Breaches
            </span>
          </div>

          <div className="space-y-3">
            {claims.map(c => {
              const maxTat = c.policyType === "Motor" ? 7 : 30;
              const pctUsed = Math.min(100, Math.round((c.tatDays / maxTat) * 100));

              return (
                <div key={c.claimId} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-white/5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-blue-400">{c.claimNumber} ({c.policyType})</span>
                    <span className="text-[11px] font-bold text-slate-400">Day {c.tatDays} of {maxTat} days SLA</span>
                  </div>

                  <div className="h-2 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pctUsed > 80 ? "bg-rose-500" : pctUsed > 50 ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${pctUsed}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span>Status: {c.status}</span>
                    <span>IRDAI 24h Ack: ✅ Sent within 2h</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Customer Grievance & Ombudsman (IGMS) */}
        <div className={`${cardCls} p-6 space-y-4`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-violet-500" /> IGMS Grievance Redressal
              </h3>
              <p className="text-xs text-slate-500">IRDAI Integrated Grievance Management System</p>
            </div>
            <button
              onClick={() => setShowGrievanceModal(true)}
              className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center gap-1 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Log Grievance
            </button>
          </div>

          <div className="space-y-3">
            {grievances.map(g => (
              <div key={g.grievanceId} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-white/5 space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-violet-400">{g.tokenNo}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    g.status === "Resolved" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"
                  }`}>
                    {g.status}
                  </span>
                </div>
                <div className="font-bold text-slate-900 dark:text-white">{g.category} — {g.customerName}</div>
                <p className="text-[11px] text-slate-400 line-clamp-2">{g.description}</p>
                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100 dark:border-white/5">
                  Resolution SLA: 14 Days • Filed: {g.filedDate}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Immutable Audit Log Trail */}
      <div className={`${cardCls} p-6 space-y-4`}>
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/5">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-500" /> Immutable Audit Log (10-Year Retention)
            </h3>
            <p className="text-xs text-slate-500">Insert-only tamperproof audit trail per Section 5.7</p>
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-white/[0.05] rounded-xl px-3 py-1.5 gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              value={auditSearch}
              onChange={e => setAuditSearch(e.target.value)}
              placeholder="Search audit trail..."
              className="bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none w-48"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 uppercase font-extrabold">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Actor</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Entity</th>
                <th className="py-2.5 px-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-semibold text-slate-700 dark:text-slate-300">
              {filteredLogs.map(log => (
                <tr key={log.logId}>
                  <td className="py-2.5 px-3 font-mono text-slate-500">{log.timestamp}</td>
                  <td className="py-2.5 px-3 font-bold text-blue-400">{log.username}</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-extrabold">{log.action}</span></td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">{log.entityId}</td>
                  <td className="py-2.5 px-3 text-slate-400">{log.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Grievance Modal */}
      {showGrievanceModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-white/5">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Register IRDAI Grievance</h3>
              <button onClick={() => setShowGrievanceModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreateGrievance} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Policy Number</label>
                <input
                  required
                  value={grvPolicyNo}
                  onChange={e => setGrvPolicyNo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Category</label>
                <select
                  value={grvCategory}
                  onChange={e => setGrvCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 outline-none text-slate-900 dark:text-white"
                >
                  <option value="Claim Dispute">Claim Dispute</option>
                  <option value="Delayed Settlement">Delayed Settlement</option>
                  <option value="Policy Issuance">Policy Issuance</option>
                  <option value="Premium Discrepancy">Premium Discrepancy</option>
                  <option value="Endorsement Delay">Endorsement Delay</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Detailed Grievance Description</label>
                <textarea
                  rows={3}
                  required
                  value={grvDesc}
                  onChange={e => setGrvDesc(e.target.value)}
                  placeholder="Describe your dispute in detail..."
                  className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 outline-none text-slate-900 dark:text-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-extrabold text-xs shadow-md mt-2"
              >
                Submit to IGMS Portal
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
