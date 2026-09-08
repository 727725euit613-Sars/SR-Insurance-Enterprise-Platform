package com.insurance.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.insurance.entity.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByCustomerCustomerId(Long customerId);

    List<Payment> findByPaymentStatusContainingIgnoreCase(String status);
}
