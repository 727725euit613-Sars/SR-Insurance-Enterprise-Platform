import { useState, useEffect, type ElementType, type ReactNode } from "react";
import {
  Shield, Car, Heart, Home, Plane, Leaf, Briefcase, Anchor, Globe,
  Bell, User, Settings, BarChart2, FileText, CreditCard, Users,
  ChevronRight, ChevronDown, Star, TrendingUp, AlertCircle,
  CheckCircle, Clock, Upload, Download, Search, Filter, Plus,
  ArrowRight, Eye, EyeOff, Phone, Mail, Lock, Menu, X, Zap,
  Award, Target, Activity, RefreshCw, LogOut, UserCheck, MapPin,
  Camera, DollarSign, Percent, Calendar, HelpCircle, MessageSquare,
  Bot, Database, Server, Moon, Sun, ChevronLeft, MoreVertical,
  Edit, Trash2, TrendingDown, AlertTriangle, Check, ExternalLink,
  Layers, Cpu, Wifi, Info, ArrowUpRight, ArrowDownRight,
  LayoutDashboard, ShoppingCart, FileCheck, Banknote, UserCog,
  Wrench, BarChart, BookOpen, Key, Send, Building, Truck,
  Play, Fingerprint, Package
} from "lucide-react";
import {
  AreaChart, Area, BarChart as RechartsBar, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from "recharts";
import { analyticsApi, api, claimsApi, customersApi, forgotPassword, getDashboardStats, getStoredUser, login, logout, paymentsApi, policiesApi, register, resetPassword } from "../services/api";

// ─── Types ────────────────────────────────────────────────────────────────────
type Page =
  | "landing" | "login" | "dashboard" | "marketplace" | "quote"
  | "policies" | "claims" | "payments" | "analytics" | "admin"
  | "agent" | "surveyor" | "profile";

// ─── Data ─────────────────────────────────────────────────────────────────────
const revenueData = [
  { month: "Jan", premium: 42, claims: 12, target: 40 },
  { month: "Feb", premium: 38, claims: 9, target: 42 },
  { month: "Mar", premium: 51, claims: 14, target: 45 },
  { month: "Apr", premium: 47, claims: 11, target: 48 },
  { month: "May", premium: 58, claims: 16, target: 52 },
  { month: "Jun", premium: 62, claims: 18, target: 55 },
  { month: "Jul", premium: 59, claims: 15, target: 58 },
  { month: "Aug", premium: 68, claims: 20, target: 62 },
  { month: "Sep", premium: 71, claims: 19, target: 68 },
  { month: "Oct", premium: 65, claims: 17, target: 70 },
  { month: "Nov", premium: 78, claims: 21, target: 72 },
  { month: "Dec", premium: 85, claims: 23, target: 75 },
];

const policyMix = [
  { name: "Motor", value: 32, color: "#2563EB" },
  { name: "Health", value: 24, color: "#22C55E" },
  { name: "Life", value: 18, color: "#8B5CF6" },
  { name: "Property", value: 12, color: "#F59E0B" },
  { name: "Travel", value: 8, color: "#06B6D4" },
  { name: "Others", value: 6, color: "#64748B" },
];

const claimsData = [
  { month: "Jan", approved: 128, pending: 23, rejected: 17 },
  { month: "Feb", approved: 115, pending: 18, rejected: 12 },
  { month: "Mar", approved: 142, pending: 31, rejected: 21 },
  { month: "Apr", approved: 138, pending: 27, rejected: 15 },
  { month: "May", approved: 156, pending: 34, rejected: 23 },
  { month: "Jun", approved: 172, pending: 29, rejected: 18 },
];

const agentPerf = [
  { name: "Sneha Singh", policies: 61, premium: 10.2, target: 98 },
  { name: "Priya Patel", policies: 52, premium: 9.1, target: 92 },
  { name: "Rahul Sharma", policies: 48, premium: 8.4, target: 85 },
  { name: "Amit Kumar", policies: 39, premium: 6.8, target: 72 },
  { name: "Vikram Nair", policies: 35, premium: 5.9, target: 68 },
];

const policies = [
  { id: "POL-2024-001892", type: "Motor", desc: "Toyota Fortuner 4x4", premium: 24500, status: "Active", expiry: "2025-11-15", coverage: "₹20,00,000", color: "#2563EB", Icon: Car },
  { id: "POL-2024-002341", type: "Health", desc: "Family Floater — 4 members", premium: 32000, status: "Active", expiry: "2025-08-22", coverage: "₹10,00,000", color: "#22C55E", Icon: Heart },
  { id: "POL-2023-089012", type: "Life", desc: "Term Life — 25 Years", premium: 18000, status: "Active", expiry: "2048-01-01", coverage: "₹1,00,00,000", color: "#8B5CF6", Icon: Shield },
  { id: "POL-2024-034567", type: "Property", desc: "Home Shield Plus", premium: 12000, status: "Expiring", expiry: "2024-12-31", coverage: "₹50,00,000", color: "#F59E0B", Icon: Home },
  { id: "POL-2024-056789", type: "Travel", desc: "Global Travel — Annual", premium: 8500, status: "Active", expiry: "2025-03-10", coverage: "₹25,00,000", color: "#06B6D4", Icon: Plane },
];

const claims = [
  { id: "CLM-2024-8912", policy: "Motor — Toyota Fortuner", date: "15 Nov 2024", amount: 125000, status: "Under Review", pct: 45, desc: "Rear-end collision damage at MG Road", color: "#F59E0B" },
  { id: "CLM-2024-6543", policy: "Health — Family Floater", date: "02 Oct 2024", amount: 45000, status: "Approved", pct: 100, desc: "Hospitalization — Appendix surgery", color: "#22C55E" },
  { id: "CLM-2024-4321", policy: "Property — Home Shield", date: "18 Sep 2024", amount: 280000, status: "Settled", pct: 100, desc: "Water damage from heavy flooding", color: "#22C55E" },
  { id: "CLM-2024-2198", policy: "Motor — Toyota Fortuner", date: "07 Aug 2024", amount: 68000, status: "Rejected", pct: 0, desc: "Theft claim — insufficient evidence", color: "#EF4444" },
];

const customers = [
  { name: "Arjun Mehta", email: "arjun.m@email.com", policies: 3, premium: 74500, status: "Premium", since: "2019" },
  { name: "Divya Krishnan", email: "divya.k@email.com", policies: 2, premium: 56000, status: "Active", since: "2021" },
  { name: "Rohit Verma", email: "rohit.v@email.com", policies: 4, premium: 98000, status: "Premium", since: "2018" },
  { name: "Meena Iyer", email: "meena.i@email.com", policies: 1, premium: 18000, status: "Active", since: "2023" },
  { name: "Sanjay Gupta", email: "sanjay.g@email.com", policies: 5, premium: 142000, status: "VIP", since: "2017" },
  { name: "Kavitha Nair", email: "kavitha.n@email.com", policies: 2, premium: 44000, status: "Active", since: "2022" },
];

const inspections = [
  { id: "INS-2024-0091", claim: "CLM-2024-8912", customer: "Arjun Mehta", type: "Motor", location: "MG Road, Bengaluru", date: "18 Nov 2024", time: "10:30 AM", status: "Scheduled", vehicle: "Toyota Fortuner KA-01-MN-5678" },
  { id: "INS-2024-0087", claim: "CLM-2024-7234", customer: "Rohit Verma", type: "Property", location: "Indiranagar, Bengaluru", date: "19 Nov 2024", time: "02:00 PM", status: "In Progress", vehicle: "Residential Property" },
  { id: "INS-2024-0082", claim: "CLM-2024-6123", customer: "Meena Iyer", type: "Motor", location: "Whitefield, Bengaluru", date: "20 Nov 2024", time: "11:00 AM", status: "Pending", vehicle: "Honda City MH-12-AB-9012" },
];

// ─── 3D SVG Visuals ───────────────────────────────────────────────────────────
const Shield3D = ({ size = 200 }: { size?: number }) => (
  <svg width={size} height={size * 1.1} viewBox="0 0 200 220" fill="none">
    <defs>
      <linearGradient id="sg1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="50%" stopColor="#2563EB" />
        <stop offset="100%" stopColor="#1E40AF" />
      </linearGradient>
      <linearGradient id="sg2" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="rgba(255,255,255,0.28)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </linearGradient>
      <linearGradient id="sg3" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </linearGradient>
      <filter id="sfBlur">
        <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#2563EB" floodOpacity="0.5" />
      </filter>
      <filter id="sfInner">
        <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#1E40AF" floodOpacity="0.4" />
      </filter>
    </defs>
    {/* Ground shadow */}
    <ellipse cx="100" cy="214" rx="60" ry="7" fill="rgba(37,99,235,0.2)" />
    {/* Main body */}
    <path d="M100 10 L182 47 L182 114 C182 160 142 194 100 212 C58 194 18 160 18 114 L18 47 Z" fill="url(#sg1)" filter="url(#sfBlur)" />
    {/* Right face — depth */}
    <path d="M100 10 L182 47 L182 114 C182 145 166 168 146 182 L146 60 Z" fill="rgba(0,0,0,0.12)" />
    {/* Highlight sweep */}
    <path d="M100 10 L148 32 L148 92 C148 116 130 134 100 148" fill="url(#sg2)" opacity="0.6" />
    {/* Inner glow circle */}
    <circle cx="100" cy="112" r="44" fill="rgba(255,255,255,0.06)" filter="url(#sfInner)" />
    {/* Checkmark */}
    <path d="M62 110 L87 135 L140 82" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
    {/* Top glare */}
    <path d="M52 34 Q76 20 100 22 Q88 40 52 42 Z" fill="rgba(255,255,255,0.18)" />
    {/* Bottom inner highlight */}
    <path d="M55 172 Q100 195 145 172 Q120 180 100 182 Q80 180 55 172 Z" fill="rgba(255,255,255,0.07)" />
  </svg>
);

const FloatingCard3D = ({ Icon, label, color, sub }: { Icon: ElementType; label: string; color: string; sub: string }) => (
  <div className="flex items-center gap-2.5 bg-slate-900/85 backdrop-blur-2xl border border-white/10 rounded-2xl px-4 py-3 shadow-2xl">
    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}25` }}>
      <Icon className="w-4.5 h-4.5" style={{ color }} />
    </div>
    <div>
      <div className="text-sm font-bold text-white leading-none">{label}</div>
      <div className="text-[10px] text-slate-400 mt-0.5">{sub}</div>
    </div>
  </div>
);

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
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${map[variant]}`}>
      {label}
    </span>
  );
};

const GlassPanel = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`bg-white dark:bg-slate-800/55 border border-slate-100 dark:border-white/[0.07] rounded-[20px] shadow-sm dark:shadow-none ${className}`}>
    {children}
  </div>
);

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const navGroups = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", page: "dashboard" as Page, Icon: LayoutDashboard },
      { label: "Marketplace", page: "marketplace" as Page, Icon: ShoppingCart },
      { label: "Policies", page: "policies" as Page, Icon: FileText },
      { label: "Claims", page: "claims" as Page, Icon: AlertCircle },
      { label: "Payments", page: "payments" as Page, Icon: CreditCard },
    ],
  },
  {
    title: "Management",
    items: [
      { label: "Customers", page: "admin" as Page, Icon: Users },
      { label: "Agents", page: "agent" as Page, Icon: UserCheck },
      { label: "Surveyors", page: "surveyor" as Page, Icon: MapPin },
    ],
  },
  {
    title: "Insights",
    items: [
      { label: "Analytics", page: "analytics" as Page, Icon: BarChart2 },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Profile & Settings", page: "profile" as Page, Icon: Settings },
    ],
  },
];

const Sidebar = ({
  currentPage, onNavigate, onLogout, collapsed, setCollapsed, allowedPages,
}: {
  currentPage: Page; onNavigate: (p: Page) => void; onLogout: () => void; collapsed: boolean; setCollapsed: (v: boolean) => void; allowedPages: Set<Page>;
}) => (
  <aside className={`flex flex-col bg-[#070C18] border-r border-white/[0.04] transition-all duration-300 ${collapsed ? "w-16" : "w-60"} flex-shrink-0 h-screen sticky top-0`}>
    <div className="flex items-center gap-3 px-4 py-5 border-b border-white/[0.04]">
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-700/40">
        <Shield className="w-4 h-4 text-white" />
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <div className="text-sm font-bold text-white leading-none">SR Insurance</div>
          <div className="text-[10px] text-blue-400 leading-none mt-0.5">Enterprise Platform</div>
        </div>
      )}
      <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-slate-600 hover:text-slate-300 transition-colors flex-shrink-0">
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </div>

    <nav className="flex-1 px-2 py-4 overflow-y-auto space-y-5 scrollbar-none">
      {navGroups.map((group) => (
        <div key={group.title}>
          {!collapsed && (
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-2 mb-1.5">{group.title}</p>
          )}
          <div className="space-y-0.5">
            {group.items.filter(({ page }) => allowedPages.has(page)).map(({ label, page, Icon }) => {
              const active = currentPage === page;
              return (
                <button
                  key={page}
                  onClick={() => onNavigate(page)}
                  title={collapsed ? label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm font-semibold ${active ? "bg-blue-600 text-white shadow-lg shadow-blue-700/30" : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]"} ${collapsed ? "justify-center" : ""}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>

    <div className="px-3 py-4 border-t border-white/[0.04]">
      <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-violet-600 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-extrabold text-white">AM</span>
        </div>
        {!collapsed && (
          <>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">Arjun Mehta</p>
              <p className="text-[10px] text-slate-500 truncate">Premium Member</p>
            </div>
            <button onClick={onLogout} className="text-slate-600 hover:text-red-400 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  </aside>
);

// ─── Top Bar ──────────────────────────────────────────────────────────────────
const TopBar = ({
  title, subtitle, darkMode, setDarkMode, notif = 3,
}: {
  title: string; subtitle?: string; darkMode: boolean; setDarkMode: (v: boolean) => void; notif?: number;
}) => (
  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/[0.04] bg-white/70 dark:bg-[#0A0F1E]/70 backdrop-blur-xl sticky top-0 z-10">
    <div>
      <h1 className="text-lg font-extrabold text-slate-900 dark:text-white">{title}</h1>
      {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
    <div className="flex items-center gap-2.5">
      <div className="flex items-center bg-slate-100 dark:bg-white/[0.05] rounded-xl px-3 py-2 gap-2 w-44">
        <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        <input className="bg-transparent text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none w-full" placeholder="Search…" />
      </div>
      <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
        {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
      <button className="relative p-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-slate-300">
        <Bell className="w-4 h-4" />
        {notif > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white font-extrabold flex items-center justify-center">{notif}</span>}
      </button>
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-violet-600 flex items-center justify-center cursor-pointer">
        <span className="text-xs font-extrabold text-white">AM</span>
      </div>
    </div>
  </div>
);

// ─── Insurance Types ──────────────────────────────────────────────────────────
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

// ─── Landing Page ─────────────────────────────────────────────────────────────
const testimonials = [
  { name: "Priya Sharma", role: "Business Owner, Bengaluru", rating: 5, text: "SR Insurance processed my fire claim in 72 hours. The AI-powered assessment was incredibly accurate and the settlement was fair. Absolutely stellar service." },
  { name: "Rajesh Kumar", role: "IT Professional, Pune", rating: 5, text: "Buying motor insurance took under 3 minutes. The price comparison feature saved me ₹8,000 on my premium. This platform is genuinely revolutionary." },
  { name: "Ananya Reddy", role: "Homemaker, Chennai", rating: 5, text: "My health claim was handled with great empathy. The 24/7 AI support guided me through every step and the cashless hospitalization was seamless." },
];

const features = [
  { Icon: Bot, title: "AI-Powered Underwriting", desc: "ML models assess risk in milliseconds — instant policy issuance with 98.7% actuarial accuracy." },
  { Icon: Zap, title: "Instant Claim Settlement", desc: "AI-driven claim assessment with automated document verification. Most claims settled under 24 hours." },
  { Icon: Shield, title: "Zero-Trust Security", desc: "AES-256 encryption, multi-factor authentication, and DPDP-compliant data architecture." },
  { Icon: Globe, title: "Pan-India Coverage", desc: "50,000+ cashless hospitals, 1,200+ garages, and dedicated surveyors across every major city." },
];

const faqs = [
  { q: "How quickly are claims processed?", a: "Motor and property claims are assessed within 24–48 hours using our AI surveyor. Health claims at network hospitals are cashless and settled directly with the hospital. Complex claims may take 7–14 business days." },
  { q: "Can I manage multiple insurance types in one account?", a: "Yes. SR Insurance is a unified platform. One login manages all your Motor, Health, Life, Property, Travel, and other policies with a single dashboard view." },
  { q: "Is my data secure on SR Insurance?", a: "Absolutely. We use AES-256 encryption, zero-knowledge architecture for KYC data, and are compliant with IRDAI, DPDP Act, PCI-DSS, and ISO 27001 standards." },
  { q: "What payment methods are accepted?", a: "We accept UPI, all major credit/debit cards, Net Banking (50+ banks), digital wallets (Paytm, PhonePe, GPay), and EMI options for annual premiums." },
];

const LandingPage = ({
  onLogin, darkMode, setDarkMode,
}: {
  onLogin: () => void; darkMode: boolean; setDarkMode: (v: boolean) => void;
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#070C18] text-white overflow-x-hidden font-[Plus_Jakarta_Sans,Inter,sans-serif]">
      {/* NAV */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.04] bg-[#070C18]/90 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-700/40">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-base font-extrabold text-white leading-none">SR Insurance</div>
              <div className="text-[10px] text-blue-400 leading-none mt-0.5">Protecting Every Journey</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            {["Insurance", "Claims", "About", "Pricing"].map(l => (
              <a key={l} href="#" className="hover:text-white transition-colors font-medium">{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg text-slate-500 hover:text-white transition-colors">
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={onLogin} className="text-sm text-slate-300 hover:text-white px-4 py-2 font-semibold transition-colors">Login</button>
            <button onClick={onLogin} className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all hover:shadow-xl hover:shadow-blue-700/30 hover:-translate-y-px">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#070C18] via-blue-950/25 to-[#070C18]" />
        <div className="absolute top-1/3 right-1/3 w-[500px] h-[500px] bg-blue-700/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-violet-700/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)", backgroundSize: "64px 64px" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-8">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-sm text-blue-300 font-semibold">India's #1 AI-Powered InsurTech Platform</span>
            </div>
            <h1 className="text-5xl md:text-[64px] font-extrabold leading-[1.08] text-white mb-6 tracking-tight">
              Protecting Every<br />
              <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">Journey,</span><br />
              Every Life.
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed mb-10 max-w-lg">
              Enterprise-grade insurance management powered by AI. Instant quotes, seamless claims, and real-time analytics — all unified.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <button onClick={onLogin} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-base transition-all hover:shadow-2xl hover:shadow-blue-700/40 hover:-translate-y-0.5">
                Start Free Trial <ArrowRight className="w-5 h-5" />
              </button>
              <button className="flex items-center gap-2 border border-white/10 hover:border-white/20 text-white px-8 py-4 rounded-2xl font-bold text-base transition-all hover:bg-white/[0.03]">
                <Play className="w-5 h-5" /> Watch Demo
              </button>
            </div>
            <div className="flex items-center gap-4 mt-10">
              <div className="flex -space-x-2">
                {["#3B82F6","#8B5CF6","#22C55E","#F59E0B"].map((c,i) => (
                  <div key={i} className="w-9 h-9 rounded-full border-2 border-[#070C18] flex items-center justify-center text-xs font-extrabold text-white" style={{ background: c }}>{["A","R","P","S"][i]}</div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Trusted by 2.4M+ policyholders across India</p>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative flex items-center justify-center min-h-[460px]">
            <div style={{ animation: "float 6s ease-in-out infinite" }}>
              <Shield3D size={280} />
            </div>
            {/* Floating pills */}
            <div className="absolute top-6 left-0" style={{ animation: "float 7s ease-in-out infinite 0.5s" }}>
              <FloatingCard3D Icon={Car} label="Motor" color="#3B82F6" sub="₹2,049/year" />
            </div>
            <div className="absolute top-6 right-0" style={{ animation: "float 6.5s ease-in-out infinite 1s" }}>
              <FloatingCard3D Icon={Heart} label="Health" color="#22C55E" sub="₹7,999/year" />
            </div>
            <div className="absolute bottom-24 left-0" style={{ animation: "float 8s ease-in-out infinite 1.5s" }}>
              <FloatingCard3D Icon={Home} label="Property" color="#F59E0B" sub="₹3,499/year" />
            </div>
            <div className="absolute bottom-24 right-0" style={{ animation: "float 7.5s ease-in-out infinite 2s" }}>
              <FloatingCard3D Icon={Plane} label="Travel" color="#06B6D4" sub="₹499/trip" />
            </div>
            {/* Bottom stat bar */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl px-7 py-4 flex items-center gap-7 shadow-2xl whitespace-nowrap">
              {[["24hrs","Claim Settlement"],["₹0","Zero Hidden Fees"],["100%","Digital Process"]].map(([v,l],i) => (
                <div key={l} className="flex items-center gap-5">
                  <div className="text-center">
                    <div className="text-lg font-extrabold text-white">{v}</div>
                    <div className="text-[10px] text-slate-400">{l}</div>
                  </div>
                  {i < 2 && <div className="w-px h-10 bg-white/8" />}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-600">
          <span className="text-xs">Scroll to explore</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 border-y border-white/[0.04] bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[["2.4M+","Active Policyholders"],["₹1,200Cr+","Claims Settled"],["99.2%","Customer Satisfaction"],["8 sec","Avg Claim Response"]].map(([value,label]) => (
            <div key={label} className="text-center">
              <div className="text-4xl font-extrabold text-white mb-1">{value}</div>
              <div className="text-sm text-slate-400">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* INSURANCE TYPES */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-white mb-4">9 Insurance Categories, One Platform</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Comprehensive coverage for every need — from personal to enterprise, domestic to international.</p>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
          {insTypes.map(({ label, Icon: I, grad }) => (
            <button key={label} onClick={onLogin} className="group flex flex-col items-center gap-3 bg-white/[0.025] hover:bg-white/[0.055] border border-white/[0.05] hover:border-white/[0.12] rounded-[20px] p-6 transition-all duration-300 hover:-translate-y-1.5">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <I className="w-7 h-7 text-white" />
              </div>
              <span className="text-sm font-bold text-slate-300">{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 bg-white/[0.018] border-y border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-white mb-4">Built for the Future of Insurance</h2>
            <p className="text-slate-400">Technology-first approach to protection and peace of mind.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map(({ Icon: I, title, desc }) => (
              <div key={title} className="flex gap-5 bg-white/[0.025] border border-white/[0.05] rounded-[20px] p-8 hover:border-blue-500/20 transition-all group hover:bg-white/[0.04]">
                <div className="w-12 h-12 bg-blue-600/15 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600/25 transition-colors">
                  <I className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-white mb-4">Loved by Millions</h2>
          <p className="text-slate-400">Real stories from real customers across India.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map(({ name, role, rating, text }) => (
            <div key={name} className="bg-white/[0.025] border border-white/[0.05] rounded-[20px] p-8 hover:border-white/10 transition-colors">
              <div className="flex gap-0.5 mb-4">
                {Array(rating).fill(0).map((_,i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">"{text}"</p>
              <div>
                <div className="font-bold text-white">{name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PARTNERS */}
      <section className="py-16 border-y border-white/[0.04] bg-white/[0.018]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-600 text-xs mb-8 uppercase tracking-widest font-semibold">Compliance & Certifications</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {["IRDAI Approved","ISO 27001","ISO 9001","PCI-DSS","SOC 2 Type II","DPDP Compliant"].map(p => (
              <div key={p} className="bg-white/[0.04] border border-white/[0.07] rounded-xl px-5 py-3 text-sm font-bold text-slate-400">{p}</div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-white mb-4">Frequently Asked Questions</h2>
          <p className="text-slate-400">Everything you need to know about SR Insurance.</p>
        </div>
        <div className="space-y-3">
          {faqs.map(({ q, a }, i) => (
            <div key={i} className="bg-white/[0.025] border border-white/[0.05] rounded-[20px] overflow-hidden">
              <button className="w-full flex items-center justify-between px-6 py-5 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span className="font-bold text-white text-sm">{q}</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ml-4 ${openFaq === i ? "rotate-180" : ""}`} />
              </button>
              {openFaq === i && (
                <div className="px-6 pb-5 text-sm text-slate-400 leading-relaxed border-t border-white/[0.04] pt-4">{a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-blue-600/20 to-violet-600/10 border border-blue-500/20 rounded-[32px] p-16">
          <h2 className="text-4xl font-extrabold text-white mb-4">Ready to Protect What Matters?</h2>
          <p className="text-slate-300 mb-10 leading-relaxed">Join 2.4 million policyholders who trust SR Insurance for comprehensive coverage and instant claims.</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button onClick={onLogin} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold transition-all hover:shadow-2xl hover:shadow-blue-700/40 hover:-translate-y-0.5">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={onLogin} className="border border-white/15 hover:border-white/30 text-white px-8 py-4 rounded-2xl font-bold transition-all hover:bg-white/[0.04]">
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.04] py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div className="font-extrabold text-white">SR Insurance</div>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">India's most trusted AI-powered insurance platform. IRDAI Registered No. SR/2024/1234567.</p>
              <p className="text-xs text-slate-700">© 2024 SR Insurance Pvt. Ltd. All rights reserved.</p>
            </div>
            {[
              { title: "Products", links: ["Motor","Health","Life","Property","Travel"] },
              { title: "Company", links: ["About Us","Careers","Press","Blog","Contact"] },
              { title: "Support", links: ["Help Center","Claims","Track Policy","Grievance","FAQ"] },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="text-sm font-bold text-white mb-4">{title}</h4>
                <div className="space-y-2.5">
                  {links.map(l => <a key={l} href="#" className="block text-sm text-slate-500 hover:text-slate-300 transition-colors">{l}</a>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

// ─── Auth Page ────────────────────────────────────────────────────────────────
const AuthPage = ({ onLogin, onBack }: { onLogin: (username: string, password: string) => Promise<void>; onBack: () => void }) => {
  const [tab, setTab] = useState<"login"|"register"|"reset">("login");
  const [showPw, setShowPw] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [resetPasswordValue, setResetPasswordValue] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submitLogin = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await onLogin(username, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setSubmitting(false);
    }
  };

  const submitRegistration = async () => {
    setSubmitting(true);
    setError(null);
    setMessage(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setSubmitting(false);
      return;
    }
    try {
      await register({ username, email, password });
      setMessage("Registration successful. Please sign in.");
      setTab("login");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to register");
    } finally {
      setSubmitting(false);
    }
  };

  const submitReset = async () => {
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      if (!resetToken) {
        const response = await forgotPassword(email);
        setMessage(`${response.message} Enter the token from the development server logs.`);
      } else {
        if (resetPasswordValue !== confirmPassword) throw new Error("Passwords do not match");
        const response = await resetPassword(resetToken, resetPasswordValue);
        setMessage(response.message);
        setResetToken("");
        setResetPasswordValue("");
        setConfirmPassword("");
        setTab("login");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reset password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#070C18] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#070C18] via-blue-950/20 to-[#070C18]" />
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-blue-700/15 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-700/10 rounded-full blur-3xl" />

      {/* Left panel */}
      <div className="hidden md:flex flex-1 relative z-10 flex-col items-center justify-center p-16">
        <div style={{ animation: "float 6s ease-in-out infinite" }}>
          <Shield3D size={210} />
        </div>
        <h2 className="text-3xl font-extrabold text-white mt-8 text-center leading-tight">
          The Smart Way to<br />Manage Insurance
        </h2>
        <p className="text-slate-400 text-center mt-4 max-w-xs leading-relaxed text-sm">
          AI-powered platform for instant policies, seamless claims, and real-time portfolio management.
        </p>
        <div className="flex flex-col gap-3.5 mt-10 w-full max-w-xs">
          {["Instant policy issuance — under 2 minutes","Claims settled in 24 hours on average","Bank-grade security & IRDAI compliance"].map(text => (
            <div key={text} className="flex items-center gap-3">
              <CheckCircle className="w-4.5 h-4.5 text-blue-400 flex-shrink-0" />
              <span className="text-sm text-slate-300">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="relative z-10 flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-[420px]">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-8 font-medium">
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </button>
          <div className="bg-slate-900/85 backdrop-blur-2xl border border-white/10 rounded-[24px] p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-7">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-700/40">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-extrabold text-white">SR Insurance</div>
                <div className="text-xs text-blue-400">Secure Portal</div>
              </div>
            </div>

            {(tab === "login" || tab === "register") && (
              <div className="flex bg-slate-800/60 rounded-xl p-1 mb-7">
                {(["login","register"] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${tab === t ? "bg-blue-600 text-white shadow-lg shadow-blue-700/30" : "text-slate-400 hover:text-white"}`}>
                    {t === "login" ? "Sign In" : "Register"}
                  </button>
                ))}
              </div>
            )}

            {tab === "login" && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-white">Welcome back</h2>
                  <p className="text-sm text-slate-400 mt-0.5">Sign in to your SR Insurance account</p>
                </div>
                {message && <p className="text-sm text-green-400" role="status">{message}</p>}
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                  <input value={username} onChange={(event) => setUsername(event.target.value)} type="text" placeholder="Username" className="w-full bg-slate-800/60 border border-white/8 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                  <input value={password} onChange={(event) => setPassword(event.target.value)} type={showPw ? "text" : "password"} placeholder="Password" className="w-full bg-slate-800/60 border border-white/8 rounded-xl py-3 pl-11 pr-12 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                  <button onClick={() => setShowPw(!showPw)} className="absolute right-4 top-3.5 text-slate-500 hover:text-white transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-slate-400 cursor-pointer text-xs">
                    <input type="checkbox" className="accent-blue-500 rounded" /> Remember me
                  </label>
                  <button onClick={() => setTab("reset")} className="text-blue-400 hover:text-blue-300 text-xs font-semibold">Forgot password?</button>
                </div>
                {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
                <button onClick={submitLogin} disabled={submitting || !username || !password} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold text-sm transition-all hover:shadow-xl hover:shadow-blue-700/30">
                  {submitting ? "Signing in..." : "Sign In to Dashboard"}
                </button>
                <div className="relative flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/8" />
                  <span className="text-xs text-slate-600 font-medium">or continue with</span>
                  <div className="flex-1 h-px bg-white/8" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {["Google","DigiLocker"].map(p => (
                    <button key={p} className="flex items-center justify-center gap-2 bg-slate-800/60 border border-white/8 rounded-xl py-3 text-sm text-slate-300 hover:border-white/20 hover:text-white transition-all font-semibold">{p}</button>
                  ))}
                </div>
              </div>
            )}

            {tab === "register" && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-white">Create Account</h2>
                  <p className="text-sm text-slate-400 mt-0.5">Start protecting what matters most</p>
                </div>
                <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Username" className="w-full bg-slate-800/60 border border-white/8 rounded-xl py-3 px-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="Email Address" className="w-full bg-slate-800/60 border border-white/8 rounded-xl py-3 px-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Password (8+, upper/lowercase and number)" className="w-full bg-slate-800/60 border border-white/8 rounded-xl py-3 px-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                <input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} type="password" placeholder="Confirm Password" className="w-full bg-slate-800/60 border border-white/8 rounded-xl py-3 px-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                <label className="flex items-start gap-2 text-xs text-slate-400 cursor-pointer">
                  <input type="checkbox" className="accent-blue-500 mt-0.5" />
                  I agree to the <a href="#" className="text-blue-400 hover:text-blue-300">Terms of Service</a> and <a href="#" className="text-blue-400 hover:text-blue-300">Privacy Policy</a>
                </label>
                {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
                <button onClick={submitRegistration} disabled={submitting || !username || !email || !password || !confirmPassword} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold text-sm transition-all hover:shadow-xl hover:shadow-blue-700/30">
                  {submitting ? "Creating account..." : "Create Account"}
                </button>
              </div>
            )}
            {tab === "reset" && (
              <div className="space-y-5">
                <button onClick={() => setTab("login")} className="flex items-center gap-1 text-sm text-slate-400 hover:text-white font-medium"><ChevronLeft className="w-4 h-4" /> Back</button>
                <div>
                  <h2 className="text-2xl font-extrabold text-white">Reset Password</h2>
                  <p className="text-sm text-slate-400 mt-1">Request a token, then enter the development token and a new password.</p>
                </div>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                  <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="Email Address" className="w-full bg-slate-800/60 border border-white/8 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <input value={resetToken} onChange={(event) => setResetToken(event.target.value)} placeholder="Reset token (after requesting)" className="w-full bg-slate-800/60 border border-white/8 rounded-xl py-3 px-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                {resetToken && <>
                  <input value={resetPasswordValue} onChange={(event) => setResetPasswordValue(event.target.value)} type="password" placeholder="New Password" className="w-full bg-slate-800/60 border border-white/8 rounded-xl py-3 px-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                  <input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} type="password" placeholder="Confirm New Password" className="w-full bg-slate-800/60 border border-white/8 rounded-xl py-3 px-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                </>}
                {message && <p className="text-sm text-green-400" role="status">{message}</p>}
                {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
                <button onClick={submitReset} disabled={submitting || !email || (Boolean(resetToken) && (!resetPasswordValue || !confirmPassword))} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold text-sm transition-all">
                  {submitting ? "Working..." : resetToken ? "Reset Password" : "Request Reset Token"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
const DashboardPage = ({ darkMode, setDarkMode }: { darkMode: boolean; setDarkMode: (v: boolean) => void }) => {
  const dk = darkMode;
  const [dashboardStats, setDashboardStats] = useState<Awaited<ReturnType<typeof getDashboardStats>> | null>(null);

  useEffect(() => {
    let active = true;
    getDashboardStats().then((stats) => {
      if (active) setDashboardStats(stats);
    });
    return () => {
      active = false;
    };
  }, []);

  const statsCards = [
    { title: "Active Policies", value: dashboardStats ? String(dashboardStats.activePolicies) : "...", subtitle: dashboardStats ? `${dashboardStats.totalPolicies} total policies` : "Loading statistics", Icon: FileText, color: "#2563EB", trend: null },
    { title: "Total Premium", value: dashboardStats ? `₹${dashboardStats.totalPremiumCollected.toLocaleString()}` : "...", subtitle: "Premium collected", Icon: DollarSign, color: "#22C55E", trend: null },
    { title: "Active Claims", value: dashboardStats ? String(dashboardStats.pendingClaims) : "...", subtitle: dashboardStats ? `${dashboardStats.totalClaims} total claims` : "Loading statistics", Icon: AlertCircle, color: "#F59E0B", trend: null },
    { title: "Payments Received", value: dashboardStats ? `₹${dashboardStats.totalPaymentsReceived.toLocaleString()}` : "...", subtitle: dashboardStats ? `${dashboardStats.pendingPaymentsAmount.toLocaleString()} pending` : "Loading statistics", Icon: CreditCard, color: "#8B5CF6", trend: null },
  ];
  const quickActions = [
    { label: "New Claim", Icon: Plus, color: "#EF4444" },
    { label: "Renew Policy", Icon: RefreshCw, color: "#22C55E" },
    { label: "Pay Premium", Icon: CreditCard, color: "#2563EB" },
    { label: "Get Quote", Icon: FileText, color: "#8B5CF6" },
    { label: "Download", Icon: Download, color: "#06B6D4" },
    { label: "Support", Icon: MessageSquare, color: "#F59E0B" },
  ];
  const timeline = [
    { event: "Motor claim CLM-2024-8912 submitted", date: "15 Nov", Icon: AlertCircle, color: "#F59E0B" },
    { event: "Health claim ₹45,000 approved", date: "02 Oct", Icon: CheckCircle, color: "#22C55E" },
    { event: "Property claim ₹2,80,000 settled", date: "18 Sep", Icon: CheckCircle, color: "#22C55E" },
    { event: "Annual premium ₹94,500 paid", date: "01 Apr", Icon: CreditCard, color: "#2563EB" },
    { event: "Motor policy renewed — POL-2024-001892", date: "15 Nov 2023", Icon: RefreshCw, color: "#06B6D4" },
  ];

  const cardCls = `rounded-[20px] border ${dk ? "bg-slate-800/55 border-white/[0.07]" : "bg-white border-slate-100 shadow-sm"}`;

  return (
    <div className={`min-h-screen ${dk ? "bg-[#0A0F1E] text-white" : "bg-slate-50 text-slate-900"}`}>
      <TopBar title="Dashboard" subtitle="Good morning, Arjun 👋" darkMode={darkMode} setDarkMode={setDarkMode} />
      <div className="p-6 space-y-5">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statsCards.map(card => (
            <div key={card.title} className={`${cardCls} p-5 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-semibold mb-1">{card.title}</p>
                  <p className={`text-2xl font-extrabold ${dk ? "text-white" : "text-slate-900"}`}>{card.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{card.subtitle}</p>
                </div>
                <div className="p-2.5 rounded-xl flex-shrink-0" style={{ background: `${card.color}20` }}>
                  <card.Icon className="w-5 h-5" style={{ color: card.color }} />
                </div>
              </div>
              {card.trend && (
                <div className="flex items-center gap-1 mt-3">
                  <ArrowUpRight className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-400 font-bold">{card.trend}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Chart + Actions */}
        <div className="grid md:grid-cols-3 gap-5">
          <div className={`md:col-span-2 ${cardCls} p-6`}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className={`font-extrabold ${dk ? "text-white" : "text-slate-900"}`}>Premium Collection</h3>
                <p className="text-xs text-slate-500 mt-0.5">2024 — Monthly overview (₹ Lakhs)</p>
              </div>
              <div className="flex gap-1">
                {["1M","3M","6M","1Y"].map(p => (
                  <button key={p} className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors font-semibold ${p === "1Y" ? "bg-blue-600 text-white" : "text-slate-500 hover:text-white"}`}>{p}</button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={revenueData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={dk ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"} />
                <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: dk ? "#1E293B" : "#fff", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, fontSize: 12 }} />
                <Area type="monotone" dataKey="premium" stroke="#2563EB" strokeWidth={2.5} fill="url(#g1)" name="Premium (₹L)" />
                <Area type="monotone" dataKey="claims" stroke="#EF4444" strokeWidth={2} fill="url(#g2)" name="Claims (₹L)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            {/* Quick Actions */}
            <div className={`${cardCls} p-5`}>
              <h3 className={`font-extrabold mb-4 ${dk ? "text-white" : "text-slate-900"}`}>Quick Actions</h3>
              <div className="grid grid-cols-3 gap-2">
                {quickActions.map(({ label, Icon: I, color }) => (
                  <button key={label} className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:-translate-y-0.5 ${dk ? "bg-slate-700/40 hover:bg-slate-700" : "bg-slate-50 hover:bg-slate-100"}`}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
                      <I className="w-4 h-4" style={{ color }} />
                    </div>
                    <span className={`text-[10px] font-bold text-center leading-tight ${dk ? "text-slate-300" : "text-slate-600"}`}>{label}</span>
                  </button>
                ))}
              </div>
            </div>
            {/* AI Assistant */}
            <div className="rounded-[20px] p-5 bg-gradient-to-br from-blue-600 to-blue-800 border border-blue-500/30 shadow-xl shadow-blue-700/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-white">SR AI Assistant</div>
                  <div className="text-[10px] text-blue-200">Online • Powered by SR-AI</div>
                </div>
              </div>
              <p className="text-sm text-blue-100 mb-4 leading-relaxed">
                "Your Home Shield policy expires in 14 days. Renew now to save ₹1,200 with the early renewal discount."
              </p>
              <button className="w-full bg-white/15 hover:bg-white/25 border border-white/20 text-white text-sm py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                Chat with AI <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Policies + Timeline */}
        <div className="grid md:grid-cols-3 gap-5">
          <div className={`md:col-span-2 ${cardCls} p-6`}>
            <div className="flex items-center justify-between mb-5">
              <h3 className={`font-extrabold ${dk ? "text-white" : "text-slate-900"}`}>Active Policies</h3>
              <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold">View all <ChevronRight className="w-3 h-3" /></button>
            </div>
            <div className="space-y-2.5">
              {policies.slice(0,4).map(p => (
                <div key={p.id} className={`flex items-center gap-4 p-4 rounded-2xl transition-all hover:scale-[1.01] ${dk ? "bg-slate-700/30 hover:bg-slate-700/50" : "bg-slate-50 hover:bg-slate-100"}`}>
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `${p.color}20` }}>
                    <p.Icon className="w-5 h-5" style={{ color: p.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-bold ${dk ? "text-white" : "text-slate-900"}`}>{p.type} Insurance</span>
                      <Badge label={p.status} variant={p.status === "Active" ? "success" : "warning"} />
                    </div>
                    <div className={`text-xs mt-0.5 truncate ${dk ? "text-slate-400" : "text-slate-500"}`}>{p.desc} • Expires {p.expiry}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-sm font-extrabold ${dk ? "text-white" : "text-slate-900"}`}>₹{(p.premium/1000).toFixed(0)}K</div>
                    <div className="text-[10px] text-slate-500">/year</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={`${cardCls} p-6`}>
            <h3 className={`font-extrabold mb-5 ${dk ? "text-white" : "text-slate-900"}`}>Activity Timeline</h3>
            <div className="relative">
              <div className={`absolute left-3 top-2 bottom-2 w-px ${dk ? "bg-white/[0.05]" : "bg-slate-100"}`} />
              <div className="space-y-5">
                {timeline.map(({ event, date, Icon: I, color }, i) => (
                  <div key={i} className="flex items-start gap-4 relative">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2" style={{ background: `${color}15`, borderColor: `${color}40` }}>
                      <I className="w-3 h-3" style={{ color }} />
                    </div>
                    <div>
                      <p className={`text-xs font-semibold leading-snug ${dk ? "text-slate-200" : "text-slate-700"}`}>{event}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Marketplace ──────────────────────────────────────────────────────────────
const insuranceProducts = [
  { type: "Motor", Icon: Car, color: "#2563EB", grad: "from-blue-600 to-blue-900", tagline: "Drive worry-free", coverage: "₹20,00,000", from: "₹2,049", period: "/year", benefits: ["Own Damage Cover","Third-Party Liability","Zero Depreciation","Roadside Assistance","Engine Protection"], rating: 4.8, reviews: 24891 },
  { type: "Health", Icon: Heart, color: "#22C55E", grad: "from-green-600 to-emerald-900", tagline: "Family protection", coverage: "₹10,00,000", from: "₹7,999", period: "/year", benefits: ["Cashless Hospitalization","Pre & Post-Op Cover","Day Care Procedures","Annual Health Check","Mental Wellness"], rating: 4.9, reviews: 18234 },
  { type: "Life", Icon: Shield, color: "#8B5CF6", grad: "from-violet-600 to-purple-900", tagline: "Secure your family", coverage: "₹1 Crore", from: "₹899", period: "/month", benefits: ["Term Life Cover","Critical Illness Rider","Accidental Death Benefit","Premium Waiver","Return of Premium"], rating: 4.7, reviews: 31205 },
  { type: "Property", Icon: Home, color: "#F59E0B", grad: "from-amber-600 to-orange-900", tagline: "Home sweet home", coverage: "₹50,00,000", from: "₹3,499", period: "/year", benefits: ["Structure Protection","Contents Cover","Fire & Allied Perils","Natural Disasters","Burglary & Theft"], rating: 4.6, reviews: 8921 },
  { type: "Travel", Icon: Plane, color: "#06B6D4", grad: "from-cyan-600 to-blue-900", tagline: "Explore fearlessly", coverage: "₹25,00,000", from: "₹499", period: "/trip", benefits: ["Medical Emergencies","Trip Cancellation","Baggage Loss","Flight Delay","Emergency Evacuation"], rating: 4.8, reviews: 12567 },
  { type: "Crop", Icon: Leaf, color: "#84CC16", grad: "from-lime-600 to-green-900", tagline: "Harvest with confidence", coverage: "₹5,00,000", from: "₹1,199", period: "/season", benefits: ["Crop Failure Cover","Drought Protection","Flood Damage","Pest & Disease","PMFBY Compliant"], rating: 4.5, reviews: 5234 },
  { type: "Business", Icon: Briefcase, color: "#4F46E5", grad: "from-indigo-600 to-indigo-900", tagline: "Protect your enterprise", coverage: "₹2 Crore", from: "₹12,999", period: "/year", benefits: ["Property Damage","Public Liability","Business Interruption","Product Liability","Employee Compensation"], rating: 4.7, reviews: 3891 },
  { type: "Marine", Icon: Anchor, color: "#14B8A6", grad: "from-teal-600 to-cyan-900", tagline: "Voyage with confidence", coverage: "₹1 Crore", from: "₹8,499", period: "/voyage", benefits: ["Cargo Protection","Hull & Machinery","Freight Liability","War Risk Cover","Port Risks"], rating: 4.6, reviews: 1245 },
  { type: "Cyber", Icon: Globe, color: "#EF4444", grad: "from-red-600 to-rose-900", tagline: "Digital armor", coverage: "₹50,00,000", from: "₹4,999", period: "/year", benefits: ["Data Breach Response","Ransomware Recovery","Business Email Compromise","Third-Party Liability","Regulatory Fines"], rating: 4.8, reviews: 2134 },
];

const MarketplacePage = ({ darkMode, setDarkMode }: { darkMode: boolean; setDarkMode: (v: boolean) => void }) => {
  const [filter, setFilter] = useState("All");
  const dk = darkMode;
  return (
    <div className={`min-h-screen ${dk ? "bg-[#0A0F1E] text-white" : "bg-slate-50 text-slate-900"}`}>
      <TopBar title="Insurance Marketplace" subtitle="Find the perfect coverage for every need" darkMode={darkMode} setDarkMode={setDarkMode} />
      <div className="p-6">
        <div className={`flex items-center gap-4 mb-6 p-4 rounded-[20px] border ${dk ? "bg-slate-800/55 border-white/[0.07]" : "bg-white border-slate-100 shadow-sm"}`}>
          <div className="flex gap-1.5 flex-wrap">
            {["All","Personal","Business","Group"].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`text-sm px-4 py-2 rounded-xl font-bold transition-all ${filter === f ? "bg-blue-600 text-white" : dk ? "text-slate-400 hover:text-white hover:bg-white/[0.05]" : "text-slate-500 hover:bg-slate-100"}`}>{f}</button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className={`flex items-center gap-2 text-sm px-4 py-2 rounded-xl border font-semibold ${dk ? "border-white/8 text-slate-400 hover:text-white" : "border-slate-200 text-slate-500"}`}>
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {insuranceProducts.map(product => (
            <div key={product.type} className={`rounded-[24px] overflow-hidden border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${dk ? "bg-slate-800/55 border-white/[0.07] hover:border-white/15" : "bg-white border-slate-100 shadow-sm hover:shadow-lg"}`}>
              <div className={`bg-gradient-to-br ${product.grad} p-6 relative overflow-hidden`}>
                <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 60%)" }} />
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                    <product.Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1 bg-black/20 backdrop-blur-sm rounded-lg px-2.5 py-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-white text-xs font-bold">{product.rating}</span>
                    <span className="text-white/50 text-xs">({(product.reviews/1000).toFixed(1)}k)</span>
                  </div>
                </div>
                <div className="relative z-10">
                  <div className="text-xl font-extrabold text-white">{product.type} Insurance</div>
                  <div className="text-sm text-white/70 mt-0.5">{product.tagline}</div>
                  <div className="mt-4">
                    <div className="text-[10px] text-white/60 uppercase tracking-wide font-semibold">Coverage up to</div>
                    <div className="text-2xl font-black text-white">{product.coverage}</div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold mb-1">Starting from</div>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-extrabold ${dk ? "text-white" : "text-slate-900"}`}>{product.from}</span>
                    <span className="text-slate-500 text-sm font-medium">{product.period}</span>
                  </div>
                </div>
                <div className="space-y-2 mb-5">
                  {product.benefits.map(b => (
                    <div key={b} className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                      <span className={`text-xs font-medium ${dk ? "text-slate-300" : "text-slate-600"}`}>{b}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2.5">
                  <button className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${dk ? "border-white/8 text-slate-300 hover:text-white hover:border-white/20" : "border-slate-200 text-slate-600"}`}>Compare</button>
                  <button className="flex-1 py-2.5 rounded-xl text-xs font-extrabold text-white transition-all hover:shadow-lg hover:-translate-y-0.5" style={{ background: `linear-gradient(135deg, ${product.color}, ${product.color}CC)`, boxShadow: `0 4px 16px ${product.color}30` }}>
                    Buy Now →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Quote Generator ──────────────────────────────────────────────────────────
const QuotePage = ({ darkMode, setDarkMode }: { darkMode: boolean; setDarkMode: (v: boolean) => void }) => {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [coverage, setCoverage] = useState(2000000);
  const [deductible, setDeductible] = useState(5000);
  const dk = darkMode;
  const totalSteps = 5;
  const premium = Math.round((coverage * 0.012 - deductible * 0.5) / 100) * 100;
  const stepLabels = ["Select Type","Your Details","Coverage","Compare Plans","Confirm"];
  const panelCls = `rounded-[20px] p-8 border ${dk ? "bg-slate-800/55 border-white/[0.07]" : "bg-white border-slate-100 shadow-sm"}`;

  return (
    <div className={`min-h-screen ${dk ? "bg-[#0A0F1E] text-white" : "bg-slate-50 text-slate-900"}`}>
      <TopBar title="Quote Generator" subtitle="Get an instant, AI-powered quote in minutes" darkMode={darkMode} setDarkMode={setDarkMode} />
      <div className="p-6 max-w-4xl mx-auto">
        {/* Progress */}
        <div className={`rounded-[20px] p-6 border mb-5 ${dk ? "bg-slate-800/55 border-white/[0.07]" : "bg-white border-slate-100 shadow-sm"}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-slate-500 font-semibold">Step {step} of {totalSteps}</div>
            <div className="text-sm font-bold text-blue-400">Est. 3 minutes</div>
          </div>
          <div className="flex gap-1 mb-2.5">
            {Array(totalSteps).fill(0).map((_,i) => (
              <div key={i} className={`flex-1 h-2 rounded-full overflow-hidden ${dk ? "bg-slate-700" : "bg-slate-100"}`}>
                <div className={`h-full rounded-full transition-all duration-500 ${i < step ? "bg-blue-500" : ""}`} />
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            {stepLabels.map((label,i) => (
              <div key={label} className={`text-[10px] font-bold ${i+1 <= step ? "text-blue-400" : "text-slate-500"}`}>{label}</div>
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className={panelCls}>
            <h2 className={`text-xl font-extrabold mb-2 ${dk ? "text-white" : "text-slate-900"}`}>What would you like to insure?</h2>
            <p className="text-sm text-slate-500 mb-6">Select the insurance type that best fits your needs.</p>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {insTypes.map(({ label, Icon: I, color, grad }) => (
                <button key={label} onClick={() => setSelectedType(label)} className={`flex flex-col items-center gap-3 p-5 rounded-[20px] border transition-all hover:-translate-y-0.5 ${selectedType === label ? "border-blue-500 bg-blue-600/10 shadow-lg shadow-blue-600/20" : dk ? "border-white/[0.07] bg-slate-700/20 hover:border-white/15" : "border-slate-200 hover:border-slate-300"}`}>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-lg`}><I className="w-6 h-6 text-white" /></div>
                  <span className={`text-xs font-bold text-center ${dk ? "text-slate-200" : "text-slate-700"}`}>{label}</span>
                  {selectedType === label && <Check className="w-4 h-4 text-blue-400" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={panelCls}>
            <h2 className={`text-xl font-extrabold mb-6 ${dk ? "text-white" : "text-slate-900"}`}>Tell us about your {selectedType || "asset"}</h2>
            <div className="grid grid-cols-2 gap-5">
              {[{l:"Vehicle Registration",p:"KA-01-MN-5678"},{l:"Make & Model",p:"Toyota Fortuner 4x4"},{l:"Manufacturing Year",p:"2022"},{l:"Fuel Type",p:"Diesel"},{l:"Owner Name",p:"Arjun Mehta"},{l:"Date of Birth",p:"15/03/1988"},{l:"City",p:"Bengaluru"},{l:"Previous Insurer",p:"Select..."}].map(({l,p}) => (
                <div key={l}>
                  <label className={`block text-sm font-bold mb-1.5 ${dk ? "text-slate-300" : "text-slate-700"}`}>{l}</label>
                  <input placeholder={p} className={`w-full py-3 px-4 rounded-xl border text-sm focus:outline-none focus:border-blue-500 transition-colors ${dk ? "bg-slate-700/40 border-white/8 text-white placeholder-slate-500" : "bg-slate-50 border-slate-200 text-slate-900"}`} />
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={panelCls}>
            <h2 className={`text-xl font-extrabold mb-6 ${dk ? "text-white" : "text-slate-900"}`}>Customize Your Coverage</h2>
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-[20px] p-6 mb-8 text-center">
              <div className="text-sm text-blue-200 mb-1 font-semibold">Estimated Annual Premium</div>
              <div className="text-5xl font-black text-white">₹{premium.toLocaleString()}</div>
              <div className="text-blue-200 text-sm mt-1">Including GST & all taxes</div>
            </div>
            <div className="space-y-8">
              {[{label:"Sum Insured (Coverage Amount)",min:500000,max:10000000,step:100000,val:coverage,set:setCoverage,fmt:(v:number)=>`₹${(v/100000).toFixed(0)} Lakhs`,minLabel:"₹5 Lakhs",maxLabel:"₹1 Crore"},
               {label:"Voluntary Deductible",min:0,max:50000,step:1000,val:deductible,set:setDeductible,fmt:(v:number)=>`₹${v.toLocaleString()}`,minLabel:"₹0",maxLabel:"₹50,000"}].map(({label,min,max,step:s,val,set,fmt,minLabel,maxLabel}) => (
                <div key={label}>
                  <div className="flex justify-between mb-3">
                    <label className={`text-sm font-bold ${dk ? "text-slate-200" : "text-slate-700"}`}>{label}</label>
                    <span className="text-blue-400 font-extrabold text-sm">{fmt(val)}</span>
                  </div>
                  <input type="range" min={min} max={max} step={s} value={val} onChange={e => set(Number(e.target.value))} className="w-full accent-blue-500 cursor-pointer" />
                  <div className="flex justify-between text-xs text-slate-500 mt-1 font-semibold"><span>{minLabel}</span><span>{maxLabel}</span></div>
                </div>
              ))}
              <div>
                <label className={`text-sm font-bold mb-3 block ${dk ? "text-slate-200" : "text-slate-700"}`}>Add-on Covers</label>
                <div className="grid grid-cols-2 gap-3">
                  {["Zero Depreciation","Engine Protect","Roadside Assistance","Key Replacement","Personal Accident","Consumables Cover"].map(addon => (
                    <label key={addon} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all hover:border-blue-500/40 ${dk ? "bg-slate-700/20 border-white/8" : "bg-slate-50 border-slate-200"}`}>
                      <input type="checkbox" className="accent-blue-500" />
                      <span className={`text-sm font-medium ${dk ? "text-slate-300" : "text-slate-600"}`}>{addon}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className={panelCls}>
            <h2 className={`text-xl font-extrabold mb-6 ${dk ? "text-white" : "text-slate-900"}`}>Compare Plans</h2>
            <div className="grid grid-cols-3 gap-4">
              {[{name:"Essential",p:Math.round(premium*0.8),highlight:false,feats:["Own Damage","Third Party","Personal Accident","24/7 Support"]},
               {name:"Premium",p:Math.round(premium),highlight:true,feats:["Own Damage","Third Party","Zero Depreciation","Roadside Assist","Engine Protection","Personal Accident"]},
               {name:"Elite",p:Math.round(premium*1.35),highlight:false,feats:["Own Damage","Third Party","Zero Depreciation","Roadside Assist","Engine Protection","Consumables","Key Replacement","Personal Accident","Priority Claims"]}].map(({name,p,highlight,feats}) => (
                <div key={name} className={`rounded-[20px] p-6 border transition-all ${highlight ? "border-blue-500 bg-blue-600/10 shadow-xl shadow-blue-600/20 scale-105" : dk ? "border-white/[0.07] bg-slate-700/20" : "border-slate-200"}`}>
                  {highlight && <div className="text-center text-xs font-extrabold text-blue-400 bg-blue-600/20 rounded-lg py-1.5 mb-4">MOST POPULAR</div>}
                  <div className={`text-base font-extrabold mb-2 ${dk ? "text-white" : "text-slate-900"}`}>{name}</div>
                  <div className={`text-3xl font-black mb-0.5 ${dk ? "text-white" : "text-slate-900"}`}>₹{p.toLocaleString()}</div>
                  <div className="text-xs text-slate-500 font-semibold mb-5">/year incl. GST</div>
                  <div className="space-y-2.5 mb-6">
                    {feats.map(f => (
                      <div key={f} className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                        <span className={`text-xs font-medium ${dk ? "text-slate-300" : "text-slate-600"}`}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <button className={`w-full py-2.5 rounded-xl text-sm font-extrabold transition-all ${highlight ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg" : dk ? "bg-slate-600 hover:bg-slate-500 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`}>Select Plan</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className={panelCls}>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-500/15 border border-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h2 className={`text-xl font-extrabold ${dk ? "text-white" : "text-slate-900"}`}>Review & Confirm</h2>
              <p className="text-slate-500 text-sm mt-1">Your quote is ready. Review details and proceed to payment.</p>
            </div>
            <div className={`rounded-[20px] p-6 space-y-4 mb-6 ${dk ? "bg-slate-700/30" : "bg-slate-50"}`}>
              {[["Insurance Type",selectedType||"Motor"],["Sum Insured",`₹${(coverage/100000).toFixed(0)} Lakhs`],["Deductible",`₹${deductible.toLocaleString()}`],["Plan","Premium"],["Annual Premium",`₹${premium.toLocaleString()}`],["GST (18%)",`₹${Math.round(premium*0.18).toLocaleString()}`],["Total Amount",`₹${Math.round(premium*1.18).toLocaleString()}`]].map(([k,v],i) => (
                <div key={k} className="flex justify-between items-center">
                  <span className={`text-sm ${dk ? "text-slate-400" : "text-slate-500"}`}>{k}</span>
                  <span className={`text-sm font-bold ${i===6 ? (dk?"text-white text-base":"text-slate-900 text-base") : dk ? "text-slate-200" : "text-slate-800"}`}>{v}</span>
                </div>
              ))}
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-extrabold text-base transition-all hover:shadow-2xl hover:shadow-blue-700/30">
              Proceed to Payment → ₹{Math.round(premium*1.18).toLocaleString()}
            </button>
          </div>
        )}

        <div className="flex justify-between mt-5">
          <button onClick={() => setStep(Math.max(1,step-1))} disabled={step===1} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold border transition-all ${step===1?"opacity-40 cursor-not-allowed":""} ${dk?"border-white/8 text-slate-400 hover:text-white":"border-slate-200 text-slate-600"}`}>
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          {step < totalSteps && (
            <button onClick={() => setStep(Math.min(totalSteps,step+1))} className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-extrabold bg-blue-600 hover:bg-blue-500 text-white transition-all hover:shadow-xl hover:shadow-blue-700/30">
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Policy Management ────────────────────────────────────────────────────────
const PoliciesPage = ({ darkMode, setDarkMode }: { darkMode: boolean; setDarkMode: (v: boolean) => void }) => {
  const [filter, setFilter] = useState("All");
  const [policyRows, setPolicyRows] = useState<Array<{ policyId: number; id: string; type: string; desc: string; premium: number; status: string; expiry: string; coverage: string; color: string; Icon: ElementType }>>([]);
  const [policyLoading, setPolicyLoading] = useState(true);
  const [policyError, setPolicyError] = useState<string | null>(null);
  const dk = darkMode;

  useEffect(() => {
    policiesApi.getAll()
      .then((data) => setPolicyRows(data.map((policy) => ({
        policyId: policy.policyId,
        id: policy.policyNumber,
        type: policy.policyType,
        desc: policy.policyName,
        premium: policy.premiumAmount,
        status: policy.policyStatus,
        expiry: policy.endDate,
        coverage: `₹${policy.coverageAmount.toLocaleString()}`,
        color: policy.policyType.toLowerCase() === "health" ? "#22C55E" : "#2563EB",
        Icon: policy.policyType.toLowerCase() === "health" ? Heart : Shield,
      }))))
      .catch((error: unknown) => setPolicyError(error instanceof Error ? error.message : "Unable to load policies"))
      .finally(() => setPolicyLoading(false));
  }, []);

  const visiblePolicies = policyRows.filter((policy) => filter === "All" || policy.status.toLowerCase() === filter.toLowerCase());

  const deletePolicy = async (policyId: number) => {
    if (!window.confirm("Are you sure you want to delete this policy?")) return;
    try {
      await policiesApi.delete(policyId);
      setPolicyRows((rows) => rows.filter((policy) => policy.policyId !== policyId));
    } catch (error) {
      setPolicyError(error instanceof Error ? error.message : "Unable to delete policy");
    }
  };

  return (
    <div className={`min-h-screen ${dk ? "bg-[#0A0F1E] text-white" : "bg-slate-50 text-slate-900"}`}>
      <TopBar title="Policy Management" subtitle="Manage all your insurance policies" darkMode={darkMode} setDarkMode={setDarkMode} />
      <div className="p-6 space-y-5">
        <div className={`flex items-center gap-4 p-4 rounded-[20px] border ${dk ? "bg-slate-800/55 border-white/[0.07]" : "bg-white border-slate-100 shadow-sm"}`}>
          <div className="flex gap-1.5 flex-wrap">
            {["All","Active","Expiring","Expired","Pending"].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`text-sm px-4 py-2 rounded-xl font-bold transition-all ${filter===f?"bg-blue-600 text-white":dk?"text-slate-400 hover:text-white hover:bg-white/[0.05]":"text-slate-500 hover:bg-slate-100"}`}>{f}</button>
            ))}
          </div>
          <div className="ml-auto flex gap-2">
            <button className={`flex items-center gap-2 text-sm px-4 py-2 rounded-xl border font-semibold ${dk?"border-white/8 text-slate-400":"border-slate-200 text-slate-500"}`}><Download className="w-4 h-4" /> Export</button>
            <button className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all"><Plus className="w-4 h-4" /> New Policy</button>
          </div>
        </div>
        <div className="space-y-4">
          {policyLoading && <div className="py-12 text-center text-sm text-slate-500">Loading policies...</div>}
          {policyError && <div className="py-12 text-center text-sm text-red-400" role="alert">{policyError}</div>}
          {!policyLoading && !policyError && visiblePolicies.length === 0 && <div className="py-12 text-center text-sm text-slate-500">No policies found.</div>}
          {visiblePolicies.map(p => (
            <div key={p.id} className={`rounded-[20px] p-6 border transition-all hover:shadow-lg ${dk?"bg-slate-800/55 border-white/[0.07] hover:border-white/12":"bg-white border-slate-100 shadow-sm"}`}>
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `${p.color}20` }}>
                  <p.Icon className="w-7 h-7" style={{ color: p.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className={`font-extrabold ${dk?"text-white":"text-slate-900"}`}>{p.type} Insurance</h3>
                    <Badge label={p.status} variant={p.status==="Active"?"success":"warning"} />
                    <span className={`text-xs font-mono ${dk?"text-slate-500":"text-slate-400"}`}>{p.id}</span>
                  </div>
                  <div className={`text-sm mt-0.5 ${dk?"text-slate-400":"text-slate-500"}`}>{p.desc}</div>
                  <div className="flex items-center gap-5 mt-2 flex-wrap">
                    <span className="text-xs text-slate-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> Expires {p.expiry}</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1"><Shield className="w-3 h-3" /> Coverage: {p.coverage}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`text-2xl font-black ${dk?"text-white":"text-slate-900"}`}>₹{p.premium.toLocaleString()}</div>
                  <div className="text-xs text-slate-500 font-semibold">Annual Premium</div>
                </div>
                <div className="flex flex-col gap-2 ml-4 flex-shrink-0">
                  <button className="px-4 py-2 text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all">Renew</button>
                  <button className={`px-4 py-2 text-xs font-bold rounded-lg border ${dk?"border-white/8 text-slate-400 hover:text-white":"border-slate-200 text-slate-500"}`}>Download</button>
                  <button onClick={() => deletePolicy(p.policyId)} className={`px-4 py-2 text-xs font-bold rounded-lg border ${dk?"border-white/8 text-slate-400":"border-slate-200 text-slate-500"}`}>Delete</button>
                </div>
              </div>
              {p.status === "Expiring" && (
                <div className={`mt-5 pt-5 border-t ${dk?"border-white/[0.05]":"border-slate-100"}`}>
                  <div className="flex items-center justify-between text-xs font-semibold mb-2">
                    <span className="text-slate-500">Policy Period Progress</span>
                    <span className="text-amber-400">⚠ Expiring in 14 days</span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${dk?"bg-slate-700":"bg-slate-100"}`}>
                    <div className="h-full w-[95%] bg-gradient-to-r from-green-500 to-amber-400 rounded-full" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Claims Management ────────────────────────────────────────────────────────
const ClaimsPage = ({ darkMode, setDarkMode }: { darkMode: boolean; setDarkMode: (v: boolean) => void }) => {
  const [view, setView] = useState<"list"|"submit">("list");
  const [claimStep, setClaimStep] = useState(1);
  const [claimPolicies, setClaimPolicies] = useState<Awaited<ReturnType<typeof policiesApi.getAll>>>([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState<number | null>(null);
  const [incidentDate, setIncidentDate] = useState("");
  const [incidentLocation, setIncidentLocation] = useState("");
  const [claimDescription, setClaimDescription] = useState("");
  const [claimAmount, setClaimAmount] = useState("");
  const [submittingClaim, setSubmittingClaim] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [claimRows, setClaimRows] = useState<Array<{ id: string; policy: string; date: string; amount: number; status: string; pct: number; desc: string; color: string }>>([]);
  const [claimLoading, setClaimLoading] = useState(true);
  const [claimError, setClaimError] = useState<string | null>(null);
  const dk = darkMode;
  const stages = ["Filed","Under Review","Surveyor Assigned","Assessment","Approved","Payment"];

  useEffect(() => {
    policiesApi.getAll().then((data) => {
      const activePolicies = data.filter((policy) => policy.policyStatus.toLowerCase() === "active");
      setClaimPolicies(activePolicies);
      if (activePolicies[0]) setSelectedPolicyId(activePolicies[0].policyId);
    }).catch(() => undefined);
    claimsApi.getAll()
      .then((data) => setClaimRows(data.map((claim) => ({
        id: claim.claimNumber,
        policy: claim.policy?.policyNumber || "Unassigned policy",
        date: claim.incidentDate,
        amount: claim.claimAmount,
        status: claim.status,
        pct: claim.status.toLowerCase() === "rejected" ? 0 : claim.status.toLowerCase() === "approved" ? 100 : 45,
        desc: claim.description,
        color: claim.status.toLowerCase() === "rejected" ? "#EF4444" : claim.status.toLowerCase() === "approved" ? "#22C55E" : "#F59E0B",
      }))))
      .catch((error: unknown) => setClaimError(error instanceof Error ? error.message : "Unable to load claims"))
      .finally(() => setClaimLoading(false));
  }, []);

  const submitClaim = async () => {
    if (!selectedPolicyId || !incidentDate || !incidentLocation || !claimDescription || !claimAmount) {
      setSubmitError("Complete the policy, incident date, location, description, and amount fields.");
      return;
    }
    setSubmittingClaim(true);
    setSubmitError(null);
    try {
      await claimsApi.create({ policyId: selectedPolicyId, claimAmount: Number(claimAmount), status: "Pending", description: claimDescription, incidentDate, incidentLocation });
      const refreshedClaims = await claimsApi.getAll();
      setClaimRows(refreshedClaims.map((claim) => ({ id: claim.claimNumber, policy: claim.policy?.policyNumber || "Unassigned policy", date: claim.incidentDate, amount: claim.claimAmount, status: claim.status, pct: claim.status.toLowerCase() === "rejected" ? 0 : claim.status.toLowerCase() === "approved" ? 100 : 45, desc: claim.description, color: claim.status.toLowerCase() === "rejected" ? "#EF4444" : claim.status.toLowerCase() === "approved" ? "#22C55E" : "#F59E0B" })));
      setView("list");
      setClaimStep(1);
      setIncidentDate("");
      setIncidentLocation("");
      setClaimDescription("");
      setClaimAmount("");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to submit claim");
    } finally {
      setSubmittingClaim(false);
    }
  };

  return (
    <div className={`min-h-screen ${dk?"bg-[#0A0F1E] text-white":"bg-slate-50 text-slate-900"}`}>
      <TopBar title="Claims Management" subtitle="Submit and track insurance claims" darkMode={darkMode} setDarkMode={setDarkMode} />
      <div className="p-6 space-y-5">
        <div className={`flex items-center justify-between p-4 rounded-[20px] border ${dk?"bg-slate-800/55 border-white/[0.07]":"bg-white border-slate-100 shadow-sm"}`}>
          <div className="flex gap-1.5">
            {["All Claims","Active","Settled","Rejected"].map(f => (
              <button key={f} className={`text-sm px-4 py-2 rounded-xl font-bold ${f==="All Claims"?"bg-blue-600 text-white":dk?"text-slate-400 hover:text-white":"text-slate-500"}`}>{f}</button>
            ))}
          </div>
          <button onClick={() => setView(view==="list"?"submit":"list")} className="flex items-center gap-2 text-sm px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold transition-all">
            {view==="list" ? <><Plus className="w-4 h-4" /> File New Claim</> : <><ChevronLeft className="w-4 h-4" /> Back to Claims</>}
          </button>
        </div>

        {view === "list" && (
          <div className="space-y-4">
            {claimLoading && <div className="py-12 text-center text-sm text-slate-500">Loading claims...</div>}
            {claimError && <div className="py-12 text-center text-sm text-red-400" role="alert">{claimError}</div>}
            {!claimLoading && !claimError && claimRows.length === 0 && <div className="py-12 text-center text-sm text-slate-500">No claims found.</div>}
            {claimRows.map(c => (
              <div key={c.id} className={`rounded-[20px] p-6 border ${dk?"bg-slate-800/55 border-white/[0.07]":"bg-white border-slate-100 shadow-sm"}`}>
                <div className="flex items-start gap-5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <span className={`font-extrabold ${dk?"text-white":"text-slate-900"}`}>{c.policy}</span>
                      <Badge label={c.status} variant={c.status==="Approved"||c.status==="Settled"?"success":c.status==="Under Review"?"warning":"danger"} />
                      <span className="text-xs font-mono text-slate-500">{c.id}</span>
                    </div>
                    <div className="text-sm text-slate-500 mb-2">{c.desc}</div>
                    <div className="flex gap-5 text-xs text-slate-500 font-semibold">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Filed: {c.date}</span>
                      <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> Amount: ₹{c.amount.toLocaleString()}</span>
                    </div>
                    {c.status !== "Rejected" && (
                      <div className="mt-4">
                        <div className="flex justify-between text-xs font-bold mb-1.5">
                          <span className="text-slate-500">Claim Progress</span>
                          <span style={{ color: c.color }}>{c.pct}% Complete</span>
                        </div>
                        <div className={`h-2 rounded-full overflow-hidden ${dk?"bg-slate-700":"bg-slate-100"}`}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${c.pct}%`, background: c.color }} />
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 mt-4 flex-wrap">
                      {stages.map((stage,i) => {
                        const idx = stages.indexOf(c.status);
                        const done = i <= (c.status==="Settled" ? 5 : idx);
                        return (
                          <div key={stage} className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${done?"bg-green-400":dk?"bg-slate-600":"bg-slate-200"}`} />
                            <span className={`text-[10px] font-semibold ${done?"text-green-400":"text-slate-500"}`}>{stage}</span>
                            {i<5 && <ChevronRight className={`w-3 h-3 ${dk?"text-slate-700":"text-slate-300"}`} />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button className={`px-4 py-2 text-xs font-bold rounded-lg border ${dk?"border-white/8 text-slate-400 hover:text-white":"border-slate-200 text-slate-500"}`}>View Details</button>
                    <button className={`px-4 py-2 text-xs font-bold rounded-lg border ${dk?"border-white/8 text-slate-400":"border-slate-200 text-slate-500"}`}><Download className="w-3 h-3 inline mr-1" />Report</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {view === "submit" && (
          <div className={`rounded-[20px] p-8 border max-w-2xl ${dk?"bg-slate-800/55 border-white/[0.07]":"bg-white border-slate-100 shadow-sm"}`}>
            <h2 className={`text-xl font-extrabold mb-6 ${dk?"text-white":"text-slate-900"}`}>File New Claim — Step {claimStep} of 4</h2>
            <div className="flex gap-2.5 mb-8">
              {["Select Policy","Incident Details","Upload Docs","Review & Submit"].map((s,i) => (
                <div key={s} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold ${i+1<=claimStep?"bg-blue-600 text-white":dk?"bg-slate-700 text-slate-400":"bg-slate-100 text-slate-400"}`}>
                    {i+1<claimStep ? <Check className="w-4 h-4" /> : i+1}
                  </div>
                  <span className={`text-[10px] font-bold text-center leading-tight ${i+1<=claimStep?"text-blue-400":"text-slate-500"}`}>{s}</span>
                </div>
              ))}
            </div>

            {claimStep===1 && (
              <div className="space-y-3">
                <p className={`text-sm mb-2 ${dk?"text-slate-400":"text-slate-500"}`}>Select the policy for which you are filing this claim:</p>
                {claimPolicies.map(p => (
                  <label key={p.policyId} className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${selectedPolicyId === p.policyId ? "border-blue-500 bg-blue-600/10" : dk?"border-white/[0.07] bg-slate-700/20 hover:border-blue-500/40":"border-slate-200 bg-slate-50 hover:border-blue-300"}`}>
                    <input type="radio" name="policy" checked={selectedPolicyId === p.policyId} onChange={() => setSelectedPolicyId(p.policyId)} className="accent-blue-500" />
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-600/15"><Shield className="w-5 h-5 text-blue-400" /></div>
                    <div>
                      <div className={`font-bold text-sm ${dk?"text-white":"text-slate-900"}`}>{p.policyType} Insurance</div>
                      <div className="text-xs text-slate-500">{p.policyNumber} • {p.policyName}</div>
                    </div>
                  </label>
                ))}
                {claimPolicies.length === 0 && <p className="text-sm text-slate-500">No active policies available for a claim.</p>}
              </div>
            )}

            {claimStep===2 && (
              <div className="grid grid-cols-2 gap-5">
                {[{l:"Date of Incident",t:"date"},{l:"Time of Incident",t:"time"}].map(({l,t}) => (
                  <div key={l}>
                    <label className={`block text-sm font-bold mb-1.5 ${dk?"text-slate-300":"text-slate-700"}`}>{l}</label>
                    <input type={t} value={t === "date" ? incidentDate : undefined} onChange={t === "date" ? (event) => setIncidentDate(event.target.value) : undefined} className={`w-full py-3 px-4 rounded-xl border text-sm ${dk?"bg-slate-700/40 border-white/8 text-white":"bg-slate-50 border-slate-200"}`} />
                  </div>
                ))}
                <div className="col-span-2">
                  <label className={`block text-sm font-bold mb-1.5 ${dk?"text-slate-300":"text-slate-700"}`}>Location of Incident</label>
                  <input value={incidentLocation} onChange={(event) => setIncidentLocation(event.target.value)} placeholder="MG Road, Bengaluru, Karnataka" className={`w-full py-3 px-4 rounded-xl border text-sm ${dk?"bg-slate-700/40 border-white/8 text-white placeholder-slate-500":"bg-slate-50 border-slate-200"}`} />
                </div>
                <div className="col-span-2">
                  <label className={`block text-sm font-bold mb-1.5 ${dk?"text-slate-300":"text-slate-700"}`}>Description of Incident</label>
                  <textarea rows={4} value={claimDescription} onChange={(event) => setClaimDescription(event.target.value)} placeholder="Describe what happened in detail..." className={`w-full py-3 px-4 rounded-xl border text-sm resize-none ${dk?"bg-slate-700/40 border-white/8 text-white placeholder-slate-500":"bg-slate-50 border-slate-200"}`} />
                </div>
                {[{l:"Estimated Loss Amount",p:"₹1,25,000"},{l:"FIR Number (if applicable)",p:"BNG/2024/4512"}].map(({l,p}) => (
                  <div key={l}>
                    <label className={`block text-sm font-bold mb-1.5 ${dk?"text-slate-300":"text-slate-700"}`}>{l}</label>
                    <input type={l === "Estimated Loss Amount" ? "number" : "text"} value={l === "Estimated Loss Amount" ? claimAmount : undefined} onChange={l === "Estimated Loss Amount" ? (event) => setClaimAmount(event.target.value) : undefined} placeholder={p} className={`w-full py-3 px-4 rounded-xl border text-sm ${dk?"bg-slate-700/40 border-white/8 text-white placeholder-slate-500":"bg-slate-50 border-slate-200"}`} />
                  </div>
                ))}
              </div>
            )}

            {claimStep===3 && (
              <div className="space-y-3">
                {["Claim Form (Signed)","Photos of Damage","FIR Copy","Repair Estimate","Previous Policy","Identity Proof"].map((doc,i) => (
                  <div key={doc} className={`flex items-center gap-4 p-4 rounded-2xl border ${dk?"border-white/[0.07] bg-slate-700/20":"border-slate-200 bg-slate-50"}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${i<2?"bg-green-500/15":dk?"bg-slate-600/40":"bg-slate-200"}`}>
                      {i<2 ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Upload className="w-5 h-5 text-slate-400" />}
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-bold ${dk?"text-slate-200":"text-slate-700"}`}>{doc}</div>
                      <div className="text-xs text-slate-500">{i===0?"claim-form-signed.pdf — 2.1MB":i===1?"damage-photos.zip — 8 files":"Upload PDF, JPG or PNG (max 10MB)"}</div>
                    </div>
                    <button className={`text-xs px-4 py-2 rounded-lg border font-bold ${dk?"border-white/8 text-slate-400 hover:text-white":"border-slate-200 text-slate-500"}`}>{i<2?"Replace":"Upload"}</button>
                  </div>
                ))}
              </div>
            )}

            {claimStep===4 && (
              <div>
                <div className={`rounded-2xl p-5 space-y-3 mb-6 ${dk?"bg-slate-700/30":"bg-slate-50"}`}>
                  {[["Claim Type","Motor Insurance"],["Policy Number","POL-2024-001892"],["Date of Incident","15 November 2024"],["Location","MG Road, Bengaluru"],["Estimated Loss","₹1,25,000"],["Documents Uploaded","2 of 6"]].map(([k,v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-sm text-slate-500">{k}</span>
                      <span className={`text-sm font-bold ${dk?"text-slate-200":"text-slate-800"}`}>{v}</span>
                    </div>
                  ))}
                </div>
                <div className={`flex gap-3 p-4 rounded-2xl border mb-6 ${dk?"border-amber-500/20 bg-amber-500/[0.06]":"border-amber-200 bg-amber-50"}`}>
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-400 leading-relaxed font-medium">Please ensure all information is accurate. False claims may result in policy cancellation and legal action under Section 420 IPC.</p>
                </div>
                {submitError && <p className="mb-4 text-sm text-red-400" role="alert">{submitError}</p>}
                <button onClick={submitClaim} disabled={submittingClaim} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-4 rounded-xl font-extrabold transition-all hover:shadow-2xl hover:shadow-blue-700/30">
                  {submittingClaim ? "Submitting claim..." : "Submit Claim"}
                </button>
              </div>
            )}

            <div className="flex justify-between mt-6">
              <button onClick={() => setClaimStep(Math.max(1,claimStep-1))} disabled={claimStep===1} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border ${claimStep===1?"opacity-40":""} ${dk?"border-white/8 text-slate-400":"border-slate-200 text-slate-500"}`}>
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              {claimStep<4 && <button onClick={() => setClaimStep(Math.min(4,claimStep+1))} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-extrabold bg-blue-600 hover:bg-blue-500 text-white">Next <ChevronRight className="w-4 h-4" /></button>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Payments ─────────────────────────────────────────────────────────────────
const PaymentsPage = ({ darkMode, setDarkMode }: { darkMode: boolean; setDarkMode: (v: boolean) => void }) => {
  const [method, setMethod] = useState("UPI");
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const [paymentRows, setPaymentRows] = useState<Awaited<ReturnType<typeof paymentsApi.getAll>>>([]);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const dk = darkMode;
  const cardCls = `rounded-[20px] border ${dk?"bg-slate-800/55 border-white/[0.07]":"bg-white border-slate-100 shadow-sm"}`;
  useEffect(() => {
    paymentsApi.getAll()
      .then(setPaymentRows)
      .catch((error: unknown) => setPaymentError(error instanceof Error ? error.message : "Unable to load payments"))
      .finally(() => setPaymentLoading(false));
  }, []);

  const submitPayment = async () => {
    setPaymentSubmitting(true);
    setPaymentMessage(null);
    try {
      await paymentsApi.create({ amount: 12000, paymentMethod: method, paymentStatus: "Success", description: "Premium payment", customerId: undefined, policyId: undefined });
      const refreshedPayments = await paymentsApi.getAll();
      setPaymentRows(refreshedPayments);
      setPaymentMessage("Payment recorded successfully.");
    } catch (error) {
      setPaymentMessage(error instanceof Error ? error.message : "Unable to record payment");
    } finally {
      setPaymentSubmitting(false);
    }
  };
  return (
    <div className={`min-h-screen ${dk?"bg-[#0A0F1E] text-white":"bg-slate-50 text-slate-900"}`}>
      <TopBar title="Payment Center" subtitle="Pay premiums and track payment history" darkMode={darkMode} setDarkMode={setDarkMode} />
      <div className="p-6 grid md:grid-cols-3 gap-5">
        <div className={`${cardCls} p-6`}>
          <h3 className={`font-extrabold mb-5 ${dk?"text-white":"text-slate-900"}`}>Pay Premium</h3>
          <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/10 border border-amber-500/20 rounded-2xl p-4 mb-5">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-extrabold text-amber-400">Premium Due</span>
            </div>
            <div className="text-2xl font-black text-white">₹12,000</div>
            <div className="text-xs text-slate-400 mt-0.5">Home Shield Plus — Due 31 Dec 2024</div>
          </div>
          <div className="space-y-2 mb-5">
            {[{id:"UPI",label:"UPI",Icon:Zap,desc:"PhonePe, GPay, Paytm"},{id:"card",label:"Debit / Credit Card",Icon:CreditCard,desc:"Visa, Mastercard, RuPay"},{id:"netbanking",label:"Net Banking",Icon:Database,desc:"50+ banks supported"},{id:"wallet",label:"Wallet",Icon:Banknote,desc:"Paytm, Amazon Pay"}].map(({id,label,Icon:I,desc}) => (
              <label key={id} className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${method===id?"border-blue-500 bg-blue-600/10":dk?"border-white/[0.07] bg-slate-700/20 hover:border-white/12":"border-slate-200 hover:border-slate-300"}`}>
                <input type="radio" name="method" checked={method===id} onChange={() => setMethod(id)} className="accent-blue-500" />
                <div className="w-8 h-8 bg-blue-600/15 rounded-lg flex items-center justify-center flex-shrink-0">
                  <I className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <div className={`text-sm font-bold ${dk?"text-slate-200":"text-slate-700"}`}>{label}</div>
                  <div className="text-xs text-slate-500">{desc}</div>
                </div>
              </label>
            ))}
          </div>
          {method==="UPI" && (
            <div className="mb-5">
              <input placeholder="Enter UPI ID (name@upi)" className={`w-full py-3 px-4 rounded-xl border text-sm focus:outline-none focus:border-blue-500 ${dk?"bg-slate-700/40 border-white/8 text-white placeholder-slate-500":"bg-slate-50 border-slate-200"}`} />
            </div>
          )}
          {paymentMessage && <p className={`mb-3 text-sm ${paymentMessage.includes("successfully") ? "text-green-400" : "text-red-400"}`} role="status">{paymentMessage}</p>}
          <button onClick={submitPayment} disabled={paymentSubmitting} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3.5 rounded-xl font-extrabold transition-all hover:shadow-xl hover:shadow-blue-700/30">{paymentSubmitting ? "Recording payment..." : "Pay ₹12,000 Securely"}</button>
          <div className="flex items-center justify-center gap-2 mt-3">
            <Shield className="w-3.5 h-3.5 text-green-400" />
            <span className="text-xs text-slate-500 font-semibold">256-bit SSL • PCI-DSS Compliant</span>
          </div>
        </div>
        <div className={`md:col-span-2 ${cardCls} p-6`}>
          <div className="flex items-center justify-between mb-5">
            <h3 className={`font-extrabold ${dk?"text-white":"text-slate-900"}`}>Payment History</h3>
            <button className={`flex items-center gap-2 text-sm px-4 py-2 rounded-xl border font-bold ${dk?"border-white/8 text-slate-400":"border-slate-200 text-slate-500"}`}><Download className="w-4 h-4" /> Export</button>
          </div>
          <div className="space-y-3">
            {paymentLoading && <div className="py-12 text-center text-sm text-slate-500">Loading payments...</div>}
            {paymentError && <div className="py-12 text-center text-sm text-red-400" role="alert">{paymentError}</div>}
            {!paymentLoading && !paymentError && paymentRows.length === 0 && <div className="py-12 text-center text-sm text-slate-500">No payments found.</div>}
            {paymentRows.map(txn => (
              <div key={txn.paymentId} className={`flex items-center gap-4 p-4 rounded-2xl ${dk?"bg-slate-700/30 hover:bg-slate-700/50":"bg-slate-50 hover:bg-slate-100"} transition-all`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${txn.paymentStatus.toLowerCase()==="success"?"bg-green-500/15":"bg-blue-500/15"}`}>
                  {txn.paymentStatus.toLowerCase()==="success" ? <CheckCircle className="w-5 h-5 text-green-400" /> : <RefreshCw className="w-5 h-5 text-blue-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-bold ${dk?"text-slate-200":"text-slate-800"}`}>{txn.description || txn.policy?.policyName || "Insurance payment"}</div>
                  <div className="flex gap-3 mt-0.5">
                    <span className="text-xs text-slate-500 font-semibold">{txn.paymentDate}</span>
                    <span className="text-xs text-slate-500">via {txn.paymentMethod}</span>
                    <span className="text-xs font-mono text-slate-600">{txn.transactionId}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`text-sm font-extrabold ${txn.paymentStatus.toLowerCase()==="refunded"?"text-blue-400":dk?"text-white":"text-slate-900"}`}>
                    {txn.paymentStatus.toLowerCase()==="refunded"?"+":"-"}₹{txn.amount.toLocaleString()}
                  </div>
                  <Badge label={txn.paymentStatus} variant={txn.paymentStatus.toLowerCase()==="success"?"success":"info"} />
                </div>
                <button className={`p-2 rounded-lg ${dk?"text-slate-600 hover:text-white":"text-slate-400 hover:text-slate-700"} transition-colors`}><Download className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Analytics ────────────────────────────────────────────────────────────────
const AnalyticsPage = ({ darkMode, setDarkMode }: { darkMode: boolean; setDarkMode: (v: boolean) => void }) => {
  const dk = darkMode;
  const cardCls = `rounded-[20px] border ${dk?"bg-slate-800/55 border-white/[0.07]":"bg-white border-slate-100 shadow-sm"}`;
  const [policyAnalytics, setPolicyAnalytics] = useState<Record<string, unknown> | null>(null);
  const [claimAnalytics, setClaimAnalytics] = useState<Record<string, unknown> | null>(null);
  const [paymentAnalytics, setPaymentAnalytics] = useState<Record<string, unknown> | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  useEffect(() => {
    Promise.all([analyticsApi.policies(), analyticsApi.claims(), analyticsApi.payments()])
      .then(([policiesData, claimsData, paymentsData]) => {
        setPolicyAnalytics(policiesData);
        setClaimAnalytics(claimsData);
        setPaymentAnalytics(paymentsData);
      })
      .catch((error: unknown) => setAnalyticsError(error instanceof Error ? error.message : "Unable to load analytics"))
      .finally(() => setAnalyticsLoading(false));
  }, []);
  const byType = (policyAnalytics?.byType as Record<string, number> | undefined) || {};
  const byStatus = (claimAnalytics?.byStatus as Record<string, number> | undefined) || {};
  const monthlyRevenue = (paymentAnalytics?.monthlyRevenue as Array<{ month: number; amount: number }> | undefined) || [];
  const livePolicyMix = Object.entries(byType).map(([name, value], index) => ({ name, value, color: ["#2563EB", "#22C55E", "#8B5CF6", "#F59E0B", "#06B6D4"][index % 5] }));
  const liveClaims = Object.entries(byStatus).map(([status, count]) => ({ month: status, approved: status.toLowerCase() === "approved" || status.toLowerCase() === "settled" ? count : 0, pending: status.toLowerCase().includes("pending") || status.toLowerCase().includes("review") ? count : 0, rejected: status.toLowerCase() === "rejected" ? count : 0 }));
  const kpis = [
    { label:"Total Premium", value: policyAnalytics ? `₹${Number(policyAnalytics.totalPremium || 0).toLocaleString()}` : "...", change:"Live", up:true, Icon:TrendingUp, color:"#22C55E" },
    { label:"Claim Amount", value: claimAnalytics ? `₹${Number(claimAnalytics.totalClaimAmount || 0).toLocaleString()}` : "...", change:"Live", up:true, Icon:Activity, color:"#2563EB" },
    { label:"Approved Claims", value: claimAnalytics ? String(claimAnalytics.totalClaims || 0) : "...", change:"Live", up:true, Icon:RefreshCw, color:"#8B5CF6" },
    { label:"Payments Received", value: paymentAnalytics ? `₹${Number(paymentAnalytics.totalReceived || 0).toLocaleString()}` : "...", change:"Live", up:true, Icon:Star, color:"#F59E0B" },
  ];
  return (
    <div className={`min-h-screen ${dk?"bg-[#0A0F1E] text-white":"bg-slate-50 text-slate-900"}`}>
      <TopBar title="Analytics & Reports" subtitle="Business intelligence for smarter decisions" darkMode={darkMode} setDarkMode={setDarkMode} />
      <div className="p-6 space-y-5">
        {analyticsLoading && <div className="text-sm text-slate-500">Loading analytics...</div>}
        {analyticsError && <div className="text-sm text-red-400" role="alert">{analyticsError}</div>}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map(({ label, value, change, up, Icon: I, color }) => (
            <div key={label} className={`${cardCls} p-5`}>
              <div className="flex justify-between mb-3">
                <div className="p-2.5 rounded-xl" style={{ background: `${color}20` }}><I className="w-5 h-5" style={{ color }} /></div>
                <div className={`flex items-center gap-1 text-xs font-extrabold ${up?"text-green-400":"text-red-400"}`}>
                  {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{change}
                </div>
              </div>
              <div className={`text-2xl font-extrabold ${dk?"text-white":"text-slate-900"}`}>{value}</div>
              <div className="text-xs text-slate-500 font-semibold mt-0.5">{label}</div>
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div className={`${cardCls} p-6`}>
            <h3 className={`font-extrabold mb-5 ${dk?"text-white":"text-slate-900"}`}>Premium vs Claims — 2024 (₹ Lakhs)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <RechartsBar data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke={dk?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.04)"} />
                <XAxis dataKey="month" tick={{ fill:"#64748B", fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:"#64748B", fontSize:11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background:dk?"#1E293B":"#fff", border:"none", borderRadius:14, fontSize:12 }} />
                <Legend />
                <Bar dataKey="amount" name="Payments" fill="#2563EB" radius={[5,5,0,0]} />
              </RechartsBar>
            </ResponsiveContainer>
          </div>
          <div className={`${cardCls} p-6`}>
            <h3 className={`font-extrabold mb-5 ${dk?"text-white":"text-slate-900"}`}>Policy Portfolio Mix</h3>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={210}>
                <PieChart>
                  <Pie data={livePolicyMix} cx="50%" cy="50%" outerRadius={82} innerRadius={40} dataKey="value" strokeWidth={0}>
                    {livePolicyMix.map((e,i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background:dk?"#1E293B":"#fff", border:"none", borderRadius:14, fontSize:12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2.5">
                {livePolicyMix.map(({ name, value, color }) => (
                  <div key={name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className={`text-sm flex-1 font-medium ${dk?"text-slate-300":"text-slate-600"}`}>{name}</span>
                    <span className={`text-sm font-extrabold ${dk?"text-white":"text-slate-900"}`}>{value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className={`${cardCls} p-6`}>
          <h3 className={`font-extrabold mb-5 ${dk?"text-white":"text-slate-900"}`}>Claims Analytics — H1 2024</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={liveClaims}>
              <defs>
                <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22C55E" stopOpacity={0.25} /><stop offset="100%" stopColor="#22C55E" stopOpacity={0} /></linearGradient>
                <linearGradient id="ag2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F59E0B" stopOpacity={0.2} /><stop offset="100%" stopColor="#F59E0B" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={dk?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.04)"} />
              <XAxis dataKey="month" tick={{ fill:"#64748B", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"#64748B", fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background:dk?"#1E293B":"#fff", border:"none", borderRadius:14, fontSize:12 }} />
              <Legend />
              <Area type="monotone" dataKey="approved" name="Approved" stroke="#22C55E" strokeWidth={2.5} fill="url(#ag1)" />
              <Area type="monotone" dataKey="pending" name="Pending" stroke="#F59E0B" strokeWidth={2} fill="url(#ag2)" />
              <Area type="monotone" dataKey="rejected" name="Rejected" stroke="#EF4444" strokeWidth={2} fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className={`${cardCls} p-6`}>
          <h3 className={`font-extrabold mb-5 ${dk?"text-white":"text-slate-900"}`}>Top Agent Performance — November 2024</h3>
          <div className="space-y-4">
            {agentPerf.map(({ name, policies: pol, premium, target }, i) => (
              <div key={name} className="flex items-center gap-4">
                <div className={`text-sm font-extrabold w-6 text-center ${i===0?"text-amber-400":i===1?"text-slate-300":i===2?"text-amber-600":"text-slate-500"}`}>#{i+1}</div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-violet-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-extrabold text-white">{name.split(" ").map(w => w[0]).join("")}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-bold ${dk?"text-slate-200":"text-slate-800"}`}>{name}</div>
                  <div className="text-xs text-slate-500 font-semibold">{pol} policies • ₹{premium}L premium</div>
                  <div className={`h-1.5 rounded-full mt-1.5 overflow-hidden ${dk?"bg-slate-700":"bg-slate-100"}`}>
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${target}%` }} />
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`text-sm font-extrabold ${dk?"text-white":"text-slate-900"}`}>{target}%</div>
                  <div className="text-xs text-slate-500">of target</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
const AdminPage = ({ darkMode, setDarkMode }: { darkMode: boolean; setDarkMode: (v: boolean) => void }) => {
  const dk = darkMode;
  const [activeTab, setActiveTab] = useState("Customers");
  const [customerRows, setCustomerRows] = useState<Array<{ name: string; email: string; policies: number; premium: number; status: string; since: string }>>([]);
  const [customerLoading, setCustomerLoading] = useState(true);
  const [customerError, setCustomerError] = useState<string | null>(null);
  const cardCls = `rounded-[20px] border ${dk?"bg-slate-800/55 border-white/[0.07]":"bg-white border-slate-100 shadow-sm"}`;
  useEffect(() => {
    customersApi.getAll()
      .then((data) => setCustomerRows(data.map((customer) => ({
        name: customer.name,
        email: customer.email,
        policies: 0,
        premium: 0,
        status: "Active",
        since: "-",
      }))))
      .catch((error: unknown) => setCustomerError(error instanceof Error ? error.message : "Unable to load customers"))
      .finally(() => setCustomerLoading(false));
  }, []);
  const adminStats = [
    { label:"Total Customers", value:"2,47,891", Icon:Users, color:"#2563EB" },
    { label:"Active Policies", value:"4,82,341", Icon:FileText, color:"#22C55E" },
    { label:"Pending Claims", value:"1,234", Icon:AlertCircle, color:"#F59E0B" },
    { label:"Total Revenue", value:"₹847Cr", Icon:TrendingUp, color:"#8B5CF6" },
    { label:"Agents", value:"3,891", Icon:UserCheck, color:"#06B6D4" },
    { label:"Surveyors", value:"892", Icon:MapPin, color:"#EF4444" },
  ];
  return (
    <div className={`min-h-screen ${dk?"bg-[#0A0F1E] text-white":"bg-slate-50 text-slate-900"}`}>
      <TopBar title="Admin Dashboard" subtitle="System-wide oversight and management" darkMode={darkMode} setDarkMode={setDarkMode} />
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {adminStats.map(({ label, value, Icon: I, color }) => (
            <div key={label} className={`${cardCls} p-4`}>
              <div className="p-2 rounded-xl inline-flex mb-3" style={{ background: `${color}20` }}><I className="w-4 h-4" style={{ color }} /></div>
              <div className={`text-xl font-extrabold ${dk?"text-white":"text-slate-900"}`}>{value}</div>
              <div className="text-xs text-slate-500 font-semibold mt-0.5">{label}</div>
            </div>
          ))}
        </div>
        <div className={`${cardCls} p-6`}>
          <h3 className={`font-extrabold mb-4 ${dk?"text-white":"text-slate-900"}`}>System Health</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[{label:"API Gateway",status:"Operational",val:"99.98%",Icon:Server,color:"#22C55E"},{label:"Database Cluster",status:"Operational",val:"99.95%",Icon:Database,color:"#22C55E"},{label:"AI Engine",status:"Degraded",val:"98.2%",Icon:Cpu,color:"#F59E0B"},{label:"Payment Gateway",status:"Operational",val:"99.99%",Icon:CreditCard,color:"#22C55E"}].map(({label,status,val,Icon:I,color}) => (
              <div key={label} className={`p-4 rounded-2xl border ${dk?"border-white/[0.05] bg-slate-700/20":"border-slate-100 bg-slate-50"}`}>
                <div className="flex items-center gap-2 mb-2"><I className="w-4 h-4" style={{color}} /><span className={`text-xs font-bold ${dk?"text-slate-300":"text-slate-700"}`}>{label}</span></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{background:color}} /><span className="text-xs font-semibold" style={{color}}>{status}</span></div>
                  <span className={`text-xs font-mono font-extrabold ${dk?"text-white":"text-slate-900"}`}>{val}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={`${cardCls} overflow-hidden`}>
          <div className={`flex items-center justify-between p-6 border-b ${dk?"border-white/[0.04]":"border-slate-100"}`}>
            <div className="flex gap-1.5">
              {["Customers","Policies","Claims","Agents"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`text-sm px-4 py-2 rounded-xl font-bold transition-all ${activeTab===tab?"bg-blue-600 text-white":dk?"text-slate-400 hover:text-white":"text-slate-500"}`}>{tab}</button>
              ))}
            </div>
            <button className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold"><Plus className="w-4 h-4" /> Add New</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`text-xs text-slate-500 border-b ${dk?"border-white/[0.04]":"border-slate-100"}`}>
                  {["Name","Email","Policies","Annual Premium","Status","Since","Actions"].map(h => (
                    <th key={h} className="text-left px-6 py-3 font-extrabold uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customerLoading && <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">Loading customers...</td></tr>}
                {customerError && <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-red-400" role="alert">{customerError}</td></tr>}
                {!customerLoading && !customerError && customerRows.length === 0 && <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">No customers found.</td></tr>}
                {customerRows.map(c => (
                  <tr key={c.email} className={`border-b transition-colors ${dk?"border-white/[0.03] hover:bg-white/[0.02]":"border-slate-50 hover:bg-slate-50"}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-violet-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-extrabold text-white">{c.name.split(" ").map(w=>w[0]).join("")}</span>
                        </div>
                        <span className={`text-sm font-bold ${dk?"text-slate-200":"text-slate-800"}`}>{c.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">{c.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-bold">{c.policies}</td>
                    <td className={`px-6 py-4 text-sm font-extrabold ${dk?"text-slate-200":"text-slate-800"}`}>₹{c.premium.toLocaleString()}</td>
                    <td className="px-6 py-4"><Badge label={c.status} variant={c.status==="VIP"?"info":c.status==="Premium"?"success":"neutral"} /></td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-semibold">{c.since}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                        <button className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Agent Portal ─────────────────────────────────────────────────────────────
const AgentPage = ({ darkMode, setDarkMode }: { darkMode: boolean; setDarkMode: (v: boolean) => void }) => {
  const dk = darkMode;
  const cardCls = `rounded-[20px] border ${dk?"bg-slate-800/55 border-white/[0.07]":"bg-white border-slate-100 shadow-sm"}`;
  const [leads, setLeads] = useState<Array<{ name: string; phone: string; type: string; value: number; stage: string; hot: boolean }>>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    customersApi.getAll()
      .then((customers) => setLeads(customers.map((customer) => ({ name: customer.name, phone: customer.phone, type: "Customer", value: 0, stage: "Active", hot: false }))))
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className={`min-h-screen ${dk?"bg-[#0A0F1E] text-white":"bg-slate-50 text-slate-900"}`}>
      <TopBar title="Agent Portal" subtitle="Manage leads, sales, and performance" darkMode={darkMode} setDarkMode={setDarkMode} />
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[{label:"Active Leads",value:"147",Icon:Users,color:"#2563EB"},{label:"Policies Sold",value:"52",Icon:FileText,color:"#22C55E"},{label:"Commission",value:"₹1.84L",Icon:DollarSign,color:"#F59E0B"},{label:"Target Achievement",value:"92%",Icon:Target,color:"#8B5CF6"}].map(({label,value,Icon:I,color}) => (
            <div key={label} className={`${cardCls} p-5`}>
              <div className="p-2.5 rounded-xl inline-flex mb-3" style={{ background: `${color}20` }}><I className="w-5 h-5" style={{ color }} /></div>
              <div className={`text-2xl font-extrabold ${dk?"text-white":"text-slate-900"}`}>{value}</div>
              <div className="text-xs text-slate-500 font-semibold mt-0.5">{label}</div>
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          <div className={`md:col-span-2 ${cardCls} p-6`}>
            <div className="flex items-center justify-between mb-5">
              <h3 className={`font-extrabold ${dk?"text-white":"text-slate-900"}`}>Active Leads Pipeline</h3>
              <button className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl bg-blue-600 text-white font-extrabold"><Plus className="w-4 h-4" /> Add Lead</button>
            </div>
            <div className="space-y-3">
              {loading && <div className="py-8 text-center text-sm text-slate-500">Loading customers...</div>}
              {!loading && leads.length === 0 && <div className="py-8 text-center text-sm text-slate-500">No customers found.</div>}
              {leads.map(lead => {
                const it = insTypes.find(t => t.label === lead.type);
                return (
                  <div key={lead.name} className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${dk?"bg-slate-700/30 hover:bg-slate-700/50":"bg-slate-50 hover:bg-slate-100"}`}>
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `${it?.color||"#2563EB"}20` }}>
                      {it && <it.Icon className="w-5 h-5" style={{ color: it.color }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-bold ${dk?"text-slate-200":"text-slate-800"}`}>{lead.name}</span>
                        {lead.hot && <span className="text-[10px] bg-red-500/15 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded-full font-extrabold">🔥 Hot</span>}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">{lead.phone} • {lead.type}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-sm font-extrabold ${dk?"text-white":"text-slate-900"}`}>₹{lead.value.toLocaleString()}</div>
                      <Badge label={lead.stage} variant={lead.stage==="Closed Won"?"success":lead.stage==="Negotiation"?"warning":"info"} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className={`${cardCls} p-6`}>
            <h3 className={`font-extrabold mb-5 ${dk?"text-white":"text-slate-900"}`}>🏆 Agent Leaderboard</h3>
            <div className="space-y-4">
              {agentPerf.map(({ name, policies: pol, target }, i) => (
                <div key={name} className={`flex items-center gap-3 p-3 rounded-2xl ${i===0?(dk?"bg-amber-500/10 border border-amber-500/20":"bg-amber-50 border border-amber-100"):""}`}>
                  <div className={`text-base w-6 text-center ${i===0?"text-amber-400":i===1?"text-slate-300":i===2?"text-amber-700":"text-slate-500"} font-extrabold`}>
                    {i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-violet-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-extrabold text-white">{name.split(" ").map(w=>w[0]).join("")}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-bold truncate ${dk?"text-slate-200":"text-slate-800"}`}>{name.split(" ")[0]}</div>
                    <div className="text-xs text-slate-500 font-semibold">{pol} policies</div>
                  </div>
                  <div className={`text-sm font-extrabold flex-shrink-0 ${dk?"text-white":"text-slate-900"}`}>{target}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Surveyor Portal ──────────────────────────────────────────────────────────
const SurveyorPage = ({ darkMode, setDarkMode }: { darkMode: boolean; setDarkMode: (v: boolean) => void }) => {
  const dk = darkMode;
  const [selected, setSelected] = useState<string|null>(null);
  const [assignedClaims, setAssignedClaims] = useState<Awaited<ReturnType<typeof claimsApi.getAll>>>([]);
  const [claimsLoading, setClaimsLoading] = useState(true);
  const cardCls = `rounded-[20px] border ${dk?"bg-slate-800/55 border-white/[0.07]":"bg-white border-slate-100 shadow-sm"}`;
  useEffect(() => {
    claimsApi.getAll().then(setAssignedClaims).finally(() => setClaimsLoading(false));
  }, []);
  return (
    <div className={`min-h-screen ${dk?"bg-[#0A0F1E] text-white":"bg-slate-50 text-slate-900"}`}>
      <TopBar title="Surveyor Portal" subtitle="Manage inspections and submit reports" darkMode={darkMode} setDarkMode={setDarkMode} />
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[{label:"Assigned",value:"12",color:"#2563EB",Icon:FileCheck},{label:"In Progress",value:"3",color:"#F59E0B",Icon:Activity},{label:"Completed Today",value:"5",color:"#22C55E",Icon:CheckCircle},{label:"Avg Assessment",value:"2.4h",color:"#8B5CF6",Icon:Clock}].map(({label,value,color,Icon:I}) => (
            <div key={label} className={`${cardCls} p-5`}>
              <div className="p-2.5 rounded-xl inline-flex mb-3" style={{ background: `${color}20` }}><I className="w-5 h-5" style={{ color }} /></div>
              <div className={`text-2xl font-extrabold ${dk?"text-white":"text-slate-900"}`}>{value}</div>
              <div className="text-xs text-slate-500 font-semibold mt-0.5">{label}</div>
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div className={`${cardCls} p-6`}>
            <h3 className={`font-extrabold mb-5 ${dk?"text-white":"text-slate-900"}`}>Assigned Inspections</h3>
            <div className="space-y-4">
              {claimsLoading && <div className="py-8 text-center text-sm text-slate-500">Loading assigned claims...</div>}
              {!claimsLoading && assignedClaims.length === 0 && <div className="py-8 text-center text-sm text-slate-500">No assigned claims found.</div>}
              {assignedClaims.map((claim) => (
                <div key={claim.claimId} onClick={() => setSelected(selected===String(claim.claimId)?null:String(claim.claimId))} className={`p-4 rounded-2xl border cursor-pointer transition-all ${selected===String(claim.claimId)?"border-blue-500 bg-blue-600/10":dk?"border-white/[0.07] bg-slate-700/20 hover:border-white/12":"border-slate-200 hover:border-slate-300"}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-extrabold ${dk?"text-white":"text-slate-900"}`}>{claim.claimNumber}</span>
                        <Badge label={claim.status} variant={claim.status.toLowerCase().includes("review")?"warning":claim.status.toLowerCase()==="approved"?"success":"info"} />
                      </div>
                      <div className={`text-sm mt-0.5 font-semibold ${dk?"text-slate-400":"text-slate-500"}`}>{claim.customer?.name || "Customer"}</div>
                    </div>
                    <div className="text-xs px-2.5 py-1 rounded-lg font-bold bg-blue-500/15 text-blue-400">Claim</div>
                  </div>
                  <div className="text-xs text-slate-500 font-medium flex items-center gap-1"><MapPin className="w-3 h-3" /> {claim.incidentLocation || "Location not provided"}</div>
                  <div className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1"><Calendar className="w-3 h-3" /> {claim.incidentDate}</div>
                  {selected===String(claim.claimId) && (
                    <div className={`mt-4 pt-4 border-t ${dk?"border-white/[0.05]":"border-slate-100"} space-y-3`}>
                      <div className="text-xs text-slate-500 font-semibold">Assessment: {claim.assessmentNotes || "No assessment notes yet"}</div>
                      <div className="flex gap-2">
                        <button className="flex-1 py-2 rounded-xl text-xs font-extrabold bg-blue-600 text-white">Start Inspection</button>
                        <button className={`flex-1 py-2 rounded-xl text-xs font-bold border ${dk?"border-white/8 text-slate-400":"border-slate-200 text-slate-500"}`}>Get Directions</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className={`${cardCls} p-6`}>
            <h3 className={`font-extrabold mb-5 ${dk?"text-white":"text-slate-900"}`}>Submit Inspection Report</h3>
            <div className="space-y-4">
              {[{l:"Inspection ID",dv:"INS-2024-0091"},{l:"Estimated Repair Cost",dv:"₹1,25,000"}].map(({l,dv}) => (
                <div key={l}>
                  <label className={`block text-sm font-bold mb-1.5 ${dk?"text-slate-300":"text-slate-700"}`}>{l}</label>
                  <input defaultValue={dv} className={`w-full py-3 px-4 rounded-xl border text-sm ${dk?"bg-slate-700/40 border-white/8 text-white":"bg-slate-50 border-slate-200"}`} />
                </div>
              ))}
              <div>
                <label className={`block text-sm font-bold mb-1.5 ${dk?"text-slate-300":"text-slate-700"}`}>Damage Assessment</label>
                <textarea rows={3} placeholder="Describe the damage observed in detail..." className={`w-full py-3 px-4 rounded-xl border text-sm resize-none ${dk?"bg-slate-700/40 border-white/8 text-white placeholder-slate-500":"bg-slate-50 border-slate-200"}`} />
              </div>
              <div>
                <label className={`block text-sm font-bold mb-3 ${dk?"text-slate-300":"text-slate-700"}`}>Recommendation</label>
                <div className="flex gap-2">
                  {[{r:"Approve",c:"green"},{r:"Partial",c:"amber"},{r:"Reject",c:"red"}].map(({r,c}) => (
                    <label key={r} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer text-xs font-extrabold border-${c}-500/30 bg-${c}-500/10 text-${c}-400`}>
                      <input type="radio" name="rec" className="sr-only" />{r}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className={`block text-sm font-bold mb-1.5 ${dk?"text-slate-300":"text-slate-700"}`}>Upload Photos (8 required)</label>
                <div className={`border-2 border-dashed rounded-2xl p-6 text-center ${dk?"border-white/10 bg-slate-700/20":"border-slate-200"}`}>
                  <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <div className="text-sm text-slate-500 font-medium">Drop photos here or click to upload</div>
                  <div className="text-xs text-slate-600 mt-1">JPG, PNG up to 20MB each</div>
                  <button className="mt-3 text-xs text-blue-400 hover:text-blue-300 font-extrabold">Browse Files</button>
                </div>
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-extrabold text-sm transition-all">Submit Inspection Report</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Profile & Settings ───────────────────────────────────────────────────────
const ProfilePage = ({ darkMode, setDarkMode }: { darkMode: boolean; setDarkMode: (v: boolean) => void }) => {
  const dk = darkMode;
  const [activeSection, setActiveSection] = useState("Personal Info");
  const cardCls = `rounded-[20px] border ${dk?"bg-slate-800/55 border-white/[0.07]":"bg-white border-slate-100 shadow-sm"}`;
  const sections = ["Personal Info","KYC & Documents","Notifications","Security","Preferences"];
  const inputCls = `w-full py-3 px-4 rounded-xl border text-sm focus:outline-none focus:border-blue-500 transition-colors ${dk?"bg-slate-700/40 border-white/8 text-white":"bg-slate-50 border-slate-200 text-slate-900"}`;
  return (
    <div className={`min-h-screen ${dk?"bg-[#0A0F1E] text-white":"bg-slate-50 text-slate-900"}`}>
      <TopBar title="Profile & Settings" subtitle="Manage your account and preferences" darkMode={darkMode} setDarkMode={setDarkMode} />
      <div className="p-6 grid md:grid-cols-4 gap-5">
        <div className={`${cardCls} p-4 h-fit`}>
          <div className="text-center py-6 border-b border-white/[0.05] mb-4">
            <div className="relative inline-block">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-violet-600 flex items-center justify-center mx-auto shadow-xl">
                <span className="text-2xl font-extrabold text-white">AM</span>
              </div>
              <button className="absolute -bottom-2 -right-2 w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
            <div className={`font-extrabold mt-4 ${dk?"text-white":"text-slate-900"}`}>Arjun Mehta</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">Premium Member since 2019</div>
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-xs text-green-400 font-bold">KYC Verified</span>
            </div>
          </div>
          <div className="space-y-0.5">
            {sections.map(s => (
              <button key={s} onClick={() => setActiveSection(s)} className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeSection===s?"bg-blue-600 text-white":dk?"text-slate-400 hover:text-white hover:bg-white/[0.05]":"text-slate-600 hover:bg-slate-100"}`}>{s}</button>
            ))}
          </div>
        </div>
        <div className={`md:col-span-3 ${cardCls} p-8`}>
          {activeSection === "Personal Info" && (
            <div>
              <h2 className={`text-lg font-extrabold mb-6 ${dk?"text-white":"text-slate-900"}`}>Personal Information</h2>
              <div className="grid grid-cols-2 gap-5">
                {[{l:"First Name",v:"Arjun"},{l:"Last Name",v:"Mehta"},{l:"Email Address",v:"arjun.mehta@email.com"},{l:"Mobile Number",v:"+91 98765 43210"},{l:"Date of Birth",v:"15/03/1988"},{l:"PAN Number",v:"ABCDE1234F"},{l:"Aadhaar Number",v:"XXXX XXXX 1234"},{l:"Address",v:"12 Koramangala, Bengaluru - 560034"}].map(({l,v}) => (
                  <div key={l}>
                    <label className={`block text-xs font-extrabold mb-1.5 uppercase tracking-wide ${dk?"text-slate-500":"text-slate-400"}`}>{l}</label>
                    <input defaultValue={v} className={inputCls} />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-extrabold text-sm transition-all">Save Changes</button>
                <button className={`px-6 py-3 border rounded-xl font-bold text-sm ${dk?"border-white/8 text-slate-400":"border-slate-200 text-slate-600"}`}>Discard</button>
              </div>
            </div>
          )}
          {activeSection === "KYC & Documents" && (
            <div>
              <h2 className={`text-lg font-extrabold mb-6 ${dk?"text-white":"text-slate-900"}`}>KYC & Documents</h2>
              <div className="space-y-3">
                {[{label:"Aadhaar Card",status:"Verified",date:"12 Apr 2023"},{label:"PAN Card",status:"Verified",date:"12 Apr 2023"},{label:"Bank Account",status:"Verified",date:"05 Jun 2023"},{label:"Driving License",status:"Pending",date:null},{label:"Passport",status:"Not Uploaded",date:null}].map(({label,status,date}) => (
                  <div key={label} className={`flex items-center gap-4 p-4 rounded-2xl border ${dk?"border-white/[0.07] bg-slate-700/20":"border-slate-200 bg-slate-50"}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status==="Verified"?"bg-green-500/15":status==="Pending"?"bg-amber-500/15":dk?"bg-slate-600/40":"bg-slate-200"}`}>
                      {status==="Verified" ? <CheckCircle className="w-5 h-5 text-green-400" /> : status==="Pending" ? <Clock className="w-5 h-5 text-amber-400" /> : <Upload className="w-5 h-5 text-slate-400" />}
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-bold ${dk?"text-slate-200":"text-slate-800"}`}>{label}</div>
                      {date && <div className="text-xs text-slate-500 font-medium">Uploaded {date}</div>}
                    </div>
                    <Badge label={status} variant={status==="Verified"?"success":status==="Pending"?"warning":"neutral"} />
                    <button className={`text-sm px-4 py-2 rounded-xl border font-bold ${dk?"border-white/8 text-slate-400 hover:text-white":"border-slate-200 text-slate-500"}`}>{status==="Not Uploaded"?"Upload":"View"}</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeSection === "Security" && (
            <div className="space-y-5">
              <h2 className={`text-lg font-extrabold ${dk?"text-white":"text-slate-900"}`}>Security Settings</h2>
              <div className={`p-5 rounded-2xl border ${dk?"border-white/[0.07] bg-slate-700/20":"border-slate-200 bg-slate-50"}`}>
                <h3 className={`font-extrabold mb-4 ${dk?"text-white":"text-slate-900"}`}>Change Password</h3>
                {["Current Password","New Password","Confirm New Password"].map(p => (
                  <div key={p} className="mb-4">
                    <label className={`block text-sm font-bold mb-1.5 ${dk?"text-slate-300":"text-slate-700"}`}>{p}</label>
                    <input type="password" className={inputCls} />
                  </div>
                ))}
                <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-extrabold text-sm">Update Password</button>
              </div>
              <div className={`p-5 rounded-2xl border ${dk?"border-white/[0.07] bg-slate-700/20":"border-slate-200 bg-slate-50"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-extrabold ${dk?"text-white":"text-slate-900"}`}>Two-Factor Authentication</h3>
                    <p className="text-sm text-slate-500 mt-0.5 font-medium">Enabled via SMS OTP</p>
                  </div>
                  <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-md" />
                  </div>
                </div>
              </div>
            </div>
          )}
          {(activeSection==="Notifications"||activeSection==="Preferences") && (
            <div>
              <h2 className={`text-lg font-extrabold mb-6 ${dk?"text-white":"text-slate-900"}`}>{activeSection}</h2>
              <div className="space-y-3">
                {(activeSection==="Notifications"
                  ? ["Policy renewal reminders (7 days before)","Premium payment due alerts","Claim status updates","Surveyor inspection schedules","New insurance offers & discounts","Monthly account statements","AI-powered risk insights"]
                  : ["Dark Mode","Compact Dashboard View","Hindi Language Support","High Contrast Mode","Show Premium Amounts in Lakhs","Enable Biometric Login"]
                ).map((setting,i) => (
                  <div key={setting} className={`flex items-center justify-between p-4 rounded-2xl border ${dk?"border-white/[0.07] bg-slate-700/20":"border-slate-200 bg-slate-50"}`}>
                    <span className={`text-sm font-bold ${dk?"text-slate-200":"text-slate-800"}`}>{setting}</span>
                    <div className={`w-11 h-6 rounded-full relative cursor-pointer ${i%2===0?"bg-blue-600":dk?"bg-slate-600":"bg-slate-300"}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${i%2===0?"right-1":"left-1"}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<Page>("landing");
  const [darkMode, setDarkMode] = useState(true);
  const [storedUser] = useState(() => getStoredUser());
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(storedUser));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const role = (getStoredUser()?.role || "CUSTOMER").toUpperCase();
  const allowedPages = new Set<Page>(role === "ADMIN"
    ? ["dashboard", "marketplace", "quote", "policies", "claims", "payments", "analytics", "admin", "agent", "surveyor", "profile"]
    : role === "AGENT"
      ? ["dashboard", "policies", "claims", "payments", "agent", "profile"]
      : role === "SURVEYOR"
        ? ["dashboard", "claims", "surveyor", "profile"]
        : ["dashboard", "marketplace", "quote", "policies", "claims", "payments", "profile"]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (storedUser) setPage("dashboard");
  }, [storedUser]);

  const handleLogin = async (username: string, password: string) => {
    await login(username, password);
    setIsLoggedIn(true);
    setPage("dashboard");
  };
  const handleLogout = () => { logout(); setIsLoggedIn(false); setPage("landing"); };

  if (!isLoggedIn) {
    if (page === "login") return <AuthPage onLogin={handleLogin} onBack={() => setPage("landing")} />;
    return <LandingPage onLogin={() => setPage("login")} darkMode={darkMode} setDarkMode={setDarkMode} />;
  }

  const pageMap: Record<string, JSX.Element> = {
    dashboard: <DashboardPage darkMode={darkMode} setDarkMode={setDarkMode} />,
    marketplace: <MarketplacePage darkMode={darkMode} setDarkMode={setDarkMode} />,
    quote: <QuotePage darkMode={darkMode} setDarkMode={setDarkMode} />,
    policies: <PoliciesPage darkMode={darkMode} setDarkMode={setDarkMode} />,
    claims: <ClaimsPage darkMode={darkMode} setDarkMode={setDarkMode} />,
    payments: <PaymentsPage darkMode={darkMode} setDarkMode={setDarkMode} />,
    analytics: <AnalyticsPage darkMode={darkMode} setDarkMode={setDarkMode} />,
    admin: <AdminPage darkMode={darkMode} setDarkMode={setDarkMode} />,
    agent: <AgentPage darkMode={darkMode} setDarkMode={setDarkMode} />,
    surveyor: <SurveyorPage darkMode={darkMode} setDarkMode={setDarkMode} />,
    profile: <ProfilePage darkMode={darkMode} setDarkMode={setDarkMode} />,
  };

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode?"dark":"" }`} style={{ background: darkMode ? "#0A0F1E" : "#F8FAFC" }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-18px); }
        }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        body { font-family: 'Plus Jakarta Sans', Inter, sans-serif; }
      `}</style>
      <Sidebar
        currentPage={page}
        onNavigate={(nextPage) => setPage(allowedPages.has(nextPage) ? nextPage : "dashboard")}
        onLogout={handleLogout}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        allowedPages={allowedPages}
      />
      <main className="flex-1 overflow-y-auto scrollbar-none">
        {pageMap[page] || pageMap.dashboard}
      </main>
    </div>
  );
}
