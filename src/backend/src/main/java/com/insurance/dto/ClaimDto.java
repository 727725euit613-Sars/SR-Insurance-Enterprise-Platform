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
public class ClaimDto {

    private Long claimId;
    private String claimNumber;

    @NotNull(message = "Claim amount is required")
    @Min(value = 1, message = "Claim amount must be greater than 0")
    private Double claimAmount;

    @NotBlank(message = "Status is required")
    private String status;

    @NotBlank(message = "Description is required")
    private String description;

    private LocalDate incidentDate;
    private String incidentLocation;
    private Double approvedAmount;
    private String assessmentNotes;
    private Long customerId;
    private Long policyId;
    private Long surveyorId;
}
