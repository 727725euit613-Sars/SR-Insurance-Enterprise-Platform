import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare, Send, Bot, User, Sparkles, X,
  Minimize2, RotateCcw, ChevronRight, Shield,
  CheckCircle2, Clock, FileText, AlertCircle, Phone, ArrowUpRight
} from "lucide-react";
import { insuranceStore } from "../services/insuranceStore";
import { checkClaimTat } from "../services/srsValidator";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  actions?: Array<{ label: string; action: () => void; icon?: string }>;
  badge?: { text: string; variant: "success" | "warning" | "info" };
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "welcome-1",
    sender: "bot",
    text: "Namaste! I am **BimaSahayak AI**, your 24/7 intelligent insurance assistant. How can I assist you today?",
    timestamp: "Just now",
  }
];

export const ChatBot = ({
  darkMode,
  onNavigate
}: {
  darkMode: boolean;
  onNavigate?: (page: any) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = sessionStorage.getItem("sr_chatbot_history");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return INITIAL_MESSAGES;
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      setUnreadCount(0);
    }
  }, [messages, isOpen, isMinimized]);

  useEffect(() => {
    try {
      sessionStorage.setItem("sr_chatbot_history", JSON.stringify(messages));
    } catch (e) {
      // ignore
    }
  }, [messages]);

  const quickChips = [
    { label: "🔍 Track a Claim", query: "Track claim" },
    { label: "🛡️ NCB Slabs", query: "What are NCB slabs?" },
    { label: "⏱️ Claim TAT Rules", query: "What are claim turnaround times?" },
    { label: "⚡ File FNOL Claim", query: "How do I file a claim?" },
    { label: "📞 Grievance Helpline", query: "Grievance contact" },
    { label: "🧪 Run SRS Tests", query: "Show SRS test suite" },
  ];

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: timeStr,
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    // If query is an exact local command or claim lookup, generate structured response immediately
    const claimMatch = query.match(/CLM-[\w-]+/i) || query.match(/\b\d{4,}\b/);
    if (claimMatch || query.toLowerCase().includes("track claim") || query.toLowerCase().includes("srs test")) {
      setTimeout(() => {
        const botResponse = generateSmartResponse(query);
        setMessages(prev => [...prev, botResponse]);
        setIsTyping(false);
      }, 400);
      return;
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.response) {
          const aiMsg: Message = {
            id: `bot-${Date.now()}`,
            sender: "bot",
            text: data.response,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            badge: { text: "Gemini AI", variant: "info" }
          };
          setMessages(prev => [...prev, aiMsg]);
          setIsTyping(false);
          return;
        }
      }
    } catch (err) {
      console.warn("AI chat API fetch error, falling back to local engine:", err);
    }

    // Fallback to local rule engine
    const botResponse = generateSmartResponse(query);
    setMessages(prev => [...prev, botResponse]);
    setIsTyping(false);
  };

  const generateSmartResponse = (query: string): Message => {
    const q = query.toLowerCase();
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // 1. Claim Lookup by specific number (e.g. CLM-202401-002847 or numbers)
    const claimMatch = query.match(/CLM-[\w-]+/i) || query.match(/\b\d{4,}\b/);
    if (claimMatch || q.includes("track claim") || q.includes("claim status")) {
      const claims = insuranceStore.getClaims();
      if (claimMatch) {
        const needle = claimMatch[0].toUpperCase();
        const found = claims.find(c => c.claimNumber.toUpperCase().includes(needle) || String(c.claimId) === needle);
        if (found) {
          const tat = checkClaimTat(found.createdDate || found.incidentDate, found.lossType === "Injury" ? "HEALTH" : "MOTOR_OD");
          return {
            id: `bot-${Date.now()}`,
            sender: "bot",
            text: `Here are the live adjudication details for **${found.claimNumber}**:\n\n• **Status:** ${found.status}\n• **Loss Category:** ${found.lossType}\n• **Claim Amount:** ₹${(found.estimatedLoss ?? (found as any).claimAmount ?? 0).toLocaleString("en-IN")}\n• **Approved:** ₹${(found.approvedAmount ?? 0).toLocaleString("en-IN")}\n• **Assigned Surveyor:** ${found.surveyorName || "Under Review"}\n• **Incident Date:** ${found.incidentDate}\n• **TAT Monitoring:** Day ${tat.daysElapsed} of ${tat.limitDays} days (${tat.breach ? "BREACHED" : tat.warning ? "WARNING" : "Within Statutory SLA"})`,
            timestamp: timeStr,
            badge: {
              text: found.status,
              variant: found.status === "Approved" || found.status === "Settled" ? "success" : found.status === "Rejected" ? "warning" : "info"
            },
            actions: [
              {
                label: "View All Claims",
                action: () => onNavigate && onNavigate("claims")
              }
            ]
          };
        }
      }

      // If user just typed "track claim", display active claims list
      const recentClaims = claims.slice(0, 3);
      return {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: `Here are your recent registered claims. You can type any Claim ID or tap below to view details:\n\n` +
          recentClaims.map(c => `• **${c.claimNumber}** (${c.lossType}) — *${c.status}* (₹${((c as any).claimAmount ?? c.estimatedLoss ?? 0).toLocaleString("en-IN")})`).join("\n"),
        timestamp: timeStr,
        actions: [
          {
            label: "Open Claims Adjudication Desk",
            action: () => onNavigate && onNavigate("claims")
          },
          {
            label: "File New FNOL Claim",
            action: () => onNavigate && onNavigate("claims")
          }
        ]
      };
    }

    // 2. Policy Lookup (e.g. POL-MTR-202401-001892 or policies question)
    const policyMatch = query.match(/POL-[\w-]+/i);
    if (policyMatch || q.includes("my policy") || q.includes("policy status") || q.includes("active policies")) {
      const policies = insuranceStore.getPolicies();
      if (policyMatch) {
        const needle = policyMatch[0].toUpperCase();
        const pol = policies.find(p => p.policyNumber.toUpperCase().includes(needle) || String(p.policyId) === needle);
        if (pol) {
          return {
            id: `bot-${Date.now()}`,
            sender: "bot",
            text: `Policy Record found for **${pol.policyNumber}**:\n\n• **Customer:** ${pol.customerName}\n• **Product:** ${pol.productName}\n• **Status:** ${pol.status}\n• **Sum Insured:** ₹${(pol.sumInsured ?? 0).toLocaleString("en-IN")}\n• **Annual Premium:** ₹${(pol.annualPremium ?? 0).toLocaleString("en-IN")}\n• **Validity:** ${pol.startDate} to ${pol.endDate}\n• **Section 64VB Realized:** ${pol.isRealized ? "Yes (Cover Incepted)" : "No (Pending)"}`,
            timestamp: timeStr,
            badge: { text: pol.status, variant: pol.status === "Active" ? "success" : "warning" },
            actions: [
              { label: "View Policy Schedule", action: () => onNavigate && onNavigate("policies") }
            ]
          };
        }
      }

      return {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: `We have **${policies.length} active policies** recorded in the system. Would you like to view your policy portfolio or calculate a new quote?`,
        timestamp: timeStr,
        actions: [
          { label: "Browse Policies", action: () => onNavigate && onNavigate("policies") },
          { label: "Calculate New Quote", action: () => onNavigate && onNavigate("quote") }
        ]
      };
    }

    // 3. NCB Slabs
    if (q.includes("ncb") || q.includes("no claim bonus") || q.includes("discount")) {
      return {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: `Under **India Motor Tariff (IMT) Regulation 27**, No-Claim-Bonus (NCB) is statutory and strictly follows these slabs on Own Damage (OD) premium:\n\n• **Year 1 Claim-Free:** 20%\n• **Year 2 Consecutive:** 25%\n• **Year 3 Consecutive:** 35%\n• **Year 4 Consecutive:** 45%\n• **Year 5 Consecutive:** 50% (Max Statutory Limit)\n\n*Note: Any reported claim resets the NCB back to 0% at next policy renewal.*`,
        timestamp: timeStr,
        actions: [
          { label: "Try Instant Quote with NCB", action: () => onNavigate && onNavigate("quote") }
        ]
      };
    }

    // 4. Claim Turnaround Time (TAT) SLA
    if (q.includes("tat") || q.includes("turnaround") || q.includes("time") || q.includes("sla") || q.includes("how long")) {
      return {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: `Under **IRDAI (Protection of Policyholders' Interests) Regulations**:\n\n• **Motor Own Damage Claims:** Statutory decision limit is **7 days** from complete documentation (automated warning sent on **Day 5**).\n• **Health / Mediclaim Claims:** Statutory decision limit is **30 days** (warning sent on **Day 20**).\n• **Surveyor Deputation:** Must be assigned within **48 hours** of FNOL registration.`,
        timestamp: timeStr,
        actions: [
          { label: "Go to Claims Adjudication", action: () => onNavigate && onNavigate("claims") }
        ]
      };
    }

    // 5. Free-Look Cancellation
    if (q.includes("free look") || q.includes("freelook") || q.includes("cancel") || q.includes("refund")) {
      return {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: `Under IRDAI guidelines, every policyholder has a statutory **15-day Free-Look Period** from policy issuance.\n\n• If cancelled within **15 days**, 100% of premium is refunded minus proportionate risk premium & stamp duty charges.\n• Cancellations requested on **Day 16 or later** are subject to standard short-period retention rates (no free-look refund).`,
        timestamp: timeStr,
        actions: [
          { label: "View Policy Portfolio", action: () => onNavigate && onNavigate("policies") }
        ]
      };
    }

    // 6. Filing a Claim / FNOL
    if (q.includes("file") || q.includes("claim") || q.includes("fnol") || q.includes("accident") || q.includes("damage")) {
      return {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: `To file a **First Notice of Loss (FNOL)** claim:\n\n1. Go to **Claims Management**.\n2. Click **+ Register Claim (FNOL)**.\n3. Select your active policy & input incident date, location, and loss category.\n4. Upload FIR / photographs or repair estimate.\n5. An IRDAI licensed surveyor will be deputed within 48 hours for cashless inspection!`,
        timestamp: timeStr,
        actions: [
          { label: "Go to Claims Adjudication", action: () => onNavigate && onNavigate("claims") }
        ]
      };
    }

    // 7. Grievance Redressal
    if (q.includes("grievance") || q.includes("complaint") || q.includes("ombudsman") || q.includes("contact") || q.includes("help") || q.includes("call")) {
      return {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: `For escalated grievances or statutory assistance:\n\n• **Principal Grievance Officer:** Shri V. Ramaswamy\n• **Toll-Free SLA Support:** 1800-425-7722 (Mon–Sat 9AM to 7PM)\n• **Email:** grievance@sr-insurance.com\n• **IRDAI Bima Bharosa Portal:** https://bimabharosa.irdai.gov.in\n• **Response Guarantee:** Acknowledgement within 3 days; resolution within 14 days.`,
        timestamp: timeStr
      };
    }

    // 8. Reinsurance / Compliance / SRS tests
    if (q.includes("reinsurance") || q.includes("treaty") || q.includes("facultative") || q.includes("cession")) {
      return {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: `Under **SRS-42 FR9**, large risk exposures exceeding retentions are automatically apportioned across Surplus Quota Share treaties and Facultative placements with GIC Re and foreign reinsurers (total cession must equal 100%).`,
        timestamp: timeStr,
        actions: [
          { label: "Open Reinsurance Desk", action: () => onNavigate && onNavigate("reinsurance") }
        ]
      };
    }

    if (q.includes("srs") || q.includes("test") || q.includes("compliance") || q.includes("iib")) {
      return {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: `The platform includes an automated compliance engine covering statutory regulations (IMT Reg 27, Section 64VB, AML/KYC directives) as well as monthly IIB XML reporting.`,
        timestamp: timeStr,
        actions: [
          { label: "View IIB Compliance", action: () => onNavigate && onNavigate("compliance") }
        ]
      };
    }

    // Default Fallback
    return {
      id: `bot-${Date.now()}`,
      sender: "bot",
      text: `I'm here to help with policies, claims, quotes, and statutory rules. You can ask me:\n\n• *"What is the status of claim CLM-202401-002847?"*\n• *"How is NCB calculated?"*\n• *"What is the Free-look cancellation rule?"*\n• *"How do I submit an insurance claim?"*\n• Or use the quick buttons below!`,
      timestamp: timeStr,
      actions: [
        { label: "Track Claims", action: () => onNavigate && onNavigate("claims") },
        { label: "Instant Quote", action: () => onNavigate && onNavigate("quote") },
        { label: "Browse Policies", action: () => onNavigate && onNavigate("policies") }
      ]
    };
  };

  const clearChat = () => {
    setMessages(INITIAL_MESSAGES);
    try {
      sessionStorage.removeItem("sr_chatbot_history");
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans">
      {/* Closed State Floating Launcher Button */}
      {!isOpen && (
        <div className="relative group">
          <button
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
              setUnreadCount(0);
            }}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#0B132B] hover:bg-blue-900/90 text-white font-semibold shadow-lg shadow-black/20 hover:shadow-xl transition-all duration-200 border border-blue-500/40"
            aria-label="Open BimaSahayak AI Chatbot"
          >
            <div className="relative">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#0B132B]" />
            </div>

            <div className="text-left hidden sm:block pr-1">
              <span className="text-xs font-bold block leading-none text-white">BimaSahayak AI</span>
              <span className="text-[10px] text-slate-300 font-medium leading-none mt-1 block">Help Desk &amp; FNOL</span>
            </div>

            {unreadCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Open Chat Window */}
      {isOpen && (
        <div
          className={`w-[320px] sm:w-[350px] max-w-[calc(100vw-24px)] rounded-xl border shadow-2xl transition-all duration-300 flex flex-col ${
            isMinimized ? "h-12" : "h-[460px] max-h-[75vh]"
          } ${
            darkMode
              ? "bg-[#0B132B] border-slate-700 text-white"
              : "bg-white border-slate-200 text-slate-900 shadow-slate-200/50"
          }`}
        >
          {/* Header */}
          <div
            className={`p-3 border-b flex items-center justify-between rounded-t-2xl select-none ${
              darkMode
                ? "bg-slate-900/80 border-white/[0.08]"
                : "bg-slate-50/90 border-slate-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-blue-600/30">
                  <Bot className="w-4 h-4" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-slate-900" />
              </div>

              <div>
                <div className="flex items-center gap-1">
                  <h3 className="text-xs font-bold tracking-tight leading-none">
                    BimaSahayak AI
                  </h3>
                  <span className="px-1 py-0.2 rounded-full text-[8px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    SRS-42
                  </span>
                </div>
                <p className="text-[9px] text-slate-400 font-medium mt-0.5 leading-none">
                  Policy &amp; Claim FNOL Support
                </p>
              </div>
            </div>

            <div className="flex items-center gap-0.5">
              <button
                onClick={clearChat}
                title="Restart Conversation"
                className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
              </button>

              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? "Maximize" : "Minimize"}
                className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-colors"
              >
                <Minimize2 className="w-3 h-3" />
              </button>

              <button
                onClick={() => setIsOpen(false)}
                title="Close Chat"
                className="p-1 rounded-md text-slate-400 hover:text-red-400 hover:bg-white/[0.06] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Body (Hidden if Minimized) */}
          {!isMinimized && (
            <>
              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs leading-relaxed">
                {/* Intro notice banner */}
                <div
                  className={`p-2.5 rounded-xl border text-[10px] space-y-1 ${
                    darkMode
                      ? "bg-blue-950/30 border-blue-500/20 text-blue-200"
                      : "bg-blue-50/70 border-blue-200/60 text-blue-900"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    <Sparkles className="w-3 h-3 text-blue-400" />
                    <span>Real-time Insurance Help Desk</span>
                  </div>
                  <p className="text-slate-400 text-[9px] leading-tight">
                    Ask for policy validity, track claims by ID, or enquire about statutory NCB &amp; TAT rules.
                  </p>
                </div>

                {/* Quick Suggestion Chips */}
                {messages.length <= 2 && (
                  <div className="space-y-1 pt-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block px-0.5">
                      Quick Questions
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {quickChips.map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(chip.query)}
                          className={`text-[10px] px-2 py-1 rounded-lg border font-bold text-left transition-all ${
                            darkMode
                              ? "bg-slate-800/60 hover:bg-blue-600/20 border-white/[0.08] hover:border-blue-500/40 text-slate-300 hover:text-white"
                              : "bg-slate-100 hover:bg-blue-50 border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-900"
                          }`}
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Conversation bubbles */}
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] p-2.5 rounded-xl space-y-1.5 ${
                        msg.sender === "user"
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-sm shadow-blue-600/20"
                          : darkMode
                          ? "bg-slate-800/80 border border-white/[0.07] text-slate-200 rounded-tl-none"
                          : "bg-slate-100/90 border border-slate-200/80 text-slate-800 rounded-tl-none shadow-sm"
                      }`}
                    >
                      {/* Optional Status Badge */}
                      {msg.badge && (
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                            msg.badge.variant === "success"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : msg.badge.variant === "warning"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          }`}
                        >
                          {msg.badge.text}
                        </span>
                      )}

                      <div className="whitespace-pre-line leading-relaxed font-sans text-xs">
                        {msg.text.split(/(\*\*.*?\*\*)/g).map((part, i) => {
                          if (part.startsWith("**") && part.endsWith("**")) {
                            return <strong key={i} className="font-extrabold">{part.slice(2, -2)}</strong>;
                          }
                          return part;
                        })}
                      </div>

                      {/* Interactive Action Buttons */}
                      {msg.actions && msg.actions.length > 0 && (
                        <div className="pt-1.5 flex flex-wrap gap-1 border-t border-white/[0.08]">
                          {msg.actions.map((act, actIdx) => (
                            <button
                              key={actIdx}
                              onClick={act.action}
                              className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-extrabold transition-all ${
                                darkMode
                                  ? "bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30"
                                  : "bg-blue-100 hover:bg-blue-600 text-blue-800 hover:text-white border border-blue-300"
                              }`}
                            >
                              <span>{act.label}</span>
                              <ArrowUpRight className="w-2.5 h-2.5" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <span className="text-[9px] text-slate-400 px-1 mt-0.5">
                      {msg.timestamp}
                    </span>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-center gap-2 text-slate-400 p-2">
                    <div className="w-5 h-5 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400">
                      <Bot className="w-3 h-3" />
                    </div>
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Field */}
              <div
                className={`p-2.5 border-t flex items-center gap-1.5 rounded-b-2xl ${
                  darkMode
                    ? "bg-slate-900/90 border-white/[0.08]"
                    : "bg-slate-50 border-slate-100"
                }`}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask a question or enter Claim ID..."
                  className={`flex-1 px-3 py-2 rounded-xl border text-xs font-medium focus:outline-none transition-all ${
                    darkMode
                      ? "bg-slate-800/80 border-white/10 text-white placeholder-slate-500 focus:border-blue-500"
                      : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500"
                  }`}
                />

                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white flex items-center justify-center shadow-sm shadow-blue-600/30 transition-all active:scale-95 flex-shrink-0"
                  aria-label="Send Message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
