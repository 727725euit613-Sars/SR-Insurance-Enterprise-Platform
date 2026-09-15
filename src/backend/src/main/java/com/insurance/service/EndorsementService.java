package com.insurance.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.insurance.dto.EndorsementDto;
import com.insurance.entity.Endorsement;
import com.insurance.entity.Policy;
import com.insurance.exception.ResourceNotFoundException;
import com.insurance.repository.EndorsementRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EndorsementService {

    private final EndorsementRepository endorsementRepository;
    private final PolicyService policyService;
    private final AuditService auditService;

    public List<Endorsement> getAll() {
        return endorsementRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Endorsement> getByCustomer(Long customerId) {
        return endorsementRepository.findByCustomerCustomerIdOrderByCreatedAtDesc(customerId);
    }

    public List<Endorsement> getByPolicy(Long policyId) {
        return endorsementRepository.findByPolicyPolicyIdOrderByCreatedAtDesc(policyId);
    }

    public Endorsement getById(Long id) {
        return endorsementRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException("Endorsement not found with id: " + id));
    }

    public Endorsement create(EndorsementDto dto) {
        Policy policy = policyService.getPolicyById(dto.getPolicyId());
        if (!"ACTIVE".equalsIgnoreCase(policy.getPolicyStatus())) {
            throw new IllegalArgumentException("Endorsements can only be submitted for active policies");
        }

        Endorsement endorsement = new Endorsement();
        endorsement.setEndorsementNumber("END-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM"))
                + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());
        endorsement.setEndorsementType(dto.getEndorsementType());
        endorsement.setDescription(dto.getDescription());
        Double premiumAdjustment = dto.getPremiumAdjustment();
        endorsement.setPremiumAdjustment(premiumAdjustment == null ? Double.valueOf(0) : premiumAdjustment);
        endorsement.setEffectiveDate(dto.getEffectiveDate());
        endorsement.setStatus("PENDING");
        endorsement.setCreatedAt(LocalDate.now());
        endorsement.setOldValue(dto.getOldValue());
        endorsement.setNewValue(dto.getNewValue());
        endorsement.setPolicy(policy);
        endorsement.setCustomer(policy.getCustomer());

        Endorsement saved = endorsementRepository.save(endorsement);
        auditService.log("CREATE_ENDORSEMENT", "Endorsement", saved.getEndorsementId(),
                "Created endorsement " + saved.getEndorsementNumber());
        return saved;
    }

    public Endorsement approve(Long id, String approver) {
        Endorsement endorsement = getById(id);
        endorsement.setStatus("APPROVED");
        endorsement.setApprovedBy(approver == null || approver.isBlank() ? "Staff reviewer" : approver);
        Endorsement saved = endorsementRepository.save(endorsement);
        auditService.log("APPROVE_ENDORSEMENT", "Endorsement", saved.getEndorsementId(),
                "Approved endorsement " + saved.getEndorsementNumber());
        return saved;
    }
}
