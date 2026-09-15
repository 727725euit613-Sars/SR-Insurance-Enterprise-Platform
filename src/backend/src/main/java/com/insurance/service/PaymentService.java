package com.insurance.service;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.insurance.dto.PaymentDto;
import com.insurance.entity.Customer;
import com.insurance.entity.Payment;
import com.insurance.entity.Policy;
import com.insurance.exception.ResourceNotFoundException;
import com.insurance.repository.CustomerRepository;
import com.insurance.repository.PaymentRepository;
import com.insurance.repository.PolicyRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final CustomerRepository customerRepository;
    private final PolicyRepository policyRepository;
    private final AuditService auditService;

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));
    }

    public Payment createPayment(PaymentDto dto) {
        Payment payment = new Payment();
        payment.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        mapDtoToPayment(dto, payment);
        Payment saved = paymentRepository.save(payment);
        auditService.log("PAYMENT_CREATED", "Payment", saved.getPaymentId(),
                "Payment created: " + saved.getTransactionId() + " amount=" + saved.getAmount());
        return saved;
    }

    public Payment updatePayment(Long id, PaymentDto dto) {
        Payment existing = getPaymentById(id);
        mapDtoToPayment(dto, existing);
        Payment saved = paymentRepository.save(existing);
        auditService.log("PAYMENT_UPDATED", "Payment", saved.getPaymentId(),
                "Payment updated: " + saved.getTransactionId() + " status=" + saved.getPaymentStatus());
        return saved;
    }

    public void deletePayment(Long id) {
        paymentRepository.delete(getPaymentById(id));
    }

    public List<Payment> getPaymentsByCustomer(Long customerId) {
        return paymentRepository.findByCustomerCustomerId(customerId);
    }

    public List<Payment> getPaymentsByStatus(String status) {
        if (status == null || status.isBlank()) return paymentRepository.findAll();
        return paymentRepository.findByPaymentStatusContainingIgnoreCase(status);
    }

    private void mapDtoToPayment(PaymentDto dto, Payment payment) {
        payment.setAmount(dto.getAmount());
        payment.setPaymentMethod(dto.getPaymentMethod());
        payment.setPaymentDate(dto.getPaymentDate());
        payment.setPaymentStatus(dto.getPaymentStatus());
        payment.setDescription(dto.getDescription());

        if (dto.getCustomerId() != null) {
            Customer customer = customerRepository.findById(dto.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + dto.getCustomerId()));
            payment.setCustomer(customer);
        }
        if (dto.getPolicyId() != null) {
            Policy policy = policyRepository.findById(dto.getPolicyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Policy not found: " + dto.getPolicyId()));
            payment.setPolicy(policy);
        }
    }
}
