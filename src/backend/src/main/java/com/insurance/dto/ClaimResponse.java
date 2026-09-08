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
public class ClaimResponse {
    private Long claimId;
    private String claimNumber;
    private Double claimAmount;
    private String status;
    private String description;
    private LocalDate incidentDate;
    private String incidentLocation;
    private Double approvedAmount;
    private String assessmentNotes;
    private CustomerSummary customer;
    private PolicySummary policy;
    private SurveyorSummary surveyor;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerSummary {
        private Long customerId;
        private String name;
        private String email;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PolicySummary {
        private Long policyId;
        private String policyNumber;
        private String policyName;
        private String policyType;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SurveyorSummary {
        private Long surveyorId;
        private String name;
        private String email;
        private String phone;
    }
}
