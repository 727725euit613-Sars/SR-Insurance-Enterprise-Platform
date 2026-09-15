import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  Smartphone, 
  Building2, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Sparkles,
  Download
} from 'lucide-react';
import { insuranceStore, type PolicyModel as Policy, type PaymentModel as Payment } from '../../services/insuranceStore';
import { documentGenerator } from '../../utils/documentGenerator';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy: Policy | null;
  amount?: number;
  onSuccess: (payment: Payment) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  policy,
  amount,
  onSuccess
}) => {
  const [method, setMethod] = useState<'UPI' | 'CREDIT_CARD' | 'NET_BANKING' | 'DEBIT_CARD'>('UPI');
  const [upiId, setUpiId] = useState('rajesh@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8921');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('•••');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedPayment, setCompletedPayment] = useState<Payment | null>(null);

  if (!isOpen || !policy) return null;

  const payableAmount = amount || policy.annualPremium;

  const handlePay = () => {
    if (!Number.isFinite(payableAmount) || payableAmount <= 0) {
      window.alert('Payment amount must be greater than zero');
      return;
    }
    if (method === 'UPI' && !/^[\w.-]+@[\w.-]+$/.test(upiId)) {
      window.alert('Enter a valid UPI ID');
      return;
    }
    try {
      const newPayment = insuranceStore.recordPayment({
        policyId: policy.policyId,
        policyNumber: policy.policyNumber,
        customerId: policy.customerId,
        customerName: policy.customerName,
        amount: payableAmount,
        paymentMethod: method === 'CREDIT_CARD' ? 'Credit Card' : method === 'NET_BANKING' ? 'Net Banking' : 'UPI',
        description: `Premium Payment - ${policy.policyNumber}`,
      });
      setCompletedPayment(newPayment);
      onSuccess(newPayment);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Unable to process payment');
    }
    return;
    /*
    setIsProcessing(true);
    setTimeout(() => {
      const now = new Date();
      const newPayment: Payment = {
        id: `PAY-${Date.now().toString().slice(-6)}`,
        policyId: policy.id,
        policyNumber: policy.policyNumber,
        receiptNumber: `REC-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(100000 + Math.random() * 900000)}`,
        amount: payableAmount,
        method: method,
        status: 'PAID',
        paymentDate: now.toISOString().split('T')[0],
        gatewayTransactionId: `rzp_live_${Math.random().toString(36).substring(2, 12)}`,
        irdaReceiptNumber: `IRDA-TAX-INV-2026-${Math.floor(10000 + Math.random() * 90000)}`
      };

      insuranceStore.addPayment(newPayment);
      setIsProcessing(false);
      setCompletedPayment(newPayment);
      onSuccess(newPayment);
    }, 1200);*/
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 lg:p-7 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!completedPayment ? (
          <div>
            <div className="mb-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
                <Lock className="w-3.5 h-3.5" />
                <span>Razorpay 256-Bit Encrypted Checkout</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Complete Premium Payment
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Policy: {policy.policyNumber}
              </p>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 mb-5 flex justify-between items-center">
              <div>
                <span className="text-xs text-slate-400 block">Total Premium Payable (incl. 18% GST)</span>
                <span className="text-2xl font-bold text-white font-mono">₹{(payableAmount ?? 0).toLocaleString('en-IN')}</span>
              </div>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                Live Gateway
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2 mb-5">
              <label className="block text-xs font-semibold text-slate-300">Choose Payment Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'UPI', label: 'UPI / QR', icon: Smartphone },
                  { id: 'CREDIT_CARD', label: 'Credit Card', icon: CreditCard },
                  { id: 'NET_BANKING', label: 'NetBanking', icon: Building2 },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = method === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMethod(item.id as any)}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-semibold">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Fields for selected mode */}
            {method === 'UPI' && (
              <div className="space-y-3 mb-6 animate-fade-in">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Enter Virtual Payment Address (VPA)</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="username@bank"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div className="flex gap-2">
                  {['@okhdfcbank', '@okicici', '@paytm', '@ybl'].map((suf) => (
                    <button
                      key={suf}
                      type="button"
                      onClick={() => setUpiId(upiId.split('@')[0] + suf)}
                      className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-slate-400 hover:text-white"
                    >
                      {suf}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {method === 'CREDIT_CARD' && (
              <div className="space-y-3 mb-6 animate-fade-in">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">CVV / CVC</label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      maxLength={4}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {method === 'NET_BANKING' && (
              <div className="space-y-3 mb-6 animate-fade-in">
                <label className="block text-xs font-semibold text-slate-300">Select Popular Indian Bank</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500">
                  <option>HDFC Bank Retail & Corporate</option>
                  <option>State Bank of India (SBI)</option>
                  <option>ICICI Bank Internet Banking</option>
                  <option>Axis Bank NetBanking</option>
                  <option>Kotak Mahindra Bank</option>
                </select>
              </div>
            )}

            <button
              onClick={handlePay}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50 text-sm"
            >
              {isProcessing ? (
                <span>Authorizing Payment via Bank Gateway...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay ₹{(payableAmount ?? 0).toLocaleString('en-IN')} Securely</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Payment Success View */
          <div className="text-center space-y-4 py-4 animate-fade-in">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-white">Payment Successful!</h3>
            <p className="text-xs text-slate-400">
              Transaction ID: <span className="font-mono text-indigo-400 font-semibold">{completedPayment.transactionId}</span>
            </p>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-left text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Receipt Number:</span>
                <span className="font-mono text-white">{completedPayment.receiptNumber}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Amount Paid:</span>
                <span className="font-mono font-bold text-emerald-400">₹{(completedPayment.amount ?? 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Payment Mode:</span>
                <span className="text-white">{completedPayment.paymentMethod}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => documentGenerator.generateTaxReceipt(completedPayment, policy)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition-colors shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Download GST Tax Invoice</span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
              >
                Close & Return
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
