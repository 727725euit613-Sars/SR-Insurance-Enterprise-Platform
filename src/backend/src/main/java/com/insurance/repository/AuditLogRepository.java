package com.insurance.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.insurance.entity.AuditLog;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findTop100ByOrderByTimestampDesc();
    List<AuditLog> findByUsernameOrderByTimestampDesc(String username);
    List<AuditLog> findByEntityTypeOrderByTimestampDesc(String entityType);
}
