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
import com.insurance.dto.PolicyDto;
import com.insurance.dto.PolicyResponse;
import com.insurance.service.PolicyService;
import com.insurance.service.CustomerAccessService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/policies")
@RequiredArgsConstructor
@Tag(name = "Policies", description = "Insurance policy management")
@SecurityRequirement(name = "bearerAuth")
public class PolicyController {

    private final PolicyService policyService;
    private final CustomerAccessService customerAccessService;

    @GetMapping
    @Operation(summary = "Get all policies")
    public ResponseEntity<List<PolicyResponse>> getAllPolicies(Authentication authentication) {
        Long customerId = customerAccessService.currentCustomerId(authentication);
        var policies = customerId == null ? policyService.getAllPolicies() : policyService.getPoliciesByCustomer(customerId);
        return ResponseEntity.ok(policies.stream()
                .map(DtoMapper::toPolicyResponse)
                .toList());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get policy by ID")
    public ResponseEntity<PolicyResponse> getPolicyById(@PathVariable Long id, Authentication authentication) {
        var policy = policyService.getPolicyById(id);
        customerAccessService.assertCanAccess(authentication, policy.getCustomer() == null ? null : policy.getCustomer().getCustomerId());
        return ResponseEntity.ok(DtoMapper.toPolicyResponse(policy));
    }

    @GetMapping("/search/type")
        public ResponseEntity<List<PolicyResponse>> searchPoliciesByType(@RequestParam(required = false) String type,
            Authentication authentication) {
        Long customerId = customerAccessService.currentCustomerId(authentication);
        var policies = customerId == null ? policyService.searchPoliciesByType(type)
            : policyService.getPoliciesByCustomer(customerId).stream()
                .filter(policy -> type == null || type.isBlank()
                    || policy.getPolicyType().toLowerCase().contains(type.toLowerCase()))
                .toList();
        return ResponseEntity.ok(policies.stream()
                .map(DtoMapper::toPolicyResponse)
                .toList());
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<PolicyResponse>> getPoliciesByType(@PathVariable String type,
            Authentication authentication) {
        return searchPoliciesByType(type, authentication);
    }

    @GetMapping("/search/status")
        public ResponseEntity<List<PolicyResponse>> searchPoliciesByStatus(@RequestParam(required = false) String status,
            Authentication authentication) {
        Long customerId = customerAccessService.currentCustomerId(authentication);
        var policies = customerId == null ? policyService.searchPoliciesByStatus(status)
            : policyService.getPoliciesByCustomer(customerId).stream()
                .filter(policy -> status == null || status.isBlank()
                    || policy.getPolicyStatus().toLowerCase().contains(status.toLowerCase()))
                .toList();
        return ResponseEntity.ok(policies.stream()
                .map(DtoMapper::toPolicyResponse)
                .toList());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<PolicyResponse>> getPoliciesByStatus(@PathVariable String status,
            Authentication authentication) {
        return searchPoliciesByStatus(status, authentication);
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<PolicyResponse>> getPoliciesByCustomer(@PathVariable Long customerId,
            Authentication authentication) {
        customerAccessService.assertCanAccess(authentication, customerId);
        return ResponseEntity.ok(policyService.getPoliciesByCustomer(customerId).stream()
                .map(DtoMapper::toPolicyResponse)
                .toList());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','AGENT')")
    @Operation(summary = "Create a new policy")
    public ResponseEntity<PolicyResponse> createPolicy(@Valid @RequestBody PolicyDto dto) {
        return new ResponseEntity<>(DtoMapper.toPolicyResponse(policyService.createPolicy(dto)), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','AGENT')")
    @Operation(summary = "Update policy")
    public ResponseEntity<PolicyResponse> updatePolicy(@PathVariable Long id, @Valid @RequestBody PolicyDto dto) {
        return ResponseEntity.ok(DtoMapper.toPolicyResponse(policyService.updatePolicy(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete policy")
    public ResponseEntity<Void> deletePolicy(@PathVariable Long id) {
        policyService.deletePolicy(id);
        return ResponseEntity.noContent().build();
    }
}
