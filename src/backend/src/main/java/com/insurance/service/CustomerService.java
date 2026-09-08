package com.insurance.service;

import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;

import com.insurance.dto.CustomerDto;
import com.insurance.entity.Customer;
import com.insurance.exception.DuplicateResourceException;
import com.insurance.exception.ResourceNotFoundException;
import com.insurance.repository.CustomerRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final AuditService auditService;

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Customer getCustomerById(Long id) {
        return customerRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
    }

    public Customer createCustomer(CustomerDto dto) {
        if (customerRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new DuplicateResourceException("Customer already exists with email: " + dto.getEmail());
        }
        Customer customer = new Customer();
        customer.setName(dto.getName());
        customer.setEmail(dto.getEmail());
        customer.setPhone(dto.getPhone());
        customer.setAddress(dto.getAddress());
        Customer saved = customerRepository.save(customer);
        auditService.log("CREATE_CUSTOMER", "Customer", saved.getCustomerId(), "Created customer: " + saved.getName());
        return saved;
    }

    public Customer updateCustomer(Long id, CustomerDto dto) {
        Customer existing = getCustomerById(id);
        existing.setName(dto.getName());
        existing.setEmail(dto.getEmail());
        existing.setPhone(dto.getPhone());
        existing.setAddress(dto.getAddress());
        Customer saved = customerRepository.save(existing);
        auditService.log("UPDATE_CUSTOMER", "Customer", saved.getCustomerId(), "Updated customer: " + saved.getName());
        return saved;
    }

    public void deleteCustomer(Long id) {
        Customer existing = getCustomerById(id);
        customerRepository.delete(existing);
        auditService.log("DELETE_CUSTOMER", "Customer", id, "Deleted customer: " + existing.getName());
    }

    public List<Customer> searchCustomersByName(String name) {
        if (name == null || name.isBlank()) return customerRepository.findAll();
        return customerRepository.findByNameContainingIgnoreCase(name);
    }

    public Customer getCustomerByEmail(String email) {
        return customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with email: " + email));
    }

    public Customer getCustomerByPhone(String phone) {
        return customerRepository.findByPhone(phone)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with phone: " + phone));
    }

    public List<Customer> sortCustomersByName() {
        return customerRepository.findAllByOrderByNameAsc();
    }
}
