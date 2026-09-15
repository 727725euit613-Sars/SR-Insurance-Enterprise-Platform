import React, { useState } from "react";
import {
  AlertCircle, CheckCircle, Clock, Plus, Search, Filter, Download,
  Calendar, DollarSign, Camera, FileText, ChevronRight, UserCheck,
  ShieldCheck, RefreshCw, X, Check, Trash2, Zap, ArrowRight, Upload
} from "lucide-react";
import { insuranceStore, type ClaimModel, type PolicyModel, type SurveyorModel } from "../services/insuranceStore";
import { openPrintableDocument, generateClaimSettlementHtml } from "../utils/documentGenerator";

export const ClaimsPage = ({
  darkMode,
  onOpenFileClaimWizard,
}: {
  darkMode: boolean;
  onOpenFileClaimWizard: () => void;
}) => {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedClaimForAdjudication, setSelectedClaimForAdjudication] = useState<ClaimModel | null>(null);
  const [selectedClaimForSurveyor, setSelectedClaimForSurveyor] = useState<ClaimModel | null>(null);
  const [approvedAmountInput, setApprovedAmountInput] = useState<number>(0);
  const [adjudicationNotes, setAdjudicationNotes] = useState("");
  const [selectedSurveyorId, setSelectedSurveyorId] = useState<number>(1);

  const dk = darkMode;
  const claims = insuranceStore.getClaims();
  const surveyors = insuranceStore.getSurveyors();
  const stages = ["FNOL", "Under Review", "Surveyor Assigned", "Under Investigation", "Adjudicating", "Approved", "Settled"];

  const filtered = claims.filter(c => {
    const matchesFilter =
      filter === "All" ||
      (filter === "Active" && c.status !== "Settled" && c.status !== "Rejected") ||
      c.status.toLowerCase() === filter.toLowerCase();

    const matchesSearch =
      c.claimNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.policyNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.customerName.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleDownloadSettlementLetter = (claim: ClaimModel) => {
    const html = generateClaimSettlementHtml({
      claimNumber: claim.claimNumber,
      policyNumber: claim.policyNumber,
      customerName: claim.customerName,
      incidentDate: claim.incidentDate,
      claimedAmount: claim.estimatedLoss,
      approvedAmount: claim.approvedAmount || claim.estimatedLoss,
      deductibles: claim.deductibles || 2000,
      depreciation: claim.depreciation || 0,
      status: claim.status,
      payeeAccount: claim.payeeBank || "XXXX XXXX 4821",
      payeeIfsc: claim.payeeIfsc || "HDFC0001234",
    });
    openPrintableDocument(`Settlement_Letter_${claim.claimNumber}.pdf`, html);
  };

  const handleAdjudicate = (action: "Approve" | "Reject") => {
    if (!selectedClaimForAdjudication) return;
    insuranceStore.adjudicateClaim(
      selectedClaimForAdjudication.claimId,
      action,
      approvedAmountInput || selectedClaimForAdjudication.estimatedLoss,
      adjudicationNotes
    );
    setSelectedClaimForAdjudication(null);
  };

  const handleDisbursePayout = (claimId: number) => {
    try {
      const payoutTxn = insuranceStore.disburseClaimPayout(claimId);
      alert(`Claim settlement payout disbursed successfully!\nRazorpay Transaction ID: ${payoutTxn}`);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleAssignSurveyor = () => {
    if (!selectedClaimForSurveyor) return;
    const surv = surveyors.find(s => s.surveyorId === selectedSurveyorId);
    if (surv) {
      selectedClaimForSurveyor.surveyorId = surv.surveyorId;
      selectedClaimForSurveyor.surveyorName = surv.name;
      selectedClaimForSurveyor.status = "Surveyor Assigned";
    }
    setSelectedClaimForSurveyor(null);
  };

  const handleDeleteClaim = (id: number) => {
    if (window.confirm("Delete this claim record?")) {
      insuranceStore.deleteClaim(id);
      window.location.reload();
    }
  };

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Header & Filter Bar */}
      <div className={`p-4 rounded-2xl border ${
        dk ? "bg-slate-800/40 border-white/[0.07]" : "bg-white border-slate-200/80 shadow-sm"
      } flex flex-wrap items-center justify-between gap-4`}>
        <div className="flex items-center gap-2 flex-wrap">
          {["All", "Active", "Under Review", "Approved", "Settled", "Rejected"].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`text-xs px-3.5 py-1.5 rounded-xl font-extrabold transition-all ${
                filter === s
                  ? "bg-blue-600 text-white shadow-md"
                  : dk ? "text-slate-400 hover:text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-white/[0.05] rounded-xl px-3 py-1.5 gap-2 border border-transparent dark:border-white/5">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search claims..."
              className="bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none w-36 sm:w-48"
            />
          </div>

          <button
            onClick={onOpenFileClaimWizard}
            className="flex items-center gap-1.5 text-xs px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl shadow-lg shadow-rose-600/30 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> File New FNOL
          </button>
        </div>
      </div>

      {/* Claims List */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400 text-xs">
            No claims matching the search or filter criteria.
          </div>
        )}

        {filtered.map(claim => {
          const isApproved = claim.status === "Approved" || claim.status === "Settled";
          const isRejected = claim.status === "Rejected";

          return (
            <div
              key={claim.claimId}
              className={`p-6 rounded-3xl border transition-all hover:shadow-xl ${
                dk ? "bg-slate-800/40 border-white/[0.06] hover:border-white/15" : "bg-white border-slate-200/80 shadow-sm"
              }`}
            >
              <div className="flex flex-wrap lg:flex-nowrap items-start justify-between gap-6">
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono font-black text-sm text-blue-500">{claim.claimNumber}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      isApproved ? "bg-emerald-500/15 text-emerald-400" :
                      isRejected ? "bg-rose-500/15 text-rose-400" : "bg-amber-500/15 text-amber-400"
                    }`}>
                      {claim.status}
                    </span>
                    <span className="text-xs text-slate-500 font-bold">• Policy: {claim.policyNumber}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-slate-400">
                      Fraud Risk Score: <strong className={claim.fraudScore > 70 ? "text-rose-400" : "text-emerald-400"}>{claim.fraudScore}/100</strong>
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
                    {claim.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-medium">
                    <span>Loss Type: <strong className="text-slate-200">{claim.lossType}</strong></span>
                    <span>• Incident Date: <strong className="text-slate-200">{claim.incidentDate}</strong></span>
                    <span>• Location: <strong className="text-slate-200">{claim.incidentLocation}</strong></span>
                    {claim.surveyorName && <span>• Surveyor: <strong className="text-cyan-400">{claim.surveyorName}</strong></span>}
                  </div>

                  {/* Stage Stepper per Appendix I.4 */}
                  <div className="pt-2 flex items-center gap-1.5 flex-wrap">
                    {stages.map((st, i) => {
                      const curIdx = stages.indexOf(claim.status);
                      const done = i <= (claim.status === "Settled" ? 6 : Math.max(0, curIdx));
                      return (
                        <div key={st} className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${done ? "bg-emerald-400" : "bg-slate-700"}`} />
                          <span className={`text-[10px] font-bold ${done ? "text-emerald-400" : "text-slate-500"}`}>{st}</span>
                          {i < stages.length - 1 && <ChevronRight className="w-3 h-3 text-slate-700" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Financial & Actions */}
                <div className="flex flex-col items-end gap-3 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-xs text-slate-400 font-bold uppercase">Estimated Loss</div>
                    <div className="text-xl font-black text-slate-900 dark:text-white">₹{claim.estimatedLoss.toLocaleString()}</div>
                    {claim.approvedAmount !== null && (
                      <div className="text-xs font-extrabold text-emerald-500">
                        Approved: ₹{claim.approvedAmount.toLocaleString()}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadSettlementLetter(claim)}
                      className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                        dk ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                      title="Download Claim Settlement Document"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-500 inline mr-1" /> Letter
                    </button>

                    {!claim.surveyorName && (
                      <button
                        onClick={() => {
                          setSelectedClaimForSurveyor(claim);
                        }}
                        className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-extrabold shadow-md transition-all"
                      >
                        <UserCheck className="w-3.5 h-3.5 inline mr-1" /> Assign Surveyor
                      </button>
                    )}

                    {claim.status !== "Approved" && claim.status !== "Settled" && claim.status !== "Rejected" && (
                      <button
                        onClick={() => {
                          setSelectedClaimForAdjudication(claim);
                          setApprovedAmountInput(claim.estimatedLoss - claim.deductibles);
                        }}
                        className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-extrabold shadow-md transition-all"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 inline mr-1" /> Adjudicate
                      </button>
                    )}

                    {claim.status === "Approved" && (
                      <button
                        onClick={() => handleDisbursePayout(claim.claimId)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md transition-all flex items-center gap-1"
                      >
                        <Zap className="w-3.5 h-3.5" /> Disburse Payout
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteClaim(claim.claimId)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Adjudication Modal */}
      {selectedClaimForAdjudication && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-white/5">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Claims Adjudication Desk</h3>
                <p className="text-xs text-slate-500">Claim Ref: {selectedClaimForAdjudication.claimNumber}</p>
              </div>
              <button onClick={() => setSelectedClaimForAdjudication(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-bold text-slate-700 dark:text-slate-300">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1.5">
                <div className="flex justify-between"><span>Claimed Estimated Loss:</span><span>₹{selectedClaimForAdjudication.estimatedLoss.toLocaleString()}</span></div>
                <div className="flex justify-between text-rose-500"><span>Compulsory Deductible:</span><span>- ₹{selectedClaimForAdjudication.deductibles}</span></div>
                <div className="flex justify-between text-emerald-500 font-extrabold text-sm pt-1 border-t border-slate-200 dark:border-white/5">
                  <span>Calculated Net Loss:</span>
                  <span>₹{(selectedClaimForAdjudication.estimatedLoss - selectedClaimForAdjudication.deductibles).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs mb-1">Approved Settlement Amount (₹)</label>
                <input
                  type="number"
                  value={approvedAmountInput}
                  onChange={e => setApprovedAmountInput(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs mb-1">Adjudication / Deductions Rationale</label>
                <textarea
                  rows={3}
                  value={adjudicationNotes}
                  onChange={e => setAdjudicationNotes(e.target.value)}
                  placeholder="State reason for deductions or approvals per Section 45 & policy wordings..."
                  className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 outline-none text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleAdjudicate("Reject")}
                  className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold shadow-md"
                >
                  Reject Claim
                </button>
                <button
                  onClick={() => handleAdjudicate("Approve")}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-md"
                >
                  Approve Settlement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Surveyor Assignment Modal */}
      {selectedClaimForSurveyor && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-white/5">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Assign Empanelled Surveyor</h3>
                <p className="text-xs text-slate-500">{selectedClaimForSurveyor.claimNumber}</p>
              </div>
              <button onClick={() => setSelectedClaimForSurveyor(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-400">Select Licensed Surveyor from Pool</label>
              {surveyors.map(surv => (
                <label
                  key={surv.surveyorId}
                  onClick={() => setSelectedSurveyorId(surv.surveyorId)}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    selectedSurveyorId === surv.surveyorId
                      ? "border-blue-500 bg-blue-600/10 text-slate-900 dark:text-white"
                      : "border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <input
                    type="radio"
                    checked={selectedSurveyorId === surv.surveyorId}
                    onChange={() => {}}
                    className="accent-blue-600"
                  />
                  <div>
                    <div className="font-bold text-xs">{surv.name} ({surv.specialization})</div>
                    <div className="text-[10px] text-slate-500">{surv.irdaiLicenseNo} • {surv.district}</div>
                  </div>
                </label>
              ))}

              <button
                onClick={handleAssignSurveyor}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-extrabold shadow-md mt-4"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
