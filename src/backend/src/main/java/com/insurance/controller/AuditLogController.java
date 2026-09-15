package com.insurance.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.insurance.entity.AuditLog;
import com.insurance.repository.AuditLogRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping({"/api/audit", "/api/audit-logs"})
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Audit Logs", description = "Audit log access (Admin only)")
@SecurityRequirement(name = "bearerAuth")
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping
    @Operation(summary = "Get recent audit logs")
    public ResponseEntity<List<AuditLog>> getRecentLogs() {
        return ResponseEntity.ok(auditLogRepository.findTop100ByOrderByTimestampDesc());
    }

    @GetMapping("/user")
    public ResponseEntity<List<AuditLog>> getLogsByUser(@RequestParam String username) {
        return ResponseEntity.ok(auditLogRepository.findByUsernameOrderByTimestampDesc(username));
    }

    @GetMapping("/entity")
    public ResponseEntity<List<AuditLog>> getLogsByEntity(@RequestParam String entityType) {
        return ResponseEntity.ok(auditLogRepository.findByEntityTypeOrderByTimestampDesc(entityType));
    }
}
