package com.insurance.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.insurance.entity.Claim;

public interface ClaimRepository extends JpaRepository<Claim, Long> {

    List<Claim> findByStatusContainingIgnoreCase(String status);

    List<Claim> findByCustomerCustomerId(Long customerId);

    boolean existsByPolicyPolicyIdAndIncidentDateAndDescriptionIgnoreCase(Long policyId,
            java.time.LocalDate incidentDate, String description);
}
