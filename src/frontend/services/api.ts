import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

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

export const api: AxiosInstance = axios.create({ baseURL: "/api", headers: { "Content-Type": "application/json" }, timeout: 10000 });
let refreshRequest: Promise<AuthResponse> | null = null;

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

api.interceptors.response.use(undefined, async (error: AxiosError) => {
  const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
  const url = original?.url ?? "";
  if (error.response?.status !== 401 || !original || original._retry || url.includes("/auth/")) throw error;
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) throw error;
  original._retry = true;
  try {
    refreshRequest ??= api.post<AuthResponse>("/v1/auth/refresh", { refreshToken }).then(({ data }) => { storeAuth(data); return data; }).finally(() => { refreshRequest = null; });
    await refreshRequest;
    return api(original);
  } catch (refreshError) {
    clearAuth();
    throw refreshError;
  }
});

export async function login(username: string, password: string) { const { data } = await api.post<AuthResponse>("/v1/auth/login", { username, password }); storeAuth(data); return data; }
export async function register(payload: { username: string; email: string; password: string }) { return (await api.post<AuthResponse>("/v1/auth/register", payload)).data; }
export async function forgotPassword(email: string) { return (await api.post<{ message: string }>("/v1/auth/forgot-password", { email })).data; }
export async function resetPassword(token: string, newPassword: string) { return (await api.post<{ message: string }>("/v1/auth/reset-password", { token, newPassword })).data; }
export function getStoredUser(): AuthResponse | null { try { return JSON.parse(localStorage.getItem(USER_KEY) || "null") as AuthResponse | null; } catch { return null; } }
export function logout() { clearAuth(); }
export function errorMessage(error: unknown): string { if (axios.isAxiosError(error)) { const data = error.response?.data as { message?: string; error?: string } | undefined; return data?.message || data?.error || error.message; } return error instanceof Error ? error.message : "Request failed"; }

export const policiesApi = { getAll: () => api.get<Policy[]>("/policies").then(r => r.data), create: (p: Record<string, unknown>) => api.post<Policy>("/policies", p).then(r => r.data), update: (id: number, p: Record<string, unknown>) => api.put<Policy>(`/policies/${id}`, p).then(r => r.data), delete: (id: number) => api.delete(`/policies/${id}`) };
export const claimsApi = { getAll: () => api.get<Claim[]>("/claims").then(r => r.data), create: (p: Record<string, unknown>) => api.post<Claim>("/claims", p).then(r => r.data), update: (id: number, p: Record<string, unknown>) => api.put<Claim>(`/claims/${id}`, p).then(r => r.data), delete: (id: number) => api.delete(`/claims/${id}`) };
export const paymentsApi = { getAll: () => api.get<Payment[]>("/payments").then(r => r.data), create: (p: Record<string, unknown>) => api.post<Payment>("/payments", { paymentDate: new Date().toISOString().slice(0, 10), ...p }).then(r => r.data), update: (id: number, p: Record<string, unknown>) => api.put<Payment>(`/payments/${id}`, p).then(r => r.data) };
export const customersApi = { getAll: () => api.get<Customer[]>("/customers").then(r => r.data), create: (p: Record<string, unknown>) => api.post<Customer>("/customers", p).then(r => r.data), update: (id: number, p: Record<string, unknown>) => api.put<Customer>(`/customers/${id}`, p).then(r => r.data), delete: (id: number) => api.delete(`/customers/${id}`) };
export const agentsApi = { getAll: () => api.get<Agent[]>("/agents").then(r => r.data), create: (p: Record<string, unknown>) => api.post<Agent>("/agents", p).then(r => r.data), update: (id: number, p: Record<string, unknown>) => api.put<Agent>(`/agents/${id}`, p).then(r => r.data), delete: (id: number) => api.delete(`/agents/${id}`) };
export const surveyorsApi = { getAll: () => api.get<Surveyor[]>("/surveyors").then(r => r.data), create: (p: Record<string, unknown>) => api.post<Surveyor>("/surveyors", p).then(r => r.data), update: (id: number, p: Record<string, unknown>) => api.put<Surveyor>(`/surveyors/${id}`, p).then(r => r.data), delete: (id: number) => api.delete(`/surveyors/${id}`) };
export const analyticsApi = { 
  dashboard: () => api.get<DashboardStats>("/analytics/dashboard").then(r => r.data).catch(err => { console.error("Dashboard error:", err); throw err; }), 
  policies: () => api.get<Record<string, unknown>>("/analytics/policies").then(r => r.data).catch(err => { console.error("Policies analytics error:", err); return { byType: {}, byStatus: {}, totalPremium: 0, expiringThisMonth: 0 }; }), 
  claims: () => api.get<Record<string, unknown>>("/analytics/claims").then(r => r.data).catch(err => { console.error("Claims analytics error:", err); return { byStatus: {}, totalClaimAmount: 0, totalApprovedAmount: 0, totalClaims: 0 }; }), 
  payments: () => api.get<Record<string, unknown>>("/analytics/payments").then(r => r.data).catch(err => { console.error("Payments analytics error:", err); return { monthlyRevenue: [], byMethod: {}, totalReceived: 0, totalTransactions: 0 }; }) 
};
export const auditApi = { getAll: () => api.get<AuditLog[]>("/audit").then(r => r.data) };
export const endorsementsApi = { getAll: () => api.get<Endorsement[]>("/endorsements").then(r => r.data), create: (p: Record<string, unknown>) => api.post<Endorsement>("/endorsements", p).then(r => r.data), approve: (id: number) => api.put<Endorsement>(`/endorsements/${id}/approve`, {}).then(r => r.data), reject: (id: number) => api.put<Endorsement>(`/endorsements/${id}/reject`, {}).then(r => r.data) };
export const apiService = { login, logout, register, forgotPassword, resetPassword, policies: policiesApi, claims: claimsApi, payments: paymentsApi, customers: customersApi, agents: agentsApi, surveyors: surveyorsApi, analytics: analyticsApi, audit: auditApi, endorsements: endorsementsApi };
