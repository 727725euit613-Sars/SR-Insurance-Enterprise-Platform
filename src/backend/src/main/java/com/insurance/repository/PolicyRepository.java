package com.insurance.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.insurance.entity.Policy;

public interface PolicyRepository extends JpaRepository<Policy, Long> {

    List<Policy> findByPolicyTypeContainingIgnoreCase(String policyType);

    List<Policy> findByPolicyStatusContainingIgnoreCase(String status);

    List<Policy> findByCustomerCustomerId(Long customerId);
}
