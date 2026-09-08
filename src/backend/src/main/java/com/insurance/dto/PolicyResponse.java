package com.insurance.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PolicyResponse {
    private Long policyId;
    private String policyNumber;
    private String policyName;
    private String policyType;
    private Double premiumAmount;
    private Integer duration;
    private String policyStatus;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double coverageAmount;
    private CustomerSummary customer;
    private AgentSummary agent;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerSummary {
        private Long customerId;
        private String name;
        private String email;
        private String phone;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AgentSummary {
        private Long agentId;
        private String name;
        private String email;
    }
}
