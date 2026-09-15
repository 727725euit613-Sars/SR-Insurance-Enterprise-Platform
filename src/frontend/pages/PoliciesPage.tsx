import React, { useState } from "react";
import {
  FileText, Shield, Heart, Home, Plane, Briefcase, Plus, Search, Filter,
  Download, Calendar, AlertCircle, RefreshCw, Edit, Trash2, CheckCircle,
  FileSpreadsheet, Lock, UserCheck, X, Check, ArrowRight, Camera
} from "lucide-react";
import { insuranceStore, type PolicyModel, type EndorsementModel } from "../services/insuranceStore";
import {
  openPrintableDocument,
  generatePolicyScheduleHtml,
  downloadFile,
  generateIIBMotorXml,
} from "../utils/documentGenerator";

export const PoliciesPage = ({
  darkMode,
  onOpenNewPolicyWizard,
  onOpenRenewPolicy,
  onOpenEndorsement,
}: {
  darkMode: boolean;
  onOpenNewPolicyWizard: () => void;
  onOpenRenewPolicy: (pol: PolicyModel) => void;
  onOpenEndorsement: (pol: PolicyModel) => void;
}) => {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedPolicyForView, setSelectedPolicyForView] = useState<PolicyModel | null>(null);

  const dk = darkMode;
  const policies = insuranceStore.getPolicies();
  const endorsements = insuranceStore.getEndorsements();

  const filtered = policies.filter(p => {
    const matchesFilter = filter === "All" || p.status.toLowerCase() === filter.toLowerCase();
    const matchesSearch =
      p.policyNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.productName.toLowerCase().includes(search.toLowerCase()) ||
      p.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (p.vehicleNo && p.vehicleNo.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleDownloadPdf = (pol: PolicyModel) => {
    const html = generatePolicyScheduleHtml({
      policyNumber: pol.policyNumber,
      policyName: pol.productName,
      policyType: pol.policyType,
      sumInsured: pol.sumInsured,
      premiumAmount: pol.annualPremium,
      startDate: pol.startDate,
      endDate: pol.endDate,
      customerName: pol.customerName,
      customerEmail: pol.customerEmail,
      customerPhone: pol.customerPhone,
      customerAddress: pol.customerAddress,
      ncbPct: pol.ncbPct,
      vehicleNo: pol.vehicleNo,
    });
    openPrintableDocument(`Policy_${pol.policyNumber}.pdf`, html);
  };

  const handleDownloadCertificate = (pol: PolicyModel) => {
    const html = `
      <div style="font-family: sans-serif; padding: 25px; border: 2px solid #2563EB;">
        <h2 style="color: #2563EB; text-align: center;">FORM 51 — CERTIFICATE OF INSURANCE</h2>
        <p style="text-align: center; font-size: 11px; color: #64748B;">[See Rule 141(1) of Central Motor Vehicles Rules, 1989]</p>
        <hr style="margin: 15px 0;" />
        <p><strong>Certificate No:</strong> ${pol.policyNumber}</p>
        <p><strong>Insured:</strong> ${pol.customerName}</p>
        <p><strong>Registration Mark / No:</strong> ${pol.vehicleNo || "KA-01-MN-5678"}</p>
        <p><strong>Make & Model:</strong> ${pol.vehicleMake || "Toyota Fortuner 4x4"}</p>
        <p><strong>Period of Insurance:</strong> From ${pol.startDate} to ${pol.endDate}</p>
        <p><strong>Geographical Area:</strong> India</p>
        <p><strong>Persons or Classes of Persons entitled to drive:</strong> Any person including the insured provided that a person driving holds an effective driving licence.</p>
        <hr style="margin: 15px 0;" />
        <div style="font-size: 10px; color: #475569;">
          I/We hereby certify that the Policy to which this Certificate relates as well as this Certificate of Insurance are issued in accordance with the provisions of Chapter XI of the M.V. Act, 1988.
        </div>
        <div style="margin-top: 25px; text-align: right; font-weight: bold;">For SR Insurance Company Limited</div>
      </div>
    `;
    openPrintableDocument(`Certificate_${pol.policyNumber}.pdf`, html);
  };

  const handleExportIIBXml = () => {
    const xml = generateIIBMotorXml(policies);
    downloadFile(xml, `IIB_Motor_Submission_${Date.now()}.xml`, "application/xml");
  };

  const handleExportCsv = () => {
    const header = "Policy Number,Product Name,Policy Type,Customer Name,Sum Insured,Annual Premium,Start Date,End Date,Status,NCB %,Vehicle No\n";
    const rows = policies.map(p =>
      `"${p.policyNumber}","${p.productName}","${p.policyType}","${p.customerName}",${p.sumInsured},${p.annualPremium},"${p.startDate}","${p.endDate}","${p.status}",${p.ncbPct}%,"${p.vehicleNo || ''}"`
    ).join("\n");
    downloadFile(header + rows, `SR_Insurance_Policies_${Date.now()}.csv`, "text/csv");
  };

  const handleDeletePolicy = (id: number) => {
    if (window.confirm("Are you sure you want to delete this policy record?")) {
      insuranceStore.deletePolicy(id);
      window.location.reload();
    }
  };

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Search & Actions Bar */}
      <div className={`p-4 rounded-2xl border ${
        dk ? "bg-slate-800/40 border-white/[0.07]" : "bg-white border-slate-200/80 shadow-sm"
      } flex flex-wrap items-center justify-between gap-4`}>
        <div className="flex items-center gap-2 flex-wrap">
          {["All", "Active", "Expiring", "Expired", "Renewed"].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`text-xs px-3.5 py-1.5 rounded-xl font-extrabold transition-all ${
                filter === status
                  ? "bg-blue-600 text-white shadow-md"
                  : dk ? "text-slate-400 hover:text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-white/[0.05] rounded-xl px-3 py-1.5 gap-2 border border-transparent dark:border-white/5">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search policy / client..."
              className="bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none w-36 sm:w-48"
            />
          </div>

          <button
            onClick={handleExportIIBXml}
            className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-bold border transition-all ${
              dk ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
            title="Download IRDAI IIB XML data format"
          >
            <Download className="w-3.5 h-3.5 text-amber-500" /> IIB XML
          </button>

          <button
            onClick={handleExportCsv}
            className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-bold border transition-all ${
              dk ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" /> CSV
          </button>

          <button
            onClick={onOpenNewPolicyWizard}
            className="flex items-center gap-1.5 text-xs px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl shadow-lg shadow-blue-600/30 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Issue Policy
          </button>
        </div>
      </div>

      {/* Policies List */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400 text-xs">
            No policies matching your filter criteria.
          </div>
        )}

        {filtered.map(pol => {
          const color =
            pol.policyType === "Motor" ? "#2563EB" :
            pol.policyType === "Health" ? "#22C55E" :
            pol.policyType === "Life" ? "#8B5CF6" : "#F59E0B";

          const Icon =
            pol.policyType === "Motor" ? Car :
            pol.policyType === "Health" ? Heart :
            pol.policyType === "Life" ? Shield : Home;

          const polEndorsements = endorsements.filter(e => e.policyId === pol.policyId);

          return (
            <div
              key={pol.policyId}
              className={`p-6 rounded-3xl border transition-all hover:shadow-xl ${
                dk ? "bg-slate-800/40 border-white/[0.06] hover:border-white/15" : "bg-white border-slate-200/80 shadow-sm"
              }`}
            >
              <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-6">
                {/* Left info */}
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md"
                    style={{ background: `${color}18`, color }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">{pol.productName}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        pol.status === "Active" ? "bg-emerald-500/15 text-emerald-400" :
                        pol.status === "Expiring" ? "bg-amber-500/15 text-amber-400" :
                        pol.status === "Renewed" ? "bg-blue-500/15 text-blue-400" : "bg-slate-500/15 text-slate-400"
                      }`}>
                        {pol.status.toUpperCase()}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 font-bold">{pol.policyNumber}</span>
                    </div>

                    <div className="text-xs text-slate-500 font-medium">
                      Insured: <span className="font-bold text-slate-700 dark:text-slate-300">{pol.customerName}</span> • Nominee: {pol.nomineeName} ({pol.nomineeRelation})
                      {pol.vehicleNo && <span> • Vehicle: {pol.vehicleNo}</span>}
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 font-semibold pt-1">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-blue-500" /> Term: {pol.startDate} to {pol.endDate}</span>
                      <span>• NCB: <strong className="text-emerald-500">{pol.ncbPct}%</strong></span>
                      <span>• Cession: <strong className="text-violet-400">{pol.riCededPct}%</strong></span>
                    </div>
                  </div>
                </div>

                {/* Right financial & actions */}
                <div className="flex items-center gap-6 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-xl font-black text-slate-900 dark:text-white">₹{(pol.annualPremium ?? 0).toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Sum Insured: ₹{((pol.sumInsured ?? 0) / 100000).toFixed(0)}L</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadPdf(pol)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        dk ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                      title="Download Official IRDAI Schedule PDF"
                    >
                      <Download className="w-4 h-4 text-blue-500" />
                    </button>

                    {pol.policyType === "Motor" && (
                      <button
                        onClick={() => handleDownloadCertificate(pol)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                          dk ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                        title="Download Form 51 Certificate"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      </button>
                    )}

                    <button
                      onClick={() => onOpenEndorsement(pol)}
                      className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                        dk ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                      title="Submit Mid-Term Endorsement"
                    >
                      <Edit className="w-3.5 h-3.5 text-cyan-500 inline mr-1" /> Endorse
                    </button>

                    <button
                      onClick={() => onOpenRenewPolicy(pol)}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow-md transition-all flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Renew
                    </button>

                    <button
                      onClick={() => handleDeletePolicy(pol.policyId)}
                      className="p-2.5 rounded-xl text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete Policy"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Endorsements History Preview */}
              {polEndorsements.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center gap-3 text-xs">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Endorsements:</span>
                  {polEndorsements.map(e => (
                    <span key={e.endorsementId} className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold">
                      {e.endorsementNumber} ({e.endorsementType}) — {e.status}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
