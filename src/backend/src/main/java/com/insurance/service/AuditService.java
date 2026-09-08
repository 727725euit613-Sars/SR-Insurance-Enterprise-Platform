package com.insurance.service;

import java.time.LocalDateTime;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.insurance.entity.AuditLog;
import com.insurance.repository.AuditLogRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public void log(String action, String entityType, String entityId, String description) {
        String username = "system";
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                username = auth.getName();
            }
        } catch (Exception ignored) {}

        AuditLog log = new AuditLog();
        log.setUsername(username);
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setDescription(description);
        log.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(log);
    }

    public void log(String action, String entityType, Long entityId, String description) {
        log(action, entityType, entityId != null ? entityId.toString() : null, description);
    }
}
