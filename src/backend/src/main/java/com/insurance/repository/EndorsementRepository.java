package com.insurance.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.insurance.entity.Endorsement;

public interface EndorsementRepository extends JpaRepository<Endorsement, Long> {
    List<Endorsement> findAllByOrderByCreatedAtDesc();
    List<Endorsement> findByCustomerCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<Endorsement> findByPolicyPolicyIdOrderByCreatedAtDesc(Long policyId);
}
