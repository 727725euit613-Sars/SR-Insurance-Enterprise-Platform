package com.insurance.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;

import com.insurance.dto.PolicyDto;
import com.insurance.entity.Agent;
import com.insurance.entity.Customer;
import com.insurance.entity.Policy;
import com.insurance.exception.ResourceNotFoundException;
import com.insurance.repository.AgentRepository;
import com.insurance.repository.CustomerRepository;
import com.insurance.repository.PolicyRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PolicyService {

    private final AuditService auditService;

    private final PolicyRepository policyRepository;
    private final CustomerRepository customerRepository;
    private final AgentRepository agentRepository;
    public List<Policy> getAllPolicies() {
        return policyRepository.findAll();
    }

    public Policy getPolicyById(Long id) {
        return policyRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found with id: " + id));
    }

    public Policy createPolicy(PolicyDto dto) {
        Policy policy = new Policy();
        mapDtoToPolicy(dto, policy);
        policy.setPolicyNumber(generatePolicyNumber(dto.getPolicyType()));
        Policy saved = policyRepository.save(policy);
        auditService.log("CREATE_POLICY", "Policy", saved.getPolicyId(), "Created policy: " + saved.getPolicyNumber());
        return saved;
    }

    public Policy updatePolicy(Long id, PolicyDto dto) {
        Policy existing = getPolicyById(id);
        mapDtoToPolicy(dto, existing);
        Policy saved = policyRepository.save(existing);
        auditService.log("UPDATE_POLICY", "Policy", saved.getPolicyId(), "Updated policy: " + saved.getPolicyNumber());
        return saved;
    }

    public void deletePolicy(Long id) {
        Policy policy = getPolicyById(id);
        auditService.log("DELETE_POLICY", "Policy", policy.getPolicyId(), "Deleted policy: " + policy.getPolicyNumber());
        policyRepository.delete(policy);
    }

    public List<Policy> searchPoliciesByType(String policyType) {
        if (policyType == null || policyType.isBlank()) return policyRepository.findAll();
        return policyRepository.findByPolicyTypeContainingIgnoreCase(policyType);
    }

    public List<Policy> searchPoliciesByStatus(String status) {
        if (status == null || status.isBlank()) return policyRepository.findAll();
        return policyRepository.findByPolicyStatusContainingIgnoreCase(status);
    }

    public List<Policy> getPoliciesByCustomer(Long customerId) {
        return policyRepository.findByCustomerCustomerId(customerId);
    }

    private void mapDtoToPolicy(PolicyDto dto, Policy policy) {
        policy.setPolicyName(dto.getPolicyName());
        policy.setPolicyType(dto.getPolicyType());
        policy.setPremiumAmount(dto.getPremiumAmount());
        policy.setDuration(dto.getDuration());
        policy.setPolicyStatus(dto.getPolicyStatus());
        policy.setStartDate(dto.getStartDate());
        policy.setEndDate(dto.getEndDate());
        policy.setCoverageAmount(dto.getCoverageAmount());

        if (dto.getCustomerId() != null) {
            Customer customer = customerRepository.findById(dto.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + dto.getCustomerId()));
            policy.setCustomer(customer);
        }
        if (dto.getAgentId() != null) {
            Agent agent = agentRepository.findById(dto.getAgentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Agent not found: " + dto.getAgentId()));
            policy.setAgent(agent);
        }
    }

    private String generatePolicyNumber(String type) {
        String year = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy"));
        long count = policyRepository.count() + 1;
        String prefix = (type != null && type.length() >= 3) ? type.substring(0, 3).toUpperCase() : "POL";
        return String.format("POL-%s-%s-%06d", prefix, year, count);
    }
}
