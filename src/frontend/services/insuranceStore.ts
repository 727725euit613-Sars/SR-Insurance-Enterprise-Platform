// ─── Insurance Platform Persistent Data Store ─────────────────────────────────
// Implements full IEEE SRS-42 data structures, business logic, and dual-layer sync.

import {
  validateAgentAuthority,
  validateActivePolicyForClaim,
  validateClaimDuplicate,
  validateFreeLookCancellation,
  validateNcbSlab,
  validateSurveyorLicense,
  validateRiCession,
  validateClaimPayee,
  SRS_ERRORS
} from "./srsValidator";

export interface CustomerModel {
  customerId: number;
  customerCode?: string;
  id?: number | string;
  name: string;
  dob?: string;
  mobile?: string;
  phone?: string;
  email: string;
  pan?: string;
  panNumber?: string;
  aadhaarHmac?: string;
  aadhaarLastFour?: string;
  address: string;
  kycStatus?: "PENDING" | "VERIFIED" | "FAILED" | string;
  ekycStatus?: string;
  amlStatus?: "CLEAR" | "FLAGGED" | "BLOCKED" | string;
  riskProfile?: string;
  creditScore?: number;
  policiesCount: number;
  totalPremium?: number;
  activeClaimsCount?: number;
  customerType?: "VIP" | "Premium" | "Standard" | string;
  sinceYear?: string;
}

export interface ProductModel {
  productId: number;
  id?: number | string;
  productName: string;
  name?: string;
  lob: "MOTOR" | "HEALTH" | "PROPERTY" | "LIFE" | "TRAVEL" | "COMMERCIAL" | string;
  category?: string;
  irdaiUin: string;
  uin?: string;
  baseRatePct: number;
  baseRatePerMille?: number;
  minSumInsured: number;
  maxSumInsured: number;
  isActive: boolean;
  active?: boolean;
  irdaApproved?: boolean;
  ratingVersion?: string;
  gstRatePct: number;
  gstRate?: number;
  description: string;
  benefits: string[];
  coverages?: string[];
}

export interface PolicyModel {
  policyId: number;
  id?: number | string;
  policyNumber: string; // Format: POL-LOB-YYYYMM-NNNNNN
  uin?: string;
  productName: string;
  name?: string;
  policyType: "Motor" | "Health" | "Life" | "Property" | "Travel" | "Commercial" | string;
  category?: string;
  sumInsured: number;
  annualPremium: number;
  grossPremium?: number;
  premiumPaid: number;
  startDate: string;
  endDate: string;
  status: "Active" | "Expiring" | "Expired" | "Renewed" | "Lapsed" | "Cancelled" | "ACTIVE" | "CANCELLED" | "PENDING" | "UNDERWRITING_REVIEW" | "PENDING_APPROVAL" | string;
  ncbPct: number; // 0, 20, 25, 35, 45, 50
  ncbPercentage?: number;
  riCededPct: number;
  customerId: number | string;
  customerCode?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  agentId?: number;
  agentName?: string;
  vehicleNo?: string;
  vehicleMake?: string;
  nomineeName?: string;
  nomineeRelation?: string;
  endorsementsCount?: number;
  previousPolicyNumber?: string;
}

export interface EndorsementModel {
  endorsementId: number;
  id?: number | string;
  endorsementNumber: string; // END-YYYYMM-NNNNNN
  policyId: number;
  policyNumber: string;
  endorsementType: "Sum Insured Change" | "Nominee Change" | "Address Change" | "Vehicle Detail Change" | "Add-on Update" | string;
  type?: string;
  description: string;
  reason?: string;
  premiumAdjustment: number;
  additionalPremium?: number;
  effectiveDate: string;
  status: "Pending" | "Approved" | "Rejected" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | string;
  approvedBy?: string;
  createdAt: string;
  requestedAt?: string;
  oldValue?: string;
  newValue?: string;
}

export interface ClaimModel {
  claimId: number;
  id?: number | string;
  claimNumber: string; // CLM-YYYYMM-NNNNNN
  policyId: number;
  policyNumber: string;
  policyType: string;
  customerId: number;
  customerName: string;
  incidentDate: string;
  fnolDate: string;
  lossType: string;
  incidentLocation: string;
  description: string;
  estimatedLoss: number;
  estimatedAmount?: number;
  approvedAmount: number | null;
  deductibles: number;
  depreciation: number;
  status: "FNOL" | "Under Review" | "Surveyor Assigned" | "Under Investigation" | "Adjudicating" | "Approved" | "Settled" | "Rejected" | "Closed" | string;
  fraudScore: number; // 0 - 100
  handlerId?: number;
  handlerName?: string;
  surveyorId?: number;
  surveyorName?: string;
  surveyorNotes?: string;
  surveyorReportSubmitted?: boolean;
  surveyFee?: number;
  tatDays: number;
  isTatBreached?: boolean;
  payeeType?: "CUSTOMER" | "GARAGE" | "HOSPITAL" | string;
  payeeBank?: string;
  payeeIfsc?: string;
  payoutTxnId?: string;
  settledAt?: string;
  photos?: string[];
  docs?: string[];
}

export interface PaymentModel {
  paymentId: number;
  id?: number | string;
  receiptNumber: string; // REC-YYYYMM-NNNNNN
  transactionId: string;
  policyId: number;
  policyNumber: string;
  customerId: number;
  customerName: string;
  amount: number;
  gstAmount: number;
  paymentMethod: "UPI" | "Debit Card" | "Credit Card" | "Net Banking" | "Cash" | "Auto Debit" | string;
  paymentDate: string;
  paymentStatus: "Success" | "Pending" | "Refunded" | "Failed" | string;
  description: string;
  gatewayRef?: string;
}

export interface SurveyorModel {
  surveyorId: number;
  name: string;
  irdaiLicenseNo: string;
  licenseExpiry: string;
  specialization: string;
  district: string;
  state: string;
  contactMobile: string;
  email: string;
  isActive: boolean;
  activeAssignments: number;
  completedSurveys: number;
  rating: number;
  totalEarnings: number;
}

export interface ReinsuranceTreatyModel {
  treatyId: number;
  treatyName: string;
  reinsurerName: string;
  treatyType: "PROPORTIONAL" | "XL_EXCESS_OF_LOSS";
  lob: string;
  cessionPct: number;
  riLimit: number;
  effectiveFrom: string;
  effectiveTo: string;
  isActive: boolean;
  totalCededPremium: number;
  totalCededClaims: number;
}

export interface AgentModel {
  agentId: number;
  agentCode: string;
  name: string;
  irdaiLicenseNo: string;
  licenseExpiry: string;
  tier: "Platinum" | "Gold" | "Silver" | "Bronze";
  phone: string;
  email: string;
  bankAccount: string;
  ifsc: string;
  commissionRatePct: number;
  walletBalance: number;
  totalGwp: number;
  policiesSold: number;
  renewalRatioPct: number;
  tdsDeductedTotal: number;
  leadsCount: number;
}

export interface LeadModel {
  leadId: number;
  name: string;
  phone: string;
  email: string;
  productType: string;
  estimatedValue: number;
  stage: "New" | "Contacted" | "Quoted" | "Negotiation" | "Proposal" | "Closed Won" | "Closed Lost";
  hot: boolean;
  notes: string;
  createdAt: string;
}

export interface GrievanceModel {
  grievanceId: number;
  tokenNo: string;
  policyNumber: string;
  customerName: string;
  customerEmail: string;
  category: "Claim Dispute" | "Delayed Settlement" | "Policy Issuance" | "Premium Discrepancy" | "Endorsement Delay";
  description: string;
  filedDate: string;
  ackSlaHours: number;
  resolutionSlaDays: number;
  status: "Acknowledged" | "Under Review" | "Resolved" | "Escalated to Ombudsman";
  resolutionNotes?: string;
}

export interface AuditLogModel {
  logId: number;
  id?: number | string;
  username: string;
  performedBy?: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  details?: string;
  ipAddress: string;
  timestamp: string;
}

// ─── Type Aliases ─────────────────────────────────────────────────────────────
export type Product = ProductModel;
export type Policy = PolicyModel;
export type Endorsement = EndorsementModel;
export type AuditLog = AuditLogModel;
export type Claim = ClaimModel;
export type Payment = PaymentModel;
export type Customer = CustomerModel;
export type Agent = AgentModel;
export type Surveyor = SurveyorModel;
export type ReinsuranceTreaty = ReinsuranceTreatyModel;
export type Grievance = GrievanceModel;
export type Lead = LeadModel;


// ─── Initial Seed Data ────────────────────────────────────────────────────────
const INITIAL_PRODUCTS: ProductModel[] = [
  { productId: 1, productName: "Comprehensive Private Car Policy", lob: "MOTOR", irdaiUin: "IRDAN106P0002V01202425", baseRatePct: 2.85, minSumInsured: 300000, maxSumInsured: 5000000, isActive: true, ratingVersion: "v2.4", gstRatePct: 18, description: "Full cover against accidental damage, theft, fire, and third-party liabilities with zero dep.", benefits: ["Zero Depreciation", "24/7 Roadside Assistance", "Engine & Gearbox Protection", "Key Replacement", "Cashless network of 5,000+ garages"] },
  { productId: 2, productName: "Family Floater Health Shield Plus", lob: "HEALTH", irdaiUin: "IRDAN106P0008V02202425", baseRatePct: 1.45, minSumInsured: 500000, maxSumInsured: 5000000, isActive: true, ratingVersion: "v3.1", gstRatePct: 18, description: "Comprehensive health hospitalization for up to 6 family members with zero co-pay.", benefits: ["Cashless in 10,000+ Hospitals", "Zero Room Rent Capping", "AYUSH Treatment Covered", "Annual Health Checkup", "Restoration of Sum Insured"] },
  { productId: 3, productName: "Smart Term Life Pure Protection", lob: "LIFE", irdaiUin: "IRDAN106N0015V01202425", baseRatePct: 0.18, minSumInsured: 2500000, maxSumInsured: 50000000, isActive: true, ratingVersion: "v1.9", gstRatePct: 18, description: "High coverage term life security for family with terminal illness and critical illness riders.", benefits: ["₹1 Crore Cover from ₹550/mo", "Critical Illness Accelerated Rider", "Waiver of Premium on Disability", "Tax Benefit under Sec 80C", "Quick 24h Death Claim Settlement"] },
  { productId: 4, productName: "Home Shield All-Risk Property", lob: "PROPERTY", irdaiUin: "IRDAN106P0022V01202425", baseRatePct: 0.25, minSumInsured: 1000000, maxSumInsured: 20000000, isActive: true, ratingVersion: "v2.0", gstRatePct: 18, description: "Protects home structure and precious contents from flood, earthquake, burglary, and fire.", benefits: ["Structure + Content Cover", "Temporary Accommodation Allowance", "Valuable Jewelry & Electronics Cover", "Natural Disaster Coverage", "Fast Track Survey"] },
  { productId: 5, productName: "Global Travel Explorer Comprehensive", lob: "TRAVEL", irdaiUin: "IRDAN106P0031V01202425", baseRatePct: 0.85, minSumInsured: 500000, maxSumInsured: 10000000, isActive: true, ratingVersion: "v1.2", gstRatePct: 18, description: "Schengen and USA compliant worldwide emergency travel medical and trip disruption cover.", benefits: ["Medical Emergency up to $500k", "Trip Cancellation / Delay", "Baggage Loss Compensation", "Passport Loss Assistance", "Emergency Evacuation"] },
  { productId: 6, productName: "Enterprise Commercial Cyber Guard", lob: "COMMERCIAL", irdaiUin: "IRDAN106P0045V01202425", baseRatePct: 3.20, minSumInsured: 5000000, maxSumInsured: 100000000, isActive: true, ratingVersion: "v1.0", gstRatePct: 18, description: "Enterprise cyber risk indemnity against ransomware, extortion, business interruption, and GDPR/DPDP penalties.", benefits: ["Ransomware Extortion Cover", "Forensic Incident Response", "Data Breach Notification Costs", "Regulatory Penalty Indemnity", "Business Interruption Loss"] },
];

const INITIAL_CUSTOMERS: CustomerModel[] = [
  { customerId: 1, name: "Arjun Mehta", dob: "1988-03-15", mobile: "+91 98765 43210", email: "arjun.mehta@email.com", pan: "ABCDE1234F", aadhaarHmac: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", address: "12 Koramangala 4th Block, Bengaluru, Karnataka - 560034", kycStatus: "VERIFIED", amlStatus: "CLEAR", policiesCount: 3, totalPremium: 74500, customerType: "VIP", sinceYear: "2019" },
  { customerId: 2, name: "Divya Krishnan", dob: "1992-07-22", mobile: "+91 98450 11223", email: "divya.k@email.com", pan: "BCDEF2345G", aadhaarHmac: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4", address: "45 Anna Nagar, Chennai, Tamil Nadu - 600040", kycStatus: "VERIFIED", amlStatus: "CLEAR", policiesCount: 2, totalPremium: 56000, customerType: "Premium", sinceYear: "2021" },
  { customerId: 3, name: "Rohit Verma", dob: "1984-11-05", mobile: "+91 97112 33445", email: "rohit.v@email.com", pan: "CDEFG3456H", aadhaarHmac: "ecd71870d1963316a97e3ac3408c9835ad8cf0f3c1bc703527c30265534f75ae", address: "78 Indiranagar 100ft Road, Bengaluru, Karnataka - 560038", kycStatus: "VERIFIED", amlStatus: "CLEAR", policiesCount: 4, totalPremium: 98000, customerType: "VIP", sinceYear: "2018" },
  { customerId: 4, name: "Meena Iyer", dob: "1995-02-18", mobile: "+91 99201 55667", email: "meena.i@email.com", pan: "DEFGH4567I", aadhaarHmac: "2c624232cdd221771294dfbb310aca000a0df6ec9b5feb9bb7dd73cc1104fadd", address: "102 Whitefield Main Road, Bengaluru, Karnataka - 560066", kycStatus: "VERIFIED", amlStatus: "CLEAR", policiesCount: 1, totalPremium: 18000, customerType: "Standard", sinceYear: "2023" },
  { customerId: 5, name: "Sanjay Gupta", dob: "1978-09-30", mobile: "+91 98100 88990", email: "sanjay.g@email.com", pan: "EFGHI5678J", aadhaarHmac: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a", address: "24 Banjara Hills, Hyderabad, Telangana - 500034", kycStatus: "VERIFIED", amlStatus: "CLEAR", policiesCount: 5, totalPremium: 142000, customerType: "VIP", sinceYear: "2017" },
];

const INITIAL_POLICIES: PolicyModel[] = [
  { policyId: 1, policyNumber: "POL-MTR-202401-001892", productName: "Comprehensive Private Car Policy", policyType: "Motor", sumInsured: 2000000, annualPremium: 24500, premiumPaid: 24500, startDate: "2024-01-15", endDate: "2025-01-14", status: "Active", ncbPct: 25, riCededPct: 20, customerId: 1, customerName: "Arjun Mehta", customerEmail: "arjun.mehta@email.com", customerPhone: "+91 98765 43210", customerAddress: "12 Koramangala 4th Block, Bengaluru", vehicleNo: "KA-01-MN-5678", vehicleMake: "Toyota Fortuner 4x4", nomineeName: "Sunita Mehta", nomineeRelation: "Spouse", agentId: 1, agentName: "Sneha Singh" },
  { policyId: 2, policyNumber: "POL-HLT-202402-002341", productName: "Family Floater Health Shield Plus", policyType: "Health", sumInsured: 1000000, annualPremium: 32000, premiumPaid: 32000, startDate: "2024-02-10", endDate: "2025-02-09", status: "Active", ncbPct: 0, riCededPct: 15, customerId: 1, customerName: "Arjun Mehta", customerEmail: "arjun.mehta@email.com", customerPhone: "+91 98765 43210", customerAddress: "12 Koramangala 4th Block, Bengaluru", nomineeName: "Sunita Mehta", nomineeRelation: "Spouse", agentId: 1, agentName: "Sneha Singh" },
  { policyId: 3, policyNumber: "POL-LIF-202308-089012", productName: "Smart Term Life Pure Protection", policyType: "Life", sumInsured: 10000000, annualPremium: 18000, premiumPaid: 18000, startDate: "2023-08-01", endDate: "2048-08-01", status: "Active", ncbPct: 0, riCededPct: 30, customerId: 1, customerName: "Arjun Mehta", customerEmail: "arjun.mehta@email.com", customerPhone: "+91 98765 43210", customerAddress: "12 Koramangala 4th Block, Bengaluru", nomineeName: "Aarav Mehta", nomineeRelation: "Son", agentId: 2, agentName: "Priya Patel" },
  { policyId: 4, policyNumber: "POL-PRP-202403-034567", productName: "Home Shield All-Risk Property", policyType: "Property", sumInsured: 5000000, annualPremium: 12000, premiumPaid: 12000, startDate: "2024-03-20", endDate: "2024-12-31", status: "Expiring", ncbPct: 20, riCededPct: 25, customerId: 1, customerName: "Arjun Mehta", customerEmail: "arjun.mehta@email.com", customerPhone: "+91 98765 43210", customerAddress: "12 Koramangala 4th Block, Bengaluru", nomineeName: "Sunita Mehta", nomineeRelation: "Spouse", agentId: 1, agentName: "Sneha Singh" },
  { policyId: 5, policyNumber: "POL-TRV-202405-056789", productName: "Global Travel Explorer Comprehensive", policyType: "Travel", sumInsured: 2500000, annualPremium: 8500, premiumPaid: 8500, startDate: "2024-05-01", endDate: "2025-04-30", status: "Active", ncbPct: 0, riCededPct: 10, customerId: 2, customerName: "Divya Krishnan", customerEmail: "divya.k@email.com", customerPhone: "+91 98450 11223", customerAddress: "45 Anna Nagar, Chennai", agentId: 2, agentName: "Priya Patel" },
  { policyId: 6, policyNumber: "POL-MTR-202311-001122", productName: "Comprehensive Private Car Policy", policyType: "Motor", sumInsured: 1200000, annualPremium: 16500, premiumPaid: 16500, startDate: "2023-11-10", endDate: "2024-11-09", status: "Expiring", ncbPct: 35, riCededPct: 20, customerId: 3, customerName: "Rohit Verma", customerEmail: "rohit.v@email.com", customerPhone: "+91 97112 33445", customerAddress: "78 Indiranagar, Bengaluru", vehicleNo: "KA-03-AB-9876", vehicleMake: "Honda City VX", agentId: 3, agentName: "Rahul Sharma" }
];

const INITIAL_CLAIMS: ClaimModel[] = [
  { claimId: 1, claimNumber: "CLM-202411-008912", policyId: 1, policyNumber: "POL-MTR-202401-001892", policyType: "Motor", customerId: 1, customerName: "Arjun Mehta", incidentDate: "2024-11-15", fnolDate: "2024-11-15T10:30:00Z", lossType: "Accidental Collision", incidentLocation: "MG Road Junction, Bengaluru, Karnataka", description: "Rear-end collision with commercial truck resulting in heavy rear bumper, tailgate, and tail-light damages.", estimatedLoss: 125000, approvedAmount: 98500, deductibles: 2000, depreciation: 24500, status: "Under Investigation", fraudScore: 18.5, handlerId: 1, handlerName: "Rajesh Verma", surveyorId: 1, surveyorName: "Suresh Babu", surveyorNotes: "Inspection completed on 18 Nov. Damaged bumper & tailgate confirmed genuine. Zero dep cover applies.", surveyorReportSubmitted: true, surveyFee: 3500, tatDays: 4, isTatBreached: false, payeeType: "GARAGE", payeeBank: "HDFC0001892", payeeIfsc: "HDFC0001892" },
  { claimId: 2, claimNumber: "CLM-202410-006543", policyId: 2, policyNumber: "POL-HLT-202402-002341", policyType: "Health", customerId: 1, customerName: "Arjun Mehta", incidentDate: "2024-10-02", fnolDate: "2024-10-02T14:15:00Z", lossType: "Emergency Hospitalization", incidentLocation: "Manipal Hospital, Old Airport Road, Bengaluru", description: "Acute appendicitis emergency surgery and 3-day inpatient hospitalization for dependent spouse.", estimatedLoss: 55000, approvedAmount: 45000, deductibles: 0, depreciation: 10000, status: "Approved", fraudScore: 8.2, handlerId: 1, handlerName: "Rajesh Verma", surveyorId: 2, surveyorName: "Dr. Ananya Sen", surveyorNotes: "Medical discharge summary and billing validated. Consumables excluded as per standard health terms.", surveyorReportSubmitted: true, surveyFee: 2500, tatDays: 2, isTatBreached: false, payeeType: "HOSPITAL" },
  { claimId: 3, claimNumber: "CLM-202409-004321", policyId: 4, policyNumber: "POL-PRP-202403-034567", policyType: "Property", customerId: 1, customerName: "Arjun Mehta", incidentDate: "2024-09-18", fnolDate: "2024-09-18T18:00:00Z", lossType: "Heavy Monsoon Inundation", incidentLocation: "Koramangala 4th Block, Bengaluru", description: "Severe water logging leading to ground floor furniture and electronic equipment immersion.", estimatedLoss: 310000, approvedAmount: 280000, deductibles: 10000, depreciation: 20000, status: "Settled", fraudScore: 12.0, handlerId: 1, handlerName: "Rajesh Verma", surveyorId: 3, surveyorName: "Kishore Kumar", surveyorNotes: "Physical property survey completed. Water damage to electricals and wooden furniture verified.", surveyorReportSubmitted: true, surveyFee: 4500, tatDays: 5, isTatBreached: false, payeeType: "CUSTOMER", payeeBank: "XXXX XXXX 4821", payeeIfsc: "HDFC0001234", payoutTxnId: "PAYOUT_RZP_9823101", settledAt: "2024-09-24" },
  { claimId: 4, claimNumber: "CLM-202408-002198", policyId: 1, policyNumber: "POL-MTR-202401-001892", policyType: "Motor", customerId: 1, customerName: "Arjun Mehta", incidentDate: "2024-08-07", fnolDate: "2024-08-07T09:00:00Z", lossType: "Alleged Theft of Accessories", incidentLocation: "Electronic City, Bengaluru", description: "Claim for missing high-end aftermarket alloy wheels and sound system.", estimatedLoss: 68000, approvedAmount: 0, deductibles: 0, depreciation: 0, status: "Rejected", fraudScore: 84.0, handlerId: 1, handlerName: "Rajesh Verma", surveyorId: 1, surveyorName: "Suresh Babu", surveyorNotes: "Investigation revealed aftermarket accessories were not endorsed on policy. No FIR copy provided.", surveyorReportSubmitted: true, surveyFee: 3000, tatDays: 3, isTatBreached: false }
];

const INITIAL_PAYMENTS: PaymentModel[] = [
  { paymentId: 1, receiptNumber: "REC-202401-009121", transactionId: "TXN_RZP_81920311", policyId: 1, policyNumber: "POL-MTR-202401-001892", customerId: 1, customerName: "Arjun Mehta", amount: 24500, gstAmount: 3737, paymentMethod: "UPI", paymentDate: "2024-01-15", paymentStatus: "Success", description: "Annual Premium — Motor Policy POL-MTR-202401-001892" },
  { paymentId: 2, receiptNumber: "REC-202402-009843", transactionId: "TXN_RZP_92810422", policyId: 2, policyNumber: "POL-HLT-202402-002341", customerId: 1, customerName: "Arjun Mehta", amount: 32000, gstAmount: 4881, paymentMethod: "Credit Card", paymentDate: "2024-02-10", paymentStatus: "Success", description: "Annual Premium — Health Policy POL-HLT-202402-002341" },
  { paymentId: 3, receiptNumber: "REC-202308-005129", transactionId: "TXN_RZP_71629401", policyId: 3, policyNumber: "POL-LIF-202308-089012", customerId: 1, customerName: "Arjun Mehta", amount: 18000, gstAmount: 2745, paymentMethod: "Auto Debit", paymentDate: "2023-08-01", paymentStatus: "Success", description: "Annual Premium — Term Life Policy POL-LIF-202308-089012" },
  { paymentId: 4, receiptNumber: "REC-202403-006732", transactionId: "TXN_RZP_65412890", policyId: 4, policyNumber: "POL-PRP-202403-034567", customerId: 1, customerName: "Arjun Mehta", amount: 12000, gstAmount: 1830, paymentMethod: "UPI", paymentDate: "2024-03-20", paymentStatus: "Success", description: "Annual Premium — Property Shield POL-PRP-202403-034567" },
  { paymentId: 5, receiptNumber: "REC-202405-007812", transactionId: "TXN_RZP_54321987", policyId: 5, policyNumber: "POL-TRV-202405-056789", customerId: 2, customerName: "Divya Krishnan", amount: 8500, gstAmount: 1296, paymentMethod: "Net Banking", paymentDate: "2024-05-01", paymentStatus: "Success", description: "Annual Premium — Travel Explorer POL-TRV-202405-056789" },
];

const INITIAL_ENDORSEMENTS: EndorsementModel[] = [
  { endorsementId: 1, endorsementNumber: "END-202406-001201", policyId: 1, policyNumber: "POL-MTR-202401-001892", endorsementType: "Add-on Update", description: "Added Return to Invoice (RTI) cover mid-term following vehicle market valuation.", premiumAdjustment: 1450, effectiveDate: "2024-06-15", status: "Approved", approvedBy: "Vikram Malhotra (Underwriter)", createdAt: "2024-06-14", oldValue: "Zero Dep + RSA", newValue: "Zero Dep + RSA + RTI" },
  { endorsementId: 2, endorsementNumber: "END-202407-001452", policyId: 2, policyNumber: "POL-HLT-202402-002341", endorsementType: "Nominee Change", description: "Updated primary nominee to spouse Sunita Mehta with 100% share.", premiumAdjustment: 0, effectiveDate: "2024-07-01", status: "Approved", approvedBy: "Auto-Approved", createdAt: "2024-06-30", oldValue: "Self", newValue: "Sunita Mehta (Spouse)" },
];

const INITIAL_SURVEYORS: SurveyorModel[] = [
  { surveyorId: 1, name: "Suresh Babu", irdaiLicenseNo: "SLA-IRDAI-MTR-89201", licenseExpiry: "2026-12-31", specialization: "Motor OD & TP", district: "Bengaluru Urban", state: "Karnataka", contactMobile: "+91 98451 22334", email: "suresh.babu@surveyors.in", isActive: true, activeAssignments: 3, completedSurveys: 142, rating: 4.9, totalEarnings: 497000 },
  { surveyorId: 2, name: "Dr. Ananya Sen", irdaiLicenseNo: "SLA-IRDAI-MED-44102", licenseExpiry: "2027-05-15", specialization: "Health & Medical Adjudication", district: "Bengaluru", state: "Karnataka", contactMobile: "+91 97401 88990", email: "dr.ananya@medsurveys.in", isActive: true, activeAssignments: 2, completedSurveys: 98, rating: 4.8, totalEarnings: 245000 },
  { surveyorId: 3, name: "Kishore Kumar", irdaiLicenseNo: "SLA-IRDAI-FIR-33019", licenseExpiry: "2026-08-31", specialization: "Fire, Property & Marine", district: "Bengaluru / Mysuru", state: "Karnataka", contactMobile: "+91 98200 44556", email: "kishore.k@propertysurveys.in", isActive: true, activeAssignments: 1, completedSurveys: 87, rating: 4.7, totalEarnings: 391500 },
  { surveyorId: 4, name: "Manish Joshi", irdaiLicenseNo: "SLA-IRDAI-ENG-99120", licenseExpiry: "2027-03-20", specialization: "Engineering & Heavy Machinery", district: "Chennai", state: "Tamil Nadu", contactMobile: "+91 94440 12345", email: "manish.j@surveyors.in", isActive: true, activeAssignments: 0, completedSurveys: 64, rating: 4.6, totalEarnings: 320000 },
];

const INITIAL_TREATIES: ReinsuranceTreatyModel[] = [
  { treatyId: 1, treatyName: "GIC Re Motor Quota Share 2024", reinsurerName: "General Insurance Corporation of India (GIC Re)", treatyType: "PROPORTIONAL", lob: "MOTOR", cessionPct: 20, riLimit: 500000000, effectiveFrom: "2024-04-01", effectiveTo: "2025-03-31", isActive: true, totalCededPremium: 14200000, totalCededClaims: 3200000 },
  { treatyId: 2, treatyName: "Swiss Re Health Excess of Loss 2024", reinsurerName: "Swiss Re Asia Pte Ltd", treatyType: "XL_EXCESS_OF_LOSS", lob: "HEALTH", cessionPct: 15, riLimit: 250000000, effectiveFrom: "2024-04-01", effectiveTo: "2025-03-31", isActive: true, totalCededPremium: 9800000, totalCededClaims: 1800000 },
  { treatyId: 3, treatyName: "Munich Re Property All-Risk Surplus", reinsurerName: "Munich Reinsurance India", treatyType: "PROPORTIONAL", lob: "PROPERTY", cessionPct: 25, riLimit: 1000000000, effectiveFrom: "2024-01-01", effectiveTo: "2024-12-31", isActive: true, totalCededPremium: 18500000, totalCededClaims: 4500000 },
];

const INITIAL_AGENTS: AgentModel[] = [
  { agentId: 1, agentCode: "AGT-1001", name: "Sneha Singh", irdaiLicenseNo: "IRDAI-POSP-89210", licenseExpiry: "2026-10-31", tier: "Platinum", phone: "+91 98201 99887", email: "sneha.singh@agents.srinsurance.com", bankAccount: "XXXX XXXX 9120 (ICICI Bank)", ifsc: "ICIC0001001", commissionRatePct: 15.0, walletBalance: 184500, totalGwp: 1020000, policiesSold: 61, renewalRatioPct: 94.5, tdsDeductedTotal: 9225, leadsCount: 14 },
  { agentId: 2, agentCode: "AGT-1002", name: "Priya Patel", irdaiLicenseNo: "IRDAI-POSP-77401", licenseExpiry: "2026-06-30", tier: "Gold", phone: "+91 98450 66778", email: "priya.patel@agents.srinsurance.com", bankAccount: "XXXX XXXX 4410 (HDFC Bank)", ifsc: "HDFC0002002", commissionRatePct: 15.0, walletBalance: 136500, totalGwp: 910000, policiesSold: 52, renewalRatioPct: 91.2, tdsDeductedTotal: 6825, leadsCount: 9 },
  { agentId: 3, agentCode: "AGT-1003", name: "Rahul Sharma", irdaiLicenseNo: "IRDAI-POSP-66129", licenseExpiry: "2027-01-15", tier: "Gold", phone: "+91 97110 33221", email: "rahul.sharma@agents.srinsurance.com", bankAccount: "XXXX XXXX 8830 (Axis Bank)", ifsc: "UTIB0003003", commissionRatePct: 15.0, walletBalance: 126000, totalGwp: 840000, policiesSold: 48, renewalRatioPct: 88.0, tdsDeductedTotal: 6300, leadsCount: 11 },
];

const INITIAL_LEADS: LeadModel[] = [
  { leadId: 1, name: "Vikram Rathore", phone: "+91 98112 00998", email: "vikram.r@gmail.com", productType: "Commercial Fleet Motor", estimatedValue: 145000, stage: "Negotiation", hot: true, notes: "5 logistics trucks fleet renewal due next week.", createdAt: "2024-11-10" },
  { leadId: 2, name: "Megha Singhal", phone: "+91 99201 44332", email: "megha.s@gmail.com", productType: "Family Health Floater", estimatedValue: 34000, stage: "Quoted", hot: true, notes: "Parent 2 senior citizen covers requested.", createdAt: "2024-11-12" },
  { leadId: 3, name: "Harish Chandra", phone: "+91 98450 77112", email: "harish.c@gmail.com", productType: "Smart Term Life (1 Cr)", estimatedValue: 19500, stage: "Contacted", hot: false, notes: "Requested quote comparison against HDFC Life.", createdAt: "2024-11-14" },
  { leadId: 4, name: "Alok Industries Ltd", phone: "+91 98200 66554", email: "finance@alokind.com", productType: "Enterprise Cyber Guard", estimatedValue: 280000, stage: "Proposal", hot: true, notes: "DPDP Act compliance audit coverage requested.", createdAt: "2024-11-08" },
];

const INITIAL_GRIEVANCES: GrievanceModel[] = [
  { grievanceId: 1, tokenNo: "GRV-202411-0089", policyNumber: "POL-MTR-202401-001892", customerName: "Arjun Mehta", customerEmail: "arjun.mehta@email.com", category: "Claim Dispute", description: "Query regarding 50% rubber part depreciation on rear bumper assembly.", filedDate: "2024-11-17", ackSlaHours: 12, resolutionSlaDays: 5, status: "Under Review", resolutionNotes: "Clarified per IRDAI standard depreciation schedule." },
  { grievanceId: 2, tokenNo: "GRV-202410-0045", policyNumber: "POL-HLT-202402-002341", customerName: "Divya Krishnan", customerEmail: "divya.k@email.com", category: "Delayed Settlement", description: "Reimbursement query for post-hospitalization bills.", filedDate: "2024-10-15", ackSlaHours: 4, resolutionSlaDays: 3, status: "Resolved", resolutionNotes: "Disbursed ₹4,500 via Razorpay Payouts on 18 Oct." }
];

const INITIAL_AUDIT: AuditLogModel[] = [
  { logId: 1, username: "admin", action: "PRODUCT_UPDATE", entityType: "PRODUCT", entityId: "1", description: "Updated Motor Comprehensive base rating factor to 2.85%", ipAddress: "10.0.1.25", timestamp: "2024-11-18 09:30:00" },
  { logId: 2, username: "claims1", action: "SURVEYOR_ASSIGNED", entityType: "CLAIM", entityId: "CLM-202411-008912", description: "Assigned surveyor Suresh Babu to claim CLM-202411-008912", ipAddress: "10.0.2.14", timestamp: "2024-11-15 11:00:00" },
  { logId: 3, username: "customer1", action: "POLICY_PURCHASE", entityType: "POLICY", entityId: "POL-MTR-202401-001892", description: "Customer Arjun Mehta completed Aadhaar eKYC and purchased Motor Policy", ipAddress: "157.48.91.22", timestamp: "2024-01-15 14:20:00" },
  { logId: 4, username: "finance1", action: "PAYOUT_INITIATED", entityType: "PAYOUT", entityId: "CLM-202409-004321", description: "Razorpay payout of ₹2,80,000 processed for settled property claim", ipAddress: "10.0.3.8", timestamp: "2024-09-24 16:45:00" },
];

// ─── Store Manager Class ───────────────────────────────────────────────────────
class InsuranceStore {
  private listeners: Set<() => void> = new Set();

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => {
      try { fn(); } catch (err) { console.error("Store listener error:", err); }
    });
  }

  private get<T>(key: string, fallback: T): T {
    try {
      const stored = localStorage.getItem(`sr_ins_${key}`);
      return stored ? JSON.parse(stored) : fallback;
    } catch {
      return fallback;
    }
  }

  private set<T>(key: string, value: T) {
    try {
      localStorage.setItem(`sr_ins_${key}`, JSON.stringify(value));
    } catch {
      // ignore storage quota errors
    }
    this.notify();
  }

  // Getters
  getProducts(): ProductModel[] { return this.get("products", INITIAL_PRODUCTS); }
  getCustomers(): CustomerModel[] { return this.get("customers", INITIAL_CUSTOMERS); }
  getPolicies(): PolicyModel[] { return this.get("policies", INITIAL_POLICIES); }
  getClaims(): ClaimModel[] { return this.get("claims", INITIAL_CLAIMS); }
  getPayments(): PaymentModel[] { return this.get("payments", INITIAL_PAYMENTS); }
  getEndorsements(): EndorsementModel[] { return this.get("endorsements", INITIAL_ENDORSEMENTS); }
  getSurveyors(): SurveyorModel[] { return this.get("surveyors", INITIAL_SURVEYORS); }
  getTreaties(): ReinsuranceTreatyModel[] { return this.get("treaties", INITIAL_TREATIES); }
  getAgents(): AgentModel[] { return this.get("agents", INITIAL_AGENTS); }
  getLeads(): LeadModel[] { return this.get("leads", INITIAL_LEADS); }
  getGrievances(): GrievanceModel[] { return this.get("grievances", INITIAL_GRIEVANCES); }
  getAuditLogs(): AuditLogModel[] { return this.get("audit", INITIAL_AUDIT); }

  // Mutations
  addProduct(prod: any): ProductModel {
    return this.saveProduct(prod);
  }

  saveProduct(prod: any): ProductModel {
    const prods = this.getProducts();
    const newProd: ProductModel = {
      productId: prod.productId || prod.id || prods.length + 1,
      productName: prod.productName || prod.name || "New Insurance Product",
      lob: prod.lob || (prod.category ? prod.category.toUpperCase().replace(/_.*/, '') : "MOTOR"),
      irdaiUin: prod.irdaiUin || prod.uin || `IRDAN106P00${prods.length + 1}V01202425`,
      baseRatePct: prod.baseRatePct || prod.baseRatePerMille || 2.5,
      minSumInsured: prod.minSumInsured || 500000,
      maxSumInsured: prod.maxSumInsured || 10000000,
      isActive: prod.isActive ?? prod.active ?? true,
      ratingVersion: prod.ratingVersion || "v1.0",
      gstRatePct: prod.gstRatePct || prod.gstRate || 18,
      description: prod.description || "Comprehensive protection cover.",
      benefits: prod.benefits || prod.coverages || ["Fast claim turnaround", "Pan-India support"],
    };
    const idx = prods.findIndex(p => String(p.productId) === String(newProd.productId));
    if (idx >= 0) prods[idx] = newProd;
    else prods.unshift(newProd);
    this.set("products", prods);
    this.logAudit("PRODUCT_MUTATION", "PRODUCT", String(newProd.productId), `Saved product: ${newProd.productName}`);
    return newProd;
  }

  createPolicy(payload: {
    productName: string;
    policyType: PolicyModel["policyType"];
    sumInsured: number;
    annualPremium: number;
    customerId?: number | string;
    customerCode?: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress?: string;
    vehicleNo?: string;
    vehicleMake?: string;
    nomineeName?: string;
    nomineeRelation?: string;
    ncbPct?: number;
    agentId?: number;
    agentName?: string;
    uin?: string;
  }): PolicyModel {
    if (!payload.productName.trim() || !payload.customerName.trim()) {
      throw new Error("Product and customer name are required");
    }
    if (!Number.isFinite(payload.sumInsured) || payload.sumInsured <= 0) {
      throw new Error("Sum insured must be greater than zero");
    }
    if (!Number.isFinite(payload.annualPremium) || payload.annualPremium <= 0) {
      throw new Error("Annual premium must be greater than zero");
    }
    // Appendix C: Agent Authority Limit
    if (payload.agentId) {
      const agentCheck = validateAgentAuthority(payload.sumInsured);
      if (!agentCheck.valid) {
        throw new Error(agentCheck.error || SRS_ERRORS.AGENT_AUTHORITY_LIMIT);
      }
    }
    // Appendix C: NCB Slab Validation
    if (payload.ncbPct !== undefined) {
      const ncbCheck = validateNcbSlab(payload.ncbPct);
      if (!ncbCheck.valid) {
        throw new Error(ncbCheck.error || SRS_ERRORS.NCB_SLAB_VALIDATION);
      }
    }
    // Appendix C: RI Cession Completeness
    const riCheck = validateRiCession(20);
    if (!riCheck.valid) {
      throw new Error(riCheck.error || SRS_ERRORS.RI_CESSION_COMPLETENESS);
    }
    const policies = this.getPolicies();
    const now = new Date();
    const yyyymm = now.toISOString().slice(0, 7).replace("-", "");
    const randSeq = String(Math.floor(100000 + Math.random() * 900000));
    const lobCode = payload.policyType.slice(0, 3).toUpperCase();
    const policyNumber = `POL-${lobCode}-${yyyymm}-${randSeq}`;

    const startDate = now.toISOString().split("T")[0];
    const nextYear = new Date(now);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const endDate = nextYear.toISOString().split("T")[0];

    // Resolve or create customer in store
    const customers = this.getCustomers();
    const searchTarget = String(payload.customerId || payload.customerCode || "").trim().toLowerCase();
    let matchedCustomer = customers.find(c => 
      (searchTarget && String(c.customerId).toLowerCase() === searchTarget) ||
      (searchTarget && c.customerCode && c.customerCode.toLowerCase() === searchTarget) ||
      (payload.customerEmail && c.email.toLowerCase() === payload.customerEmail.toLowerCase()) ||
      (c.name.toLowerCase() === payload.customerName.toLowerCase())
    );

    if (!matchedCustomer && (payload.customerName || payload.customerEmail)) {
      const numericId = typeof payload.customerId === "number" 
        ? payload.customerId 
        : (!isNaN(Number(payload.customerId)) && Number(payload.customerId) > 0 ? Number(payload.customerId) : undefined);
      matchedCustomer = this.addCustomer({
        customerId: numericId,
        customerCode: payload.customerCode || (typeof payload.customerId === "string" ? payload.customerId : undefined),
        name: payload.customerName || "Customer",
        email: payload.customerEmail || "customer@srinsurance.com",
        phone: payload.customerPhone || "+91 98765 00000",
        address: payload.customerAddress || "India",
      });
    }

    const assignedCustomerId = matchedCustomer ? matchedCustomer.customerId : (payload.customerId || 1);
    const assignedCustomerCode = matchedCustomer?.customerCode || payload.customerCode || `CUST-${assignedCustomerId}`;
    const uin = payload.uin || `IRDAI/NL-GI/${lobCode}/${now.getFullYear()}/${randSeq.slice(0, 4)}`;

    const newPolicy: PolicyModel = {
      policyId: policies.length > 0 ? Math.max(...policies.map(p => p.policyId || 0)) + 1 : 1,
      policyNumber,
      uin,
      productName: payload.productName,
      policyType: payload.policyType,
      sumInsured: payload.sumInsured,
      annualPremium: payload.annualPremium,
      premiumPaid: payload.annualPremium,
      startDate,
      endDate,
      status: "Active",
      ncbPct: payload.ncbPct || 20,
      riCededPct: 20,
      customerId: assignedCustomerId,
      customerCode: assignedCustomerCode,
      customerName: matchedCustomer?.name || payload.customerName,
      customerEmail: matchedCustomer?.email || payload.customerEmail,
      customerPhone: matchedCustomer?.phone || matchedCustomer?.mobile || payload.customerPhone,
      customerAddress: matchedCustomer?.address || payload.customerAddress || "India",
      vehicleNo: payload.vehicleNo,
      vehicleMake: payload.vehicleMake,
      nomineeName: payload.nomineeName || "Spouse",
      nomineeRelation: payload.nomineeRelation || "Spouse",
      agentId: payload.agentId,
      agentName: payload.agentName,
    };

    policies.unshift(newPolicy);
    this.set("policies", policies);

    // Update customer policy count & premium
    if (matchedCustomer) {
      matchedCustomer.policiesCount = (matchedCustomer.policiesCount || 0) + 1;
      matchedCustomer.totalPremium = (matchedCustomer.totalPremium || 0) + newPolicy.annualPremium;
      this.set("customers", customers);
    }

    // Record Payment
    this.recordPayment({
      policyId: newPolicy.policyId,
      policyNumber: newPolicy.policyNumber,
      customerId: typeof assignedCustomerId === "number" ? assignedCustomerId : 1,
      customerName: newPolicy.customerName,
      amount: newPolicy.annualPremium,
      paymentMethod: "UPI",
      description: `New Policy Issuance — ${newPolicy.productName}`
    });

    // Credit Agent Commission if applicable
    if (payload.agentId) {
      this.creditAgentCommission(payload.agentId, payload.annualPremium);
    }

    this.logAudit("POLICY_CREATED", "POLICY", policyNumber, `Created policy ${policyNumber} for customer ${assignedCustomerCode || assignedCustomerId}`);
    return newPolicy;
  }

  renewPolicy(policyId: number): PolicyModel {
    const policies = this.getPolicies();
    const pol = policies.find(p => p.policyId === policyId);
    if (!pol) throw new Error("Policy not found");

    // Advance NCB if claim-free
    const nextNcb = pol.ncbPct < 20 ? 20 : pol.ncbPct < 25 ? 25 : pol.ncbPct < 35 ? 35 : pol.ncbPct < 45 ? 45 : 50;
    const now = new Date();
    const yyyymm = now.toISOString().slice(0, 7).replace("-", "");
    const randSeq = String(Math.floor(100000 + Math.random() * 900000));
    const lobCode = pol.policyType.slice(0, 3).toUpperCase();
    const newPolicyNumber = `POL-${lobCode}-${yyyymm}-${randSeq}`;

    const startDate = now.toISOString().split("T")[0];
    const nextYear = new Date(now);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const endDate = nextYear.toISOString().split("T")[0];

    // Mark existing as Renewed
    pol.status = "Renewed";

    const renewalPolicy: PolicyModel = {
      ...pol,
      policyId: policies.length + 1,
      policyNumber: newPolicyNumber,
      startDate,
      endDate,
      status: "Active",
      ncbPct: nextNcb,
      previousPolicyNumber: pol.policyNumber,
      annualPremium: Math.round(pol.annualPremium * 0.95), // NCB discount effect
      premiumPaid: Math.round(pol.annualPremium * 0.95)
    };

    policies.unshift(renewalPolicy);
    this.set("policies", policies);

    this.recordPayment({
      policyId: renewalPolicy.policyId,
      policyNumber: renewalPolicy.policyNumber,
      customerId: renewalPolicy.customerId,
      customerName: renewalPolicy.customerName,
      amount: renewalPolicy.annualPremium,
      paymentMethod: "UPI",
      description: `Policy Renewal (${nextNcb}% NCB) — ${renewalPolicy.policyNumber}`
    });

    this.logAudit("POLICY_RENEWED", "POLICY", newPolicyNumber, `Renewed policy ${pol.policyNumber} -> ${newPolicyNumber}`);
    return renewalPolicy;
  }

  createEndorsement(payload: {
    policyId: number;
    endorsementType: EndorsementModel["endorsementType"];
    description: string;
    oldValue: string;
    newValue: string;
    premiumAdjustment?: number;
  }): EndorsementModel {
    const endorsements = this.getEndorsements();
    const policies = this.getPolicies();
    const pol = policies.find(p => p.policyId === payload.policyId);
    if (!pol) throw new Error("Policy not found");
    if (!["Active", "ACTIVE"].includes(pol.status)) {
      throw new Error("Policy is not active; endorsement cannot be submitted");
    }
    if (!payload.description.trim()) {
      throw new Error("Endorsement description is required");
    }

    const now = new Date();
    const yyyymm = now.toISOString().slice(0, 7).replace("-", "");
    const randSeq = String(Math.floor(100000 + Math.random() * 900000));
    const endorsementNumber = `END-${yyyymm}-${randSeq}`;

    // Auto-approve if zero cost / contact change; otherwise underwriter approval
    const isAutoApproved = payload.endorsementType === "Nominee Change" || payload.endorsementType === "Address Change";

    const end: EndorsementModel = {
      endorsementId: endorsements.length + 1,
      endorsementNumber,
      policyId: pol.policyId,
      policyNumber: pol.policyNumber,
      endorsementType: payload.endorsementType,
      description: payload.description,
      premiumAdjustment: payload.premiumAdjustment || 0,
      effectiveDate: now.toISOString().split("T")[0],
      status: isAutoApproved ? "Approved" : "Pending",
      approvedBy: isAutoApproved ? "Auto-System" : undefined,
      createdAt: now.toISOString().split("T")[0],
      oldValue: payload.oldValue,
      newValue: payload.newValue
    };

    endorsements.unshift(end);
    this.set("endorsements", endorsements);

    if (isAutoApproved) {
      if (payload.endorsementType === "Address Change") pol.customerAddress = payload.newValue;
      if (payload.endorsementType === "Nominee Change") pol.nomineeName = payload.newValue;
      this.set("policies", policies);
    }

    this.logAudit("ENDORSEMENT_SUBMITTED", "ENDORSEMENT", endorsementNumber, `Submitted ${payload.endorsementType} for ${pol.policyNumber}`);
    return end;
  }

  approveEndorsement(endorsementId: number | string, approver = "Underwriter Desk") {
    const endorsements = this.getEndorsements();
    const end = endorsements.find(e => String(e.endorsementId) === String(endorsementId) || e.endorsementNumber === endorsementId);
    if (!end) return;
    end.status = "Approved";
    end.approvedBy = approver;
    this.set("endorsements", endorsements);
    this.logAudit("ENDORSEMENT_APPROVED", "ENDORSEMENT", end.endorsementNumber, `Approved endorsement by ${approver}`);
  }

  createClaim(payload: {
    policyId: number;
    incidentDate: string;
    incidentLocation: string;
    description: string;
    estimatedLoss: number;
    lossType: string;
  }): ClaimModel {
    const claims = this.getClaims();
    const policies = this.getPolicies();
    const pol = policies.find(p => p.policyId === payload.policyId);
    if (!pol) throw new Error("Policy not found");

    // Appendix C: Active Policy & Lapsed Policy Grace Check
    const activeCheck = validateActivePolicyForClaim(pol, payload.incidentDate);
    if (!activeCheck.valid) {
      throw new Error(activeCheck.error || SRS_ERRORS.ACTIVE_POLICY_CLAIM);
    }

    // Appendix C: Duplicate Claim Check
    const duplicateCheck = validateClaimDuplicate(claims, {
      policyId: payload.policyId,
      incidentDate: payload.incidentDate,
      lossType: payload.lossType,
    });
    if (!duplicateCheck.valid) {
      throw new Error(duplicateCheck.error || SRS_ERRORS.CLAIM_DUPLICATE);
    }

    const now = new Date();
    const yyyymm = now.toISOString().slice(0, 7).replace("-", "");
    const randSeq = String(Math.floor(100000 + Math.random() * 900000));
    const claimNumber = `CLM-${yyyymm}-${randSeq}`;

    // Auto-calculate fraud score (0 - 100) based on loss ratio and timing
    const lossRatioPct = (payload.estimatedLoss / pol.sumInsured) * 100;
    const fraudScore = Math.min(95, Math.max(5, Math.round(lossRatioPct * 0.4 + (payload.estimatedLoss > 500000 ? 25 : 5))));

    const newClaim: ClaimModel = {
      claimId: claims.length + 1,
      claimNumber,
      policyId: pol.policyId,
      policyNumber: pol.policyNumber,
      policyType: pol.policyType,
      customerId: pol.customerId,
      customerName: pol.customerName,
      incidentDate: payload.incidentDate,
      fnolDate: now.toISOString(),
      lossType: payload.lossType || "Accidental Damage",
      incidentLocation: payload.incidentLocation,
      description: payload.description,
      estimatedLoss: payload.estimatedLoss,
      approvedAmount: null,
      deductibles: 2000,
      depreciation: Math.round(payload.estimatedLoss * 0.15),
      status: "FNOL",
      fraudScore,
      tatDays: 1,
      isTatBreached: false,
      surveyorReportSubmitted: false
    };

    // Auto-assign surveyor from pool
    const surveyors = this.getSurveyors();
    const matching = surveyors.find(s => s.isActive && s.specialization.toLowerCase().includes(pol.policyType.toLowerCase())) || surveyors[0];
    if (matching) {
      newClaim.surveyorId = matching.surveyorId;
      newClaim.surveyorName = matching.name;
      newClaim.status = "Surveyor Assigned";
      matching.activeAssignments += 1;
      this.set("surveyors", surveyors);
    }

    claims.unshift(newClaim);
    this.set("claims", claims);
    this.logAudit("CLAIM_FNOL", "CLAIM", claimNumber, `First Notice of Loss filed for ${pol.policyNumber} (Est. ₹${payload.estimatedLoss})`);
    return newClaim;
  }

  submitSurveyorReport(claimId: number, report: {
    assessedLoss: number;
    recommendedAmount: number;
    depreciation: number;
    notes: string;
  }) {
    const claims = this.getClaims();
    const claim = claims.find(c => c.claimId === claimId);
    if (!claim) return;

    claim.status = "Adjudicating";
    claim.surveyorReportSubmitted = true;
    claim.surveyorNotes = report.notes;
    claim.approvedAmount = report.recommendedAmount;
    claim.depreciation = report.depreciation;
    claim.surveyFee = claim.estimatedLoss > 100000 ? 4500 : 2500;
    this.set("claims", claims);

    // Update surveyor earnings
    if (claim.surveyorId) {
      const surveyors = this.getSurveyors();
      const s = surveyors.find(surv => surv.surveyorId === claim.surveyorId);
      if (s) {
        s.completedSurveys += 1;
        s.activeAssignments = Math.max(0, s.activeAssignments - 1);
        s.totalEarnings += claim.surveyFee;
        this.set("surveyors", surveyors);
      }
    }

    this.logAudit("SURVEY_REPORT_SUBMITTED", "CLAIM", claim.claimNumber, `Survey report submitted by ${claim.surveyorName} (Recommended ₹${report.recommendedAmount})`);
  }

  adjudicateClaim(claimId: number, action: "Approve" | "Reject", approvedAmount?: number, deductionNotes?: string) {
    const claims = this.getClaims();
    const claim = claims.find(c => c.claimId === claimId);
    if (!claim) return;

    if (action === "Approve") {
      const amount = approvedAmount ?? claim.approvedAmount ?? claim.estimatedLoss;
      const maximumSettlement = Math.max(0, claim.estimatedLoss - claim.deductibles - claim.depreciation);
      if (!Number.isFinite(amount) || amount < 0 || amount > maximumSettlement) {
        throw new Error(`Approved amount must be between ₹0 and ₹${maximumSettlement.toLocaleString()}`);
      }
      claim.status = "Approved";
      claim.approvedAmount = amount;
      claim.payeeType = claim.policyType === "Health" ? "HOSPITAL" : "CUSTOMER";
      claim.payeeBank = "XXXX XXXX 4821 (HDFC Bank)";
      claim.payeeIfsc = "HDFC0001234";
    } else {
      claim.status = "Rejected";
      claim.approvedAmount = 0;
      claim.surveyorNotes = deductionNotes || "Claim rejected as per policy exclusions / non-disclosure.";
    }
    this.set("claims", claims);
    this.logAudit(`CLAIM_${action.toUpperCase()}D`, "CLAIM", claim.claimNumber, `${action}d claim for ₹${claim.approvedAmount}`);
  }

  assignSurveyorToClaim(claimId: number, surveyorId: number) {
    const surveyors = this.getSurveyors();
    const surveyor = surveyors.find(s => s.surveyorId === surveyorId);
    if (!surveyor) throw new Error("Surveyor not found");

    // Appendix C: Surveyor License
    const licCheck = validateSurveyorLicense(surveyor.licenseExpiry || "2024-01-01");
    if (!licCheck.valid) {
      throw new Error(licCheck.error || SRS_ERRORS.SURVEYOR_LICENSE);
    }

    const claims = this.getClaims();
    const claim = claims.find(c => c.claimId === claimId);
    if (!claim) throw new Error("Claim not found");

    claim.surveyorId = surveyor.surveyorId;
    claim.surveyorName = surveyor.name;
    claim.status = "Surveyor Assigned";
    surveyor.activeAssignments += 1;
    this.set("surveyors", surveyors);
    this.set("claims", claims);
    this.logAudit("SURVEYOR_ASSIGNED", "CLAIM", claim.claimNumber, `Assigned surveyor ${surveyor.name}`);
  }

  disburseClaimPayout(claimId: number, payeeType: "CUSTOMER" | "GARAGE" | "HOSPITAL" | "THIRD_PARTY_UNREGISTERED" = "CUSTOMER"): string {
    const claims = this.getClaims();
    const claim = claims.find(c => c.claimId === claimId);
    if (!claim || claim.status !== "Approved") throw new Error("Claim is not in Approved state");

    // Appendix C: Payment to Customer Only
    const payeeCheck = validateClaimPayee(payeeType, true);
    if (!payeeCheck.valid) {
      throw new Error(payeeCheck.error || SRS_ERRORS.PAYMENT_CUSTOMER_ONLY);
    }

    const payoutTxnId = `PAYOUT_RZP_${Date.now()}`;
    claim.status = "Settled";
    claim.payoutTxnId = payoutTxnId;
    claim.settledAt = new Date().toISOString().split("T")[0];
    this.set("claims", claims);

    this.logAudit("CLAIM_SETTLED_PAYOUT", "CLAIM", claim.claimNumber, `Disbursed settlement payout of ₹${claim.approvedAmount} via Razorpay (${payoutTxnId})`);
    return payoutTxnId;
  }

  cancelPolicy(policyId: number, isFreeLook = true): { refundAmount: number; status: string } {
    const policies = this.getPolicies();
    const pol = policies.find(p => p.policyId === policyId);
    if (!pol) throw new Error("Policy not found");

    // Appendix C: Free-Look Cancellation
    if (isFreeLook) {
      const freeLookCheck = validateFreeLookCancellation(pol.startDate);
      if (!freeLookCheck.valid) {
        throw new Error(freeLookCheck.error || SRS_ERRORS.FREE_LOOK_CANCELLATION);
      }
    }

    pol.status = "Cancelled";
    this.set("policies", policies);
    const refundAmount = isFreeLook ? Math.round(pol.annualPremium * 0.98) : Math.round(pol.annualPremium * 0.6);
    this.logAudit("POLICY_CANCELLED", "POLICY", pol.policyNumber, `Policy cancelled (${isFreeLook ? "Free-Look Refund" : "Short-rate"}: ₹${refundAmount})`);
    return { refundAmount, status: "Cancelled" };
  }

  recordPayment(payload: {
    policyId: number;
    policyNumber: string;
    customerId: number;
    customerName: string;
    amount: number;
    paymentMethod: PaymentModel["paymentMethod"];
    description: string;
  }): PaymentModel {
    const policy = this.getPolicies().find(p => p.policyId === payload.policyId);
    if (!policy) throw new Error("Policy not found");
    if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
      throw new Error("Payment amount must be greater than zero");
    }
    const payments = this.getPayments();
    const now = new Date();
    const yyyymm = now.toISOString().slice(0, 7).replace("-", "");
    const randSeq = String(Math.floor(100000 + Math.random() * 900000));
    const receiptNumber = `REC-${yyyymm}-${randSeq}`;
    const transactionId = `TXN_RZP_${Date.now()}`;
    const gstAmount = Math.round((payload.amount * 18) / 118);

    const payment: PaymentModel = {
      paymentId: payments.length + 1,
      receiptNumber,
      transactionId,
      policyId: payload.policyId,
      policyNumber: payload.policyNumber,
      customerId: payload.customerId,
      customerName: payload.customerName,
      amount: payload.amount,
      gstAmount,
      paymentMethod: payload.paymentMethod,
      paymentDate: now.toISOString().split("T")[0],
      paymentStatus: "Success",
      description: payload.description,
      gatewayRef: `rzp_pay_${Date.now()}`
    };

    payments.unshift(payment);
    this.set("payments", payments);
    this.logAudit("PREMIUM_PAYMENT", "PAYMENT", receiptNumber, `Collected ₹${payload.amount} via ${payload.paymentMethod}`);
    return payment;
  }

  creditAgentCommission(agentId: number, premiumAmount: number) {
    const agents = this.getAgents();
    const ag = agents.find(a => a.agentId === agentId);
    if (!ag) return;

    const grossComm = Math.round((premiumAmount * ag.commissionRatePct) / 100);
    const tds = grossComm > 15000 ? Math.round(grossComm * 0.05) : 0;
    const net = grossComm - tds;

    ag.walletBalance += net;
    ag.totalGwp += premiumAmount;
    ag.policiesSold += 1;
    ag.tdsDeductedTotal += tds;
    this.set("agents", agents);
  }

  requestAgentPayout(agentId: number, amount: number): string {
    const agents = this.getAgents();
    const ag = agents.find(a => a.agentId === agentId);
    if (!ag || ag.walletBalance < amount) throw new Error("Insufficient wallet balance");

    ag.walletBalance -= amount;
    this.set("agents", agents);
    const txn = `COMM_PAYOUT_RZP_${Date.now()}`;
    this.logAudit("COMMISSION_PAYOUT", "AGENT", ag.agentCode, `Disbursed commission payout ₹${amount} to ${ag.name} (${txn})`);
    return txn;
  }

  addLead(lead: Partial<LeadModel>): LeadModel {
    const leads = this.getLeads();
    const newLead: LeadModel = {
      leadId: leads.length + 1,
      name: lead.name || "New Prospect",
      phone: lead.phone || "+91 98000 00000",
      email: lead.email || "lead@example.com",
      productType: lead.productType || "Motor Insurance",
      estimatedValue: lead.estimatedValue || 25000,
      stage: lead.stage || "New",
      hot: lead.hot ?? true,
      notes: lead.notes || "Lead captured from portal.",
      createdAt: new Date().toISOString().split("T")[0]
    };
    leads.unshift(newLead);
    this.set("leads", leads);
    return newLead;
  }

  updateLeadStage(leadId: number, stage: LeadModel["stage"]) {
    const leads = this.getLeads();
    const l = leads.find(lead => lead.leadId === leadId);
    if (l) {
      l.stage = stage;
      this.set("leads", leads);
    }
  }

  registerGrievance(g: { policyNumber: string; customerName: string; customerEmail: string; category: GrievanceModel["category"]; description: string }): GrievanceModel {
    const grievances = this.getGrievances();
    const newGrv: GrievanceModel = {
      grievanceId: grievances.length + 1,
      tokenNo: `GRV-${Date.now().toString().slice(-6)}`,
      policyNumber: g.policyNumber,
      customerName: g.customerName,
      customerEmail: g.customerEmail,
      category: g.category,
      description: g.description,
      filedDate: new Date().toISOString().split("T")[0],
      ackSlaHours: 24,
      resolutionSlaDays: 14,
      status: "Acknowledged"
    };
    grievances.unshift(newGrv);
    this.set("grievances", grievances);
    this.logAudit("GRIEVANCE_REGISTERED", "GRIEVANCE", newGrv.tokenNo, `Registered grievance for policy ${g.policyNumber}`);
    return newGrv;
  }

  updatePolicy(policyId: number | string, updates: Partial<PolicyModel>) {
    const policies = this.getPolicies();
    const pol = policies.find(p => String(p.policyId) === String(policyId) || p.policyNumber === policyId);
    if (!pol) return;
    Object.assign(pol, updates);
    this.set("policies", policies);
    this.logAudit("POLICY_UPDATED", "POLICY", String(policyId), `Updated policy ${policyId}`);
  }

  addPolicy(policy: any): PolicyModel {
    const policies = this.getPolicies();
    const now = new Date();
    const yyyymm = now.toISOString().slice(0, 7).replace("-", "");
    const randSeq = String(Math.floor(100000 + Math.random() * 900000));
    const lobCode = (policy.policyType || policy.category || "GEN").slice(0, 3).toUpperCase();
    const policyNumber = policy.policyNumber || `POL-${lobCode}-${yyyymm}-${randSeq}`;
    const rawCustId = policy.customerId || (policy.customer && policy.customer.customerId) || (policy.customerCode ? policy.customerCode : 1);
    const assignedCustomerId = typeof rawCustId === "number" ? rawCustId : (!isNaN(Number(rawCustId)) ? Number(rawCustId) : rawCustId);
    const assignedCustomerCode = policy.customerCode || (policy.customer && policy.customer.customerCode) || (typeof rawCustId === "string" ? rawCustId : `CUST-${assignedCustomerId}`);

    const newPolicy: PolicyModel = {
      policyId: policy.policyId || policy.id || (policies.length > 0 ? Math.max(...policies.map(p => p.policyId || 0)) + 1 : 1),
      policyNumber,
      uin: policy.uin || `IRDAI/NL-GI/${lobCode}/${now.getFullYear()}/${randSeq.slice(0, 4)}`,
      productName: policy.productName || policy.name || "Custom Insurance Plan",
      policyType: policy.policyType || (policy.category ? policy.category.replace(/_.*/, '') : "Motor") as any,
      sumInsured: Number(policy.sumInsured || policy.idv || 1000000),
      annualPremium: Number(policy.annualPremium || policy.grossPremium || 15000),
      premiumPaid: Number(policy.premiumPaid || policy.annualPremium || policy.grossPremium || 15000),
      startDate: policy.startDate || now.toISOString().split("T")[0],
      endDate: policy.endDate || new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0],
      status: policy.status || "Active",
      ncbPct: policy.ncbPct || policy.ncbDiscount || 20,
      riCededPct: policy.riCededPct || 20,
      customerId: assignedCustomerId,
      customerCode: assignedCustomerCode,
      customerName: policy.customerName || (policy.customer && policy.customer.name) || "Customer",
      customerEmail: policy.customerEmail || (policy.customer && policy.customer.email) || "customer@srinsurance.com",
      customerPhone: policy.customerPhone || (policy.customer && (policy.customer.mobile || policy.customer.phone)) || "+91 98765 00000",
      customerAddress: policy.customerAddress || (policy.customer && policy.customer.address) || "India",
      vehicleNo: policy.vehicleNo || policy.vehicleDetails,
      nomineeName: policy.nomineeName || "Spouse",
      nomineeRelation: policy.nomineeRelation || "Spouse",
    };

    policies.unshift(newPolicy);
    this.set("policies", policies);

    // Update customer stats in store
    const customers = this.getCustomers();
    const cust = customers.find(c => String(c.customerId) === String(assignedCustomerId) || (c.customerCode && c.customerCode.toLowerCase() === String(assignedCustomerCode).toLowerCase()));
    if (cust) {
      cust.policiesCount = (cust.policiesCount || 0) + 1;
      cust.totalPremium = (cust.totalPremium || 0) + newPolicy.annualPremium;
      this.set("customers", customers);
    }

    this.logAudit("POLICY_ISSUED", "POLICY", policyNumber, `Issued policy ${policyNumber} for customer ${assignedCustomerCode}`);
    return newPolicy;
  }

  addClaim(claim: any): ClaimModel {
    const claims = this.getClaims();
    const now = new Date();
    const yyyymm = now.toISOString().slice(0, 7).replace("-", "");
    const randSeq = String(Math.floor(100000 + Math.random() * 900000));
    const claimNumber = claim.claimNumber || `CLM-${yyyymm}-${randSeq}`;

    const newClaim: ClaimModel = {
      claimId: claim.claimId || claim.id || claims.length + 1,
      claimNumber,
      policyId: claim.policyId || 1,
      policyNumber: claim.policyNumber || "POL-MTR-202401-001892",
      policyType: claim.policyType || "Motor",
      customerId: claim.customerId || 1,
      customerName: claim.customerName || "Arjun Mehta",
      incidentDate: claim.incidentDate || now.toISOString().split("T")[0],
      fnolDate: claim.fnolDate || now.toISOString(),
      lossType: claim.lossType || "Accidental Damage",
      incidentLocation: claim.incidentLocation || "Bengaluru",
      description: claim.description || "Incident description",
      estimatedLoss: claim.estimatedLoss || claim.claimedAmount || 25000,
      approvedAmount: claim.approvedAmount ?? null,
      deductibles: claim.deductibles || 2000,
      depreciation: claim.depreciation || 3500,
      status: claim.status || "FNOL",
      fraudScore: claim.fraudScore || 15,
      tatDays: claim.tatDays || 1,
    };

    claims.unshift(newClaim);
    this.set("claims", claims);
    this.logAudit("CLAIM_FNOL", "CLAIM", claimNumber, `Filed claim ${claimNumber}`);
    return newClaim;
  }

  updateClaim(claimId: number | string, updates: Partial<ClaimModel>) {
    const claims = this.getClaims();
    const claim = claims.find(c => String(c.claimId) === String(claimId) || c.claimNumber === claimId);
    if (!claim) return;
    Object.assign(claim, updates);
    this.set("claims", claims);
    this.logAudit("CLAIM_UPDATED", "CLAIM", String(claimId), `Updated claim ${claimId}`);
  }

  submitSurveyReport(claimId: number | string, report: {
    assessedLoss: number;
    recommendedAmount: number;
    depreciation: number;
    notes: string;
  }) {
    this.submitSurveyorReport(Number(claimId) || 1, report);
  }

  addPayment(payment: any): PaymentModel {
    const payments = this.getPayments();
    const now = new Date();
    const yyyymm = now.toISOString().slice(0, 7).replace("-", "");
    const randSeq = String(Math.floor(100000 + Math.random() * 900000));
    const receiptNumber = payment.receiptNumber || `REC-${yyyymm}-${randSeq}`;
    const transactionId = payment.gatewayTransactionId || payment.transactionId || `TXN_RZP_${Date.now()}`;
    const amount = payment.amount || 15000;
    const gstAmount = Math.round((amount * 18) / 118);

    const newPayment: PaymentModel = {
      paymentId: payment.paymentId || payments.length + 1,
      receiptNumber,
      transactionId,
      policyId: payment.policyId || 1,
      policyNumber: payment.policyNumber || "POL-MTR-202401-001892",
      customerId: payment.customerId || 1,
      customerName: payment.customerName || "Arjun Mehta",
      amount,
      gstAmount,
      paymentMethod: payment.method || payment.paymentMethod || "UPI",
      paymentDate: payment.paymentDate || now.toISOString().split("T")[0],
      paymentStatus: payment.status || payment.paymentStatus || "Success",
      description: payment.description || "Premium Payment",
      gatewayRef: payment.gatewayRef || `rzp_pay_${Date.now()}`
    };

    payments.unshift(newPayment);
    this.set("payments", payments);
    this.logAudit("PREMIUM_PAYMENT", "PAYMENT", receiptNumber, `Recorded payment ₹${amount}`);
    return newPayment;
  }

  addCustomer(customer: Partial<CustomerModel>): CustomerModel {
    const customers = this.getCustomers();
    const explicitId = typeof customer.customerId === "number" 
      ? customer.customerId 
      : (typeof customer.id === "number" ? customer.id : (!isNaN(Number(customer.customerId || customer.id)) && Number(customer.customerId || customer.id) > 0 ? Number(customer.customerId || customer.id) : undefined));

    const finalId = explicitId !== undefined ? explicitId : (customers.length > 0 ? Math.max(...customers.map(c => c.customerId)) + 1 : 1);
    const finalCode = customer.customerCode || (typeof customer.id === "string" ? customer.id : (typeof customer.customerId === "string" ? customer.customerId : `CUST-${finalId}`));

    const newCustomer: CustomerModel = {
      customerId: finalId,
      customerCode: finalCode,
      name: customer.name || "New Customer",
      email: customer.email || "customer@example.com",
      mobile: customer.mobile || customer.phone || "+91 98765 00000",
      phone: customer.phone || customer.mobile || "+91 98765 00000",
      address: customer.address || "India",
      pan: customer.pan || customer.panNumber || "ABCDE1234F",
      panNumber: customer.panNumber || customer.pan || "ABCDE1234F",
      aadhaarHmac: customer.aadhaarHmac || "aadhaar_hmac_verified",
      aadhaarLastFour: customer.aadhaarLastFour || "1234",
      kycStatus: (customer.kycStatus || customer.ekycStatus || "VERIFIED") as any,
      ekycStatus: customer.ekycStatus || "VERIFIED",
      amlStatus: (customer.amlStatus || "CLEAR") as any,
      riskProfile: customer.riskProfile || "Medium",
      creditScore: customer.creditScore || 750,
      policiesCount: customer.policiesCount || 0,
      totalPremium: customer.totalPremium || 0,
      activeClaimsCount: customer.activeClaimsCount || 0,
      customerType: customer.customerType || "Standard",
      sinceYear: customer.sinceYear || String(new Date().getFullYear()),
    };

    // Replace if same customerId already exists, else unshift
    const existingIdx = customers.findIndex(c => c.customerId === finalId || (c.customerCode && c.customerCode.toLowerCase() === finalCode.toLowerCase()));
    if (existingIdx >= 0) {
      customers[existingIdx] = { ...customers[existingIdx], ...newCustomer };
    } else {
      customers.unshift(newCustomer);
    }

    this.set("customers", customers);
    this.logAudit("CUSTOMER_CREATED", "CUSTOMER", String(newCustomer.customerId), `Created customer ${newCustomer.name} (${finalCode})`);
    return newCustomer;
  }

  updateCustomer(customerId: number | string, updates: Partial<CustomerModel>): CustomerModel {
    const customers = this.getCustomers();
    const c = customers.find(item => String(item.customerId) === String(customerId));
    if (!c) throw new Error("Customer not found");
    if (updates.name) c.name = updates.name;
    if (updates.email) c.email = updates.email;
    if (updates.phone || updates.mobile) {
      c.phone = updates.phone || updates.mobile!;
      c.mobile = c.phone;
    }
    if (updates.address) c.address = updates.address;
    Object.assign(c, updates);
    this.set("customers", customers);
    this.logAudit("CUSTOMER_UPDATED", "CUSTOMER", String(customerId), `Updated customer ${c.name}`);
    return c;
  }

  deleteCustomer(customerId: number | string): boolean {
    const customers = this.getCustomers().filter(c => String(c.customerId) !== String(customerId));
    this.set("customers", customers);
    this.logAudit("CUSTOMER_DELETED", "CUSTOMER", String(customerId), `Deleted customer ID ${customerId}`);
    return true;
  }

  addAgent(agent: Partial<AgentModel>): AgentModel {
    const agents = this.getAgents();
    const newAgent: AgentModel = {
      agentId: agents.length > 0 ? Math.max(...agents.map(a => a.agentId)) + 1 : 1,
      agentCode: agent.agentCode || `AGT-${1000 + agents.length + 1}`,
      name: agent.name || "New Agent",
      irdaiLicenseNo: agent.irdaiLicenseNo || "IRDAI-POSP-" + Math.floor(10000 + Math.random() * 90000),
      licenseExpiry: agent.licenseExpiry || "2027-12-31",
      tier: (agent.tier as any) || "Gold",
      phone: agent.phone || "+91 98000 00000",
      email: agent.email || "agent@srinsurance.com",
      bankAccount: agent.bankAccount || "XXXX XXXX 1234 (HDFC Bank)",
      ifsc: agent.ifsc || "HDFC0001234",
      commissionRatePct: agent.commissionRatePct || 15.0,
      walletBalance: agent.walletBalance || 0,
      totalGwp: agent.totalGwp || 0,
      policiesSold: agent.policiesSold || 0,
      renewalRatioPct: agent.renewalRatioPct || 90.0,
      tdsDeductedTotal: 0,
      leadsCount: 0
    };
    agents.unshift(newAgent);
    this.set("agents", agents);
    this.logAudit("AGENT_CREATED", "AGENT", newAgent.agentCode, `Created agent ${newAgent.name}`);
    return newAgent;
  }

  updateAgent(agentId: number | string, updates: Partial<AgentModel>): AgentModel {
    const agents = this.getAgents();
    const a = agents.find(item => String(item.agentId) === String(agentId));
    if (!a) throw new Error("Agent not found");
    Object.assign(a, updates);
    this.set("agents", agents);
    this.logAudit("AGENT_UPDATED", "AGENT", a.agentCode, `Updated agent ${a.name}`);
    return a;
  }

  deleteAgent(agentId: number | string): boolean {
    const agents = this.getAgents().filter(a => String(a.agentId) !== String(agentId));
    this.set("agents", agents);
    this.logAudit("AGENT_DELETED", "AGENT", String(agentId), `Deleted agent ID ${agentId}`);
    return true;
  }

  addSurveyor(surveyor: Partial<SurveyorModel>): SurveyorModel {
    const surveyors = this.getSurveyors();
    const newSurveyor: SurveyorModel = {
      surveyorId: surveyors.length > 0 ? Math.max(...surveyors.map(s => s.surveyorId)) + 1 : 1,
      name: surveyor.name || "New Surveyor",
      irdaiLicenseNo: surveyor.irdaiLicenseNo || "SLA-IRDAI-" + Math.floor(10000 + Math.random() * 90000),
      licenseExpiry: surveyor.licenseExpiry || "2027-12-31",
      specialization: surveyor.specialization || "General",
      district: surveyor.district || "Bengaluru",
      state: surveyor.state || "Karnataka",
      contactMobile: surveyor.contactMobile || surveyor.phone || "+91 98000 00000",
      email: surveyor.email || "surveyor@surveyors.in",
      isActive: true,
      activeAssignments: 0,
      completedSurveys: 0,
      rating: 4.8,
      totalEarnings: 0
    };
    surveyors.unshift(newSurveyor);
    this.set("surveyors", surveyors);
    this.logAudit("SURVEYOR_CREATED", "SURVEYOR", String(newSurveyor.surveyorId), `Created surveyor ${newSurveyor.name}`);
    return newSurveyor;
  }

  updateSurveyor(surveyorId: number | string, updates: Partial<SurveyorModel> & { phone?: string; department?: string }): SurveyorModel {
    const surveyors = this.getSurveyors();
    const s = surveyors.find(item => String(item.surveyorId) === String(surveyorId));
    if (!s) throw new Error("Surveyor not found");
    if (updates.phone) s.contactMobile = updates.phone;
    if (updates.department) s.district = updates.department;
    Object.assign(s, updates);
    this.set("surveyors", surveyors);
    this.logAudit("SURVEYOR_UPDATED", "SURVEYOR", String(surveyorId), `Updated surveyor ${s.name}`);
    return s;
  }

  deleteSurveyor(surveyorId: number | string): boolean {
    const surveyors = this.getSurveyors().filter(s => String(s.surveyorId) !== String(surveyorId));
    this.set("surveyors", surveyors);
    this.logAudit("SURVEYOR_DELETED", "SURVEYOR", String(surveyorId), `Deleted surveyor ID ${surveyorId}`);
    return true;
  }

  updatePayment(paymentId: number | string, updates: Partial<PaymentModel>): PaymentModel {
    const payments = this.getPayments();
    const p = payments.find(item => String(item.paymentId) === String(paymentId));
    if (!p) throw new Error("Payment not found");
    Object.assign(p, updates);
    this.set("payments", payments);
    this.logAudit("PAYMENT_UPDATED", "PAYMENT", p.receiptNumber, `Updated payment ${paymentId}`);
    return p;
  }

  rejectEndorsement(endorsementId: number | string, reason = "Rejected by Underwriting"): EndorsementModel {
    const endorsements = this.getEndorsements();
    const e = endorsements.find(item => String(item.endorsementId) === String(endorsementId) || item.endorsementNumber === endorsementId);
    if (!e) throw new Error("Endorsement not found");
    e.status = "Rejected";
    e.approvedBy = reason;
    this.set("endorsements", endorsements);
    this.logAudit("ENDORSEMENT_REJECTED", "ENDORSEMENT", e.endorsementNumber, `Rejected endorsement: ${reason}`);
    return e;
  }

  deletePolicy(policyId: number | string) {
    const policies = this.getPolicies().filter(p => String(p.policyId) !== String(policyId));
    this.set("policies", policies);
    this.logAudit("POLICY_DELETED", "POLICY", String(policyId), `Deleted policy ID ${policyId}`);
  }

  deleteClaim(claimId: number | string) {
    const claims = this.getClaims().filter(c => String(c.claimId) !== String(claimId));
    this.set("claims", claims);
    this.logAudit("CLAIM_DELETED", "CLAIM", String(claimId), `Deleted claim ID ${claimId}`);
  }

  logAudit(action: string, entityTypeOrDesc: string, entityIdOrUser = "SYS", description?: string) {
    const logs = this.getAuditLogs();
    const entityType = description ? entityTypeOrDesc : "SYSTEM";
    const entityId = description ? entityIdOrUser : "SYS";
    const desc = description || entityTypeOrDesc;

    const newLog: AuditLogModel = {
      logId: logs.length + 1,
      username: "current_user",
      action,
      entityType,
      entityId,
      description: desc,
      ipAddress: "127.0.0.1",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19)
    };
    logs.unshift(newLog);
    this.set("audit", logs.slice(0, 100)); // retain recent 100
  }
}

export const insuranceStore = new InsuranceStore();

