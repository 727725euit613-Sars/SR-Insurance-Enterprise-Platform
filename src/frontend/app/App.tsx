import { useState, useEffect, useCallback, type ReactNode, type ElementType } from "react";
import {
  Shield, Car, Heart, Home, Plane, Leaf, Briefcase, Anchor, Globe,
  Bell, Settings, BarChart2, FileText, CreditCard, Users,
  ChevronRight, ChevronDown, Star, TrendingUp, AlertCircle,
  CheckCircle, Clock, Download, Search, Plus,
  ArrowRight, Eye, EyeOff, Mail, Lock, Menu, X,
  Award, Activity, RefreshCw, LogOut, UserCheck, MapPin,
  DollarSign, Calendar, MessageSquare,
  Bot, Moon, Sun, ChevronLeft, MoreVertical,
  Edit, Trash2, AlertTriangle, Check,
  LayoutDashboard, FileCheck, Banknote, UserCog,
  BarChart, Key, Building, Building2, Play, Package, Filter, Calculator
} from "lucide-react";
import {
  AreaChart, Area, BarChart as RechartsBar, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import {
  login as apiLogin, register as apiRegister, logout as apiLogout,
  forgotPassword, resetPassword, getStoredUser,
  policiesApi, claimsApi, paymentsApi, customersApi, agentsApi,
  surveyorsApi, analyticsApi, auditApi,
  type AuthResponse, type Policy, type Claim, type Payment,
  type Customer, type Agent, type Surveyor, type DashboardStats, type AuditLog
} from "../services/api";
import { CompliancePage } from "../pages/CompliancePage";
import { ReinsurancePage } from "../pages/ReinsurancePage";
import { QuotePage } from "../pages/QuotePage";
import { MarketplacePage } from "../pages/MarketplacePage";
import { ChatBot } from "../components/ChatBot";
import { PolicyModal } from "../components/modals/PolicyModal";
import { insuranceStore, type ProductModel } from "../services/insuranceStore";

// ─── Types ────────────────────────────────────────────────────────────────────
type Page =
  | "landing" | "login" | "register" | "forgot" | "reset"
  | "dashboard" | "marketplace" | "quote" | "policies" | "claims" | "payments"
  | "reinsurance" | "compliance"
  | "analytics" | "admin" | "agent" | "surveyor" | "profile" | "audit";

type Role = "ADMIN" | "AGENT" | "SURVEYOR" | "CUSTOMER";

// ─── Auth State ───────────────────────────────────────────────────────────────
type AuthState = { user: AuthResponse | null; isAuthenticated: boolean };

function useAuth() {
  const [auth, setAuth] = useState<AuthState>(() => {
    const stored = getStoredUser();
    return { user: stored, isAuthenticated: !!stored };
  });

  useEffect(() => {
    const handler = () => setAuth({ user: null, isAuthenticated: false });
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
  }, []);

  const signIn = useCallback(async (username: string, password: string) => {
    const user = await apiLogin(username, password);
    setAuth({ user, isAuthenticated: true });
    return user;
  }, []);

  const signOut = useCallback(() => {
    apiLogout();
    setAuth({ user: null, isAuthenticated: false });
  }, []);

  const adoptUser = useCallback((user: AuthResponse) => {
    setAuth({ user, isAuthenticated: true });
  }, []);

  return { ...auth, signIn, signOut, adoptUser };
}

// ─── Generic fetch hook ───────────────────────────────────────────────────────
function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { load(); }, [load]);
  return { data, loading, error, reload: load };
}

// ─── Toast ────────────────────────────────────────────────────────────────────
type Toast = { id: number; msg: string; type: "success" | "error" | "info" };
let toastId = 0;
let globalToast: ((t: Omit<Toast, "id">) => void) | null = null;

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  globalToast = useCallback(({ msg, type }: Omit<Toast, "id">) => {
    const id = ++toastId;
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);
  return { toasts };
}

function toast(msg: string, type: Toast["type"] = "success") {
  globalToast?.({ msg, type });
}

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-semibold text-white backdrop-blur-xl border transition-all
          ${t.type === "success" ? "bg-green-600/90 border-green-500/40" : t.type === "error" ? "bg-red-600/90 border-red-500/40" : "bg-blue-600/90 border-blue-500/40"}`}>
          {t.type === "success" ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : t.type === "error" ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <Bell className="w-4 h-4 flex-shrink-0" />}
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ─── UI Primitives ────────────────────────────────────────────────────────────
type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";
const Badge = ({ label, variant }: { label: string; variant: BadgeVariant }) => {
  const map: Record<BadgeVariant, string> = {
    success: "bg-green-500/15 text-green-400 border-green-500/20",
    warning: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    danger: "bg-red-500/15 text-red-400 border-red-500/20",
    info: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    neutral: "bg-slate-500/15 text-slate-400 border-slate-500/20",
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${map[variant]}`}>{label}</span>;
};

function statusVariant(s: string): BadgeVariant {
  const l = s?.toLowerCase() ?? "";
  if (l.includes("active") || l.includes("approved") || l.includes("settled") || l.includes("success") || l.includes("paid")) return "success";
  if (l.includes("pending") || l.includes("review") || l.includes("expir")) return "warning";
  if (l.includes("reject") || l.includes("cancel") || l.includes("expired")) return "danger";
  return "info";
}

const Spinner = () => (
  <div className="flex items-center justify-center py-16">
    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const EmptyState = ({ msg }: { msg: string }) => (
  <div className="flex flex-col items-center justify-center py-16 text-slate-500">
    <Package className="w-12 h-12 mb-3 opacity-30" />
    <p className="text-sm font-semibold">{msg}</p>
  </div>
);

const ErrorState = ({ msg, onRetry }: { msg: string; onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center py-16 text-slate-500">
    <AlertCircle className="w-12 h-12 mb-3 text-red-400 opacity-60" />
    <p className="text-sm font-semibold text-red-400 mb-3">{msg}</p>
    <button onClick={onRetry} className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1">
      <RefreshCw className="w-3 h-3" /> Try again
    </button>
  </div>
);

// Confirm dialog
function ConfirmDialog({ msg, onConfirm, onCancel }: { msg: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-80 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <p className="text-sm text-slate-200 font-semibold">{msg}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2 rounded-xl text-sm font-bold border border-white/10 text-slate-400 hover:text-white">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-500 text-white">Delete</button>
        </div>
      </div>
    </div>
  );
}

// Modal wrapper
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h3 className="font-extrabold text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

const inputCls = "w-full bg-slate-800/60 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors";
const labelCls = "block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5";

// ─── 3D Shield SVG ────────────────────────────────────────────────────────────
const Shield3D = ({ size = 200 }: { size?: number }) => (
  <svg width={size} height={size * 1.1} viewBox="0 0 200 220" fill="none">
    <defs>
      <linearGradient id="sg1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#60A5FA" /><stop offset="50%" stopColor="#2563EB" /><stop offset="100%" stopColor="#1E40AF" />
      </linearGradient>
      <linearGradient id="sg2" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="rgba(255,255,255,0.28)" /><stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </linearGradient>
      <filter id="sfBlur"><feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#2563EB" floodOpacity="0.5" /></filter>
    </defs>
    <ellipse cx="100" cy="214" rx="60" ry="7" fill="rgba(37,99,235,0.2)" />
    <path d="M100 10 L182 47 L182 114 C182 160 142 194 100 212 C58 194 18 160 18 114 L18 47 Z" fill="url(#sg1)" filter="url(#sfBlur)" />
    <path d="M100 10 L182 47 L182 114 C182 145 166 168 146 182 L146 60 Z" fill="rgba(0,0,0,0.12)" />
    <path d="M100 10 L148 32 L148 92 C148 116 130 134 100 148" fill="url(#sg2)" opacity="0.6" />
    <path d="M62 110 L87 135 L140 82" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M52 34 Q76 20 100 22 Q88 40 52 42 Z" fill="rgba(255,255,255,0.18)" />
  </svg>
);

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function getNavGroups(role: Role) {
  const main = [
    { label: "Dashboard", page: "dashboard" as Page, Icon: LayoutDashboard },
    { label: "Insurance Plans", page: "marketplace" as Page, Icon: Package },
    { label: "Instant Quote", page: "quote" as Page, Icon: DollarSign },
    { label: "Policies", page: "policies" as Page, Icon: FileText },
    { label: "Claims Adjudication", page: "claims" as Page, Icon: AlertCircle },
    { label: "Premium & Billing", page: "payments" as Page, Icon: CreditCard },
  ];
  const mgmt = [];
  if (role === "ADMIN" || role === "AGENT") {
    mgmt.push({ label: "Reinsurance Desk", page: "reinsurance" as Page, Icon: Building });
    mgmt.push({ label: "Compliance & IIB", page: "compliance" as Page, Icon: FileCheck });
    mgmt.push({ label: "Customers", page: "admin" as Page, Icon: Users });
    mgmt.push({ label: "Agents", page: "agent" as Page, Icon: UserCheck });
    mgmt.push({ label: "Surveyors", page: "surveyor" as Page, Icon: MapPin });
  }
  if (role === "SURVEYOR") {
    mgmt.push({ label: "Surveyor Portal", page: "surveyor" as Page, Icon: MapPin });
  }
  const insights = [
    { label: "Analytics & KPI", page: "analytics" as Page, Icon: BarChart2 },
  ];
  if (role === "ADMIN") insights.push({ label: "Audit Logs", page: "audit" as Page, Icon: Activity });
  const account = [{ label: "Profile", page: "profile" as Page, Icon: Settings }];
  return [
    { title: "Main", items: main },
    ...(mgmt.length ? [{ title: "Enterprise Mgmt", items: mgmt }] : []),
    { title: "Statutory & Quality", items: insights },
    { title: "Account", items: account },
  ];
}

const Sidebar = ({ currentPage, onNavigate, onLogout, collapsed, setCollapsed, user }: {
  currentPage: Page; onNavigate: (p: Page) => void; onLogout: () => void;
  collapsed: boolean; setCollapsed: (v: boolean) => void; user: AuthResponse;
}) => {
  const groups = getNavGroups(user.role as Role);
  const initials = user.username.slice(0, 2).toUpperCase();

  const roleLabelMap: Record<string, { label: string; bg: string; text: string; border: string }> = {
    ADMIN: { label: "ADMINISTRATOR", bg: "bg-purple-950/60", text: "text-purple-300", border: "border-purple-500/30" },
    AGENT: { label: "LICENSED AGENT", bg: "bg-amber-950/60", text: "text-amber-300", border: "border-amber-500/30" },
    SURVEYOR: { label: "IRDAI SURVEYOR", bg: "bg-cyan-950/60", text: "text-cyan-300", border: "border-cyan-500/30" },
    CUSTOMER: { label: "POLICYHOLDER", bg: "bg-blue-950/60", text: "text-blue-300", border: "border-blue-500/30" },
  };
  const roleStyle = roleLabelMap[user.role.toUpperCase()] || roleLabelMap.CUSTOMER;

  return (
    <aside className={`flex flex-col bg-[#0B132B] border-r border-slate-800 transition-all duration-300 ${collapsed ? "w-16" : "w-64"} flex-shrink-0 h-screen sticky top-0 z-20`}>
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-800">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-600/30">
          <Shield className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-white tracking-tight leading-none">SR Insurance</div>
            <div className="text-[10px] font-medium text-slate-400 leading-none mt-1">IRDAI Reg. 142/2023</div>
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="ml-auto text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors flex-shrink-0"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Role Pill */}
      {!collapsed && (
        <div className="px-4 py-2.5 bg-[#090F21] border-b border-slate-800/80">
          <div className={`text-[10px] font-bold px-2.5 py-1 rounded border flex items-center justify-between ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}>
            <span>PORTAL:</span>
            <span className="tracking-wider">{roleStyle.label}</span>
          </div>
        </div>
      )}

      {/* Navigation Groups */}
      <nav className="flex-1 px-2.5 py-4 overflow-y-auto space-y-5 scrollbar-none">
        {groups.map(group => (
          <div key={group.title}>
            {!collapsed && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">{group.title}</p>}
            <div className="space-y-1">
              {group.items.map(({ label, page, Icon }) => {
                const active = currentPage === page;
                return (
                  <button key={page} onClick={() => onNavigate(page)} title={collapsed ? label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 text-xs font-semibold ${
                      active 
                        ? "bg-blue-600 text-white shadow-sm" 
                        : "text-slate-300 hover:text-white hover:bg-slate-800/70"
                    } ${collapsed ? "justify-center" : ""}`}>
                    <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-white" : "text-slate-400"}`} />
                    {!collapsed && <span>{label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="px-3 py-3 border-t border-slate-800 bg-[#090F21]">
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center flex-shrink-0 border border-blue-500/40">
            <span className="text-xs font-bold text-white">{initials}</span>
          </div>
          {!collapsed && <>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user.username}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.role}</p>
            </div>
            <button 
              onClick={onLogout} 
              className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>}
        </div>
      </div>
    </aside>
  );
};

// ─── TopBar ───────────────────────────────────────────────────────────────────
const TopBar = ({
  title,
  subtitle,
  darkMode,
  setDarkMode,
  onNavigate,
  user
}: {
  title: string;
  subtitle?: string;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  onNavigate?: (p: Page) => void;
  user?: AuthResponse;
}) => {
  const [selectedLob, setSelectedLob] = useState("All LOB");
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, text: "FNOL CLM-202401-002847 pending surveyor inspection", time: "10m ago" },
    { id: 2, text: "Policy POL-MTR-202401-001892 renewal reminder dispatched", time: "1h ago" },
    { id: 3, text: "Statutory IIB Monthly XML export ready for compliance", time: "3h ago" },
  ];

  return (
    <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B] sticky top-0 z-10 flex-wrap gap-3">
      <div>
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 mb-0.5">
          <span>SR Insurance</span>
          <span>/</span>
          <span className="text-blue-600 dark:text-blue-400 font-semibold">{title}</span>
        </div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Product line selector per Appendix I.2 */}
        <select
          value={selectedLob}
          onChange={e => setSelectedLob(e.target.value)}
          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none"
        >
          <option value="All LOB">All Lines of Business</option>
          <option value="Motor">Motor (OD + TP)</option>
          <option value="Health">Health &amp; Mediclaim</option>
          <option value="Life">Life &amp; Term Cover</option>
          <option value="Property">Property &amp; Fire</option>
          <option value="Commercial">Commercial Floater</option>
        </select>

        {/* Claim TAT breach alert badge (Appendix I.2) */}
        <button
          onClick={() => onNavigate && onNavigate("claims")}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
          title="IRDAI Claim Decision TAT Monitor"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>TAT: 1 Near Breach</span>
        </button>

        {/* Renewal due count badge */}
        <button
          onClick={() => onNavigate && onNavigate("policies")}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
          title="Policies Due for Renewal"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>2 Renewals</span>
        </button>

        {/* Agent wallet balance if agent */}
        {user?.role === "AGENT" && (
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <Banknote className="w-3.5 h-3.5" />
            <span>Wallet: ₹42,500</span>
          </div>
        )}

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500"></span>
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 p-3 rounded-xl border shadow-xl z-50 bg-white dark:bg-[#101A33] border-slate-200 dark:border-slate-700 text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 font-bold">
                <span className="text-slate-900 dark:text-white">Statutory Notifications</span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">3 New</span>
              </div>
              <div className="space-y-1.5">
                {notifications.map(n => (
                  <div key={n.id} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 space-y-1">
                    <p className="text-slate-800 dark:text-slate-200 text-[11px] leading-snug">{n.text}</p>
                    <span className="text-[10px] text-slate-400">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dark/Light mode toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title="Toggle Dark/Light Mode"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

const cardCls = (dk: boolean) => `rounded-xl border transition-all duration-200 ${dk ? "bg-[#101A33] border-slate-700/70 shadow-sm text-slate-100" : "bg-white border-slate-200 shadow-sm text-slate-900"}`;

// ─── Landing Page ─────────────────────────────────────────────────────────────
const insTypes = [
  { label: "Motor", Icon: Car, color: "#2563EB", grad: "from-blue-600 to-blue-900" },
  { label: "Health", Icon: Heart, color: "#22C55E", grad: "from-green-500 to-emerald-800" },
  { label: "Life", Icon: Shield, color: "#8B5CF6", grad: "from-violet-500 to-violet-900" },
  { label: "Property", Icon: Home, color: "#F59E0B", grad: "from-amber-500 to-amber-900" },
  { label: "Travel", Icon: Plane, color: "#06B6D4", grad: "from-cyan-500 to-cyan-900" },
  { label: "Crop", Icon: Leaf, color: "#84CC16", grad: "from-lime-500 to-lime-900" },
  { label: "Business", Icon: Briefcase, color: "#4F46E5", grad: "from-indigo-500 to-indigo-900" },
  { label: "Marine", Icon: Anchor, color: "#14B8A6", grad: "from-teal-500 to-teal-900" },
  { label: "Cyber", Icon: Globe, color: "#EF4444", grad: "from-red-500 to-red-900" },
];

const LandingPage = ({ onLogin, onRegister, darkMode, setDarkMode }: { onLogin: () => void; onRegister: () => void; darkMode: boolean; setDarkMode: (v: boolean) => void }) => (
  <div className="min-h-screen bg-[#070C18] text-white overflow-x-hidden">
    <nav className="sticky top-0 z-50 border-b border-white/[0.04] bg-[#070C18]/90 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-700/40"><Shield className="w-5 h-5 text-white" /></div>
          <div><div className="text-base font-extrabold text-white leading-none">SR Insurance</div><div className="text-[10px] text-blue-400 leading-none mt-0.5">Enterprise Platform</div></div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg text-slate-500 hover:text-white transition-colors">{darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</button>
          <button onClick={onLogin} className="text-sm text-slate-300 hover:text-white px-4 py-2 font-semibold transition-colors">Login</button>
          <button onClick={onRegister} className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all hover:shadow-xl hover:shadow-blue-700/30">Get Started</button>
        </div>
      </div>
    </nav>
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#070C18] via-blue-950/25 to-[#070C18]" />
      <div className="absolute top-1/3 right-1/3 w-[500px] h-[500px] bg-blue-700/15 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-8">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-sm text-blue-300 font-semibold">India's #1 AI-Powered InsurTech Platform</span>
          </div>
          <h1 className="text-5xl md:text-[64px] font-extrabold leading-[1.08] text-white mb-6 tracking-tight">
            Protecting Every<br /><span className="bg-gradient-to-r from-blue-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">Journey,</span><br />Every Life.
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed mb-10 max-w-lg">Enterprise-grade insurance management powered by AI. Instant quotes, seamless claims, and real-time analytics — all unified.</p>
          <div className="flex items-center gap-4 flex-wrap">
            <button onClick={onLogin} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-base transition-all hover:shadow-2xl hover:shadow-blue-700/40 hover:-translate-y-0.5">Start Free Trial <ArrowRight className="w-5 h-5" /></button>
            <button onClick={onRegister} className="flex items-center gap-2 border border-white/10 hover:border-white/20 text-white px-8 py-4 rounded-2xl font-bold text-base transition-all hover:bg-white/[0.03]"><Play className="w-5 h-5" /> Register Now</button>
          </div>
        </div>
        <div className="relative flex items-center justify-center min-h-[400px]">
          <div style={{ animation: "float 6s ease-in-out infinite" }}><Shield3D size={260} /></div>
        </div>
      </div>
    </section>
    <section className="py-24 max-w-7xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-extrabold text-white mb-4">9 Insurance Categories, One Platform</h2>
        <p className="text-slate-400 max-w-xl mx-auto">Comprehensive coverage for every need.</p>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
        {insTypes.map(({ label, Icon: I, grad }) => (
          <button key={label} onClick={onLogin} className="group flex flex-col items-center gap-3 bg-white/[0.025] hover:bg-white/[0.055] border border-white/[0.05] hover:border-white/[0.12] rounded-[20px] p-6 transition-all duration-300 hover:-translate-y-1.5">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}><I className="w-7 h-7 text-white" /></div>
            <span className="text-sm font-bold text-slate-300">{label}</span>
          </button>
        ))}
      </div>
    </section>
    <footer className="border-t border-white/[0.04] py-8 px-6 text-center text-slate-600 text-xs">
      © 2024 SR Insurance Pvt. Ltd. All rights reserved. | IRDAI Registered
    </footer>
  </div>
);

// ─── Auth Page (Login / Register / Forgot / Reset) ────────────────────────────
const AuthPage = ({ mode, onSuccess, onBack, onSwitchMode }: {
  mode: "login" | "register" | "forgot" | "reset";
  onSuccess: (user?: AuthResponse) => void;
  onBack: () => void;
  onSwitchMode: (m: "login" | "register" | "forgot" | "reset") => void;
}) => {
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "", token: "", newPassword: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleLogin = async () => {
    if (!form.username || !form.password) { setError("Username and password are required"); return; }
    setSubmitting(true); setError(null);
    try {
      const user = await apiLogin(form.username, form.password);
      onSuccess(user);
    } catch (e) { setError(e instanceof Error ? e.message : "Login failed"); }
    finally { setSubmitting(false); }
  };

  const handleRegister = async () => {
    if (!form.username || !form.email || !form.password) { setError("All fields are required"); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) { setError("Password must contain uppercase, lowercase, and a digit"); return; }
    setSubmitting(true); setError(null);
    try {
      await apiRegister({ username: form.username, email: form.email, password: form.password });
      setInfo("Registration successful! Please log in.");
      setTimeout(() => onSwitchMode("login"), 1500);
    } catch (e) { setError(e instanceof Error ? e.message : "Registration failed"); }
    finally { setSubmitting(false); }
  };

  const handleForgot = async () => {
    if (!form.email) { setError("Email is required"); return; }
    setSubmitting(true); setError(null);
    try {
      const res = await forgotPassword(form.email);
      setInfo(res.message + " (Check server logs for dev token)");
    } catch (e) { setError(e instanceof Error ? e.message : "Request failed"); }
    finally { setSubmitting(false); }
  };

  const handleReset = async () => {
    if (!form.token || !form.newPassword) { setError("Token and new password are required"); return; }
    if (form.newPassword !== form.confirm) { setError("Passwords do not match"); return; }
    setSubmitting(true); setError(null);
    try {
      await resetPassword(form.token, form.newPassword);
      setInfo("Password reset successfully!");
      setTimeout(() => onSwitchMode("login"), 1500);
    } catch (e) { setError(e instanceof Error ? e.message : "Reset failed"); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen flex bg-[#070C18] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#070C18] via-blue-950/20 to-[#070C18]" />
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-blue-700/15 rounded-full blur-3xl" />
      <div className="hidden md:flex flex-1 relative z-10 flex-col items-center justify-center p-16">
        <div style={{ animation: "float 6s ease-in-out infinite" }}><Shield3D size={210} /></div>
        <h2 className="text-3xl font-extrabold text-white mt-8 text-center leading-tight">The Smart Way to<br />Manage Insurance</h2>
        <p className="text-slate-400 text-center mt-4 max-w-xs leading-relaxed text-sm">AI-powered platform for instant policies, seamless claims, and real-time portfolio management.</p>
      </div>
      <div className="relative z-10 flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-[420px]">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-8 font-medium"><ChevronLeft className="w-4 h-4" /> Back to Home</button>
          <div className="bg-slate-900/85 backdrop-blur-2xl border border-white/10 rounded-[24px] p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-7">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-700/40"><Shield className="w-5 h-5 text-white" /></div>
              <div><div className="font-extrabold text-white">SR Insurance</div><div className="text-xs text-blue-400">Secure Portal</div></div>
            </div>

            {(mode === "login" || mode === "register") && (
              <div className="flex bg-slate-800/60 rounded-xl p-1 mb-7">
                {(["login", "register"] as const).map(t => (
                  <button key={t} onClick={() => onSwitchMode(t)} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === t ? "bg-blue-600 text-white shadow-lg shadow-blue-700/30" : "text-slate-400 hover:text-white"}`}>
                    {t === "login" ? "Sign In" : "Register"}
                  </button>
                ))}
              </div>
            )}

            {mode === "login" && (
              <div className="space-y-4">
                <div><h2 className="text-2xl font-extrabold text-white">Welcome back</h2><p className="text-sm text-slate-400 mt-0.5">Sign in to your SR Insurance account</p></div>
                <div className="relative"><Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" /><input value={form.username} onChange={set("username")} type="text" placeholder="Username" className={`${inputCls} pl-11`} onKeyDown={e => e.key === "Enter" && handleLogin()} /></div>
                <div className="relative"><Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" /><input value={form.password} onChange={set("password")} type={showPw ? "text" : "password"} placeholder="Password" className={`${inputCls} pl-11 pr-12`} onKeyDown={e => e.key === "Enter" && handleLogin()} /><button onClick={() => setShowPw(!showPw)} className="absolute right-4 top-3.5 text-slate-500 hover:text-white">{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div>
                <div className="flex justify-end"><button onClick={() => onSwitchMode("forgot")} className="text-blue-400 hover:text-blue-300 text-xs font-semibold">Forgot password?</button></div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                {info && <p className="text-sm text-green-400">{info}</p>}
                <button onClick={handleLogin} disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold text-sm transition-all">{submitting ? "Signing in…" : "Sign In to Dashboard"}</button>
                <div className="text-center text-xs text-slate-600 mt-2">Demo: admin / Admin@1234 | agent1 / Agent@1234 | customer1 / Customer@1234</div>
              </div>
            )}

            {mode === "register" && (
              <div className="space-y-4">
                <div><h2 className="text-2xl font-extrabold text-white">Create Account</h2><p className="text-sm text-slate-400 mt-0.5">Start protecting what matters most</p></div>
                <input value={form.username} onChange={set("username")} placeholder="Username" className={inputCls} />
                <div className="relative"><Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" /><input value={form.email} onChange={set("email")} type="email" placeholder="Email Address" className={`${inputCls} pl-11`} /></div>
                <div className="relative"><Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" /><input value={form.password} onChange={set("password")} type={showPw ? "text" : "password"} placeholder="Password (min 8, upper+lower+digit)" className={`${inputCls} pl-11 pr-12`} /><button onClick={() => setShowPw(!showPw)} className="absolute right-4 top-3.5 text-slate-500 hover:text-white">{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div>
                <input value={form.confirm} onChange={set("confirm")} type="password" placeholder="Confirm Password" className={inputCls} />
                {error && <p className="text-sm text-red-400">{error}</p>}
                {info && <p className="text-sm text-green-400">{info}</p>}
                <button onClick={handleRegister} disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold text-sm transition-all">{submitting ? "Creating…" : "Create Account"}</button>
              </div>
            )}

            {mode === "forgot" && (
              <div className="space-y-5">
                <button onClick={() => onSwitchMode("login")} className="flex items-center gap-1 text-sm text-slate-400 hover:text-white font-medium"><ChevronLeft className="w-4 h-4" /> Back</button>
                <div><h2 className="text-2xl font-extrabold text-white">Reset Password</h2><p className="text-sm text-slate-400 mt-1">Enter your registered email to receive a reset token.</p></div>
                <div className="relative"><Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" /><input value={form.email} onChange={set("email")} type="email" placeholder="Email Address" className={`${inputCls} pl-11`} /></div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                {info && <p className="text-sm text-green-400">{info}</p>}
                <button onClick={handleForgot} disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold text-sm transition-all">{submitting ? "Sending…" : "Send Reset Token"}</button>
                <button onClick={() => onSwitchMode("reset")} className="w-full text-center text-xs text-blue-400 hover:text-blue-300 font-semibold">I already have a token →</button>
              </div>
            )}

            {mode === "reset" && (
              <div className="space-y-5">
                <button onClick={() => onSwitchMode("forgot")} className="flex items-center gap-1 text-sm text-slate-400 hover:text-white font-medium"><ChevronLeft className="w-4 h-4" /> Back</button>
                <div><h2 className="text-2xl font-extrabold text-white">New Password</h2><p className="text-sm text-slate-400 mt-1">Enter the token from server logs and your new password.</p></div>
                <input value={form.token} onChange={set("token")} placeholder="Reset Token" className={inputCls} />
                <input value={form.newPassword} onChange={set("newPassword")} type="password" placeholder="New Password" className={inputCls} />
                <input value={form.confirm} onChange={set("confirm")} type="password" placeholder="Confirm New Password" className={inputCls} />
                {error && <p className="text-sm text-red-400">{error}</p>}
                {info && <p className="text-sm text-green-400">{info}</p>}
                <button onClick={handleReset} disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold text-sm transition-all">{submitting ? "Resetting…" : "Reset Password"}</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
const DashboardPage = ({ 
  darkMode, 
  setDarkMode, 
  role,
  onNavigate,
  onApplyPolicy,
  user
}: { 
  darkMode: boolean; 
  setDarkMode: (v: boolean) => void; 
  role: string;
  onNavigate?: (p: Page) => void;
  onApplyPolicy?: () => void;
  user?: AuthResponse;
}) => {
  const dk = darkMode;
  const { data: stats, loading, error, reload } = useApi(() => analyticsApi.dashboard());
  const { data: payData } = useApi(() => analyticsApi.payments());
  const { data: policies } = useApi(() => policiesApi.getAll());
  const { data: claims } = useApi(() => claimsApi.getAll());

  const monthly: { month: number; amount: number }[] = (payData as any)?.monthlyRevenue ?? [];
  const chartData = monthly.map(m => ({
    month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m.month - 1] ?? m.month,
    amount: m.amount,
  }));

  const formatRupees = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} Lakhs`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
    return `₹${val.toLocaleString()}`;
  };

  const statCards = stats ? [
    { title: "Total Policies", value: (stats.activePolicies + stats.expiredPolicies) || stats.activePolicies, badge: "Portfolios", Icon: FileText, color: "#2563EB" },
    { title: "Active In-Force", value: stats.activePolicies, badge: "● Live", Icon: Shield, color: "#22C55E" },
    { title: "Total Claims", value: stats.totalClaims, badge: "Reported", Icon: AlertCircle, color: "#3B82F6" },
    { title: "Pending Adjudication", value: stats.pendingClaims, badge: "● TAT Watch", Icon: Clock, color: "#F59E0B" },
    { title: "Premium Collected", value: formatRupees(stats.totalPremiumCollected || 0), badge: "Statutory GWP", Icon: DollarSign, color: "#10B981" },
    { title: "Payments Received", value: formatRupees(stats.totalPaymentsReceived || 0), badge: "Direct Cleared", Icon: CreditCard, color: "#6366F1" },
    { title: "Settlement Ratio", value: "98.4%", badge: "IRDAI Bench >95%", Icon: Award, color: "#06B6D4" },
    { title: "Solvency Margin", value: "1.85x", badge: "Min Req: 1.50x", Icon: Building2, color: "#8B5CF6" },
  ] : [];

  const recentPolicies = (policies || []).slice(0, 4);
  const recentClaims = (claims || []).slice(0, 4);

  return (
    <div className={`min-h-screen ${dk ? "bg-[#0A0F1E] text-white" : "bg-slate-50 text-slate-900"}`}>
      <TopBar 
        title="Operations Dashboard" 
        subtitle={`Enterprise Monitoring Console • Role: ${role}`} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode}
        onNavigate={onNavigate}
        user={user}
      />

      <div className="p-6 space-y-6">
        {/* Quick Actions Bar */}
        <div className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
          dk ? "bg-[#101A33] border-slate-700/70 shadow-sm" : "bg-white border-slate-200 shadow-sm"
        }`}>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-500">Quick Operations</span>
            <p className="text-xs text-slate-500 dark:text-slate-400">Directly execute core policyholder and claims workflows</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onApplyPolicy ? onApplyPolicy() : (onNavigate && onNavigate("marketplace"))}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Apply for Policy</span>
            </button>
            <button
              onClick={() => onNavigate && onNavigate("claims")}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all"
            >
              <AlertCircle className="w-3.5 h-3.5 text-red-500" />
              <span>File Claim (FNOL)</span>
            </button>
            <button
              onClick={() => onNavigate && onNavigate("payments")}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all"
            >
              <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
              <span>Pay Premium</span>
            </button>
            <button
              onClick={() => onNavigate && onNavigate("quote")}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all"
            >
              <Calculator className="w-3.5 h-3.5 text-blue-500" />
              <span>Instant Quote</span>
            </button>
          </div>
        </div>

        {loading && <Spinner />}
        {error && <ErrorState msg={error} onRetry={reload} />}

        {!loading && !error && stats && (
          <>
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statCards.map(card => (
                <div key={card.title} className={`${cardCls(dk)} p-4 hover:border-blue-500/40 transition-all duration-200`}>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{card.title}</span>
                    <div className="p-2 rounded-lg flex-shrink-0" style={{ background: `${card.color}18` }}>
                      <card.Icon className="w-4 h-4" style={{ color: card.color }} />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <p className={`text-xl lg:text-2xl font-bold tracking-tight font-mono ${dk ? "text-white" : "text-slate-900"}`}>{card.value}</p>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {card.badge}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Monthly Payment Revenue Chart */}
            <div className={`${cardCls(dk)} p-6`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className={`text-sm font-bold uppercase tracking-wider ${dk ? "text-white" : "text-slate-900"}`}>
                    Monthly Premium Collections (₹ GWP)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Reconciled statutory collections across all registered Indian lines of business</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  Fiscal Year 2024-25
                </span>
              </div>

              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={230}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#2563EB" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={dk ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"} />
                    <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis 
                      tick={{ fill: "#64748B", fontSize: 11 }} 
                      axisLine={false} 
                      tickLine={false} 
                      tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`}
                    />
                    <Tooltip 
                      formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, "Gross Premium"]}
                      contentStyle={{ 
                        background: dk ? "#101A33" : "#ffffff", 
                        border: dk ? "1px solid rgba(255,255,255,0.12)" : "1px solid #e2e8f0", 
                        borderRadius: 10, 
                        fontSize: 12,
                        color: dk ? "#f8fafc" : "#0f172a"
                      }} 
                    />
                    <Area type="monotone" dataKey="amount" stroke="#2563EB" strokeWidth={2.5} fill="url(#g1)" name="Revenue (₹)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <EmptyState msg="No payment data yet" />}
            </div>

            {/* Claims & Policies Recent Management Summary */}
            <div className="grid lg:grid-cols-2 gap-5">
              {/* Recent Policies Table */}
              <div className={`${cardCls(dk)} p-5 space-y-3`}>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Recent Policies Schedule</h4>
                  </div>
                  <button 
                    onClick={() => onNavigate && onNavigate("policies")}
                    className="text-xs font-semibold text-blue-500 hover:text-blue-400 flex items-center gap-1"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {recentPolicies.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">No policies issued yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-800">
                          <th className="pb-2 font-semibold">Policy No</th>
                          <th className="pb-2 font-semibold">Plan Name</th>
                          <th className="pb-2 font-semibold">Premium</th>
                          <th className="pb-2 font-semibold text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                        {recentPolicies.map((p) => (
                          <tr key={p.policyId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="py-2 font-mono text-slate-400">{p.policyNumber || `POL-${p.policyId}`}</td>
                            <td className="py-2 text-slate-900 dark:text-white truncate max-w-[140px]">{p.policyName}</td>
                            <td className="py-2 font-mono font-semibold text-slate-900 dark:text-white">₹{(p.premiumAmount ?? 0).toLocaleString()}</td>
                            <td className="py-2 text-right">
                              <Badge label={p.policyStatus || "Active"} variant={statusVariant(p.policyStatus)} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Recent Claims Table */}
              <div className={`${cardCls(dk)} p-5 space-y-3`}>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Recent Claims Adjudication</h4>
                  </div>
                  <button 
                    onClick={() => onNavigate && onNavigate("claims")}
                    className="text-xs font-semibold text-blue-500 hover:text-blue-400 flex items-center gap-1"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {recentClaims.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">No claims registered yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-800">
                          <th className="pb-2 font-semibold">Claim No</th>
                          <th className="pb-2 font-semibold">Incident Details</th>
                          <th className="pb-2 font-semibold">Amount</th>
                          <th className="pb-2 font-semibold text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                        {recentClaims.map((c) => (
                          <tr key={c.claimId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="py-2 font-mono text-slate-400">{c.claimNumber || `CLM-${c.claimId}`}</td>
                            <td className="py-2 text-slate-900 dark:text-white truncate max-w-[140px]">{c.description || "Damage claim"}</td>
                            <td className="py-2 font-mono font-semibold text-slate-900 dark:text-white">₹{(c.claimAmount ?? 0).toLocaleString()}</td>
                            <td className="py-2 text-right">
                              <Badge label={c.claimStatus || "Pending"} variant={statusVariant(c.claimStatus)} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Statutory Solvency & TAT Summary Badges */}
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { label: "Approved Settled Claims", value: stats.approvedClaims, color: "#10B981", desc: "TAT compliant settlements" },
                { label: "Surveyor Investigated", value: stats.rejectedClaims + stats.approvedClaims, color: "#3B82F6", desc: "IRDAI Surveyor verified" },
                { label: "Renewals Expiring Soon", value: stats.expiredPolicies, color: "#F59E0B", desc: "30-day grace period" },
              ].map(s => (
                <div key={s.label} className={`${cardCls(dk)} p-4 flex items-center justify-between`}>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold mb-0.5">{s.label}</p>
                    <p className="text-xs text-slate-400">{s.desc}</p>
                  </div>
                  <p className="text-2xl font-bold font-mono" style={{ color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Policies Page ────────────────────────────────────────────────────────────
const PoliciesPage = ({ 
  darkMode, 
  setDarkMode, 
  role,
  onApplyPolicy 
}: { 
  darkMode: boolean; 
  setDarkMode: (v: boolean) => void; 
  role: string;
  onApplyPolicy?: () => void;
}) => {
  const dk = darkMode;
  const { data: policies, loading, error, reload } = useApi(() => policiesApi.getAll());
  const { data: customers } = useApi(() => customersApi.getAll());
  const { data: agents } = useApi(() => agentsApi.getAll());
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Policy | null>(null);
  const [confirm, setConfirm] = useState<number | null>(null);
  const [form, setForm] = useState({ policyName: "", policyType: "Motor", premiumAmount: "", duration: "12", policyStatus: "Active", startDate: "", endDate: "", coverageAmount: "", customerId: "", agentId: "" });

  const currentUser = getStoredUser();
  const isCustomer = role === "CUSTOMER";
  const [viewMode, setViewMode] = useState<"my" | "all">(isCustomer ? "my" : "all");

  // Keep page updated whenever any policy is issued
  useEffect(() => {
    const handleUpdate = () => { reload(); };
    window.addEventListener("policy:created", handleUpdate);
    window.addEventListener("policies:updated", handleUpdate);
    return () => {
      window.removeEventListener("policy:created", handleUpdate);
      window.removeEventListener("policies:updated", handleUpdate);
    };
  }, [reload]);

  const canEdit = role === "ADMIN" || role === "AGENT";

  const isUserPolicy = (p: Policy) => {
    if (!currentUser) return false;
    const uid = String(currentUser.userId).toLowerCase();
    const cCode = String(currentUser.customerCode || currentUser.username).toLowerCase();
    const uName = currentUser.username.toLowerCase();
    const uEmail = currentUser.email?.toLowerCase();

    const pCustId = p.customerId != null ? String(p.customerId).toLowerCase() : "";
    const pCustObjId = p.customer?.customerId != null ? String(p.customer.customerId).toLowerCase() : "";
    const pCustCode = p.customerCode ? p.customerCode.toLowerCase() : "";
    const pCustObjCode = p.customer?.customerCode ? p.customer.customerCode.toLowerCase() : "";
    const pCustName = p.customer?.name ? p.customer.name.toLowerCase() : "";
    const pCustEmail = p.customer?.email ? p.customer.email.toLowerCase() : "";

    return (
      (pCustId && (pCustId === uid || pCustId === cCode)) ||
      (pCustObjId && (pCustObjId === uid || pCustObjId === cCode)) ||
      (pCustCode && (pCustCode === cCode || pCustCode === uid)) ||
      (pCustObjCode && (pCustObjCode === cCode || pCustObjCode === uid)) ||
      (pCustName && (pCustName === uName || pCustName === cCode)) ||
      (uEmail && pCustEmail && pCustEmail === uEmail)
    );
  };

  const userPoliciesCount = (policies ?? []).filter(isUserPolicy).length;

  const filtered = (policies ?? []).filter(p => {
    if (isCustomer && viewMode === "my" && !isUserPolicy(p)) {
      return false;
    }
    const matchSearch = !search || p.policyName?.toLowerCase().includes(search.toLowerCase()) || p.policyNumber?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || p.policyStatus === filterStatus;
    return matchSearch && matchStatus;
  });

  const openCreate = () => { 
    setForm({ 
      policyName: "", 
      policyType: "Motor", 
      premiumAmount: "", 
      duration: "12", 
      policyStatus: "Active", 
      startDate: new Date().toISOString().split("T")[0], 
      endDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split("T")[0], 
      coverageAmount: "", 
      customerId: isCustomer && currentUser ? String(currentUser.userId) : "", 
      agentId: "" 
    }); 
    setEditing(null); 
    setModal("create"); 
  };
  const openEdit = (p: Policy) => { setEditing(p); setForm({ policyName: p.policyName, policyType: p.policyType, premiumAmount: String(p.premiumAmount), duration: String(p.duration), policyStatus: p.policyStatus, startDate: p.startDate ?? "", endDate: p.endDate ?? "", coverageAmount: String(p.coverageAmount ?? ""), customerId: String(p.customer?.customerId ?? ""), agentId: String(p.agent?.agentId ?? "") }); setModal("edit"); };

  const handleSave = async () => {
    try {
      const custId = form.customerId ? Number(form.customerId) : (isCustomer && currentUser ? currentUser.userId : undefined);
      const payload = { 
        policyName: form.policyName, 
        policyType: form.policyType, 
        premiumAmount: Number(form.premiumAmount), 
        duration: Number(form.duration), 
        policyStatus: form.policyStatus, 
        startDate: form.startDate || undefined, 
        endDate: form.endDate || undefined, 
        coverageAmount: form.coverageAmount ? Number(form.coverageAmount) : undefined, 
        customerId: custId, 
        customerCode: currentUser?.customerCode || currentUser?.username,
        agentId: form.agentId ? Number(form.agentId) : undefined 
      };
      if (modal === "edit" && editing) { await policiesApi.update(editing.policyId, payload); toast("Policy updated"); }
      else { await policiesApi.create(payload); toast("Policy created successfully"); }
      setModal(null); 
      reload();
      window.dispatchEvent(new Event("policies:updated"));
    } catch (e) { toast(e instanceof Error ? e.message : "Save failed", "error"); }
  };

  const handleDelete = async (id: number) => {
    try { await policiesApi.delete(id); toast("Policy deleted"); reload(); window.dispatchEvent(new Event("policies:updated")); } catch (e) { toast(e instanceof Error ? e.message : "Delete failed", "error"); }
    setConfirm(null);
  };

  const policyTypes = ["Motor", "Health", "Life", "Property", "Travel", "Crop", "Business", "Marine", "Cyber"];

  return (
    <div className={`min-h-screen ${dk ? "bg-[#0A0F1E] text-white" : "bg-slate-50 text-slate-900"}`}>
      <TopBar title="Policy Management" subtitle={isCustomer ? `Active Policies for ${currentUser?.username || "Customer"} (${currentUser?.customerCode || `ID: ${currentUser?.userId}`})` : "Manage all insurance policies"} darkMode={darkMode} setDarkMode={setDarkMode} />
      <div className="p-6 space-y-5">
        <div className={`flex flex-wrap items-center gap-3 p-4 rounded-[20px] border ${dk ? "bg-slate-800/55 border-white/[0.07]" : "bg-white border-slate-100 shadow-sm"}`}>
          <div className="flex items-center bg-slate-700/40 rounded-xl px-3 py-2 gap-2 flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none w-full" placeholder="Search policies…" />
          </div>

          {isCustomer && (
            <div className="flex gap-1.5 p-1 rounded-xl bg-slate-900/60 border border-white/5">
              <button
                onClick={() => setViewMode("my")}
                className={`text-xs px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                  viewMode === "my"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                My Policies ({userPoliciesCount})
              </button>
              <button
                onClick={() => setViewMode("all")}
                className={`text-xs px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                  viewMode === "all"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                All Policies ({policies?.length ?? 0})
              </button>
            </div>
          )}

          <div className="flex gap-1.5 flex-wrap">
            {["All", "Active", "Expiring", "Expired", "Pending"].map(f => (
              <button key={f} onClick={() => setFilterStatus(f)} className={`text-sm px-3 py-1.5 rounded-xl font-bold transition-all ${filterStatus === f ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white hover:bg-white/[0.05]"}`}>{f}</button>
            ))}
          </div>

          <button 
            onClick={onApplyPolicy || openCreate} 
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all ml-auto shadow-md"
          >
            <Plus className="w-4 h-4" /> {isCustomer ? "Apply Policy" : "New Policy"}
          </button>
        </div>

        {loading && <Spinner />}
        {error && <ErrorState msg={error} onRetry={reload} />}
        {!loading && !error && filtered.length === 0 && (
          <div className={`${cardCls(dk)} p-8 text-center space-y-4 max-w-lg mx-auto my-6`}>
            <div className="w-14 h-14 rounded-2xl bg-blue-600/10 text-blue-500 mx-auto flex items-center justify-center">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {isCustomer && viewMode === "my" ? "No Active Policies Yet" : "No Policies Found"}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {isCustomer && viewMode === "my"
                  ? `Welcome, ${currentUser?.username || "Customer"}! You have not applied for any insurance policy yet. Click below to get instant coverage.`
                  : "No policies match the current filter or search criteria."}
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={onApplyPolicy || openCreate}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Apply for Insurance Policy
              </button>
              {isCustomer && viewMode === "my" && (
                <button
                  onClick={() => setViewMode("all")}
                  className="px-4 py-2.5 border border-slate-700 hover:bg-white/5 text-slate-300 rounded-xl text-xs font-bold transition-all"
                >
                  Browse All Plans
                </button>
              )}
            </div>
          </div>
        )}
        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map(p => (
              <div key={p.policyId} className={`${cardCls(dk)} p-5 hover:shadow-lg transition-all`}>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`font-extrabold ${dk ? "text-white" : "text-slate-900"}`}>{p.policyName}</span>
                      <Badge label={p.policyStatus} variant={statusVariant(p.policyStatus)} />
                      <span className="text-xs font-mono text-slate-500">{p.policyNumber}</span>
                      {isCustomer && isUserPolicy(p) && (
                        <span className="text-[10px] uppercase font-black bg-blue-600/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">
                          Your Policy
                        </span>
                      )}
                    </div>
                    <div className="flex gap-4 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{p.policyType}</span>
                      {p.customer && (
                        <span className="flex items-center gap-1 font-semibold text-slate-400">
                          <Users className="w-3 h-3 text-blue-400" />
                          {p.customer.name} {p.customer.customerCode ? `(${p.customer.customerCode})` : ""}
                        </span>
                      )}
                      {p.agent && <span className="flex items-center gap-1"><UserCheck className="w-3 h-3" />{p.agent.name}</span>}
                      {p.endDate && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Expires {p.endDate}</span>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-xl font-extrabold ${dk ? "text-white" : "text-slate-900"}`}>₹{(p.premiumAmount ?? 0).toLocaleString()}</div>
                    <div className="text-xs text-slate-500">Annual Premium</div>
                    {p.coverageAmount && <div className="text-xs text-slate-500">Coverage: ₹{(p.coverageAmount ?? 0).toLocaleString()}</div>}
                  </div>
                  {canEdit && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => openEdit(p)} className="p-2 rounded-lg text-slate-400 hover:text-blue-400 transition-colors"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => setConfirm(p.policyId)} className="p-2 rounded-lg text-slate-400 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <Modal title={modal === "create" ? "New Policy Application" : "Edit Policy"} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div><label className={labelCls}>Policy Name *</label><input value={form.policyName} onChange={e => setForm(p => ({ ...p, policyName: e.target.value }))} className={inputCls} placeholder="e.g. Motor Insurance - Fortuner" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Type *</label>
                <select value={form.policyType} onChange={e => setForm(p => ({ ...p, policyType: e.target.value }))} className={inputCls}>
                  {policyTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div><label className={labelCls}>Status *</label>
                <select value={form.policyStatus} onChange={e => setForm(p => ({ ...p, policyStatus: e.target.value }))} className={inputCls}>
                  {["Active", "Expiring", "Expired", "Pending", "Cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Premium (₹) *</label><input value={form.premiumAmount} onChange={e => setForm(p => ({ ...p, premiumAmount: e.target.value }))} type="number" className={inputCls} placeholder="24500" /></div>
              <div><label className={labelCls}>Duration (months) *</label><input value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} type="number" className={inputCls} placeholder="12" /></div>
            </div>
            <div><label className={labelCls}>Coverage Amount (₹)</label><input value={form.coverageAmount} onChange={e => setForm(p => ({ ...p, coverageAmount: e.target.value }))} type="number" className={inputCls} placeholder="2000000" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Start Date</label><input value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} type="date" className={inputCls} /></div>
              <div><label className={labelCls}>End Date</label><input value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} type="date" className={inputCls} /></div>
            </div>
            {isCustomer ? (
              <div>
                <label className={labelCls}>Policy Holder (Current Customer Account)</label>
                <input
                  disabled
                  value={`${currentUser?.username || "Customer"} (${currentUser?.customerCode || `ID: ${currentUser?.userId}`})`}
                  className={`${inputCls} opacity-80 cursor-not-allowed bg-slate-900/80`}
                />
              </div>
            ) : (
              <div><label className={labelCls}>Customer</label>
                <select value={form.customerId} onChange={e => setForm(p => ({ ...p, customerId: e.target.value }))} className={inputCls}>
                  <option value="">— Select Customer —</option>
                  {(customers ?? []).map(c => <option key={c.customerId} value={c.customerId}>{c.name} ({c.email})</option>)}
                </select>
              </div>
            )}
            <div><label className={labelCls}>Agent</label>
              <select value={form.agentId} onChange={e => setForm(p => ({ ...p, agentId: e.target.value }))} className={inputCls}>
                <option value="">— Select Agent —</option>
                {(agents ?? []).map(a => <option key={a.agentId} value={a.agentId}>{a.name}</option>)}
              </select>
            </div>
            {modal === "edit" && <p className="text-xs text-slate-500">Policy number is auto-generated and cannot be changed.</p>}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-white/10 text-slate-400 hover:text-white">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white">Save Policy</button>
            </div>
          </div>
        </Modal>
      )}
      {confirm !== null && <ConfirmDialog msg="Delete this policy? This cannot be undone." onConfirm={() => handleDelete(confirm)} onCancel={() => setConfirm(null)} />}
    </div>
  );
};

// ─── Claims Page ──────────────────────────────────────────────────────────────
const ClaimsPage = ({ darkMode, setDarkMode, role }: { darkMode: boolean; setDarkMode: (v: boolean) => void; role: string }) => {
  const dk = darkMode;
  const { data: claims, loading, error, reload } = useApi(() => claimsApi.getAll());
  const { data: policies } = useApi(() => policiesApi.getAll());
  const { data: surveyors } = useApi(() => surveyorsApi.getAll());
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Claim | null>(null);
  const [form, setForm] = useState({ claimAmount: "", status: "Pending", description: "", incidentDate: "", incidentLocation: "", approvedAmount: "", assessmentNotes: "", policyId: "", surveyorId: "" });

  const canUpdate = role === "ADMIN" || role === "AGENT" || role === "SURVEYOR";

  const filtered = (claims ?? []).filter(c => {
    const matchSearch = !search || c.claimNumber?.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openCreate = () => { setForm({ claimAmount: "", status: "Pending", description: "", incidentDate: "", incidentLocation: "", approvedAmount: "", assessmentNotes: "", policyId: "", surveyorId: "" }); setEditing(null); setModal("create"); };
  const openEdit = (c: Claim) => { setEditing(c); setForm({ claimAmount: String(c.claimAmount), status: c.status, description: c.description, incidentDate: c.incidentDate ?? "", incidentLocation: c.incidentLocation ?? "", approvedAmount: String(c.approvedAmount ?? ""), assessmentNotes: c.assessmentNotes ?? "", policyId: String(c.policy?.policyId ?? ""), surveyorId: String(c.surveyor?.surveyorId ?? "") }); setModal("edit"); };

  const handleSave = async () => {
    try {
      const payload = { claimAmount: Number(form.claimAmount), status: form.status, description: form.description, incidentDate: form.incidentDate || undefined, incidentLocation: form.incidentLocation || undefined, approvedAmount: form.approvedAmount ? Number(form.approvedAmount) : undefined, assessmentNotes: form.assessmentNotes || undefined, policyId: form.policyId ? Number(form.policyId) : undefined, surveyorId: form.surveyorId ? Number(form.surveyorId) : undefined };
      if (modal === "edit" && editing) { await claimsApi.update(editing.claimId, payload); toast("Claim updated"); }
      else { await claimsApi.create(payload); toast("Claim filed successfully"); }
      setModal(null); reload();
    } catch (e) { toast(e instanceof Error ? e.message : "Save failed", "error"); }
  };

  const statuses = ["Pending", "Under Review", "Surveyor Assigned", "Assessment", "Approved", "Settled", "Rejected"];

  return (
    <div className={`min-h-screen ${dk ? "bg-[#0A0F1E] text-white" : "bg-slate-50 text-slate-900"}`}>
      <TopBar title="Claims Management" subtitle="Submit and track insurance claims" darkMode={darkMode} setDarkMode={setDarkMode} />
      <div className="p-6 space-y-5">
        <div className={`flex flex-wrap items-center gap-3 p-4 rounded-[20px] border ${dk ? "bg-slate-800/55 border-white/[0.07]" : "bg-white border-slate-100 shadow-sm"}`}>
          <div className="flex items-center bg-slate-700/40 rounded-xl px-3 py-2 gap-2 flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none w-full" placeholder="Search claims…" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {["All", "Pending", "Under Review", "Approved", "Settled", "Rejected"].map(f => (
              <button key={f} onClick={() => setFilterStatus(f)} className={`text-sm px-3 py-1.5 rounded-xl font-bold transition-all ${filterStatus === f ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white hover:bg-white/[0.05]"}`}>{f}</button>
            ))}
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all ml-auto"><Plus className="w-4 h-4" /> File Claim</button>
        </div>

        {loading && <Spinner />}
        {error && <ErrorState msg={error} onRetry={reload} />}
        {!loading && !error && filtered.length === 0 && <EmptyState msg="No claims found" />}
        {!loading && !error && filtered.map(c => (
          <div key={c.claimId} className={`${cardCls(dk)} p-5`}>
            <div className="flex items-start gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`font-extrabold ${dk ? "text-white" : "text-slate-900"}`}>{c.claimNumber}</span>
                  <Badge label={c.status} variant={statusVariant(c.status)} />
                  {c.policy && <span className="text-xs text-slate-500">{c.policy.policyName}</span>}
                </div>
                <p className="text-sm text-slate-400 mb-2">{c.description}</p>
                <div className="flex gap-4 text-xs text-slate-500 flex-wrap">
                  <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />₹{(c.claimAmount ?? 0).toLocaleString()}</span>
                  {c.incidentDate && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{c.incidentDate}</span>}
                  {c.incidentLocation && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.incidentLocation}</span>}
                  {c.customer && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{c.customer.name}</span>}
                  {c.surveyor && <span className="flex items-center gap-1"><UserCheck className="w-3 h-3" />Surveyor: {c.surveyor.name}</span>}
                </div>
                {c.approvedAmount && <p className="text-xs text-green-400 mt-1 font-semibold">Approved: ₹{(c.approvedAmount ?? 0).toLocaleString()}</p>}
                {c.assessmentNotes && <p className="text-xs text-slate-400 mt-1">Notes: {c.assessmentNotes}</p>}
              </div>
              {canUpdate && (
                <button onClick={() => openEdit(c)} className="p-2 rounded-lg text-slate-400 hover:text-blue-400 transition-colors flex-shrink-0"><Edit className="w-4 h-4" /></button>
              )}
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <Modal title={modal === "create" ? "File New Claim" : "Update Claim"} onClose={() => setModal(null)}>
          <div className="space-y-4">
            {modal === "create" && (
              <div><label className={labelCls}>Policy (must be Active) *</label>
                <select value={form.policyId} onChange={e => setForm(p => ({ ...p, policyId: e.target.value }))} className={inputCls}>
                  <option value="">— Select Policy —</option>
                  {(policies ?? []).filter(p => p.policyStatus === "Active").map(p => <option key={p.policyId} value={p.policyId}>{p.policyNumber} — {p.policyName}</option>)}
                </select>
              </div>
            )}
            <div><label className={labelCls}>Claim Amount (₹) *</label><input value={form.claimAmount} onChange={e => setForm(p => ({ ...p, claimAmount: e.target.value }))} type="number" className={inputCls} placeholder="125000" /></div>
            <div><label className={labelCls}>Status *</label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className={inputCls}>
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div><label className={labelCls}>Description *</label><textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} className={`${inputCls} resize-none`} placeholder="Describe the incident…" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Incident Date</label><input value={form.incidentDate} onChange={e => setForm(p => ({ ...p, incidentDate: e.target.value }))} type="date" className={inputCls} /></div>
              <div><label className={labelCls}>Incident Location</label><input value={form.incidentLocation} onChange={e => setForm(p => ({ ...p, incidentLocation: e.target.value }))} className={inputCls} placeholder="MG Road, Bengaluru" /></div>
            </div>
            {canUpdate && <>
              <div><label className={labelCls}>Approved Amount (₹)</label><input value={form.approvedAmount} onChange={e => setForm(p => ({ ...p, approvedAmount: e.target.value }))} type="number" className={inputCls} /></div>
              <div><label className={labelCls}>Assessment Notes</label><textarea value={form.assessmentNotes} onChange={e => setForm(p => ({ ...p, assessmentNotes: e.target.value }))} rows={2} className={`${inputCls} resize-none`} /></div>
              <div><label className={labelCls}>Assign Surveyor</label>
                <select value={form.surveyorId} onChange={e => setForm(p => ({ ...p, surveyorId: e.target.value }))} className={inputCls}>
                  <option value="">— None —</option>
                  {(surveyors ?? []).map(s => <option key={s.surveyorId} value={s.surveyorId}>{s.name} ({s.specialization})</option>)}
                </select>
              </div>
            </>}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-white/10 text-slate-400 hover:text-white">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white">Save</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── Payments Page ────────────────────────────────────────────────────────────
const PaymentsPage = ({ darkMode, setDarkMode, role }: { darkMode: boolean; setDarkMode: (v: boolean) => void; role: string }) => {
  const dk = darkMode;
  const { data: payments, loading, error, reload } = useApi(() => paymentsApi.getAll());
  const { data: customers } = useApi(() => customersApi.getAll());
  const { data: policies } = useApi(() => policiesApi.getAll());
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ amount: "", paymentMethod: "UPI", paymentStatus: "Success", description: "", customerId: "", policyId: "" });

  const canCreate = role === "ADMIN" || role === "AGENT";

  const filtered = (payments ?? []).filter(p =>
    !search || p.transactionId?.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    try {
      await paymentsApi.create({ amount: Number(form.amount), paymentMethod: form.paymentMethod, paymentStatus: form.paymentStatus, description: form.description, customerId: form.customerId ? Number(form.customerId) : undefined, policyId: form.policyId ? Number(form.policyId) : undefined });
      toast("Payment recorded"); setModal(false); reload();
    } catch (e) { toast(e instanceof Error ? e.message : "Failed", "error"); }
  };

  return (
    <div className={`min-h-screen ${dk ? "bg-[#0A0F1E] text-white" : "bg-slate-50 text-slate-900"}`}>
      <TopBar title="Payment Center" subtitle="Track and manage payments" darkMode={darkMode} setDarkMode={setDarkMode} />
      <div className="p-6 space-y-5">
        <div className={`flex flex-wrap items-center gap-3 p-4 rounded-[20px] border ${dk ? "bg-slate-800/55 border-white/[0.07]" : "bg-white border-slate-100 shadow-sm"}`}>
          <div className="flex items-center bg-slate-700/40 rounded-xl px-3 py-2 gap-2 flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none w-full" placeholder="Search payments…" />
          </div>
          {canCreate && <button onClick={() => setModal(true)} className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all ml-auto"><Plus className="w-4 h-4" /> Record Payment</button>}
        </div>

        {loading && <Spinner />}
        {error && <ErrorState msg={error} onRetry={reload} />}
        {!loading && !error && filtered.length === 0 && <EmptyState msg="No payments found" />}
        {!loading && !error && (
          <div className={`${cardCls(dk)} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`text-xs text-slate-500 border-b ${dk ? "border-white/[0.04]" : "border-slate-100"}`}>
                    {["Transaction ID", "Description", "Amount", "Method", "Status", "Date", "Customer", "Policy"].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-extrabold uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.paymentId} className={`border-b transition-colors ${dk ? "border-white/[0.03] hover:bg-white/[0.02]" : "border-slate-50 hover:bg-slate-50"}`}>
                      <td className="px-4 py-3 text-xs font-mono text-slate-400">{p.transactionId}</td>
                      <td className="px-4 py-3 text-sm text-slate-300 max-w-[160px] truncate">{p.description}</td>
                      <td className={`px-4 py-3 text-sm font-extrabold ${dk ? "text-white" : "text-slate-900"}`}>₹{(p.amount ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-slate-400">{p.paymentMethod}</td>
                      <td className="px-4 py-3"><Badge label={p.paymentStatus} variant={statusVariant(p.paymentStatus)} /></td>
                      <td className="px-4 py-3 text-xs text-slate-500">{p.paymentDate}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{p.customer?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-xs text-slate-400 max-w-[120px] truncate">{p.policy?.policyName ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {modal && (
        <Modal title="Record Payment" onClose={() => setModal(false)}>
          <div className="space-y-4">
            <div><label className={labelCls}>Amount (₹) *</label><input value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} type="number" className={inputCls} placeholder="24500" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Method *</label>
                <select value={form.paymentMethod} onChange={e => setForm(p => ({ ...p, paymentMethod: e.target.value }))} className={inputCls}>
                  {["UPI", "Net Banking", "Credit Card", "Debit Card", "Wallet", "Cash"].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div><label className={labelCls}>Status *</label>
                <select value={form.paymentStatus} onChange={e => setForm(p => ({ ...p, paymentStatus: e.target.value }))} className={inputCls}>
                  {["Success", "Pending", "Failed", "Refunded"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div><label className={labelCls}>Description</label><input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className={inputCls} placeholder="Motor Insurance Renewal" /></div>
            <div><label className={labelCls}>Customer</label>
              <select value={form.customerId} onChange={e => setForm(p => ({ ...p, customerId: e.target.value }))} className={inputCls}>
                <option value="">— Select Customer —</option>
                {(customers ?? []).map(c => <option key={c.customerId} value={c.customerId}>{c.name}</option>)}
              </select>
            </div>
            <div><label className={labelCls}>Policy</label>
              <select value={form.policyId} onChange={e => setForm(p => ({ ...p, policyId: e.target.value }))} className={inputCls}>
                <option value="">— Select Policy —</option>
                {(policies ?? []).map(p => <option key={p.policyId} value={p.policyId}>{p.policyNumber} — {p.policyName}</option>)}
              </select>
            </div>
            <p className="text-xs text-slate-500">Transaction ID is auto-generated by the backend.</p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-white/10 text-slate-400 hover:text-white">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white">Save</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── Customers (Admin) Page ───────────────────────────────────────────────────
const AdminPage = ({ darkMode, setDarkMode }: { darkMode: boolean; setDarkMode: (v: boolean) => void }) => {
  const dk = darkMode;
  const { data: customers, loading, error, reload } = useApi(() => customersApi.getAll());
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [confirm, setConfirm] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });

  const filtered = (customers ?? []).filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setForm({ name: "", email: "", phone: "", address: "" }); setEditing(null); setModal("create"); };
  const openEdit = (c: Customer) => { setEditing(c); setForm({ name: c.name, email: c.email, phone: c.phone, address: c.address }); setModal("edit"); };

  const handleSave = async () => {
    try {
      if (modal === "edit" && editing) { await customersApi.update(editing.customerId, form); toast("Customer updated"); }
      else { await customersApi.create(form); toast("Customer created"); }
      setModal(null); reload();
    } catch (e) { toast(e instanceof Error ? e.message : "Save failed", "error"); }
  };

  const handleDelete = async (id: number) => {
    try { await customersApi.delete(id); toast("Customer deleted"); reload(); } catch (e) { toast(e instanceof Error ? e.message : "Delete failed", "error"); }
    setConfirm(null);
  };

  return (
    <div className={`min-h-screen ${dk ? "bg-[#0A0F1E] text-white" : "bg-slate-50 text-slate-900"}`}>
      <TopBar title="Customer Management" subtitle="Manage all customers" darkMode={darkMode} setDarkMode={setDarkMode} />
      <div className="p-6 space-y-5">
        <div className={`flex flex-wrap items-center gap-3 p-4 rounded-[20px] border ${dk ? "bg-slate-800/55 border-white/[0.07]" : "bg-white border-slate-100 shadow-sm"}`}>
          <div className="flex items-center bg-slate-700/40 rounded-xl px-3 py-2 gap-2 flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none w-full" placeholder="Search customers…" />
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all ml-auto"><Plus className="w-4 h-4" /> Add Customer</button>
        </div>

        {loading && <Spinner />}
        {error && <ErrorState msg={error} onRetry={reload} />}
        {!loading && !error && filtered.length === 0 && <EmptyState msg="No customers found" />}
        {!loading && !error && filtered.length > 0 && (
          <div className={`${cardCls(dk)} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`text-xs text-slate-500 border-b ${dk ? "border-white/[0.04]" : "border-slate-100"}`}>
                    {["Name", "Email", "Phone", "Address", "Actions"].map(h => (
                      <th key={h} className="text-left px-5 py-3 font-extrabold uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.customerId} className={`border-b transition-colors ${dk ? "border-white/[0.03] hover:bg-white/[0.02]" : "border-slate-50 hover:bg-slate-50"}`}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-violet-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-extrabold text-white">{c.name?.slice(0, 2).toUpperCase()}</span>
                          </div>
                          <span className={`text-sm font-bold ${dk ? "text-slate-200" : "text-slate-800"}`}>{c.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-400">{c.email}</td>
                      <td className="px-5 py-3 text-sm text-slate-400">{c.phone}</td>
                      <td className="px-5 py-3 text-sm text-slate-400 max-w-[180px] truncate">{c.address}</td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setConfirm(c.customerId)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {modal && (
        <Modal title={modal === "create" ? "Add Customer" : "Edit Customer"} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div><label className={labelCls}>Full Name *</label><input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inputCls} placeholder="Arjun Mehta" /></div>
            <div><label className={labelCls}>Email *</label><input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} type="email" className={inputCls} placeholder="arjun@email.com" /></div>
            <div><label className={labelCls}>Phone *</label><input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className={inputCls} placeholder="+919876543210" /></div>
            <div><label className={labelCls}>Address *</label><input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} className={inputCls} placeholder="12 Koramangala, Bengaluru" /></div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-white/10 text-slate-400 hover:text-white">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white">Save</button>
            </div>
          </div>
        </Modal>
      )}
      {confirm !== null && <ConfirmDialog msg="Delete this customer?" onConfirm={() => handleDelete(confirm)} onCancel={() => setConfirm(null)} />}
    </div>
  );
};

// ─── Agent Portal ─────────────────────────────────────────────────────────────
const AgentPage = ({ darkMode, setDarkMode }: { darkMode: boolean; setDarkMode: (v: boolean) => void }) => {
  const dk = darkMode;
  const { data: agents, loading, error, reload } = useApi(() => agentsApi.getAll());
  const { data: policies } = useApi(() => policiesApi.getAll());
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Agent | null>(null);
  const [confirm, setConfirm] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", licenseNumber: "", specialization: "Motor" });

  const openCreate = () => { setForm({ name: "", email: "", phone: "", licenseNumber: "", specialization: "Motor" }); setEditing(null); setModal("create"); };
  const openEdit = (a: Agent) => { setEditing(a); setForm({ name: a.name, email: a.email, phone: a.phone, licenseNumber: a.licenseNumber, specialization: a.specialization }); setModal("edit"); };

  const handleSave = async () => {
    try {
      if (modal === "edit" && editing) { await agentsApi.update(editing.agentId, form); toast("Agent updated"); }
      else { await agentsApi.create(form); toast("Agent created"); }
      setModal(null); reload();
    } catch (e) { toast(e instanceof Error ? e.message : "Save failed", "error"); }
  };

  const handleDelete = async (id: number) => {
    try { await agentsApi.delete(id); toast("Agent deleted"); reload(); } catch (e) { toast(e instanceof Error ? e.message : "Delete failed", "error"); }
    setConfirm(null);
  };

  return (
    <div className={`min-h-screen ${dk ? "bg-[#0A0F1E] text-white" : "bg-slate-50 text-slate-900"}`}>
      <TopBar title="Agent Portal" subtitle="Manage agents and their policies" darkMode={darkMode} setDarkMode={setDarkMode} />
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Agents", value: (agents ?? []).length, Icon: UserCheck, color: "#2563EB" },
            { label: "Total Policies", value: (policies ?? []).length, Icon: FileText, color: "#22C55E" },
            { label: "Active Policies", value: (policies ?? []).filter(p => p.policyStatus === "Active").length, Icon: CheckCircle, color: "#8B5CF6" },
            { label: "Specializations", value: new Set((agents ?? []).map(a => a.specialization)).size, Icon: Award, color: "#F59E0B" },
          ].map(s => (
            <div key={s.label} className={`${cardCls(dk)} p-5`}>
              <div className="p-2.5 rounded-xl inline-flex mb-3" style={{ background: `${s.color}20` }}><s.Icon className="w-5 h-5" style={{ color: s.color }} /></div>
              <div className={`text-2xl font-extrabold ${dk ? "text-white" : "text-slate-900"}`}>{s.value}</div>
              <div className="text-xs text-slate-500 font-semibold mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <div className={`${cardCls(dk)} p-6`}>
          <div className="flex items-center justify-between mb-5">
            <h3 className={`font-extrabold ${dk ? "text-white" : "text-slate-900"}`}>Agents</h3>
            <button onClick={openCreate} className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"><Plus className="w-4 h-4" /> Add Agent</button>
          </div>
          {loading && <Spinner />}
          {error && <ErrorState msg={error} onRetry={reload} />}
          {!loading && !error && (agents ?? []).length === 0 && <EmptyState msg="No agents found" />}
          <div className="space-y-3">
            {(agents ?? []).map(a => (
              <div key={a.agentId} className={`flex items-center gap-4 p-4 rounded-2xl ${dk ? "bg-slate-700/30" : "bg-slate-50"}`}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-violet-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-extrabold text-white">{a.name?.slice(0, 2).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-bold ${dk ? "text-slate-200" : "text-slate-800"}`}>{a.name}</div>
                  <div className="text-xs text-slate-500">{a.email} • {a.phone} • {a.specialization}</div>
                  <div className="text-xs text-slate-600 font-mono">{a.licenseNumber}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400"><Edit className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setConfirm(a.agentId)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modal && (
        <Modal title={modal === "create" ? "Add Agent" : "Edit Agent"} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div><label className={labelCls}>Name *</label><input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inputCls} /></div>
            <div><label className={labelCls}>Email *</label><input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} type="email" className={inputCls} /></div>
            <div><label className={labelCls}>Phone *</label><input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className={inputCls} placeholder="+919876543210" /></div>
            <div><label className={labelCls}>License Number *</label><input value={form.licenseNumber} onChange={e => setForm(p => ({ ...p, licenseNumber: e.target.value }))} className={inputCls} placeholder="LIC-2024-001" /></div>
            <div><label className={labelCls}>Specialization *</label>
              <select value={form.specialization} onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))} className={inputCls}>
                {["Motor", "Health", "Life", "Property", "Travel", "Business"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-white/10 text-slate-400 hover:text-white">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white">Save</button>
            </div>
          </div>
        </Modal>
      )}
      {confirm !== null && <ConfirmDialog msg="Delete this agent?" onConfirm={() => handleDelete(confirm)} onCancel={() => setConfirm(null)} />}
    </div>
  );
};

// ─── Surveyor Portal ──────────────────────────────────────────────────────────
const SurveyorPage = ({ darkMode, setDarkMode, role }: { darkMode: boolean; setDarkMode: (v: boolean) => void; role: string }) => {
  const dk = darkMode;
  const { data: surveyors, loading, error, reload } = useApi(() => surveyorsApi.getAll());
  const { data: claims } = useApi(() => claimsApi.getAll());
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Surveyor | null>(null);
  const [confirm, setConfirm] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", specialization: "Motor", department: "Claims" });

  const canManage = role === "ADMIN";

  const openCreate = () => { setForm({ name: "", email: "", phone: "", specialization: "Motor", department: "Claims" }); setEditing(null); setModal("create"); };
  const openEdit = (s: Surveyor) => { setEditing(s); setForm({ name: s.name, email: s.email, phone: s.phone, specialization: s.specialization, department: s.department }); setModal("edit"); };

  const handleSave = async () => {
    try {
      if (modal === "edit" && editing) { await surveyorsApi.update(editing.surveyorId, form); toast("Surveyor updated"); }
      else { await surveyorsApi.create(form); toast("Surveyor created"); }
      setModal(null); reload();
    } catch (e) { toast(e instanceof Error ? e.message : "Save failed", "error"); }
  };

  const handleDelete = async (id: number) => {
    try { await surveyorsApi.delete(id); toast("Surveyor deleted"); reload(); } catch (e) { toast(e instanceof Error ? e.message : "Delete failed", "error"); }
    setConfirm(null);
  };

  const assignedClaims = (claims ?? []).filter(c => c.surveyor);

  return (
    <div className={`min-h-screen ${dk ? "bg-[#0A0F1E] text-white" : "bg-slate-50 text-slate-900"}`}>
      <TopBar title="Surveyor Portal" subtitle="Manage surveyors and inspections" darkMode={darkMode} setDarkMode={setDarkMode} />
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Total Surveyors", value: (surveyors ?? []).length, Icon: MapPin, color: "#2563EB" },
            { label: "Assigned Claims", value: assignedClaims.length, Icon: FileCheck, color: "#F59E0B" },
            { label: "Departments", value: new Set((surveyors ?? []).map(s => s.department)).size, Icon: Building, color: "#22C55E" },
          ].map(s => (
            <div key={s.label} className={`${cardCls(dk)} p-5`}>
              <div className="p-2.5 rounded-xl inline-flex mb-3" style={{ background: `${s.color}20` }}><s.Icon className="w-5 h-5" style={{ color: s.color }} /></div>
              <div className={`text-2xl font-extrabold ${dk ? "text-white" : "text-slate-900"}`}>{s.value}</div>
              <div className="text-xs text-slate-500 font-semibold mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <div className={`${cardCls(dk)} p-6`}>
          <div className="flex items-center justify-between mb-5">
            <h3 className={`font-extrabold ${dk ? "text-white" : "text-slate-900"}`}>Surveyors</h3>
            {canManage && <button onClick={openCreate} className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"><Plus className="w-4 h-4" /> Add Surveyor</button>}
          </div>
          {loading && <Spinner />}
          {error && <ErrorState msg={error} onRetry={reload} />}
          {!loading && !error && (surveyors ?? []).length === 0 && <EmptyState msg="No surveyors found" />}
          <div className="space-y-3">
            {(surveyors ?? []).map(s => (
              <div key={s.surveyorId} className={`flex items-center gap-4 p-4 rounded-2xl ${dk ? "bg-slate-700/30" : "bg-slate-50"}`}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-extrabold text-white">{s.name?.slice(0, 2).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-bold ${dk ? "text-slate-200" : "text-slate-800"}`}>{s.name}</div>
                  <div className="text-xs text-slate-500">{s.email} • {s.phone}</div>
                  <div className="text-xs text-slate-500">{s.specialization} • {s.department}</div>
                </div>
                {canManage && (
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400"><Edit className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setConfirm(s.surveyorId)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {assignedClaims.length > 0 && (
          <div className={`${cardCls(dk)} p-6`}>
            <h3 className={`font-extrabold mb-4 ${dk ? "text-white" : "text-slate-900"}`}>Claims with Assigned Surveyors</h3>
            <div className="space-y-3">
              {assignedClaims.map(c => (
                <div key={c.claimId} className={`flex items-center gap-4 p-4 rounded-2xl ${dk ? "bg-slate-700/30" : "bg-slate-50"}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-bold ${dk ? "text-slate-200" : "text-slate-800"}`}>{c.claimNumber}</span>
                      <Badge label={c.status} variant={statusVariant(c.status)} />
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{c.description}</div>
                    <div className="text-xs text-slate-500">Surveyor: {c.surveyor?.name}</div>
                  </div>
                  <div className={`text-sm font-extrabold ${dk ? "text-white" : "text-slate-900"}`}>₹{(c.claimAmount ?? 0).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {modal && (
        <Modal title={modal === "create" ? "Add Surveyor" : "Edit Surveyor"} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div><label className={labelCls}>Name *</label><input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inputCls} /></div>
            <div><label className={labelCls}>Email *</label><input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} type="email" className={inputCls} /></div>
            <div><label className={labelCls}>Phone *</label><input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className={inputCls} placeholder="+919876543210" /></div>
            <div><label className={labelCls}>Specialization *</label>
              <select value={form.specialization} onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))} className={inputCls}>
                {["Motor", "Health", "Property", "Marine", "General"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div><label className={labelCls}>Department *</label><input value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} className={inputCls} placeholder="Claims" /></div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-white/10 text-slate-400 hover:text-white">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white">Save</button>
            </div>
          </div>
        </Modal>
      )}
      {confirm !== null && <ConfirmDialog msg="Delete this surveyor?" onConfirm={() => handleDelete(confirm)} onCancel={() => setConfirm(null)} />}
    </div>
  );
};

function AnalyticsPage({ darkMode, setDarkMode }: { darkMode: boolean; setDarkMode: (v: boolean) => void }) {
  const dk = darkMode;
  const policies = useApi(() => analyticsApi.policies());
  const claims = useApi(() => analyticsApi.claims());
  const payments = useApi(() => analyticsApi.payments());
  const byStatus = Object.entries((claims.data?.byStatus as Record<string, number> | undefined) ?? {}).map(([name, value]) => ({ name, value }));
  const byType = Object.entries((policies.data?.byType as Record<string, number> | undefined) ?? {}).map(([name, value]) => ({ name, value }));
  return <div className={`min-h-screen ${dk ? "bg-[#0A0F1E] text-white" : "bg-slate-50 text-slate-900"}`}>
    <TopBar title="Analytics" subtitle="Live reporting from the insurance database" darkMode={darkMode} setDarkMode={setDarkMode} />
    <div className="p-6 grid lg:grid-cols-2 gap-5">
      <div className={`${cardCls(dk)} p-5`}><h3 className="font-extrabold mb-4">Policies by type</h3>{policies.loading ? <Spinner /> : byType.length ? <ResponsiveContainer width="100%" height={260}><RechartsBar data={byType}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="#2563EB" /></RechartsBar></ResponsiveContainer> : <EmptyState msg="No policy data" />}</div>
      <div className={`${cardCls(dk)} p-5`}><h3 className="font-extrabold mb-4">Claims by status</h3>{claims.loading ? <Spinner /> : byStatus.length ? <ResponsiveContainer width="100%" height={260}><PieChart><Pie data={byStatus} dataKey="value" nameKey="name" outerRadius={90} label>{byStatus.map((entry, index) => <Cell key={entry.name} fill={["#2563EB", "#22C55E", "#F59E0B", "#EF4444"][index % 4]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer> : <EmptyState msg="No claim data" />}</div>
      <div className={`${cardCls(dk)} p-5 lg:col-span-2`}><h3 className="font-extrabold mb-4">Payment revenue</h3>{payments.loading ? <Spinner /> : <p className="text-3xl font-extrabold">₹{Number(payments.data?.totalReceived ?? 0).toLocaleString()}</p>}</div>
    </div>
  </div>;
}

function AuditPage({ darkMode, setDarkMode }: { darkMode: boolean; setDarkMode: (v: boolean) => void }) {
  const dk = darkMode;
  const { data, loading, error, reload } = useApi(() => auditApi.getAll());
  return <div className={`min-h-screen ${dk ? "bg-[#0A0F1E] text-white" : "bg-slate-50 text-slate-900"}`}>
    <TopBar title="Audit Logs" subtitle="Administrative activity history" darkMode={darkMode} setDarkMode={setDarkMode} />
    <div className="p-6">{loading && <Spinner />}{error && <ErrorState msg={error} onRetry={reload} />}{!loading && !error && !data?.length && <EmptyState msg="No audit events found" />}{data?.length ? <div className={`${cardCls(dk)} overflow-x-auto`}><table className="w-full text-left"><thead><tr className="text-xs text-slate-500 border-b border-white/10"><th className="px-4 py-3">Time</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Entity</th><th className="px-4 py-3">Description</th></tr></thead><tbody>{data.map(log => <tr key={log.id} className="border-b border-white/5 text-sm"><td className="px-4 py-3 text-slate-500">{log.timestamp}</td><td className="px-4 py-3 font-bold">{log.action}</td><td className="px-4 py-3">{log.entityType} {log.entityId}</td><td className="px-4 py-3 text-slate-400">{log.description}</td></tr>)}</tbody></table></div> : null}</div>
  </div>;
}

function ProfilePage({ darkMode, setDarkMode, user }: { darkMode: boolean; setDarkMode: (v: boolean) => void; user: AuthResponse }) {
  return <div className={`min-h-screen ${darkMode ? "bg-[#0A0F1E] text-white" : "bg-slate-50 text-slate-900"}`}><TopBar title="Profile" subtitle="Your authenticated account" darkMode={darkMode} setDarkMode={setDarkMode} /><div className="p-6"><div className={`${cardCls(darkMode)} p-6 max-w-xl space-y-4`}><div><p className="text-xs text-slate-500">Username</p><p className="font-bold">{user.username}</p></div><div><p className="text-xs text-slate-500">Email</p><p className="font-bold">{user.email}</p></div><div><p className="text-xs text-slate-500">Role</p><Badge label={user.role} variant="info" /></div></div></div></div>;
}

export default function App() {
  const auth = useAuth();
  const { toasts } = useToast();
  const [page, setPage] = useState<Page>(auth.isAuthenticated ? "dashboard" : "landing");
  const [darkMode, setDarkMode] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot" | "reset">("login");
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<ProductModel | null>(null);

  const handleAuthSuccess = (user?: AuthResponse) => {
    if (user) { setPage("dashboard"); }
  };
  const handleLogout = () => { auth.signOut(); setPage("landing"); };

  if (!auth.isAuthenticated) {
    if (page === "landing") return (
      <>
        <LandingPage onLogin={() => { setAuthMode("login"); setPage("login"); }} onRegister={() => { setAuthMode("register"); setPage("register"); }} darkMode={darkMode} setDarkMode={setDarkMode} />
        <ChatBot darkMode={darkMode} onNavigate={setPage} />
        <ToastContainer toasts={toasts} />
      </>
    );
    return (
      <>
        <AuthPage mode={authMode} onSuccess={user => { if (user) { auth.adoptUser(user); handleAuthSuccess(user); } }} onBack={() => setPage("landing")} onSwitchMode={setAuthMode} />
        <ChatBot darkMode={darkMode} onNavigate={setPage} />
        <ToastContainer toasts={toasts} />
      </>
    );
  }

  const user = auth.user!;
  const role = (user?.role || "CUSTOMER").toUpperCase() as Role;

  const renderPage = () => {
    const props = { darkMode, setDarkMode };
    switch (page) {
      case "marketplace": return (
        <MarketplacePage 
          {...props} 
          onSelectProductForQuote={() => setPage("quote")} 
          onBuyNow={(prod) => {
            setSelectedProductForModal(prod);
            setPolicyModalOpen(true);
          }}
        />
      );
      case "quote": return (
        <QuotePage 
          {...props} 
          onProceedToIssuance={(quoteData) => {
            const prod = insuranceStore.getProducts().find(p => p.lob.toUpperCase() === quoteData.policyType.toUpperCase()) || null;
            setSelectedProductForModal(prod);
            setPolicyModalOpen(true);
          }} 
        />
      );
      case "reinsurance": return <ReinsurancePage {...props} />;
      case "compliance": return <CompliancePage {...props} />;
      case "policies": return (
        <PoliciesPage 
          {...props} 
          role={role} 
          onApplyPolicy={() => {
            setSelectedProductForModal(null);
            setPolicyModalOpen(true);
          }}
        />
      );
      case "claims": return <ClaimsPage {...props} role={role} />;
      case "payments": return <PaymentsPage {...props} role={role} />;
      case "admin": return role === "ADMIN" || role === "AGENT" ? <AdminPage {...props} /> : <DashboardPage {...props} role={role} onNavigate={setPage} onApplyPolicy={() => { setSelectedProductForModal(null); setPolicyModalOpen(true); }} user={user} />;
      case "agent": return role === "ADMIN" || role === "AGENT" ? <AgentPage {...props} /> : <DashboardPage {...props} role={role} onNavigate={setPage} onApplyPolicy={() => { setSelectedProductForModal(null); setPolicyModalOpen(true); }} user={user} />;
      case "surveyor": return <SurveyorPage {...props} role={role} />;
      case "analytics": return <AnalyticsPage {...props} />;
      case "audit": return role === "ADMIN" ? <AuditPage {...props} /> : <DashboardPage {...props} role={role} onNavigate={setPage} onApplyPolicy={() => { setSelectedProductForModal(null); setPolicyModalOpen(true); }} user={user} />;
      case "profile": return <ProfilePage {...props} user={user} />;
      default: return <DashboardPage {...props} role={role} onNavigate={setPage} onApplyPolicy={() => { setSelectedProductForModal(null); setPolicyModalOpen(true); }} user={user} />;
    }
  };
  return (
    <div className="flex min-h-screen bg-[#0A0F1E]">
      <Sidebar currentPage={page} onNavigate={setPage} onLogout={handleLogout} collapsed={collapsed} setCollapsed={setCollapsed} user={user} />
      <main className="flex-1 min-w-0 overflow-x-hidden">
        {renderPage()}
      </main>
      <ChatBot darkMode={darkMode} onNavigate={setPage} />
      <ToastContainer toasts={toasts} />
      <PolicyModal
        isOpen={policyModalOpen}
        onClose={() => setPolicyModalOpen(false)}
        preselectedProduct={selectedProductForModal}
        onSuccess={(newPol) => {
          toast(`Policy ${newPol.policyNumber} issued successfully!`);
          setPage("policies");
        }}
      />
    </div>
  );
}
