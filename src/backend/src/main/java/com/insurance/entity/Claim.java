package com.insurance.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "claims")
public class Claim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long claimId;

    @NotBlank(message = "Claim number is required")
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

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "policy_id")
    private Policy policy;

    @ManyToOne
    @JoinColumn(name = "surveyor_id")
    private Surveyor surveyor;

    public Long getClaimId() { return claimId; }
    public void setClaimId(Long claimId) { this.claimId = claimId; }
    public String getClaimNumber() { return claimNumber; }
    public void setClaimNumber(String claimNumber) { this.claimNumber = claimNumber; }
    public Double getClaimAmount() { return claimAmount; }
    public void setClaimAmount(Double claimAmount) { this.claimAmount = claimAmount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDate getIncidentDate() { return incidentDate; }
    public void setIncidentDate(LocalDate incidentDate) { this.incidentDate = incidentDate; }
    public String getIncidentLocation() { return incidentLocation; }
    public void setIncidentLocation(String incidentLocation) { this.incidentLocation = incidentLocation; }
    public Double getApprovedAmount() { return approvedAmount; }
    public void setApprovedAmount(Double approvedAmount) { this.approvedAmount = approvedAmount; }
    public String getAssessmentNotes() { return assessmentNotes; }
    public void setAssessmentNotes(String assessmentNotes) { this.assessmentNotes = assessmentNotes; }
    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }
    public Policy getPolicy() { return policy; }
    public void setPolicy(Policy policy) { this.policy = policy; }
    public Surveyor getSurveyor() { return surveyor; }
    public void setSurveyor(Surveyor surveyor) { this.surveyor = surveyor; }
}
