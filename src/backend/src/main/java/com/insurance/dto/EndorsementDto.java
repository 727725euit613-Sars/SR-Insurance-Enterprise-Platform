package com.insurance.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EndorsementDto {
    @NotNull(message = "Policy is required")
    private Long policyId;

    @NotBlank(message = "Endorsement type is required")
    private String endorsementType;

    @NotBlank(message = "Endorsement description is required")
    private String description;

    private Double premiumAdjustment;

    @NotNull(message = "Effective date is required")
    private LocalDate effectiveDate;

    private String oldValue;
    private String newValue;
}
