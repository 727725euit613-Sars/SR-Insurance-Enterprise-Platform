package com.insurance.dto;

import com.insurance.entity.Agent;
import com.insurance.entity.Claim;
import com.insurance.entity.Customer;
import com.insurance.entity.Payment;
import com.insurance.entity.Policy;
import com.insurance.entity.Surveyor;
import com.insurance.entity.User;

public final class DtoMapper {

    private DtoMapper() {}

    public static UserResponse toUserResponse(User u) {
        if (u == null) return null;
        return UserResponse.builder()
                .userId(u.getUserId())
                .username(u.getUsername())
                .email(u.getEmail())
                .role(u.getRole())
                .build();
    }

    public static CustomerResponse toCustomerResponse(Customer c) {
        if (c == null) return null;
        return CustomerResponse.builder()
                .customerId(c.getCustomerId())
                .name(c.getName())
                .email(c.getEmail())
                .phone(c.getPhone())
                .address(c.getAddress())
                .build();
    }

    public static AgentResponse toAgentResponse(Agent a) {
        if (a == null) return null;
        return AgentResponse.builder()
                .agentId(a.getAgentId())
                .name(a.getName())
                .email(a.getEmail())
                .phone(a.getPhone())
                .licenseNumber(a.getLicenseNumber())
                .specialization(a.getSpecialization())
                .build();
    }

    public static SurveyorResponse toSurveyorResponse(Surveyor s) {
        if (s == null) return null;
        return SurveyorResponse.builder()
                .surveyorId(s.getSurveyorId())
                .name(s.getName())
                .email(s.getEmail())
                .phone(s.getPhone())
                .specialization(s.getSpecialization())
                .department(s.getDepartment())
                .build();
    }

    public static PolicyResponse toPolicyResponse(Policy p) {
        if (p == null) return null;
        PolicyResponse.CustomerSummary custSummary = null;
        if (p.getCustomer() != null) {
            custSummary = PolicyResponse.CustomerSummary.builder()
                    .customerId(p.getCustomer().getCustomerId())
                    .name(p.getCustomer().getName())
                    .email(p.getCustomer().getEmail())
                    .phone(p.getCustomer().getPhone())
                    .build();
        }

        PolicyResponse.AgentSummary agentSummary = null;
        if (p.getAgent() != null) {
            agentSummary = PolicyResponse.AgentSummary.builder()
                    .agentId(p.getAgent().getAgentId())
                    .name(p.getAgent().getName())
                    .email(p.getAgent().getEmail())
                    .build();
        }

        return PolicyResponse.builder()
                .policyId(p.getPolicyId())
                .policyNumber(p.getPolicyNumber())
                .policyName(p.getPolicyName())
                .policyType(p.getPolicyType())
                .premiumAmount(p.getPremiumAmount())
                .duration(p.getDuration())
                .policyStatus(p.getPolicyStatus())
                .startDate(p.getStartDate())
                .endDate(p.getEndDate())
                .coverageAmount(p.getCoverageAmount())
                .customer(custSummary)
                .agent(agentSummary)
                .build();
    }

    public static ClaimResponse toClaimResponse(Claim c) {
        if (c == null) return null;
        ClaimResponse.CustomerSummary custSummary = null;
        if (c.getCustomer() != null) {
            custSummary = ClaimResponse.CustomerSummary.builder()
                    .customerId(c.getCustomer().getCustomerId())
                    .name(c.getCustomer().getName())
                    .email(c.getCustomer().getEmail())
                    .build();
        }

        ClaimResponse.PolicySummary polSummary = null;
        if (c.getPolicy() != null) {
            polSummary = ClaimResponse.PolicySummary.builder()
                    .policyId(c.getPolicy().getPolicyId())
                    .policyNumber(c.getPolicy().getPolicyNumber())
                    .policyName(c.getPolicy().getPolicyName())
                    .policyType(c.getPolicy().getPolicyType())
                    .build();
        }

        ClaimResponse.SurveyorSummary survSummary = null;
        if (c.getSurveyor() != null) {
            survSummary = ClaimResponse.SurveyorSummary.builder()
                    .surveyorId(c.getSurveyor().getSurveyorId())
                    .name(c.getSurveyor().getName())
                    .email(c.getSurveyor().getEmail())
                    .phone(c.getSurveyor().getPhone())
                    .build();
        }

        return ClaimResponse.builder()
                .claimId(c.getClaimId())
                .claimNumber(c.getClaimNumber())
                .claimAmount(c.getClaimAmount())
                .status(c.getStatus())
                .description(c.getDescription())
                .incidentDate(c.getIncidentDate())
                .incidentLocation(c.getIncidentLocation())
                .approvedAmount(c.getApprovedAmount())
                .assessmentNotes(c.getAssessmentNotes())
                .customer(custSummary)
                .policy(polSummary)
                .surveyor(survSummary)
                .build();
    }

    public static PaymentResponse toPaymentResponse(Payment p) {
        if (p == null) return null;
        PaymentResponse.CustomerSummary custSummary = null;
        if (p.getCustomer() != null) {
            custSummary = PaymentResponse.CustomerSummary.builder()
                    .customerId(p.getCustomer().getCustomerId())
                    .name(p.getCustomer().getName())
                    .email(p.getCustomer().getEmail())
                    .build();
        }

        PaymentResponse.PolicySummary polSummary = null;
        if (p.getPolicy() != null) {
            polSummary = PaymentResponse.PolicySummary.builder()
                    .policyId(p.getPolicy().getPolicyId())
                    .policyNumber(p.getPolicy().getPolicyNumber())
                    .policyName(p.getPolicy().getPolicyName())
                    .build();
        }

        return PaymentResponse.builder()
                .paymentId(p.getPaymentId())
                .transactionId(p.getTransactionId())
                .amount(p.getAmount())
                .paymentMethod(p.getPaymentMethod())
                .paymentDate(p.getPaymentDate())
                .paymentStatus(p.getPaymentStatus())
                .description(p.getDescription())
                .customer(custSummary)
                .policy(polSummary)
                .build();
    }
}
