import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Layers, 
  Users, 
  Activity, 
  Plus, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileText,
  Lock,
  Database,
  Cpu,
  Server,
  Sliders
} from 'lucide-react';
import { insuranceStore, type ProductModel as Product, type PolicyModel as Policy, type EndorsementModel as Endorsement, type AuditLogModel as AuditLog } from '../services/insuranceStore';

interface AdminPageProps {
  onNavigate?: (page: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'products' | 'underwriting' | 'endorsements' | 'users' | 'system'>('underwriting');
  const [products, setProducts] = useState<Product[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [endorsements, setEndorsements] = useState<Endorsement[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  
  // Product creation/edit modal state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  
  // Notification toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = () => {
    setProducts(insuranceStore.getProducts());
    setPolicies(insuranceStore.getPolicies());
    setEndorsements(insuranceStore.getEndorsements());
    setAuditLogs(insuranceStore.getAuditLogs());
  };

  useEffect(() => {
    loadData();
    const unsub = insuranceStore.subscribe(loadData);
    return unsub;
  }, []);

  // Underwriting referral policies (e.g. Sum Insured >= 25 Lakhs or Pending Approval)
  const referredPolicies = policies.filter(p => p.sumInsured >= 2500000 || p.status === 'UNDERWRITING_REVIEW' || p.status === 'Pending');
  const pendingEndorsements = endorsements.filter(e => e.status === 'PENDING_APPROVAL' || e.status === 'Pending');

  const handleApprovePolicy = (policyId: string | number) => {
    insuranceStore.updatePolicy(policyId, { status: 'Active' });
    insuranceStore.logAudit('POLICY_UNDERWRITING_APPROVED', 'Underwriter approved high sum insured policy ' + policyId, 'ADM-UW-01');
    showToast(`Policy ${policyId} underwriting approved & activated!`);
  };

  const handleRejectPolicy = (policyId: string | number) => {
    insuranceStore.updatePolicy(policyId, { status: 'Cancelled' });
    insuranceStore.logAudit('POLICY_UNDERWRITING_REJECTED', 'Underwriter declined high risk policy ' + policyId, 'ADM-UW-01');
    showToast(`Policy ${policyId} declined by underwriter.`);
  };

  const handleApproveEndorsement = (endorsementId: string | number) => {
    insuranceStore.approveEndorsement(endorsementId, 'EMP-UW-409');
    showToast(`Endorsement ${endorsementId} approved & schedule updated!`);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const prodName = editingProduct?.name || editingProduct?.productName;
    const prodUin = editingProduct?.uin || editingProduct?.irdaiUin;
    const prodCat = editingProduct?.category || editingProduct?.lob;

    if (!prodName || !prodUin || !prodCat) {
      alert('Please fill all required product fields.');
      return;
    }

    const newProd: Product = {
      productId: Number(editingProduct.productId || editingProduct.id) || Date.now(),
      productName: prodName,
      name: prodName,
      lob: prodCat as any,
      category: prodCat,
      irdaiUin: prodUin,
      uin: prodUin,
      description: editingProduct.description || '',
      baseRatePct: Number(editingProduct.baseRatePct || editingProduct.baseRatePerMille) || 2.5,
      baseRatePerMille: Number(editingProduct.baseRatePerMille || editingProduct.baseRatePct) || 2.5,
      minSumInsured: Number(editingProduct.minSumInsured) || 100000,
      maxSumInsured: Number(editingProduct.maxSumInsured) || 5000000,
      gstRatePct: Number(editingProduct.gstRatePct || editingProduct.gstRate) || 18,
      gstRate: Number(editingProduct.gstRate || editingProduct.gstRatePct) || 18,
      irdaApproved: true,
      isActive: true,
      active: true,
      benefits: editingProduct.benefits || editingProduct.coverages || ['Standard Accidental & Total Loss Protection', 'Third Party Liability Under MV Act', 'Section 45 Non-Contestability Coverage'],
      coverages: editingProduct.coverages || editingProduct.benefits || ['Standard Accidental & Total Loss Protection', 'Third Party Liability Under MV Act', 'Section 45 Non-Contestability Coverage'],
    };

    insuranceStore.addProduct(newProd);
    showToast(`Product ${newProd.productName} (${newProd.irdaiUin}) saved successfully.`);
    setShowProductModal(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/50 text-emerald-400 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up backdrop-blur-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2.5 text-xs font-semibold tracking-wider text-indigo-400 uppercase mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Master Administration & Underwriting Authority</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
            Underwriter & Operations Console
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Product catalog governance, high-risk referral queues, endorsement approvals, and operational health metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingProduct({
                name: '',
                uin: 'IRDA/NL-GEN/2026/V' + Math.floor(1000 + Math.random() * 9000),
                category: 'MOTOR_PRIVATE_CAR',
                baseRatePerMille: 2.8,
                minSumInsured: 200000,
                maxSumInsured: 10000000,
                gstRate: 18,
                description: 'Comprehensive risk coverage with IRDAI actuarial filing rate.'
              });
              setShowProductModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Product Master</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-2 overflow-x-auto pb-1">
        {[
          { id: 'underwriting', label: 'Underwriting Queue', count: referredPolicies.length, icon: Sliders },
          { id: 'endorsements', label: 'Endorsement Approvals', count: pendingEndorsements.length, icon: FileText },
          { id: 'products', label: 'Product Catalog Master', count: products.length, icon: Layers },
          { id: 'users', label: 'User RBAC Directory', count: 7, icon: Users },
          { id: 'system', label: 'System & DB Health', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2.5 px-4 py-3 text-sm font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-indigo-500 text-indigo-400 bg-slate-900/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}

      {/* 1. Underwriting Referral Queue */}
      {activeTab === 'underwriting' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Referral Queue Threshold</span>
              <p className="text-2xl font-bold text-white mt-1">₹25,00,000</p>
              <span className="text-xs text-amber-400 flex items-center gap-1 mt-2">
                <AlertTriangle className="w-3.5 h-3.5" /> High Sum Insured & Telematics Mandate
              </span>
            </div>
            <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Pending UW Review</span>
              <p className="text-2xl font-bold text-amber-400 mt-1">{referredPolicies.length} Policies</p>
              <span className="text-xs text-slate-400 mt-2 block">Avg SLA TAT: 1.4 Hours</span>
            </div>
            <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Auto-STP Underwriting Rate</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1">92.4%</p>
              <span className="text-xs text-emerald-400/80 mt-2 block">Straight-Through Processing active</span>
            </div>
          </div>

          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">Policies Requiring Manual Underwriting</h3>
                <p className="text-xs text-slate-400">Section 45 disclosures & risk loading verification</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/60 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Policy #</th>
                    <th className="py-3.5 px-4">Policyholder</th>
                    <th className="py-3.5 px-4">Sum Insured</th>
                    <th className="py-3.5 px-4">Annual Premium</th>
                    <th className="py-3.5 px-4">NCB Applied</th>
                    <th className="py-3.5 px-4">Risk Flag</th>
                    <th className="py-3.5 px-4 text-right">UW Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {referredPolicies.map((pol) => (
                    <tr key={pol.id || pol.policyId} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-4 font-mono font-medium text-indigo-300">{pol.policyNumber}</td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-white">{pol.customerName}</div>
                        <div className="text-xs text-slate-500">{pol.productName}</div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-white">
                        ₹{(pol.sumInsured || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-300">
                        ₹{(pol.grossPremium ?? pol.annualPremium ?? 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-indigo-300 font-mono">
                          {pol.ncbPercentage ?? pol.ncbPct ?? 20}% NCB
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {(pol.sumInsured || 0) >= 2500000 ? (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            High Sum Insured
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                            Pre-Existing Condition
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprovePolicy(pol.id || pol.policyId || '')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => handleRejectPolicy(pol.id || pol.policyId || '')}
                            className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Decline
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {referredPolicies.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        No policies currently pending manual underwriter referral. All within STP thresholds.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. Endorsements Approvals */}
      {activeTab === 'endorsements' && (
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">Pending Endorsement Modification Requests</h3>
              <p className="text-xs text-slate-400">Vehicle registration, Nominee change, and Coverage additions</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
              {pendingEndorsements.length} Action Required
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Endorsement #</th>
                  <th className="py-3.5 px-4">Policy #</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Reason / Changes</th>
                  <th className="py-3.5 px-4">Premium Diff</th>
                  <th className="py-3.5 px-4">Requested At</th>
                  <th className="py-3.5 px-4 text-right">Approval</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {pendingEndorsements.map((end) => {
                  const addlPrem = end.additionalPremium ?? end.premiumAdjustment ?? 0;
                  return (
                    <tr key={end.id || end.endorsementId} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-4 font-mono font-medium text-amber-300">{end.endorsementNumber}</td>
                      <td className="py-4 px-4 font-mono text-indigo-300">{end.policyNumber}</td>
                      <td className="py-4 px-4 font-medium text-white">{(end.type || end.endorsementType || 'General').replace('_', ' ')}</td>
                      <td className="py-4 px-4 text-xs text-slate-300 max-w-xs">{end.reason || end.description}</td>
                      <td className="py-4 px-4 font-mono">
                        {addlPrem > 0 ? (
                          <span className="text-emerald-400">+₹{addlPrem.toLocaleString('en-IN')}</span>
                        ) : (
                          <span className="text-slate-400">₹0 (Non-financial)</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-400">{end.requestedAt || end.createdAt || 'Recent'}</td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleApproveEndorsement(end.id || end.endorsementId || '')}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1 shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Update Schedule
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {pendingEndorsements.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      All endorsements approved and in sync with policy master schedules.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Product Catalog Master */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((prod) => (
              <div key={prod.id || prod.productId} className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between hover:border-slate-700 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {prod.uin || prod.irdaiUin}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> IRDAI Active
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{prod.name || prod.productName}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4">{prod.description}</p>

                  <div className="space-y-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Base Rate:</span>
                      <span className="font-semibold text-slate-200">{prod.baseRatePerMille ?? prod.baseRatePct ?? 2.5}‰ of IDV</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Sum Insured Range:</span>
                      <span className="font-semibold text-slate-200">
                        ₹{((prod.minSumInsured || 100000) / 100000).toFixed(1)}L - ₹{((prod.maxSumInsured || 5000000) / 100000).toFixed(0)}L
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Applicable GST:</span>
                      <span className="font-semibold text-slate-200">{prod.gstRate ?? prod.gstRatePct ?? 18}% Statutory</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">{(prod.coverages || prod.benefits || []).length} Standard Coverages</span>
                  <button
                    onClick={() => {
                      setEditingProduct(prod);
                      setShowProductModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Parameters
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. User RBAC Directory */}
      {activeTab === 'users' && (
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">System User Profiles & RBAC Roles</h3>
              <p className="text-xs text-slate-400">Role-based access matrix per Appendix A</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Assigned Role</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Permissions Scope</th>
                  <th className="py-3.5 px-4">MFA Status</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {[
                  { name: 'Dr. Sarah Connor', role: 'ROLE_ADMIN', email: 'admin@safeguard.in', scope: 'Full System Master & IRDA Reporting', mfa: true },
                  { name: 'Kavita Menon', role: 'ROLE_UNDERWRITER', email: 'underwriter@safeguard.in', scope: 'Risk Referral & Policy Authorizations', mfa: true },
                  { name: 'Arjun Mehta', role: 'ROLE_AGENT', email: 'agent@safeguard.in', scope: 'Lead Pipeline, Quote, POS Issuance', mfa: true },
                  { name: 'Vikram Seth', role: 'ROLE_CLAIMS_HANDLER', email: 'claims@safeguard.in', scope: 'FNOL Triage, Adjudication, Settlement Letters', mfa: true },
                  { name: 'Deepak Varma', role: 'ROLE_SURVEYOR', email: 'surveyor@safeguard.in', scope: 'Field Inspections & Damage Estimations', mfa: true },
                  { name: 'Pooja Hegde', role: 'ROLE_FINANCE_OFFICER', email: 'finance@safeguard.in', scope: 'Reinsurance Bordereaux, Razorpay Payouts', mfa: true },
                  { name: 'Rajesh Sharma', role: 'ROLE_CUSTOMER', email: 'customer@safeguard.in', scope: 'Policyholder Self-Service Portal', mfa: true },
                ].map((usr, i) => (
                  <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-4 font-medium text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">
                        {usr.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span>{usr.name}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-mono text-xs px-2.5 py-1 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                        {usr.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-400">{usr.email}</td>
                    <td className="py-4 px-4 text-xs text-slate-300">{usr.scope}</td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <Lock className="w-3 h-3" /> TOTP Active
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. System & DB Health */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3 text-slate-400 text-xs uppercase font-medium">
                <Server className="w-4 h-4 text-emerald-400" />
                <span>Spring Boot 3.2.0 API</span>
              </div>
              <p className="text-xl font-bold text-white mt-2">HEALTHY</p>
              <span className="text-xs text-emerald-400 mt-1 block">Uptime: 99.98% • Latency: 18ms</span>
            </div>
            <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3 text-slate-400 text-xs uppercase font-medium">
                <Activity className="w-4 h-4 text-amber-400" />
                <span>Audit Trail Security</span>
              </div>
              <p className="text-xl font-bold text-white mt-2">{auditLogs.length} Events</p>
              <span className="text-xs text-amber-400 mt-1 block">SHA-256 Tamper Evident</span>
            </div>
          </div>

          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5">
            <h3 className="font-semibold text-white mb-3">Live System Activity & Audit Trail</h3>
            <div className="space-y-2 font-mono text-xs max-h-80 overflow-y-auto">
              {auditLogs.slice(0, 10).map((log) => (
                <div key={log.id || log.logId} className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-indigo-400">[{log.timestamp}]</span>
                    <span className="text-amber-300 font-semibold">{log.action}</span>
                    <span className="text-slate-300">{log.details || log.description}</span>
                  </div>
                  <span className="text-slate-500 font-sans">{log.performedBy || log.username}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Product Edit / Creation Modal */}
      {showProductModal && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">
                {editingProduct.id ? 'Edit Product Parameters' : 'Register New IRDAI Product Master'}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-slate-400 hover:text-white text-xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Product Commercial Name</label>
                <input
                  type="text"
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="e.g., SafeGuard Private Car Comprehensive"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">IRDAI UIN Code</label>
                  <input
                    type="text"
                    value={editingProduct.uin || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, uin: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={editingProduct.category || 'MOTOR_PRIVATE_CAR'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="MOTOR_PRIVATE_CAR">Motor Private Car</option>
                    <option value="MOTOR_TWO_WHEELER">Motor Two Wheeler</option>
                    <option value="HEALTH_INDIVIDUAL">Health Individual</option>
                    <option value="HEALTH_FAMILY_FLOATER">Health Family Floater</option>
                    <option value="TERM_LIFE">Term Life</option>
                    <option value="HOME_PROPERTY">Home & Property</option>
                    <option value="TRAVEL_INTERNATIONAL">Travel International</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Base Rate (‰)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingProduct.baseRatePerMille || 2.5}
                    onChange={(e) => setEditingProduct({ ...editingProduct, baseRatePerMille: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Min SI (₹)</label>
                  <input
                    type="number"
                    value={editingProduct.minSumInsured || 100000}
                    onChange={(e) => setEditingProduct({ ...editingProduct, minSumInsured: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Max SI (₹)</label>
                  <input
                    type="number"
                    value={editingProduct.maxSumInsured || 5000000}
                    onChange={(e) => setEditingProduct({ ...editingProduct, maxSumInsured: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Product Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors shadow-md"
                >
                  Save Product Master
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
