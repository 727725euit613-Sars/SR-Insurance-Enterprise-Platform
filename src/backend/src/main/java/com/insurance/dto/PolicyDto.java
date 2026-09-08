package com.insurance.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PolicyDto {

    private Long policyId;
    private String policyNumber;

    @NotBlank(message = "Policy name is required")
    private String policyName;

    @NotBlank(message = "Policy type is required")
    private String policyType;

    @NotNull(message = "Premium amount is required")
    @Min(value = 1, message = "Premium amount must be greater than 0")
    private Double premiumAmount;

    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1")
    private Integer duration;

    @NotBlank(message = "Status is required")
    private String policyStatus;

    private LocalDate startDate;
    private LocalDate endDate;
    private Double coverageAmount;
    private Long customerId;
    private Long agentId;
}
