import axios, { type AxiosInstance } from "axios";

// ─── Types ────────────────────────────────────────────────────────────────────
export type AuthResponse = {
  token: string;
  refreshToken: string;
  tokenType: string;
  userId: number;
  username: string;
  email: string;
  role: string;
};

export type DashboardStats = {
  totalCustomers: number;
  totalPolicies: number;
  activePolicies: number;
  expiredPolicies: number;
  totalClaims: number;
  pendingClaims: number;
  approvedClaims: number;
  rejectedClaims: number;
  totalAgents: number;
  totalSurveyors: number;
  totalPremiumCollected: number;
  totalPaymentsReceived: number;
  pendingPaymentsAmount: number;
};

export type Policy = {
  policyId: number;
  policyNumber: string;
  policyName: string;
  policyType: string;
  premiumAmount: number;
  duration: number;
  policyStatus: string;
  startDate: string;
  endDate: string;
  coverageAmount: number;
  customer?: { customerId: number; name: string; email: string };
  agent?: { agentId: number; name: string; email: string };
};

export type Claim = {
  claimId: number;
  claimNumber: string;
  claimAmount: number;
  status: string;
  description: string;
  incidentDate: string;
  incidentLocation: string;
  approvedAmount: number;
  assessmentNotes: string;
  customer?: { customerId: number; name: string; email: string };
  policy?: { policyId: number; policyNumber: string; policyName: string };
  surveyor?: { surveyorId: number; name: string };
};

export type Payment = {
  paymentId: number;
  transactionId: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  paymentStatus: string;
  description: string;
  customer?: { customerId: number; name: string };
  policy?: { policyId: number; policyNumber: string; policyName: string };
};

export type Customer = {
  customerId: number;
  name: string;
  email: string;
  phone: string;
  address: string;
};

export type Agent = {
  agentId: number;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  specialization: string;
};

export type Surveyor = {
  surveyorId: number;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  department: string;
};

export type AuditLog = {
  id: number;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  username: string;
  timestamp: string;
};

// ─── Axios instance ───────────────────────────────────────────────────────────
export const api: AxiosInstance = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("insurance_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isAuthEndpoint = original?.url?.includes("/auth/");

    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("insurance_refresh_token");
      if (!refreshToken) {
        clearAuth();
        return Promise.reject(new Error("Session expired. Please log in again."));
      }

      try {
        const { data } = await axios.post<AuthResponse>("/api/v1/auth/refresh", { refreshToken });
        localStorage.setItem("insurance_token", data.token);
        localStorage.setItem("insurance_refresh_token", data.refreshToken);
        processQueue(null, data.token);
        original.headers.Authorization = `Bearer ${data.token}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuth();
        return Promise.reject(new Error("Session expired. Please log in again."));
      } finally {
        isRefreshing = false;
      }
    }

    const message = error.response?.data?.message || error.response?.data?.error || "Request failed";
    return Promise.reject(new Error(message));
  }
);

function clearAuth() {
  localStorage.removeItem("insurance_token");
  localStorage.removeItem("insurance_refresh_token");
  localStorage.removeItem("insurance_user");
  window.dispatchEvent(new Event("auth:logout"));
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export async function login(username: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/v1/auth/login", { username, password });
  localStorage.setItem("insurance_token", data.token);
  localStorage.setItem("insurance_refresh_token", data.refreshToken);
  localStorage.setItem("insurance_user", JSON.stringify(data));
  return data;
}

export async function register(payload: {
  username: string;
  email: string;
  password: string;
  role?: string;
}): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/v1/auth/register", payload);
  return data;
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const { data } = await api.post("/v1/auth/forgot-password", { email });
  return data;
}

export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  const { data } = await api.post("/v1/auth/reset-password", { token, newPassword });
  return data;
}

export function getStoredUser(): AuthResponse | null {
  try {
    const raw = localStorage.getItem("insurance_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function logout() {
  clearAuth();
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>("/analytics/dashboard");
  return data;
}

// ─── Policies ─────────────────────────────────────────────────────────────────
export const policiesApi = {
  getAll: () => api.get<Policy[]>("/policies").then((r) => r.data),
  getById: (id: number) => api.get<Policy>(`/policies/${id}`).then((r) => r.data),
  getByCustomer: (customerId: number) => api.get<Policy[]>(`/policies/customer/${customerId}`).then((r) => r.data),
  create: (dto: Partial<Policy> & { customerId?: number; agentId?: number }) =>
    api.post<Policy>("/policies", dto).then((r) => r.data),
  update: (id: number, dto: Partial<Policy> & { customerId?: number; agentId?: number }) =>
    api.put<Policy>(`/policies/${id}`, dto).then((r) => r.data),
  delete: (id: number) => api.delete(`/policies/${id}`),
};

// ─── Claims ───────────────────────────────────────────────────────────────────
export const claimsApi = {
  getAll: () => api.get<Claim[]>("/claims").then((r) => r.data),
  getById: (id: number) => api.get<Claim>(`/claims/${id}`).then((r) => r.data),
  getByCustomer: (customerId: number) => api.get<Claim[]>(`/claims/customer/${customerId}`).then((r) => r.data),
  create: (dto: {
    claimAmount: number;
    status: string;
    description: string;
    incidentDate?: string;
    incidentLocation?: string;
    customerId?: number;
    policyId?: number;
    surveyorId?: number;
  }) => api.post<Claim>("/claims", dto).then((r) => r.data),
  update: (id: number, dto: Partial<Claim> & { customerId?: number; policyId?: number; surveyorId?: number }) =>
    api.put<Claim>(`/claims/${id}`, dto).then((r) => r.data),
  delete: (id: number) => api.delete(`/claims/${id}`),
};

// ─── Payments ─────────────────────────────────────────────────────────────────
export const paymentsApi = {
  getAll: () => api.get<Payment[]>("/payments").then((r) => r.data),
  getById: (id: number) => api.get<Payment>(`/payments/${id}`).then((r) => r.data),
  getByCustomer: (customerId: number) => api.get<Payment[]>(`/payments/customer/${customerId}`).then((r) => r.data),
  create: (dto: {
    amount: number;
    paymentMethod: string;
    paymentStatus: string;
    description?: string;
    customerId?: number;
    policyId?: number;
  }) => api.post<Payment>("/payments", dto).then((r) => r.data),
  update: (id: number, dto: Partial<Payment> & { customerId?: number; policyId?: number }) =>
    api.put<Payment>(`/payments/${id}`, dto).then((r) => r.data),
};

// ─── Customers ────────────────────────────────────────────────────────────────
export const customersApi = {
  getAll: () => api.get<Customer[]>("/customers").then((r) => r.data),
  getById: (id: number) => api.get<Customer>(`/customers/${id}`).then((r) => r.data),
  create: (dto: Partial<Customer>) => api.post<Customer>("/customers", dto).then((r) => r.data),
  update: (id: number, dto: Partial<Customer>) => api.put<Customer>(`/customers/${id}`, dto).then((r) => r.data),
  delete: (id: number) => api.delete(`/customers/${id}`),
};

// ─── Agents ───────────────────────────────────────────────────────────────────
export const agentsApi = {
  getAll: () => api.get<Agent[]>("/agents").then((r) => r.data),
  getById: (id: number) => api.get<Agent>(`/agents/${id}`).then((r) => r.data),
  create: (dto: Partial<Agent>) => api.post<Agent>("/agents", dto).then((r) => r.data),
  update: (id: number, dto: Partial<Agent>) => api.put<Agent>(`/agents/${id}`, dto).then((r) => r.data),
  delete: (id: number) => api.delete(`/agents/${id}`),
};

// ─── Surveyors ────────────────────────────────────────────────────────────────
export const surveyorsApi = {
  getAll: () => api.get<Surveyor[]>("/surveyors").then((r) => r.data),
  getById: (id: number) => api.get<Surveyor>(`/surveyors/${id}`).then((r) => r.data),
  create: (dto: Partial<Surveyor>) => api.post<Surveyor>("/surveyors", dto).then((r) => r.data),
  update: (id: number, dto: Partial<Surveyor>) => api.put<Surveyor>(`/surveyors/${id}`, dto).then((r) => r.data),
  delete: (id: number) => api.delete(`/surveyors/${id}`),
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsApi = {
  dashboard: () => api.get<DashboardStats>("/analytics/dashboard").then((r) => r.data),
  policies: () => api.get<Record<string, unknown>>("/analytics/policies").then((r) => r.data),
  claims: () => api.get<Record<string, unknown>>("/analytics/claims").then((r) => r.data),
  payments: () => api.get<Record<string, unknown>>("/analytics/payments").then((r) => r.data),
};

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export const auditApi = {
  getAll: () => api.get<AuditLog[]>("/audit").then((r) => r.data),
};
