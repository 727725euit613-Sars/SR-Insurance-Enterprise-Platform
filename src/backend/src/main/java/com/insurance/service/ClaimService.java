package com.insurance.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;

import com.insurance.dto.ClaimDto;
import com.insurance.entity.Claim;
import com.insurance.entity.Customer;
import com.insurance.entity.Policy;
import com.insurance.entity.Surveyor;
import com.insurance.exception.InvalidRequestException;
import com.insurance.exception.ResourceNotFoundException;
import com.insurance.repository.ClaimRepository;
import com.insurance.repository.CustomerRepository;
import com.insurance.repository.PolicyRepository;
import com.insurance.repository.SurveyorRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final CustomerRepository customerRepository;
    private final PolicyRepository policyRepository;
    private final SurveyorRepository surveyorRepository;
    private final AuditService auditService;

    public List<Claim> getAllClaims() {
        return claimRepository.findAll();
    }

    public Claim getClaimById(Long id) {
        return claimRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + id));
    }

    public Claim createClaim(ClaimDto dto) {
        if (dto.getPolicyId() != null && claimRepository.existsByPolicyPolicyIdAndIncidentDateAndDescriptionIgnoreCase(
                dto.getPolicyId(), dto.getIncidentDate(), dto.getDescription())) {
            throw new InvalidRequestException("A claim with the same policy, incident date, and description already exists");
        }
        Claim claim = new Claim();
        claim.setClaimNumber(generateClaimNumber());
        mapDtoToClaim(dto, claim);
        Claim saved = claimRepository.save(claim);
        auditService.log("CREATE_CLAIM", "Claim", saved.getClaimId(), "Filed claim: " + saved.getClaimNumber());
        return saved;
    }

    public Claim updateClaim(Long id, ClaimDto dto) {
        Claim existing = getClaimById(id);
        mapDtoToClaim(dto, existing);
        Claim saved = claimRepository.save(existing);
        auditService.log("UPDATE_CLAIM", "Claim", saved.getClaimId(), "Updated claim: " + saved.getClaimNumber() + " status=" + saved.getStatus());
        return saved;
    }

    public void deleteClaim(Long id) {
        Claim claim = getClaimById(id);
        auditService.log("DELETE_CLAIM", "Claim", claim.getClaimId(), "Deleted claim: " + claim.getClaimNumber());
        claimRepository.delete(claim);
    }

    public List<Claim> getClaimsByStatus(String status) {
        if (status == null || status.isBlank()) return claimRepository.findAll();
        return claimRepository.findByStatusContainingIgnoreCase(status);
    }

    public List<Claim> getClaimsByCustomer(Long customerId) {
        return claimRepository.findByCustomerCustomerId(customerId);
    }

    private void mapDtoToClaim(ClaimDto dto, Claim claim) {
        claim.setClaimAmount(dto.getClaimAmount());
        claim.setStatus(dto.getStatus());
        claim.setDescription(dto.getDescription());
        claim.setIncidentDate(dto.getIncidentDate());
        claim.setIncidentLocation(dto.getIncidentLocation());
        claim.setApprovedAmount(dto.getApprovedAmount());
        claim.setAssessmentNotes(dto.getAssessmentNotes());

        if (dto.getPolicyId() != null) {
            Policy policy = policyRepository.findById(dto.getPolicyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Policy not found: " + dto.getPolicyId()));
            if (!"Active".equalsIgnoreCase(policy.getPolicyStatus())) {
                throw new InvalidRequestException("Cannot file a claim against a non-active policy");
            }
            claim.setPolicy(policy);
            claim.setCustomer(policy.getCustomer());
        } else if (dto.getCustomerId() != null) {
            Customer customer = customerRepository.findById(dto.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + dto.getCustomerId()));
            claim.setCustomer(customer);
        }

        if (dto.getSurveyorId() != null) {
            Surveyor surveyor = surveyorRepository.findById(dto.getSurveyorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Surveyor not found: " + dto.getSurveyorId()));
            claim.setSurveyor(surveyor);
        }
    }

    private String generateClaimNumber() {
        String year = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy"));
        long count = claimRepository.count() + 1;
        return String.format("CLM-%s-%06d", year, count);
    }
}
