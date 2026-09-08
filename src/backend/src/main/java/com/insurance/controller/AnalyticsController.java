package com.insurance.controller;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.insurance.repository.AgentRepository;
import com.insurance.repository.ClaimRepository;
import com.insurance.repository.CustomerRepository;
import com.insurance.repository.PaymentRepository;
import com.insurance.repository.PolicyRepository;
import com.insurance.repository.SurveyorRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Dashboard and reporting analytics")
@SecurityRequirement(name = "bearerAuth")
public class AnalyticsController {

    private final CustomerRepository customerRepository;
    private final PolicyRepository policyRepository;
    private final ClaimRepository claimRepository;
    private final PaymentRepository paymentRepository;
    private final AgentRepository agentRepository;
    private final SurveyorRepository surveyorRepository;

    @GetMapping("/dashboard")
    @Operation(summary = "Get main dashboard statistics")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        Map<String, Object> stats = new LinkedHashMap<>();

        long totalCustomers = customerRepository.count();
        long totalPolicies = policyRepository.count();
        long activePolicies = policyRepository.findByPolicyStatusContainingIgnoreCase("Active").size();
        long expiredPolicies = policyRepository.findByPolicyStatusContainingIgnoreCase("Expired").size();
        long totalClaims = claimRepository.count();
        long pendingClaims = claimRepository.findByStatusContainingIgnoreCase("Pending").size()
                + claimRepository.findByStatusContainingIgnoreCase("Under Review").size();
        long approvedClaims = claimRepository.findByStatusContainingIgnoreCase("Approved").size();
        long rejectedClaims = claimRepository.findByStatusContainingIgnoreCase("Rejected").size();
        long totalAgents = agentRepository.count();
        long totalSurveyors = surveyorRepository.count();

        double totalPremium = policyRepository.findAll().stream()
                .mapToDouble(p -> p.getPremiumAmount() != null ? p.getPremiumAmount() : 0).sum();
        double totalPayments = paymentRepository.findAll().stream()
                .filter(p -> "Success".equalsIgnoreCase(p.getPaymentStatus()) || "Paid".equalsIgnoreCase(p.getPaymentStatus()))
                .mapToDouble(p -> p.getAmount() != null ? p.getAmount() : 0).sum();
        double pendingPayments = paymentRepository.findByPaymentStatusContainingIgnoreCase("Pending").stream()
                .mapToDouble(p -> p.getAmount() != null ? p.getAmount() : 0).sum();

        stats.put("totalCustomers", totalCustomers);
        stats.put("totalPolicies", totalPolicies);
        stats.put("activePolicies", activePolicies);
        stats.put("expiredPolicies", expiredPolicies);
        stats.put("totalClaims", totalClaims);
        stats.put("pendingClaims", pendingClaims);
        stats.put("approvedClaims", approvedClaims);
        stats.put("rejectedClaims", rejectedClaims);
        stats.put("totalAgents", totalAgents);
        stats.put("totalSurveyors", totalSurveyors);
        stats.put("totalPremiumCollected", totalPremium);
        stats.put("totalPaymentsReceived", totalPayments);
        stats.put("pendingPaymentsAmount", pendingPayments);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/policies")
    @Operation(summary = "Get policy analytics")
    public ResponseEntity<Map<String, Object>> getPolicyAnalytics() {
        Map<String, Object> stats = new LinkedHashMap<>();

        Map<String, Long> byType = policyRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        p -> p.getPolicyType() != null ? p.getPolicyType() : "Unknown",
                        Collectors.counting()));

        Map<String, Long> byStatus = policyRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        p -> p.getPolicyStatus() != null ? p.getPolicyStatus() : "Unknown",
                        Collectors.counting()));

        double totalPremium = policyRepository.findAll().stream()
                .mapToDouble(p -> p.getPremiumAmount() != null ? p.getPremiumAmount() : 0).sum();

        long expiringThisMonth = policyRepository.findAll().stream()
                .filter(p -> p.getEndDate() != null
                        && p.getEndDate().isAfter(LocalDate.now())
                        && p.getEndDate().isBefore(LocalDate.now().plusDays(30)))
                .count();

        stats.put("byType", byType);
        stats.put("byStatus", byStatus);
        stats.put("totalPremium", totalPremium);
        stats.put("expiringThisMonth", expiringThisMonth);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/claims")
    @Operation(summary = "Get claims analytics")
    public ResponseEntity<Map<String, Object>> getClaimsAnalytics() {
        Map<String, Object> stats = new LinkedHashMap<>();

        Map<String, Long> byStatus = claimRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        c -> c.getStatus() != null ? c.getStatus() : "Unknown",
                        Collectors.counting()));

        double totalClaimAmount = claimRepository.findAll().stream()
                .mapToDouble(c -> c.getClaimAmount() != null ? c.getClaimAmount() : 0).sum();
        double totalApprovedAmount = claimRepository.findAll().stream()
                .filter(c -> "Approved".equalsIgnoreCase(c.getStatus()) || "Settled".equalsIgnoreCase(c.getStatus()))
                .mapToDouble(c -> c.getApprovedAmount() != null ? c.getApprovedAmount() : c.getClaimAmount())
                .sum();

        stats.put("byStatus", byStatus);
        stats.put("totalClaimAmount", totalClaimAmount);
        stats.put("totalApprovedAmount", totalApprovedAmount);
        stats.put("totalClaims", claimRepository.count());

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/payments")
    @Operation(summary = "Get payments analytics")
    public ResponseEntity<Map<String, Object>> getPaymentsAnalytics() {
        Map<String, Object> stats = new LinkedHashMap<>();

        List<Map<String, Object>> monthly = paymentRepository.findAll().stream()
                .filter(p -> p.getPaymentDate() != null
                        && p.getPaymentDate().getYear() == LocalDate.now().getYear())
                .collect(Collectors.groupingBy(
                        p -> p.getPaymentDate().getMonthValue(),
                        Collectors.summingDouble(p -> p.getAmount() != null ? p.getAmount() : 0)))
                .entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("month", e.getKey());
                    m.put("amount", e.getValue());
                    return m;
                })
                .collect(Collectors.toList());

        Map<String, Long> byMethod = paymentRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        p -> p.getPaymentMethod() != null ? p.getPaymentMethod() : "Unknown",
                        Collectors.counting()));

        double totalReceived = paymentRepository.findAll().stream()
                .filter(p -> "Success".equalsIgnoreCase(p.getPaymentStatus()) || "Paid".equalsIgnoreCase(p.getPaymentStatus()))
                .mapToDouble(p -> p.getAmount() != null ? p.getAmount() : 0).sum();

        stats.put("monthlyRevenue", monthly);
        stats.put("byMethod", byMethod);
        stats.put("totalReceived", totalReceived);
        stats.put("totalTransactions", paymentRepository.count());

        return ResponseEntity.ok(stats);
    }
}
