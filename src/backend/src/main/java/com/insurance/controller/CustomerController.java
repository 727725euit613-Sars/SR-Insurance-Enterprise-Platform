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

import com.insurance.dto.CustomerDto;
import com.insurance.dto.CustomerResponse;
import com.insurance.dto.DtoMapper;
import com.insurance.service.CustomerAccessService;
import com.insurance.service.CustomerService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@Tag(name = "Customers", description = "Customer management")
@SecurityRequirement(name = "bearerAuth")
public class CustomerController {

    private final CustomerService customerService;
    private final CustomerAccessService customerAccessService;

    @GetMapping
    @Operation(summary = "Get all customers")
    public ResponseEntity<List<CustomerResponse>> getAllCustomers(Authentication authentication) {
        Long customerId = customerAccessService.currentCustomerId(authentication);
        var customers = customerId == null ? customerService.getAllCustomers() : List.of(customerService.getCustomerById(customerId));
        return ResponseEntity.ok(customers.stream().map(DtoMapper::toCustomerResponse).toList());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get customer by ID")
    public ResponseEntity<CustomerResponse> getCustomerById(@PathVariable Long id, Authentication authentication) {
        customerAccessService.assertCanAccess(authentication, id);
        return ResponseEntity.ok(DtoMapper.toCustomerResponse(customerService.getCustomerById(id)));
    }

    @GetMapping("/search")
    @Operation(summary = "Search customers by name")
        public ResponseEntity<List<CustomerResponse>> searchCustomersByName(@RequestParam(required = false) String name,
            Authentication authentication) {
        Long customerId = customerAccessService.currentCustomerId(authentication);
        if (customerId != null) {
            var customer = customerService.getCustomerById(customerId);
            return ResponseEntity.ok(name == null || name.isBlank()
                || customer.getName().toLowerCase().contains(name.toLowerCase())
                    ? List.of(DtoMapper.toCustomerResponse(customer)) : List.of());
        }
        return ResponseEntity.ok(customerService.searchCustomersByName(name).stream().map(DtoMapper::toCustomerResponse).toList());
    }

    @GetMapping("/email")
    public ResponseEntity<CustomerResponse> getCustomerByEmail(@RequestParam String email, Authentication authentication) {
        Long customerId = customerAccessService.currentCustomerId(authentication);
        if (customerId != null && !customerService.getCustomerById(customerId).getEmail().equalsIgnoreCase(email)) {
            customerAccessService.assertCanAccess(authentication, null);
        }
        return ResponseEntity.ok(DtoMapper.toCustomerResponse(customerService.getCustomerByEmail(email)));
    }

    @GetMapping("/phone")
    public ResponseEntity<CustomerResponse> getCustomerByPhone(@RequestParam String phone, Authentication authentication) {
        Long customerId = customerAccessService.currentCustomerId(authentication);
        if (customerId != null && !customerService.getCustomerById(customerId).getPhone().equals(phone)) {
            customerAccessService.assertCanAccess(authentication, null);
        }
        return ResponseEntity.ok(DtoMapper.toCustomerResponse(customerService.getCustomerByPhone(phone)));
    }

    @GetMapping("/sorted")
    public ResponseEntity<List<CustomerResponse>> sortCustomersByName(Authentication authentication) {
        Long customerId = customerAccessService.currentCustomerId(authentication);
        var customers = customerId == null ? customerService.sortCustomersByName()
                : List.of(customerService.getCustomerById(customerId));
        return ResponseEntity.ok(customers.stream().map(DtoMapper::toCustomerResponse).toList());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','AGENT')")
    @Operation(summary = "Create a new customer")
    public ResponseEntity<CustomerResponse> createCustomer(@Valid @RequestBody CustomerDto dto) {
        return new ResponseEntity<>(DtoMapper.toCustomerResponse(customerService.createCustomer(dto)), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','AGENT')")
    @Operation(summary = "Update customer")
    public ResponseEntity<CustomerResponse> updateCustomer(@PathVariable Long id, @Valid @RequestBody CustomerDto dto) {
        return ResponseEntity.ok(DtoMapper.toCustomerResponse(customerService.updateCustomer(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete customer")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }
}
