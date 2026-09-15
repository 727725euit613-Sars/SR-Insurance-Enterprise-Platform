// ─── Document Generator & Exporter Utility ──────────────────────────────────────
// Generates official-looking, printable, downloadable documents and XML/CSV data per IRDAI standards.

export function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function openPrintableDocument(title: string, htmlContent: string) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to view and print this document.");
    return;
  }
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <meta charset="utf-8" />
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            color: #0f172a;
            background: #f8fafc;
            padding: 30px;
            font-size: 13px;
            line-height: 1.5;
          }
          .doc-container {
            max-width: 800px;
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.06);
            position: relative;
          }
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-30deg);
            font-size: 72px;
            font-weight: 900;
            color: rgba(37, 99, 235, 0.04);
            pointer-events: none;
            text-transform: uppercase;
            letter-spacing: 10px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 24px;
          }
          .logo-title {
            font-size: 24px;
            font-weight: 800;
            color: #1e3a8a;
            letter-spacing: -0.5px;
          }
          .badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
          }
          .badge-blue { background: #dbeafe; color: #1d4ed8; }
          .badge-green { background: #dcfce7; color: #15803d; }
          .section-title {
            font-size: 14px;
            font-weight: 700;
            color: #1e293b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 6px;
            margin: 20px 0 12px 0;
          }
          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px 24px;
          }
          .field { display: flex; flex-direction: column; }
          .field-label { font-size: 10px; font-weight: 600; color: #64748b; text-transform: uppercase; }
          .field-val { font-size: 13px; font-weight: 600; color: #0f172a; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 12px; }
          th { background: #f1f5f9; padding: 8px 12px; text-align: left; font-weight: 700; color: #334155; border: 1px solid #e2e8f0; }
          td { padding: 8px 12px; border: 1px solid #e2e8f0; }
          .text-right { text-align: right; }
          .total-row { font-weight: 800; background: #eff6ff; color: #1e40af; }
          .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px dashed #cbd5e1;
            font-size: 10px;
            color: #64748b;
            display: flex;
            justify-content: space-between;
          }
          .stamp {
            border: 2px solid #2563eb;
            color: #2563eb;
            padding: 8px 14px;
            border-radius: 8px;
            font-weight: 800;
            text-align: center;
            font-size: 11px;
            display: inline-block;
          }
          .print-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #2563eb;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(37,99,235,0.3);
          }
          .print-btn:hover { background: #1d4ed8; }
          @media print {
            body { background: white; padding: 0; }
            .doc-container { border: none; box-shadow: none; padding: 0; }
            .print-btn { display: none; }
          }
        </style>
      </head>
      <body>
        <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
        <div class="doc-container">
          <div class="watermark">IRDAI REGISTERED</div>
          ${htmlContent}
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
}

// ─── 1. Policy Schedule & Wordings PDF ─────────────────────────────────────────
export function generatePolicyScheduleHtml(policy: {
  policyNumber: string;
  policyName: string;
  policyType: string;
  sumInsured: number;
  premiumAmount: number;
  startDate: string;
  endDate: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  ncbPct?: number;
  vehicleNo?: string;
  addOns?: string[];
}) {
  const gst = Math.round(policy.premiumAmount * 0.18);
  const base = policy.premiumAmount - gst;
  const ncb = policy.ncbPct || 20;

  return `
    <div class="header">
      <div>
        <div class="logo-title">SR INSURANCE ENTERPRISE</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 3px;">IRDAI Reg. No: IRDAI/NL-GEN/2024/098 • CIN: U66010KA2024PLC189201</div>
        <div style="font-size: 11px; color: #64748b;">Registered Office: Tower 4, Tech Park, Koramangala, Bengaluru - 560034</div>
      </div>
      <div style="text-align: right;">
        <span class="badge badge-green">POLICY SCHEDULE — ACTIVE</span>
        <div style="font-size: 14px; font-weight: 800; color: #2563eb; margin-top: 6px;">${policy.policyNumber}</div>
        <div style="font-size: 10px; color: #64748b;">UIN: IRDAN106P0002V01202425</div>
      </div>
    </div>

    <div class="section-title">1. Policyholder & Insured Details</div>
    <div class="grid-2">
      <div class="field"><span class="field-label">Policyholder Name</span><span class="field-val">${policy.customerName || "Arjun Mehta"}</span></div>
      <div class="field"><span class="field-label">Registered Mobile & Email</span><span class="field-val">${policy.customerPhone || "+91 98765 43210"} • ${policy.customerEmail || "arjun.m@email.com"}</span></div>
      <div class="field"><span class="field-label">Communication Address</span><span class="field-val">${policy.customerAddress || "12 Koramangala 4th Block, Bengaluru, Karnataka - 560034"}</span></div>
      <div class="field"><span class="field-label">eKYC Status</span><span class="field-val">✅ Verified via UIDAI Aadhaar eKYC (AUA: NSDL)</span></div>
    </div>

    <div class="section-title">2. Policy Period & Coverage Specification</div>
    <div class="grid-2">
      <div class="field"><span class="field-label">Product / Policy Name</span><span class="field-val">${policy.policyName} (${policy.policyType} Insurance)</span></div>
      <div class="field"><span class="field-label">Sum Insured / IDV</span><span class="field-val" style="color: #2563eb; font-size: 15px;">₹${(policy.sumInsured || 2000000).toLocaleString()}</span></div>
      <div class="field"><span class="field-label">Policy Start Date</span><span class="field-val">${policy.startDate || "2024-01-01"} 00:00 hrs</span></div>
      <div class="field"><span class="field-label">Policy Expiry Date</span><span class="field-val">${policy.endDate || "2025-01-01"} 23:59 hrs</span></div>
      <div class="field"><span class="field-label">No Claim Bonus (NCB)</span><span class="field-val">${ncb}% Discount applied</span></div>
      <div class="field"><span class="field-label">Asset / Vehicle Reg.</span><span class="field-val">${policy.vehicleNo || "KA-01-MN-5678 (Toyota Fortuner 4x4)"}</span></div>
    </div>

    <div class="section-title">3. Premium Computation & Tax Invoice</div>
    <table>
      <thead>
        <tr><th>Description</th><th>SAC Code</th><th class="text-right">Amount (₹)</th></tr>
      </thead>
      <tbody>
        <tr><td>Basic Own Damage & Liability Cover</td><td>997132</td><td class="text-right">₹${(base ?? 0).toLocaleString()}</td></tr>
        <tr><td>Add-on Covers (Zero Dep, Engine Protect, RSA)</td><td>997132</td><td class="text-right">₹2,850</td></tr>
        <tr><td>No Claim Bonus (${ncb}%) Discount</td><td>997132</td><td class="text-right" style="color: #16a34a;">- ₹1,450</td></tr>
        <tr><td>Stamp Duty (Government of India)</td><td>997132</td><td class="text-right">₹100</td></tr>
        <tr><td>Integrated GST (IGST @ 18.00%)</td><td>997132</td><td class="text-right">₹${(gst ?? 0).toLocaleString()}</td></tr>
        <tr class="total-row"><td>TOTAL PREMIUM PAID (INR)</td><td></td><td class="text-right">₹${(policy.premiumAmount ?? 0).toLocaleString()}</td></tr>
      </tbody>
    </table>

    <div class="section-title">4. Regulatory Disclosure & Free-Look Clause</div>
    <p style="font-size: 11px; color: #475569; margin-bottom: 15px;">
      In compliance with IRDAI (Protection of Policyholders' Interests) Regulations, this policy is subject to a 15-day Free-Look period from the date of receipt. In case of dispute, grievances may be lodged with the Grievance Redressal Officer at complaints@srinsurance.com or through IRDAI IGMS portal (bimabharosa.irdai.gov.in).
    </p>

    <div class="footer">
      <div>
        <div class="stamp">DIGITALLY SIGNED<br />IRDAI VALIDATED</div>
        <div style="margin-top: 6px;">Generated on: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • Verified Digital Document</div>
      </div>
      <div style="text-align: right;">
        <div style="font-weight: 800; color: #0f172a;">For SR Insurance Company Limited</div>
        <div style="margin-top: 25px; color: #64748b;">Authorised Signatory</div>
      </div>
    </div>
  `;
}

// ─── 2. GST Premium Receipt ───────────────────────────────────────────────────
export function generatePremiumReceiptHtml(payment: {
  receiptNumber: string;
  transactionId: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  policyNumber: string;
  customerName?: string;
}) {
  const gst = Math.round((payment.amount * 18) / 118);
  const net = payment.amount - gst;
  const cgst = Math.round(gst / 2);
  const sgst = Math.round(gst / 2);

  return `
    <div class="header">
      <div>
        <div class="logo-title">SR INSURANCE ENTERPRISE</div>
        <div style="font-size: 11px; color: #64748b;">GSTIN: 29AABCS1429B1Z8 • SAC: 997132 (Insurance Services)</div>
        <div style="font-size: 11px; color: #64748b;">Bengaluru - 560034, Karnataka, India</div>
      </div>
      <div style="text-align: right;">
        <span class="badge badge-green">GST TAX RECEIPT — SUCCESS</span>
        <div style="font-size: 14px; font-weight: 800; color: #2563eb; margin-top: 6px;">${payment.receiptNumber}</div>
        <div style="font-size: 10px; color: #64748b;">Date: ${payment.paymentDate}</div>
      </div>
    </div>

    <div class="section-title">Payment & Customer Information</div>
    <div class="grid-2">
      <div class="field"><span class="field-label">Received From</span><span class="field-val">${payment.customerName || "Arjun Mehta"}</span></div>
      <div class="field"><span class="field-label">Policy Number</span><span class="field-val">${payment.policyNumber}</span></div>
      <div class="field"><span class="field-label">Transaction Reference</span><span class="field-val">${payment.transactionId}</span></div>
      <div class="field"><span class="field-label">Payment Gateway / Mode</span><span class="field-val">Razorpay (${payment.paymentMethod})</span></div>
    </div>

    <div class="section-title">Tax Invoice Breakup</div>
    <table>
      <thead>
        <tr><th>Particulars</th><th>SAC Code</th><th class="text-right">Net Amount</th><th class="text-right">CGST (9%)</th><th class="text-right">SGST (9%)</th><th class="text-right">Total (₹)</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>Insurance Premium Collection</td>
          <td>997132</td>
          <td class="text-right">₹${(net ?? 0).toLocaleString()}</td>
          <td class="text-right">₹${(cgst ?? 0).toLocaleString()}</td>
          <td class="text-right">₹${(sgst ?? 0).toLocaleString()}</td>
          <td class="text-right font-bold">₹${(payment.amount ?? 0).toLocaleString()}</td>
        </tr>
        <tr class="total-row">
          <td colspan="5">TOTAL AMOUNT RECEIVED (INR)</td>
          <td class="text-right">₹${(payment.amount ?? 0).toLocaleString()}</td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top: 20px; font-size: 11px; color: #475569;">
      <strong>Amount in words:</strong> Rupees ${numberToWords(payment.amount)} Only.
    </div>

    <div class="footer">
      <div>
        <div class="stamp">PAID & VERIFIED<br />RAZORPAY GATEWAY</div>
      </div>
      <div style="text-align: right;">
        <div style="font-weight: 800;">SR Insurance Accounts & Finance</div>
        <div style="color: #64748b; margin-top: 4px;">Computer-generated tax receipt. No physical signature required.</div>
      </div>
    </div>
  `;
}

// ─── 3. Claim Settlement / Adjudication Letter ────────────────────────────────
export function generateClaimSettlementHtml(claim: {
  claimNumber: string;
  policyNumber: string;
  customerName: string;
  incidentDate: string;
  claimedAmount: number;
  approvedAmount: number;
  deductibles: number;
  depreciation: number;
  status: string;
  payeeAccount?: string;
  payeeIfsc?: string;
}) {
  return `
    <div class="header">
      <div>
        <div class="logo-title">SR INSURANCE CLAIMS MANAGEMENT</div>
        <div style="font-size: 11px; color: #64748b;">Claims Adjudication & Settlement Desk • IRDAI Reg: IRDAI/NL-GEN/2024/098</div>
      </div>
      <div style="text-align: right;">
        <span class="badge ${claim.status === "Approved" || claim.status === "Settled" ? "badge-green" : "badge-blue"}">
          ${claim.status.toUpperCase()}
        </span>
        <div style="font-size: 14px; font-weight: 800; color: #2563eb; margin-top: 6px;">${claim.claimNumber}</div>
        <div style="font-size: 10px; color: #64748b;">Policy: ${claim.policyNumber}</div>
      </div>
    </div>

    <div class="section-title">Claimant & Loss Details</div>
    <div class="grid-2">
      <div class="field"><span class="field-label">Insured / Claimant Name</span><span class="field-val">${claim.customerName}</span></div>
      <div class="field"><span class="field-label">Date of Incident</span><span class="field-val">${claim.incidentDate}</span></div>
      <div class="field"><span class="field-label">Claim Lodged Amount</span><span class="field-val">₹${(claim.claimedAmount ?? 0).toLocaleString()}</span></div>
      <div class="field"><span class="field-label">Adjudication Date</span><span class="field-val">${new Date().toISOString().split("T")[0]}</span></div>
    </div>

    <div class="section-title">Adjudication Assessment & Deductions</div>
    <table>
      <thead>
        <tr><th>Assessment Line Item</th><th>Notes / Tariff Guideline</th><th class="text-right">Amount (₹)</th></tr>
      </thead>
      <tbody>
        <tr><td>Assessed Loss by Empanelled Surveyor</td><td>As per surveyor inspection report</td><td class="text-right">₹${(claim.claimedAmount ?? 0).toLocaleString()}</td></tr>
        <tr><td>Less: Compulsory Policy Deductible</td><td>Policy Terms & Conditions Clause 4.2</td><td class="text-right" style="color: #dc2626;">- ₹${(claim.deductibles ?? 0).toLocaleString()}</td></tr>
        <tr><td>Less: Depreciation on Replaced Parts</td><td>IRDAI Motor Tariff Standard Depreciation</td><td class="text-right" style="color: #dc2626;">- ₹${(claim.depreciation ?? 0).toLocaleString()}</td></tr>
        <tr class="total-row"><td>NET APPROVED SETTLEMENT AMOUNT</td><td>Payable via Razorpay Payouts (NEFT/IMPS)</td><td class="text-right">₹${(claim.approvedAmount ?? 0).toLocaleString()}</td></tr>
      </tbody>
    </table>

    <div class="section-title">Disbursement & Settlement Information</div>
    <div class="grid-2">
      <div class="field"><span class="field-label">Settlement Mode</span><span class="field-val">Direct Bank Account Transfer (IMPS/NEFT)</span></div>
      <div class="field"><span class="field-label">Payee Bank Account</span><span class="field-val">${claim.payeeAccount || "XXXX XXXX 4821 (HDFC Bank)"}</span></div>
      <div class="field"><span class="field-label">IFSC Code</span><span class="field-val">${claim.payeeIfsc || "HDFC0001234"}</span></div>
      <div class="field"><span class="field-label">IRDAI SLA Compliance</span><span class="field-val">✅ Settled within 7 business days</span></div>
    </div>

    <div class="footer">
      <div>
        <div class="stamp">CLAIMS AUTHORISED<br />PAYOUT APPROVED</div>
      </div>
      <div style="text-align: right;">
        <div style="font-weight: 800;">Claims Adjudication Manager</div>
        <div style="color: #64748b; margin-top: 4px;">SR Insurance Claims Department</div>
      </div>
    </div>
  `;
}

// ─── 4. IIB (Insurance Information Bureau) XML Exporter ──────────────────────
export function generateIIBMotorXml(policies: Array<{
  policyNumber: string;
  policyType: string;
  startDate: string;
  endDate: string;
  sumInsured: number;
  premiumAmount: number;
  customerName?: string;
  vehicleNo?: string;
}>) {
  const records = policies.map((p) => `
    <PolicyRecord>
      <InsurerCode>SR_INS_098</InsurerCode>
      <PolicyNumber>${escapeXml(p.policyNumber)}</PolicyNumber>
      <PolicyType>${escapeXml(p.policyType)}</PolicyType>
      <InceptionDate>${p.startDate}</InceptionDate>
      <ExpiryDate>${p.endDate}</ExpiryDate>
      <VehicleRegNo>${escapeXml(p.vehicleNo || "KA-01-MN-5678")}</VehicleRegNo>
      <IDV>${p.sumInsured}</IDV>
      <GrossPremium>${p.premiumAmount}</GrossPremium>
      <InsuredName>${escapeXml(p.customerName || "Arjun Mehta")}</InsuredName>
      <SubmissionTimestamp>${new Date().toISOString()}</SubmissionTimestamp>
    </PolicyRecord>`).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<IIBMotorSubmission xmlns="http://www.iib.gov.in/schema/motor/v2.4">
  <Header>
    <InsurerId>SR_INS_098</InsurerId>
    <BatchId>BATCH-${Date.now()}</BatchId>
    <TotalRecords>${policies.length}</TotalRecords>
    <GeneratedDate>${new Date().toISOString()}</GeneratedDate>
    <IRDAIComplianceStandard>IRDAI/NL/MTR/2024</IRDAIComplianceStandard>
  </Header>
  <PolicyData>${records}
  </PolicyData>
</IIBMotorSubmission>`;
}

// ─── 5. Reinsurance Bordereaux CSV Exporter ──────────────────────────────────
export function generateRIBordereauxCsv(treaties: Array<{
  policyNumber: string;
  lob: string;
  sumInsured: number;
  grossPremium: number;
  reinsurer: string;
  cessionPct: number;
  cededPremium: number;
  retentionPremium: number;
}>) {
  const header = "Policy Number,Line of Business,Sum Insured (INR),Gross Premium (INR),Reinsurer Name,Cession %,Ceded Premium (INR),Retained Premium (INR)\n";
  const rows = treaties.map((t) =>
    `"${t.policyNumber}","${t.lob}",${t.sumInsured},${t.grossPremium},"${t.reinsurer}",${t.cessionPct}%,${t.cededPremium},${t.retentionPremium}`
  ).join("\n");
  return header + rows;
}

// Helper utilities
function escapeXml(unsafe: string) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}

function numberToWords(num: number): string {
  if (num === 0) return "Zero";
  const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function formatHundreds(n: number): string {
    let str = "";
    if (n > 99) {
      str += a[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n > 19) {
      str += b[Math.floor(n / 10)] + " " + a[n % 10];
    } else if (n > 0) {
      str += a[n];
    }
    return str.trim();
  }

  let str = "";
  if (num >= 10000000) {
    str += formatHundreds(Math.floor(num / 10000000)) + " Crore ";
    num %= 10000000;
  }
  if (num >= 100000) {
    str += formatHundreds(Math.floor(num / 100000)) + " Lakh ";
    num %= 100000;
  }
  if (num >= 1000) {
    str += formatHundreds(Math.floor(num / 1000)) + " Thousand ";
    num %= 1000;
  }
  if (num > 0) {
    str += formatHundreds(num);
  }
  return str.trim();
}

export const documentGenerator = {
  downloadFile,
  openPrintableDocument,
  generatePolicyScheduleHtml,
  generatePremiumReceiptHtml,
  generateClaimSettlementHtml,
  generateIIBMotorXml,
  generateRIBordereauxCsv,
  generateTaxReceipt: (payment: any, policy?: any) => {
    const html = generatePremiumReceiptHtml({
      receiptNumber: payment.receiptNumber || `REC-2026-${payment.id || '001'}`,
      transactionId: payment.gatewayTransactionId || payment.transactionId || `TXN-${Date.now()}`,
      amount: payment.amount || (policy ? policy.grossPremium || policy.annualPremium : 15000),
      paymentMethod: payment.method || payment.paymentMethod || "UPI / Razorpay",
      paymentDate: payment.paymentDate || new Date().toISOString().split("T")[0],
      policyNumber: payment.policyNumber || (policy ? policy.policyNumber : "POL-GEN-2026-001"),
      customerName: (policy && (policy.customerName || (policy.customer && policy.customer.name))) || "Arjun Mehta",
    });
    openPrintableDocument(`GST Tax Invoice - ${payment.receiptNumber || 'Receipt'}`, html);
  },
  generatePolicySchedule: (policy: any) => {
    const html = generatePolicyScheduleHtml({
      policyNumber: policy.policyNumber,
      policyName: policy.productName || policy.policyName || "Comprehensive Protection Policy",
      policyType: policy.policyType || policy.lob || "General",
      sumInsured: policy.sumInsured || policy.idv || 1000000,
      premiumAmount: policy.annualPremium || policy.grossPremium || 15000,
      startDate: policy.startDate || new Date().toISOString().split("T")[0],
      endDate: policy.endDate || new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0],
      customerName: policy.customerName || (policy.customer && policy.customer.name) || "Arjun Mehta",
      customerEmail: policy.customerEmail || (policy.customer && policy.customer.email) || "arjun.m@email.com",
      customerPhone: policy.customerPhone || (policy.customer && policy.customer.mobile) || "+91 98765 43210",
      customerAddress: policy.customerAddress || (policy.customer && policy.customer.address) || "Bengaluru, Karnataka",
      ncbPct: policy.ncbPct || policy.ncbDiscount || 20,
      vehicleNo: policy.vehicleNo || policy.vehicleDetails || "KA-01-MN-5678",
    });
    openPrintableDocument(`Policy Schedule - ${policy.policyNumber}`, html);
  },
  generateClaimSettlement: (claim: any) => {
    const html = generateClaimSettlementHtml({
      claimNumber: claim.claimNumber,
      policyNumber: claim.policyNumber,
      customerName: claim.customerName || "Insured Claimant",
      incidentDate: claim.incidentDate || claim.dateOfLoss || new Date().toISOString().split("T")[0],
      claimedAmount: claim.estimatedLoss || claim.claimedAmount || 50000,
      approvedAmount: claim.approvedAmount || (claim.estimatedLoss ? claim.estimatedLoss * 0.9 : 45000),
      deductibles: claim.deductibles || 2000,
      depreciation: claim.depreciation || 3000,
      status: claim.status || "Approved",
      payeeAccount: claim.payeeBank || "XXXX-XXXX-4821 (HDFC Bank)",
      payeeIfsc: claim.payeeIfsc || "HDFC0001234",
    });
    openPrintableDocument(`Claim Settlement Letter - ${claim.claimNumber}`, html);
  },
};
