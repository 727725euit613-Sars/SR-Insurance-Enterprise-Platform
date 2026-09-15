import React, { useState } from "react";
import {
  Camera, FileCheck, Activity, CheckCircle, Clock, MapPin, Calendar,
  ShieldCheck, Upload, X, Check, DollarSign, Award, Lock, Plus
} from "lucide-react";
import { insuranceStore, type ClaimModel, type SurveyorModel } from "../services/insuranceStore";

export const SurveyorPage = ({
  darkMode,
}: {
  darkMode: boolean;
}) => {
  const [selectedClaim, setSelectedClaim] = useState<ClaimModel | null>(null);
  const [assessedLoss, setAssessedLoss] = useState("98500");
  const [depreciation, setDepreciation] = useState("24500");
  const [notes, setNotes] = useState("Physical field inspection completed at workshop. Rear bumper, tailgate and lights damage verified genuine. Labor charges adjusted per standard garage tariff.");
  const [rec, setRec] = useState<"Approve" | "Partial" | "Reject">("Approve");
  const [photosUploaded, setPhotosUploaded] = useState(4);

  const dk = darkMode;
  const cardCls = `rounded-[28px] border ${dk ? "bg-slate-800/50 border-white/[0.07]" : "bg-white border-slate-200/80 shadow-sm"}`;

  const claims = insuranceStore.getClaims();
  const surveyors = insuranceStore.getSurveyors();
  const currentSurveyor = surveyors[0]; // Suresh Babu
  const assignedClaims = claims.filter(c => c.surveyorId === currentSurveyor.surveyorId || !c.surveyorId);

  const handleSubmitSurveyReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim) return;

    insuranceStore.submitSurveyReport(selectedClaim.claimId, {
      assessedLoss: Number(assessedLoss) || selectedClaim.estimatedLoss,
      recommendedAmount: Number(assessedLoss) || selectedClaim.estimatedLoss,
      depreciation: Number(depreciation) || 0,
      notes,
    });

    alert(`Survey report for claim ${selectedClaim.claimNumber} submitted successfully! Survey fee of ₹${selectedClaim.estimatedLoss > 100000 ? '4,500' : '2,500'} credited to your tariff account.`);
    setSelectedClaim(null);
  };

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Surveyor KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Assigned Claims", value: String(assignedClaims.length), icon: FileCheck, color: "#2563EB" },
          { label: "Surveys Completed", value: String(currentSurveyor?.completedSurveys || 142), icon: CheckCircle, color: "#22C55E" },
          { label: "Tariff Earnings", value: `₹${(currentSurveyor?.totalEarnings || 497000).toLocaleString()}`, icon: DollarSign, color: "#F59E0B" },
          { label: "Surveyor Rating", value: `${currentSurveyor?.rating || 4.9} ★`, icon: Award, color: "#8B5CF6" },
        ].map(kpi => (
          <div key={kpi.label} className={`${cardCls} p-5`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{kpi.label}</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{kpi.value}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">IRDAI SLA Compliant</p>
              </div>
              <div className="p-3 rounded-2xl" style={{ background: `${kpi.color}15`, color: kpi.color }}>
                <kpi.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Assigned Inspections List & Inspection Submission */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Assigned Inspections */}
        <div className={`${cardCls} p-6 space-y-4`}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Assigned Field Inspections</h3>
            <span className="text-[10px] text-blue-500 font-bold bg-blue-500/10 px-2.5 py-0.5 rounded-full">
              Target SLA: 3 Days
            </span>
          </div>

          <div className="space-y-3">
            {assignedClaims.map(c => (
              <div
                key={c.claimId}
                className={`p-4 rounded-2xl border transition-all ${
                  selectedClaim?.claimId === c.claimId
                    ? "border-blue-500 bg-blue-600/10"
                    : dk ? "bg-slate-900/40 border-white/5 hover:border-white/10" : "bg-slate-50 border-slate-200/80"
                } space-y-2`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono font-bold text-xs text-blue-500">{c.claimNumber}</span>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">{c.policyType} Insurance — {c.lossType}</h4>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">
                    {c.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{c.description}</p>

                <div className="text-[11px] text-slate-400 flex flex-wrap gap-3 pt-1">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-rose-500" /> {c.incidentLocation}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-blue-500" /> {c.incidentDate}</span>
                  <span>• Est: <strong>₹{c.estimatedLoss.toLocaleString()}</strong></span>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-bold">Client: {c.customerName}</span>
                  <button
                    onClick={() => {
                      setSelectedClaim(c);
                      setAssessedLoss(String(c.estimatedLoss - 2000));
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-extrabold shadow-md transition-all flex items-center gap-1"
                  >
                    <Camera className="w-3.5 h-3.5" /> Start / Submit Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Inspection Report Filing Form */}
        <div className={`${cardCls} p-6 space-y-4`}>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              {selectedClaim ? `Survey Report: ${selectedClaim.claimNumber}` : "Submit Structured Inspection Report"}
            </h3>
            <p className="text-xs text-slate-500">
              {selectedClaim ? `Inspecting ${selectedClaim.policyType} claim for ${selectedClaim.customerName}` : "Select a claim from the left list to file survey findings."}
            </p>
          </div>

          {selectedClaim ? (
            <form onSubmit={handleSubmitSurveyReport} className="space-y-4 text-xs font-bold text-slate-700 dark:text-slate-300">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Assessed Loss Amount (₹)</label>
                  <input
                    type="number"
                    value={assessedLoss}
                    onChange={e => setAssessedLoss(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 outline-none text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1">Depreciation Deduction (₹)</label>
                  <input
                    type="number"
                    value={depreciation}
                    onChange={e => setDepreciation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Surveyor Detailed Observations & Garage Estimate Audit</label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 outline-none text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div>
                <label className="block mb-2">Recommendation</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Approve", "Partial", "Reject"] as const).map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setRec(option)}
                      className={`py-2 rounded-xl text-xs font-extrabold border transition-all ${
                        rec === option
                          ? "bg-blue-600 text-white border-blue-600 shadow-md"
                          : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Upload Simulation */}
              <div>
                <label className="block mb-1">Inspection Photos ({photosUploaded} uploaded)</label>
                <div className="p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/10 text-center space-y-1">
                  <Camera className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="text-[11px] text-slate-500">Damage photos attached with GPS & timestamp metadata</p>
                  <button
                    type="button"
                    onClick={() => { setPhotosUploaded(p => p + 1); alert("Photo attached successfully."); }}
                    className="text-xs text-blue-500 font-extrabold hover:underline"
                  >
                    + Attach Another Photo
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" /> Sign Digitally & Lock Survey Report
              </button>
            </form>
          ) : (
            <div className="text-center py-24 text-slate-400 text-xs">
              👈 Click "Start / Submit Report" on any assigned claim on the left to begin field survey data entry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
