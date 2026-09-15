import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { insuranceStore, type PolicyModel, type ClaimModel, type PaymentModel, type CustomerModel, type AgentModel, type SurveyorModel } from "./insuranceStore";

export type AuthResponse = { token: string; refreshToken: string; tokenType: string; userId: number; username: string; email: string; role: string };
export type Customer = { customerId: number; name: string; email: string; phone: string; address: string };
export type Agent = { agentId: number; name: string; email: string; phone: string; licenseNumber: string; specialization: string };
export type Surveyor = { surveyorId: number; name: string; email: string; phone: string; specialization: string; department: string };
export type Policy = { policyId: number; policyNumber: string; policyName: string; policyType: string; premiumAmount: number; duration: number; policyStatus: string; startDate?: string; endDate?: string; coverageAmount?: number; customer?: Pick<Customer, "customerId" | "name" | "email" | "phone">; agent?: Pick<Agent, "agentId" | "name" | "email"> };
export type Claim = { claimId: number; claimNumber: string; claimAmount: number; status: string; description: string; incidentDate?: string; incidentLocation?: string; approvedAmount?: number; assessmentNotes?: string; customer?: Pick<Customer, "customerId" | "name" | "email">; policy?: { policyId: number; policyNumber: string; policyName: string; policyType: string }; surveyor?: Pick<Surveyor, "surveyorId" | "name" | "email" | "phone"> };
export type Payment = { paymentId: number; transactionId: string; amount: number; paymentMethod: string; paymentDate: string; paymentStatus: string; description?: string; customer?: Pick<Customer, "customerId" | "name" | "email">; policy?: Pick<Policy, "policyId" | "policyNumber" | "policyName"> };
export type DashboardStats = { totalCustomers: number; totalPolicies: number; activePolicies: number; expiredPolicies: number; totalClaims: number; pendingClaims: number; approvedClaims: number; rejectedClaims: number; totalAgents: number; totalSurveyors: number; totalPremiumCollected: number; totalPaymentsReceived: number; pendingPaymentsAmount: number };
export type AuditLog = { id: number; username?: string; action: string; entityType?: string; entityId?: string; timestamp?: string; description?: string };
export type Endorsement = { endorsementId: number; endorsementNumber: string; endorsementType: string; description: string; status: string; effectiveDate: string; premiumAdjustment?: number; createdAt?: string; approvedBy?: string; oldValue?: string; newValue?: string; policy?: Pick<Policy, "policyId" | "policyNumber" | "policyName">; customer?: Pick<Customer, "customerId" | "name" | "email"> };

const ACCESS_KEY = "insurance_token";
const REFRESH_KEY = "insurance_refresh_token";
const USER_KEY = "insurance_user";
const REGISTERED_USERS_KEY = "insurance_registered_users";

export const api: AxiosInstance = axios.create({ baseURL: "/api", headers: { "Content-Type": "application/json" }, timeout: 10000 });

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(ACCESS_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function storeAuth(auth: AuthResponse) {
  localStorage.setItem(ACCESS_KEY, auth.token);
  localStorage.setItem(REFRESH_KEY, auth.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(auth));
}

function clearAuth() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("auth:logout"));
}

const delay = (ms = 30) => new Promise(resolve => setTimeout(resolve, ms));

const DEMO_USERS: Record<string, { role: string; email: string; userId: number }> = {
  admin: { role: "ADMIN", email: "admin@srinsurance.com", userId: 1 },
  agent1: { role: "AGENT", email: "agent1@srinsurance.com", userId: 2 },
  customer1: { role: "CUSTOMER", email: "customer1@srinsurance.com", userId: 3 },
  surveyor1: { role: "SURVEYOR", email: "surveyor1@srinsurance.com", userId: 4 },
};

export async function login(username: string, password: string): Promise<AuthResponse> {
  await delay();
  if (!username.trim()) throw new Error("Username is required");
  if (!password.trim()) throw new Error("Password is required");

  const lowerUser = username.toLowerCase().trim();
  const demoMatch = DEMO_USERS[lowerUser];

  let userRole = demoMatch?.role;
  let userEmail = demoMatch?.email;
  let userId = demoMatch?.userId || Math.floor(Math.random() * 1000) + 10;

  if (!userRole) {
    // Check registered users
    const registered: Array<{ username: string; email: string; role?: string }> = JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY) || "[]");
    const found = registered.find(u => u.username.toLowerCase() === lowerUser);
    if (found) {
      userRole = found.role || "CUSTOMER";
      userEmail = found.email;
    } else {
      if (lowerUser.includes("admin")) userRole = "ADMIN";
      else if (lowerUser.includes("agent")) userRole = "AGENT";
      else if (lowerUser.includes("surveyor")) userRole = "SURVEYOR";
      else userRole = "ADMIN";
      userEmail = `${lowerUser}@srinsurance.com`;
    }
  }

  const auth: AuthResponse = {
    token: `mock_jwt_token_${Date.now()}`,
    refreshToken: `mock_refresh_token_${Date.now()}`,
    tokenType: "Bearer",
    userId,
    username,
    email: userEmail,
    role: userRole,
  };

  storeAuth(auth);
  return auth;
}

export async function register(payload: { username: string; email: string; password: string }): Promise<AuthResponse> {
  await delay();
  if (!payload.username.trim() || !payload.email.trim() || !payload.password.trim()) {
    throw new Error("All registration fields are required");
  }

  const registered = JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY) || "[]");
  registered.push({ username: payload.username, email: payload.email, role: "CUSTOMER" });
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registered));

  const auth: AuthResponse = {
    token: `mock_jwt_token_${Date.now()}`,
    refreshToken: `mock_refresh_token_${Date.now()}`,
    tokenType: "Bearer",
    userId: registered.length + 10,
    username: payload.username,
    email: payload.email,
    role: "CUSTOMER",
  };

  storeAuth(auth);
  return auth;
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  await delay();
  return { message: `Password reset instructions sent to ${email}. Token: TOK-${Math.floor(100000 + Math.random() * 900000)}` };
}

export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  await delay();
  if (!token.trim()) throw new Error("Reset token is required");
  if (!newPassword.trim()) throw new Error("New password is required");
  return { message: "Password has been successfully reset. You can now login." };
}

export function getStoredUser(): AuthResponse | null {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null") as AuthResponse | null;
  } catch {
    return null;
  }
}

export function logout() {
  clearAuth();
}

export function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined;
    return data?.message || data?.error || error.message;
  }
  return error instanceof Error ? error.message : "Request failed";
}

function mapPolicy(p: PolicyModel): Policy {
  return {
    policyId: p.policyId,
    policyNumber: p.policyNumber,
    policyName: p.productName || p.name || p.policyNumber,
    policyType: p.policyType,
    premiumAmount: p.annualPremium || p.grossPremium || p.premiumPaid || 15000,
    duration: 12,
    policyStatus: p.status,
    startDate: p.startDate,
    endDate: p.endDate,
    coverageAmount: p.sumInsured,
    customer: {
      customerId: p.customerId || 1,
      name: p.customerName || "Customer",
      email: p.customerEmail || "customer@sr.com",
      phone: p.customerPhone || "+91 98765 43210",
    },
    agent: p.agentId ? {
      agentId: p.agentId,
      name: p.agentName || "Agent",
      email: "agent@sr.com",
    } : undefined,
  };
}

function mapClaim(c: ClaimModel): Claim {
  const surveyors = insuranceStore.getSurveyors();
  const matchedSurveyor = c.surveyorId ? surveyors.find(s => s.surveyorId === c.surveyorId) : undefined;
  return {
    claimId: c.claimId,
    claimNumber: c.claimNumber,
    claimAmount: c.estimatedLoss || c.estimatedAmount || 25000,
    status: c.status,
    description: c.description,
    incidentDate: c.incidentDate,
    incidentLocation: c.incidentLocation,
    approvedAmount: c.approvedAmount !== null && c.approvedAmount !== undefined ? Number(c.approvedAmount) : undefined,
    assessmentNotes: c.surveyorNotes,
    customer: {
      customerId: c.customerId,
      name: c.customerName,
      email: "customer@sr.com",
    },
    policy: {
      policyId: c.policyId,
      policyNumber: c.policyNumber,
      policyName: c.policyNumber,
      policyType: c.policyType,
    },
    surveyor: matchedSurveyor ? {
      surveyorId: matchedSurveyor.surveyorId,
      name: matchedSurveyor.name,
      email: matchedSurveyor.email,
      phone: matchedSurveyor.contactMobile,
    } : undefined,
  };
}

function mapPayment(p: PaymentModel): Payment {
  return {
    paymentId: p.paymentId,
    transactionId: p.transactionId || p.receiptNumber,
    amount: p.amount,
    paymentMethod: p.paymentMethod,
    paymentDate: p.paymentDate,
    paymentStatus: p.paymentStatus,
    description: p.description,
    customer: {
      customerId: p.customerId,
      name: p.customerName,
      email: "customer@sr.com",
    },
    policy: {
      policyId: p.policyId,
      policyNumber: p.policyNumber,
      policyName: p.policyNumber,
    },
  };
}

function mapCustomer(c: CustomerModel): Customer {
  return {
    customerId: c.customerId,
    name: c.name,
    email: c.email,
    phone: c.phone || c.mobile || "",
    address: c.address,
  };
}

function mapAgent(a: AgentModel): Agent {
  return {
    agentId: a.agentId,
    name: a.name,
    email: a.email,
    phone: a.phone,
    licenseNumber: a.irdaiLicenseNo,
    specialization: a.tier,
  };
}

function mapSurveyor(s: SurveyorModel): Surveyor {
  return {
    surveyorId: s.surveyorId,
    name: s.name,
    email: s.email,
    phone: s.contactMobile,
    specialization: s.specialization,
    department: s.district ? `${s.district} Hub` : "General Claims",
  };
}

export const policiesApi = {
  getAll: async (): Promise<Policy[]> => {
    await delay();
    return insuranceStore.getPolicies().map(mapPolicy);
  },
  create: async (p: Record<string, unknown>): Promise<Policy> => {
    await delay();
    const created = insuranceStore.addPolicy(p);
    return mapPolicy(created);
  },
  update: async (id: number, p: Record<string, unknown>): Promise<Policy> => {
    await delay();
    insuranceStore.updatePolicy(id, p as Partial<PolicyModel>);
    const pol = insuranceStore.getPolicies().find(item => item.policyId === id);
    if (!pol) throw new Error("Policy not found");
    return mapPolicy(pol);
  },
  delete: async (id: number): Promise<void> => {
    await delay();
    insuranceStore.deletePolicy(id);
  },
};

export const claimsApi = {
  getAll: async (): Promise<Claim[]> => {
    await delay();
    return insuranceStore.getClaims().map(mapClaim);
  },
  create: async (p: Record<string, unknown>): Promise<Claim> => {
    await delay();
    const created = insuranceStore.addClaim(p);
    return mapClaim(created);
  },
  update: async (id: number, p: Record<string, unknown>): Promise<Claim> => {
    await delay();
    insuranceStore.updateClaim(id, p as Partial<ClaimModel>);
    const clm = insuranceStore.getClaims().find(item => item.claimId === id);
    if (!clm) throw new Error("Claim not found");
    return mapClaim(clm);
  },
  delete: async (id: number): Promise<void> => {
    await delay();
    insuranceStore.deleteClaim(id);
  },
};

export const paymentsApi = {
  getAll: async (): Promise<Payment[]> => {
    await delay();
    return insuranceStore.getPayments().map(mapPayment);
  },
  create: async (p: Record<string, unknown>): Promise<Payment> => {
    await delay();
    const created = insuranceStore.addPayment(p);
    return mapPayment(created);
  },
  update: async (id: number, p: Record<string, unknown>): Promise<Payment> => {
    await delay();
    const updated = insuranceStore.updatePayment(id, p as Partial<PaymentModel>);
    return mapPayment(updated);
  },
};

export const customersApi = {
  getAll: async (): Promise<Customer[]> => {
    await delay();
    return insuranceStore.getCustomers().map(mapCustomer);
  },
  create: async (p: Record<string, unknown>): Promise<Customer> => {
    await delay();
    const created = insuranceStore.addCustomer(p as Partial<CustomerModel>);
    return mapCustomer(created);
  },
  update: async (id: number, p: Record<string, unknown>): Promise<Customer> => {
    await delay();
    const updated = insuranceStore.updateCustomer(id, p as Partial<CustomerModel>);
    return mapCustomer(updated);
  },
  delete: async (id: number): Promise<void> => {
    await delay();
    insuranceStore.deleteCustomer(id);
  },
};

export const agentsApi = {
  getAll: async (): Promise<Agent[]> => {
    await delay();
    return insuranceStore.getAgents().map(mapAgent);
  },
  create: async (p: Record<string, unknown>): Promise<Agent> => {
    await delay();
    const created = insuranceStore.addAgent(p as Partial<AgentModel>);
    return mapAgent(created);
  },
  update: async (id: number, p: Record<string, unknown>): Promise<Agent> => {
    await delay();
    const updated = insuranceStore.updateAgent(id, p as Partial<AgentModel>);
    return mapAgent(updated);
  },
  delete: async (id: number): Promise<void> => {
    await delay();
    insuranceStore.deleteAgent(id);
  },
};

export const surveyorsApi = {
  getAll: async (): Promise<Surveyor[]> => {
    await delay();
    return insuranceStore.getSurveyors().map(mapSurveyor);
  },
  create: async (p: Record<string, unknown>): Promise<Surveyor> => {
    await delay();
    const created = insuranceStore.addSurveyor(p as Partial<SurveyorModel>);
    return mapSurveyor(created);
  },
  update: async (id: number, p: Record<string, unknown>): Promise<Surveyor> => {
    await delay();
    const updated = insuranceStore.updateSurveyor(id, p as Partial<SurveyorModel>);
    return mapSurveyor(updated);
  },
  delete: async (id: number): Promise<void> => {
    await delay();
    insuranceStore.deleteSurveyor(id);
  },
};

export const analyticsApi = {
  dashboard: async (): Promise<DashboardStats> => {
    await delay();
    const customers = insuranceStore.getCustomers();
    const policies = insuranceStore.getPolicies();
    const claims = insuranceStore.getClaims();
    const payments = insuranceStore.getPayments();
    const agents = insuranceStore.getAgents();
    const surveyors = insuranceStore.getSurveyors();

    const totalPremiumCollected = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const totalPaymentsReceived = payments.filter(p => (p.paymentStatus || "").toLowerCase() === "success").reduce((acc, p) => acc + (p.amount || 0), 0);
    const pendingPaymentsAmount = payments.filter(p => (p.paymentStatus || "").toLowerCase() === "pending").reduce((acc, p) => acc + (p.amount || 0), 0);

    return {
      totalCustomers: customers.length,
      totalPolicies: policies.length,
      activePolicies: policies.filter(p => (p.status || "").toLowerCase().includes("active")).length,
      expiredPolicies: policies.filter(p => (p.status || "").toLowerCase().includes("expir")).length,
      totalClaims: claims.length,
      pendingClaims: claims.filter(c => ["fnol", "pending", "under review", "under investigation", "adjudicating"].includes((c.status || "").toLowerCase())).length,
      approvedClaims: claims.filter(c => (c.status || "").toLowerCase().includes("approved")).length,
      rejectedClaims: claims.filter(c => (c.status || "").toLowerCase().includes("reject")).length,
      totalAgents: agents.length,
      totalSurveyors: surveyors.length,
      totalPremiumCollected,
      totalPaymentsReceived,
      pendingPaymentsAmount,
    };
  },
  policies: async (): Promise<Record<string, unknown>> => {
    await delay();
    const policies = insuranceStore.getPolicies();
    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    let totalPremium = 0;

    for (const p of policies) {
      byType[p.policyType] = (byType[p.policyType] || 0) + 1;
      byStatus[p.status] = (byStatus[p.status] || 0) + 1;
      totalPremium += p.annualPremium || 0;
    }

    return {
      byType,
      byStatus,
      totalPremium,
      expiringThisMonth: policies.filter(p => (p.status || "").toLowerCase().includes("expir")).length,
    };
  },
  claims: async (): Promise<Record<string, unknown>> => {
    await delay();
    const claims = insuranceStore.getClaims();
    const byStatus: Record<string, number> = {};
    let totalClaimAmount = 0;
    let totalApprovedAmount = 0;

    for (const c of claims) {
      byStatus[c.status] = (byStatus[c.status] || 0) + 1;
      totalClaimAmount += c.estimatedLoss || 0;
      if (c.approvedAmount) totalApprovedAmount += c.approvedAmount;
    }

    return {
      byStatus,
      totalClaimAmount,
      totalApprovedAmount,
      totalClaims: claims.length,
    };
  },
  payments: async (): Promise<Record<string, unknown>> => {
    await delay();
    const payments = insuranceStore.getPayments();
    const byMethod: Record<string, number> = {};
    let totalReceived = 0;

    for (const p of payments) {
      byMethod[p.paymentMethod] = (byMethod[p.paymentMethod] || 0) + (p.amount || 0);
      if ((p.paymentStatus || "").toLowerCase() === "success") {
        totalReceived += p.amount || 0;
      }
    }

    return {
      monthlyRevenue: [
        { month: "Jan", amount: 24500 },
        { month: "Feb", amount: 32000 },
        { month: "Mar", amount: 18000 },
        { month: "Apr", amount: 28500 },
        { month: "May", amount: 42000 },
        { month: "Jun", amount: 56000 },
      ],
      byMethod,
      totalReceived,
      totalTransactions: payments.length,
    };
  },
};

export const auditApi = {
  getAll: async (): Promise<AuditLog[]> => {
    await delay();
    return insuranceStore.getAuditLogs().map(a => ({
      id: a.logId,
      username: a.username,
      action: a.action,
      entityType: a.entityType,
      entityId: a.entityId,
      timestamp: a.timestamp,
      description: a.description,
    }));
  },
};

export const endorsementsApi = {
  getAll: async (): Promise<Endorsement[]> => {
    await delay();
    return insuranceStore.getEndorsements().map(e => ({
      endorsementId: e.endorsementId,
      endorsementNumber: e.endorsementNumber,
      endorsementType: e.endorsementType,
      description: e.description,
      status: e.status,
      effectiveDate: e.effectiveDate,
      premiumAdjustment: e.premiumAdjustment,
      createdAt: e.createdAt,
      approvedBy: e.approvedBy,
      oldValue: e.oldValue,
      newValue: e.newValue,
      policy: {
        policyId: e.policyId,
        policyNumber: e.policyNumber,
        policyName: e.policyNumber,
      },
    }));
  },
  create: async (p: Record<string, unknown>): Promise<Endorsement> => {
    await delay();
    const created = insuranceStore.createEndorsement(p as any);
    return {
      endorsementId: created.endorsementId,
      endorsementNumber: created.endorsementNumber,
      endorsementType: created.endorsementType,
      description: created.description,
      status: created.status,
      effectiveDate: created.effectiveDate,
      premiumAdjustment: created.premiumAdjustment,
      createdAt: created.createdAt,
      approvedBy: created.approvedBy,
      oldValue: created.oldValue,
      newValue: created.newValue,
    };
  },
  approve: async (id: number): Promise<Endorsement> => {
    await delay();
    insuranceStore.approveEndorsement(id);
    const end = insuranceStore.getEndorsements().find(e => e.endorsementId === id);
    if (!end) throw new Error("Endorsement not found");
    return {
      endorsementId: end.endorsementId,
      endorsementNumber: end.endorsementNumber,
      endorsementType: end.endorsementType,
      description: end.description,
      status: end.status,
      effectiveDate: end.effectiveDate,
      premiumAdjustment: end.premiumAdjustment,
      createdAt: end.createdAt,
      approvedBy: end.approvedBy,
    };
  },
  reject: async (id: number): Promise<Endorsement> => {
    await delay();
    const end = insuranceStore.rejectEndorsement(id);
    return {
      endorsementId: end.endorsementId,
      endorsementNumber: end.endorsementNumber,
      endorsementType: end.endorsementType,
      description: end.description,
      status: end.status,
      effectiveDate: end.effectiveDate,
      premiumAdjustment: end.premiumAdjustment,
      createdAt: end.createdAt,
      approvedBy: end.approvedBy,
    };
  },
};

export const apiService = {
  login,
  logout,
  register,
  forgotPassword,
  resetPassword,
  policies: policiesApi,
  claims: claimsApi,
  payments: paymentsApi,
  customers: customersApi,
  agents: agentsApi,
  surveyors: surveyorsApi,
  analytics: analyticsApi,
  audit: auditApi,
  endorsements: endorsementsApi,
};

