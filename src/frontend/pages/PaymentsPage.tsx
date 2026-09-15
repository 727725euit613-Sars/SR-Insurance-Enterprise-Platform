import React, { useState } from "react";
import {
  CreditCard, Zap, Database, Banknote, Download, CheckCircle, RefreshCw,
  AlertCircle, Shield, FileSpreadsheet, ArrowUpRight, Scale, RotateCcw
} from "lucide-react";
import { insuranceStore, type PaymentModel, type PolicyModel } from "../services/insuranceStore";
import {
  openPrintableDocument,
  generatePremiumReceiptHtml,
  downloadFile
} from "../utils/documentGenerator";

export const PaymentsPage = ({
  darkMode,
  onOpenCheckout,
}: {
  darkMode: boolean;
  onOpenCheckout: (amount: number, title: string, onSuccess: (method: any) => void) => void;
}) => {
  const [method, setMethod] = useState<"UPI" | "Debit Card" | "Credit Card" | "Net Banking">("UPI");
  const [selectedPolicyId, setSelectedPolicyId] = useState<number>(4); // default Home Shield Plus
  const [filter, setFilter] = useState("All");

  const dk = darkMode;
  const cardCls = `rounded-[28px] border ${dk ? "bg-slate-800/50 border-white/[0.07]" : "bg-white border-slate-200/80 shadow-sm"}`;

  const payments = insuranceStore.getPayments();
  const policies = insuranceStore.getPolicies();
  const activeDuePolicy = policies.find(p => p.policyId === selectedPolicyId) || policies[0];

  const handlePayNow = () => {
    if (!activeDuePolicy) return;
    onOpenCheckout(activeDuePolicy.annualPremium, `Premium — ${activeDuePolicy.productName}`, (usedMethod) => {
      insuranceStore.recordPayment({
        policyId: activeDuePolicy.policyId,
        policyNumber: activeDuePolicy.policyNumber,
        customerId: activeDuePolicy.customerId,
        customerName: activeDuePolicy.customerName,
        amount: activeDuePolicy.annualPremium,
        paymentMethod: usedMethod,
        description: `Premium Collection — ${activeDuePolicy.productName}`
      });
      activeDuePolicy.status = "Active";
    });
  };

  const handleDownloadReceipt = (payment: PaymentModel) => {
    const html = generatePremiumReceiptHtml({
      receiptNumber: payment.receiptNumber,
      transactionId: payment.transactionId,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      paymentDate: payment.paymentDate,
      policyNumber: payment.policyNumber,
      customerName: payment.customerName,
    });
    openPrintableDocument(`Tax_Receipt_${payment.receiptNumber}.pdf`, html);
  };

  const handleExportPaymentsCsv = () => {
    const header = "Receipt Number,Transaction ID,Policy Number,Customer Name,Amount (INR),GST (INR),Payment Method,Date,Status\n";
    const rows = payments.map(p =>
      `"${p.receiptNumber}","${p.transactionId}","${p.policyNumber}","${p.customerName}",${p.amount},${p.gstAmount},"${p.paymentMethod}","${p.paymentDate}","${p.paymentStatus}"`
    ).join("\n");
    downloadFile(header + rows, `Payment_Ledger_${Date.now()}.csv`, "text/csv");
  };

  const handleFreeLookCancellation = (payment: PaymentModel) => {
    if (window.confirm(`Initiate 15-Day Free-Look Policy Cancellation?\n\nProrated refund of ₹${(payment.amount - 100).toLocaleString()} (minus ₹100 stamp duty) will be disbursed to your account.`)) {
      payment.paymentStatus = "Refunded";
      const pol = policies.find(p => p.policyNumber === payment.policyNumber);
      if (pol) pol.status = "Cancelled";
      alert("Free-look cancellation processed. Refund initiated via Razorpay.");
    }
  };

  return (
    <div className="p-6 space-y-6 font-sans">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Pay Premium Box */}
        <div className={`${cardCls} p-6 space-y-5 h-fit`}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Pay Premium Installment</h3>
            <span className="text-[10px] bg-amber-500/15 text-amber-400 font-extrabold px-2.5 py-0.5 rounded-full">
              Due Soon
            </span>
          </div>

          {/* Due Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-600/20 to-orange-600/10 border border-amber-500/20 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <AlertCircle className="w-4 h-4" />
              <span>Premium Outstanding</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              ₹{activeDuePolicy ? activeDuePolicy.annualPremium.toLocaleString() : "12,000"}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {activeDuePolicy ? `${activeDuePolicy.productName} • Due ${activeDuePolicy.endDate}` : "Home Shield Plus"}
            </p>
          </div>

          {/* Select Policy */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Select Policy to Pay</label>
            <select
              value={selectedPolicyId}
              onChange={e => setSelectedPolicyId(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border text-xs font-semibold bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 outline-none text-slate-900 dark:text-white"
            >
              {policies.map(p => (
                <option key={p.policyId} value={p.policyId}>
                  {p.policyNumber} — {p.productName} (₹{p.annualPremium.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            {[
              { id: "UPI", label: "UPI Instant Payment", icon: Zap, sub: "Google Pay, PhonePe, Paytm, BHIM" },
              { id: "Credit Card", label: "Credit / Debit Cards", icon: CreditCard, sub: "Visa, Mastercard, RuPay" },
              { id: "Net Banking", label: "Net Banking (50+ Banks)", icon: Database, sub: "Instant bank authorization" },
            ].map(pm => (
              <label
                key={pm.id}
                onClick={() => setMethod(pm.id as any)}
                className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                  method === pm.id
                    ? "border-blue-500 bg-blue-600/10 text-slate-900 dark:text-white"
                    : "border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400"
                }`}
              >
                <input type="radio" checked={method === pm.id} onChange={() => {}} className="accent-blue-600" />
                <div className="w-8 h-8 rounded-xl bg-blue-600/10 flex items-center justify-center flex-shrink-0">
                  <pm.icon className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <div className="text-xs font-bold">{pm.label}</div>
                  <div className="text-[10px] text-slate-500">{pm.sub}</div>
                </div>
              </label>
            ))}
          </div>

          <button
            onClick={handlePayNow}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-extrabold text-xs shadow-xl shadow-blue-600/30 transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            Proceed to Razorpay → ₹{activeDuePolicy?.annualPremium.toLocaleString() || "12,000"}
          </button>

          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-semibold pt-1">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>256-bit SSL • PCI-DSS & IRDAI Verified</span>
          </div>
        </div>

        {/* Right: Payment History Ledger */}
        <div className={`lg:col-span-2 ${cardCls} p-6 space-y-4`}>
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/5">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Payment & Tax Invoice History</h3>
              <p className="text-xs text-slate-500">Official GST-compliant receipts per IRDAI Guidelines</p>
            </div>

            <button
              onClick={handleExportPaymentsCsv}
              className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-bold border transition-all ${
                dk ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" /> Export CSV
            </button>
          </div>

          <div className="space-y-3">
            {payments.map(txn => (
              <div
                key={txn.paymentId}
                className={`p-4 rounded-2xl border transition-all ${
                  dk ? "bg-slate-900/40 border-white/5 hover:border-white/10" : "bg-slate-50 border-slate-200/80 hover:bg-slate-100/60"
                } flex flex-wrap sm:flex-nowrap items-center justify-between gap-4`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    txn.paymentStatus === "Success" ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"
                  }`}>
                    {txn.paymentStatus === "Success" ? <CheckCircle className="w-5 h-5" /> : <RotateCcw className="w-5 h-5" />}
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{txn.description}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-3">
                      <span>Ref: <strong className="font-mono text-blue-500">{txn.receiptNumber}</strong></span>
                      <span>• Mode: {txn.paymentMethod}</span>
                      <span>• Date: {txn.paymentDate}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <div className={`text-base font-black ${txn.paymentStatus === "Refunded" ? "text-blue-400" : "text-slate-900 dark:text-white"}`}>
                      {txn.paymentStatus === "Refunded" ? "+" : ""}₹{txn.amount.toLocaleString()}
                    </div>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      txn.paymentStatus === "Success" ? "bg-emerald-500/15 text-emerald-400" : "bg-blue-500/15 text-blue-400"
                    }`}>
                      {txn.paymentStatus}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDownloadReceipt(txn)}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                        dk ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                      title="Download Official GST Tax Receipt"
                    >
                      <Download className="w-4 h-4 text-blue-500" />
                    </button>

                    {txn.paymentStatus === "Success" && (
                      <button
                        onClick={() => handleFreeLookCancellation(txn)}
                        className="px-2.5 py-1.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-[10px] font-extrabold transition-all"
                        title="15-Day Free-Look Cancellation"
                      >
                        Free-Look
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
