import React, { useState } from 'react';
import { 
  X, 
  FileEdit, 
  CheckCircle2, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { endorsementsApi } from '../../services/api';
import { type PolicyModel as Policy, type EndorsementModel as Endorsement } from '../../services/insuranceStore';

interface EndorsementModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy: Policy | null;
  onSuccess: (endorsement: Endorsement) => void;
}

export const EndorsementModal: React.FC<EndorsementModalProps> = ({
  isOpen,
  onClose,
  policy,
  onSuccess
}) => {
  const [type, setType] = useState<string>('CHANGE_NOMINEE');
  const [reason, setReason] = useState('Updating nominee details as per legal request.');
  const [additionalPremium, setAdditionalPremium] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !policy) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const typeMap: Record<string, Endorsement['endorsementType']> = {
        CHANGE_NOMINEE: 'Nominee Change',
        CHANGE_VEHICLE_REGISTRATION: 'Vehicle Detail Change',
        ADD_COVERAGE: 'Add-on Update',
        CHANGE_ADDRESS: 'Address Change',
      };
      const newEndorsement = await endorsementsApi.create({
        policyId: policy.policyId,
        endorsementType: typeMap[type as string] || 'Add-on Update',
        description: reason,
        oldValue: policy.nomineeName || 'Previous Value',
        newValue: reason,
        premiumAdjustment: additionalPremium,
        effectiveDate: new Date().toISOString().slice(0, 10),
      });
      setIsProcessing(false);
      onSuccess(newEndorsement);
      onClose();
    } catch (err: any) {
      setIsProcessing(false);
      window.alert(err.message || 'Unable to submit endorsement');
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
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <FileEdit className="w-4 h-4" />
            <span>Policy Modification Endorsement</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Request Policy Alteration
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Policy: {policy.policyNumber} ({policy.productName})
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Endorsement Category</label>
            <select
              value={type}
              onChange={(e) => {
                const val = e.target.value as Endorsement['type'];
                setType(val);
                if (val === 'ADD_COVERAGE') setAdditionalPremium(2500);
                else setAdditionalPremium(0);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="CHANGE_NOMINEE">Change Nominee & Beneficiary (Non-Financial)</option>
              <option value="CHANGE_VEHICLE_REGISTRATION">Vehicle Registration / Engine Correction</option>
              <option value="ADD_COVERAGE">Add Additional Add-on Rider (Financial)</option>
              <option value="CHANGE_ADDRESS">Update Insured Address & Contact</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Specific Modification Details</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              placeholder="Provide exact new details..."
              required
            />
          </div>

          {type === 'ADD_COVERAGE' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Pro-Rata Additional Premium (₹)</label>
              <input
                type="number"
                value={additionalPremium}
                onChange={(e) => setAdditionalPremium(parseInt(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          )}

          <div className="p-3.5 bg-indigo-950/20 rounded-xl border border-indigo-500/20 text-xs text-indigo-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Endorsement will be routed to Underwriting Desk for statutory verification.</span>
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
              type="submit"
              disabled={isProcessing}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
            >
              {isProcessing ? <span>Processing...</span> : <><Sparkles className="w-4 h-4" /> Submit Endorsement</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
