import React, { useState } from "react";
import {
  Landmark, Download, FileSpreadsheet, Plus, Shield, ArrowUpRight,
  PieChart as PieIcon, Layers, FileText, CheckCircle, AlertCircle
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { insuranceStore, type ReinsuranceTreatyModel } from "../services/insuranceStore";
import { downloadFile, openPrintableDocument, generateRIBordereauxCsv } from "../utils/documentGenerator";

export const ReinsurancePage = ({
  darkMode,
}: {
  darkMode: boolean;
}) => {
  const [selectedLob, setSelectedLob] = useState("ALL");
  const dk = darkMode;
  const cardCls = `rounded-[28px] border ${dk ? "bg-slate-800/50 border-white/[0.07]" : "bg-white border-slate-200/80 shadow-sm"}`;

  const treaties = insuranceStore.getTreaties();
  const policies = insuranceStore.getPolicies();

  const totalGwp = policies.reduce((sum, p) => sum + p.annualPremium, 0);
  const totalCeded = Math.round(totalGwp * 0.21);
  const netWrittenPremium = totalGwp - totalCeded;

  const handleExportBordereauxCsv = () => {
    const treatyData = policies.map(p => ({
      policyNumber: p.policyNumber,
      lob: p.policyType,
      sumInsured: p.sumInsured,
      grossPremium: p.annualPremium,
      reinsurer: p.policyType === "Motor" ? "GIC Re" : p.policyType === "Health" ? "Swiss Re" : "Munich Re",
      cessionPct: p.riCededPct || 20,
      cededPremium: Math.round((p.annualPremium * (p.riCededPct || 20)) / 100),
      retentionPremium: Math.round((p.annualPremium * (100 - (p.riCededPct || 20))) / 100),
    }));
    const csv = generateRIBordereauxCsv(treatyData);
    downloadFile(csv, `Reinsurance_Bordereaux_${Date.now()}.csv`, "text/csv");
  };

  const handleDownloadBordereauxPdf = () => {
    const html = `
      <div style="font-family: sans-serif; padding: 25px;">
        <h2 style="color: #1E3A8A; text-align: center;">REINSURANCE BORDEREAUX STATEMENT</h2>
        <p style="text-align: center; font-size: 11px; color: #64748B;">Monthly Cession Statement to Reinsurers • Period: 2024</p>
        <hr style="margin: 15px 0;" />
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 12px;">
          <span><strong>Cedant:</strong> SR Insurance Company Ltd</span>
          <span><strong>Lead Reinsurer:</strong> GIC Re (India) / Swiss Re</span>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <thead>
            <tr style="background: #F1F5F9;">
              <th style="padding: 6px; border: 1px solid #CBD5E1; text-align: left;">Policy No</th>
              <th style="padding: 6px; border: 1px solid #CBD5E1; text-align: left;">LOB</th>
              <th style="padding: 6px; border: 1px solid #CBD5E1; text-align: right;">GWP (₹)</th>
              <th style="padding: 6px; border: 1px solid #CBD5E1; text-align: right;">Cession %</th>
              <th style="padding: 6px; border: 1px solid #CBD5E1; text-align: right;">Ceded Premium (₹)</th>
              <th style="padding: 6px; border: 1px solid #CBD5E1; text-align: right;">Net Retained (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${policies.map(p => `
              <tr>
                <td style="padding: 6px; border: 1px solid #E2E8F0;">${p.policyNumber}</td>
                <td style="padding: 6px; border: 1px solid #E2E8F0;">${p.policyType}</td>
                <td style="padding: 6px; border: 1px solid #E2E8F0; text-align: right;">₹${p.annualPremium.toLocaleString()}</td>
                <td style="padding: 6px; border: 1px solid #E2E8F0; text-align: right;">${p.riCededPct}%</td>
                <td style="padding: 6px; border: 1px solid #E2E8F0; text-align: right;">₹${Math.round(p.annualPremium * (p.riCededPct/100)).toLocaleString()}</td>
                <td style="padding: 6px; border: 1px solid #E2E8F0; text-align: right;">₹${Math.round(p.annualPremium * ((100-p.riCededPct)/100)).toLocaleString()}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <div style="margin-top: 25px; text-align: right; font-weight: bold; font-size: 11px;">
          For Reinsurance Accounts • SR Insurance Enterprise
        </div>
      </div>
    `;
    openPrintableDocument("Reinsurance_Bordereaux.pdf", html);
  };

  const pieData = [
    { name: "Net Retained Premium (NWP)", value: netWrittenPremium, color: "#2563EB" },
    { name: "Ceded to GIC Re", value: Math.round(totalCeded * 0.55), color: "#06B6D4" },
    { name: "Ceded to Swiss Re", value: Math.round(totalCeded * 0.25), color: "#8B5CF6" },
    { name: "Ceded to Munich Re", value: Math.round(totalCeded * 0.20), color: "#F59E0B" },
  ];

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Gross Written Premium (GWP)", value: `₹${totalGwp.toLocaleString()}`, color: "#2563EB", sub: "100% Direct Risk" },
          { label: "Total Ceded Premium", value: `₹${totalCeded.toLocaleString()}`, color: "#F59E0B", sub: "21.4% Treaty Cession" },
          { label: "Net Written Premium (NWP)", value: `₹${netWrittenPremium.toLocaleString()}`, color: "#22C55E", sub: "Retained Balance" },
          { label: "Active RI Treaties", value: String(treaties.length), color: "#8B5CF6", sub: "Proportional & XL" },
        ].map(kpi => (
          <div key={kpi.label} className={`${cardCls} p-5`}>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{kpi.label}</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{kpi.value}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Main Split: Treaties Table & Cession Pie */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Treaties Table */}
        <div className={`lg:col-span-2 ${cardCls} p-6 space-y-5`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Reinsurance Treaties Master</h3>
              <p className="text-xs text-slate-500">Configured Proportional & Excess of Loss treaty capacities</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleExportBordereauxCsv}
                className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-bold border transition-all ${
                  dk ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" /> Bordereaux CSV
              </button>

              <button
                onClick={handleDownloadBordereauxPdf}
                className="flex items-center gap-1.5 text-xs px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl shadow-md transition-all"
              >
                <Download className="w-3.5 h-3.5" /> PDF Statement
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {treaties.map(t => (
              <div
                key={t.treatyId}
                className={`p-4 rounded-2xl border transition-all ${
                  dk ? "bg-slate-900/40 border-white/5" : "bg-slate-50 border-slate-200/80"
                } space-y-2`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400">
                      {t.treatyType.replace("_", " ")}
                    </span>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white mt-1">{t.treatyName}</h4>
                    <p className="text-[11px] text-slate-400">Reinsurer: {t.reinsurerName}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-emerald-500">{t.cessionPct}%</span>
                    <div className="text-[10px] text-slate-400">Cession Share</div>
                  </div>
                </div>

                <div className="flex flex-wrap justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-white/5">
                  <span>Capacity Limit: <strong>₹{(t.riLimit / 10000000).toFixed(0)} Cr</strong></span>
                  <span>Term: {t.effectiveFrom} to {t.effectiveTo}</span>
                  <span>Ceded Premium: <strong className="text-slate-900 dark:text-white">₹{(t.totalCededPremium / 100000).toFixed(1)}L</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cession Mix Chart */}
        <div className={`${cardCls} p-6 space-y-4`}>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">GWP vs Cession Breakdown</h3>

          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" strokeWidth={0}>
                {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: dk ? "#0F172A" : "#FFFFFF", borderRadius: 12, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5 text-xs font-semibold">
            {pieData.map(item => (
              <div key={item.name} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                  <span className="text-slate-600 dark:text-slate-300 text-[11px] truncate max-w-[150px]">{item.name}</span>
                </div>
                <span className="text-slate-900 dark:text-white font-bold">₹{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
