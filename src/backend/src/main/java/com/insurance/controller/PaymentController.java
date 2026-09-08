package com.insurance.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.insurance.dto.DtoMapper;
import com.insurance.dto.PaymentDto;
import com.insurance.dto.PaymentResponse;
import com.insurance.service.PaymentService;
import com.insurance.service.CustomerAccessService;
import com.insurance.service.PolicyService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Payment management")
@SecurityRequirement(name = "bearerAuth")
public class PaymentController {

    private final PaymentService paymentService;
    private final CustomerAccessService customerAccessService;
    private final PolicyService policyService;

    @GetMapping
    @Operation(summary = "Get all payments")
    public ResponseEntity<List<PaymentResponse>> getAllPayments(Authentication authentication) {
        Long customerId = customerAccessService.currentCustomerId(authentication);
        var payments = customerId == null ? paymentService.getAllPayments() : paymentService.getPaymentsByCustomer(customerId);
        return ResponseEntity.ok(payments.stream()
                .map(DtoMapper::toPaymentResponse)
                .toList());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get payment by ID")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable Long id, Authentication authentication) {
        var payment = paymentService.getPaymentById(id);
        customerAccessService.assertCanAccess(authentication, payment.getCustomer() == null ? null : payment.getCustomer().getCustomerId());
        return ResponseEntity.ok(DtoMapper.toPaymentResponse(payment));
    }

    @GetMapping("/customer/{customerId}")
    @Operation(summary = "Get payments by customer ID")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByCustomer(@PathVariable Long customerId,
            Authentication authentication) {
        customerAccessService.assertCanAccess(authentication, customerId);
        return ResponseEntity.ok(paymentService.getPaymentsByCustomer(customerId).stream()
                .map(DtoMapper::toPaymentResponse)
                .toList());
    }

    @GetMapping("/status")
    @Operation(summary = "Get payments by status")
        public ResponseEntity<List<PaymentResponse>> getPaymentsByStatus(@RequestParam(required = false) String status,
            Authentication authentication) {
        Long customerId = customerAccessService.currentCustomerId(authentication);
        var payments = customerId == null ? paymentService.getPaymentsByStatus(status)
            : paymentService.getPaymentsByCustomer(customerId).stream()
                .filter(payment -> status == null || status.isBlank()
                    || payment.getPaymentStatus().toLowerCase().contains(status.toLowerCase()))
                .toList();
        return ResponseEntity.ok(payments.stream()
                .map(DtoMapper::toPaymentResponse)
                .toList());
    }

    @PostMapping
    @Operation(summary = "Create a payment")
    public ResponseEntity<PaymentResponse> createPayment(@Valid @RequestBody PaymentDto dto,
            Authentication authentication) {
        Long customerId = customerAccessService.currentCustomerId(authentication);
        if (customerId != null) {
            if (dto.getPolicyId() != null) {
                customerAccessService.assertCanAccess(authentication,
                        policyService.getPolicyById(dto.getPolicyId()).getCustomer() == null ? null
                                : policyService.getPolicyById(dto.getPolicyId()).getCustomer().getCustomerId());
            }
            dto.setCustomerId(customerId);
            dto.setPaymentStatus("Pending");
        }
        return new ResponseEntity<>(DtoMapper.toPaymentResponse(paymentService.createPayment(dto)), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','AGENT')")
    @Operation(summary = "Update payment")
    public ResponseEntity<PaymentResponse> updatePayment(@PathVariable Long id, @Valid @RequestBody PaymentDto dto) {
        return ResponseEntity.ok(DtoMapper.toPaymentResponse(paymentService.updatePayment(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete payment")
    public ResponseEntity<Void> deletePayment(@PathVariable Long id) {
        paymentService.deletePayment(id);
        return ResponseEntity.noContent().build();
    }
}
