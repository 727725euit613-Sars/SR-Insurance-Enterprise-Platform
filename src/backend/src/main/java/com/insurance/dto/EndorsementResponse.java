package com.insurance.dto;

import java.time.LocalDate;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class EndorsementResponse {
    Long endorsementId;
    String endorsementNumber;
    Long policyId;
    String policyNumber;
    Long customerId;
    String endorsementType;
    String description;
    Double premiumAdjustment;
    LocalDate effectiveDate;
    String status;
    String approvedBy;
    LocalDate createdAt;
    String oldValue;
    String newValue;
}
