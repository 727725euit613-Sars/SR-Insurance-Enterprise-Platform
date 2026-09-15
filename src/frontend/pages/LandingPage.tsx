import React, { useState } from "react";
import {
  Shield, Car, Heart, Home, Plane, Leaf, Briefcase, Anchor, Globe,
  ArrowRight, CheckCircle, Bot, Zap, Star, ShieldCheck, Lock,
  Sun, Moon, Users, Award, Play, ChevronRight, ChevronLeft, Phone, Mail, Landmark, Scale
} from "lucide-react";
import { DEMO_PERSONAS } from "../services/api";

const insuranceTypes = [
  { label: "Motor", icon: Car, color: "#2563EB", grad: "from-blue-600 to-blue-900", desc: "Zero Dep & 24/7 Roadside Assist" },
  { label: "Health", icon: Heart, color: "#22C55E", grad: "from-green-500 to-emerald-800", desc: "10,000+ Cashless Hospitals" },
  { label: "Life", icon: Shield, color: "#8B5CF6", grad: "from-violet-500 to-violet-900", desc: "₹1 Crore Cover from ₹550/mo" },
  { label: "Property", icon: Home, color: "#F59E0B", grad: "from-amber-500 to-amber-900", desc: "All-Risk Structure & Contents" },
  { label: "Travel", icon: Plane, color: "#06B6D4", grad: "from-cyan-500 to-cyan-900", desc: "Worldwide Emergency Medical" },
  { label: "Commercial", icon: Briefcase, color: "#4F46E5", grad: "from-indigo-500 to-indigo-900", desc: "Cyber & Business Interruption" },
];

const testimonials = [
  { name: "Priya Sharma", role: "Business Owner, Bengaluru", rating: 5, text: "SR Insurance processed my property claim in under 48 hours. The surveyor assigned was prompt and the settlement via Razorpay was immediate. Outstanding experience." },
  { name: "Rajesh Kumar", role: "IT Professional, Pune", rating: 5, text: "Buying motor insurance took under 3 minutes with instant Aadhaar eKYC. The price comparison and NCB transfer saved me ₹8,200 on my premium." },
  { name: "Ananya Reddy", role: "Healthcare Worker, Chennai", rating: 5, text: "My health claim was handled seamlessly at Manipal Hospital. Cashless pre-authorization was approved in 30 minutes. Genuinely impressive platform." },
];

export const LandingPage = ({
  onLogin,
  onExploreProduct,
  darkMode,
  setDarkMode,
}: {
  onLogin: (role?: string) => void;
  onExploreProduct: (prod: string) => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: "How quickly are insurance claims acknowledged and settled?", a: "Per IRDAI regulations, every First Notice of Loss (FNOL) receives an official acknowledgement within 24 hours. Motor OD claims with surveyor reports are settled within 7 business days, and health claims at network hospitals are processed cashlessly." },
    { q: "Is Aadhaar eKYC mandatory and is my data secure?", a: "Yes, per IRDAI & UIDAI guidelines, OTP-based eKYC is completed securely. We store only an irreversible HMAC-SHA256 hash in our AWS India (ap-south-1) data center with 256-bit AES encryption." },
    { q: "Can I transfer my No Claim Bonus (NCB) from my previous insurer?", a: "Absolutely. Our quote engine automatically applies 20% to 50% NCB discounts upon submitting your expiring policy details or NCB declaration." },
    { q: "What roles are available in this enterprise insurance system?", a: "The platform provides dedicated, role-based workflows for Policyholders (Customers), POSP Agents, Underwriters, Claims Handlers, Field Surveyors, Finance Officers, and System Administrators." },
  ];

  return (
    <div className="min-h-screen bg-[#070C18] text-white overflow-x-hidden font-sans">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.04] bg-[#070C18]/90 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-700/40">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-base font-extrabold text-white leading-none tracking-tight">SR Insurance</div>
              <div className="text-[10px] text-blue-400 font-bold leading-none mt-1">Enterprise Platform • IRDAI Reg. 098</div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-400">
            <a href="#products" className="hover:text-white transition-colors">Insurance Products</a>
            <a href="#features" className="hover:text-white transition-colors">Core Capabilities</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Customer Stories</a>
            <a href="#faqs" className="hover:text-white transition-colors">Regulatory FAQs</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onLogin("login")}
              className="text-xs font-bold text-slate-300 hover:text-white px-4 py-2 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => onLogin("CUSTOMER")}
              className="text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-700/30 transition-all hover:scale-105"
            >
              Get Started →
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-6 py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-[#070C18] via-blue-950/20 to-[#070C18] pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-[480px] h-[480px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/30 rounded-full px-4 py-1.5 shadow-inner">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />
            <span className="text-xs font-bold text-blue-300">
              IRDAI-Compliant Enterprise Insurance & Claims Architecture
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white leading-[1.08] tracking-tight">
            Next-Generation <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
              Insurance & Claims
            </span>
            <br />
            Management System
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-400 leading-relaxed font-medium">
            A comprehensive, digital insurance lifecycle platform featuring instant Aadhaar eKYC, automated underwriting, Razorpay premium billing & claim payouts, surveyor field investigations, and reinsurance bordereaux.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onLogin("CUSTOMER")}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-extrabold text-sm shadow-2xl shadow-blue-600/40 transition-all hover:scale-105 flex items-center gap-2"
            >
              Launch Platform Portal <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onExploreProduct("Motor")}
              className="px-8 py-4 bg-white/[0.05] hover:bg-white/10 text-slate-200 border border-white/10 rounded-2xl font-extrabold text-sm transition-all"
            >
              Instant Quote Calculator
            </button>
          </div>

          {/* Persona Quick Logins */}
          <div className="pt-10 border-t border-white/[0.05]">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-3">
              Direct Role Demo Login (Appendix A RBAC Matrix)
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {DEMO_PERSONAS.map(p => (
                <button
                  key={p.role}
                  onClick={() => onLogin(p.role)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: p.badgeColor }} />
                  {p.role.replace("_", " ")}: {p.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section id="products" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            IRDAI Registered Insurance Portfolio
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Complete protection suite with transparent rate computation & instant digital issuance
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {insuranceTypes.map(item => (
            <div
              key={item.label}
              onClick={() => onExploreProduct(item.label)}
              className="p-6 rounded-3xl bg-slate-900/60 border border-white/[0.06] hover:border-blue-500/40 transition-all duration-300 hover:-translate-y-1 shadow-xl cursor-pointer group"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.grad} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-extrabold text-white mb-1">{item.label} Insurance</h3>
              <p className="text-xs text-slate-400 mb-4">{item.desc}</p>
              <div className="flex items-center justify-between text-xs font-bold text-blue-400 group-hover:text-blue-300">
                <span>Configure Policy & Quote</span>
                <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Architectural Features */}
      <section id="features" className="bg-slate-950/60 border-y border-white/[0.04] py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Enterprise Feature Matrix (FR1–FR12)
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              End-to-end policy lifecycle, claims automation, and statutory reporting
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: "Instant eKYC & Issuance", desc: "UIDAI Aadhaar OTP verification, AML sanctions screening, and automated underwriting authority clearance." },
              { icon: ShieldCheck, title: "Claims Adjudication", desc: "Digital surveyor assignment, fraud pre-screening scoring (0-100), and Razorpay payouts disbursement." },
              { icon: Landmark, title: "Reinsurance & Treaties", desc: "Automated Quota Share and Excess-of-Loss cession computation with monthly Bordereaux export." },
              { icon: Scale, title: "IRDAI Compliance & TAT", desc: "24h FNOL acknowledgement, 30d decision SLAs, IIB Motor XML export, and immutable audit trails." },
            ].map(f => (
              <div key={f.title} className="p-6 rounded-3xl bg-slate-900/40 border border-white/[0.04] space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-extrabold text-white">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section id="testimonials" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Trusted by 2,47,000+ Policyholders
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Experience reliable claim settlements and seamless policy management
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map(t => (
            <div key={t.name} className="p-6 rounded-3xl bg-slate-900/40 border border-white/[0.05] flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex gap-1 text-amber-400">
                  {Array(t.rating).fill(0).map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">"{t.text}"</p>
              </div>
              <div className="pt-6 border-t border-white/[0.04] mt-6">
                <div className="text-xs font-extrabold text-white">{t.name}</div>
                <div className="text-[10px] text-slate-500">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faqs" className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-extrabold text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-400 mt-1">Regulatory, claims, and underwriting information</p>
        </div>

        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div
              key={i}
              className="rounded-2xl bg-slate-900/40 border border-white/[0.05] overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-left px-5 py-4 flex items-center justify-between text-xs font-bold text-slate-200 hover:text-white"
              >
                <span>{f.q}</span>
                <ChevronRight className={`w-4 h-4 text-slate-500 transform transition-transform ${openFaq === i ? "rotate-90" : ""}`} />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 text-xs text-slate-400 border-t border-white/[0.03] pt-3 leading-relaxed">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

// ─── Auth / Login Page ────────────────────────────────────────────────────────
export const AuthPage = ({
  onLoginSuccess,
  onBack,
}: {
  onLoginSuccess: (username: string, password?: string) => Promise<void>;
  onBack: () => void;
}) => {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("Admin@1234");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onLoginSuccess(username, password);
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070C18] text-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/80 border border-white/[0.08] rounded-3xl p-8 shadow-2xl backdrop-blur-2xl relative z-10">
        <button
          onClick={onBack}
          className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Home
        </button>

        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-600/40">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-extrabold text-white">SR Insurance Enterprise</h2>
          <p className="text-xs text-slate-400 mt-1">Sign in with your enterprise or policyholder account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide">Username / Role ID</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="e.g. admin, agent1, customer1"
              className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-white/10 text-sm font-semibold text-white outline-none focus:border-blue-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-white/10 text-sm font-semibold text-white outline-none focus:border-blue-500 transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-extrabold text-sm shadow-xl shadow-blue-700/40 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            {loading ? "Authenticating..." : "Sign In to Platform →"}
          </button>
        </form>

        {/* Quick Demo Presets */}
        <div className="mt-8 pt-6 border-t border-white/[0.06]">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 text-center mb-3">
            Quick Persona Autofill
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_PERSONAS.slice(0, 6).map(p => (
              <button
                key={p.role}
                type="button"
                onClick={() => {
                  setUsername(p.username);
                  setPassword(`${p.username.charAt(0).toUpperCase() + p.username.slice(1)}@1234`);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-[11px] font-bold text-slate-300 text-left truncate"
              >
                {p.role.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
