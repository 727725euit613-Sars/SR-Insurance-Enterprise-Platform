package com.insurance.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.insurance.entity.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    List<Customer> findByNameContainingIgnoreCase(String name);

    Optional<Customer> findByEmail(String email);

    Optional<Customer> findByPhone(String phone);

    List<Customer> findAllByOrderByNameAsc();
}
