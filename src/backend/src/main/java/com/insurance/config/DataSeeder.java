package com.insurance.config;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.insurance.entity.Agent;
import com.insurance.entity.Claim;
import com.insurance.entity.Customer;
import com.insurance.entity.Payment;
import com.insurance.entity.Policy;
import com.insurance.entity.Surveyor;
import com.insurance.entity.User;
import com.insurance.repository.AgentRepository;
import com.insurance.repository.ClaimRepository;
import com.insurance.repository.CustomerRepository;
import com.insurance.repository.PaymentRepository;
import com.insurance.repository.PolicyRepository;
import com.insurance.repository.SurveyorRepository;
import com.insurance.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final AgentRepository agentRepository;
    private final SurveyorRepository surveyorRepository;
    private final PolicyRepository policyRepository;
    private final ClaimRepository claimRepository;
    private final PaymentRepository paymentRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.enabled:true}")
    private boolean seedEnabled;

    @Override
    public void run(String... args) {
        if (!seedEnabled || userRepository.findByUsername("admin").isPresent()) return;

        log.info("Seeding demo data...");

        // Users
        createUser("admin", "admin@srinsurance.com", "Admin@1234", "ADMIN");
        createUser("agent1", "agent1@srinsurance.com", "Agent@1234", "AGENT");
        createUser("surveyor1", "surveyor1@srinsurance.com", "Survey@1234", "SURVEYOR");
        createUser("claims1", "claims1@srinsurance.com", "Claims@1234", "CLAIMS_HANDLER");
        createUser("finance1", "finance1@srinsurance.com", "Finance@1234", "FINANCE_OFFICER");
        createUser("customer1", "arjun.mehta@email.com", "Customer@1234", "CUSTOMER");

        // Agents
        Agent agent = new Agent();
        agent.setName("Sneha Singh");
        agent.setEmail("sneha.singh@srinsurance.com");
        agent.setPhone("+919876543210");
        agent.setLicenseNumber("LIC-2024-001");
        agent.setSpecialization("Motor");
        agentRepository.save(agent);

        Agent agent2 = new Agent();
        agent2.setName("Priya Patel");
        agent2.setEmail("priya.patel@srinsurance.com");
        agent2.setPhone("+919876543211");
        agent2.setLicenseNumber("LIC-2024-002");
        agent2.setSpecialization("Health");
        agentRepository.save(agent2);

        // Surveyors
        Surveyor surveyor = new Surveyor();
        surveyor.setName("Vikram Nair");
        surveyor.setEmail("vikram.nair@srinsurance.com");
        surveyor.setPhone("+919876543220");
        surveyor.setSpecialization("Motor");
        surveyor.setDepartment("Claims");
        surveyorRepository.save(surveyor);

        // Customers
        Customer c1 = createCustomer("Arjun Mehta", "arjun.mehta@email.com", "+919876543210", "12 Koramangala, Bengaluru");
        Customer c2 = createCustomer("Divya Krishnan", "divya.k@email.com", "+919876543211", "45 Indiranagar, Bengaluru");
        Customer c3 = createCustomer("Rohit Verma", "rohit.v@email.com", "+919876543212", "78 Whitefield, Bengaluru");
        createCustomer("Meena Iyer", "meena.i@email.com", "+919876543213", "23 Jayanagar, Bengaluru");

        // Policies
        Policy p1 = createPolicy("POL-MOT-2024-000001", "Motor Insurance - Fortuner", "Motor",
                24500.0, 12, "Active", LocalDate.of(2024, 11, 15), LocalDate.of(2025, 11, 15),
                2000000.0, c1, agent);
        Policy p2 = createPolicy("POL-HEA-2024-000002", "Health Family Floater", "Health",
                32000.0, 12, "Active", LocalDate.of(2024, 8, 22), LocalDate.of(2025, 8, 22),
                1000000.0, c1, agent2);
        Policy p3 = createPolicy("POL-LIF-2023-000003", "Term Life 25 Years", "Life",
                18000.0, 300, "Active", LocalDate.of(2023, 1, 1), LocalDate.of(2048, 1, 1),
                10000000.0, c1, agent);
        Policy p4 = createPolicy("POL-PRO-2024-000004", "Home Shield Plus", "Property",
                12000.0, 12, "Expiring", LocalDate.of(2024, 1, 1), LocalDate.of(2024, 12, 31),
                5000000.0, c2, agent2);
        Policy p5 = createPolicy("POL-HEA-2024-000005", "Health Individual", "Health",
                15000.0, 12, "Active", LocalDate.of(2024, 6, 1), LocalDate.of(2025, 6, 1),
                500000.0, c3, agent);

        // Claims
        Claim cl1 = new Claim();
        cl1.setClaimNumber("CLM-2024-000001");
        cl1.setClaimAmount(125000.0);
        cl1.setStatus("Under Review");
        cl1.setDescription("Rear-end collision damage at MG Road");
        cl1.setIncidentDate(LocalDate.of(2024, 11, 15));
        cl1.setIncidentLocation("MG Road, Bengaluru");
        cl1.setCustomer(c1);
        cl1.setPolicy(p1);
        cl1.setSurveyor(surveyor);
        claimRepository.save(cl1);

        Claim cl2 = new Claim();
        cl2.setClaimNumber("CLM-2024-000002");
        cl2.setClaimAmount(45000.0);
        cl2.setApprovedAmount(45000.0);
        cl2.setStatus("Approved");
        cl2.setDescription("Hospitalization - Appendix surgery");
        cl2.setIncidentDate(LocalDate.of(2024, 10, 2));
        cl2.setCustomer(c1);
        cl2.setPolicy(p2);
        claimRepository.save(cl2);

        Claim cl3 = new Claim();
        cl3.setClaimNumber("CLM-2024-000003");
        cl3.setClaimAmount(280000.0);
        cl3.setApprovedAmount(280000.0);
        cl3.setStatus("Settled");
        cl3.setDescription("Water damage from heavy flooding");
        cl3.setIncidentDate(LocalDate.of(2024, 9, 18));
        cl3.setCustomer(c2);
        cl3.setPolicy(p4);
        claimRepository.save(cl3);

        Claim cl4 = new Claim();
        cl4.setClaimNumber("CLM-2024-000004");
        cl4.setClaimAmount(68000.0);
        cl4.setStatus("Rejected");
        cl4.setDescription("Theft claim - insufficient evidence");
        cl4.setIncidentDate(LocalDate.of(2024, 8, 7));
        cl4.setCustomer(c1);
        cl4.setPolicy(p1);
        claimRepository.save(cl4);

        // Payments
        createPayment("TXN-2024-001", 24500.0, "UPI", LocalDate.of(2024, 11, 1), "Success", "Motor Insurance Renewal", c1, p1);
        createPayment("TXN-2024-002", 32000.0, "Net Banking", LocalDate.of(2024, 8, 22), "Success", "Health Insurance Premium", c1, p2);
        createPayment("TXN-2024-003", 18000.0, "Credit Card", LocalDate.of(2024, 4, 1), "Success", "Life Insurance Annual", c1, p3);
        createPayment("TXN-2024-004", 12000.0, "UPI", LocalDate.of(2024, 1, 1), "Success", "Property Insurance", c2, p4);
        createPayment("TXN-2024-005", 15000.0, "UPI", LocalDate.of(2024, 6, 1), "Success", "Health Insurance Premium", c3, p5);
        createPayment("TXN-2024-006", 12000.0, "UPI", LocalDate.now().plusDays(5), "Pending", "Home Shield Renewal", c2, p4);

        log.info("Demo data seeded successfully.");
        log.info("Demo credentials: admin/Admin@1234 | agent1/Agent@1234 | surveyor1/Survey@1234 | claims1/Claims@1234 | finance1/Finance@1234 | customer1/Customer@1234");
    }

    private User createUser(String username, String email, String password, String role) {
        User u = new User();
        u.setUsername(username);
        u.setEmail(email);
        u.setPassword(passwordEncoder.encode(password));
        u.setRole(role);
        return userRepository.save(u);
    }

    private Customer createCustomer(String name, String email, String phone, String address) {
        Customer c = new Customer();
        c.setName(name);
        c.setEmail(email);
        c.setPhone(phone);
        c.setAddress(address);
        return customerRepository.save(c);
    }

    private Policy createPolicy(String number, String name, String type, Double premium,
            Integer duration, String status, LocalDate start, LocalDate end,
            Double coverage, Customer customer, Agent agent) {
        Policy p = new Policy();
        p.setPolicyNumber(number);
        p.setPolicyName(name);
        p.setPolicyType(type);
        p.setPremiumAmount(premium);
        p.setDuration(duration);
        p.setPolicyStatus(status);
        p.setStartDate(start);
        p.setEndDate(end);
        p.setCoverageAmount(coverage);
        p.setCustomer(customer);
        p.setAgent(agent);
        return policyRepository.save(p);
    }

    private void createPayment(String txnId, Double amount, String method, LocalDate date,
            String status, String desc, Customer customer, Policy policy) {
        Payment p = new Payment();
        p.setTransactionId(txnId);
        p.setAmount(amount);
        p.setPaymentMethod(method);
        p.setPaymentDate(date);
        p.setPaymentStatus(status);
        p.setDescription(desc);
        p.setCustomer(customer);
        p.setPolicy(policy);
        paymentRepository.save(p);
    }
}
