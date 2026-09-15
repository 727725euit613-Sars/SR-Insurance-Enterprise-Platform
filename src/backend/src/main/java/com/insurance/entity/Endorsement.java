package com.insurance.entity;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "endorsements")
@Getter
@Setter
@NoArgsConstructor
public class Endorsement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long endorsementId;

    private String endorsementNumber;

    @NotBlank(message = "Endorsement type is required")
    private String endorsementType;

    @NotBlank(message = "Endorsement description is required")
    private String description;

    private Double premiumAdjustment;

    @NotNull(message = "Effective date is required")
    private LocalDate effectiveDate;

    @NotBlank(message = "Endorsement status is required")
    private String status;

    private String approvedBy;
    private LocalDate createdAt;
    private String oldValue;
    private String newValue;

    @ManyToOne
    @JoinColumn(name = "policy_id", nullable = false)
    private Policy policy;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;
}
