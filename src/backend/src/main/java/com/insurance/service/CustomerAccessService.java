package com.insurance.service;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.insurance.entity.Customer;
import com.insurance.repository.CustomerRepository;
import com.insurance.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomerAccessService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;

    public boolean isCustomer(Authentication authentication) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_CUSTOMER".equals(authority.getAuthority()));
    }

    public Long currentCustomerId(Authentication authentication) {
        if (!isCustomer(authentication)) {
            return null;
        }
        return userRepository.findByUsername(authentication.getName())
                .flatMap(user -> customerRepository.findByEmail(user.getEmail()))
                .map(Customer::getCustomerId)
                .orElseThrow(() -> new AccessDeniedException("Customer profile is not linked to this account"));
    }

    public void assertCanAccess(Authentication authentication, Long customerId) {
        if (isCustomer(authentication) && !currentCustomerId(authentication).equals(customerId)) {
            throw new AccessDeniedException("Customers may only access their own records");
        }
    }
}
