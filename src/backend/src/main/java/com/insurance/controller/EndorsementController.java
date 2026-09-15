package com.insurance.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.insurance.dto.DtoMapper;
import com.insurance.dto.EndorsementDto;
import com.insurance.dto.EndorsementResponse;
import com.insurance.service.CustomerAccessService;
import com.insurance.service.EndorsementService;
import com.insurance.service.PolicyService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/endorsements")
@RequiredArgsConstructor
@Tag(name = "Endorsements", description = "Policy endorsement management")
@SecurityRequirement(name = "bearerAuth")
public class EndorsementController {

    private final EndorsementService endorsementService;
    private final CustomerAccessService customerAccessService;
    private final PolicyService policyService;

    @GetMapping
    @Operation(summary = "Get endorsements")
    public ResponseEntity<List<EndorsementResponse>> getAll(Authentication authentication) {
        Long customerId = customerAccessService.currentCustomerId(authentication);
        var endorsements = customerId == null ? endorsementService.getAll() : endorsementService.getByCustomer(customerId);
        return ResponseEntity.ok(endorsements.stream().map(DtoMapper::toEndorsementResponse).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EndorsementResponse> getById(@PathVariable Long id, Authentication authentication) {
        var endorsement = endorsementService.getById(id);
        customerAccessService.assertCanAccess(authentication,
                endorsement.getCustomer() == null ? null : endorsement.getCustomer().getCustomerId());
        return ResponseEntity.ok(DtoMapper.toEndorsementResponse(endorsement));
    }

    @GetMapping("/policy/{policyId}")
    public ResponseEntity<List<EndorsementResponse>> getByPolicy(@PathVariable Long policyId,
            Authentication authentication) {
        var policy = policyService.getPolicyById(policyId);
        customerAccessService.assertCanAccess(authentication,
                policy.getCustomer() == null ? null : policy.getCustomer().getCustomerId());
        return ResponseEntity.ok(endorsementService.getByPolicy(policyId).stream()
                .map(DtoMapper::toEndorsementResponse).toList());
    }

    @PostMapping
    @Operation(summary = "Submit an endorsement")
    public ResponseEntity<EndorsementResponse> create(@Valid @RequestBody EndorsementDto dto,
            Authentication authentication) {
        var policy = policyService.getPolicyById(dto.getPolicyId());
        customerAccessService.assertCanAccess(authentication,
                policy.getCustomer() == null ? null : policy.getCustomer().getCustomerId());
        return new ResponseEntity<>(DtoMapper.toEndorsementResponse(endorsementService.create(dto)), HttpStatus.CREATED);
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','AGENT','UNDERWRITER','CLAIMS_HANDLER')")
    @Operation(summary = "Approve an endorsement")
    public ResponseEntity<EndorsementResponse> approve(@PathVariable Long id,
            @RequestParam(required = false) String approver, Authentication authentication) {
        String reviewer = approver == null || approver.isBlank() ? authentication.getName() : approver;
        return ResponseEntity.ok(DtoMapper.toEndorsementResponse(endorsementService.approve(id, reviewer)));
    }
}
