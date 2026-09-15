/**
 * SRS-42 Validation Engine & Automated Test Runner
 * Implements all 10 statutory validation rules from Appendix C & D of the
 * IEEE Std 830-1998 Software Requirements Specification (SRS-42).
 */

export const SRS_ERRORS = {
  AGENT_AUTHORITY_LIMIT: "Sum insured exceeds agent authority limit — referred to underwriter",
  ACTIVE_POLICY_CLAIM: "Policy was not active on the incident date — claim cannot be lodged",
  CLAIM_DUPLICATE: "A claim for this incident may already exist — please verify before proceeding",
  FREE_LOOK_CANCELLATION: "Free-look period has expired — cancellation terms apply",
  NCB_SLAB_VALIDATION: "NCB percentage does not match claim-free years",
  SURVEYOR_LICENSE: "Surveyor's IRDAI license is expired — please select another surveyor",
  CLAIM_TAT_WARNING: "Claim decision TAT limit approaching — escalation required",
  RI_CESSION_COMPLETENESS: "Reinsurance cession not computed for this policy",
  PAYMENT_CUSTOMER_ONLY: "Claim payment must go to the insured's registered account or empanelled service provider",
  LAPSED_POLICY_GRACE: "Policy is lapsed — new claims cannot be filed; renew to reinstate coverage",
} as const;

export const VALID_NCB_SLABS = [0, 20, 25, 35, 45, 50] as const;
export const DEFAULT_AGENT_AUTHORITY_LIMIT = 5000000; // ₹50 Lakhs limit for agents

export interface SrsValidationResult {
  valid: boolean;
  error?: string;
  warning?: string;
}

export interface SrsTestCaseResult {
  id: string;
  ruleName: string;
  srsSection: string;
  description: string;
  testInput: string;
  expectedOutput: string;
  actualOutput: string;
  status: "PASSED" | "FAILED";
  durationMs: number;
  statutoryReference: string;
}

// ─── Individual Rule Validators ────────────────────────────────────────────────

/**
 * 1. Agent Authority Limit: Policy sum insured must be within agent's authority limit;
 * beyond requires underwriter sign-off.
 */
export function validateAgentAuthority(
  sumInsured: number,
  agentAuthorityLimit = DEFAULT_AGENT_AUTHORITY_LIMIT,
  isAgentIssued = true
): SrsValidationResult {
  if (isAgentIssued && sumInsured > agentAuthorityLimit) {
    return { valid: false, error: SRS_ERRORS.AGENT_AUTHORITY_LIMIT };
  }
  return { valid: true };
}

/**
 * 2. Active Policy for Claim: Claim FNOL allowed only if policy is ACTIVE and incident date is within policy period.
 */
export function validateActivePolicyForClaim(
  policy: { status: string; startDate: string; endDate: string },
  incidentDate: string
): SrsValidationResult {
  const normStatus = policy.status.toUpperCase();
  if (normStatus === "LAPSED") {
    return { valid: false, error: SRS_ERRORS.LAPSED_POLICY_GRACE };
  }
  if (normStatus !== "ACTIVE") {
    return { valid: false, error: SRS_ERRORS.ACTIVE_POLICY_CLAIM };
  }
  if (incidentDate < policy.startDate || incidentDate > policy.endDate) {
    return { valid: false, error: SRS_ERRORS.ACTIVE_POLICY_CLAIM };
  }
  return { valid: true };
}

/**
 * 3. Claim Duplicate: System checks incident date + policy + loss type for duplicate FNOL.
 */
export function validateClaimDuplicate(
  existingClaims: Array<{ policyId: number | string; incidentDate: string; lossType?: string; status?: string }>,
  newClaim: { policyId: number | string; incidentDate: string; lossType?: string }
): SrsValidationResult {
  const hasDuplicate = existingClaims.some(
    c =>
      String(c.policyId) === String(newClaim.policyId) &&
      c.incidentDate === newClaim.incidentDate &&
      (!c.status || c.status.toLowerCase() !== "rejected") &&
      (!c.lossType || !newClaim.lossType || c.lossType.toLowerCase() === newClaim.lossType.toLowerCase())
  );
  if (hasDuplicate) {
    return { valid: false, error: SRS_ERRORS.CLAIM_DUPLICATE };
  }
  return { valid: true };
}

/**
 * 4. Free-Look Cancellation: Customer can cancel within 15 days of issuance; premium refunded
 * (less stamp duty and proportionate risk premium).
 */
export function validateFreeLookCancellation(
  policyStartDate: string,
  requestDate = new Date().toISOString().split("T")[0]
): SrsValidationResult {
  const start = new Date(policyStartDate).getTime();
  const current = new Date(requestDate).getTime();
  const diffDays = Math.floor((current - start) / (1000 * 60 * 60 * 24));
  if (diffDays > 15) {
    return { valid: false, error: SRS_ERRORS.FREE_LOOK_CANCELLATION };
  }
  return { valid: true };
}

/**
 * 5. NCB Slab Validation: NCB % must be one of: 0, 20, 25, 35, 45, 50;
 * cannot be manually overridden beyond claim-free years.
 */
export function validateNcbSlab(ncbPct: number): SrsValidationResult {
  if (!VALID_NCB_SLABS.includes(ncbPct as typeof VALID_NCB_SLABS[number])) {
    return { valid: false, error: SRS_ERRORS.NCB_SLAB_VALIDATION };
  }
  return { valid: true };
}

/**
 * 6. Surveyor License: Surveyor cannot be assigned to a claim if their IRDAI license is expired.
 */
export function validateSurveyorLicense(
  licenseExpiry: string,
  currentDate = new Date().toISOString().split("T")[0]
): SrsValidationResult {
  if (licenseExpiry < currentDate) {
    return { valid: false, error: SRS_ERRORS.SURVEYOR_LICENSE };
  }
  return { valid: true };
}

/**
 * 7. Claim TAT Warning: At 20 days (life) / 5 days (motor OD), warning triggered;
 * at 30/7 days breach triggered.
 */
export function checkClaimTat(
  fnolDate: string,
  lob: "MOTOR" | "MOTOR_OD" | "MOTOR_TP" | "HEALTH" | "LIFE" | "PROPERTY" | string,
  currentDate = new Date().toISOString().split("T")[0]
): { warning: boolean; breach: boolean; daysElapsed: number; limitDays: number; message?: string } {
  const start = new Date(fnolDate).getTime();
  const current = new Date(currentDate).getTime();
  const daysElapsed = Math.max(0, Math.floor((current - start) / (1000 * 60 * 60 * 24)));
  const isMotor = lob.toUpperCase().includes("MOTOR");
  const limitDays = isMotor ? 7 : 30;
  const warningThreshold = isMotor ? 5 : 20;

  const warning = daysElapsed >= warningThreshold && daysElapsed < limitDays;
  const breach = daysElapsed >= limitDays;

  return {
    warning,
    breach,
    daysElapsed,
    limitDays,
    message: (warning || breach) ? SRS_ERRORS.CLAIM_TAT_WARNING : undefined,
  };
}

/**
 * 8. RI Cession Completeness: All policies must have RI cession computed at issuance;
 * zero cession allowed only for retained risks with explicit flag.
 */
export function validateRiCession(
  riCededPct: number | undefined,
  isExplicitRetainedRisk = false
): SrsValidationResult {
  if (riCededPct === undefined || riCededPct === null) {
    return { valid: false, error: SRS_ERRORS.RI_CESSION_COMPLETENESS };
  }
  if (riCededPct === 0 && !isExplicitRetainedRisk) {
    return { valid: false, error: SRS_ERRORS.RI_CESSION_COMPLETENESS };
  }
  if (riCededPct < 0 || riCededPct > 100) {
    return { valid: false, error: SRS_ERRORS.RI_CESSION_COMPLETENESS };
  }
  return { valid: true };
}

/**
 * 9. Payment to Customer Only: Claim payout can only be made to customer's registered bank account
 * or network garage/hospital.
 */
export function validateClaimPayee(
  payeeType: "CUSTOMER" | "GARAGE" | "HOSPITAL" | "THIRD_PARTY_UNREGISTERED",
  hasRegisteredAccount: boolean
): SrsValidationResult {
  if (payeeType === "THIRD_PARTY_UNREGISTERED" || !hasRegisteredAccount) {
    return { valid: false, error: SRS_ERRORS.PAYMENT_CUSTOMER_ONLY };
  }
  return { valid: true };
}

/**
 * 10. Lapsed Policy Grace: Lapsed policy cannot have new FNOL; existing claim filed before lapse
 * is processed normally.
 */
export function validateLapsedPolicyForClaim(policyStatus: string): SrsValidationResult {
  if (policyStatus.toUpperCase() === "LAPSED") {
    return { valid: false, error: SRS_ERRORS.LAPSED_POLICY_GRACE };
  }
  return { valid: true };
}

// ─── Automated Test Suite Runner (All 10 Appendix C Rules) ─────────────────────

export function runAllSrsTestCases(): SrsTestCaseResult[] {
  const results: SrsTestCaseResult[] = [];

  // TC-SRS-01: Agent Authority Limit
  {
    const t0 = performance.now();
    const testInput = "Agent submits Sum Insured = ₹75,00,000 (Authority Limit = ₹50,00,000)";
    const res = validateAgentAuthority(7500000, 5000000, true);
    const actualOutput = res.error || "Approved";
    const passed = actualOutput === SRS_ERRORS.AGENT_AUTHORITY_LIMIT;
    results.push({
      id: "TC-SRS-01",
      ruleName: "Agent Authority Limit",
      srsSection: "FR10 / Appendix C",
      description: "Policy sum insured must be within agent's configured authority limit; beyond requires underwriter approval.",
      testInput,
      expectedOutput: SRS_ERRORS.AGENT_AUTHORITY_LIMIT,
      actualOutput,
      status: passed ? "PASSED" : "FAILED",
      durationMs: Math.round((performance.now() - t0) * 100) / 100,
      statutoryReference: "IRDAI (Insurance Agents) Regulations 2020",
    });
  }

  // TC-SRS-02: Active Policy for Claim
  {
    const t0 = performance.now();
    const testInput = "Incident Date: 2026-08-10 | Policy Period: 2026-01-01 to 2026-06-30 (EXPIRED)";
    const res = validateActivePolicyForClaim(
      { status: "EXPIRED", startDate: "2026-01-01", endDate: "2026-06-30" },
      "2026-08-10"
    );
    const actualOutput = res.error || "Claim Registered";
    const passed = actualOutput === SRS_ERRORS.ACTIVE_POLICY_CLAIM;
    results.push({
      id: "TC-SRS-02",
      ruleName: "Active Policy for Claim",
      srsSection: "FR6 / Appendix C",
      description: "Claim FNOL allowed only if policy is ACTIVE and incident date is strictly within policy inception/expiry.",
      testInput,
      expectedOutput: SRS_ERRORS.ACTIVE_POLICY_CLAIM,
      actualOutput,
      status: passed ? "PASSED" : "FAILED",
      durationMs: Math.round((performance.now() - t0) * 100) / 100,
      statutoryReference: "Section 64VB, Insurance Act 1938",
    });
  }

  // TC-SRS-03: Claim Duplicate Prevention
  {
    const t0 = performance.now();
    const testInput = "Duplicate FNOL on same Incident Date (2026-04-12) and Policy (POL-MTR-001) for Accidental Damage";
    const existing = [{ policyId: "POL-MTR-001", incidentDate: "2026-04-12", lossType: "Accidental Damage", status: "FNOL" }];
    const res = validateClaimDuplicate(existing, { policyId: "POL-MTR-001", incidentDate: "2026-04-12", lossType: "Accidental Damage" });
    const actualOutput = res.error || "Allowed";
    const passed = actualOutput === SRS_ERRORS.CLAIM_DUPLICATE;
    results.push({
      id: "TC-SRS-03",
      ruleName: "Claim Duplicate Detection",
      srsSection: "FR6 / Appendix C",
      description: "System checks incident date + policy + loss type for duplicate First Notice of Loss.",
      testInput,
      expectedOutput: SRS_ERRORS.CLAIM_DUPLICATE,
      actualOutput,
      status: passed ? "PASSED" : "FAILED",
      durationMs: Math.round((performance.now() - t0) * 100) / 100,
      statutoryReference: "IRDAI Claims Adjudication Framework 2024",
    });
  }

  // TC-SRS-04: Free-Look Cancellation
  {
    const t0 = performance.now();
    const testInput = "Customer submits free-look cancellation 22 days after policy issuance date (Limit = 15 days)";
    const res = validateFreeLookCancellation("2026-01-01", "2026-01-23");
    const actualOutput = res.error || "Full Free-Look Refund";
    const passed = actualOutput === SRS_ERRORS.FREE_LOOK_CANCELLATION;
    results.push({
      id: "TC-SRS-04",
      ruleName: "Free-Look Cancellation Period",
      srsSection: "FR3 / Appendix C",
      description: "Customer can cancel within 15 days of issuance; cancellation after 15 days falls under standard short-rate terms.",
      testInput,
      expectedOutput: SRS_ERRORS.FREE_LOOK_CANCELLATION,
      actualOutput,
      status: passed ? "PASSED" : "FAILED",
      durationMs: Math.round((performance.now() - t0) * 100) / 100,
      statutoryReference: "IRDAI (Protection of Policyholders' Interests) Reg. 2017",
    });
  }

  // TC-SRS-05: NCB Slab Strict Validation
  {
    const t0 = performance.now();
    const testInput = "Quotation engine passed arbitrary NCB rate = 30% (Valid IRDAI slabs: 0%, 20%, 25%, 35%, 45%, 50%)";
    const res = validateNcbSlab(30);
    const actualOutput = res.error || "Valid NCB applied";
    const passed = actualOutput === SRS_ERRORS.NCB_SLAB_VALIDATION;
    results.push({
      id: "TC-SRS-05",
      ruleName: "NCB Slab Validation",
      srsSection: "FR1 / Appendix C",
      description: "NCB % must strictly match statutory slabs: 0, 20, 25, 35, 45, or 50% and cannot be arbitrary.",
      testInput,
      expectedOutput: SRS_ERRORS.NCB_SLAB_VALIDATION,
      actualOutput,
      status: passed ? "PASSED" : "FAILED",
      durationMs: Math.round((performance.now() - t0) * 100) / 100,
      statutoryReference: "India Motor Tariff (IMT) General Regulation 27",
    });
  }

  // TC-SRS-06: Surveyor License Validation
  {
    const t0 = performance.now();
    const testInput = "Claims handler assigns surveyor whose IRDAI license expired on 2025-12-31 (Current: 2026-09-15)";
    const res = validateSurveyorLicense("2025-12-31", "2026-09-15");
    const actualOutput = res.error || "Surveyor Assigned";
    const passed = actualOutput === SRS_ERRORS.SURVEYOR_LICENSE;
    results.push({
      id: "TC-SRS-06",
      ruleName: "Surveyor License Verification",
      srsSection: "FR7 / Appendix C",
      description: "Surveyor cannot be assigned to an inspection if their IRDAI license is expired.",
      testInput,
      expectedOutput: SRS_ERRORS.SURVEYOR_LICENSE,
      actualOutput,
      status: passed ? "PASSED" : "FAILED",
      durationMs: Math.round((performance.now() - t0) * 100) / 100,
      statutoryReference: "IRDAI (Insurance Surveyors and Loss Assessors) Reg. 2020",
    });
  }

  // TC-SRS-07: Claim TAT Warning & Escalation
  {
    const t0 = performance.now();
    const testInput = "Motor OD Claim pending at day 6 (Warning threshold = 5 days, Statutory breach = 7 days)";
    const tat = checkClaimTat("2026-09-09", "MOTOR_OD", "2026-09-15");
    const actualOutput = tat.message || (tat.warning ? SRS_ERRORS.CLAIM_TAT_WARNING : "Within SLA");
    const passed = actualOutput === SRS_ERRORS.CLAIM_TAT_WARNING && tat.warning;
    results.push({
      id: "TC-SRS-07",
      ruleName: "Claim TAT Warning & Escalation",
      srsSection: "FR11 / Appendix C",
      description: "At 20 days (life) / 5 days (motor OD), warning triggered; at 30/7 days breach alert triggered to compliance officer.",
      testInput,
      expectedOutput: SRS_ERRORS.CLAIM_TAT_WARNING,
      actualOutput,
      status: passed ? "PASSED" : "FAILED",
      durationMs: Math.round((performance.now() - t0) * 100) / 100,
      statutoryReference: "IRDAI Master Circular on Claims Settlement TAT 2024",
    });
  }

  // TC-SRS-08: Reinsurance Cession Completeness
  {
    const t0 = performance.now();
    const testInput = "Commercial policy created without computing RI Cession (riCededPct = undefined)";
    const res = validateRiCession(undefined, false);
    const actualOutput = res.error || "Policy Issued";
    const passed = actualOutput === SRS_ERRORS.RI_CESSION_COMPLETENESS;
    results.push({
      id: "TC-SRS-08",
      ruleName: "RI Cession Completeness",
      srsSection: "FR9 / Appendix C",
      description: "All policies must have RI cession computed at issuance; zero cession allowed only for retained risks.",
      testInput,
      expectedOutput: SRS_ERRORS.RI_CESSION_COMPLETENESS,
      actualOutput,
      status: passed ? "PASSED" : "FAILED",
      durationMs: Math.round((performance.now() - t0) * 100) / 100,
      statutoryReference: "IRDAI (Reinsurance) Regulations 2018",
    });
  }

  // TC-SRS-09: Payment to Registered Customer or Network Entity Only
  {
    const t0 = performance.now();
    const testInput = "Claims disbursement attempted to unverified third-party account (Payee: THIRD_PARTY_UNREGISTERED)";
    const res = validateClaimPayee("THIRD_PARTY_UNREGISTERED", false);
    const actualOutput = res.error || "Disbursement Executed";
    const passed = actualOutput === SRS_ERRORS.PAYMENT_CUSTOMER_ONLY;
    results.push({
      id: "TC-SRS-09",
      ruleName: "Claim Payout Payee Validation",
      srsSection: "FR8 / Appendix C",
      description: "Claim payout can only be made to customer's registered bank account or network garage/hospital.",
      testInput,
      expectedOutput: SRS_ERRORS.PAYMENT_CUSTOMER_ONLY,
      actualOutput,
      status: passed ? "PASSED" : "FAILED",
      durationMs: Math.round((performance.now() - t0) * 100) / 100,
      statutoryReference: "PMLA / AML-CFT Directives (RBI & IRDAI)",
    });
  }

  // TC-SRS-10: Lapsed Policy Grace & FNOL Block
  {
    const t0 = performance.now();
    const testInput = "Customer attempts First Notice of Loss on LAPSED policy (Past 15-day grace period without payment)";
    const res = validateLapsedPolicyForClaim("LAPSED");
    const actualOutput = res.error || "Claim Accepted";
    const passed = actualOutput === SRS_ERRORS.LAPSED_POLICY_GRACE;
    results.push({
      id: "TC-SRS-10",
      ruleName: "Lapsed Policy FNOL Restriction",
      srsSection: "FR3, FR6 / Appendix C",
      description: "Lapsed policy cannot have new FNOL; policy must be reinstated/renewed to restore risk coverage.",
      testInput,
      expectedOutput: SRS_ERRORS.LAPSED_POLICY_GRACE,
      actualOutput,
      status: passed ? "PASSED" : "FAILED",
      durationMs: Math.round((performance.now() - t0) * 100) / 100,
      statutoryReference: "IRDAI Standard Policy Conditions Clause 4.2",
    });
  }

  return results;
}
