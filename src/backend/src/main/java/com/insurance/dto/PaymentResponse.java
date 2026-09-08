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
public class PaymentResponse {
    private Long paymentId;
    private String transactionId;
    private Double amount;
    private String paymentMethod;
    private LocalDate paymentDate;
    private String paymentStatus;
    private String description;
    private CustomerSummary customer;
    private PolicySummary policy;

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
    }
}
