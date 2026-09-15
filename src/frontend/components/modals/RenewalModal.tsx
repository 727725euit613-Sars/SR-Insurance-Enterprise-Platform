import React, { useState } from 'react';
import { 
  X, 
  RotateCw, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { insuranceStore, type PolicyModel as Policy } from '../../services/insuranceStore';

interface RenewalModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy: Policy | null;
  onSuccess: (policy: Policy) => void;
}

export const RenewalModal: React.FC<RenewalModalProps> = ({
  isOpen,
  onClose,
  policy,
  onSuccess
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !policy) return null;

  // Next NCB progression tier: 0 -> 20 -> 25 -> 35 -> 45 -> 50%
  const currentNcb = policy.ncbPct || 20;
  let nextNcb = currentNcb;
  if (currentNcb === 0) nextNcb = 20;
  else if (currentNcb === 20) nextNcb = 25;
  else if (currentNcb === 25) nextNcb = 35;
  else if (currentNcb === 35) nextNcb = 45;
  else if (currentNcb >= 45) nextNcb = 50;

  const renewedNet = Math.round((policy.annualPremium / 1.18) * (1 - (nextNcb - currentNcb) / 100));
  const renewedGst = Math.round(renewedNet * 0.18);
  const renewedGross = renewedNet + renewedGst;

  const handleRenew = () => {
    setIsProcessing(true);
    try {
      const renewed = insuranceStore.renewPolicy(policy.policyId);
      setIsProcessing(false);
      onSuccess(renewed);
      onClose();
    } catch (err: any) {
      setIsProcessing(false);
      window.alert(err.message || 'Unable to renew policy');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 lg:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <RotateCw className="w-4 h-4" />
            <span>Seamless Instant Policy Renewal</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Renew Insurance Coverage
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Policy: {policy.policyNumber} ({policy.productName})
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-3 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Insured Proposer:</span>
              <span className="font-semibold text-white">{policy.customerName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Sum Insured (IDV):</span>
              <span className="font-mono font-bold text-white">₹{policy.sumInsured.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">NCB Progression:</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {currentNcb}% → <span className="underline">{nextNcb}% NCB</span> (Claim-free year)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Renewal Net Premium:</span>
              <span className="font-mono text-slate-200">₹{renewedNet.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Statutory GST (18%):</span>
              <span className="font-mono text-slate-200">₹{renewedGst.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-800">
              <span className="text-sm font-bold text-white">Renewal Payable:</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">₹{renewedGross.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Continuous policy tenure protects Section 45 Non-Contestability rights.</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRenew}
              disabled={isProcessing}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
            >
              {isProcessing ? (
                <span>Renewing Policy...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Confirm & Renew Policy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
