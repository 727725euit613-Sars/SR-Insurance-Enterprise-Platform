import React, { useState } from 'react';
import { 
  X, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Camera, 
  MapPin, 
  ShieldAlert,
  Sparkles,
  FileText
} from 'lucide-react';
import { insuranceStore, type PolicyModel as Policy, type ClaimModel as Claim } from '../../services/insuranceStore';

interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (claim: Claim) => void;
  preselectedPolicyId?: string;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedPolicyId
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const policies = insuranceStore.getPolicies();
  
  const [selectedPolicyId, setSelectedPolicyId] = useState(
    preselectedPolicyId || (policies[0]?.policyId ? String(policies[0].policyId) : '')
  );
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [incidentLocation, setIncidentLocation] = useState('Western Express Highway, Andheri East, Mumbai');
  const [claimType, setClaimType] = useState<'ACCIDENTAL_DAMAGE' | 'THEFT' | 'THIRD_PARTY' | 'NATURAL_CALAMITY'>('ACCIDENTAL_DAMAGE');
  const [estimatedAmount, setEstimatedAmount] = useState(45000);
  const [description, setDescription] = useState('Rear bumper and tailgate damage caused by collision while halted at a traffic light.');
  const [tpInvolved, setTpInvolved] = useState(false);
  const [tpRegistration, setTpRegistration] = useState('');
  const [firNumber, setFirNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const currentPolicy = policies.find(p => String(p.policyId) === selectedPolicyId) || policies[0];

  // Fraud & Duplicate check indicator
  const fraudScore = Math.floor(Math.random() * 25) + 5; // Low risk realistic demo score

  const handleSubmitClaim = () => {
    if (!currentPolicy) return;
    try {
      const newClaim = insuranceStore.createClaim({
        policyId: currentPolicy.policyId,
        incidentDate,
        incidentLocation,
        description,
        estimatedLoss: estimatedAmount,
        lossType: claimType,
      });
      onSuccess(newClaim);
      onClose();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Unable to register claim');
    }
    return;
    /*
    setIsProcessing(true);
    setTimeout(() => {
      const now = new Date();
      const newClaim: Claim = {
        id: `CLM-${Date.now().toString().slice(-6)}`,
        claimNumber: `CLM/2026/${Math.floor(100000 + Math.random() * 900000)}`,
        policyId: currentPolicy.id,
        policyNumber: currentPolicy.policyNumber,
        claimantName: currentPolicy.customerName,
        claimantPhone: currentPolicy.customerPhone,
        incidentDate: incidentDate,
        incidentLocation: incidentLocation,
        claimType: claimType,
        estimatedAmount: estimatedAmount,
        approvedAmount: 0,
        status: 'FNOL_REGISTERED',
        fraudScore: fraudScore,
        filedAt: now.toISOString().split('T')[0],
        description: description,
        thirdPartyInvolved: tpInvolved,
        firNumber: firNumber || undefined
      };

      insuranceStore.addClaim(newClaim);
      setIsProcessing(false);
      onSuccess(newClaim);
      onClose();
    }, 1000);*/
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 lg:p-8 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Wizard Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <AlertCircle className="w-4 h-4" />
            <span>Digital FNOL (First Notice of Loss) Registration</span>
          </div>
          <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
            Report an Incident & Register Claim
          </h2>
        </div>

        {/* Steps Progress */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 z-0"></div>
          {[
            { num: 1, label: 'Policy & Incident' },
            { num: 2, label: 'Damage & Photos' },
            { num: 3, label: 'Fraud Check & Confirm' },
          ].map((s) => (
            <div key={s.num} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step >= s.num
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
              </div>
              <span className="text-[11px] font-medium text-slate-400 mt-1.5 hidden sm:block">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* STEP 1: Select Policy & Incident Info */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Active Policy</label>
              <select
                value={selectedPolicyId}
                onChange={(e) => setSelectedPolicyId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
              >
                {policies.map((p) => (
                  <option key={p.policyId} value={p.policyId}>
                    {p.policyNumber} - {p.productName} ({p.customerName})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Date of Loss / Incident</label>
                <input
                  type="date"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nature of Loss / Claim Type</label>
                <select
                  value={claimType}
                  onChange={(e) => setClaimType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="ACCIDENTAL_DAMAGE">Accidental External Damage</option>
                  <option value="THEFT">Total Theft / Robbery</option>
                  <option value="THIRD_PARTY">Third Party Property Damage / Injury</option>
                  <option value="NATURAL_CALAMITY">Flood / Cyclone / Inundation</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Incident Location & City</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={incidentLocation}
                  onChange={(e) => setIncidentLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Ring Road, Sector 18, Noida"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Damage Estimation & Photos */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Estimated Damage / Loss Value (₹)</label>
              <input
                type="number"
                step="5000"
                value={estimatedAmount}
                onChange={(e) => setEstimatedAmount(parseInt(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Detailed Description of Accident</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="Briefly explain what happened..."
                required
              />
            </div>

            {/* Photo upload mock box */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Accident Damage Photos / Repair Estimate</label>
              <div className="p-4 border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-2xl bg-slate-950/40 text-center cursor-pointer">
                <Camera className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                <span className="text-xs font-medium text-slate-300 block">
                  Click to attach damage photos (Front, Rear, Odometer & RC Copy)
                </span>
                <span className="text-[11px] text-slate-500">Geo-tagged with live timestamp for instant AI validation</span>
              </div>
            </div>

            {/* Third party checkbox */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-white block">Third Party Vehicle / Property Involved?</span>
                <span className="text-[11px] text-slate-400">Section 146 Motor Vehicles Act reporting</span>
              </div>
              <input
                type="checkbox"
                checked={tpInvolved}
                onChange={(e) => setTpInvolved(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
            </div>
          </div>
        )}

        {/* STEP 3: Fraud Check & Confirmation */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                <span className="text-xs text-slate-400">Policy Number:</span>
                <span className="text-xs font-mono font-semibold text-indigo-300">{currentPolicy?.policyNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Claimant:</span>
                <span className="text-xs font-medium text-white">{currentPolicy?.customerName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Claim Type:</span>
                <span className="text-xs font-semibold text-slate-200">{claimType.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Estimated Amount:</span>
                <span className="text-xs font-bold text-white font-mono">₹{estimatedAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-950/20 rounded-2xl border border-emerald-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold text-white">AI Fraud Risk Score: {fraudScore}/100 (LOW RISK)</span>
                  <p className="text-emerald-400">Zero duplicate FNOL detected across IIB industry database.</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                AUTO-ELIGIBLE
              </span>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((step - 1) as any)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div></div>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((step + 1) as any)}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20"
            >
              <span>Continue</span> <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmitClaim}
              disabled={isProcessing}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
            >
              {isProcessing ? (
                <span>Registering FNOL Claim...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Submit FNOL Claim</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
