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

import com.insurance.dto.ClaimDto;
import com.insurance.dto.ClaimResponse;
import com.insurance.dto.DtoMapper;
import com.insurance.service.ClaimService;
import com.insurance.service.CustomerAccessService;
import com.insurance.service.PolicyService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/claims")
@RequiredArgsConstructor
@Tag(name = "Claims", description = "Insurance claims management")
@SecurityRequirement(name = "bearerAuth")
public class ClaimController {

    private final ClaimService claimService;
    private final CustomerAccessService customerAccessService;
    private final PolicyService policyService;

    @GetMapping
    @Operation(summary = "Get all claims")
    public ResponseEntity<List<ClaimResponse>> getAllClaims(Authentication authentication) {
        Long customerId = customerAccessService.currentCustomerId(authentication);
        var claims = customerId == null ? claimService.getAllClaims() : claimService.getClaimsByCustomer(customerId);
        return ResponseEntity.ok(claims.stream()
                .map(DtoMapper::toClaimResponse)
                .toList());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get claim by ID")
    public ResponseEntity<ClaimResponse> getClaimById(@PathVariable Long id, Authentication authentication) {
        var claim = claimService.getClaimById(id);
        customerAccessService.assertCanAccess(authentication, claim.getCustomer() == null ? null : claim.getCustomer().getCustomerId());
        return ResponseEntity.ok(DtoMapper.toClaimResponse(claim));
    }

    @GetMapping("/status")
        public ResponseEntity<List<ClaimResponse>> getClaimsByStatus(@RequestParam(required = false) String status,
            Authentication authentication) {
        Long customerId = customerAccessService.currentCustomerId(authentication);
        var claims = customerId == null ? claimService.getClaimsByStatus(status)
            : claimService.getClaimsByCustomer(customerId).stream()
                .filter(claim -> status == null || status.isBlank()
                    || claim.getStatus().toLowerCase().contains(status.toLowerCase()))
                .toList();
        return ResponseEntity.ok(claims.stream()
                .map(DtoMapper::toClaimResponse)
                .toList());
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<ClaimResponse>> getClaimsByCustomer(@PathVariable Long customerId,
            Authentication authentication) {
        customerAccessService.assertCanAccess(authentication, customerId);
        return ResponseEntity.ok(claimService.getClaimsByCustomer(customerId).stream()
                .map(DtoMapper::toClaimResponse)
                .toList());
    }

    @PostMapping
    @Operation(summary = "File a new claim")
    public ResponseEntity<ClaimResponse> createClaim(@Valid @RequestBody ClaimDto dto, Authentication authentication) {
        Long customerId = customerAccessService.currentCustomerId(authentication);
        if (customerId != null) {
            if (dto.getPolicyId() != null) {
                customerAccessService.assertCanAccess(authentication,
                        policyService.getPolicyById(dto.getPolicyId()).getCustomer() == null ? null
                                : policyService.getPolicyById(dto.getPolicyId()).getCustomer().getCustomerId());
            }
            dto.setCustomerId(customerId);
        }
        return new ResponseEntity<>(DtoMapper.toClaimResponse(claimService.createClaim(dto)), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','AGENT','SURVEYOR')")
    @Operation(summary = "Update claim")
    public ResponseEntity<ClaimResponse> updateClaim(@PathVariable Long id, @Valid @RequestBody ClaimDto dto) {
        return ResponseEntity.ok(DtoMapper.toClaimResponse(claimService.updateClaim(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete claim")
    public ResponseEntity<Void> deleteClaim(@PathVariable Long id) {
        claimService.deleteClaim(id);
        return ResponseEntity.noContent().build();
    }
}
